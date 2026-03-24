import axios from "axios";
import BASE_URL from "../../config";

const getToken = () => {
    return localStorage.getItem('team_token');
};


export const fetchTeamsTheme = async () => {
    const token = getToken();
    try {
        const response = await axios.get(
            `${BASE_URL}/team/themes`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        //console.log('Fetch team theme response:', response.data);
        return response.data;

    } catch (error) {
        console.error('Fetch team theme error:', error);
        return Promise.reject(error.response?.data || { message: 'Fetching theme failed' });
    }
};


export const switchTeamTheme = async (light_theme_id, dark_theme_id) => {
    const token = getToken();
    try {
        const response = await axios.put(
            `${BASE_URL}/team/themes/select`,
            { light_theme_id, dark_theme_id },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Switch team theme error:', error);
        return Promise.reject(error.response?.data || { message: 'Switching theme failed' });
    }
};

export const getTeamCustomThemes = async () => {
    const token = getToken();
    try {
        const response = await axios.get(
            `${BASE_URL}/team/themes/custom`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Fetch team custom themes error:', error);
        return Promise.reject(error.response?.data || { message: 'Fetching custom themes failed' });
    }
};


export const CreateTeamCustomTheme = async (themeData) => {
    const token = getToken();
    try {
        const response = await axios.post(
            `${BASE_URL}/team/themes`,
            themeData,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Create team custom theme error:', error);
        return Promise.reject(error.response?.data || { message: 'Creating custom theme failed' });
    }
};


export const UpdateTeamCustomTheme = async (themeData) => {
    const token = getToken();
    try {
        const response = await axios.put(
            `${BASE_URL}/team/themes/${themeData.id}`,
            themeData,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Update team custom theme error:', error);
        return Promise.reject(error.response?.data || { message: 'Updating custom theme failed' });
    }
};


export const DeleteTeamCustomTheme = async (themeId, themeName) => {
    const token = getToken();
    try {
        const response = await axios.delete(
            `${BASE_URL}/team/themes/${themeId}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                data: { theme_name: themeName }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Delete team custom theme error:', error);
        return Promise.reject(error.response?.data || { message: 'Deleting custom theme failed' });
    }
};