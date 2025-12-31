import axios from "axios";
import BASE_URL from "../../config";

const getClientToken = () => {
    return localStorage.getItem("client_token");
};

export const getUnitsAndQuantities = async () => {
    const token = getClientToken();
    try {
        const response = await axios.get(
            `${BASE_URL}/client/inventory/field-options`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        
        return response.data;
    } catch (error) {
        console.error("Units and quantities fetching error:", error);
        return Promise.reject(error.response?.data || { message: "Fetching units and quantities failed" });
    }
};

export const getInventoryItems = async (filters = {}, searchText = "" , page = 1) => {
    const token = getClientToken();
    try {
        const params = { page };
        if (filters.category) params.category = filters.category;
        if (filters.property_id) params.property_id = filters.property_id;
        if (filters.unit) params.unit = filters.unit;
        if (filters.quantity) params.quantity = filters.quantity;
        if (filters.lower_limit) params.lower_limit = filters.lower_limit;
        if (filters.located_at) params.located_at = filters.located_at;
        if (searchText) params.search = searchText;

        const response = await axios.get(
            `${BASE_URL}/client/inventory`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                params: params,
            }
        );
        return response.data;
    } catch (error) {
        console.error("Inventory items fetching error:", error);
        return Promise.reject(error.response?.data || { message: "Fetching inventory items failed" });
    }
};

export const createInventoryItem = async (data) => {
    const token = getClientToken();
    try {
        const response = await axios.post(
            `${BASE_URL}/client/inventory`,
            data,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return response;
    } catch (error) {
        console.error("Create inventory error:", error);
        return Promise.reject(error.response?.data || { message: "Creating inventory item failed" });
    }
};

export const updateInventoryItem = async (id, data) => {
    const token = getClientToken();
    try {
        const response = await axios.put(
            `${BASE_URL}/client/inventory/${id}`,
            data,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error("Update inventory error:", error);
        return Promise.reject(error.response?.data || { message: "Updating inventory item failed" });
    }
};

export const getInventoryById = async (id) => {
    const token = getClientToken();
    try {
        const response = await axios.get(
            `${BASE_URL}/client/inventory/${id}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error("Get inventory by ID error:", error);
        return Promise.reject(error.response?.data || { message: "Fetching inventory item failed" });
    }
};

export const deleteInventoryItem = async (id) => {
    const token = getClientToken();
    try {
        const response = await axios.delete(
            `${BASE_URL}/client/inventory/${id}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.log("Delete inventory error:", error);
        return Promise.reject(error.response?.data);
    }
};