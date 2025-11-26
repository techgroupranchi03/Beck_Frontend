import axios from "axios";
import BASE_URL from "../../config";

// get client token
const getClientToken = () => {
    return localStorage.getItem("client_token");
};

// get units and quantity 
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

// get inventory items
export const getInventoryItems = async () => {
    const token = getClientToken();
    try {
        const response = await axios.get(
            `${BASE_URL}/client/inventory`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        // console.log("Inventory items response:", response.data);
        return response.data;
    } catch (error) {
        console.error("Inventory items fetching error:", error);
        return Promise.reject(error.response?.data || { message: "Fetching inventory items failed" });
    }
};

// create inventory item
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
        //console.log("Create inventory response:", response.data);
        return response.data;
    } catch (error) {
        console.error("Create inventory error:", error);
        return Promise.reject(error.response?.data || { message: "Creating inventory item failed" });
    }
};

// update inventory item
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
        //console.log("Update inventory response:", response.data);
        return response.data;
    } catch (error) {
        console.error("Update inventory error:", error);
        return Promise.reject(error.response?.data || { message: "Updating inventory item failed" });
    }
};

// get inventory by id 
export const getInventoryById = async (id) => {
    console.log("Fetching inventory item with ID:", id);
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

// delete inventory item
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
        //console.log("Delete inventory response:", response.data);
        return response.data;
    } catch (error) {
        console.error("Delete inventory error:", error);
        return Promise.reject(error.response?.data || { message: "Deleting inventory item failed" });
    }
};