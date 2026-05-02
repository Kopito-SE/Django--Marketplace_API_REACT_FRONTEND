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
    const [status, setStatus] = useState('pending');
    const [details, setDetails] = useState(null);
    const [error, setError] = useState('');
    const [checking, setChecking] = useState(Boolean(checkoutRequestID));

    const statusMeta = useMemo(() => {
        const normalized = String(status || '').toLowerCase();
        if (['success', 'completed', 'paid', '0'].includes(normalized)) {
            return {
                icon: <CheckCircle2 size={34} />,
                label: 'Payment Complete',
                tone: 'text-[#087443]',
                badge: 'badge-success',
                message: 'Your M-Pesa payment was confirmed.',
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
            setStatus(data.status || data.ResultCode || data.result_code || 'pending');
        } catch (err) {
            setError('Could not check payment status yet. The backend may still be processing it.');
            console.error(err);
        } finally {
            setChecking(false);
        }
    }, [checkoutRequestID]);

    useEffect(() => {
        const timeout = setTimeout(refreshStatus, 0);
        return () => clearTimeout(timeout);
    }, [refreshStatus]);

    useEffect(() => {
        if (!checkoutRequestID || ['success', 'completed', 'paid', 'failed', 'cancelled', 'timeout', 'error'].includes(String(status).toLowerCase())) {
            return undefined;
        }

        const interval = setInterval(refreshStatus, 5000);
        return () => clearInterval(interval);
    }, [checkoutRequestID, refreshStatus, status]);

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
                        <span className={`badge mt-2 ${statusMeta.badge}`}>{String(status || 'pending')}</span>
                    </div>
                </div>

                {error && <div className="alert alert-error mt-5 text-left">{error}</div>}
                {details?.ResultDesc && <div className="alert alert-success mt-5 text-left">{details.ResultDesc}</div>}

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                    <button type="button" onClick={refreshStatus} disabled={checking} className="btn btn-primary">
                        <RefreshCcw size={18} />
                        {checking ? 'Checking...' : 'Refresh Status'}
                    </button>
                    <Link to="/orders" className="btn btn-ghost">
                        View Orders
                    </Link>
                    <Link to="/" className="btn btn-ghost">
                        Marketplace
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default PaymentStatus;
