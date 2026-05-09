import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CreditCard, Phone, ShieldCheck } from 'lucide-react';
import { getCart } from '../../api/cartApi';
import { initiatePayment } from '../../api/paymentApi';
import { money } from '../../utils/formatters';

const Checkout = () => {
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [error, setError] = useState('');

    const navigate = useNavigate();
    const isMountedRef = useRef(true);

    // Cleanup on unmount
    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
            // Clear payment tracking info on unmount
            localStorage.removeItem('checkoutRequestID');
            localStorage.removeItem('paymentReference');
        };
    }, []);

    // Validate and format Kenyan phone number
    const validateAndFormatPhoneNumber = (phone) => {
        const cleaned = phone.replace(/\D/g, '');
        
        if (cleaned.length === 9 && cleaned.startsWith('7')) {
            return '254' + cleaned;
        }
        if (cleaned.length === 10 && cleaned.startsWith('07')) {
            return '254' + cleaned.substring(1);
        }
        if (cleaned.length === 12 && cleaned.startsWith('254')) {
            return cleaned;
        }
        return null;
    };

    // Fetch cart only once
    useEffect(() => {
        const fetchCartData = async () => {
            try {
                const cartData = await getCart();

                if (!isMountedRef.current) return;

                if (!cartData || cartData.items?.length === 0) {
                    // Use replace to prevent back button issues
                    navigate('/cart', { replace: true });
                    return;
                }

                setCart(cartData);
            } catch (err) {
                console.error(err);
                if (isMountedRef.current) {
                    setError('Failed to load cart. Please try again.');
                }
            } finally {
                if (isMountedRef.current) {
                    setLoading(false);
                }
            }
        };

        fetchCartData();
    }, [navigate]);

    // Calculate total - fixed dependency
    const total = useMemo(
        () => cart?.items?.reduce(
            (sum, item) => sum + (item.line_total || 0),
            0
        ) || 0,
        [cart?.items] // Better dependency
    );

    // Initiate payment
    const handleMpesaPayment = async (e) => {
        e.preventDefault();

        if (!cart || cart.items?.length === 0) {
            setError('Your cart is empty.');
            return;
        }

        // Validate cart has ID
        if (!cart.id) {
            setError('Invalid cart session. Please try again.');
            return;
        }

        // Validate phone number
        const formattedPhone = validateAndFormatPhoneNumber(phoneNumber);
        if (!formattedPhone) {
            setError('Please enter a valid M-Pesa phone number (e.g., 254700000000 or 0712345678)');
            return;
        }

        setProcessing(true);
        setError('');

        try {
            // Clear any old payment tracking info
            localStorage.removeItem('checkoutRequestID');
            localStorage.removeItem('paymentReference');

            // Generate temporary payment reference (consider server-side generation for production)
            const paymentReference = crypto.randomUUID();

            const response = await initiatePayment({
                phone: formattedPhone,
                amount: total,
                reference: paymentReference,
                cart_id: cart.id,
            });

            console.log('Payment response:', response);

            const checkoutRequestID = response.CheckoutRequestID;

            if (checkoutRequestID) {
                // Save temporary payment tracking info
                localStorage.setItem(
                    'checkoutRequestID',
                    checkoutRequestID
                );

                localStorage.setItem(
                    'paymentReference',
                    paymentReference
                );

                // Navigate to payment status page
                navigate('/payment-status', {
                    state: {
                        checkoutRequestID,
                        amount: total,
                        paymentReference,
                    },
                });
            } else {
                setError(
                    'Payment request sent but no checkout ID returned. Please check your phone for the STK push.'
                );
            }
        } catch (err) {
            console.error('Payment initiation error:', err);

            let errorMessage = 'Failed to initiate payment. Please try again.';
            
            if (err.response?.data?.error) {
                errorMessage = err.response.data.error;
            } else if (err.message) {
                errorMessage = err.message;
            }

            setError(errorMessage);
        } finally {
            if (isMountedRef.current) {
                setProcessing(false);
            }
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
                <div className="loading-spinner" />
                <p className="font-bold text-[#66736d]">
                    Loading checkout...
                </p>
            </div>
        );
    }

    if (!cart || cart.items?.length === 0) {
        return (
            <div className="page-shell page-narrow">
                <div className="alert alert-error">
                    {error || 'Your cart is empty.'}
                </div>

                <Link to="/cart" className="btn btn-ghost mt-5">
                    Back to Cart
                </Link>
            </div>
        );
    }

    return (
        <div className="page-shell">
            <div className="mb-6">
                <p className="eyebrow">Checkout</p>
                <h1 className="section-title mt-1">
                    Confirm and Pay
                </h1>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
                {/* ORDER SUMMARY */}
                <section className="surface-card p-6">
                    <div className="mb-5 flex items-start justify-between gap-4">
                        <div>
                            <p className="eyebrow">Order Summary</p>

                            <h2 className="section-title mt-1 text-xl">
                                Items in your cart
                            </h2>
                        </div>

                        <span className="badge badge-info">
                            Checkout Summary
                        </span>
                    </div>

                    <div className="divide-y divide-[#dfe7e2]">
                        {cart.items.map((item) => (
                            <div
                                key={item.id}
                                className="flex items-start justify-between gap-4 py-4 first:pt-0"
                            >
                                <div>
                                    <p className="font-black text-[#17211d]">
                                        {item.product_name}
                                    </p>

                                    <p className="mt-1 text-sm font-semibold text-[#66736d]">
                                        Quantity {item.quantity}
                                    </p>
                                </div>

                                <p className="shrink-0 font-black text-[#0f766e]">
                                    {money(item.line_total || 0)}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-5 rounded-lg bg-[#f8faf7] p-4">
                        <div className="flex justify-between gap-4 text-lg font-black text-[#17211d]">
                            <span>Total</span>

                            <span>{money(total)}</span>
                        </div>
                    </div>
                </section>

                {/* PAYMENT */}
                <section className="surface-card p-6">
                    <div className="flex items-start gap-3">
                        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-[#d9f3ee] text-[#115e59]">
                            <CreditCard size={24} />
                        </span>

                        <div>
                            <p className="eyebrow">M-Pesa</p>

                            <h2 className="section-title mt-1 text-xl">
                                Mobile payment
                            </h2>
                        </div>
                    </div>

                    {error && (
                        <div className="alert alert-error mt-5">
                            {error}
                        </div>
                    )}

                    <form
                        onSubmit={handleMpesaPayment}
                        className="mt-6 space-y-5"
                    >
                        <div>
                            <label className="field-label">
                                M-Pesa Phone Number
                            </label>

                            <div className="relative">
                                <Phone
                                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#66736d]"
                                    size={18}
                                />

                                <input
                                    type="tel"
                                    required
                                    value={phoneNumber}
                                    onChange={(e) =>
                                        setPhoneNumber(e.target.value)
                                    }
                                    placeholder="254700000000"
                                    className="form-input pl-10"
                                    pattern="(\+?254|0)?[17]\d{8}"
                                    title="Please enter a valid Kenyan phone number (e.g., 254700000000 or 0712345678)"
                                />
                            </div>

                            <p className="mt-2 text-xs font-semibold leading-5 text-[#66736d]">
                                Enter your Safaricom number (e.g., 254700000000 or 0712345678)
                            </p>
                        </div>

                        <div className="rounded-lg border border-[#dfe7e2] bg-[#f8faf7] p-4">
                            <div className="flex items-center gap-2 text-sm font-bold text-[#087443]">
                                <ShieldCheck size={18} />
                                Secure checkout request
                            </div>

                            <p className="mt-2 text-sm leading-6 text-[#66736d]">
                                After you submit, approve the prompt on your phone to complete payment.
                                The request will time out after 60 seconds if not approved.
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={processing || !phoneNumber.trim()}
                            className="btn btn-primary w-full"
                        >
                            <CreditCard size={18} />

                            {processing
                                ? 'Sending STK Push...'
                                : `Pay ${money(total)}`}
                        </button>
                    </form>
                </section>
            </div>
        </div>
    );
};

export default Checkout;