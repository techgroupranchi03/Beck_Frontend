import { useState, useEffect, useCallback } from 'react';
import {
    createClientTask,
    updateClientTask,
    getTaskTeamMembers,
    getInventoryByPropertyId,
    getAllClientTasks,
    deleteClientTask,
    updateClientTaskStatus,
    getClientGroupTasksById,
    createClientGroupTask,
    updateClientGroupTask,
    deleteClientGroupTask,
    createClientSubGroupTask,
    updateClientSubGroupTask,
    deleteClientSubGroupTask,
    getClientTaskById,
    addClientConfirmationTaskImage,
    updateClientConfirmationTaskImage,
    getClientTaskGroupOccurrecesByGroupId,
    getClientTaskOccurrenceByTaskGroupOccurrrenceId
} from '../../../service/Clients/Task';
import { getClientProperties } from '../../../service/Clients/Properties';
import { getInventoryItems } from '../../../service/Clients/Inventory';
import { getTeamMembers } from '../../../service/Clients/Team';
import { useAuth } from '../../../context/AuthContext';
import {
    createTeamGroupTask,
    createTeamSubGroupTask,
    createTeamTask,
    deleteTeamGroupTask,
    deleteTeamRecurringTask,
    deleteTeamSubGroupTask,
    getAllTeamTasks,
    getTeamGroupTasksById,
    getTeamInventoryByPropertyId,
    getTeamsInventoryItems,
    getTeamsTeamMembers,
    updateTeamGroupTask,
    updateTeamSubGroupTask,
    updateTeamTaskStatus,
    getTeamTaskById,
    updateTeamTask,
    deleteTeamTask,
    updateTeamConfirmationTaskImage,
    addTeamConfirmationTaskImage,
    getTeamTaskGroupOccurrecesByGroupId,
    getTeamTaskOccurrenceByTaskGroupOccurrrenceId,

} from '../../../service/Teams/Team_Task';
import { getTeamProperties } from '../../../service/Teams/Team_Properties';

