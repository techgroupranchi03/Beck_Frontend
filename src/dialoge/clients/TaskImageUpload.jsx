import React, { useState, useEffect } from 'react';
import {
    Button,
    Box,
    IconButton,
    Typography,
    CircularProgress,
    Stack
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import { useSnackbar } from '../../resuable_components/Snackbar';

const TaskImageUpload = ({ task, updateTaskCompletionStatus, onSuccess, markdoneClicked }) => {
    const MAX_PHOTOS = 3;
    const [photos, setPhotos] = useState([]);
    const [photoPreviews, setPhotoPreviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const { showSnackbar } = useSnackbar();
    // console.log('task in TaskImageUpload:', task);

    // console.log('markdoneClicked in TaskImageUpload:', markdoneClicked);

    // Initialize with existing photos if available
    useEffect(() => {
        if (task?.completion_image_urls) {
            const existingPhotos = Array.isArray(task.completion_image_urls)
                ? task.completion_image_urls
                : [task.completion_image_urls];
            setPhotoPreviews(existingPhotos);
            // set photos image names completion_images
            setPhotos(task.completion_images);
        } else {
            setPhotoPreviews([]);
            setPhotos([]);
        }
    }, [task]);

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
            if (!file.type.startsWith('image/')) {
                showSnackbar(`${file.name} is not a valid image file`, 'error');
                return;
            }

            setPhotos(prev => [...prev, file]);
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
        URL.revokeObjectURL(photoPreviews[index]);
        setPhotos(prev => prev.filter((_, i) => i !== index));
        setPhotoPreviews(prev => prev.filter((_, i) => i !== index));
    };

    // Handle form submission
    const handleSubmit = async () => {
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('status', markdoneClicked ? 'completed' : task.status);

            photos.forEach((photo) => {
                formData.append('task_completion_images', photo);
            });

            const response = await updateTaskCompletionStatus(task.id, formData);
            showSnackbar(response.message, 'success');
            onSuccess(true);
        } catch (error) {
            console.error('Error updating task completion:', error);
            showSnackbar(error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box>
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
                                        backgroundColor: 'primary.main',
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

            {/* Upload Button  show till max photos reached */}
            {photoPreviews.length < MAX_PHOTOS ? (
                <Box
                    sx={{
                        border: '2px dashed',
                        borderColor: 'divider',
                        borderRadius: 1,
                        p: 1,
                        textAlign: 'center',
                        justifyContent: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        cursor: { xs: 'default', md: 'pointer' },
                    }}
                    onClick={(e) => {
                        if (window.innerWidth >= 900) {
                            document.getElementById('file-input-tab').click();
                        }
                    }}
                >
                    <input
                        id="file-input-tab"
                        type="file"
                        accept="image/*"
                        multiple
                        hidden
                        onChange={handleFileChange}
                        disabled={loading}
                        style={{ display: window.innerWidth < 900 ? 'none' : undefined }}
                    />

                    <CloudUploadIcon sx={{ fontSize: 30, color: 'text.secondary', }} />
                    <Typography variant="body1" color="text.secondary" sx={{ mt: 1, mb: 0.5 }}>
                        Upload completion photos
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        Supported formats: JPG, PNG, GIF (Max 3 photos)
                    </Typography>

                    <Stack direction="row" spacing={2} sx={{ width: '100%', justifyContent: 'center', display: { xs: 'flex', md: 'none' } }}>
                        <IconButton
                            component="label"
                            color="primary"
                            disabled={loading}
                            sx={{
                                bgcolor: 'primary.main',
                                color: 'white',
                                width: 56,
                                height: 56,
                            }}
                        >
                            <CameraAltIcon sx={{ fontSize: 28 }} />
                            <input
                                type="file"
                                accept="image/*"
                                capture="environment"
                                multiple
                                hidden
                                onChange={handleFileChange}
                                disabled={loading}
                            />
                        </IconButton>

                        <IconButton
                            component="label"
                            color="primary"
                            disabled={loading}
                            sx={{
                                border: '2px solid',
                                borderColor: 'primary.main',
                                width: 56,
                                height: 56,
                            }}
                        >
                            <PhotoLibraryIcon sx={{ fontSize: 28 }} />
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                hidden
                                onChange={handleFileChange}
                                disabled={loading}
                            />
                        </IconButton>
                    </Stack>
                </Box>
            ) : (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    You have reached the maximum of {MAX_PHOTOS} photos.
                </Typography>
            )}

            {/* Action Buttons */}
            <Stack direction="row" spacing={2} sx={{ mt: 3, justifyContent: 'flex-end' }}>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disableElevation
                    disabled={loading || (photos.length === 0 && task?.status === 'completed')}
                    startIcon={loading && <CircularProgress size={20} />}
                    sx={{
                        borderRadius: 10,
                        height: 30
                    }}
                >
                    {loading ? 'Submitting...' : 'Submit'}
                </Button>
            </Stack>
        </Box>
    );
};

export default TaskImageUpload;
