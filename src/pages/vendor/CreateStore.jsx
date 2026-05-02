import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Mail, MapPin, Phone, Store } from 'lucide-react';
import { createVendorStore } from '../../api/vendorApi';

const benefits = [
    'List products with photos, stock, and categories.',
    'Track orders and fulfillment status.',
    'Review sales performance from the vendor dashboard.',
    'Keep store contact details ready for customers.',
];

const CreateStore = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        store_name: '',
        store_description: '',
        store_address: '',
        store_phone: '',
        store_email: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await createVendorStore(formData);
            navigate('/vendor/dashboard');
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to create store.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-shell">
            <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
                <section className="surface-card p-6">
                    <div className="mb-6 flex items-start gap-3">
                        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-[#d9f3ee] text-[#115e59]">
                            <Store size={24} />
                        </span>
                        <div>
                            <p className="eyebrow">Vendor Setup</p>
                            <h1 className="section-title mt-1">Create Your Store</h1>
                            <p className="mt-2 text-sm leading-6 text-[#66736d]">Set up the storefront customers will see when they buy from you.</p>
                        </div>
                    </div>

                    {error && <div className="alert alert-error mb-5">{error}</div>}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="field-label">Store Name</label>
                            <input
                                type="text"
                                name="store_name"
                                required
                                value={formData.store_name}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="Example: Nairobi Craft Co."
                            />
                        </div>

                        <div>
                            <label className="field-label">Store Description</label>
                            <textarea
                                name="store_description"
                                rows="4"
                                required
                                value={formData.store_description}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="Describe what your store sells."
                            />
                        </div>

                        <div>
                            <label className="field-label">Store Address</label>
                            <div className="relative">
                                <MapPin className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#66736d]" size={18} />
                                <input
                                    type="text"
                                    name="store_address"
                                    value={formData.store_address}
                                    onChange={handleChange}
                                    className="form-input pl-10"
                                    placeholder="Business address"
                                />
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label className="field-label">Store Phone</label>
                                <div className="relative">
                                    <Phone className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#66736d]" size={18} />
                                    <input
                                        type="tel"
                                        name="store_phone"
                                        value={formData.store_phone}
                                        onChange={handleChange}
                                        className="form-input pl-10"
                                        placeholder="254700000000"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="field-label">Store Email</label>
                                <div className="relative">
                                    <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#66736d]" size={18} />
                                    <input
                                        type="email"
                                        name="store_email"
                                        value={formData.store_email}
                                        onChange={handleChange}
                                        className="form-input pl-10"
                                        placeholder="store@example.com"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row">
                            <button type="submit" disabled={loading} className="btn btn-primary flex-1">
                                {loading ? 'Creating Store...' : 'Create Store'}
                            </button>
                            <button type="button" onClick={() => navigate('/')} className="btn btn-ghost flex-1">
                                Cancel
                            </button>
                        </div>
                    </form>
                </section>

                <aside className="surface-card h-fit p-6">
                    <p className="eyebrow">Why it matters</p>
                    <h2 className="section-title mt-1 text-xl">Vendor tools ready to go</h2>
                    <div className="mt-5 space-y-3">
                        {benefits.map((benefit) => (
                            <div key={benefit} className="flex gap-3 rounded-lg border border-[#dfe7e2] bg-[#f8faf7] p-3">
                                <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-[#087443]" />
                                <p className="text-sm font-semibold leading-6 text-[#34433d]">{benefit}</p>
                            </div>
                        ))}
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default CreateStore;
