import axios from 'axios';
import BASE_URL from '../../config.js';

const getClientToken = () => {
    return localStorage.getItem('client_token');
};

// client/properties  method "GET" API
export const getClientProperties = async (page) => {
    console.log("Fetching client properties, page:", page);
    const token = getClientToken();
    try {
        const response = await axios.get(
            `${BASE_URL}/client/properties?page=${page}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        console.log('Client properties response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Client properties fetching error:', error);
        return Promise.reject(error.response?.data || { message: 'Fetching properties failed' });
    }
}

// create property method "POST" API
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
       // console.log('Create property response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Create property error:', error);
        return Promise.reject(error.response?.data || { message: 'Creating property failed' });
    }
};

// update property method "PUT" API
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
        //console.log('Update property response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Update property error:', error);
        return Promise.reject(error.response?.data || { message: 'Updating property failed' });
    }
};

// delete property method "DELETE" API
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
        //console.log('Delete property response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Delete property error:', error);
        return Promise.reject(error.response?.data || { message: 'Deleting property failed' });
    }
};