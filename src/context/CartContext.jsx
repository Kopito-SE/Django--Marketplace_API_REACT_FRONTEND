// src/context/CartContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getCart } from '../api/cartApi';
import { getGuestCart } from '../utils/guestCart';
import { useAuth } from '../hooks/useAuth';

const CartContext = createContext();

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }) => {
    const [itemCount, setItemCount] = useState(0);
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(false);
    const { isAuthenticated } = useAuth();

    const fetchCartCount = useCallback(async () => {
        setLoading(true);
        try {
            if (isAuthenticated) {
                const data = await getCart();
                setCart(data);
                const count = data?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
                setItemCount(count);
            } else {
                const guestCart = getGuestCart();
                setCart(guestCart);
                const count = guestCart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
                setItemCount(count);
            }
        } catch (error) {
            console.error('Failed to fetch cart:', error);
            const guestCart = getGuestCart();
            const count = guestCart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
            setItemCount(count);
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        fetchCartCount();
    }, [fetchCartCount]);

    useEffect(() => {
        const handleStorageChange = () => {
            if (!isAuthenticated) {
                const guestCart = getGuestCart();
                const count = guestCart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
                setItemCount(count);
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [isAuthenticated]);

    const refreshCart = useCallback(() => {
        fetchCartCount();
    }, [fetchCartCount]);

    return (
        <CartContext.Provider value={{ itemCount, cart, loading, refreshCart }}>
            {children}
        </CartContext.Provider>
    );
};