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
    //console.log('Creating task with data:', taskData);
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

export const updateClientTask = async (taskId, taskData) => {
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

export const getAllClientTasks = async (filters = {}, searchText = "", page = 1, limit = 10) => {
    const token = getClientToken();
    try {
        const params = { page, limit };
        if (filters.assigned_to?.length) params.assigned_to = filters.assigned_to;
        if (filters.property_id) params.property_id = filters.property_id;
        // if (filters.status) params.status = filters.status;
        if (filters.schedule_type) params.schedule_type = filters.schedule_type;
        if (searchText) params.search = searchText;

        const response = await axios.get(
            `${BASE_URL}/client/tasks`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                params: params,
            }
        );
        //console.log('All Client tasks response:', response.data);
        return response.data;
    } catch (error) {
        console.error('All client tasks fetching error:', error);
        return Promise.reject(error.response?.data || { message: 'Fetching all tasks failed' });
    }
};

export const updateClientTaskStatus = async (occurrenceId, status) => {
    const token = getClientToken();
    try {
        const response = await axios.put(
            `${BASE_URL}/client/tasks/occurrences/${occurrenceId}`,
            { status },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Client task completion status update error:', error);
        return Promise.reject(error.response?.data)
    }
};

export const addClientConfirmationTaskImage = async (occurrenceId, formData) => {
    const token = getClientToken();
    try {
        const response = await axios.post(
            `${BASE_URL}/client/tasks/occurrences/${occurrenceId}/complete`,
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
        console.error('Client task update error:', error);
        return Promise.reject(error.response?.data);
    }
};

export const updateClientConfirmationTaskImage = async (occurrenceId, formData) => {
    const token = getClientToken();
    try {
        const response = await axios.put(
            `${BASE_URL}/client/tasks/occurrences/${occurrenceId}/proof`,
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
        console.error('Client task update error:', error);
        return Promise.reject(error.response?.data);
    }
};

export const getClientGroupTasksById = async (groupTaskId, page = 1, limit = 3) => {
    const token = getClientToken();
    try {
        const params = { page, limit };
        const response = await axios.get(
            `${BASE_URL}/client/task-groups/${groupTaskId}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                params: params,
            }
        );
        return response.data;
    } catch (error) {
        console.error('Client group task fetching error:', error);
        return Promise.reject(error.response?.data || { message: 'Fetching group task failed' });
    }
};

export const createClientGroupTask = async (groupTaskData) => {
    const token = getClientToken();
    // console.log('Creating group task with data:', groupTaskData);
    try {
        const response = await axios.post(
            `${BASE_URL}/client/task-groups`,
            groupTaskData,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Client group task creation error:', error);
        return Promise.reject(error.response?.data || { message: 'Group task creation failed' });
    }
};

export const updateClientGroupTask = async (groupTaskId, groupTaskData) => {
    const token = getClientToken();
    try {
        const response = await axios.put(
            `${BASE_URL}/client/task-groups/${groupTaskId}`,
            groupTaskData,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Client group task update error:', error);
        return Promise.reject(error.response?.data || { message: 'Group task update failed' });
    }
};

export const deleteClientGroupTask = async (groupTaskId) => {
    const token = getClientToken();
    try {
        const response = await axios.delete(
            `${BASE_URL}/client/task-groups/${groupTaskId}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Client group task deletion error:', error);
        return Promise.reject(error.response?.data || { message: 'Group task deletion failed' });
    }
};

export const createClientSubGroupTask = async (groupId, subGroupTaskData) => {
    const token = getClientToken();
    // console.log('Creating sub-group task with data:', groupId, subGroupTaskData);
    try {
        const response = await axios.post(
            `${BASE_URL}/client/task-groups/${groupId}/tasks`,

            subGroupTaskData,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Client sub-group task creation error:', error);
        return Promise.reject(error.response?.data || { message: 'Sub-group task creation failed' });
    }
};

export const updateClientSubGroupTask = async (groupId, groupTaskId, formData) => {
    const token = getClientToken();
    try {
        const response = await axios.put(
            `${BASE_URL}/client/task-groups/${groupId}/tasks/${groupTaskId}`,
            formData,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Client sub-group task update error:', error);
        return Promise.reject(error.response?.data || { message: 'Sub-group task update failed' });
    }
};

export const deleteClientSubGroupTask = async (groupId, subGroupTaskId) => {
    const token = getClientToken();
    try {
        const response = await axios.delete(
            `${BASE_URL}/client/task-groups/${groupId}/tasks/${subGroupTaskId}`,

            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Client sub-group task deletion error:', error);
        return Promise.reject(error.response?.data || { message: 'Sub-group task deletion failed' });
    }
};

export const addClientExistingTaskInsideGroupTask = async (groupId, taskData) => {
    const token = getClientToken();
    // console.log('Adding existing task to group with data:', groupId, taskData);
    try {
        const response = await axios.post(
            `${BASE_URL}/client/task-groups/${groupId}/add-tasks`,
            taskData,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Client existing task addition error:', error);
        return Promise.reject(error.response?.data || { message: 'Existing task addition failed' });
    }
};

export const getClientTaskById = async (taskId) => {
    const token = getClientToken();
    try {
        const response = await axios.get(
            `${BASE_URL}/client/tasks/${taskId}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Client task fetching error:', error);
        return Promise.reject(error.response?.data || { message: 'Fetching task failed' });
    }
};


export const getClientTaskGroupOccurrecesByGroupId = async (groupId, page = 1, limit = 5) => {
    const token = getClientToken();
    try {
        const params = { page, limit };
        const response = await axios.get(
            `${BASE_URL}/client/task-groups/${groupId}/group-occurrences`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                params: params,
            }
        );
        return response.data;
    } catch (error) {
        console.error('Client group task occurrences fetching error:', error);
        return Promise.reject(error.response?.data || { message: 'Fetching group task occurrences failed' });
    }
};

export const getClientTaskOccurrenceByTaskGroupOccurrrenceId = async (TaskGroupOccurrenceId, page = 1, limit = 5) => {
    const token = getClientToken();
    try {
        const params = { page, limit };
        const response = await axios.get(
            `${BASE_URL}/client/task-group-occurrences/${TaskGroupOccurrenceId}/task-occurrences`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                params: params,
            }
        );
        return response.data;
    } catch (error) {
        console.error('Client task occurrence fetching error:', error);
        return Promise.reject(error.response?.data || { message: 'Fetching task occurrence failed' });
    }
};