import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronUp, PackageCheck, ShoppingBag } from 'lucide-react';
import { getUserOrders } from '../../api/cartApi';
import { dateLabel, money } from '../../utils/formatters';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const data = await getUserOrders();
                // Handle both paginated and non-paginated responses
                const ordersList = data.results || data || [];
                setOrders(ordersList);
            } catch (err) {
                setError('Failed to load orders. Make sure the Django API is running.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    if (loading) {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
                <div className="loading-spinner" />
                <p className="font-bold text-[#66736d]">Loading orders...</p>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="page-shell page-narrow">
                {error && <div className="alert alert-error mb-5">{error}</div>}
                <div className="surface-card grid place-items-center px-6 py-16 text-center">
                    <div className="grid h-14 w-14 place-items-center rounded-lg bg-[#d9f3ee] text-[#115e59]">
                        <ShoppingBag size={28} />
                    </div>
                    <h1 className="mt-5 text-3xl font-black text-[#17211d]">No orders yet</h1>
                    <p className="mt-2 max-w-md text-[#66736d]">Your completed purchases and delivery updates will appear here.</p>
                    <Link to="/" className="btn btn-primary mt-6">
                        Start Shopping
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="page-shell">
            <div className="mb-6">
                <p className="eyebrow">Orders</p>
                <h1 className="section-title mt-1">My Orders</h1>
            </div>

            {error && <div className="alert alert-error mb-5">{error}</div>}

            <div className="space-y-4">
                {orders.map((order) => (
                    <OrderCard key={order.id} order={order} />
                ))}
            </div>
        </div>
    );
};

const OrderCard = ({ order }) => {
    const [expanded, setExpanded] = useState(false);
    
    // Use payment_status or status field
    const paymentStatus = String(order.payment_status || order.status || 'pending').toLowerCase();
    const orderStatus = String(order.status || 'pending').toLowerCase();

    const getStatusClass = () => {
        const colors = {
            pending: 'badge-warning',
            processing: 'badge-info',
            shipped: 'badge-info',
            delivered: 'badge-success',
            cancelled: 'badge-danger',
            paid: 'badge-success',
            failed: 'badge-danger',
        };
        return colors[paymentStatus] || colors[orderStatus] || 'badge-info';
    };

    const getStatusLabel = () => {
        if (paymentStatus === 'paid') return 'PAID';
        if (paymentStatus === 'failed') return 'PAYMENT FAILED';
        if (orderStatus === 'processing') return 'PROCESSING';
        if (orderStatus === 'shipped') return 'SHIPPED';
        if (orderStatus === 'delivered') return 'DELIVERED';
        if (orderStatus === 'cancelled') return 'CANCELLED';
        return 'PENDING';
    };

    // Calculate total from order items if total_amount isn't directly available
    const totalAmount = order.total_amount || order.total_price || 
        order.items?.reduce((sum, item) => sum + (Number(item.price || 0) * Number(item.quantity || 0)), 0) || 0;

    return (
        <article className="surface-card overflow-hidden">
            <div className="grid gap-5 p-5 md:grid-cols-[1fr_auto] md:items-start">
                <div className="flex gap-4">
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-[#d9f3ee] text-[#115e59]">
                        <PackageCheck size={24} />
                    </span>
                    <div>
                        <p className="text-sm font-bold text-[#66736d]">Order #{order.id}</p>
                        <h2 className="mt-1 text-xl font-black text-[#17211d]">{money(totalAmount)}</h2>
                        <p className="mt-1 text-sm font-semibold text-[#66736d]">
                            Placed on {dateLabel(order.created_at || order.created_date)}
                        </p>
                        {order.transaction_id && (
                            <p className="mt-1 text-xs font-semibold text-[#66736d]">
                            Transaction: {order.transaction_id}
                            </p>
                        )}
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-3 md:justify-end">
                    <span className={`badge ${getStatusClass()}`}>{getStatusLabel()}</span>
                    <button 
                        type="button" 
                        onClick={() => setExpanded((value) => !value)} 
                        className="btn btn-ghost !min-h-10 text-sm"
                    >
                        {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        {expanded ? 'Hide Details' : 'Show Details'}
                    </button>
                </div>
            </div>

            {expanded && (
                <div className="border-t border-[#dfe7e2] bg-[#f8faf7] p-5">
                    <h3 className="font-black text-[#17211d]">Order Items</h3>
                    <div className="mt-3 space-y-3">
                        {order.items?.map((item) => (
                            <div key={item.id} className="flex items-center justify-between gap-4 rounded-lg bg-white p-3">
                                <div>
                                    <p className="font-bold text-[#17211d]">{item.product_name || item.product?.name}</p>
                                    <p className="text-sm font-semibold text-[#66736d]">
                                        Quantity: {item.quantity}
                                    </p>
                                    <p className="text-xs text-[#66736d]">
                                        @ {money(item.price || item.unit_price)}
                                    </p>
                                </div>
                                <span className="font-black text-[#0f766e]">
                                    {money((item.price || item.unit_price || 0) * (item.quantity || 0))}
                                </span>
                            </div>
                        ))}
                    </div>

                    {order.tracking_number && (
                        <div className="mt-4 rounded-lg border border-[#dfe7e2] bg-white p-4 text-sm">
                            <span className="font-black text-[#17211d]">Tracking Number: </span>
                            <span className="font-semibold text-[#66736d]">{order.tracking_number}</span>
                        </div>
                    )}

                    {order.shipping_address && (
                        <div className="mt-4 rounded-lg border border-[#dfe7e2] bg-white p-4 text-sm">
                            <span className="font-black text-[#17211d]">Shipping Address: </span>
                            <span className="font-semibold text-[#66736d]">{order.shipping_address}</span>
                        </div>
                    )}

                    {order.payment_status === 'failed' && order.failure_reason && (
                        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm">
                            <span className="font-black text-[#b42318]">Payment Failed: </span>
                            <span className="font-semibold text-[#b42318]">{order.failure_reason}</span>
                        </div>
                    )}
                </div>
            )}
        </article>
    );
};

export default Orders;