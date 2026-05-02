import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit3, LogOut, Save, ShieldCheck, User } from 'lucide-react';
import axiosInstance from '../../api/axiosConfig';
import { useAuth } from '../../hooks/useAuth';

const Profile = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
    });
    const [passwordData, setPasswordData] = useState({
        old_password: '',
        new_password: '',
        confirm_password: '',
    });
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await axiosInstance.get('/auth/profile/');
                setProfile(response.data);
                setFormData({
                    first_name: response.data.first_name || '',
                    last_name: response.data.last_name || '',
                    email: response.data.email || '',
                    phone: response.data.phone || '',
                });
            } catch (err) {
                setError('Failed to load profile. Make sure the Django API is running.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setUpdating(true);
        setMessage('');
        setError('');

        try {
            const response = await axiosInstance.put('/auth/profile/', formData);
            setProfile(response.data);
            setEditMode(false);
            setMessage('Profile updated successfully.');
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setError(err.response?.data?.detail || 'Update failed.');
        } finally {
            setUpdating(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setUpdating(true);
        setMessage('');
        setError('');

        if (passwordData.new_password !== passwordData.confirm_password) {
            setError('New passwords do not match.');
            setUpdating(false);
            return;
        }

        try {
            await axiosInstance.post('/auth/change-password/', {
                old_password: passwordData.old_password,
                new_password: passwordData.new_password,
            });
            setPasswordData({ old_password: '', new_password: '', confirm_password: '' });
            setMessage('Password changed successfully.');
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setError(err.response?.data?.detail || 'Password change failed.');
        } finally {
            setUpdating(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (loading) {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
                <div className="loading-spinner" />
                <p className="font-bold text-[#66736d]">Loading profile...</p>
            </div>
        );
    }

    return (
        <div className="page-shell">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="eyebrow">Account</p>
                    <h1 className="section-title mt-1">My Profile</h1>
                </div>
                <button type="button" onClick={handleLogout} className="btn btn-ghost w-full text-[#b42318] sm:w-auto">
                    <LogOut size={18} />
                    Logout
                </button>
            </div>

            {message && <div className="alert alert-success mb-5">{message}</div>}
            {error && <div className="alert alert-error mb-5">{error}</div>}

            <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
                <section className="surface-card p-6">
                    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex items-start gap-3">
                            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-[#d9f3ee] text-[#115e59]">
                                <User size={24} />
                            </span>
                            <div>
                                <p className="eyebrow">Profile Information</p>
                                <h2 className="section-title mt-1 text-xl">{profile?.username || 'Your account'}</h2>
                            </div>
                        </div>
                        {!editMode && (
                            <button type="button" onClick={() => setEditMode(true)} className="btn btn-ghost !min-h-10 text-sm">
                                <Edit3 size={16} />
                                Edit Profile
                            </button>
                        )}
                    </div>

                    {!editMode ? (
                        <div className="grid gap-4 sm:grid-cols-2">
                            <ProfileField label="Full Name" value={`${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || 'Not provided'} />
                            <ProfileField label="Username" value={profile?.username || 'Not provided'} />
                            <ProfileField label="Email" value={profile?.email || 'Not provided'} />
                            <ProfileField label="Phone" value={profile?.phone || 'Not provided'} />
                        </div>
                    ) : (
                        <form onSubmit={handleProfileUpdate} className="space-y-5">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="field-label">First Name</label>
                                    <input
                                        type="text"
                                        value={formData.first_name}
                                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                        className="form-input"
                                    />
                                </div>
                                <div>
                                    <label className="field-label">Last Name</label>
                                    <input
                                        type="text"
                                        value={formData.last_name}
                                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                        className="form-input"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="field-label">Email</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="form-input"
                                    required
                                />
                            </div>
                            <div>
                                <label className="field-label">Phone</label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="form-input"
                                />
                            </div>
                            <div className="flex flex-col gap-3 sm:flex-row">
                                <button type="submit" disabled={updating} className="btn btn-primary flex-1">
                                    <Save size={18} />
                                    {updating ? 'Saving...' : 'Save Changes'}
                                </button>
                                <button type="button" onClick={() => setEditMode(false)} className="btn btn-ghost flex-1">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    )}
                </section>

                <aside className="surface-card h-fit p-6">
                    <div className="flex items-start gap-3">
                        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-[#d9f3ee] text-[#115e59]">
                            <ShieldCheck size={24} />
                        </span>
                        <div>
                            <p className="eyebrow">Security</p>
                            <h2 className="section-title mt-1 text-xl">Change Password</h2>
                        </div>
                    </div>

                    <form onSubmit={handlePasswordChange} className="mt-6 space-y-4">
                        <div>
                            <label className="field-label">Current Password</label>
                            <input
                                type="password"
                                required
                                value={passwordData.old_password}
                                onChange={(e) => setPasswordData({ ...passwordData, old_password: e.target.value })}
                                className="form-input"
                            />
                        </div>
                        <div>
                            <label className="field-label">New Password</label>
                            <input
                                type="password"
                                required
                                value={passwordData.new_password}
                                onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                                className="form-input"
                            />
                        </div>
                        <div>
                            <label className="field-label">Confirm New Password</label>
                            <input
                                type="password"
                                required
                                value={passwordData.confirm_password}
                                onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                                className="form-input"
                            />
                        </div>
                        <button type="submit" disabled={updating} className="btn btn-accent w-full">
                            Update Password
                        </button>
                    </form>
                </aside>
            </div>
        </div>
    );
};

const ProfileField = ({ label, value }) => (
    <div className="rounded-lg border border-[#dfe7e2] bg-[#f8faf7] p-4">
        <p className="text-xs font-bold uppercase tracking-widest text-[#66736d]">{label}</p>
        <p className="mt-2 break-words font-black text-[#17211d]">{value}</p>
    </div>
);

export default Profile;
