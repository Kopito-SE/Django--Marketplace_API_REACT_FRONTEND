import axiosInstance from './axiosConfig';

export const initiatePayment = async (paymentData) => {
    const response = await axiosInstance.post('/payments/pay/', paymentData);
    return response.data;
};

export const checkPaymentStatus = async (checkoutRequestID) => {
    const response = await axiosInstance.get(`/payments/status/${checkoutRequestID}/`);
    return response.data;
};
