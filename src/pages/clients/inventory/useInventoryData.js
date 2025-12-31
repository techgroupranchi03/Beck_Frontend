import { useState, useEffect, useCallback } from 'react';
import {
    getInventoryItems,
    createInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    getInventoryById,
    getUnitsAndQuantities
} from '../../../service/Clients/Inventory';
import { getClientProperties } from '../../../service/Clients/Properties';
import {
    createClientTask,
    createClientActiveTask,
    updateTaskPlanner,
    updateActiveTask,
    deleteOneTime,
    deleteRecurring,
    updateClientActiveTaskStatus
} from '../../../service/Clients/Task';
import { getTeamMembers } from '../../../service/Clients/Team';
import { useAuth } from '../../../context/AuthContext';
import { createTeamInventoryItem, deleteTeamInventoryItem, getTeamInventoryById, getTeamInventoryFieldOptions, getTeamInventoryItems, updateTeamInventoryItem } from '../../../service/Teams/Team_Inventory';
import { getTeamProperties } from '../../../service/Teams/Team_Properties';
import { createTeamActiveTask, createTeamTask, getTeamsTeamMembers, updateTeamsActiveTask, updateTeamsTaskPlanner, deleteTeamOneTimeTask, deleteTeamRecurringTask, updateTeamTaskStatusCompleted } from '../../../service/Teams/Team_Task';

