import { useState, useEffect, useCallback } from 'react';
import {
    getAllClients,
    addClient,
    editClient,
    deleteClient
} from '../../service/Admin/Admin_auth';

export const useClientsData = () => {
    const [clientsData, setClientsData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [clientsPagination, setClientsPagination] = useState({});

    // Fetch clients
    const fetchClients = useCallback(async (filters = {}, searchText = "", page = 1, append = false) => {
        try {
            if (!append) {
                setLoading(true);
            }
            const res = await getAllClients(filters, searchText, page);
            
            if (append) {
                setClientsData((prev) => [...prev, ...(res.data || [])]);
            } else {
                setClientsData(res.data || []);
            }
            
            setClientsPagination({
                hasNextPage: res.hasNextPage || false,
                hasPreviousPage: res.hasPreviousPage || false,
                page: res.page || 1,
                total: res.total || 0,
                totalPages: res.totalPages || 1,
            });

            console.log("Fetched Clients:", res);

            return res.data;
        } catch (err) {
            console.error('Error fetching clients:', err);
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Initial data fetch
    useEffect(() => {
        fetchClients();
    }, [fetchClients]);

    // ==================== CLIENT OPERATIONS ====================

    // Create new client
    const createClient = async (values) => {
        try {
            const res = await addClient(values);
            if (res.data) {
                setClientsData((prev) => [res.data, ...prev]);
            }
            return res;
        } catch (err) {
            console.error('Error creating client:', err);
            throw err;
        }
    };

    // Update existing client
    const updateClient = async (id, values) => {
        try {
            const res = await editClient({ id, ...values });
            if (res.data) {
                setClientsData((prev) =>
                    prev.map((client) => (client.id === id ? res.data : client))
                );
            }
            return res;
        } catch (err) {
            console.error('Error updating client:', err);
            throw err;
        }
    };

    // Delete client
    const removeClient = async (id) => {
        try {
            const res = await deleteClient({ id });
            setClientsData((prev) => prev.filter((client) => client.id !== id));
            return res;
        } catch (err) {
            console.error('Error deleting client:', err);
            throw err;
        }
    };

    // Refresh client data
    const refreshClientsData = async () => {
        try {
            await fetchClients();
        } catch (err) {
            console.error('Error refreshing clients data:', err);
        }
    };

    return {
        // Data States
        clientsData,
        loading,
        error,

        // Pagination Data
        clientsPagination,

        // Client Operations
        createClient,
        updateClient,
        removeClient,
        refreshClientsData,

        // Fetch clients
        fetchClients,
    };
};
