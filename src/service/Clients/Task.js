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
            `${BASE_URL}/client/tasks`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        //console.log('Client tasks response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Client tasks fetching error:', error);
        return Promise.reject(error.response?.data || { message: 'Fetching tasks failed' });
    }
};

// create task method "POST" API
export const createClientTask = async (taskData) => {
    const token = getClientToken();
    try {
        const response = await axios.post(
            `${BASE_URL}/client/tasks`,
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
            `${BASE_URL}/client/tasks/${taskId}`,
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
            `${BASE_URL}/client/tasks/${taskId}`,
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