export const useInventoryData = () => {
    const { user } = useAuth();
    const [inventoryData, setInventoryData] = useState([])
    const [properties, setProperties] = useState([]);
    const [units, setUnits] = useState([]);
    const [containerOptions, setContainerOptions] = useState([]);
    const [teamMembers, setTeamMembers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [inventoryPagination, setInventoryPagination] = useState({});
    const isTeamUser = user?.role === 'team';

    const fetchInventoryItems = useCallback(async (filters = {}, searchText = "", page = 1, append = false) => {
        try {
            if (!append) {
                setLoading(true);
            }
            const res = isTeamUser
                ? await getTeamInventoryItems(filters, searchText, page)
                : await getInventoryItems(filters, searchText, page);
            if (append) {
                setInventoryData((prev) => [...prev, ...(res.data || [])]);
            } else {
                setInventoryData(res.data || []);
            }
            setInventoryPagination({
                hasNextPage: res.hasNextPage || false,
                hasPreviousPage: res.hasPreviousPage || false,
                page: res.page || 1,
                total: res.total || 0,
                totalPages: res.totalPages || 1,
            })
            return res.data;
        } catch (err) {
            console.error('Error fetching inventory items:', err);
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

    const fetchUnitsAndQuantities = useCallback(async () => {
        try {
            const res = isTeamUser
                ? await getTeamInventoryFieldOptions()
                : await getUnitsAndQuantities();
            setUnits(res.data.units || []);
            setContainerOptions([...res.data.quantity?.containerOptions || []].reverse());
            return res.data;
        } catch (err) {
            console.error('Error fetching units and quantities:', err);
            setError(err);
            throw err;
        }
    }, []);

    const fetchTeamMembers = useCallback(async () => {
        try {
            const res = isTeamUser
                ? await getTeamsTeamMembers()
                : await getTeamMembers();
            setTeamMembers(res.data || []);
            return res.data;
        } catch (err) {
            console.error('Error fetching team members:', err);
            setError(err);
            throw err;
        }
    }, []);

    const fetchAllData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            await Promise.all([
                fetchInventoryItems(),
                fetchProperties(),
                fetchUnitsAndQuantities(),
                fetchTeamMembers()
            ]);
        } catch (err) {
            console.error('Error fetching all data:', err);
        } finally {
            setLoading(false);
        }
    }, [fetchInventoryItems, fetchProperties, fetchUnitsAndQuantities, fetchTeamMembers]);

    useEffect(() => {
        fetchAllData();
    }, [fetchAllData]);

    const createInventory = async (formData) => {
        try {
            const res = isTeamUser
                ? await createTeamInventoryItem(formData)
                : await createInventoryItem(formData);
            const newItem = res.data?.data || res.data;
            if (newItem && newItem.id) {
                setInventoryData((prev) => [newItem, ...prev]);
            } else {
                await fetchInventoryItems();
            }
            return res.data;
        } catch (err) {
            console.error('Error creating inventory item:', err);
            throw err;
        }
    };

    const updateInventory = async (id, formData) => {
        try {
            const res = isTeamUser
                ? await updateTeamInventoryItem(id, formData)
                : await updateInventoryItem(id, formData);
            const updatedItem = res.data?.data || res.data;
            if (updatedItem && updatedItem.id) {
                setInventoryData((prev) =>
                    prev.map((item) => (item.id === id ? updatedItem : item))
                );
            } else {
                await fetchInventoryItems();
            }

            return res;
        } catch (err) {
            console.error('Error updating inventory item:', err);
            throw err;
        }
    };

    const deleteInventory = async (id) => {
        try {
            const res = isTeamUser
                ? await deleteTeamInventoryItem(id)
                : await deleteInventoryItem(id);
            setInventoryData((prev) => prev.filter((item) => item.id !== id));
            return res.data;
        } catch (err) {
            console.error('Error deleting inventory item:', err);
            throw err;
        }
    };

    const getInventoryDetails = async (id) => {
        try {
            const res = isTeamUser
                ? await getTeamInventoryById(id)
                : await getInventoryById(id);
            return res.data;
        } catch (err) {
            console.error('Error fetching inventory details:', err);
            throw err;
        }
    };

    const createTask = async (values) => {
        try {
            const res = isTeamUser
                ? await createTeamTask(values)
                : await createClientTask(values);
            await fetchInventoryItems();
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
            await fetchInventoryItems();

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
            const updatedTask = res.data?.data || res.data;
            setInventoryData(prevData =>
                prevData.map(item => ({
                    ...item,
                    task_planner: (item.task_planner || []).map(task =>
                        task.id === id ? { ...task, ...updatedTask } : task
                    )
                }))
            );

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
            const updatedTask = res.data?.data || res.data;
            setInventoryData(prevData =>
                prevData.map(item => ({
                    ...item,
                    task_instances: (item.task_instances || []).map(task =>
                        task.id === id ? { ...task, ...updatedTask } : task
                    )
                }))
            );

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
            setInventoryData(prevData =>
                prevData.map(item => ({
                    ...item,
                    task_instances: (item.task_instances || []).filter(task => task.id !== id)
                }))
            );

            return res;
        } catch (err) {
            console.error('Error deleting one-time task:', err);
            throw err;
        }
    };

    const deleteRecurringTask = async (id) => {
        try {
            const res = isTeamUser
                ? await deleteTeamRecurringTask(id)
                : await deleteRecurring(id);

            // Update inventory data locally by removing the deleted task
            setInventoryData(prevData =>
                prevData.map(item => ({
                    ...item,
                    task_planner: (item.task_planner || []).filter(task => task.id !== id)
                }))
            );

            return res;
        } catch (err) {
            console.error('Error deleting recurring task:', err);
            throw err;
        }
    };

    const updateTaskCompletionStatus = async (id, values) => {
        try {
            const res = isTeamUser
                ? await updateTeamTaskStatusCompleted(id, values)
                : await updateClientActiveTaskStatus(id, values);
            const updatedTask = res.data?.data || res.data;
            setInventoryData(prevData =>
                prevData.map(item => ({
                    ...item,
                    task_instances: (item.task_instances || []).map(task =>
                        task.id === id ? { ...task, ...updatedTask } : task
                    )
                }))
            );

            return res;
        } catch (err) {
            console.error('Error updating task completion status:', err);
            throw err;
        }
    };

    return {
        // State
        inventoryData,
        properties,
        units,
        containerOptions,
        teamMembers,
        loading,
        error,

        // pagination state
        inventoryPagination,

        // Fetch operations
        fetchInventoryItems,
        fetchProperties,
        fetchUnitsAndQuantities,
        fetchTeamMembers,
        fetchAllData,

        // CRUD operations
        createInventory,
        updateInventory,
        deleteInventory,
        getInventoryDetails,

        // Task operations
        createTask,
        createActiveTask,
        updateTaskPlannerData,
        updateActiveTaskData,
        deleteOneTimeTask,
        deleteRecurringTask,

        // update task completion status
        updateTaskCompletionStatus,

        // State setters (for manual updates if needed)
        setInventoryData,
        setProperties,
        setUnits,
        setContainerOptions,
        setTeamMembers,
        setLoading,
        setError,
    };
};
