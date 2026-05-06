import axiosInstance from './axiosConfig';


export const getProducts = async (params = {}) => {
    const response = await axiosInstance.get('/products/', {
        params: params, // 🔥 THIS is the fix
    });
    return response.data;
};

export const getProductDetails = async (id) => {
    const response = await axiosInstance.get(`/products/${id}/`);
    return response.data;
};

export const createProduct = async (productData) => {
    const response = await axiosInstance.post('/products/create/', productData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
};

export const getCategories = async () => {

    const response = await axiosInstance.get('/products/categories/');
    return response.data;

}