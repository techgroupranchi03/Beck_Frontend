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
    Checkbox,
    FormControlLabel,
    Autocomplete,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useTaskContext } from './TaskManagement';
import { useSnackbar } from '../../../resuable_components/Snackbar';
import PaginatedAutocomplete from '../../../resuable_components/PaginatedAutocomplete';

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const AddEditTaskInsideGroup = ({ open, onClose, task, groupTaskId, groupData }) => {
    const theme = useTheme();
    const { palette } = theme;
    const { showSnackbar } = useSnackbar();
    const isEdit = !!task && !!task.id;
    const isDuplicate = !!task && !task.id;

    const {
        inventoryItems,
        teamMembers,
        properties,
        propertyPagination,
        createSubTaskInsideGroup,
        updateSubTaskInsideGroup,
        fetchProperties,
        fetchInventoryByProperty,
    } = useTaskContext();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        property_id: '',
        inventory_id: '',
        assigned_to: '',
        requires_photo: 0,
        allows_inventory_update: 0,
    });

    const [validationErrors, setValidationErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [selectedProperty, setSelectedProperty] = useState(null);
    const [selectedInventory, setSelectedInventory] = useState(null);
    const [propertyInventoryItems, setPropertyInventoryItems] = useState([]);

    useEffect(() => {
        if ((isEdit || isDuplicate) && task) {
            setFormData({
                title: task.title || '',
                description: task.description || '',
                property_id: groupData?.property?.id || task.property?.id || '',
                inventory_id: task.inventory?.id || '',
                assigned_to: task.assigned_to?.id || '',
                requires_photo: task.requires_photo || 0,
                allows_inventory_update: task.allows_inventory_update || 0,
            });

            // Set selected property
            setSelectedProperty(groupData?.property || task.property || null);
            
            // Set selected inventory
            setSelectedInventory(task.inventory || null);

            // Fetch inventory for the property
            const propertyId = groupData?.property?.id || task.property?.id;
            if (propertyId) {
                fetchInventoryByProperty(propertyId)
                    .then((data) => setPropertyInventoryItems(data || []))
                    .catch(() => setPropertyInventoryItems([]));
            }
        } else {
            setFormData({
                title: '',
                description: '',
                property_id: groupData?.property?.id || '',
                inventory_id: '',
                assigned_to: '',
                requires_photo: 0,
                allows_inventory_update: 0,
            });

            setSelectedProperty(groupData?.property || null);
            setSelectedInventory(null);
            
            // Fetch initial data
            fetchProperties(1, false, '');

            // Fetch inventory for the property
            if (groupData?.property?.id) {
                fetchInventoryByProperty(groupData.property.id)
                    .then((data) => setPropertyInventoryItems(data || []))
                    .catch(() => setPropertyInventoryItems([]));
            }
        }

        setValidationErrors({});
    }, [task, isEdit, isDuplicate, open, groupData, fetchProperties, fetchInventoryByProperty]);

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
            requires_photo: event.target.checked ? 1 : 0,
        }));
    };

    const handleInventoryChange = (event) => {
        setFormData((prev) => ({
            ...prev,
            allows_inventory_update: event.target.checked ? 1 : 0,
        }));
    };

    const handleSave = async () => {
        setValidationErrors({});
        setLoading(true);

        try {
            if (isEdit) {
                const res = await updateSubTaskInsideGroup(task.task_group_id, task.id, formData);
               
                showSnackbar(res.message, 'success');
            } else {
                const res = await createSubTaskInsideGroup(groupTaskId, formData);
                showSnackbar(res.message, 'success');
            }
            onClose(true);
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
                        <PaginatedAutocomplete
                            label="Select Property"
                            disabled
                            value={selectedProperty}
                            options={properties}
                            getOptionLabel={(option) => option.name || ''}
                            onChange={(event, newValue) => {
                                setSelectedProperty(newValue);
                                setFormData(prev => ({ 
                                    ...prev, 
                                    property_id: newValue ? newValue.id : '' 
                                }));
                                if (validationErrors.property_id) {
                                    setValidationErrors(prev => ({
                                        ...prev,
                                        property_id: undefined,
                                    }));
                                }
                            }}
                            fetchData={fetchProperties}
                            pagination={propertyPagination}
                            error={!!validationErrors.property_id}
                            helperText={validationErrors.property_id}
                        />
                    </Grid>

                    {/* Inventory */}
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <Autocomplete
                            size="small"
                            options={propertyInventoryItems}
                            getOptionLabel={(option) => option.name || ''}
                            value={selectedInventory}
                            onChange={(event, newValue) => {
                                setSelectedInventory(newValue);
                                setFormData(prev => ({
                                    ...prev,
                                    inventory_id: newValue ? newValue.id : ''
                                }));
                                if (validationErrors.inventory_id) {
                                    setValidationErrors(prev => ({
                                        ...prev,
                                        inventory_id: undefined,
                                    }));
                                }
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Select Inventory"
                                    error={!!validationErrors.inventory_id}
                                    helperText={validationErrors.inventory_id || 'Filtered by selected property'}
                                />
                            )}
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                        />
                    </Grid>

                    {/* Assigned To  use autocomplete with teamMembers */}
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <Autocomplete
                            size="small"
                            options={[{ id: '', name: 'Myself' }, ...(teamMembers || [])]}
                            getOptionLabel={(option) => (option.name ? String(option.name) : '')}
                            value={[{ id: '', name: 'Myself' }, ...(teamMembers || [])].find((item) => item.id === (formData.assigned_to || '')) || null}
                            onChange={(e, newValue) => {
                                handleChange('assigned_to')({ target: { value: newValue ? newValue.id : '' } });
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Assign To"
                                    error={!!validationErrors.assigned_to}
                                    helperText={validationErrors.assigned_to}
                                />
                            )}
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                        />
                    </Grid>

                    {/* Checkboxes */}
                    <Grid size={{ xs: 12 }} container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={formData.requires_photo === 1}
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
                                        checked={formData.allows_inventory_update === 1}
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