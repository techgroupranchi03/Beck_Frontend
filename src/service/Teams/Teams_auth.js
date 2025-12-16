import axios from 'axios';
import BASE_URL from '../../config';

const getTeamsToken = () => {
    return localStorage.getItem('teams_token');
};

export const teamsSendOtp = async (credentials) => {
    try {
        const response = await axios.post(
            `${BASE_URL}/team/auth/login`,
            credentials
        );
        //console.log('send OTP response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Teams OTP sending error:', error);
        return Promise.reject(error.response?.data || { message: 'OTP sending failed' });
    }
};

// Teams verify OTP API
export const verifyOtp = async (credentials) => {
    try {
        const response = await axios.post(
            `${BASE_URL}/team/auth/verify-otp`,
            credentials
        );
    console.log('Teams OTP verification response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Teams OTP verification error:', error);
        return Promise.reject(error.response?.data || { message: 'OTP verification failed' });
    }
};

// Teams logout API
export const teamsLogout = async () => {
    const token = getTeamsToken();
    try {
        const response = await axios.post(
            `${BASE_URL}/team/auth/logout`,
            {
                headers: {
                    token: `Bearer ${token}`,
                },
            }
        );
        localStorage.removeItem('teams_token');
        return response.data;
    } catch (error) {
        return Promise.reject(error.response?.data || { message: 'Logout failed' });
    }
};
