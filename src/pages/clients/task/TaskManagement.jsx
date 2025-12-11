import React, { createContext, useContext } from 'react';
import { Box } from '@mui/material';
import { Tile_View_task } from './Tile_View_task.jsx';
import TaskTabs from './TaskTabs.jsx';
import { useTaskData } from './useTaskData.js';
import { useViewMode } from '../../../context/ViewModeContext.jsx';
import ViewToggle from '../../../resuable_components/ViewToggle.jsx';

// Create context for sharing task data across components
export const TaskContext = createContext(null);

// Custom hook to use task context
export const useTaskContext = () => {
    const context = useContext(TaskContext);
    if (!context) {
        throw new Error('useTaskContext must be used within TaskManagement');
    }
    return context;
};

const TaskManagement = () => {
    const { viewMode } = useViewMode();
    
    // Initialize shared task data
    const taskData = useTaskData();

    return (
        <TaskContext.Provider value={taskData}>
            <Box>
                {/* View Toggle Button */}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: -2 }}>
                    <ViewToggle />
                </Box>
                
                {/* Conditional Rendering based on view mode */}
                {viewMode === 'tile' ? <Tile_View_task /> : <TaskTabs />}
            </Box>
        </TaskContext.Provider>
    );
};

export default TaskManagement;