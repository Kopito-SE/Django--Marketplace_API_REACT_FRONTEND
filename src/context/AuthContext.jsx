import { useState } from 'react';
import { login as apiLogin, register, verifyOTP, resendOTP, logout } from '../api/authApi';
import { AuthContext } from './AuthContextObject';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('access_token'));

    const login = async (email, password) => {
        const response = await apiLogin(email, password);
        setToken(response.access);
        setUser(response.user || null);
        return response;
    };

    const registerUser = async (userData) => {
        return await register(userData);
    };

    const verifyUser = async (email, otp) => {
        return await verifyOTP(email, otp);
    };

    const resendVerification = async (email) => {
        return await resendOTP(email);
    };

    const logoutUser = () => {
        logout();
        setToken(null);
        setUser(null);
    };

    const value = {
        user,
        login,
        register: registerUser,
        verify: verifyUser,
        resendOTP: resendVerification,
        logout: logoutUser,
        isAuthenticated: !!token,
        loading: false,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
