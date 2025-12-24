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
    deleteRecurring
} from '../../../service/Clients/Task';
import { getClientProperties } from '../../../service/Clients/Properties';
import { getInventoryItems } from '../../../service/Clients/Inventory';
import { getTeamMembers } from '../../../service/Clients/Team';
import { useAuth } from '../../../context/AuthContext';
import { createTeamTask, getActiveTasks, getPlannerTasks, getTeamsInventoryItems, getTeamsTeamMembers, updateTeamTask } from '../../../service/Teams/Team_Task';

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

    // check user role
    const isTeamUser = user?.role === 'team';
    //console.log("Is Team User:", isTeamUser);


    // add new api for get all task 

    const fetchAllTasks = useCallback(async (filters = {}, searchText = "", page = 1, append = false) => {
        try {
            if (!append) {
                setLoading(true);
            }
            const res = await getAllClientTasks(filters, searchText, page);
            if (append) {
                setAllTasksData((prev) => {
                    // Handle if prev is an object with active_tasks and recurring_tasks
                    if (prev && (prev.active_tasks || prev.recurring_tasks)) {
                        const newData = res.data || {};
                        return {
                            active_tasks: [...(prev.active_tasks || []), ...(newData.active_tasks || [])],
                            recurring_tasks: [...(prev.recurring_tasks || []), ...(newData.recurring_tasks || [])]
                        };
                    }
                    // Default: just return new data
                    return res.data || [];
                });
            } else {
                setAllTasksData(res.data || []);
            }
            // set pagination data 
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

    // Fetch Task Planner tasks
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

    // Fetch Active Tasks
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

    // Fetch Properties
    const fetchProperties = useCallback(async (page = 1) => {
        try {
            const res = await getClientProperties(page);
            setProperties(res.data || []);
            return res.data;
        } catch (err) {
            console.error('Error fetching properties:', err);
            setError(err);
            throw err;
        }
    }, []);

    // Fetch Inventory Items
    const fetchInventoryItems = useCallback(async () => {
        try {
            // const res = await getInventoryItems();
            const res = isTeamUser
                ? await getTeamsInventoryItems()
                : await getInventoryItems();
            // console.log("Fetched Inventory Items Response:", res);
            setInventoryItems(res.data || []);
            return res.data;
        } catch (err) {
            console.error('Error fetching inventory:', err);
            setError(err);
            throw err;
        }
    }, []);

    // Fetch Inventory Items by property ( new added )
    const fetchInventoryByProperty = useCallback(async (propertyId) => {
        try {
            const res = await getInventoryByPropertyId(propertyId);
            return res.data || [];
        } catch (err) {
            console.error('Error fetching inventory by property:', err);
            setError(err);
            throw err;
        }
    }, []);

    // Fetch Team Members
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

    // Fetch all data in parallel
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
                fetchInventoryByProperty()
            ]);
        } catch (err) {
            console.error('Error fetching all data:', err);
        } finally {
            setLoading(false);
        }
    }, [fetchTaskPlannerData, fetchActiveTasksData, fetchProperties, fetchInventoryItems, fetchTeamMembers, fetchInventoryByProperty, fetchAllTasks]);

    // Initial data fetch
    useEffect(() => {
        fetchAllData();
    }, [fetchAllData]);

    // ==================== TASK PLANNER OPERATIONS ====================

    // Create new task
    const createTask = async (values) => {
        try {
            // const res = await createClientTask(values);
            const res = isTeamUser
                ? await createTeamTask(values)
                : await createClientTask(values);
            //console.log("Created Task Response:", res);

            // Determine if task should go to Task Planner or Active Tasks
            // Task Planner: recurring tasks (weekly, monthly, yearly)
            // Active Tasks: one_time tasks (these create task instances immediately)
            const isRecurringTask = ['daily', 'weekly', 'monthly', 'yearly'].includes(values.schedule_type);

            if (isRecurringTask) {
                // Add to Task Planner for recurring tasks
                setTaskPlannerData((prev) => [res.data, ...prev]);
            } else {
                // For one_time tasks, refresh both lists
                // The backend creates task instances for one_time tasks
                await Promise.all([
                    fetchTaskPlannerData(),
                    fetchActiveTasksData()
                ]);
            }

            // Update allTasksData
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


    // create active task directly
    const createActiveTask = async (values) => {
        try {
            const res = await createClientActiveTask(values);
            //console.log("Created Active Task Response:", res);

            // Add to Active Tasks list
            setActiveTasksData((prev) => [res.data, ...prev]);

            // Update allTasksData
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

    // Update existing task planner
    const updateTaskPlannerData = async (id, values) => {
        try {
            //const res = await updateTaskPlanner(id, values);
            const res = isTeamUser
                ? await updateTeamTask(id, values)
                : await updateTaskPlanner(id, values);

            // If inventory_id changed, update inventory_name as well
            const updatedValues = { ...values };
            if (values.inventory_id !== undefined) {
                const inventory = inventoryItems.find(item => item.id === values.inventory_id);
                updatedValues.inventory_name = inventory ? inventory.name : null;
            }

            // Update in taskPlannerData if it exists there
            setTaskPlannerData((prev) =>
                prev.map((task) => (task.id === id ? { ...task, ...updatedValues } : task))
            );

            // Update in allTasksData
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

    // Update active task (task instance)
    const updateActiveTaskData = async (id, values) => {
        try {
            // const res = await updateActiveTask(id, values);
            const res = isTeamUser
                ? await updateTeamTask(id, values)
                : await updateActiveTask(id, values);

            // If inventory_id changed, update inventory_name as well
            const updatedValues = { ...values };
            if (values.inventory_id !== undefined) {
                const inventory = inventoryItems.find(item => item.id === values.inventory_id);
                updatedValues.inventory_name = inventory ? inventory.name : null;
            }

            // Update in activeTasksData
            setActiveTasksData((prev) =>
                prev.map((task) => (task.id === id ? { ...task, ...updatedValues } : task))
            );

            // Update in allTasksData
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

    // delete one time and recurring task both
    const deleteOneTimeTask = async (id) => {
        try {
            const res = await deleteOneTime(id);
            // Update allTasksData by removing the deleted task
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

    // delete recurring task
    const deleteRecurringTask = async (id) => {
        try {
            const res = await deleteRecurring(id);
            // Update allTasksData by removing the deleted task
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

    // ==================== ACTIVE TASKS OPERATIONS ====================

    // Update active task status
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

    // Refresh active tasks only
    const refreshActiveTasks = async () => {
        try {
            await fetchActiveTasksData();
        } catch (err) {
            console.error('Error refreshing active tasks:', err);
        }
    };

    // Refresh task planner only
    const refreshTaskPlanner = async () => {
        try {
            await fetchTaskPlannerData();
        } catch (err) {
            console.error('Error refreshing task planner:', err);
        }
    };

    return {
        // Data States
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

        deleteOneTimeTask,
        deleteRecurringTask,

        // Active Tasks Operations
        updateActiveTaskData,
        refreshActiveTasks,
        updateActiveTaskStatus,

        // Fetch Methods
        fetchAllTasks,
        fetchTaskPlannerData,
        fetchActiveTasksData,
        fetchInventoryByProperty,

        // General Operations
        refetchAll: fetchAllData,
    };
};
