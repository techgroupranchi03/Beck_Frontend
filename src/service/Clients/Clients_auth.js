import axios from 'axios';
import BASE_URL from '../../config.js';

const getClientToken = () => {
    return localStorage.getItem('client_token');
};

export const clientSendOtp = async (credentials) => {
    try {
        const response = await axios.post(
            `${BASE_URL}/client/auth/login`,
            credentials
        );
        return response.data;
    } catch (error) {
        console.error('Client OTP sending error:', error);
        return Promise.reject(error.response?.data || { message: 'OTP sending failed' });
    }
};

export const verfiyOtp = async (credentials) => {
    try {
        const response = await axios.post(
            `${BASE_URL}/client/auth/verify-otp`,
            credentials
        );
        console.log('Client OTP verification response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Client OTP verification error:', error);
        return Promise.reject(error.response?.data || { message: 'OTP verification failed' });
    }
};

export const clientLogout = async () => {
    const token = getClientToken();
    try {
        const response = await axios.post(
            `${BASE_URL}/client/auth/logout`,
            {
                headers: {
                    token: `Bearer ${token}`,
                },
            }
        );
        localStorage.removeItem('client_token');
        return response.data;
    } catch (error) {
        return Promise.reject(error.response?.data || { message: 'Logout failed' });
    }
};

