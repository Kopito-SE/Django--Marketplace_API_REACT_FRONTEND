import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// Auth Pages
const Login = lazy(() => import('../pages/auth/Login'));
const Register = lazy(() => import('../pages/auth/Register'));
const VerifyOTP = lazy(() => import('../pages/auth/VerifyOTP'));

// Marketplace Pages
const Marketplace = lazy(() => import('../pages/marketplace/Marketplace'));
const ProductDetail = lazy(() => import('../pages/marketplace/ProductDetail'));

// User Pages
const Cart = lazy(() => import('../pages/user/Cart'));
const Orders = lazy(() => import('../pages/user/Orders'));
const Profile = lazy(() => import('../pages/user/Profile'));
const Checkout = lazy(() => import('../pages/user/Checkout'));
const PaymentStatus = lazy(() => import('../pages/user/PaymentStatus'));

// Vendor Pages
const VendorDashboard = lazy(() => import('../pages/vendor/VendorDashboard'));
const CreateProduct = lazy(() => import('../pages/vendor/CreateProduct'));
const CreateStore = lazy(() => import('../pages/vendor/CreateStore'));

const PageLoader = ({ label = 'Loading...' }) => (
    <div className="flex min-h-[55vh] flex-col items-center justify-center gap-4">
        <div className="loading-spinner" />
        <p className="text-sm font-bold text-[#66736d]">{label}</p>
    </div>
);

const PrivateRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    if (loading) return <PageLoader label="Checking your session..." />;
    return isAuthenticated ? children : <Navigate to="/login" />;
};

const VendorRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    if (loading) return <PageLoader label="Checking vendor access..." />;
    if (!isAuthenticated) return <Navigate to="/login" />;
    return children;
};

const AppRoutes = () => {
    return (
        <Suspense fallback={<PageLoader />}>
            <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/verify" element={<VerifyOTP />} />
                
                {/* Marketplace Routes */}
                <Route path="/" element={<Marketplace />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                
                {/* User Routes */}
                {/* REMOVED PrivateRoute from Cart - now accessible to everyone */}
                <Route path="/cart" element={<Cart />} />
                {/* Keep these protected as they require user data */}
                <Route path="/checkout" element={<PrivateRoute><Checkout /></PrivateRoute>} />
                <Route path="/payment-status" element={<PrivateRoute><PaymentStatus /></PrivateRoute>} />
                <Route path="/orders" element={<PrivateRoute><Orders /></PrivateRoute>} />
                <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
                
                {/* Vendor Routes */}
                <Route path="/vendor/dashboard" element={<VendorRoute><VendorDashboard /></VendorRoute>} />
                <Route path="/vendor/products/create" element={<VendorRoute><CreateProduct /></VendorRoute>} />
                <Route path="/vendor/create-store" element={<VendorRoute><CreateStore /></VendorRoute>} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Suspense>
    );
};

export default AppRoutes;