import axios from 'axios';
import BASE_URL from '../../config';

const getTeamToken = () => {
    return localStorage.getItem('team_token');
};

// post select account method "POST" API 
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