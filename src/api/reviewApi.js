import axiosInstance from './axiosConfig';

export const getProductReviews = async (productId) => {
    const response = await axiosInstance.get(`/reviews/${productId}/`);
    return response.data;
};

export const createReview = async (productId, reviewData) => {
    const response = await axiosInstance.post(`/reviews/${productId}/create/`, reviewData);
    return response.data;
};