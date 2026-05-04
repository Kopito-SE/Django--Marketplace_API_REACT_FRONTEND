// api/categoryApi.js
import axiosInstance from './axiosConfig';

export const getCategories = async () => {
    const response = await axiosInstance.get('/products/categories/');
    return response.data; // This should return an array of category objects
};