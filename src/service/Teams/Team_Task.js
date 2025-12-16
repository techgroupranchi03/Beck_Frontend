import axios from 'axios';
import BASE_URL from '../../config';

const getTeamToken = () => {
    return localStorage.getItem('team_token');
};

// get active task method "GET" API
export const getActiveTasks = async (filters = {}, searchText = "", page = 1) => {
    const token = getTeamToken();

    console.log("token:", token);
    try {

        // Build query parameters from filters
        const params = { page };
        if (filters.assigned_to) params.assigned_to = filters.assigned_to;
        if (filters.status) params.status = filters.status;
        if (filters.task_type) params.task_type = filters.task_type;
        if (searchText) params.search = searchText;
        const response = await axios.get(
            `${BASE_URL}/team/active-tasks`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                params: params,
            }
        );
        console.log('Active Tasks Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Team active tasks fetching error:', error);
        return Promise.reject(error.response?.data || { message: 'Active tasks fetching failed' });
    }
};


// get planner tasks method "GET" API
export const getPlannerTasks = async (filters = {}, searchText = "", page = 1,) => {
    const token = getTeamToken();
    try {
        // Build query parameters from filters
        const params = { page };
        if (filters.assigned_to) params.assigned_to = filters.assigned_to;
        if (filters.status) params.status = filters.status;
        if (filters.task_type) params.task_type = filters.task_type;
        if (searchText) params.search = searchText;
        const response = await axios.get(
            `${BASE_URL}/team/tasks-planner`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                params: params,
            }
        );
        console.log('Planner Tasks Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Team planner tasks fetching error:', error);
        return Promise.reject(error.response?.data || { message: 'Planner tasks fetching failed' });
    }
}


// update task method "PUT" API
export const updateTeamTask = async (taskId, taskData) => {
    const token = getTeamToken();
    try {
        const response = await axios.put(
            `${BASE_URL}/team/tasks/${taskId}`,
            taskData,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Team task update error:', error);
        return Promise.reject(error.response?.data || { message: 'Task update failed' });
    }
}


// create task method "post" API
export const createTeamTask = async (taskData) => {
    const token = getTeamToken();
    try {
        const response = await axios.post(
            `${BASE_URL}/team/tasks`,
            taskData,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Team task creation error:', error);
        return Promise.reject(error.response?.data || { message: 'Task creation failed' });
    }
};

// get team members method "GET" API
export const getTeamsTeamMembers = async () => {
    const token = getTeamToken();
    try {
        const response = await axios.get(
            `${BASE_URL}/team/members`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        console.log('Team Members Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Team members fetching error:', error);
        return Promise.reject(error.response?.data || { message: 'Fetching team members failed' });
    }
};


// get Inventory items method "GET" API
export const getTeamsInventoryItems = async () => {
    const token = getTeamToken();
    try {
        const response = await axios.get(
            `${BASE_URL}/team/inventory-items`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Team inventory items fetching error:', error);
        return Promise.reject(error.response?.data || { message: 'Fetching inventory items failed' });
    }
};