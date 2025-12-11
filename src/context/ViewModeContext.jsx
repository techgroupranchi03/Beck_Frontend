import React, { createContext, useContext, useState, useEffect } from 'react';
import { useMediaQuery, useTheme } from '@mui/material';

const ViewModeContext = createContext(null);

export const useViewMode = () => {
    const context = useContext(ViewModeContext);
    if (!context) {
        throw new Error('useViewMode must be used within ViewModeProvider');
    }
    return context;
};

export const ViewModeProvider = ({ children }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // < 600px
    
    // Initialize view mode from localStorage or default to 'table'
    const [viewMode, setViewMode] = useState(() => {
        const savedMode = localStorage.getItem('viewMode');
        return savedMode || 'table';
    });

    // Save to localStorage whenever viewMode changes
    useEffect(() => {
        localStorage.setItem('viewMode', viewMode);
    }, [viewMode]);

    const toggleViewMode = () => {
        setViewMode(prev => prev === 'table' ? 'tile' : 'table');
    };

    // Force tile view on mobile devices
    const effectiveViewMode = isMobile ? 'tile' : viewMode;

    const value = {
        viewMode: effectiveViewMode,
        setViewMode,
        toggleViewMode,
        isMobile
    };

    return (
        <ViewModeContext.Provider value={value}>
            {children}
        </ViewModeContext.Provider>
    );
};
