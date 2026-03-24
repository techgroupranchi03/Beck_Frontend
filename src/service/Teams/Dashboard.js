import axios from 'axios';
import BASE_URL from '../../config.js';

const getTeamToken = () => localStorage.getItem('team_token');

const authHeaders = () => ({
    headers: { Authorization: `Bearer ${getTeamToken()}` }
});

export const getTeamDashboard = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/team/dashboard`, authHeaders());
        return response.data;
    } catch (error) {
        return Promise.reject(error.response?.data || { message: 'Failed to fetch dashboard' });
    }
};

// Supervisor paginated endpoints
export const getEscalatedTasks = async (page = 1, limit = 5) => {
    try {
        const response = await axios.get(`${BASE_URL}/team/dashboard/escalated-tasks?page=${page}&limit=${limit}`, authHeaders());
        return response.data;
    } catch (error) {
        return Promise.reject(error.response?.data || { message: 'Failed to fetch escalated tasks' });
    }
};

export const getDepletedInventory = async (page = 1, limit = 5) => {
    try {
        const response = await axios.get(`${BASE_URL}/team/dashboard/depleted-inventory?page=${page}&limit=${limit}`, authHeaders());
        return response.data;
    } catch (error) {
        return Promise.reject(error.response?.data || { message: 'Failed to fetch depleted inventory' });
    }
};

export const getLowStockInventory = async (page = 1, limit = 5) => {
    try {
        const response = await axios.get(`${BASE_URL}/team/dashboard/low-stock?page=${page}&limit=${limit}`, authHeaders());
        return response.data;
    } catch (error) {
        return Promise.reject(error.response?.data || { message: 'Failed to fetch low stock inventory' });
    }
};

export const getNewInventory = async (page = 1, limit = 5) => {
    try {
        const response = await axios.get(`${BASE_URL}/team/dashboard/new-inventory?page=${page}&limit=${limit}`, authHeaders());
        return response.data;
    } catch (error) {
        return Promise.reject(error.response?.data || { message: 'Failed to fetch new inventory' });
    }
};

// Staff paginated endpoints
export const getStaffTodayTasks = async (page = 1, limit = 5) => {
    try {
        const response = await axios.get(`${BASE_URL}/team/dashboard/today-tasks?page=${page}&limit=${limit}`, authHeaders());
        return response.data;
    } catch (error) {
        return Promise.reject(error.response?.data || { message: 'Failed to fetch today tasks' });
    }
};

export const getStaffPendingTasks = async (page = 1, limit = 5) => {
    try {
        const response = await axios.get(`${BASE_URL}/team/dashboard/pending-tasks?page=${page}&limit=${limit}`, authHeaders());
        return response.data;
    } catch (error) {
        return Promise.reject(error.response?.data || { message: 'Failed to fetch pending tasks' });
    }
};
