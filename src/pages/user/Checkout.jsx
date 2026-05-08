import { useEffect, useMemo, useState } from 'react';
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

    useEffect(() => {
        const fetchCart = async () => {
            try {
                const data = await getCart();
                if (!data || data.items?.length === 0) {
                    navigate('/cart');
                    return;
                }
                setCart(data);
            } catch (err) {
                setError('Failed to load cart. Make sure the Django API is running.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchCart();
    }, [navigate]);

    // Fix: Use line_total from API instead of recalculating
    const total = useMemo(
        () => cart?.items?.reduce((sum, item) => sum + (item.line_total || 0), 0) || 0,
        [cart],
    );

    const handleMpesaPayment = async (e) => {
        e.preventDefault();
        setProcessing(true);
        setError('');

        try {
            const response = await initiatePayment({
                phone: phoneNumber,
                amount: total,
                order_id: Number(cart.id),
            });

            const checkoutRequestID = response.CheckoutRequestID || response.checkout_request_id;
            if (checkoutRequestID) {
                localStorage.setItem('checkoutRequestID', checkoutRequestID);
                navigate('/payment-status', {
                    state: {
                        checkoutRequestID,
                        amount: total,
                    },
                });
            } else {
                setError('Payment request was sent, but no checkout request ID was returned.');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Payment initiation failed. Please try again.');
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
                <div className="loading-spinner" />
                <p className="font-bold text-[#66736d]">Loading checkout...</p>
            </div>
        );
    }

    if (!cart) {
        return (
            <div className="page-shell page-narrow">
                <div className="alert alert-error">{error || 'Checkout is not available right now.'}</div>
                <Link to="/cart" className="btn btn-ghost mt-5">Back to Cart</Link>
            </div>
        );
    }

    return (
        <div className="page-shell">
            <div className="mb-6">
                <p className="eyebrow">Checkout</p>
                <h1 className="section-title mt-1">Confirm and Pay</h1>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
                <section className="surface-card p-6">
                    <div className="mb-5 flex items-start justify-between gap-4">
                        <div>
                            <p className="eyebrow">Order Summary</p>
                            <h2 className="section-title mt-1 text-xl">Items in your order</h2>
                        </div>
                        <span className="badge badge-info">{cart.items.length} items</span>
                    </div>

                    <div className="divide-y divide-[#dfe7e2]">
                        {cart.items.map((item) => (
                            <div key={item.id} className="flex items-start justify-between gap-4 py-4 first:pt-0">
                                <div>
                                    {/* Fix: Use product_name directly from item, not item.product.name */}
                                    <p className="font-black text-[#17211d]">{item.product_name}</p>
                                    <p className="mt-1 text-sm font-semibold text-[#66736d]">Quantity {item.quantity}</p>
                                </div>
                                {/* Fix: Use line_total from API */}
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

                <section className="surface-card p-6">
                    <div className="flex items-start gap-3">
                        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-[#d9f3ee] text-[#115e59]">
                            <CreditCard size={24} />
                        </span>
                        <div>
                            <p className="eyebrow">M-Pesa</p>
                            <h2 className="section-title mt-1 text-xl">Mobile payment</h2>
                        </div>
                    </div>

                    {error && <div className="alert alert-error mt-5">{error}</div>}

                    <form onSubmit={handleMpesaPayment} className="mt-6 space-y-5">
                        <div>
                            <label className="field-label">M-Pesa Phone Number</label>
                            <div className="relative">
                                <Phone className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#66736d]" size={18} />
                                <input
                                    type="tel"
                                    required
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    placeholder="254700000000"
                                    className="form-input pl-10"
                                />
                            </div>
                            <p className="mt-2 text-xs font-semibold leading-5 text-[#66736d]">
                                Use the Safaricom number that should receive the STK push.
                            </p>
                        </div>

                        <div className="rounded-lg border border-[#dfe7e2] bg-[#f8faf7] p-4">
                            <div className="flex items-center gap-2 text-sm font-bold text-[#087443]">
                                <ShieldCheck size={18} />
                                Secure checkout request
                            </div>
                            <p className="mt-2 text-sm leading-6 text-[#66736d]">After you submit, approve the prompt on your phone to complete payment.</p>
                        </div>

                        <button type="submit" disabled={processing} className="btn btn-primary w-full">
                            <CreditCard size={18} />
                            {processing ? 'Sending STK Push...' : `Pay ${money(total)}`}
                        </button>
                    </form>
                </section>
            </div>
        </div>
    );
};

export default Checkout;