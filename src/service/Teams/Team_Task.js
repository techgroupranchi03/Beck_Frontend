import axios from 'axios';
import BASE_URL from '../../config';

const getTeamToken = () => {
    return localStorage.getItem('team_token');
};

export const getAllTeamTasks = async (filters = {}, searchText = "", page = 1, limit = 10) => {
    const token = getTeamToken();
    try {
        const params = { page, limit };
        if (filters.assigned_to?.length) params.assigned_to = filters.assigned_to;
        if (filters.status) params.status = filters.status;
        if (filters.property_id) params.property_id = filters.property_id;
        if (filters.schedule_type?.length) params.schedule_type = filters.schedule_type;
        if (searchText) params.search = searchText;
        const response = await axios.get(
            `${BASE_URL}/team/tasks`,
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
};

export const deleteTeamTask = async (taskId) => {
    const token = getTeamToken();
    try {
        const response = await axios.delete(
            `${BASE_URL}/team/tasks/${taskId}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Team task deletion error:', error);
        return Promise.reject(error.response?.data || { message: 'Task deletion failed' });
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

export const getTeamsInventoryItems = async (filters = {}, searchText = "", page = 1) => {
    const token = getTeamToken();
    try {
        const params = { page };
        if (filters.category) params.category = filters.category;
        if (filters.property_id) params.property_id = filters.property_id;
        if (searchText) params.search = searchText;

        const response = await axios.get(
            `${BASE_URL}/team/inventory`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                params,
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

export const updateTeamTaskStatus = async (occurrenceId, status) => {
    const token = getTeamToken();
    try {  
        const response = await axios.put(
            `${BASE_URL}/team/tasks/occurrences/${occurrenceId}`,
            { status },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Team task status update error:', error);
        return Promise.reject(error.response?.data);
    }
};

export const addTeamConfirmationTaskImage = async (occurrenceId, formData) => {
    const token = getTeamToken();
    console.log('Updating task with formData:', formData);
    try {
        const response = await axios.post(
            `${BASE_URL}/team/tasks/occurrences/${occurrenceId}/complete`,
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
        console.error('Team task update error:', error);
        return Promise.reject(error.response?.data);
    }
};

export const updateTeamConfirmationTaskImage = async (occurrenceId, formData) => {
    const token = getTeamToken();
    console.log('Updating task with formData:', formData);
    try {
        const response = await axios.put(
            `${BASE_URL}/team/tasks/occurrences/${occurrenceId}/proof`,
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
        console.error('Team task update error:', error);
        return Promise.reject(error.response?.data);
    }
};

export const getTeamGroupTasksById = async (groupTaskId, page = 1, limit = 3) => {
    const token = getTeamToken();
    try {
        const params = { page, limit };
        const response = await axios.get(
            `${BASE_URL}/team/task-groups/${groupTaskId}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                params,
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
            `${BASE_URL}/team/task-groups`,
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
            `${BASE_URL}/team/task-groups/${groupTaskId}`,
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
            `${BASE_URL}/team/task-groups/${groupTaskId}`,
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
            `${BASE_URL}/team/task-groups/${groupTaskId}/tasks`,
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

export const updateTeamSubGroupTask = async (groupId, groupTaskId,taskData) => {
    const token = getTeamToken();
    try {
        const response = await axios.put(
            `${BASE_URL}/team/task-groups/${groupId}/tasks/${groupTaskId}`,
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
            `${BASE_URL}/team/task-groups/${groupId}/tasks/${subGroupTaskId}`,
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
            `${BASE_URL}/team/task-groups/${groupId}/add-tasks`,
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

export const getTeamTaskById = async (taskId) => {
    const token = getTeamToken();
    try {
        const response = await axios.get(
            `${BASE_URL}/team/tasks/${taskId}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Team task fetching error:', error);
        return Promise.reject(error.response?.data || { message: 'Fetching task failed' });
    }
};

export const getTeamTaskGroupOccurrecesByGroupId = async (groupId, page = 1, limit = 10) => {
    const token = getTeamToken();
    try {
        const params = { page, limit };
        const response = await axios.get(
            `${BASE_URL}/team/task-groups/${groupId}/group-occurrences`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                params: params,
            }
        );
        return response.data;
    } catch (error) {
        console.error('Team group task occurrences fetching error:', error);
        return Promise.reject(error.response?.data || { message: 'Fetching group task occurrences failed' });
    }
};

export const getTeamTaskOccurrenceByTaskGroupOccurrrenceId = async (TaskGroupOccurrenceId, page = 1, limit = 5) => {
    const token = getTeamToken();
    try {
        const params = { page, limit };
        const response = await axios.get(
            `${BASE_URL}/team/task-group-occurrences/${TaskGroupOccurrenceId}/task-occurrences`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                params: params,
            }
        );
        return response.data;
    } catch (error) {
        console.error('Team task occurrence fetching error:', error);
        return Promise.reject(error.response?.data || { message: 'Fetching task occurrence failed' });
    }
};