export const useTaskData = () => {
    const { user } = useAuth();
    const [allTasksData, setAllTasksData] = useState({});
    const [allTaskPagination, setAllTaskPagination] = useState({});
    const [properties, setProperties] = useState([]);
    const [propertyPagination, setPropertyPagination] = useState({});
    const [inventoryItems, setInventoryItems] = useState([]);
    const [inventoryPagination, setInventoryPagination] = useState({});
    const [teamMembers, setTeamMembers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const isTeamUser = user?.role === 'team';

    const fetchAllTasks = useCallback(async (filters = {}, searchText = "", page = 1, append = false, limit = 5) => {
        try {
            if (!append) {
                setLoading(true);
            }
            const res = isTeamUser
                ? await getAllTeamTasks(filters, searchText, page, limit)
                : await getAllClientTasks(filters, searchText, page, limit);
            if (append) {
                setAllTasksData((prev) => {
                    const prevData = prev || {};
                    const newData = res.data || {};
                    return {
                        group_task: [...(prevData.group_task || []), ...(newData.group_task || [])],
                        tasks: [...(prevData.tasks || []), ...(newData.tasks || [])],
                    };
                });
            } else {
                setAllTasksData(res.data || {});
            }
            const pagination = res.pagination || {};
            setAllTaskPagination({
                hasNextPage: pagination?.hasNextPage || false,
                hasPreviousPage: pagination?.hasPreviousPage || false,
                page: pagination?.page || 1,
                total: pagination?.total || 0,
                totalPages: pagination?.totalPages || 1,
            });
            return res.data;
        } catch (err) {
            console.error('Error fetching all tasks:', err);
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchProperties = useCallback(async (page = 1, append = false, search = '') => {
        try {
            const res = isTeamUser
                ? await getTeamProperties(page, search)
                : await getClientProperties(page, search);
            if (append) {
                setProperties((prev) => [...prev, ...(res.data || [])]);
            } else {
                setProperties(res.data || []);
            }
            setPropertyPagination({
                hasNextPage: res.pagination?.hasNextPage || false,
                hasPreviousPage: res.pagination?.hasPreviousPage || false,
                page: res.pagination?.page || 1,
                total: res.pagination?.total || 0,
                totalPages: res.pagination?.totalPages || 1,
            });
            return res.data;
        } catch (err) {
            console.error('Error fetching properties:', err);
            setError(err);
            throw err;
        }
    }, [isTeamUser]);

    const fetchInventoryItems = useCallback(async (filters = {}, searchText = "", page = 1, append = false) => {
        try {
            const res = isTeamUser
                ? await getTeamsInventoryItems(filters, searchText, page)
                : await getInventoryItems(filters, searchText, page);
            if (append) {
                setInventoryItems((prev) => [...prev, ...(res.data || [])]);
            } else {
                setInventoryItems(res.data || []);
            }
            setInventoryPagination({
                hasNextPage: res.hasNextPage || false,
                hasPreviousPage: res.hasPreviousPage || false,
                page: res.page || 1,
                total: res.total || 0,
                totalPages: res.totalPages || 1,
            });
            return res.data;
        } catch (err) {
            console.error('Error fetching inventory:', err);
            setError(err);
            throw err;
        }
    }, [isTeamUser]);

    const fetchInventoryByProperty = useCallback(async (propertyId) => {
        try {
            const res = isTeamUser
                ? await getTeamInventoryByPropertyId(propertyId)
                : await getInventoryByPropertyId(propertyId);
            return res.data || [];
        } catch (err) {
            console.error('Error fetching inventory by property:', err);
            setError(err);
            throw err;
        }
    }, []);

    const fetchTeamMembers = useCallback(async () => {
        try {
            const res = isTeamUser
                ? await getTeamsTeamMembers()
                : await getTaskTeamMembers();
            setTeamMembers(res.data || []);
            return res.data;
        } catch (err) {
            console.error('Error fetching team members:', err);
            setError(err);
            throw err;
        }
    }, []);

    const fetchGroupTasksByGroupId = useCallback(async (groupId, page = 1, limit = 3) => {
        try {
            const res = isTeamUser
                ? await getTeamGroupTasksById(groupId, page, limit)
                : await getClientGroupTasksById(groupId, page, limit);
            return res;
        } catch (err) {
            console.error('Error fetching group tasks by group ID:', err);
            setError(err);
            throw err;
        }
    }, [isTeamUser]);

    const fetchTaskGroupOccurrecesByGroupId = useCallback(async (groupId, page = 1, limit = 10) => {
        try {
            const res = isTeamUser
                ? await getTeamTaskGroupOccurrecesByGroupId(groupId, page, limit)
                : await getClientTaskGroupOccurrecesByGroupId(groupId, page, limit);
            return res;
        } catch (err) {
            console.error('Error fetching group task occurrences by group ID:', err);
            setError(err);
            throw err;
        }
    }, [isTeamUser]);

    const fetchTaskOccurrencesByTaskGroupOccurrenceId = useCallback(async (TaskGroupOccurrenceId, page = 1, limit = 5) => {
        try {
            const res = isTeamUser
                ? await getTeamTaskOccurrenceByTaskGroupOccurrrenceId(TaskGroupOccurrenceId, page, limit)
                : await getClientTaskOccurrenceByTaskGroupOccurrrenceId(TaskGroupOccurrenceId, page, limit);
            return res;
        } catch (err) {
            console.error('Error fetching task occurrences by task group occurrence ID:', err);
            setError(err);
            throw err;
        }
    }, [isTeamUser]);

    const fetchTaskById = useCallback(async (taskId) => {
        try {
            const res = isTeamUser
                ? await getTeamTaskById(taskId)
                : await getClientTaskById(taskId);
            return res;
        } catch (err) {
            console.error('Error fetching task by ID:', err);
            setError(err);
            throw err;
        }
    }, []);

    const fetchAllData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            await Promise.all([
                fetchAllTasks({}, "", 1, false, 10),
                fetchProperties(),
                fetchInventoryItems(),
                fetchTeamMembers(),
            ]);
        } catch (err) {
            console.error('Error fetching all data:', err);
        } finally {
            setLoading(false);
        }
    }, [fetchAllTasks, fetchProperties, fetchInventoryItems, fetchTeamMembers]);

    useEffect(() => {
        fetchAllData();
    }, [fetchAllData]);

    const createTask = async (values) => {
        try {
            const res = isTeamUser
                ? await createTeamTask(values)
                : await createClientTask(values);
            await fetchAllTasks();
            return res;
        } catch (err) {
            console.error('Error creating task:', err);
            throw err;
        }
    };

    const updateTask = async (id, values) => {
        try {
            const res = isTeamUser
                ? await updateTeamTask(id, values)
                : await updateClientTask(id, values);
            await fetchAllTasks();
            return res;
        } catch (err) {
            console.error('Error updating task:', err);
            throw err;
        }
    };

    const deleteTask = async (id) => {
        try {
            const res = isTeamUser
                ? await deleteTeamTask(id)
                : await deleteClientTask(id);
            setAllTasksData((prev) => {
                if (!prev) return prev;
                return {
                    group_task: prev.group_task || [],
                    tasks: (prev.tasks || []).filter((task) => task.id !== id),
                };
            });
            return res;
        } catch (err) {
            console.error('Error deleting task:', err);
            throw err;
        }
    };

    const updateTaskOccurrenceStatus = async (occurrenceId, status) => {
        try {
            const res = isTeamUser
                ? await updateTeamTaskStatus(occurrenceId, status)
                : await updateClientTaskStatus(occurrenceId, status);
            return res;
        } catch (err) {
            console.error('Error updating task completion status:', err);
            throw err;
        }
    };

    const addConfirmationImageInTask = async (occurrenceId, formData) => {
        try {
            const res = isTeamUser
                ? await addTeamConfirmationTaskImage(occurrenceId, formData)
                : await addClientConfirmationTaskImage(occurrenceId, formData);
            return res;
        } catch (err) {
            console.error('Error adding confirmation image in task:', err);
            throw err;
        }
    };

    const updateConfirmationImageInTask = async (occurrenceId, formData) => {
        try {
            const res = isTeamUser
                ? await updateTeamConfirmationTaskImage(occurrenceId, formData)
                : await updateClientConfirmationTaskImage(occurrenceId, formData);
            return res;
        } catch (err) {
            console.error('Error updating existing task image or quantity:', err);
            throw err;
        }
    };

    // Group Task Operations
    const createGroupTask = async (values) => {
        try {
            const res = isTeamUser
                ? await createTeamGroupTask(values)
                : await createClientGroupTask(values);
            await fetchAllTasks();
            return res;
        } catch (err) {
            console.error('Error creating group task:', err);
            throw err;
        }
    };

    const updateGroupTask = async (id, values) => {
        try {
            const res = isTeamUser
                ? await updateTeamGroupTask(id, values)
                : await updateClientGroupTask(id, values);
            await fetchAllTasks();
            return res;
        } catch (err) {
            console.error('Error updating group task:', err);
            throw err;
        }
    };

    const deleteGroupTask = async (id) => {
        try {
            const res = isTeamUser
                ? await deleteTeamGroupTask(id)
                : await deleteClientGroupTask(id);
            await fetchAllTasks();
            return res;
        } catch (err) {
            console.error('Error deleting group task:', err);
            throw err;
        }
    };

    const createSubTaskInsideGroup = async (groupId, values) => {
        try {
            const res = isTeamUser
                ? await createTeamSubGroupTask(groupId, values)
                : await createClientSubGroupTask(groupId, values);
            return res;
        } catch (err) {
            console.error('Error creating sub task inside group:', err);
            throw err;
        }
    };

    const updateSubTaskInsideGroup = async (groupId, groupTaskId, formData) => {
        try {
            const res = isTeamUser
                ? await updateTeamSubGroupTask(groupId, groupTaskId, formData)
                : await updateClientSubGroupTask(groupId, groupTaskId, formData);
            return res;
        } catch (err) {
            console.error('Error updating sub task inside group:', err);
            throw err;
        }
    };

    const deleteSubTaskInsideGroup = async (groupId, subGroupTaskId) => {
        try {
            const res = isTeamUser
                ? await deleteTeamSubGroupTask(groupId, subGroupTaskId)
                : await deleteClientSubGroupTask(groupId, subGroupTaskId);
            return res;
        } catch (err) {
            console.error('Error deleting sub task inside group:', err);
            throw err;
        }
    };

    return {
        allTasksData,
        allTaskPagination,
        properties,
        propertyPagination,
        inventoryItems,
        inventoryPagination,
        teamMembers,
        loading,
        error,

        // Task Operations
        createTask,
        updateTask,
        deleteTask,
        updateTaskOccurrenceStatus,
        addConfirmationImageInTask,
        updateConfirmationImageInTask,
        

        // Group Task Operations
        createGroupTask,
        updateGroupTask,
        deleteGroupTask,
        createSubTaskInsideGroup,
        updateSubTaskInsideGroup,
        deleteSubTaskInsideGroup,

        // Fetch Methods
        fetchAllTasks,
        fetchProperties,
        fetchInventoryItems,
        fetchInventoryByProperty,
        fetchGroupTasksByGroupId,
        fetchTaskById,
        fetchTaskGroupOccurrecesByGroupId,
        fetchTaskOccurrencesByTaskGroupOccurrenceId,

        // General Operations
        refetchAll: fetchAllData,
    };
};
