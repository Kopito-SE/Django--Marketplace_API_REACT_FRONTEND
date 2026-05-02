import axiosInstance from './axiosConfig';

export const register = async (userData) => {
    const response = await axiosInstance.post('/auth/register/', userData);
    return response.data;
};

export const verifyOTP = async (email, code) => {
    // The backend expects 'code', not 'otp'
    const response = await axiosInstance.post('/auth/verify/', { 
        email: email, 
        code: code  // Changed from 'otp' to 'code'
    });
    return response.data;
};

export const resendOTP = async (email) => {
    const response = await axiosInstance.post('/auth/resend/', { email });
    return response.data;
};

export const login = async (email, password) => {
    const response = await axiosInstance.post('/auth/login/', { email, password });
    if (response.data.access) {
        localStorage.setItem('access_token', response.data.access);
        localStorage.setItem('refresh_token', response.data.refresh);
    }
    return response.data;
};

export const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('pending_verification_email');
};