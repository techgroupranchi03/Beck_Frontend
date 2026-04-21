import React, { useState } from 'react'
import { Container, Box, Tab, Tabs } from '@mui/material'
import TaskPlanner from './TaskPlanner'
import ActiveTask from './ActiveTask'
import ActiveTaskStaff from '../../teams/ActiveTaskStaff'
import TaskPlannerStaff from '../../teams/TaskPlannerStaff'
import { useAuth } from '../../../context/AuthContext'

const TaskTabs = () => {
    const { user } = useAuth();
    const [value, setValue] = useState(() => {
        const savedTab = localStorage.getItem('taskTabIndex');
        return savedTab ? Number(savedTab) : 0;
    });

    const isStaffOrOthers = user?.teamRole === 'Others' || user?.teamRole === 'Staff';

    const handleChange = (event, newValue) => {
        setValue(newValue);
        localStorage.setItem('taskTabIndex', newValue);
    };

    return (

        <Container
            maxWidth={false}
        >
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs
                    value={value}
                    onChange={handleChange}
                    sx={{ borderBottom: 1, borderColor: 'divider' }}
                >
                    <Tab label="Recurring Tasks" />
                    <Tab label="One Time Tasks" />
                </Tabs>
            </Box>

            <Box sx={{ mt: 2 }}>
                {value === 0 && (isStaffOrOthers ? <TaskPlannerStaff /> : <TaskPlanner />)}
                {value === 1 && (isStaffOrOthers ? <ActiveTaskStaff /> : <ActiveTask />)}
            </Box>

        </Container>
        
    )
}

export default TaskTabs