import axios from "axios";
import BASE_URL from "../../config";

const getToken = () => {
    return localStorage.getItem('client_token');
};


export const fetchClientTheme = async () => {
    const token = getToken();
    try {
        const response = await axios.get(
            `${BASE_URL}/client/themes`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        //console.log('Fetch client theme response:', response.data);
        return response.data;

    } catch (error) {
        console.error('Fetch client theme error:', error);
        return Promise.reject(error.response?.data || { message: 'Fetching theme failed' });
    }
};


export const switchClientTheme = async (light_theme_id, dark_theme_id) => {
    const token = getToken();
    try {
        const response = await axios.put(
            `${BASE_URL}/client/themes/select`,
            { light_theme_id, dark_theme_id },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Switch client theme error:', error);
        return Promise.reject(error.response?.data || { message: 'Switching theme failed' });
    }
};

export const getClientCustomThemes = async () => {
    const token = getToken();
    try {
        const response = await axios.get(
            `${BASE_URL}/client/themes/custom`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Fetch client custom themes error:', error);
        return Promise.reject(error.response?.data || { message: 'Fetching custom themes failed' });
    }
};


export const CreateClientCustomTheme = async (themeData) => {
    const token = getToken();
    try {
        const response = await axios.post(
            `${BASE_URL}/client/themes`,
            themeData,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Create client custom theme error:', error);
        return Promise.reject(error.response?.data || { message: 'Creating custom theme failed' });
    }
};


export const UpdateClientCustomTheme = async (themeData) => {
    const token = getToken();
    try {
        const response = await axios.put(
            `${BASE_URL}/client/themes/${themeData.id}`,
            themeData,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Update client custom theme error:', error);
        return Promise.reject(error.response?.data || { message: 'Updating custom theme failed' });
    }
};


export const DeleteClientCustomTheme = async (themeId, themeName) => {
    const token = getToken();
    try {
        const response = await axios.delete(
            `${BASE_URL}/client/themes/${themeId}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                data: { theme_name: themeName }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Delete client custom theme error:', error);
        return Promise.reject(error.response?.data || { message: 'Deleting custom theme failed' });
    }
};