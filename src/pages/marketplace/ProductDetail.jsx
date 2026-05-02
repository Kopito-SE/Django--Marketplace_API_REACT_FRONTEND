import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Boxes, Minus, Plus, Send, ShieldCheck, ShoppingCart, Star, Store } from 'lucide-react';
import { addToCart } from '../../api/cartApi';
import { getProductDetails } from '../../api/productApi';
import { createReview, getProductReviews } from '../../api/reviewApi';
import { useAuth } from '../../hooks/useAuth';
import { demoProducts } from '../../data/demoProducts';
import { dateLabel, money } from '../../utils/formatters';

const sampleReviews = [
    {
        id: 'sample-1',
        user_name: 'Amina',
        rating: 5,
        review: 'Clean listing, fast checkout, and the product matched the description.',
        created_at: new Date().toISOString(),
    },
    {
        id: 'sample-2',
        user_name: 'Daniel',
        rating: 4,
        review: 'Good vendor communication and easy order tracking.',
        created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
];

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [product, setProduct] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [previewMode, setPreviewMode] = useState(false);
    const [addingToCart, setAddingToCart] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [reviewText, setReviewText] = useState('');
    const [rating, setRating] = useState(5);
    const [submittingReview, setSubmittingReview] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const fetchProductDetails = async () => {
            setLoading(true);
            setError('');

            try {
                const data = await getProductDetails(id);
                setProduct(data);
                setPreviewMode(false);
            } catch (err) {
                const fallback = demoProducts.find((item) => String(item.id) === String(id));
                setProduct(fallback || null);
                setPreviewMode(Boolean(fallback));
                setError(fallback ? 'Showing a preview product because the Django API is offline.' : 'Failed to load product details.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        const fetchReviews = async () => {
            try {
                const data = await getProductReviews(id);
                setReviews(data.results || data);
            } catch (err) {
                setReviews(sampleReviews);
                console.error('Failed to load reviews', err);
            }
        };

        fetchProductDetails();
        fetchReviews();
    }, [id]);

    const maxStock = useMemo(() => Math.max(0, Number(product?.stock || 0)), [product]);

    const handleAddToCart = async () => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        if (previewMode) {
            setSuccess('Preview product selected. Connect the Django API to add real items to cart.');
            setTimeout(() => setSuccess(''), 3500);
            return;
        }

        setAddingToCart(true);
        setError('');
        try {
            await addToCart(product.id, quantity);
            setSuccess('Product added to cart.');
            setTimeout(() => setSuccess(''), 3000);
        } catch {
            setError('Failed to add to cart.');
            setTimeout(() => setError(''), 3000);
        } finally {
            setAddingToCart(false);
        }
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        if (previewMode) {
            setReviews((items) => [
                {
                    id: `local-${Date.now()}`,
                    user_name: 'You',
                    rating,
                    review: reviewText,
                    created_at: new Date().toISOString(),
                },
                ...items,
            ]);
            setReviewText('');
            setRating(5);
            setSuccess('Preview review added locally.');
            setTimeout(() => setSuccess(''), 3000);
            return;
        }

        setSubmittingReview(true);
        setError('');
        try {
            await createReview(id, { review: reviewText, rating });
            setReviewText('');
            setRating(5);
            const data = await getProductReviews(id);
            setReviews(data.results || data);
            setSuccess('Review submitted.');
            setTimeout(() => setSuccess(''), 3000);
        } catch {
            setError('Failed to submit review.');
            setTimeout(() => setError(''), 3000);
        } finally {
            setSubmittingReview(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
                <div className="loading-spinner" />
                <p className="font-bold text-[#66736d]">Loading product...</p>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="page-shell page-narrow">
                <div className="alert alert-error">{error}</div>
                <Link to="/" className="btn btn-ghost mt-5">
                    <ArrowLeft size={18} />
                    Back to marketplace
                </Link>
            </div>
        );
    }

    return (
        <div className="page-shell">
            <Link to="/" className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-[#115e59] hover:text-[#0f766e]">
                <ArrowLeft size={18} />
                Back to marketplace
            </Link>

            {(success || error) && (
                <div className={`${success ? 'alert alert-success' : 'alert alert-error'} mb-5`}>
                    {success || error}
                </div>
            )}

            <section className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
                <div className="surface-card overflow-hidden">
                    <div className="aspect-square bg-[#eef7f4]">
                        {product.image ? (
                            <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                        ) : (
                            <div className="grid h-full place-items-center bg-[linear-gradient(135deg,#d9f3ee,#fff2e9)] text-[#115e59]">
                                <Boxes size={72} />
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-5">
                    <div className="surface-card p-6">
                        <div className="mb-4 flex flex-wrap items-center gap-2">
                            <span className={`badge ${maxStock > 0 ? 'badge-success' : 'badge-danger'}`}>
                                {maxStock > 0 ? `${maxStock} in stock` : 'Out of stock'}
                            </span>
                            {previewMode && (
                                <span className="badge badge-info">
                                    <ShieldCheck size={14} />
                                    Preview
                                </span>
                            )}
                        </div>
                        <h1 className="text-3xl font-black leading-tight text-[#17211d] sm:text-4xl">{product.name}</h1>
                        <p className="mt-4 text-base leading-7 text-[#66736d]">{product.description}</p>
                        <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
                            <div>
                                <p className="text-sm font-bold text-[#66736d]">Price</p>
                                <p className="text-4xl font-black text-[#0f766e]">{money(product.price)}</p>
                            </div>
                            {product.vendor?.store_name && (
                                <div className="flex items-center gap-2 rounded-lg border border-[#dfe7e2] bg-[#f8faf7] px-4 py-3">
                                    <Store size={18} className="text-[#115e59]" />
                                    <span className="text-sm font-bold text-[#34433d]">{product.vendor.store_name}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {maxStock > 0 && (
                        <div className="surface-card p-5">
                            <div className="grid gap-4 sm:grid-cols-[160px_1fr]">
                                <div>
                                    <label className="field-label">Quantity</label>
                                    <div className="flex h-12 items-center overflow-hidden rounded-lg border border-[#dfe7e2] bg-white">
                                        <button
                                            type="button"
                                            className="grid h-full w-11 place-items-center text-[#66736d] hover:bg-[#eef7f4]"
                                            onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                                            aria-label="Decrease quantity"
                                            title="Decrease quantity"
                                        >
                                            <Minus size={16} />
                                        </button>
                                        <input
                                            type="number"
                                            min="1"
                                            max={maxStock}
                                            value={quantity}
                                            onChange={(e) => setQuantity(Math.min(maxStock, Math.max(1, parseInt(e.target.value, 10) || 1)))}
                                            className="h-full w-full border-x border-[#dfe7e2] text-center font-black outline-none"
                                        />
                                        <button
                                            type="button"
                                            className="grid h-full w-11 place-items-center text-[#66736d] hover:bg-[#eef7f4]"
                                            onClick={() => setQuantity((value) => Math.min(maxStock, value + 1))}
                                            aria-label="Increase quantity"
                                            title="Increase quantity"
                                        >
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleAddToCart}
                                    disabled={addingToCart}
                                    className="btn btn-primary self-end"
                                >
                                    <ShoppingCart size={18} />
                                    {addingToCart ? 'Adding...' : 'Add to Cart'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            <section className="mt-9 grid gap-6 lg:grid-cols-[0.82fr_1.18fr]">
                <form onSubmit={handleSubmitReview} className="surface-card p-6">
                    <p className="eyebrow">Reviews</p>
                    <h2 className="section-title mt-1">Share your experience</h2>
                    {!isAuthenticated && (
                        <p className="mt-3 text-sm font-semibold text-[#66736d]">
                            <Link to="/login" className="text-[#115e59] underline">Log in</Link> to add a review.
                        </p>
                    )}
                    <div className="mt-5 space-y-4">
                        <div>
                            <label className="field-label">Rating</label>
                            <select
                                value={rating}
                                onChange={(e) => setRating(parseInt(e.target.value, 10))}
                                className="form-input"
                                disabled={!isAuthenticated}
                            >
                                <option value="5">5 - Excellent</option>
                                <option value="4">4 - Very good</option>
                                <option value="3">3 - Average</option>
                                <option value="2">2 - Poor</option>
                                <option value="1">1 - Terrible</option>
                            </select>
                        </div>
                        <div>
                            <label className="field-label">Review</label>
                            <textarea
                                value={reviewText}
                                onChange={(e) => setReviewText(e.target.value)}
                                required
                                rows="4"
                                className="form-input"
                                placeholder="Tell other shoppers what stood out."
                                disabled={!isAuthenticated}
                            />
                        </div>
                        <button type="submit" disabled={!isAuthenticated || submittingReview} className="btn btn-accent w-full">
                            <Send size={18} />
                            {submittingReview ? 'Submitting...' : 'Submit Review'}
                        </button>
                    </div>
                </form>

                <div className="surface-card p-6">
                    <div className="mb-5 flex items-center justify-between gap-4">
                        <div>
                            <p className="eyebrow">Customer Feedback</p>
                            <h2 className="section-title mt-1">Latest Reviews</h2>
                        </div>
                        <span className="badge badge-info">{reviews.length} total</span>
                    </div>
                    {reviews.length === 0 ? (
                        <p className="rounded-lg bg-[#f8faf7] p-5 text-[#66736d]">No reviews yet. Be the first to review this product.</p>
                    ) : (
                        <div className="space-y-4">
                            {reviews.map((review) => (
                                <ReviewCard key={review.id} review={review} />
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

const ReviewCard = ({ review }) => (
    <article className="rounded-lg border border-[#dfe7e2] bg-[#f8faf7] p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
                <p className="font-black text-[#17211d]">{review.user_name || 'Anonymous'}</p>
                <div className="mt-1 flex items-center gap-1">
                    {[...Array(5)].map((_, index) => (
                        <Star
                            key={index}
                            size={16}
                            className={index < Number(review.rating) ? 'fill-[#f5a524] text-[#f5a524]' : 'text-[#c8d2cc]'}
                        />
                    ))}
                </div>
            </div>
            <span className="text-xs font-bold text-[#66736d]">{dateLabel(review.created_at)}</span>
        </div>
        <p className="mt-3 leading-6 text-[#34433d]">{review.review}</p>
    </article>
);

export default ProductDetail;
