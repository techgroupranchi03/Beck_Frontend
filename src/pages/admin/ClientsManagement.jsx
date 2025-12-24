import React, { createContext, useContext, useState, useEffect } from 'react';
import { Box } from '@mui/material';
import ClientsTileView from './ClientsTileView.jsx';
import Clients from './Clients.jsx';
import { useViewMode } from '../../context/ViewModeContext.jsx';
import ViewToggle from '../../resuable_components/ViewToggle.jsx';
import { getAllClients } from '../../service/Admin/Admin_auth.js';

// Create context for sharing client data across components
export const ClientContext = createContext(null);

// Custom hook to use client context
export const useClientContext = () => {
    const context = useContext(ClientContext);
    if (!context) {
        throw new Error('useClientContext must be used within ClientsManagement');
    }
    return context;
};

const ClientsManagement = () => {
    const { viewMode } = useViewMode();
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(false);

    // Fetch all clients
    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        setLoading(true);
        try {
            const res = await getAllClients();
            setClients(res.data);
        } catch (err) {
            console.error("Error fetching clients:", err);
        } finally {
            setLoading(false);
        }
    };

    // Context value to share
    const contextValue = {
        clients,
        setClients,
        loading,
        setLoading,
        fetchClients,
    };

    return (
        <ClientContext.Provider value={contextValue}>
            <Box>
                {/* View Toggle Button */}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: -2 }}>
                    <ViewToggle />
                </Box>
                
                {/* Conditional Rendering based on view mode */}
                {viewMode === 'tile' ? <ClientsTileView /> : <Clients />}
            </Box>
        </ClientContext.Provider>
    );
};

export default ClientsManagement;
