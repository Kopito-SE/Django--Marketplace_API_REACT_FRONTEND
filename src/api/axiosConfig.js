import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
});

// Request interceptor to add token
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        console.log('🔑 Token being sent:', token ? 'Yes' : 'NO TOKEN!');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Helper function to check if endpoint allows unauthenticated access
const isPublicEndpoint = (url) => {
    const publicPaths = [
        '/cart/',           // Get cart
        '/cart/add/',       // Add to cart
        '/cart/items/',     // Update/remove cart items
        '/cart/clear/',     // Clear cart
        '/products/',       // Product list
        '/products/',       // Product details (with ID)
        '/categories/',     // Categories
    ];
    
    return publicPaths.some(path => url.includes(path));
};

// Response interceptor to handle token refresh
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        const isPublic = isPublicEndpoint(originalRequest.url);
        
        // If it's a public endpoint and we get 401, just return the error without redirecting
        if (isPublic && error.response?.status === 401) {
            console.warn('Public endpoint returned 401 - this should not happen with AllowAny, but continuing anyway');
            // Return a mock response or just reject without redirecting
            return Promise.reject(error);
        }
        
        // For protected endpoints, try to refresh token
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const refreshToken = localStorage.getItem('refresh_token');
                if (!refreshToken) {
                    throw new Error('Missing refresh token');
                }
                const response = await axios.post(`${API_BASE_URL}/token/refresh/`, {
                    refresh: refreshToken
                });
                localStorage.setItem('access_token', response.data.access);
                originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
                return axiosInstance(originalRequest);
            } catch (refreshError) {
                // Only redirect to login for protected endpoints
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }
        
        return Promise.reject(error);
    }
);

export default axiosInstance;