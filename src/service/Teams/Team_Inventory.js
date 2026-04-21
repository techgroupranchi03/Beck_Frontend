import axios from "axios";
import BASE_URL from "../../config";

const getTeamToken = () => {
    return localStorage.getItem("team_token");
};

export const getTeamInventoryItems = async (filters = {}, searchText = "", page = 1) => {
    const token = getTeamToken();
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
            `${BASE_URL}/team/inventory`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                params: params,
            }
        );
        console.log("Team Inventory items response:", response.data);
        return response.data;
    } catch (error) {
        console.error("Team Inventory items fetching error:", error);
        return Promise.reject(error.response?.data || { message: "Fetching team inventory items failed" });
    }
};

export const createTeamInventoryItem = async (itemData) => {
    const token = getTeamToken();
    try {
        const response = await axios.post(
            `${BASE_URL}/team/inventory`,
            itemData,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return response;
    } catch (error) {
        console.error("Creating team inventory item error:", error);
        return Promise.reject(error.response?.data || { message: "Creating team inventory item failed" });
    }
};

export const updateTeamInventoryItem = async (itemId, itemData) => {
    const token = getTeamToken();
    try {
        const response = await axios.put(
            `${BASE_URL}/team/inventory/${itemId}`,
            itemData,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error("Updating team inventory item error:", error);
        return Promise.reject(error.response?.data || { message: "Updating team inventory item failed" });
    }
};

export const getTeamInventoryById = async (id) => {
    const token = getTeamToken();
    try {
        const response = await axios.get(
            `${BASE_URL}/team/inventory/${id}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error("Get team inventory item by ID error:", error);
        return Promise.reject(error.response?.data || { message: "Fetching team inventory item failed" });
    }
};

export const deleteTeamInventoryItem = async (id) => {
    const token = getTeamToken();
    try {
        const response = await axios.delete(
            `${BASE_URL}/team/inventory/${id}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.log("Delete team inventory item error:", error);
        return Promise.reject(error.response?.data);
    }
};

export const getTeamInventoryFieldOptions = async () => {
    const token = getTeamToken();
    try {
        const response = await axios.get(
            `${BASE_URL}/team/inventory/field-options`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        return response.data;
    } catch (error) {
        console.error("Team inventory field options fetching error:", error);
        return Promise.reject(error.response?.data || { message: "Fetching team inventory field options failed" });
    }
};

// create one time and recurring task method "POST" API
// export const createTeamOneTimeAndRecurringTask = async (taskData) => {
//     const token = getTeamToken();
//     try {
//         const response = await axios.post(
//             `${BASE_URL}/team/tasks`,
//             taskData,
//             {
//                 headers: {
//                     Authorization: `Bearer ${token}`,
//                 },
//             }
//         );
//         return response.data;
//     } catch (error) {
//         console.error("Creating team one time and recurring task error:", error);
//         return Promise.reject(error.response?.data || { message: "Creating team one time and recurring task failed" });
//     }
// };

// create active task method "POST" API
// export const createTeamActiveTask = async (taskData) => {
//     const token = getTeamToken();
//     try {
//         const response = await axios.post(
//             `${BASE_URL}/team/active-tasks`,
//             taskData,
//             {
//                 headers: {
//                     Authorization: `Bearer ${token}`,
//                 },
//             }
//         );
//         return response.data;
//     } catch (error) {
//         console.error("Team active task creation error:", error);
//         return Promise.reject(error.response?.data || { message: "Team active task creation failed" });
//     }
// };

// update task planner data method "PUT" API
// export const updateTeamTaskPlannerData = async (taskId, taskData) => {
//     const token = getTeamToken();
//     try {
//         const response = await axios.put(
//             `${BASE_URL}/team/tasks/${taskId}`,
//             taskData,
//             {
//                 headers: {
//                     Authorization: `Bearer ${token}`,
//                 },
//             }
//         );
//         return response.data;
//     } catch (error) {
//         console.error("Updating team task planner data error:", error);
//         return Promise.reject(error.response?.data || { message: "Updating team task planner data failed" });
//     }
// };


// update active task data method "PUT" API
// export const updateTeamActiveTaskData = async (taskId, taskData) => {
//     const token = getTeamToken();
//     try {
//         const response = await axios.put(
//             `${BASE_URL}/team/active-tasks/${taskId}`,
//             taskData,
//             {
//                 headers: {
//                     Authorization: `Bearer ${token}`,
//                 },
//             }
//         );
//         return response.data;
//     } catch (error) {
//         console.error("Updating team active task data error:", error);
//         return Promise.reject(error.response?.data || { message: "Updating team active task data failed" });
//     }
// };