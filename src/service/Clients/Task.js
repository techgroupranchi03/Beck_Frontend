import axios from "axios";
import BASE_URL from "../../config";

const getClientToken = () => {
    return localStorage.getItem('client_token');
};

export const getClientTasks = async (filters = {}, searchText = "", page = 1) => {
    const token = getClientToken();
    try {
        const params = { page };
        if (filters.assigned_to) params.assigned_to = filters.assigned_to;
        if (filters.status) params.status = filters.status;
        if (filters.task_type) params.task_type = filters.task_type;
        if (filters.schedule_type) params.schedule_type = filters.schedule_type;
        if (searchText) params.search = searchText;

        const response = await axios.get(
            `${BASE_URL}/client/tasks-planner`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                params: params,
            }
        );
        return response.data;
    } catch (error) {
        console.error('Client tasks fetching error:', error);
        return Promise.reject(error.response?.data || { message: 'Fetching tasks failed' });
    }
};

export const createClientTask = async (taskData) => {
    const token = getClientToken();
    console.log('Creating task with data:', taskData);
    try {
        const response = await axios.post(
            `${BASE_URL}/client/tasks-planner`,
            taskData,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Client task creation error:', error);
        return Promise.reject(error.response?.data || { message: 'Task creation failed' });
    }
};

export const createClientActiveTask = async (taskData) => {
    const token = getClientToken();
    try {
        const response = await axios.post(
            `${BASE_URL}/client/tasks-instances`,
            taskData,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Client active task creation error:', error);
        return Promise.reject(error.response?.data || { message: 'Active task creation failed' });
    }
};

export const updateTaskPlanner = async (taskId, taskData) => {
    const token = getClientToken();
    try {
        const response = await axios.put(
            `${BASE_URL}/client/tasks-planner/${taskId}`,
            taskData,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Client task update error:', error);
        return Promise.reject(error.response?.data || { message: 'Task update failed' });
    }
};

export const updateActiveTask = async (taskId, taskData) => {
    const token = getClientToken();
    try {
        const response = await axios.put(
            `${BASE_URL}/client/tasks-instances/${taskId}`,
            taskData,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Client task update error:', error);
        return Promise.reject(error.response?.data || { message: 'Task update failed' });
    }
};

export const deleteOneTime = async (taskId) => {
    const token = getClientToken();
    try {
        const response = await axios.delete(
            `${BASE_URL}/client/task-instances/${taskId}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('One-time task deletion error:', error);
        return Promise.reject(error.response?.data || { message: 'One-time task deletion failed' });
    }
};

export const deleteRecurring = async (taskId) => {
    const token = getClientToken();
    try {
        const response = await axios.delete(
            `${BASE_URL}/client/tasks-planner/${taskId}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Recurring task deletion error:', error);
        return Promise.reject(error.response?.data || { message: 'Recurring task deletion failed' });
    }
};

export const getClientActiveTasks = async (filters = {}, searchText = "", page = 1) => {
    const token = getClientToken();
    try {
        const params = { page };
        if (filters.assigned_to) params.assigned_to = filters.assigned_to;
        if (filters.status) params.status = filters.status;
        if (filters.task_type) params.task_type = filters.task_type;
        if (filters.schedule_type) params.schedule_type = filters.schedule_type;
        if (searchText) params.search = searchText;

        const response = await axios.get(
            `${BASE_URL}/client/tasks-instances`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                params: params,
            }
        );
        return response.data;
    } catch (error) {
        console.error('Client active tasks fetching error:', error);
        return Promise.reject(error.response?.data || { message: 'Fetching active tasks failed' });
    }
};

export const updateClientActiveTaskStatus = async (taskInstanceId, status) => {
    const token = getClientToken();
    try {
        const response = await axios.put(
            `${BASE_URL}/client/tasks-instances/${taskInstanceId}`,
            { status },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Client active task status update error:', error);
        return Promise.reject(error.response?.data || { message: 'Active task status update failed' });
    }
}

export const getTaskTeamMembers = async () => {
    const token = getClientToken();
    try {
        const response = await axios.get(
            `${BASE_URL}/client/team`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Task team members fetching error:', error);
        return Promise.reject(error.response?.data || { message: 'Fetching task team members failed' });
    }
};

export const getInventoryByPropertyId = async (propertyId) => {
    const token = getClientToken();
    try {
        const response = await axios.get(
            `${BASE_URL}/client/inventory/property/${propertyId}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Inventory fetching error:', error);
        return Promise.reject(error.response?.data || { message: 'Fetching inventory failed' });
    }
};

export const getAllClientTasks = async (filters = {}, searchText = "", page = 1) => {
    const token = getClientToken();
    try {
        const params = { page };
        if (filters.assigned_to) params.assigned_to = filters.assigned_to;
        if(filters.property_id) params.property_id = filters.property_id;
        if (filters.status) params.status = filters.status;
        if (searchText) params.search = searchText;

        const response = await axios.get(
            `${BASE_URL}/client/all-tasks`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                params: params,
            }
        );
        console.log('All Client tasks response:', response.data);
        return response.data;
    } catch (error) {
        console.error('All client tasks fetching error:', error);
        return Promise.reject(error.response?.data || { message: 'Fetching all tasks failed' });
    }
};

export const updateClientTaskStatusCompleted = async (taskId, formData) => {

    const token = getClientToken();
    try {
        const response = await axios.put(
            `${BASE_URL}/client/tasks-instances/${taskId}`,
            formData,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Client task completion status update error:', error);
        return Promise.reject(error.response?.data)
    }
};