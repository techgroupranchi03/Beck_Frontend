import React from 'react';
import { useMediaQuery, useTheme } from '@mui/material';
import AllTask from './TaskPlanner.jsx';
import { Tile_View_task } from './Tile_View_task.jsx';
import TaskTabs from './TaskTabs.jsx';

const TaskManagement = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // < 900px

    return isMobile ? <Tile_View_task /> : <TaskTabs />;
};

export default TaskManagement;