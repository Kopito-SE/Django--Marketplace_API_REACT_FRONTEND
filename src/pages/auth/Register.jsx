import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Phone, UserPlus } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        first_name: '',
        last_name: '',
        phone_number: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setLoading(true);

        try {
            const userData = { ...formData };
            delete userData.confirmPassword;
            await register(userData);
            
            // Store email in localStorage before navigation
            localStorage.setItem('pending_verification_email', formData.email);
            
            // Navigate with email in state
            navigate('/verify', { state: { email: formData.email } });
        } catch (err) {
            if (err.response?.data) {
                const errors = err.response.data;
                const errorMessages = Object.values(errors).flat().join(', ');
                setError(errorMessages || 'Registration failed. Please try again.');
            } else {
                setError('Registration failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-shell page-narrow">
            <div className="surface-card p-6 sm:p-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <p className="eyebrow">Create Account</p>
                        <h1 className="section-title mt-1">Join MarketHub</h1>
                        <p className="mt-2 text-sm leading-6 text-[#66736d]">Create a buyer account now, then open a vendor store any time.</p>
                    </div>
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-[#d9f3ee] text-[#115e59]">
                        <UserPlus size={24} />
                    </span>
                </div>

                {error && <div className="alert alert-error mt-5">{error}</div>}

                <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                    <div>
                        <label className="field-label">Username</label>
                        <input
                            type="text"
                            name="username"
                            required
                            value={formData.username}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="Choose a username"
                        />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className="field-label">First Name</label>
                            <input
                                type="text"
                                name="first_name"
                                value={formData.first_name}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="First name"
                            />
                        </div>

                        <div>
                            <label className="field-label">Last Name</label>
                            <input
                                type="text"
                                name="last_name"
                                value={formData.last_name}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="Last name"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="field-label">Email</label>
                        <div className="relative">
                            <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#66736d]" size={18} />
                            <input
                                type="email"
                                name="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="form-input pl-10"
                                placeholder="you@example.com"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="field-label">Phone Number</label>
                        <div className="relative">
                            <Phone className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#66736d]" size={18} />
                            <input
                                type="tel"
                                name="phone_number"
                                value={formData.phone_number}
                                onChange={handleChange}
                                className="form-input pl-10"
                                placeholder="254700000000"
                            />
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className="field-label">Password</label>
                            <input
                                type="password"
                                name="password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="Enter a password"
                            />
                        </div>

                        <div>
                            <label className="field-label">Confirm Password</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                required
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="Repeat password"
                            />
                        </div>
                    </div>

                    <button type="submit" disabled={loading} className="btn btn-primary w-full">
                        <UserPlus size={18} />
                        {loading ? 'Creating account...' : 'Create Account'}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm font-semibold text-[#66736d]">
                    Already have an account?{' '}
                    <Link to="/login" className="text-[#115e59] underline">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Register;