import axios from 'axios';
import BASE_URL from '../../config';

const getTeamToken = () => {
    return localStorage.getItem('team_token');
};

export const getTeamProperties = async (page) => {
    const token = getTeamToken();
    try {
        const response = await axios.get(
            `${BASE_URL}/team/properties?page=${page}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Team properties fetching error:', error);
        return Promise.reject(error.response?.data || { message: 'Fetching properties failed' });
    }
};

export const createTeamProperty = async (propertyData) => {
    const token = getTeamToken();
    try {
        const response = await axios.post(
            `${BASE_URL}/team/properties`,
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
        console.error('Create team property error:', error);
        return Promise.reject(error.response?.data || { message: 'Creating property failed' });
    }
};

export const updateTeamProperty = async (propertyId, propertyData) => {
    const token = getTeamToken();
    try {
        const response = await axios.put(
            `${BASE_URL}/team/properties/${propertyId}`,
            propertyData,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Update team property error:', error);
        return Promise.reject(error.response?.data || { message: 'Updating property failed' });
    }
};

export const deleteTeamProperty = async (propertyId) => {
    const token = getTeamToken();
    try {
        const response = await axios.delete(
            `${BASE_URL}/team/properties/${propertyId}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Delete team property error:', error);
        return Promise.reject(error.response?.data || { message: 'Deleting property failed' });
    }
};


