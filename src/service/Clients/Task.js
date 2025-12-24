import axios from "axios";
import BASE_URL from "../../config";

const getClientToken = () => {
    return localStorage.getItem('client_token');
};

// get all task method "GET" API
export const getClientTasks = async (filters = {}, searchText = "", page = 1) => {
    const token = getClientToken();
    try {
        // Build query parameters from filters
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
        // console.log('Client tasks response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Client tasks fetching error:', error);
        return Promise.reject(error.response?.data || { message: 'Fetching tasks failed' });
    }
};

// create task method "POST" API
export const createClientTask = async (taskData) => {
    const token = getClientToken();
    //console.log('Creating task with data:', taskData);
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

// create active task method "POST" API
export const createClientActiveTask = async (taskData) => {
    const token = getClientToken();
    //console.log('Creating active task with data:', taskData);
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

// update task method "PUT" API
export const updateTaskPlanner = async (taskId, taskData) => {
    // console.log('Updating task with ID:', taskId, 'Data:', taskData);
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

// update active task method "PUT" API
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

// delete task based on the one time and recurring method "DELETE" API
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

// delete recurring task 
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





// get active tasks method "GET" API
export const getClientActiveTasks = async (filters = {}, searchText = "", page = 1) => {
    const token = getClientToken();
    try {
        // Build query parameters from filters
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
        // console.log('Client active tasks response:', response.data);
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

// get teammber in task methods "GET" API
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






// new api added

// get inventory by property id method "GET" API
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


// get all task 
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
        return response.data;
    } catch (error) {
        console.error('All client tasks fetching error:', error);
        return Promise.reject(error.response?.data || { message: 'Fetching all tasks failed' });
    }
};