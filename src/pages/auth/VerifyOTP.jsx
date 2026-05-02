import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { RefreshCcw, ShieldCheck } from 'lucide-react';
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
        if (resendDisabled) {
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
    }, [resendDisabled]);

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

        try {
            await resendOTP(email);
            setSuccess('A new OTP was sent to your email.');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to resend OTP. Please try again.');
            setResendDisabled(false);
        }
    };

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

                <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row">
                    <button
                        type="button"
                        onClick={handleResendOTP}
                        disabled={resendDisabled}
                        className="btn btn-ghost !min-h-10 text-sm"
                    >
                        <RefreshCcw size={16} />
                        {resendDisabled ? `Resend in ${timer}s` : 'Resend OTP'}
                    </button>
                    <Link to="/login" className="text-sm font-bold text-[#66736d] underline">
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default VerifyOTP;