import React, { createContext, useContext } from 'react';
import { Box } from '@mui/material';
import { Tile_View_task } from './Tile_View_task.jsx';
import TaskTabs from './TaskTabs.jsx';
import { useTaskData } from './useTaskData.js';
import { useViewMode } from '../../../context/ViewModeContext.jsx';
import ViewToggle from '../../../resuable_components/ViewToggle.jsx';

export const TaskContext = createContext(null);

export const useTaskContext = () => {
    const context = useContext(TaskContext);
    if (!context) {
        throw new Error('useTaskContext must be used within TaskManagement');
    }
    return context;
};

const TaskManagement = () => {
    const { viewMode } = useViewMode();
    const taskData = useTaskData();

    return (
        <TaskContext.Provider value={taskData}>

            <Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: -2 }}>
                    <ViewToggle showCenterView={true} />
                </Box>

                {viewMode === 'table' ? (
                    <TaskTabs />
                ) : (
                    <Tile_View_task />
                )}
                
            </Box>

        </TaskContext.Provider>
    );
};

export default TaskManagement;