import axios from 'axios';
import BASE_URL from '../../config.js';

const getAdminToken = () => {
    return localStorage.getItem('admin_token');
};

// Admin login API
export const adminLogin = async (credentials) => {
    try {
        const response = await axios.post(
            `${BASE_URL}/auth/login`,
            credentials);
        return response.data;
    } catch (error) {
        return Promise.reject(error.response?.data || { message: 'Login failed' });
    }
};

// admin logout API
export const adminLogout = async () => {
    const token = getAdminToken();
    try {
        const response = await axios.post(
            `${BASE_URL}/admin/logout`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        localStorage.removeItem('admin_token');
        return response.data;
    } catch (error) {
        return Promise.reject(error.response?.data || { message: 'Logout failed' });
    }
};