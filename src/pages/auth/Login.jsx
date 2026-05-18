import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, LogIn, Mail, Store } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { getPendingMergeCart, clearPendingMergeCart } from '../../utils/guestCart';
import { mergeGuestCart } from '../../api/cartApi';
import { useCart } from '../../context/CartContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const { login } = useAuth();
    const { refreshCart } = useCart();
    const navigate = useNavigate();

    // Helper function to merge guest cart after successful authentication
    const mergeGuestCartAfterLogin = async () => {
        const pendingItems = getPendingMergeCart();
        console.log('Pending items for merge:', pendingItems);
        
        if (pendingItems && pendingItems.length > 0) {
            try {
                // Wait a bit to ensure token is properly set
                await new Promise(resolve => setTimeout(resolve, 100));
                
                console.log('Attempting to merge cart with items:', pendingItems);
                const result = await mergeGuestCart(pendingItems);
                console.log('Merge successful:', result);
                clearPendingMergeCart();
                await refreshCart();
                return true;
            } catch (error) {
                console.error('Failed to merge guest cart:', error);
                console.error('Error response:', error.response?.data);
                return false;
            }
        }
        return false;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(email, password);
            
            // Merge guest cart after login
            await mergeGuestCartAfterLogin();
            
            // Check for return URL or default to home
            const params = new URLSearchParams(window.location.search);
            const returnUrl = params.get('returnUrl');
            navigate(returnUrl || '/');
        } catch (err) {
            setError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        setGoogleLoading(true);
        setError('');
        
        try {
            const res = await axios.post(
                "http://127.0.0.1:8000/api/auth/google/",
                { token: credentialResponse.credential },
                { headers: { 'Content-Type': 'application/json' } }
            );

            console.log("Google login response:", res.data);
            
            localStorage.setItem('access_token', res.data.access);
            localStorage.setItem('refresh_token', res.data.refresh);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            
            // Wait a bit for the token to be available
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Merge guest cart after Google login
            await mergeGuestCartAfterLogin();
            
            // Check for return URL
            const params = new URLSearchParams(window.location.search);
            const returnUrl = params.get('returnUrl');
            
            if (returnUrl === '/checkout') {
                window.location.href = returnUrl;
            } else {
                window.location.href = '/';
            }
            
        } catch (err) {
            console.error("Google login error:", err);
            setError(err.response?.data?.error || 'Google login failed. Please try again.');
            setGoogleLoading(false);
        }
    };
    
    const handleGoogleError = () => {
        console.error("Google login failed");
        setError('Google login failed. Please try again.');
        setGoogleLoading(false);
    };

    return (
        <div className="page-shell page-narrow">
            <div className="surface-card overflow-hidden">
                <div className="grid md:grid-cols-[0.9fr_1.1fr]">
                    <div className="mesh-hero hidden min-h-full p-8 text-white md:block">
                        <div className="flex h-full flex-col justify-between">
                            <div className="grid h-12 w-12 place-items-center rounded-lg bg-white/15">
                                <Store size={24} />
                            </div>
                            <div>
                                <p className="mb-2 text-sm font-bold uppercase tracking-widest text-white/70">Welcome Back</p>
                                <h1 className="text-3xl font-black leading-tight">Pick up where your marketplace day left off.</h1>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 sm:p-8">
                        <p className="eyebrow">Sign In</p>
                        <h2 className="section-title mt-1">Access your account</h2>
                        <p className="mt-2 text-sm leading-6 text-[#66736d]">Manage your cart, orders, profile, and vendor tools.</p>

                        {error && <div className="alert alert-error mt-5">{error}</div>}

                        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                            <div>
                                <label className="field-label">Email</label>
                                <div className="relative">
                                    <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#66736d]" size={18} />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="form-input pl-10"
                                        placeholder="you@example.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="field-label">Password</label>
                                <div className="relative">
                                    <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#66736d]" size={18} />
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="form-input pl-10"
                                        placeholder="Enter your password"
                                    />
                                </div>
                            </div>

                            <button type="submit" disabled={loading} className="btn btn-primary w-full">
                                <LogIn size={18} />
                                {loading ? 'Signing in...' : 'Sign In'}
                            </button>
                        </form>

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="bg-white px-2 text-[#66736d]">Or continue with</span>
                            </div>
                        </div>

                        <div className="flex justify-center">
                            {googleLoading ? (
                                <button 
                                    disabled 
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700"
                                >
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-700"></div>
                                    Connecting...
                                </button>
                            ) : (
                                <GoogleLogin
                                    onSuccess={handleGoogleSuccess}
                                    onError={handleGoogleError}
                                    useOneTap={false}
                                    theme="outline"
                                    size="large"
                                    width="100%"
                                    text="continue_with"
                                    shape="rectangular"
                                />
                            )}
                        </div>

                        <p className="mt-6 text-center text-sm font-semibold text-[#66736d]">
                            Do not have an account?{' '}
                            <Link to="/register" className="text-[#115e59] underline">
                                Create one
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;