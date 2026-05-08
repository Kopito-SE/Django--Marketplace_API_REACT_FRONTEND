import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, DollarSign, PackagePlus, ShoppingBag, Store } from 'lucide-react';
import { getVendorOrders, getVendorStats, updateOrderStatus } from '../../api/cartApi';
import { dateLabel, money } from '../../utils/formatters';

const VendorDashboard = () => {
    const [orders, setOrders] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [updating, setUpdating] = useState(null);

    const fetchDashboardData = useCallback(async () => {
        setLoading(true);
        try {
            const [ordersData, statsData] = await Promise.all([
                getVendorOrders(),
                getVendorStats(),
            ]);
            
            // Handle paginated response
            const ordersList = ordersData.results || ordersData || [];
            setOrders(ordersList);
            setStats(statsData);
            
            console.log('Vendor orders loaded:', ordersList.length);
            console.log('Stats:', statsData);
        } catch (err) {
            setError('Failed to load dashboard data. Make sure the Django API is running.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const timeout = setTimeout(fetchDashboardData, 0);
        return () => clearTimeout(timeout);
    }, [fetchDashboardData]);

    const handleStatusUpdate = async (orderId, newStatus) => {
        setError('');
        setUpdating(orderId);
        try {
            await updateOrderStatus(orderId, newStatus);
            await fetchDashboardData(); // Refresh the data
        } catch (err) {
            setError('Failed to update order status.');
            console.error(err);
        } finally {
            setUpdating(null);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
                <div className="loading-spinner" />
                <p className="font-bold text-[#66736d]">Loading dashboard...</p>
            </div>
        );
    }

    // Calculate pending orders from the orders list
    const pendingOrders = orders.filter(order => 
        order.payment_status === 'pending' || 
        order.status === 'pending' || 
        order.order_status === 'pending'
    ).length;

    return (
        <div className="page-shell">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="eyebrow">Vendor</p>
                    <h1 className="section-title mt-1">Seller Dashboard</h1>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                    <Link to="/vendor/create-store" className="btn btn-ghost">
                        <Store size={18} />
                        Store Setup
                    </Link>
                    <Link to="/vendor/products/create" className="btn btn-primary">
                        <PackagePlus size={18} />
                        Add Product
                    </Link>
                </div>
            </div>

            {error && <div className="alert alert-error mb-5">{error}</div>}

            <div className="mb-6 grid gap-4 md:grid-cols-3">
                <StatCard 
                    icon={<DollarSign size={22} />} 
                    title="Total Revenue" 
                    value={money(stats?.total_revenue || stats?.total_sales || 0)} 
                />
                <StatCard 
                    icon={<ShoppingBag size={22} />} 
                    title="Total Orders" 
                    value={stats?.total_orders || orders.length || 0} 
                />
                <StatCard 
                    icon={<ClipboardList size={22} />} 
                    title="Pending Orders" 
                    value={pendingOrders} 
                />
            </div>

            <section className="surface-card overflow-hidden">
                <div className="border-b border-[#dfe7e2] p-5">
                    <p className="eyebrow">Fulfillment</p>
                    <h2 className="section-title mt-1 text-xl">Recent Orders</h2>
                </div>

                {orders.length === 0 ? (
                    <div className="grid place-items-center px-6 py-14 text-center">
                        <p className="font-bold text-[#66736d]">No vendor orders yet.</p>
                        <p className="mt-2 text-sm text-[#66736d]">
                            Once customers place orders for your products, they will appear here.
                        </p>
                    </div>
                ) : (
                    <div className="table-scroll">
                        <table className="min-w-full text-left text-sm">
                            <thead className="bg-[#f8faf7] text-xs font-black uppercase tracking-widest text-[#66736d]">
                                <tr>
                                    <th className="px-5 py-4">Order</th>
                                    <th className="px-5 py-4">Customer</th>
                                    <th className="px-5 py-4">Items</th>
                                    <th className="px-5 py-4">Amount</th>
                                    <th className="px-5 py-4">Payment</th>
                                    <th className="px-5 py-4">Status</th>
                                    <th className="px-5 py-4">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#dfe7e2] bg-white">
                                {orders.map((order) => {
                                    // Get the correct status (priority: order_status > status > payment_status)
                                    const orderStatus = order.order_status || order.status || 'pending';
                                    const paymentStatus = order.payment_status || 'pending';
                                    const isPaid = paymentStatus === 'paid';
                                    
                                    return (
                                        <tr key={order.id}>
                                            <td className="px-5 py-4 font-black text-[#17211d]">#{order.id}</td>
                                            <td className="px-5 py-4">
                                                <div>
                                                    <p className="font-semibold text-[#34433d]">
                                                        {order.customer_name || order.user?.username || 'Customer'}
                                                    </p>
                                                    {order.phone && (
                                                        <p className="text-xs text-[#66736d]">{order.phone}</p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="space-y-1">
                                                    {order.items?.map((item, idx) => (
                                                        <div key={idx} className="text-sm">
                                                            <span className="font-semibold">{item.product_name || item.product?.name}</span>
                                                            <span className="text-[#66736d]"> x{item.quantity}</span>
                                                        </div>
                                                    ))}
                                                    {(!order.items || order.items.length === 0) && (
                                                        <span className="text-[#66736d]">-</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 font-black text-[#0f766e]">
                                                {money(order.total_amount || order.total_price || 0)}
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className={`badge ${isPaid ? 'badge-success' : 'badge-warning'}`}>
                                                    {isPaid ? 'PAID' : (paymentStatus || 'PENDING').toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <select
                                                    value={orderStatus}
                                                    onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                                                    disabled={updating === order.id}
                                                    className="form-input !min-h-10 !w-40 !py-2"
                                                >
                                                    <option value="pending">Pending</option>
                                                    <option value="processing">Processing</option>
                                                    <option value="shipped">Shipped</option>
                                                    <option value="delivered">Delivered</option>
                                                    <option value="cancelled">Cancelled</option>
                                                </select>
                                                {updating === order.id && (
                                                    <span className="ml-2 text-xs text-[#66736d]">Updating...</span>
                                                )}
                                            </td>
                                            <td className="px-5 py-4 font-semibold text-[#66736d]">
                                                {dateLabel(order.created_at || order.created_date)}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </div>
    );
};

const StatCard = ({ icon, title, value }) => (
    <div className="surface-card p-5">
        <div className="flex items-start justify-between gap-4">
            <div>
                <p className="text-sm font-bold text-[#66736d]">{title}</p>
                <p className="mt-2 text-3xl font-black text-[#17211d]">{value}</p>
            </div>
            <span className="grid h-11 w-11 place-items-center rounded-lg bg-[#d9f3ee] text-[#115e59]">{icon}</span>
        </div>
    </div>
);

export default VendorDashboard;