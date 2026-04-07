import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Tabs,
    Tab,
    Box,
    Slide,
    Button,

} from '@mui/material';
import Loader from '../../resuable_components/Loader.jsx';
import CloseIcon from '@mui/icons-material/Close';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import InventoryIcon from '@mui/icons-material/Inventory';
import TaskImageUpload from './TaskImageUpload';
import TaskQuantityUpdate from './TaskQuantityUpdate';
import { useSnackbar } from '../../resuable_components/Snackbar';

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

const TaskCompletionTabs = ({ open, onClose, task, addConfirmationImageInTask, updateConfirmationImageInTask, taskOccurrence, activeTab = 0 }) => {
    const [currentTab, setCurrentTab] = useState(0);
    const [loading, setLoading] = useState(false);
    const { showSnackbar } = useSnackbar();
    // Check if both tabs are required
    const hasBothTabs = !!task?.is_photo_required && !!task?.update_inventory;
    const totalTabs = (task?.is_photo_required ? 1 : 0) + (task?.update_inventory ? 1 : 0);
    const isLastTab = currentTab === totalTabs - 1;

    // State for images
    const [photos, setPhotos] = useState([]);
    const [photoPreviews, setPhotoPreviews] = useState([]);
    const [existingImageIds, setExistingImageIds] = useState([]);
    const [removedImageIds, setRemovedImageIds] = useState([]);
    const [hasExistingImages, setHasExistingImages] = useState(false);

    // State for quantity
    const [quantityData, setQuantityData] = useState({
        unit: '',
        quantity: '',
    });

    // Initialize states when taskOccurrence changes
    useEffect(() => {
        if (open) {
            // Initialize photos from task occurrence
            if (taskOccurrence) {
                const occurrenceImages = taskOccurrence?.proofs?.file_urls;
                if (occurrenceImages && occurrenceImages.length > 0) {
                    setPhotoPreviews(occurrenceImages);
                    setPhotos([]);
                    setHasExistingImages(true);

                    // Initialize image IDs if available
                    const imageIds = taskOccurrence?.proofs?.file_ids;
                    if (imageIds && imageIds.length > 0) {
                        setExistingImageIds(imageIds);
                    } else {
                        setExistingImageIds(occurrenceImages.map((_, idx) => idx));
                    }
                } else {
                    setPhotoPreviews([]);
                    setPhotos([]);
                    setExistingImageIds([]);
                    setRemovedImageIds([]);
                    setHasExistingImages(false);
                }
            }

            // Initialize quantity data from task (independent of taskOccurrence)
            if (task?.inventory_id) {
                setQuantityData({
                    unit: task.inventory_unit || '',
                    quantity: task.inventory_quantity || '',
                });
            } else {
                setQuantityData({ unit: '', quantity: '' });
            }
        }
    }, [taskOccurrence, task, open]);

    // Update currentTab when activeTab prop changes
    useEffect(() => {
        if (open) {
            setCurrentTab(activeTab);
        }
    }, [open, activeTab]);

    const handleTabChange = (event, newValue) => {
        setCurrentTab(newValue);
    };

    const handleNext = () => {
        if (currentTab < totalTabs - 1) {
            setCurrentTab(currentTab + 1);
        }
    };

    const handleClose = () => {
        setCurrentTab(0);
        setPhotos([]);
        setPhotoPreviews([]);
        setExistingImageIds([]);
        setRemovedImageIds([]);
        setHasExistingImages(false);
        setQuantityData({ unit: '', quantity: '' });
        onClose(false);
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const formData = new FormData();

            // Add new photos if task requires it
            if (task?.is_photo_required && photos && photos.length > 0) {
                photos.forEach((photo) => {
                    formData.append('task_completion_images', photo);
                });
            }

            // Add quantity if task requires it
            if (task?.update_inventory && quantityData.quantity) {
                formData.append('update_quantity', quantityData.quantity);
            }

            let response;

            // If task occurrence has existing images, use update API
            if (hasExistingImages) {
                if (removedImageIds.length > 0) {
                    formData.append('update_image_ids', removedImageIds.join(','));
                }
                response = await updateConfirmationImageInTask(taskOccurrence.id, formData);
            } else if (taskOccurrence?.id) {
                response = await addConfirmationImageInTask(taskOccurrence.id, formData);
            } else {
                throw new Error('Task occurrence ID is missing');
            }

            showSnackbar(response.message, 'success');
            setCurrentTab(0);
            setPhotos([]);
            setPhotoPreviews([]);
            setExistingImageIds([]);
            setRemovedImageIds([]);
            setHasExistingImages(false);
            setQuantityData({ unit: '', quantity: '' });
            onClose(true);
        } catch (error) {
            showSnackbar(error.message || 'Failed to update task', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog
            open={open}
            // onClose={handleClose}
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
                            photos={photos}
                            setPhotos={setPhotos}
                            photoPreviews={photoPreviews}
                            setPhotoPreviews={setPhotoPreviews}
                            existingImageIds={existingImageIds}
                            setExistingImageIds={setExistingImageIds}
                            removedImageIds={removedImageIds}
                            setRemovedImageIds={setRemovedImageIds}
                            hasExistingImages={hasExistingImages}
                            loading={loading}
                        />
                    </TabPanel>
                )}

                {!!task?.update_inventory && (
                    <TabPanel value={currentTab} index={task?.is_photo_required ? 1 : 0}>
                        <TaskQuantityUpdate
                            task={task}
                            inventory={{ id: task.inventory_id, name: task.inventory_name, unit: task.inventory_unit, quantity: task.inventory_quantity }}
                            quantityData={quantityData}
                            setQuantityData={setQuantityData}
                            loading={loading}
                        />
                    </TabPanel>
                )}
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2, justifyContent: 'flex-end' }}>
                {hasBothTabs && !isLastTab ? (
                    <Button
                        onClick={handleNext}
                        variant="contained"
                        disableElevation
                        disabled={loading}
                        sx={{
                            borderRadius: 10,
                            height: 36,
                            minWidth: 100
                        }}
                    >
                        Next
                    </Button>
                ) : (
                    <Button
                        onClick={handleSave}
                        variant="contained"
                        disableElevation
                        disabled={loading}
                        startIcon={loading && <Loader inline size={20} />}
                        sx={{
                            borderRadius: 10,
                            height: 36,
                            minWidth: 100
                        }}
                    >
                        {loading ? 'Saving...' : (hasExistingImages ? 'Update' : 'Save')}
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
};

export default TaskCompletionTabs;
