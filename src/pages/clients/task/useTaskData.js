import { useState, useEffect, useCallback } from 'react';
import {
    getClientTasks,
    getClientActiveTasks,
    createClientTask,
    updateTaskPlanner,
    updateActiveTask,
    updateClientActiveTaskStatus,
    getTaskTeamMembers,
    createClientActiveTask,
    getInventoryByPropertyId,
    getAllClientTasks,
    deleteOneTime,
    deleteRecurring,
    updateClientTaskStatusCompleted,
    getClientGroupTasksById,
    createClientGroupTask,
    updateClientGroupTask,
    deleteClientGroupTask,
    createClientSubGroupTask,
    updateClientSubGroupTask,
    deleteClientSubGroupTask
} from '../../../service/Clients/Task';
import { getClientProperties } from '../../../service/Clients/Properties';
import { getInventoryItems } from '../../../service/Clients/Inventory';
import { getTeamMembers } from '../../../service/Clients/Team';
import { useAuth } from '../../../context/AuthContext';
import { createTeamActiveTask, createTeamGroupTask, createTeamSubGroupTask, createTeamTask, deleteTeamGroupTask, deleteTeamOneTimeTask, deleteTeamRecurringTask, deleteTeamSubGroupTask, getActiveTasks, getAllTeamTasks, getPlannerTasks, getTeamGrooupTasksById, getTeamInventoryByPropertyId, getTeamsInventoryItems, getTeamsTeamMembers, updateTeamGroupTask, updateTeamsActiveTask, updateTeamsTaskPlanner, updateTeamSubGroupTask, updateTeamTaskStatusCompleted } from '../../../service/Teams/Team_Task';
import { getTeamProperties } from '../../../service/Teams/Team_Properties';

