import axiosInstance from './axiosConfig';

export const getCart = async () => {
    const response = await axiosInstance.get('/cart/');
    return response.data;
};

export const addToCart = async (productId, quantity = 1) => {
    const response = await axiosInstance.post('/cart/add/', { product_id: productId, quantity });
    return response.data;
};

export const updateCartItem = async (itemId, quantity) => {
    const response = await axiosInstance.patch(`/cart/items/${itemId}/`, { quantity });
    return response.data;
};

export const removeFromCart = async (itemId) => {
    const response = await axiosInstance.delete(`/cart/items/${itemId}/`);
    return response.data;
};

export const checkout = async () => {
    const response = await axiosInstance.post('/cart/checkout/');
    return response.data;
};

export const getUserOrders = async () => {
    const response = await axiosInstance.get('/cart/orders/');
    return response.data;
};

export const getOrderDetails = async (orderId) => {
    const response = await axiosInstance.get(`/cart/orders/${orderId}/`);
    return response.data;
};

export const getVendorOrders = async () => {
    const response = await axiosInstance.get('/cart/vendor/orders/');
    return response.data;
};

export const updateOrderStatus = async (orderId, status) => {
    const response = await axiosInstance.patch(`/cart/vendor/orders/${orderId}/`, { status });
    return response.data;
};

export const getVendorStats = async () => {
    const response = await axiosInstance.get('/cart/vendor/stats/');
    return response.data;
};
