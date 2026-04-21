import axios from 'axios';
import BASE_URL from '../../config';

const getTeamToken = () => {
    return localStorage.getItem('team_token');
};

export const postSelectAccount = async (accountData) => {
    try {
        const response = await axios.post(`${BASE_URL}/team/auth/select-account`, accountData, {
            headers: {
                Authorization: `Bearer ${getTeamToken()}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error selecting account:', error);
        throw error;
    }
};

export const getAvailableTeamsAccounts = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/team/available-clients`, {
            headers: {
                Authorization: `Bearer ${getTeamToken()}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching available accounts:', error);
        throw error;
    }
};

export const switchTeamAccount = async (accountId) => {
    try {
        const response = await axios.post(
            `${BASE_URL}/team/switch-client`,
            { target_client_id: accountId },
            {
                headers: {
                    Authorization: `Bearer ${getTeamToken()}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error switching account:', error);
        throw error;
    }
};