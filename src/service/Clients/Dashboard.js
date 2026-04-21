import axios from 'axios';
import BASE_URL from '../../config.js';

const getClientToken = () => localStorage.getItem('client_token');

const authHeaders = () => ({
    headers: { Authorization: `Bearer ${getClientToken()}` }
});

export const getClientDashboard = async (days = 7) => {
    try {
        const response = await axios.get(`${BASE_URL}/client/dashboard?days=${days}`, authHeaders());
        return response.data;
    } catch (error) {
        return Promise.reject(error.response?.data || { message: 'Failed to fetch dashboard' });
    }
};

export const getEscalatedTasks = async (page = 1, limit = 5) => {
    try {
        const response = await axios.get(`${BASE_URL}/client/dashboard/escalated-tasks?page=${page}&limit=${limit}`, authHeaders());
        return response.data;
    } catch (error) {
        return Promise.reject(error.response?.data || { message: 'Failed to fetch escalated tasks' });
    }
};

export const getDepletedInventory = async (page = 1, limit = 5) => {
    try {
        const response = await axios.get(`${BASE_URL}/client/dashboard/depleted-inventory?page=${page}&limit=${limit}`, authHeaders());
        return response.data;
    } catch (error) {
        return Promise.reject(error.response?.data || { message: 'Failed to fetch depleted inventory' });
    }
};

export const getLowStockInventory = async (page = 1, limit = 5) => {
    try {
        const response = await axios.get(`${BASE_URL}/client/dashboard/low-stock?page=${page}&limit=${limit}`, authHeaders());
        return response.data;
    } catch (error) {
        return Promise.reject(error.response?.data || { message: 'Failed to fetch low stock inventory' });
    }
};

export const getNewInventory = async (page = 1, limit = 5) => {
    try {
        const response = await axios.get(`${BASE_URL}/client/dashboard/new-inventory?page=${page}&limit=${limit}`, authHeaders());
        return response.data;
    } catch (error) {
        return Promise.reject(error.response?.data || { message: 'Failed to fetch new inventory' });
    }
};
