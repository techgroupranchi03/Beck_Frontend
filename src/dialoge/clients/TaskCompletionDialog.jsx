import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    IconButton,
    Typography,
    CircularProgress,
    Slide
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import { useSnackbar } from '../../resuable_components/Snackbar';

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const TaskCompletionDialog = ({ open, onClose, task, updateTaskCompletionStatus,}) => {
    const MAX_PHOTOS = 3;
    const [photos, setPhotos] = useState([]);
    const [photoPreviews, setPhotoPreviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const { showSnackbar } = useSnackbar();

    // Initialize with existing photos if available
    useEffect(() => {
        if (task?.completion_photo) {
            // Handle if completion_photo is an array or string
            const existingPhotos = Array.isArray(task.completion_photo)
                ? task.completion_photo
                : [task.completion_photo];
            setPhotoPreviews(existingPhotos);
            setPhotos([]);
        } else {
            setPhotoPreviews([]);
            setPhotos([]);
        }
    }, [task, open]);

    // Handle file selection (multiple files)
    const handleFileChange = (event) => {
        const files = Array.from(event.target.files);
        if (files.length === 0) return;

        const remainingSlots = MAX_PHOTOS - photoPreviews.length;

        if (remainingSlots <= 0) {
            showSnackbar('You can upload only 3 photos', 'error');
            event.target.value = '';
            return;
        }

        const filesToProcess = files.slice(0, remainingSlots);

        filesToProcess.forEach(file => {
            // ✅ Only validate file type
            if (!file.type.startsWith('image/')) {
                showSnackbar(`${file.name} is not a valid image file`, 'error');
                return;
            }

            // Store the actual file object
            setPhotos(prev => [...prev, file]);

            // Create preview URL using URL.createObjectURL (same as Add_property.jsx)
            const previewUrl = URL.createObjectURL(file);
            setPhotoPreviews(prev => [...prev, previewUrl]);
        });

        if (files.length > remainingSlots) {
            showSnackbar('Only 3 photos are allowed', 'warning');
        }

        event.target.value = '';
    };
    


    // Handle photo removal (by index)
    const handleRemovePhoto = (index) => {
        // Revoke the object URL to free memory
        URL.revokeObjectURL(photoPreviews[index]);
        
        setPhotos(prev => prev.filter((_, i) => i !== index));
        setPhotoPreviews(prev => prev.filter((_, i) => i !== index));
    };

    // Handle form submission
    const handleSubmit = async () => {
        setLoading(true);
        try {
            const formData = new FormData();

            // Append status
            formData.append('status', 'completed');

            // Append all photos
            photos.forEach((photo) => {
                formData.append('task_completion_images', photo);
            });

            const response = await updateTaskCompletionStatus(task.id, formData);
            showSnackbar(response.message, 'success');
            onClose(true); // Pass true to indicate success
        } catch (error) {
            console.error('Error updating task completion:', error);
            showSnackbar(error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (!loading) {
            // Clean up object URLs to prevent memory leaks
            photoPreviews.forEach(url => {
                if (url.startsWith('blob:')) {
                    URL.revokeObjectURL(url);
                }
            });
            onClose(false);
        }
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
                Task Completion Photo Is Required
                <IconButton
                    aria-label="close"
                    onClick={handleClose}
                    disabled={loading}
                    sx={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                    }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Please upload photo(s) to confirm task completion for: <strong>{task?.title}</strong>
                </Typography>

                {/* Photo Previews Grid */}
                {photoPreviews.length > 0 && (
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                            gap: 2,
                            mb: 2,
                        }}
                    >
                        {photoPreviews.map((preview, index) => (
                            <Box
                                key={index}
                                sx={{
                                    position: 'relative',
                                    width: '100%',
                                    height: 150,
                                    borderRadius: 1,
                                    overflow: 'hidden',
                                    border: '1px solid',
                                    borderColor: 'divider',
                                }}
                            >
                                <img
                                    src={preview}
                                    alt={`Completion preview ${index + 1}`}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                    }}
                                />
                                <IconButton
                                    onClick={() => handleRemovePhoto(index)}
                                    disabled={loading}
                                    size="small"
                                    sx={{
                                        position: 'absolute',
                                        top: 4,
                                        right: 4,
                                        backgroundColor: 'background.paper',
                                        '&:hover': {
                                            backgroundColor: 'error.main',
                                            color: 'white',
                                        },
                                    }}
                                >
                                    <CloseIcon fontSize="small" />
                                </IconButton>
                            </Box>
                        ))}
                    </Box>
                )}

                {/* Upload Button */}
                {photoPreviews.length === 0 ? (
                    <Box
                        sx={{
                            border: '2px dashed',
                            borderColor: 'divider',
                            borderRadius: 1,
                            p: 4,
                            textAlign: 'center',
                            justifyContent: 'center',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            cursor: 'pointer',
                            '&:hover': {
                                borderColor: 'primary.main',
                                backgroundColor: 'action.hover',
                            },
                        }}
                        component="label"
                    >
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            hidden
                            onChange={handleFileChange}
                            disabled={loading}
                        />
                        <CloudUploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                        <Typography variant="body1" color="text.secondary">
                            Click to upload completion photos
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Supported formats: JPG, PNG, GIF (Max 3 photos)
                        </Typography>
                    </Box>
                ) : (
                    <Button
                        component="label"
                        variant="outlined"
                        startIcon={<CloudUploadIcon />}
                        fullWidth
                        disabled={loading || photoPreviews.length >= 3}
                    >
                        Add More Photos
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            hidden
                            onChange={handleFileChange}
                        />
                    </Button>
                )}
            </DialogContent>

            <DialogActions>
                <Button onClick={handleClose} disabled={loading}>
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={loading || photos.length === 0}
                    startIcon={loading && <CircularProgress size={20} />}
                >
                    {loading ? 'Submitting...' : 'Submit'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default TaskCompletionDialog;
