import axios from 'axios';
import BASE_URL from '../../config.js';

const getAdminToken = () => localStorage.getItem('admin_token');

export const getAdminDashboard = async () => {
    const token = getAdminToken();
    try {
        const response = await axios.get(`${BASE_URL}/admin/dashboard`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        return Promise.reject(error.response?.data || { message: 'Failed to fetch dashboard' });
    }
};
