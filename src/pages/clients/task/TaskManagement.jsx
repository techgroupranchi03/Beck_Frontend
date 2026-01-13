import React, { createContext, useContext } from 'react';
import { Box } from '@mui/material';
import { Tile_View_task } from './Tile_View_task.jsx';
import TaskTabs from './TaskTabs.jsx';
import { useTaskData } from './useTaskData.js';
import { useViewMode } from '../../../context/ViewModeContext.jsx';
import ViewToggle from '../../../resuable_components/ViewToggle.jsx';
import { useAuth } from '../../../context/AuthContext.jsx';
import TileViewTaskStaff from '../../teams/TileViewTaskStaff.jsx';

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
    const { user } = useAuth();
    const taskData = useTaskData();

    const isStaffOrOthers = user?.teamRole === 'Others' || user?.teamRole === 'Staff';

    return (
        <TaskContext.Provider value={taskData}>

            <Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: -2 }}>
                    <ViewToggle showCenterView={true} />
                </Box>

                {viewMode === 'table' ? (
                    <TaskTabs />
                ) : (
                    isStaffOrOthers ? <TileViewTaskStaff /> : <Tile_View_task />
                )}
                
            </Box>

        </TaskContext.Provider>
    );
};

export default TaskManagement;