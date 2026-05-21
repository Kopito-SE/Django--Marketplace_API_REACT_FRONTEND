
import axiosInstance from './axiosConfig';

export const getCategories = async () => {
    const response = await axiosInstance.get('/products/categories/');
    return response.data; 
};