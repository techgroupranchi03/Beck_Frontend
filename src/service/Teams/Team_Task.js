import axios from 'axios';
import BASE_URL from '../../config';

const getTeamToken = () => {
    return localStorage.getItem('team_token');
};

export const getAllTeamTasks = async (filters = {}, searchText = "", page = 1) => {
    const token = getTeamToken();
    try {
        const params = { page };
        if (filters.assigned_to) params.assigned_to = filters.assigned_to;
        if (filters.status) params.status = filters.status;
        if (filters.property_id) params.property_id = filters.property_id;
        if (searchText) params.search = searchText;
        const response = await axios.get(
            `${BASE_URL}/team/all-tasks`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                params: params,
            }
        );
        return response.data;
    } catch (error) {
        console.error('Team all tasks fetching error:', error);
        return Promise.reject(error.response?.data || { message: 'All tasks fetching failed' });
    }
};

export const getActiveTasks = async (filters = {}, searchText = "", page = 1) => {
    const token = getTeamToken();
    try {
        const params = { page };
        if (filters.assigned_to) params.assigned_to = filters.assigned_to;
        if (filters.status) params.status = filters.status;
        if (filters.property_id) params.property_id = filters.property_id;
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
        return response.data;
    } catch (error) {
        console.error('Team active tasks fetching error:', error);
        return Promise.reject(error.response?.data || { message: 'Active tasks fetching failed' });
    }
};

export const getPlannerTasks = async (filters = {}, searchText = "", page = 1,) => {
    const token = getTeamToken();
    try {
        const params = { page };
        if (filters.assigned_to) params.assigned_to = filters.assigned_to;
        if (filters.status) params.status = filters.status;
        if (filters.property_id) params.property_id = filters.property_id;
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
        return response.data;
    } catch (error) {
        console.error('Team planner tasks fetching error:', error);
        return Promise.reject(error.response?.data || { message: 'Planner tasks fetching failed' });
    }
}

export const updateTeamsTaskPlanner = async (taskId, taskData) => {
    const token = getTeamToken();
    try {
        const response = await axios.put(
            `${BASE_URL}/team/tasks-planner/${taskId}`,
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

export const updateTeamsActiveTask = async (taskId, taskData) => {
    const token = getTeamToken();
    try {
        const response = await axios.put(
            `${BASE_URL}/team/active-tasks/${taskId}`,
            taskData,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Team active task update error:', error);
        return Promise.reject(error.response?.data || { message: 'Active task update failed' });
    }
};

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

export const createTeamActiveTask = async (taskData) => {
    const token = getTeamToken();
    try {
        const response = await axios.post(
            `${BASE_URL}/team/active-tasks`,
            taskData,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Team active task creation error:', error);
        return Promise.reject(error.response?.data || { message: 'Active task creation failed' });
    }
};

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
        return response.data;
    } catch (error) {
        console.error('Team members fetching error:', error);
        return Promise.reject(error.response?.data || { message: 'Fetching team members failed' });
    }
};

export const getTeamInventoryByPropertyId = async (propertyId) => {
    const token = getTeamToken();
    try {
        const response = await axios.get(
            `${BASE_URL}/team/inventory/property/${propertyId}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Team inventory fetching error:', error);
        return Promise.reject(error.response?.data || { message: 'Fetching inventory failed' });
    }
};

export const getTeamsInventoryItems = async () => {
    const token = getTeamToken();
    try {
        const response = await axios.get(
            `${BASE_URL}/team/inventory`,
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

export const deleteTeamOneTimeTask = async (taskId) => {
    const token = getTeamToken();
    try {
        const response = await axios.delete(
            `${BASE_URL}/team/active-tasks/${taskId}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Team one-time task deletion error:', error);
        return Promise.reject(error.response?.data || { message: 'One-time task deletion failed' });
    }
};

export const deleteTeamRecurringTask = async (taskId) => {
    const token = getTeamToken();
    try {
        const response = await axios.delete(
            `${BASE_URL}/team/tasks-planner/${taskId}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Team recurring task deletion error:', error);
        return Promise.reject(error.response?.data || { message: 'Recurring task deletion failed' });
    }
};

export const updateTeamTaskStatusCompleted = async (taskId, formData) => {
    const token = getTeamToken();
    try {  
        const response = await axios.put(
            `${BASE_URL}/team/groups/tasks/${taskId}/status`,
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
        console.error('Team task status update error:', error);
        return Promise.reject(error.response?.data);
    }
};

export const getTeamGrooupTasksById = async (groupTaskId) => {
    const token = getTeamToken();
    try {
        const response = await axios.get(
            `${BASE_URL}/team/groups/${groupTaskId}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Team group task fetching error:', error);
        return Promise.reject(error.response?.data || { message: 'Fetching group task failed' });
    }
};

export const createTeamGroupTask = async (taskData) => {
    const token = getTeamToken();
    try {
        const response = await axios.post(
            `${BASE_URL}/team/groups`,
            taskData,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Team group task creation error:', error);
        return Promise.reject(error.response?.data || { message: 'Group task creation failed' });
    }
};


export const updateTeamGroupTask = async (groupTaskId, taskData) => {
    const token = getTeamToken();
    try {
        const response = await axios.put(
            `${BASE_URL}/team/groups/${groupTaskId}`,
            taskData,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Team group task update error:', error);
        return Promise.reject(error.response?.data || { message: 'Group task update failed' });
    }
};

export const deleteTeamGroupTask = async (groupTaskId) => {
    const token = getTeamToken();
    try {
        const response = await axios.delete(
            `${BASE_URL}/team/groups/${groupTaskId}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Team group task deletion error:', error);
        return Promise.reject(error.response?.data || { message: 'Group task deletion failed' });
    }
};

export const createTeamSubGroupTask = async (groupTaskId, taskData) => {
    const token = getTeamToken();
    try {
        const response = await axios.post(
            `${BASE_URL}/team/groups/${groupTaskId}/tasks`,
            taskData,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Team sub-group task creation error:', error);
        return Promise.reject(error.response?.data || { message: 'Sub-group task creation failed' });
    }
};

export const updateTeamSubGroupTask = async (groupId, subGroupTaskId, taskData) => {
    const token = getTeamToken();
    try {
        const response = await axios.put(
            `${BASE_URL}/team/groups/tasks/${subGroupTaskId}`,
            taskData,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Team sub-group task update error:', error);
        return Promise.reject(error.response?.data || { message: 'Sub-group task update failed' });
    }
};

export const deleteTeamSubGroupTask = async (groupId, subGroupTaskId) => {
    const token = getTeamToken();
    try {
        const response = await axios.delete(
            `${BASE_URL}/team/groups/${groupId}/tasks/${subGroupTaskId}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Team sub-group task deletion error:', error);
        return Promise.reject(error.response?.data || { message: 'Sub-group task deletion failed' });
    }
};

export const addTeamExistingTaskInsideGroupTask = async (groupId, taskData) => {
    const token = getTeamToken();
    try {
        const response = await axios.post(
            `${BASE_URL}/team/groups/${groupId}/tasks/bulk`,
            taskData,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Adding existing tasks to group error:', error);
        return Promise.reject(error.response?.data || { message: 'Adding existing tasks to group failed' });
    }
};