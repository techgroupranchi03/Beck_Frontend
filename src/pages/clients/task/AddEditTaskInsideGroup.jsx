import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Grid,
    IconButton,
    Slide,
    useTheme,
    TextField,
    Button,
    MenuItem,
    Checkbox,
    FormControlLabel,
    Autocomplete,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useTaskContext } from './TaskManagement';
import { taskTypesOptions, statusOpts } from '../../../constant';
import { useSnackbar } from '../../../resuable_components/Snackbar';

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const AddEditTaskInsideGroup = ({ open, onClose, task, groupTaskId }) => {
    const theme = useTheme();
    const { palette } = theme;
    const { showSnackbar } = useSnackbar();
    const isEdit = !!task && !!task.id;
    const isDuplicate = !!task && !task.id;

    
    const {
        inventoryItems,
        properties,
        createSubTaskInsideGroup,
        updateSubTaskInsideGroup,
        fetchInventoryByProperty,
    } = useTaskContext();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        property_id: '',
        inventory_id: '',
        task_type: '',
        status: 'pending',
        is_photo_required: 0,
        update_inventory: 0,
    });

    const [validationErrors, setValidationErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [inventoryOptions, setInventoryOptions] = useState(inventoryItems || []);

    useEffect(() => {
        if ((isEdit || isDuplicate) && task) {
            setFormData({
                title: task.title || '',
                description: task.description || '',
                property_id: task.property_id || '',
                inventory_id: task.inventory_id || '',
                task_type: task.task_type || '',
                status: task.status || 'pending',
                is_photo_required: task.is_photo_required || 0,
                update_inventory: task.update_inventory || 0,
            });

            // Fetch inventory for the task's property when editing/duplicating
            if (task.property_id) {
                fetchInventoryByProperty(task.property_id)
                    .then((data) => setInventoryOptions(data || []))
                    .catch(() => setInventoryOptions([]));
            } else {
                setInventoryOptions(inventoryItems || []);
            }
        } else {
            // Reset form for new task
            setFormData({
                title: '',
                description: '',
                property_id: '',
                inventory_id: '',
                task_type: '',
                status: 'pending',
                is_photo_required: 0,
                update_inventory: 0,
            });
            setInventoryOptions(inventoryItems || []);
        }
        setValidationErrors({});
    }, [task, isEdit, isDuplicate, open]);

    useEffect(() => {
        if (!formData.property_id) {
            setInventoryOptions(inventoryItems || []);
        }
    }, [inventoryItems, formData.property_id]);

    const handleChange = (field) => (event) => {
        const value = event.target.value;
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
        // Clear validation error for this field
        if (validationErrors[field]) {
            setValidationErrors((prev) => ({
                ...prev,
                [field]: undefined,
            }));
        }
    };

    const handlePhotoChange = (event) => {
        setFormData((prev) => ({
            ...prev,
            is_photo_required: event.target.checked ? 1 : 0,
        }));
    };

    const handleInventoryChange = (event) => {
        setFormData((prev) => ({
            ...prev,
            update_inventory: event.target.checked ? 1 : 0,
        }));
    };

    const handleSave = async () => {
        setValidationErrors({});
        setLoading(true);

        // console.log('Submitting form data:', formData);
        
        try {
            if (isEdit) {
                const res = await updateSubTaskInsideGroup(task.group_task_id, task.id, formData);
                showSnackbar(res.message, 'success');
            } else {
                const res = await createSubTaskInsideGroup(groupTaskId, formData);
                showSnackbar(res.message, 'success');
            }
            onClose();
        } catch (error) {
            if (error.errors) {
                const apiErrors = {};
                if (Array.isArray(error.errors)) {
                    error.errors.forEach((err) => {
                        Object.keys(err).forEach((key) => {
                            apiErrors[key] = err[key];
                        });
                    });
                } else if (typeof error.errors === 'object') {
                    Object.keys(error.errors).forEach((key) => {
                        apiErrors[key] = Array.isArray(error.errors[key])
                            ? error.errors[key][0]
                            : error.errors[key];
                    });
                }
                setValidationErrors(apiErrors);
            }
            console.log('Error response:', error);
            showSnackbar(error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (

        <Dialog open={open} fullWidth maxWidth="md" TransitionComponent={Transition}>

            <DialogTitle>
                {isEdit ? (isDuplicate ? 'Duplicate Task' : 'Edit Task') : 'Add Task'}
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={{ position: 'absolute', right: 8, top: 8, color: palette.grey[500] }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers>

                <Grid container spacing={2} sx={{ mt: 0.5 }}>

                    {/* Title */}
                    <Grid size={{ xs: 12 }}>
                        <TextField
                            label="Title"
                            value={formData.title}
                            onChange={handleChange('title')}
                            fullWidth
                            size="small"
                            required
                            error={!!validationErrors.title}
                            helperText={validationErrors.title}
                        />
                    </Grid>

                    {/* Description */}
                    <Grid size={{ xs: 12 }}>
                        <TextField
                            label="Description"
                            value={formData.description || ''}
                            onChange={handleChange('description')}
                            fullWidth
                            size="small"
                            multiline
                            rows={3}
                            error={!!validationErrors.description}
                            inputProps={{ maxLength: 500 }}
                            helperText={
                                <>
                                    <span>{validationErrors.description}</span>
                                    <span>{formData.description.length}/500</span>
                                </>
                            }
                            slotProps={{
                                formHelperText: {
                                    sx: {
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                    },
                                },
                            }}
                        />
                    </Grid>

                    {/* Property */}
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <Autocomplete
                            size="small"
                            options={properties}
                            getOptionLabel={(option) => (option.name ? String(option.name) : '')}
                            value={properties.find((prop) => prop.id === formData.property_id) || null}
                            onChange={(e, newValue) => {
                                const propId = newValue ? newValue.id : '';
                                handleChange('property_id')({ target: { value: propId } });

                                if (newValue) {
                                    fetchInventoryByProperty(newValue.id)
                                        .then((data) => {
                                            setInventoryOptions(data || []);
                                            // Clear inventory_id if it's not in the fetched list
                                            if (!data || !data.find((it) => it.id === formData.inventory_id)) {
                                                setFormData((prev) => ({ ...prev, inventory_id: '' }));
                                            }
                                        })
                                        .catch(() => setInventoryOptions([]));
                                } else {
                                    setInventoryOptions(inventoryItems || []);
                                    setFormData((prev) => ({ ...prev, inventory_id: '' }));
                                }
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Select Property"
                                    error={!!validationErrors.property_id}
                                    helperText={validationErrors.property_id}
                                />
                            )}
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                        />
                    </Grid>

                    {/* Inventory */}
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <Autocomplete
                            size="small"
                            options={inventoryOptions}
                            getOptionLabel={(option) => (option.name ? String(option.name) : '')}
                            value={inventoryOptions.find((item) => item.id === formData.inventory_id) || null}
                            renderOption={(props, option) => (
                                <li
                                    {...props}
                                    key={option.id}
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                    }}
                                >
                                    <span
                                        style={{
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                        }}
                                    >
                                        {option.name}
                                    </span>
                                    {option.property_image_url && (
                                        <img
                                            src={option.property_image_url}
                                            alt={option.name || ''}
                                            style={{
                                                width: 40,
                                                height: 40,
                                                objectFit: 'cover',
                                                borderRadius: 100,
                                                marginLeft: 8,
                                            }}
                                        />
                                    )}
                                </li>
                            )}
                            onChange={(e, newValue) => {
                                handleChange('inventory_id')({
                                    target: { value: newValue ? newValue.id : '' },
                                });

                                // Auto-select property when inventory is selected
                                if (newValue && newValue.property_id) {
                                    handleChange('property_id')({
                                        target: { value: newValue.property_id },
                                    });
                                }
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Select Inventory"
                                    error={!!validationErrors.inventory_id}
                                    helperText={validationErrors.inventory_id}
                                />
                            )}
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                        />
                    </Grid>

                    {/* Task Type */}
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                            select
                            label="Task Type"
                            value={formData.task_type}
                            onChange={handleChange('task_type')}
                            fullWidth
                            size="small"
                            required
                            error={!!validationErrors.task_type}
                            helperText={validationErrors.task_type}
                        >
                            {taskTypesOptions.map((type) => (
                                <MenuItem key={type.value} value={type.value} dense>
                                    <type.icon sx={{ mr: 1, color: 'text.secondary', fontSize: 16 }} />
                                    {type.label}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>

                    {/* Status */}
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                            select
                            label="Status"
                            value={formData.status}
                            onChange={handleChange('status')}
                            fullWidth
                            size="small"
                            error={!!validationErrors.status}
                            helperText={validationErrors.status}
                        >
                            {statusOpts.map((status) => (
                                <MenuItem key={status.value} value={status.value} dense>
                                    {status.label}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>

                    {/* Checkboxes */}
                    <Grid size={{ xs: 12 }} container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={formData.is_photo_required === 1}
                                        onChange={handlePhotoChange}
                                    />
                                }
                                label="A Photo Proof is Required"
                            />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6 }}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={formData.update_inventory === 1}
                                        onChange={handleInventoryChange}
                                    />
                                }
                                label="Update Inventory Quantity"
                            />
                        </Grid>
                    </Grid>
                    
                </Grid>

            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2 }}>

                <Button
                    variant="contained"
                    disableElevation
                    size="small"
                    onClick={handleSave}
                    disabled={loading}
                    sx={{
                        textTransform: 'none',
                        backgroundColor: palette.primary.main,
                        '&:hover': { backgroundColor: palette.secondary.main },
                        borderRadius: 10,
                    }}
                >
                    {loading ? 'Saving...' : isEdit ? 'Update Task' : isDuplicate ? 'Duplicate Task' : 'Add Task'}
                </Button>

            </DialogActions>

        </Dialog>
    );
};

export default AddEditTaskInsideGroup;