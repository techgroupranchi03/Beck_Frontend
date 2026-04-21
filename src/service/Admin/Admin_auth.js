import axios from 'axios';
import BASE_URL from '../../config.js';

const getAdminToken = () => {
    return localStorage.getItem('admin_token');
};

// Admin login API
export const adminLogin = async (credentials) => {
    try {
        const response = await axios.post(
            `${BASE_URL}/admin/auth/login`,
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
            `${BASE_URL}/admin/auth/logout`,
            {},
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

export const getAllClients = async (filters = {}, searchText = "", page = 1) => {
    const token = getAdminToken();
    try {
        
        const response = await axios.get(
            `${BASE_URL}/admin/clients`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        return Promise.reject(error.response?.data || { message: 'Failed to fetch clients' });
    }
};

export const addClient = async (clientData) => {
    const token = getAdminToken();
    try {
        const response = await axios.post(
            `${BASE_URL}/admin/clients`,
            clientData,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        return Promise.reject(error.response?.data || { message: 'Failed to add client' });
    }
};

export const getClientbyId = async (clientData) => {
    console.log("getClientbyId", clientData);
    const token = getAdminToken();
    try {
        const response = await axios.get(
            `${BASE_URL}/admin/clients/${clientData.id}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        return Promise.reject(error.response?.data || { message: 'Failed to update client' });
    }
};

export const editClient = async (clientData) => {
    const token = getAdminToken();
    try {
        const response = await axios.put(
            `${BASE_URL}/admin/clients/${clientData.id}`,
            clientData,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        return Promise.reject(error.response?.data || { message: 'Failed to update client' });
    }
};

export const deleteClient = async (clientData) => {
    const token = getAdminToken();
    try {
        const response = await axios.delete(
            `${BASE_URL}/admin/clients/${clientData.id}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        return Promise.reject(error.response?.data || { message: 'Failed to delete client' });
    }
};
