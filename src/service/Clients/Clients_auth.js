import axios from 'axios';
import BASE_URL from '../../config.js';

const getClientToken = () => {
    return localStorage.getItem('client_token');
};

// Admin login API
export const clientLogin = async (credentials) => {
    try {
        const response = await axios.post(
            `${BASE_URL}/client/auth/login`,
            credentials);
            console.log('Client login response data:', response.data);
        return response.data;
    } catch (error) {
        console.error('Client login error:', error);
        return Promise.reject(error.response?.data || { message: 'Login failed' });
    }
};

// client logout API
export const clientLogout = async () => {
    const token = getAdminToken();
    try {
        const response = await axios.post(
            `${BASE_URL}/client/logout`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        localStorage.removeItem('client_token');
        return response.data;
    } catch (error) {
        return Promise.reject(error.response?.data || { message: 'Logout failed' });
    }
};