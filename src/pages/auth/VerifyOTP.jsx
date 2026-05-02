import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { RefreshCcw, ShieldCheck, Clock } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const VerifyOTP = () => {
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendDisabled, setResendDisabled] = useState(false);
    const [timer, setTimer] = useState(60);
    const { verify, resendOTP } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    
    // Get email from location state OR localStorage
    const email = location.state?.email || localStorage.getItem('pending_verification_email') || '';

    useEffect(() => {
        if (!email) {
            navigate('/register');
        } else {
            // Store email in localStorage in case of page refresh
            localStorage.setItem('pending_verification_email', email);
        }
    }, [email, navigate]);

    useEffect(() => {
        let interval;
        if (resendDisabled && timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => {
                    if (prev <= 1) {
                        setResendDisabled(false);
                        return 60;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [resendDisabled, timer]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await verify(email, otp);
            setSuccess('Account verified. Redirecting to login...');
            // Clear stored email after successful verification
            localStorage.removeItem('pending_verification_email');
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.detail || err.response?.data?.error || 'Invalid OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = async () => {
        setError('');
        setResendDisabled(true);
        setTimer(60);

        try {
            await resendOTP(email);
            setSuccess('A new OTP was sent to your email.');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to resend OTP. Please try again.');
            setResendDisabled(false);
        }
    };

    // Calculate progress percentage for circular indicator
    const progressPercentage = (timer / 60) * 100;
    const radius = 20;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (progressPercentage / 100) * circumference;

    return (
        <div className="page-shell page-narrow">
            <div className="surface-card p-6 text-center sm:p-8">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-lg bg-[#d9f3ee] text-[#115e59]">
                    <ShieldCheck size={28} />
                </div>
                <p className="eyebrow mt-5">Email Verification</p>
                <h1 className="section-title mt-1">Enter your OTP code</h1>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#66736d]">
                    We sent a six digit verification code to <strong className="text-[#34433d]">{email}</strong>.
                </p>

                {error && <div className="alert alert-error mt-5 text-left">{error}</div>}
                {success && <div className="alert alert-success mt-5 text-left">{success}</div>}

                <form onSubmit={handleSubmit} className="mx-auto mt-6 max-w-sm space-y-5">
                    <div>
                        <label className="field-label text-left">OTP Code</label>
                        <input
                            type="text"
                            inputMode="numeric"
                            required
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            maxLength="6"
                            className="form-input text-center text-2xl font-black tracking-[0.45em]"
                            placeholder="000000"
                        />
                    </div>

                    <button type="submit" disabled={loading} className="btn btn-primary w-full">
                        <ShieldCheck size={18} />
                        {loading ? 'Verifying...' : 'Verify Account'}
                    </button>
                </form>

                <div className="mt-6 pt-4 border-t border-gray-200">
                    <div className="flex flex-col items-center justify-center gap-4">
                        {/* Enhanced Resend Button with Visual Timer */}
                        <button
                            type="button"
                            onClick={handleResendOTP}
                            disabled={resendDisabled}
                            className={`
                                relative flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-all duration-200
                                ${resendDisabled 
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                    : 'bg-[#d9f3ee] text-[#115e59] hover:bg-[#c5ede5] active:scale-95'
                                }
                            `}
                        >
                            {resendDisabled ? (
                                <>
                                    {/* Circular Progress Indicator */}
                                    <div className="relative w-5 h-5">
                                        <svg className="w-5 h-5 transform -rotate-90">
                                            <circle
                                                cx="10"
                                                cy="10"
                                                r={radius}
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                fill="none"
                                                className="text-gray-300"
                                            />
                                            <circle
                                                cx="10"
                                                cy="10"
                                                r={radius}
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                fill="none"
                                                strokeDasharray={circumference}
                                                strokeDashoffset={offset}
                                                className="text-[#115e59] transition-all duration-1000 ease-linear"
                                            />
                                        </svg>
                                    </div>
                                    <span>Resend code in {timer}s</span>
                                </>
                            ) : (
                                <>
                                    <RefreshCcw size={16} />
                                    <span>Resend OTP</span>
                                </>
                            )}
                        </button>

                        {/* Countdown Timer Bar (Alternative visual) */}
                        {resendDisabled && (
                            <div className="w-full max-w-xs">
                                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                                    <span className="flex items-center gap-1">
                                        <Clock size={12} />
                                        <span>Next attempt available in</span>
                                    </span>
                                    <span className="font-mono font-bold text-[#115e59]">{timer}s</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                                    <div 
                                        className="bg-gradient-to-r from-[#115e59] to-[#1a7f76] h-1.5 rounded-full transition-all duration-1000 ease-linear"
                                        style={{ width: `${(timer / 60) * 100}%` }}
                                    />
                                </div>
                            </div>
                        )}

                        <Link 
                            to="/login" 
                            className="text-sm font-semibold text-[#66736d] hover:text-[#115e59] transition-colors underline-offset-2 hover:underline"
                        >
                            Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerifyOTP;