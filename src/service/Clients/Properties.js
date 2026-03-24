import axios from 'axios';
import BASE_URL from '../../config.js';

const getClientToken = () => {
    return localStorage.getItem('client_token');
};

export const getClientProperties = async (page, search = '') => {
    const token = getClientToken();
    try {
        const response = await axios.get(
            `${BASE_URL}/client/properties?page=${page}&search=${encodeURIComponent(search)}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Client properties fetching error:', error);
        return Promise.reject(error.response?.data || { message: 'Fetching properties failed' });
    }
}

export const createClientProperty = async (propertyData) => {
    const token = getClientToken();
    try {
        const response = await axios.post(
            `${BASE_URL}/client/properties`,
            propertyData,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Create property error:', error);
        return Promise.reject(error.response?.data || { message: 'Creating property failed' });
    }
};

export const updateClientProperty = async (propertyId, propertyData) => {
    const token = getClientToken();
    try {
        const response = await axios.put(
            `${BASE_URL}/client/properties/${propertyId}`,
            propertyData,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Update property error:', error);
        return Promise.reject(error.response?.data || { message: 'Updating property failed' });
    }
};

export const deleteClientProperty = async (propertyId) => {
    const token = getClientToken();
    try {
        const response = await axios.delete(
            `${BASE_URL}/client/properties/${propertyId}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Delete property error:', error);
        return Promise.reject(error.response?.data || { message: 'Deleting property failed' });
    }
};