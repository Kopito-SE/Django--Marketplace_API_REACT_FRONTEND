import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle2, Clock3, RefreshCcw, XCircle } from 'lucide-react';
import { checkPaymentStatus } from '../../api/paymentApi';
import { money } from '../../utils/formatters';

const PaymentStatus = () => {
    const location = useLocation();
    
    const checkoutRequestID = useMemo(
        () => location.state?.checkoutRequestID || localStorage.getItem('checkoutRequestID'),
        [location.state?.checkoutRequestID],
    );
    
    const amount = location.state?.amount;
    const orderId = useMemo(
        () => location.state?.orderId || localStorage.getItem('currentOrderId'),
        [location.state?.orderId],
    );
    
    const [status, setStatus] = useState('pending');
    const [details, setDetails] = useState(null);
    const [error, setError] = useState('');
    const [checking, setChecking] = useState(Boolean(checkoutRequestID));
    const [checkCount, setCheckCount] = useState(0);

    const statusMeta = useMemo(() => {
        const normalized = String(status || '').toLowerCase();
        if (['success', 'completed', 'paid', '0'].includes(normalized)) {
            return {
                icon: <CheckCircle2 size={34} />,
                label: 'Payment Complete',
                tone: 'text-[#087443]',
                badge: 'badge-success',
                message: 'Your M-Pesa payment was confirmed. Your order is now being processed.',
            };
        }
        if (['failed', 'cancelled', 'timeout', 'error'].includes(normalized)) {
            return {
                icon: <XCircle size={34} />,
                label: 'Payment Failed',
                tone: 'text-[#b42318]',
                badge: 'badge-danger',
                message: 'The payment could not be completed. You can try checking out again.',
            };
        }
        return {
            icon: <Clock3 size={34} />,
            label: 'Awaiting Confirmation',
            tone: 'text-[#b7791f]',
            badge: 'badge-warning',
            message: 'Approve the prompt on your phone. This page will keep checking for confirmation.',
        };
    }, [status]);

    const refreshStatus = useCallback(async () => {
        if (!checkoutRequestID) {
            setError('No checkout request ID was found for this payment.');
            setChecking(false);
            return;
        }

        setChecking(true);
        setError('');
        try {
            const data = await checkPaymentStatus(checkoutRequestID);
            setDetails(data);
            
            // Determine status from response
            let newStatus = 'pending';
            if (data.status === 'completed' || data.ResultCode === '0' || data.payment_status === 'paid') {
                newStatus = 'completed';
            } else if (data.status === 'failed' || data.ResultCode === '1037' || data.payment_status === 'failed') {
                newStatus = 'failed';
            } else if (data.ResultCode === '1037') {
                newStatus = 'pending';
            }
            
            setStatus(newStatus);
            setCheckCount(prev => prev + 1);
            
            // Clear localStorage when payment is complete or failed
            if (newStatus === 'completed' || newStatus === 'failed') {
                localStorage.removeItem('checkoutRequestID');
                localStorage.removeItem('currentOrderId');
            }
            
        } catch (err) {
            console.error('Status check error:', err);
            // Don't show error immediately, let it retry
            if (checkCount > 5) {
                setError('Could not check payment status. Please refresh manually or check your orders page.');
            }
        } finally {
            setChecking(false);
        }
    }, [checkoutRequestID, checkCount]);

    // Initial check
    useEffect(() => {
        const timeout = setTimeout(refreshStatus, 0);
        return () => clearTimeout(timeout);
    }, [refreshStatus]);

    // Poll every 5 seconds while pending
    useEffect(() => {
        if (!checkoutRequestID || status !== 'pending') {
            return undefined;
        }

        const interval = setInterval(refreshStatus, 5000);
        return () => clearInterval(interval);
    }, [checkoutRequestID, refreshStatus, status]);

    // Stop polling after 2 minutes (24 checks)
    useEffect(() => {
        if (checkCount > 24 && status === 'pending') {
            setError('Payment is taking longer than expected. Please check your orders page later or contact support.');
        }
    }, [checkCount, status]);

    return (
        <div className="page-shell page-narrow">
            <div className="surface-card p-6 text-center sm:p-8">
                <div className={`mx-auto grid h-16 w-16 place-items-center rounded-lg bg-[#f8faf7] ${statusMeta.tone}`}>
                    {statusMeta.icon}
                </div>
                <p className="eyebrow mt-5">Payment Status</p>
                <h1 className="section-title mt-1">{statusMeta.label}</h1>
                <p className="mx-auto mt-3 max-w-lg leading-7 text-[#66736d]">{statusMeta.message}</p>

                <div className="mx-auto mt-6 grid max-w-lg gap-3 text-left">
                    {orderId && (
                        <div className="rounded-lg border border-[#dfe7e2] bg-[#f8faf7] p-4">
                            <p className="text-xs font-bold uppercase tracking-widest text-[#66736d]">Order ID</p>
                            <Link to={`/orders/${orderId}`} className="mt-1 block font-black text-[#115e59] hover:underline">
                                #{orderId}
                            </Link>
                        </div>
                    )}
                    
                    <div className="rounded-lg border border-[#dfe7e2] bg-[#f8faf7] p-4">
                        <p className="text-xs font-bold uppercase tracking-widest text-[#66736d]">Checkout Request</p>
                        <p className="mt-1 break-all font-black text-[#17211d]">{checkoutRequestID || 'Not available'}</p>
                    </div>
                    
                    {amount && (
                        <div className="rounded-lg border border-[#dfe7e2] bg-[#f8faf7] p-4">
                            <p className="text-xs font-bold uppercase tracking-widest text-[#66736d]">Amount</p>
                            <p className="mt-1 font-black text-[#0f766e]">{money(amount)}</p>
                        </div>
                    )}
                    
                    <div className="rounded-lg border border-[#dfe7e2] bg-[#f8faf7] p-4">
                        <p className="text-xs font-bold uppercase tracking-widest text-[#66736d]">Current Status</p>
                        <span className={`badge mt-2 ${statusMeta.badge}`}>
                            {status === 'completed' ? 'PAID' : status === 'failed' ? 'FAILED' : 'PENDING'}
                        </span>
                    </div>

                    {details?.MpesaReceiptNumber && (
                        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                            <p className="text-xs font-bold uppercase tracking-widest text-[#087443]">M-Pesa Receipt</p>
                            <p className="mt-1 font-black text-[#087443]">{details.MpesaReceiptNumber}</p>
                        </div>
                    )}
                </div>

                {error && (
                    <div className="alert alert-error mt-5 text-left">
                        <p className="font-bold">Note:</p>
                        <p>{error}</p>
                    </div>
                )}
                
                {details?.ResultDesc && status === 'pending' && (
                    <div className="alert alert-info mt-5 text-left">
                        {details.ResultDesc}
                    </div>
                )}

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                    {status === 'pending' && (
                        <button 
                            type="button" 
                            onClick={refreshStatus} 
                            disabled={checking} 
                            className="btn btn-primary"
                        >
                            <RefreshCcw size={18} />
                            {checking ? 'Checking...' : 'Refresh Status'}
                        </button>
                    )}
                    
                    {(status === 'completed' || status === 'failed') && (
                        <Link to="/orders" className="btn btn-primary">
                            View My Orders
                        </Link>
                    )}
                    
                    <Link to="/" className="btn btn-ghost">
                        Continue Shopping
                    </Link>
                </div>
                
                {status === 'pending' && (
                    <p className="mt-4 text-xs text-[#66736d]">
                        Waiting for payment confirmation. You can also check your orders page later.
                    </p>
                )}
            </div>
        </div>
    );
};

export default PaymentStatus;