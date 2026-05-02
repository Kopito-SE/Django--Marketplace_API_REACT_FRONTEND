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

    const fetchDashboardData = useCallback(async () => {
        setLoading(true);
        try {
            const [ordersData, statsData] = await Promise.all([
                getVendorOrders(),
                getVendorStats(),
            ]);
            setOrders(ordersData.results || ordersData);
            setStats(statsData);
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
        try {
            await updateOrderStatus(orderId, newStatus);
            fetchDashboardData();
        } catch (err) {
            setError('Failed to update order status.');
            console.error(err);
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
                <StatCard icon={<DollarSign size={22} />} title="Total Sales" value={money(stats?.total_sales || 0)} />
                <StatCard icon={<ShoppingBag size={22} />} title="Total Orders" value={stats?.total_orders || orders.length || 0} />
                <StatCard icon={<ClipboardList size={22} />} title="Pending Orders" value={stats?.pending_orders || 0} />
            </div>

            <section className="surface-card overflow-hidden">
                <div className="border-b border-[#dfe7e2] p-5">
                    <p className="eyebrow">Fulfillment</p>
                    <h2 className="section-title mt-1 text-xl">Recent Orders</h2>
                </div>

                {orders.length === 0 ? (
                    <div className="grid place-items-center px-6 py-14 text-center">
                        <p className="font-bold text-[#66736d]">No vendor orders yet.</p>
                    </div>
                ) : (
                    <div className="table-scroll">
                        <table className="min-w-full text-left text-sm">
                            <thead className="bg-[#f8faf7] text-xs font-black uppercase tracking-widest text-[#66736d]">
                                <tr>
                                    <th className="px-5 py-4">Order</th>
                                    <th className="px-5 py-4">Customer</th>
                                    <th className="px-5 py-4">Amount</th>
                                    <th className="px-5 py-4">Status</th>
                                    <th className="px-5 py-4">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#dfe7e2] bg-white">
                                {orders.map((order) => (
                                    <tr key={order.id}>
                                        <td className="px-5 py-4 font-black text-[#17211d]">#{order.id}</td>
                                        <td className="px-5 py-4 font-semibold text-[#34433d]">{order.customer_name || 'Customer'}</td>
                                        <td className="px-5 py-4 font-black text-[#0f766e]">{money(order.total_amount)}</td>
                                        <td className="px-5 py-4">
                                            <select
                                                value={order.status}
                                                onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                                                className="form-input !min-h-10 !w-40 !py-2"
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="processing">Processing</option>
                                                <option value="shipped">Shipped</option>
                                                <option value="delivered">Delivered</option>
                                                <option value="cancelled">Cancelled</option>
                                            </select>
                                        </td>
                                        <td className="px-5 py-4 font-semibold text-[#66736d]">{dateLabel(order.created_at)}</td>
                                    </tr>
                                ))}
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
