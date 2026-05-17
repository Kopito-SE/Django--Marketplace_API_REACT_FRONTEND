import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Boxes, ShoppingBag, Trash2, Trash } from 'lucide-react';
import { getCart, removeFromCart, updateCartItem, clearCart } from '../../api/cartApi';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../context/CartContext';
import { money } from '../../utils/formatters';
import { getGuestCart, removeFromGuestCart, updateGuestCartItem, clearGuestCart } from '../../utils/guestCart';

const Cart = () => {
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isClearing, setIsClearing] = useState(false);
    const { isAuthenticated } = useAuth();
    const { refreshCart } = useCart();
    const navigate = useNavigate();

    const fetchCart = useCallback(async () => {
        setLoading(true);
        setError('');
        
        try {
            if (isAuthenticated) {
                const data = await getCart();
                setCart(data);
            } else {
                const guestCart = getGuestCart();
                setCart(guestCart);
                if (guestCart.items.length === 0) {
                    setError('');
                }
            }
        } catch (err) {
            console.error('Failed to load cart:', err);
            const guestCart = getGuestCart();
            setCart(guestCart);
            setError('Failed to load cart from server. Using locally saved cart.');
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    const total = useMemo(() => {
        if (!cart?.items) return 0;
        return cart.items.reduce((sum, item) => sum + (item.line_total || 0), 0);
    }, [cart]);

    const handleClearCart = async () => {
        if (!confirm('Are you sure you want to remove all items from your cart?')) {
            return;
        }
        
        setIsClearing(true);
        setError('');
        
        try {
            if (isAuthenticated) {
                await clearCart();
                setSuccess('Cart cleared successfully.');
            } else {
                clearGuestCart();
                setSuccess('Cart cleared successfully.');
            }
            await fetchCart();
            refreshCart();
        } catch (err) {
            setError('Failed to clear cart.');
            console.error(err);
        } finally {
            setIsClearing(false);
            setTimeout(() => setSuccess(''), 3000);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
                <div className="loading-spinner" />
                <p className="font-bold text-[#66736d]">Loading cart...</p>
            </div>
        );
    }

    if (!cart || cart.items?.length === 0) {
        return (
            <div className="page-shell page-narrow">
                {error && <div className="alert alert-error mb-5">{error}</div>}
                <div className="surface-card grid place-items-center px-6 py-16 text-center">
                    <div className="grid h-14 w-14 place-items-center rounded-lg bg-[#d9f3ee] text-[#115e59]">
                        <ShoppingBag size={28} />
                    </div>
                    <h1 className="mt-5 text-3xl font-black text-[#17211d]">Your cart is empty</h1>
                    <p className="mt-2 max-w-md text-[#66736d]">Add products from the marketplace, then come back here to review your order.</p>
                    <Link to="/" className="btn btn-primary mt-6">
                        Continue Shopping
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="page-shell">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="eyebrow">Cart</p>
                    <h1 className="section-title mt-1">Shopping Cart</h1>
                    {!isAuthenticated && (
                        <p className="text-sm text-[#66736d] mt-2">
                            You're shopping as a guest. <Link to="/login" className="text-[#115e59] underline">Log in</Link> to save your cart.
                        </p>
                    )}
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={handleClearCart} 
                        disabled={isClearing}
                        className="btn btn-ghost w-full sm:w-auto text-[#b42318] hover:text-[#b42318]"
                    >
                        <Trash size={16} />
                        {isClearing ? 'Clearing...' : 'Clear Cart'}
                    </button>
                    <Link to="/" className="btn btn-ghost w-full sm:w-auto">
                        Continue Shopping
                    </Link>
                </div>
            </div>

            {error && <div className="alert alert-error mb-5">{error}</div>}
            {success && <div className="alert alert-success mb-5">{success}</div>}

            <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
                <div className="space-y-4">
                    {cart.items.map((item) => (
                        <CartItem
                            key={item.id}
                            item={item}
                            isAuthenticated={isAuthenticated}
                            onUpdate={fetchCart}
                            onRefreshCart={refreshCart}
                            onError={setError}
                            onSuccess={setSuccess}
                        />
                    ))}
                </div>

                <aside className="surface-card h-fit p-6 lg:sticky lg:top-24">
                    <p className="eyebrow">Summary</p>
                    <h2 className="section-title mt-1 text-xl">Order Total</h2>
                    <div className="mt-5 space-y-3 text-sm font-semibold text-[#66736d]">
                        <div className="flex justify-between gap-4">
                            <span>Subtotal</span>
                            <span className="text-[#17211d]">{money(total)}</span>
                        </div>
                        <div className="flex justify-between gap-4">
                            <span>Shipping</span>
                            <span className="text-[#087443]">Free</span>
                        </div>
                        <div className="border-t border-[#dfe7e2] pt-4">
                            <div className="flex justify-between gap-4 text-lg font-black text-[#17211d]">
                                <span>Total</span>
                                <span>{money(total)}</span>
                            </div>
                        </div>
                    </div>
                    <button 
                        type="button" 
                        onClick={() => {
                            if (!isAuthenticated) {
                                if (confirm('Please log in to proceed to checkout. Would you like to log in now?')) {
                                    navigate('/login');
                                }
                            } else {
                                navigate('/checkout');
                            }
                        }} 
                        className="btn btn-primary mt-6 w-full"
                    >
                        Proceed to Checkout
                    </button>
                </aside>
            </div>
        </div>
    );
};

const CartItem = ({ item, isAuthenticated, onUpdate, onRefreshCart, onError, onSuccess }) => {
    const [quantity, setQuantity] = useState(item.quantity);
    const [updating, setUpdating] = useState(false);
    
    const productName = item.product_name || item.product?.name;
    const productPrice = item.product_price || item.product?.price;
    const productImage = item.product_image || item.product?.image;
    const productId = item.product_id || item.product?.id;

    const updateQuantity = async (newQuantity) => {
        if (newQuantity < 1) return;
        setUpdating(true);
        onError('');

        try {
            if (isAuthenticated) {
                await updateCartItem(item.id, newQuantity);
            } else {
                updateGuestCartItem(item.id, newQuantity);
            }
            setQuantity(newQuantity);
            onSuccess('Cart updated.');
            await onUpdate();
            onRefreshCart();
        } catch (err) {
            onError('Failed to update quantity.');
            console.error(err);
        } finally {
            setUpdating(false);
            setTimeout(() => onSuccess(''), 3000);
        }
    };

    const removeItem = async () => {
        setUpdating(true);
        onError('');

        try {
            if (isAuthenticated) {
                await removeFromCart(item.id);
            } else {
                removeFromGuestCart(item.id);
            }
            onSuccess('Item removed from cart.');
            await onUpdate();
            onRefreshCart();
        } catch (err) {
            onError('Failed to remove item.');
            console.error(err);
        } finally {
            setUpdating(false);
            setTimeout(() => onSuccess(''), 3000);
        }
    };

    return (
        <article className="surface-card grid gap-4 p-4 sm:grid-cols-[112px_1fr_auto] sm:items-center">
            <div className="aspect-square overflow-hidden rounded-lg bg-[#eef7f4]">
                {productImage ? (
                    <img src={productImage} alt={productName} className="h-full w-full object-cover" />
                ) : (
                    <div className="grid h-full place-items-center text-[#115e59]">
                        <Boxes size={32} />
                    </div>
                )}
            </div>
            <div className="min-w-0">
                <Link to={`/product/${productId}`} className="text-lg font-black text-[#17211d] hover:text-[#115e59]">
                    {productName}
                </Link>
                <p className="mt-1 text-sm font-semibold text-[#66736d]">{money(productPrice)}</p>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                    <select
                        value={quantity}
                        onChange={(e) => updateQuantity(parseInt(e.target.value, 10))}
                        disabled={updating}
                        className="form-input !min-h-10 !w-24 !py-2"
                    >
                        {[...Array(10)].map((_, index) => (
                            <option key={index + 1} value={index + 1}>
                                {index + 1}
                            </option>
                        ))}
                    </select>
                    <button type="button" onClick={removeItem} disabled={updating} className="btn btn-ghost !min-h-10 text-sm text-[#b42318]">
                        <Trash2 size={16} />
                        Remove
                    </button>
                </div>
            </div>
            <div className="text-left sm:text-right">
                <p className="text-xs font-bold uppercase tracking-widest text-[#66736d]">Line Total</p>
                <p className="mt-1 text-xl font-black text-[#0f766e]">{money(item.line_total || 0)}</p>
            </div>
        </article>
    );
};

export default Cart;