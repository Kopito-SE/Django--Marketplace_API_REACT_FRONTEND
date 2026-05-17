import { createContext, useContext, useState, useEffect } from 'react';
import { getCart } from '../api/cartApi';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [itemCount, setItemCount] = useState(0);

    const fetchCartCount = async () => {
        try {
            const data = await getCart();
            const count = data?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
            setItemCount(count);
        } catch (error) {
            console.error('Failed to fetch cart:', error);
        }
    };

    useEffect(() => {
        fetchCartCount();
    }, []);

    return (
        <CartContext.Provider value={{ itemCount, fetchCartCount }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);