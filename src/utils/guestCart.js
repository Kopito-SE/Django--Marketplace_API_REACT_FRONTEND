const GUEST_CART_KEY = 'guest_cart';
const PENDING_MERGE_KEY = 'pending_merge_cart';

export const getGuestCart = () => {
    const saved = localStorage.getItem(GUEST_CART_KEY);
    if (!saved) {
        return { items: [], total: 0 };
    }
    try {
        const cart = JSON.parse(saved);
        cart.total = cart.items.reduce((sum, item) => sum + (item.line_total || 0), 0);
        return cart;
    } catch (e) {
        return { items: [], total: 0 };
    }
};

export const saveGuestCart = (cart) => {
    cart.total = cart.items.reduce((sum, item) => sum + (item.line_total || 0), 0);
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
    // Dispatch storage event to notify other components
    window.dispatchEvent(new Event('storage'));
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
            id: Date.now(),
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
    window.dispatchEvent(new Event('storage'));
    return { items: [], total: 0 };
};

// NEW: Save guest cart for merging after login


// NEW: Clear pending merge cart
export const clearPendingMergeCart = () => {
    localStorage.removeItem(PENDING_MERGE_KEY);
};
// src/utils/guestCart.js

// Update the saveGuestCartForMerge function
export const saveGuestCartForMerge = (items) => {
    if (!items || items.length === 0) return;
    
    // Ensure each item has the correct format
    const formattedItems = items.map(item => ({
        product_id: parseInt(item.product_id || item.product?.id),
        quantity: parseInt(item.quantity)
    }));
    
    const mergeData = {
        items: formattedItems,
        timestamp: Date.now()
    };
    localStorage.setItem(PENDING_MERGE_KEY, JSON.stringify(mergeData));
    
    console.log('Saved cart for merge:', mergeData); // Debug log
};

// Update getPendingMergeCart to ensure proper format
export const getPendingMergeCart = () => {
    const pending = localStorage.getItem(PENDING_MERGE_KEY);
    if (!pending) return null;
    
    try {
        const data = JSON.parse(pending);
        // Clear if older than 1 hour
        if (Date.now() - data.timestamp > 3600000) {
            localStorage.removeItem(PENDING_MERGE_KEY);
            return null;
        }
        
        // Ensure items are properly formatted
        const formattedItems = data.items.map(item => ({
            product_id: parseInt(item.product_id),
            quantity: parseInt(item.quantity)
        }));
        
        console.log('Retrieved pending merge cart:', formattedItems); // Debug log
        return formattedItems;
    } catch (e) {
        console.error('Error parsing pending merge cart:', e);
        return null;
    }
};
// Updated: This function now also checks for pending merges
export const mergeGuestCartWithUser = async (userId) => {
    const guestCart = getGuestCart();
    if (guestCart.items.length === 0) {
        return null;
    }
    clearGuestCart();
    return guestCart;
};