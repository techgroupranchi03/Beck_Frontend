import axios from 'axios';
import BASE_URL from '../../config';

const getTeamsToken = () => {
    return localStorage.getItem('teams_token');
};

export const teamsSendOtp = async (credentials) => {
    try {
        const response = await axios.post(
            `${BASE_URL}/team/auth/login`,
            credentials
        );
        return response.data;
    } catch (error) {
        console.error('Teams OTP sending error:', error);
        return Promise.reject(error.response?.data || { message: 'OTP sending failed' });
    }
};

export const verifyOtp = async (credentials) => {
    try {
        const response = await axios.post(
            `${BASE_URL}/team/auth/verify-otp`,
            credentials
        );
        return response.data;
    } catch (error) {
        console.error('Teams OTP verification error:', error);
        return Promise.reject(error.response?.data || { message: 'OTP verification failed' });
    }
};

export const teamsLogout = async () => {
    const token = getTeamsToken();
    try {
        const response = await axios.post(
            `${BASE_URL}/team/auth/logout`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        localStorage.removeItem('teams_token');
        return response.data;
    } catch (error) {
        return Promise.reject(error.response?.data || { message: 'Logout failed' });
    }
};
