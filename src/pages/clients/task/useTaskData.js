import { useState, useEffect, useCallback } from 'react';
import {
    getClientTasks,
    getClientActiveTasks,
    createClientTask,
    updateTaskPlanner,
    updateActiveTask,
    deleteClientTask,
    updateClientActiveTaskStatus
} from '../../../service/Clients/Task';
import { getClientProperties } from '../../../service/Clients/Properties';
import { getInventoryItems } from '../../../service/Clients/Inventory';
import { getTeamMembers } from '../../../service/Clients/Team';

export const useTaskData = () => {
    const [taskPlannerData, setTaskPlannerData] = useState([]);
    const [activeTasksData, setActiveTasksData] = useState([]);
    const [properties, setProperties] = useState([]);
    const [inventoryItems, setInventoryItems] = useState([]);
    const [teamMembers, setTeamMembers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [taskPlannerPagination, setTaskPlannerPagination] = useState({});
    const [activeTasksPagination, setActiveTasksPagination] = useState({});

    // Fetch Task Planner tasks
    const fetchTaskPlannerData = useCallback(async (filters = {}, searchText = "", page = 1, append = false) => {
        try {

            if (!append) {
                setLoading(true);
            }
            const res = await getClientTasks(filters, searchText, page);
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
            console.log("Fetched Task Planner Data:", res);
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
            const res = await getClientActiveTasks(filters, searchText, page);
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
            console.log("Fetched Active Tasks Data:", res);
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
    const fetchProperties = useCallback(async () => {
        try {
            const res = await getClientProperties();
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
            const res = await getInventoryItems();
            setInventoryItems(res.data || []);
            return res.data;
        } catch (err) {
            console.error('Error fetching inventory:', err);
            setError(err);
            throw err;
        }
    }, []);

    // Fetch Team Members
    const fetchTeamMembers = useCallback(async () => {
        try {
            const res = await getTeamMembers();
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
                fetchTaskPlannerData(),
                fetchActiveTasksData(),
                fetchProperties(),
                fetchInventoryItems(),
                fetchTeamMembers()
            ]);
        } catch (err) {
            console.error('Error fetching all data:', err);
        } finally {
            setLoading(false);
        }
    }, [fetchTaskPlannerData, fetchActiveTasksData, fetchProperties, fetchInventoryItems, fetchTeamMembers]);

    // Initial data fetch
    useEffect(() => {
        fetchAllData();
    }, [fetchAllData]);

    // ==================== TASK PLANNER OPERATIONS ====================

    // Create new task
    const createTask = async (values) => {
        try {
            const res = await createClientTask(values);
            console.log("Created Task Response:", res);

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

            return res;
        } catch (err) {
            console.error('Error creating task:', err);
            throw err;
        }
    };

    // Update existing task planner
    const updateTaskPlannerData = async (id, values) => {
        try {
            const res = await updateTaskPlanner(id, values);

            // Update in taskPlannerData if it exists there
            setTaskPlannerData((prev) =>
                prev.map((task) => (task.id === id ? { ...task, ...values } : task))
            );

            return res;
        } catch (err) {
            console.error('Error updating task planner:', err);
            throw err;
        }
    };

    // Update active task (task instance)
    const updateActiveTaskData = async (id, values) => {
        try {
            const res = await updateActiveTask(id, values);

            // Update in activeTasksData
            setActiveTasksData((prev) =>
                prev.map((task) => (task.id === id ? { ...task, ...values } : task))
            );

            return res;
        } catch (err) {
            console.error('Error updating active task:', err);
            throw err;
        }
    };

    // Delete task
    const deleteTask = async (id) => {
        try {
            const res = await deleteClientTask(id);

            // Remove from both Task Planner and Active Tasks
            setTaskPlannerData((prev) => prev.filter((task) => task.id !== id));
            setActiveTasksData((prev) => prev.filter((task) => task.id !== id));

            return res;
        } catch (err) {
            console.error('Error deleting task:', err);
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
        taskPlannerData,
        activeTasksData,
        properties,
        inventoryItems,
        teamMembers,
        loading,
        error,

        // pagination data 
        taskPlannerPagination,
        activeTasksPagination,

        // Task Planner Operations
        createTask,
        updateTaskPlannerData,
        deleteTask,
        refreshTaskPlanner,

        // Active Tasks Operations
        updateActiveTaskData,
        refreshActiveTasks,
        updateActiveTaskStatus,

        // Fetch with filters
        fetchTaskPlannerData,
        fetchActiveTasksData,

        // General Operations
        refetchAll: fetchAllData,
    };
};
