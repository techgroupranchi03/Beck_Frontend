import axios from "axios";
import BASE_URL from "../../config";

const getClientToken = () => {
    return localStorage.getItem('client_token');
};

// get all task method "GET" API
export const getClientTasks = async () => {
    const token = getClientToken();
    try {
        const response = await axios.get(
            `${BASE_URL}/client/tasks-planner`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        console.log('Client tasks response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Client tasks fetching error:', error);
        return Promise.reject(error.response?.data || { message: 'Fetching tasks failed' });
    }
};

// create task method "POST" API
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

// update task method "PUT" API
export const updateClientTask = async (taskId, taskData) => {
    console.log('Updating task with ID:', taskId, 'Data:', taskData);
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

// delete task method "DELETE" API
export const deleteClientTask = async (taskId) => {
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
        console.error('Client task deletion error:', error);
        return Promise.reject(error.response?.data || { message: 'Task deletion failed' });
    }
};



// get active tasks method "GET" API
export const getClientActiveTasks = async () => {
    const token = getClientToken();
    try {
        const response = await axios.get(
            `${BASE_URL}/client/tasks-instances`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        console.log('Client active tasks response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Client active tasks fetching error:', error);
        return Promise.reject(error.response?.data || { message: 'Fetching active tasks failed' });
    }
};


// Active task staus update method "PUT" API
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