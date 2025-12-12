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
    updateTaskPlanner,
    updateActiveTask
} from '../../../service/Clients/Task';
import { getTeamMembers } from '../../../service/Clients/Team';

export const useInventoryData = () => {
    const [inventoryData, setInventoryData] = useState([]);
    const [properties, setProperties] = useState([]);
    const [units, setUnits] = useState([]);
    const [containerOptions, setContainerOptions] = useState([]);
    const [teamMembers, setTeamMembers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [inventoryPagination, setInventoryPagination] = useState({});

    // Fetch inventory items
    const fetchInventoryItems = useCallback(async (filters = {}, searchText = "", page = 1, append = false) => {
        try {
            if (!append) {
                setLoading(true);
            }
            const res = await getInventoryItems(filters, searchText, page);
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

    // Fetch properties
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

    // Fetch units and quantities
    const fetchUnitsAndQuantities = useCallback(async () => {
        try {
            const res = await getUnitsAndQuantities();
            setUnits(res.data.units || []);
            setContainerOptions([...res.data.quantity?.containerOptions || []].reverse());
            return res.data;
        } catch (err) {
            console.error('Error fetching units and quantities:', err);
            setError(err);
            throw err;
        }
    }, []);

    // Fetch team members
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

    // Initial data fetch
    useEffect(() => {
        fetchAllData();
    }, [fetchAllData]);

    // -------------------- INVENTORY OPERATIONS --------------------

    // Create new inventory item
    const createInventory = async (formData) => {
        try {
            const res = await createInventoryItem(formData);
           // console.log('Create response:', res);

            // Handle different response structures
            const newItem = res.data?.data || res.data;

            if (newItem && newItem.id) {
                // Add new item to the beginning of the list
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

    // Update existing inventory item
    const updateInventory = async (id, formData) => {
        try {
            const res = await updateInventoryItem(id, formData);
            //console.log('Update response:', res);

            // Handle different response structures
            const updatedItem = res.data?.data || res.data;

            if (updatedItem && updatedItem.id) {
                // Update the item in the list
                setInventoryData((prev) =>
                    prev.map((item) => (item.id === id ? updatedItem : item))
                );
            } else {
                await fetchInventoryItems();
            }

            return res.data;
        } catch (err) {
            console.error('Error updating inventory item:', err);
            throw err;
        }
    };

    // Delete inventory item
    const deleteInventory = async (id) => {
        try {
            const res = await deleteInventoryItem(id);
            setInventoryData((prev) => prev.filter((item) => item.id !== id));
            return res.data;
        } catch (err) {
            console.error('Error deleting inventory item:', err);
            throw err;
        }
    };

    // Get inventory by ID
    const getInventoryDetails = async (id) => {
        try {
            const res = await getInventoryById(id);
            return res.data;
        } catch (err) {
            console.error('Error fetching inventory details:', err);
            throw err;
        }
    };

    // -------------------------------- task OPERATIONS --------------------------------

    // Create new task
    const createTask = async (values) => {
        try {
            const res = await createClientTask(values);
           // console.log("Created Task Response:", res);

            // After creating task, refresh inventory to get updated task lists
            await fetchInventoryItems();

            return res;
        } catch (err) {
            console.error('Error creating task:', err);
            throw err;
        }
    };

    // Update task planner
    const updateTaskPlannerData = async (id, values) => {
        try {
            const res = await updateTaskPlanner(id, values);

            // Refresh inventory to get updated task data
            await fetchInventoryItems();

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

            // Refresh inventory to get updated task data
            await fetchInventoryItems();

            return res;
        } catch (err) {
            console.error('Error updating active task:', err);
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
        updateTaskPlannerData,
        updateActiveTaskData,

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
