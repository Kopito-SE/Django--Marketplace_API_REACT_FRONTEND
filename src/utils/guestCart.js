// src/utils/guestCart.js
const GUEST_CART_KEY = 'guest_cart';

export const getGuestCart = () => {
    const saved = localStorage.getItem(GUEST_CART_KEY);
    if (!saved) {
        return { items: [], total: 0 };
    }
    try {
        const cart = JSON.parse(saved);
        // Recalculate total to ensure accuracy
        cart.total = cart.items.reduce((sum, item) => sum + (item.line_total || 0), 0);
        return cart;
    } catch (e) {
        return { items: [], total: 0 };
    }
};

export const saveGuestCart = (cart) => {
    // Recalculate total
    cart.total = cart.items.reduce((sum, item) => sum + (item.line_total || 0), 0);
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
    return cart;
};

export const addToGuestCart = (product, quantity) => {
    const cart = getGuestCart();
    const existingItem = cart.items.find(item => item.product_id === product.id);
    
    if (existingItem) {
        existingItem.quantity += quantity;
        existingItem.line_total = existingItem.product_price * existingItem.quantity;
    } else {
        cart.items.push({
            id: Date.now(), // temporary unique ID
            product_id: product.id,
            product_name: product.name,
            product_price: product.price,
            product_image: product.image,
            quantity: quantity,
            line_total: product.price * quantity
        });
    }
    
    saveGuestCart(cart);
    return cart;
};

export const removeFromGuestCart = (itemId) => {
    const cart = getGuestCart();
    cart.items = cart.items.filter(item => item.id !== itemId);
    saveGuestCart(cart);
    return cart;
};

export const updateGuestCartItem = (itemId, quantity) => {
    const cart = getGuestCart();
    const item = cart.items.find(item => item.id === itemId);
    if (item) {
        item.quantity = quantity;
        item.line_total = item.product_price * quantity;
        saveGuestCart(cart);
    }
    return cart;
};

export const clearGuestCart = () => {
    localStorage.removeItem(GUEST_CART_KEY);
    return { items: [], total: 0 };
};

export const mergeGuestCartWithUser = async (userId) => {
    const guestCart = getGuestCart();
    if (guestCart.items.length === 0) {
        return null;
    }
    
    // You can send this to your backend to merge
    // For now, just clear guest cart
    clearGuestCart();
    return guestCart;
};