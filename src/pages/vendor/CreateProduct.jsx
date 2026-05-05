import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ImagePlus, PackagePlus, Save } from 'lucide-react';
import { createProduct } from '../../api/productApi';
import { getCategories } from '../../api/categoryApi';

const CreateProduct = () => {
    const navigate = useNavigate();

    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        stock: '',
        category: '',
        image: null,
    });

    const [imagePreview, setImagePreview] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // 🔥 Fetch categories from API
    useEffect(() => {
    const fetchCategories = async () => {
        try {
            const data = await getCategories();
            console.log('Categories loaded:', data);
            
            // Transform API data to match expected format
            const transformedCategories = data.map(cat => ({
                value: cat.id,
                label: cat.name
            }));
            
            setCategories(transformedCategories);
        } catch (err) {
            console.error("Failed to load categories", err);
            setError("Failed to load categories");
            setCategories([]);
        }
    };

    fetchCategories();
}, []);

    // ... rest of your code remains the same

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setFormData((prev) => ({ ...prev, image: file }));
        setImagePreview(file ? URL.createObjectURL(file) : '');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const data = new FormData();
            data.append('name', formData.name);
            data.append('description', formData.description);
            data.append('price', formData.price);
            data.append('stock', formData.stock);
            data.append('category', formData.category);
            if (formData.image) {
                data.append('image', formData.image);
            }

            console.log('=== Form Submission Debug ===');
            console.log('Form Data:', formData);
            console.log('Category value:', formData.category);
            console.log('Category type:', typeof formData.category);
            console.log('Image file:', formData.image);
        
        // Log all FormData entries
           console.log('FormData entries:');
           for (let pair of data.entries()) {
               console.log(pair[0], '=', pair[1]);
           }

            await createProduct(data);
            navigate('/vendor/dashboard');
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to create product.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-shell">
            <Link to="/vendor/dashboard" className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-[#115e59] hover:text-[#0f766e]">
                <ArrowLeft size={18} />
                Back to dashboard
            </Link>

            <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
                <section className="surface-card p-6">
                    <div className="mb-6 flex items-start gap-3">
                        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-[#d9f3ee] text-[#115e59]">
                            <PackagePlus size={24} />
                        </span>
                        <div>
                            <p className="eyebrow">Inventory</p>
                            <h1 className="section-title mt-1">Add New Product</h1>
                        </div>
                    </div>

                    {error && <div className="alert alert-error mb-5">{error}</div>}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="field-label">Product Name</label>
                            <input
                                type="text"
                                name="name"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="Example: Wireless headphones"
                            />
                        </div>

                        <div>
                            <label className="field-label">Description</label>
                            <textarea
                                name="description"
                                rows="5"
                                required
                                value={formData.description}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="Describe the product, condition, features, and what is included."
                            />
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label className="field-label">Price</label>
                                <input
                                    type="number"
                                    name="price"
                                    required
                                    step="0.01"
                                    min="0"
                                    value={formData.price}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="0.00"
                                />
                            </div>

                            <div>
                                <label className="field-label">Stock Quantity</label>
                                <input
                                    type="number"
                                    name="stock"
                                    required
                                    min="0"
                                    value={formData.stock}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="10"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="field-label">Category</label>
                            <select
                                  name="category"
                                  required
                                  value={formData.category}
                                  onChange={handleChange}
                                  className="form-input"
                        >
                            <option value="">Select Category</option>
                              {categories.map((item) => (
                              <option key={item.value || 'placeholder'} value={item.value} disabled={!item.value}>
                                   {item.value ? item.label : 'Select Category'}
                            </option>
               ))}
                            </select>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row">
                            <button type="submit" disabled={loading} className="btn btn-primary flex-1">
                                <Save size={18} />
                                {loading ? 'Creating...' : 'Create Product'}
                            </button>
                            <button type="button" onClick={() => navigate('/vendor/dashboard')} className="btn btn-ghost flex-1">
                                Cancel
                            </button>
                        </div>
                    </form>
                </section>

                <aside className="surface-card h-fit p-6">
                    <p className="eyebrow">Media</p>
                    <h2 className="section-title mt-1 text-xl">Product Image</h2>
                    <label className="mt-5 grid cursor-pointer place-items-center rounded-lg border border-dashed border-[#bfd2ca] bg-[#f8faf7] p-5 text-center hover:border-[#0f766e]">
                        {imagePreview ? (
                            <img src={imagePreview} alt="Product preview" className="aspect-square w-full rounded-lg object-cover" />
                        ) : (
                            <div className="py-8">
                                <ImagePlus size={36} className="mx-auto text-[#115e59]" />
                                <p className="mt-3 font-black text-[#17211d]">Upload product photo</p>
                                <p className="mt-1 text-sm font-semibold text-[#66736d]">PNG, JPG, or WEBP</p>
                            </div>
                        )}
                        <input type="file" accept="image/*" onChange={handleFileChange} className="sr-only" />
                    </label>
                </aside>
            </div>
        </div>
    );
};

export default CreateProduct;
