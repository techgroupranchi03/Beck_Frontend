import React, { useState } from 'react'
import { Container, Box, Tab, Tabs } from '@mui/material'
import TaskPlanner from './TaskPlanner'
import ActiveTask from './ActiveTask'

const TaskTabs = () => {
    const [value, setValue] = useState(() => {
        const savedTab = localStorage.getItem('taskTabIndex');
        return savedTab ? Number(savedTab) : 0;
    });


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
                {value === 0 && <TaskPlanner />}
                {value === 1 && <ActiveTask />}
            </Box>
        </Container>
    )
}

export default TaskTabs