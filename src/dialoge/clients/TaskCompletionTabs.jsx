import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
    Tabs,
    Tab,
    Box,
    Slide,
    Typography
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import InventoryIcon from '@mui/icons-material/Inventory';
import TaskImageUpload from './TaskImageUpload';
import TaskQuantityUpdate from './TaskQuantityUpdate';

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

function TabPanel({ children, value, index, ...other }) {
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`task-tabpanel-${index}`}
            aria-labelledby={`task-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
        </div>
    );
}

const TaskCompletionTabs = ({ open, onClose, task, updateTaskCompletionStatus, activeTab = 0, markdoneClicked }) => {
    const [currentTab, setCurrentTab] = useState(0);

   //console.log('TaskCompletionTabs rendered with task:', task);

    // Update currentTab when activeTab prop changes
    useEffect(() => {
        if (open) {
            setCurrentTab(activeTab);
        }
    }, [open, activeTab]);

    const handleTabChange = (event, newValue) => {
        setCurrentTab(newValue);
    };

    const handleClose = () => {
        setCurrentTab(0);
        onClose(false);
    };

    const handleSuccess = (success) => {
        setCurrentTab(0);
        onClose(success);
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
            TransitionComponent={Transition}
        >
            <DialogTitle>
                Task Completion
                <IconButton
                    aria-label="close"
                    onClick={handleClose}
                    sx={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                    }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <Tabs
                value={currentTab}
                onChange={handleTabChange}
                variant="fullWidth"
                sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
            >
                {!!task?.is_photo_required && (
                    <Tab
                        icon={<CameraAltIcon />}
                        label="Upload Images"
                        iconPosition="start"
                        sx={{ textTransform: 'none' }}
                    />
                )}
                {!!task?.update_inventory && (
                    <Tab
                        icon={<InventoryIcon />}
                        label="Update Quantity"
                        iconPosition="start"
                        sx={{ textTransform: 'none' }}
                    />
                )}
            </Tabs>

            <DialogContent dividers>
                
                {!!task?.is_photo_required && (
                    <TabPanel value={currentTab} index={0}>
                        <TaskImageUpload
                            task={task}
                            updateTaskCompletionStatus={updateTaskCompletionStatus}
                            onSuccess={handleSuccess}
                            onCancel={handleClose}
                            markdoneClicked={markdoneClicked}
                        />
                    </TabPanel>
                )}

                {!!task?.update_inventory && (
                    <TabPanel value={currentTab} index={task?.is_photo_required ? 1 : 0}>
                        <TaskQuantityUpdate
                            task={task}
                            inventory={{ id: task.inventory_id, name: task.inventory_name, unit: task.inventory_unit, quantity: task.inventory_quantity }}
                            onSuccess={handleSuccess}
                            onCancel={handleClose}
                            updateTaskCompletionStatus={updateTaskCompletionStatus}
                            markdoneClicked={markdoneClicked}
                        />
                    </TabPanel>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default TaskCompletionTabs;