export const useTaskData = () => {
    const { user } = useAuth();
    const [allTasksData, setAllTasksData] = useState([]);
    const [allTaskPagination, setAllTaskPagination] = useState({});
    const [taskPlannerData, setTaskPlannerData] = useState([]);
    const [activeTasksData, setActiveTasksData] = useState([]);
    const [properties, setProperties] = useState([]);
    const [inventoryItems, setInventoryItems] = useState([]);
    const [teamMembers, setTeamMembers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [taskPlannerPagination, setTaskPlannerPagination] = useState({});
    const [activeTasksPagination, setActiveTasksPagination] = useState({});
    // console.log("useTaskData initialized for user:", user);
    const isTeamUser = user?.role === 'team';

    const fetchAllTasks = useCallback(async (filters = {}, searchText = "", page = 1, append = false) => {

        try {
            if (!append) {
                setLoading(true);
            }
            const res = isTeamUser
                ? await getAllTeamTasks(filters, searchText, page)
                : await getAllClientTasks(filters, searchText, page);
            if (append) {
                setAllTasksData((prev) => {
                    if (prev && (prev.active_tasks || prev.recurring_tasks || prev.task_groups)) {
                        const newData = res.data || {};
                        return {
                            active_tasks: [...(prev.active_tasks || []), ...(newData.active_tasks || [])],
                            recurring_tasks: [...(prev.recurring_tasks || []), ...(newData.recurring_tasks || [])],
                            task_groups: [...(prev.task_groups || []), ...(newData.task_groups || [])]
                        };
                    }
                    return res.data || [];
                });
            } else {
                // Ensure we always set the complete data structure to avoid stale data
                const responseData = res.data || {};
                if (responseData.active_tasks || responseData.recurring_tasks || responseData.task_groups) {
                    setAllTasksData({
                        active_tasks: responseData.active_tasks || [],
                        recurring_tasks: responseData.recurring_tasks || [],
                        task_groups: responseData.task_groups || []
                    });
                } else {
                    setAllTasksData(responseData);
                }
            }

            setAllTaskPagination({
                hasNextPage: res.hasNextPage || false,
                hasPreviousPage: res.hasPreviousPage || false,
                page: res.page || 1,
                total: res.total || 0,
                totalPages: res.totalPages || 1,
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

    const fetchTaskPlannerData = useCallback(async (filters = {}, searchText = "", page = 1, append = false) => {
        try {

            if (!append) {
                setLoading(true);
            }
            const res = isTeamUser
                ? await getPlannerTasks(filters, searchText, page)
                : await getClientTasks(filters, searchText, page);
            if (append) {
                setTaskPlannerData((prev) => [...prev, ...(res.data || [])]);
            } else {
                setTaskPlannerData(res.data || []);
            }
            setTaskPlannerPagination({
                hasNextPage: res.hasNextPage || false,
                hasPreviousPage: res.hasPreviousPage || false,
                page: res.page || 1,
                total: res.total || 0,
                totalPages: res.totalPages || 1,
            })
            //console.log("Fetched Task Planner Data:", res);
            return res.data;
        } catch (err) {
            console.error('Error fetching task planner data:', err);
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchActiveTasksData = useCallback(async (filters = {}, searchText = "", page = 1, append = false) => {
        try {
            if (!append) {
                setLoading(true);
            }
            // const res = await getClientActiveTasks(filters, searchText, page);
            const res = isTeamUser
                ? await getActiveTasks(filters, searchText, page)
                : await getClientActiveTasks(filters, searchText, page);
            if (append) {
                setActiveTasksData((prev) => [...prev, ...(res.data || [])]);
            } else {
                setActiveTasksData(res.data || []);
            }
            setActiveTasksPagination({
                hasNextPage: res.hasNextPage || false,
                hasPreviousPage: res.hasPreviousPage || false,
                page: res.page || 1,
                total: res.total || 0,
                totalPages: res.totalPages || 1,
            })
            //console.log("Fetched Active Tasks Data:", res);
            return res.data;
        } catch (err) {
            console.error('Error fetching active tasks:', err);
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchProperties = useCallback(async (page = 1) => {
        try {
            const res = isTeamUser
                ? await getTeamProperties(page)
                : await getClientProperties(page);
            setProperties(res.data || []);
            return res.data;
        } catch (err) {
            console.error('Error fetching properties:', err);
            setError(err);
            throw err;
        }
    }, []);

    const fetchInventoryItems = useCallback(async () => {
        try {
            // const res = await getInventoryItems();
            const res = isTeamUser
                ? await getTeamsInventoryItems()
                : await getInventoryItems();
            // console.log("Fetched Inventory Items Response:", res);
            setInventoryItems(res.data || []);
            // console.log("Inventory Items Set:", res.data || []);
            return res.data;
        } catch (err) {
            console.error('Error fetching inventory:', err);
            setError(err);
            throw err;
        }
    }, []);

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
            // const res = await getTaskTeamMembers();
            const res = isTeamUser
                ? await getTeamsTeamMembers()
                : await getTaskTeamMembers();
            //console.log("Fetched Team Members Response:", res);
            setTeamMembers(res.data || []);

            return res.data;
        } catch (err) {
            console.error('Error fetching team members:', err);
            setError(err);
            throw err;
        }
    }, []);

    const fetchGroupTasksByGroupId = useCallback(async (groupId) => {
        try {
            const res = isTeamUser
                ? await getTeamGrooupTasksById(groupId)
                : await getClientGroupTasksById(groupId);
            return res.data || [];
        } catch (err) {
            console.error('Error fetching group tasks by group ID:', err);
            setError(err);
            throw err;
        }
    }, []);

    const fetchAllData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            await Promise.all([
                fetchAllTasks({}, "", 1, false),
                fetchTaskPlannerData(),
                fetchActiveTasksData(),
                fetchProperties(),
                fetchInventoryItems(),
                fetchTeamMembers(),
                fetchInventoryByProperty(),
                // fetchGroupTasksByGroupId()
            ]);
        } catch (err) {
            console.error('Error fetching all data:', err);
        } finally {
            setLoading(false);
        }
    }, [fetchTaskPlannerData, fetchActiveTasksData, fetchProperties, fetchInventoryItems, fetchTeamMembers, fetchInventoryByProperty, fetchAllTasks,]);

    useEffect(() => {
        fetchAllData();
    }, [fetchAllData]);

    const createTask = async (values) => {
        try {
            const res = isTeamUser
                ? await createTeamTask(values)
                : await createClientTask(values);
            const isRecurringTask = ['daily', 'weekly', 'monthly', 'yearly'].includes(values.schedule_type);
            if (isRecurringTask) {
                setTaskPlannerData((prev) => [res.data, ...prev]);
            } else {
                await Promise.all([
                    fetchTaskPlannerData(),
                    fetchActiveTasksData()
                ]);
            }
            setAllTasksData((prev) => {
                if (Array.isArray(prev)) {
                    return [res.data, ...prev];
                }
                if (prev && (prev.active_tasks || prev.recurring_tasks)) {
                    if (isRecurringTask) {
                        return {
                            active_tasks: prev.active_tasks || [],
                            recurring_tasks: [res.data, ...(prev.recurring_tasks || [])]
                        };
                    } else {
                        return {
                            active_tasks: [res.data, ...(prev.active_tasks || [])],
                            recurring_tasks: prev.recurring_tasks || []
                        };
                    }
                }
                return prev;
            });

            return res;
        } catch (err) {
            console.error('Error creating task:', err);
            throw err;
        }
    };

    const createActiveTask = async (values) => {
        try {
            const res = isTeamUser
                ? await createTeamActiveTask(values)
                : await createClientActiveTask(values);
            setActiveTasksData((prev) => [res.data, ...prev]);
            setAllTasksData((prev) => {
                if (Array.isArray(prev)) {
                    return [res.data, ...prev];
                }
                if (prev && (prev.active_tasks || prev.recurring_tasks)) {
                    return {
                        active_tasks: [res.data, ...(prev.active_tasks || [])],
                        recurring_tasks: prev.recurring_tasks || []
                    };
                }
                return prev;
            });
            return res;
        } catch (err) {
            console.error('Error creating active task:', err);
            throw err;
        }
    };

    const updateTaskPlannerData = async (id, values) => {
        try {
            const res = isTeamUser
                ? await updateTeamsTaskPlanner(id, values)
                : await updateTaskPlanner(id, values);
            const updatedValues = { ...values };
            if (values.inventory_id !== undefined) {
                const inventory = inventoryItems.find(item => item.id === values.inventory_id);
                updatedValues.inventory_name = inventory ? inventory.name : null;
            }
            setTaskPlannerData((prev) =>
                prev.map((task) => (task.id === id ? { ...task, ...updatedValues } : task))
            );
            setAllTasksData((prev) => {
                if (Array.isArray(prev)) {
                    return prev.map((task) => (task.id === id ? { ...task, ...updatedValues } : task));
                }
                if (prev && (prev.active_tasks || prev.recurring_tasks)) {
                    return {
                        active_tasks: prev.active_tasks || [],
                        recurring_tasks: (prev.recurring_tasks || []).map((task) =>
                            task.id === id ? { ...task, ...updatedValues } : task
                        )
                    };
                }
                return prev;
            });
            return res;
        } catch (err) {
            console.error('Error updating task planner:', err);
            throw err;
        }
    };

    const updateActiveTaskData = async (id, values) => {
        try {
            const res = isTeamUser
                ? await updateTeamsActiveTask(id, values)
                : await updateActiveTask(id, values);
            const updatedValues = { ...values };
            if (values.inventory_id !== undefined) {
                const inventory = inventoryItems.find(item => item.id === values.inventory_id);
                updatedValues.inventory_name = inventory ? inventory.name : null;
            }
            setActiveTasksData((prev) =>
                prev.map((task) => (task.id === id ? { ...task, ...updatedValues } : task))
            );
            setAllTasksData((prev) => {
                if (Array.isArray(prev)) {
                    return prev.map((task) => (task.id === id ? { ...task, ...updatedValues } : task));
                }
                if (prev && (prev.active_tasks || prev.recurring_tasks)) {
                    return {
                        active_tasks: (prev.active_tasks || []).map((task) =>
                            task.id === id ? { ...task, ...updatedValues } : task
                        ),
                        recurring_tasks: prev.recurring_tasks || []
                    };
                }
                return prev;
            });
            return res;

        } catch (err) {
            console.error('Error updating active task:', err);
            throw err;
        }
    };

    const deleteOneTimeTask = async (id) => {
        try {
            const res = isTeamUser
                ? await deleteTeamOneTimeTask(id)
                : await deleteOneTime(id);

            setAllTasksData((prev) => {
                if (Array.isArray(prev)) {
                    return prev.filter((task) => task.id !== id);
                }
                if (prev && (prev.active_tasks || prev.recurring_tasks)) {
                    return {
                        active_tasks: (prev.active_tasks || []).filter((task) => task.id !== id),
                        recurring_tasks: prev.recurring_tasks || []
                    };
                }
                return prev;

            });
            return res;
        } catch (err) {
            console.error('Error deleting one time task:', err);
            throw err;
        }
    };

    const deleteRecurringTask = async (id) => {
        try {
            const res = isTeamUser
                ? await deleteTeamRecurringTask(id)
                : await deleteRecurring(id);
            setAllTasksData((prev) => {
                if (Array.isArray(prev)) {
                    return prev.filter((task) => task.id !== id);
                }
                if (prev && (prev.active_tasks || prev.recurring_tasks)) {
                    return {
                        active_tasks: prev.active_tasks || [],
                        recurring_tasks: (prev.recurring_tasks || []).filter((task) => task.id !== id)
                    };
                }
                return prev;
            });
            return res;
        } catch (err) {
            console.error('Error deleting recurring task:', err);
            throw err;
        }
    };

    const updateTaskCompletionStatus = async (taskId, formData) => {
        console.log("Updating Task Completion Status for Task ID:", taskId, formData);
        try {
            const res = isTeamUser
                ? await updateTeamTaskStatusCompleted(taskId, formData)
                : await updateClientTaskStatusCompleted(taskId, formData);
            return res;
        } catch (err) {
            console.error('Error updating task completion status:', err);
            throw err;
        }
    };

    const updateActiveTaskStatus = async (taskInstanceId, newStatus) => {
        try {
            const res = await updateClientActiveTaskStatus(taskInstanceId, newStatus);
            setActiveTasksData((prev) =>
                prev.map((task) =>
                    task.id === taskInstanceId ? { ...task, status: newStatus } : task
                )
            );
            return res;
        } catch (err) {
            console.error('Error updating task status:', err);
            throw err;
        }
    };

    const refreshActiveTasks = async () => {
        try {
            await fetchActiveTasksData();
        } catch (err) {
            console.error('Error refreshing active tasks:', err);
        }
    };

    const refreshTaskPlanner = async () => {
        try {
            await fetchTaskPlannerData();
        } catch (err) {
            console.error('Error refreshing task planner:', err);
        }
    };

    const createGroupTask = async (values) => {
        try {
            const res = isTeamUser
                ? await createTeamGroupTask(values)
                : await createClientGroupTask(values);
            // After creating group task, refresh the all tasks data
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
            // After updating group task, refresh the all tasks data
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
            // After deleting group task, refresh the all tasks data
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
            // After creating sub task, refresh the all tasks data
            await fetchAllTasks();
            return res;
        } catch (err) {
            console.error('Error creating sub task inside group:', err);
            throw err;
        }
    };

    const updateSubTaskInsideGroup = async (groupId ,subGroupTaskId, values) => {
        console.log("Updating Sub Task inside Group ID:", groupId, "Sub Group Task ID:", subGroupTaskId, "with values:", values);
        try {
            const res = isTeamUser
                ? await updateTeamSubGroupTask(groupId, subGroupTaskId, values)
                : await updateClientSubGroupTask(groupId, subGroupTaskId, values);
            // After updating sub task, refresh the all tasks data
            await fetchAllTasks();
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
            // After deleting sub task, refresh the all tasks data
            await fetchAllTasks();
            return res;
        } catch (err) {
            console.error('Error deleting sub task inside group:', err);
            throw err;
        }
    };

    return {
        allTasksData,
        taskPlannerData,
        activeTasksData,
        properties,
        inventoryItems,
        teamMembers,
        loading,
        error,

        // pagination data 
        allTaskPagination,
        taskPlannerPagination,
        activeTasksPagination,

        // Task Planner Operations
        createTask,
        createActiveTask,
        updateTaskPlannerData,
        refreshTaskPlanner,
        createGroupTask,
        updateGroupTask,
        createSubTaskInsideGroup,
        updateSubTaskInsideGroup,
        deleteSubTaskInsideGroup,

        // completed status update
        updateTaskCompletionStatus,
        deleteOneTimeTask,
        deleteRecurringTask,
        deleteGroupTask,

        // Active Tasks Operations
        updateActiveTaskData,
        refreshActiveTasks,
        updateActiveTaskStatus,

        // Fetch Methods
        fetchAllTasks,
        fetchTaskPlannerData,
        fetchActiveTasksData,
        fetchInventoryByProperty,
        fetchGroupTasksByGroupId,

        // General Operations
        refetchAll: fetchAllData,
    };
};
