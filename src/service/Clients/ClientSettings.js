import axios from "axios";
import BASE_URL from "../../config";

const getClientToken = () => {
    return localStorage.getItem("client_token");
};

/**
 * Get client settings/profile
 */
export const getClientSettings = async () => {
    const token = getClientToken();
    try {
        const response = await axios.get(`${BASE_URL}/client/settings`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    } catch (error) {
        console.error("Get client settings error:", error);
        return Promise.reject(error.response?.data || { message: "Failed to fetch settings" });
    }
};

/**
 * Update client settings
 * @param {Object} data - { name, phone, purchase_order_assignee }
 */
export const updateClientSettings = async (data) => {
    const token = getClientToken();
    try {
        const response = await axios.put(`${BASE_URL}/client/settings`, data, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    } catch (error) {
        console.error("Update client settings error:", error);
        return Promise.reject(error.response?.data || { message: "Failed to update settings" });
    }
};
