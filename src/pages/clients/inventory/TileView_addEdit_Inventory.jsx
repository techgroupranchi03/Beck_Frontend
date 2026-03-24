import { Close, Inventory, CloudUpload, ExpandMore } from '@mui/icons-material';
import { Dialog, DialogContent, DialogTitle, IconButton, Typography, Slide, Grid, TextField, useTheme, DialogActions, Button, Select, MenuItem, FormControl, InputLabel, Autocomplete, Box, Accordion, AccordionSummary, AccordionDetails, Checkbox, FormControlLabel, Radio, RadioGroup, FormLabel } from '@mui/material'
import React, { useState, useEffect, useRef, useCallback } from 'react'
import { scheduleTypes, daysOfWeek, monthsOfYear, datesOfMonth, categoriess } from '../../../constant';
import CloseIcon from '@mui/icons-material/Close';
import { useInventoryContext } from './InventoryManagement';
import { useSnackbar } from '../../../resuable_components/Snackbar';

const Transition = React.forwardRef(function transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});
const TileView_addEdit_Inventory = ({ open, onClose, inventory }) => {
    const isEdit = !!inventory;
    const theme = useTheme();
    const { palette } = theme;
    const { showSnackbar } = useSnackbar();
    const {
        properties,
        units,
        containerOptions,
        teamMembers,
        loading,
        createInventory,
        updateInventory,
        propertyPagination,
        fetchProperties,
    } = useInventoryContext();
    const [isLoadingMoreProperties, setIsLoadingMoreProperties] = useState(false);
    const [propertyOptions, setPropertyOptions] = useState(properties || []);
    const [propertySearchText, setPropertySearchText] = useState('');
    const propertySearchTimer = useRef(null);
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        property_id: '',
        located_at: '',
        lower_limit: '',
        unit: '',
        quantity: '',
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [validationErrors, setValidationErrors] = useState({});
    const [selectedUnit, setSelectedUnit] = useState('');
    const [createTasks, setCreateTasks] = useState(false);
    const [taskFormData, setTaskFormData] = useState({
        task_title: '',
        task_description: '',
        task_assigned_to: '',
        task_schedule_type: 'weekly',
        task_start_date: '',
        task_end_date: '',
        task_requires_photo: false,
        task_allows_inventory_update: false,
    });
    
    const [repeatData, setRepeatData] = useState({});

    useEffect(() => {
        if (isEdit && inventory) {
            setFormData({
                name: inventory.name || '',
                category: inventory.category || '',
                property_id: inventory.property_id || '',
                located_at: inventory.located_at || '',
                lower_limit: inventory.lower_limit || '',
                unit: inventory.unit || '',
                quantity: inventory.quantity || '',
            });
            setImagePreview(inventory.inventory_image_url || null);
            setSelectedUnit(inventory.unit || '');
        } else {
            // Reset form for create mode
            setFormData({
                name: '',
                category: '',
                property_id: '',
                located_at: '',
                lower_limit: '',
                unit: '',
                quantity: '',
            });
            setImagePreview(null);
            setSelectedUnit('');
            setImageFile(null);
        }
        setValidationErrors({});
        // Reset task form data
        setCreateTasks(false);
        setTaskFormData({
            task_title: '',
            task_description: '',
            task_assigned_to: '',
            task_schedule_type: 'weekly',
            task_start_date: '',
            task_end_date: '',
            task_requires_photo: false,
            task_allows_inventory_update: false,
        });
        setRepeatData({});
        setPropertySearchText('');
    }, [isEdit, inventory, open]);

    // Sync propertyOptions with properties from context, merging in selected property when editing
    useEffect(() => {
        let merged = [...(properties || [])];
        if (isEdit && inventory?.property_id) {
            const propId = inventory.property_id;
            if (!merged.find(p => p.id === propId)) {
                // Construct a minimal property object from inventory data
                merged = [{ id: propId, name: inventory.property_name || 'Unknown Property' }, ...merged];
            }
        }
        setPropertyOptions(merged);
    }, [properties, inventory, isEdit]);

    // Cleanup search timer on unmount
    useEffect(() => {
        return () => {
            if (propertySearchTimer.current) clearTimeout(propertySearchTimer.current);
        };
    }, []);

    // Debounced search handler for property dropdown
    const handlePropertySearchInput = useCallback((event, value, reason) => {
        if (reason === 'input') {
            setPropertySearchText(value);
            if (propertySearchTimer.current) clearTimeout(propertySearchTimer.current);
            propertySearchTimer.current = setTimeout(() => {
                fetchProperties(1, false, value);
            }, 400);
        }
        if (reason === 'clear') {
            setPropertySearchText('');
            fetchProperties(1, false, '');
        }
    }, [fetchProperties]);

    const handleChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        if (validationErrors[field]) {
            setValidationErrors(prev => ({
                ...prev,
                [field]: undefined
            }));
        }
    };

    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setImageFile(file);
            const previewUrl = URL.createObjectURL(file);
            setImagePreview(previewUrl);
        }
    };

    const clearImage = () => {
        setImageFile(null);
        setImagePreview(null);
    };

    const handleUnitChange = (value) => {
        setSelectedUnit(value);
        handleChange('unit', value);
        if (value === 'container') {
            handleChange('quantity', '');
        }
    };

    const handleTaskChange = (field, value) => {
        setTaskFormData(prev => ({
            ...prev,
            [field]: value
        }));
        if (validationErrors[field]) {
            setValidationErrors(prev => ({
                ...prev,
                [field]: undefined
            }));
        }
    };

    const handleTaskCheckboxChange = (event) => {
        setTaskFormData(prev => ({
            ...prev,
            task_requires_photo: event.target.checked
        }));
    };

    const handleTaskInventoryCheckboxChange = (event) => {
        setTaskFormData(prev => ({
            ...prev,
            task_allows_inventory_update: event.target.checked
        }));
    };


    const handleCreateUpdate = async () => {
        try {
            const formDataToSend = new FormData();
            formDataToSend.append('name', formData.name);
            formDataToSend.append('category', formData.category);
            formDataToSend.append('property_id', formData.property_id);
            formDataToSend.append('quantity', formData.quantity);
            formDataToSend.append('unit', formData.unit);
            formDataToSend.append('located_at', formData.located_at);
            formDataToSend.append('lower_limit', formData.lower_limit);
            formDataToSend.append('create_tasks', createTasks);
            if (imageFile) {
                formDataToSend.append('inventory_image', imageFile);
            }

            // Add task data if creating inventory with task
            if (!isEdit && createTasks) {
                formDataToSend.append('task_title', taskFormData.task_title);
                formDataToSend.append('task_description', taskFormData.task_description);
                formDataToSend.append('task_assigned_to', taskFormData.task_assigned_to);
                formDataToSend.append('task_requires_photo', taskFormData.task_requires_photo);
                formDataToSend.append('task_allows_inventory_update', taskFormData.task_allows_inventory_update);
                formDataToSend.append('task_schedule_type', taskFormData.task_schedule_type);

                const isFixedDates = taskFormData.task_schedule_type === 'fixed_dates';
                if (!isFixedDates) {
                    formDataToSend.append('task_start_date', taskFormData.task_start_date);
                    formDataToSend.append('task_end_date', taskFormData.task_end_date);
                }

                // Send recurrence data based on schedule type
                if (taskFormData.task_schedule_type === 'weekly') {
                    formDataToSend.append('repeat_days', JSON.stringify(repeatData.days || []));
                } else if (taskFormData.task_schedule_type === 'monthly') {
                    formDataToSend.append('repeat_date', JSON.stringify(repeatData.dates || []));
                } else if (taskFormData.task_schedule_type === 'yearly') {
                    formDataToSend.append('repeat_month', JSON.stringify(repeatData.months || []));
                    formDataToSend.append('repeat_date', JSON.stringify(repeatData.dates || []));
                } else if (isFixedDates) {
                    formDataToSend.append('fixed_dates', JSON.stringify(repeatData.dates || []));
                }
            }

            let res;
            if (isEdit) {
                // Update existing inventory
                res = await updateInventory(inventory.id, formDataToSend);
                console.log('Update Inventory Response:', res);
                showSnackbar(res.message, 'success');
            } else {
                // Create new inventory
                res = await createInventory(formDataToSend);
                console.log('Create Inventory Response:', res);
                showSnackbar(res.message, 'success');
            }
            onClose();
        } catch (error) {
            // Map API errors to form fields
            if (error.errors && Array.isArray(error.errors)) {
                const apiErrors = {};
                error.errors.forEach((err) => {
                    Object.keys(err).forEach((key) => {
                        apiErrors[key] = err[key];
                    });
                });
                setValidationErrors(apiErrors);
            }
            showSnackbar(error.message || `Failed to ${isEdit ? 'update' : 'create'} inventory`, 'error');
            console.error(`Error ${isEdit ? 'updating' : 'creating'} inventory:`, error);
        }
    };


    return (
        <Dialog
            open={open}
            maxWidth="md"
            fullWidth
            area-describedby="inventory-dialog-description"
            TransitionComponent={Transition}
        >
            <DialogTitle>
                {isEdit ? 'Edit Inventory Item' : 'Add Inventory Item'}
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: (theme) => theme.palette.grey[500],
                    }}
                >
                    <Close />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers>
                <Grid container spacing={2} sx={{ mt: 1 }}>

                    <Grid size={{ xs: 12, }}>
                        <TextField
                            label="Inventory Name"
                            variant="outlined"
                            size='small'
                            value={formData.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            error={!!validationErrors?.name}
                            helperText={validationErrors?.name}
                            fullWidth
                            required
                        />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                        <FormControl fullWidth error={!!validationErrors?.category}>
                            <InputLabel id="category-label" size='small'>
                                Category
                            </InputLabel>
                            <Select
                                label="Category *"
                                variant="outlined"
                                size='small'
                                required
                                value={formData.category}
                                onChange={(e) => handleChange('category', e.target.value)}
                                fullWidth
                            >
                                {categoriess.map((cat) => (
                                    <MenuItem key={cat.value} value={cat.value} dense>
                                        <cat.icon sx={{ mr: 1, color: palette.text.secondary, fontSize: 16 }} />
                                        {cat.label}
                                    </MenuItem>
                                ))}
                            </Select>
                            {validationErrors?.category && (
                                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                                    {validationErrors.category}
                                </Typography>
                            )}
                        </FormControl>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                        <Autocomplete
                            size='small'
                            options={propertyOptions}
                            getOptionLabel={(option) => option.name ? String(option.name) : ""}
                            value={propertyOptions.find(p => p.id === formData.property_id) || null}
                            onInputChange={handlePropertySearchInput}
                            filterOptions={(x) => x}
                            renderOption={(props, option) => (
                                <li {...props} key={option.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textTransform: 'capitalize' }}>
                                        {option.name}</span>
                                    {(option.property_image_url) && (
                                        <img
                                            src={option.property_image_url}
                                            alt={option.name || ''}
                                            style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 100, marginLeft: 8 }}
                                        />
                                    )}
                                </li>
                            )}
                            onChange={(event, newValue) => handleChange('property_id', newValue ? newValue.id : '')}
                            ListboxProps={{
                                onScroll: async (event) => {
                                    const listboxNode = event.currentTarget;
                                    if (
                                        listboxNode.scrollHeight - listboxNode.scrollTop - listboxNode.clientHeight <= 10 &&
                                        propertyPagination?.hasNextPage &&
                                        !isLoadingMoreProperties
                                    ) {
                                        setIsLoadingMoreProperties(true);
                                        try {
                                            await fetchProperties((propertyPagination.page || 1) + 1, true, propertySearchText);
                                        } catch (err) {
                                            console.error('Error loading more properties:', err);
                                        } finally {
                                            setIsLoadingMoreProperties(false);
                                        }
                                    }
                                },
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Property"
                                    variant="outlined"
                                    size='small'
                                    error={!!validationErrors?.property_id}
                                    helperText={validationErrors?.property_id}
                                    required
                                />
                            )}
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                        />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                            label="Located At"
                            variant="outlined"
                            size='small'
                            value={formData.located_at}
                            onChange={(e) => handleChange('located_at', e.target.value)}
                            error={!!validationErrors?.located_at}
                            helperText={validationErrors?.located_at}
                            fullWidth
                        />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                            label="Lower Limit"
                            variant="outlined"
                            size='small'
                            type="number"
                            value={formData.lower_limit}
                            onChange={(e) => handleChange('lower_limit', e.target.value)}
                            error={!!validationErrors?.lower_limit}
                            helperText={validationErrors?.lower_limit}
                            inputProps={{ min: 0, step: 0.01 }}
                            fullWidth
                        />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                        <FormControl fullWidth error={!!validationErrors?.unit}>
                            <InputLabel id="unit-label" size='small'>
                                Unit
                            </InputLabel>
                            <Select
                                label="Unit"
                                variant="outlined"
                                size='small'
                                value={formData.unit}
                                onChange={(e) => handleUnitChange(e.target.value)}
                                fullWidth
                            >
                                {units.map((unit) => (
                                    <MenuItem key={unit.value} value={unit.value} dense>
                                        {unit.label}
                                    </MenuItem>
                                ))}
                            </Select>
                            {validationErrors?.unit && (
                                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                                    {validationErrors.unit}
                                </Typography>
                            )}
                        </FormControl>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                        {selectedUnit.toLowerCase() === 'container' ? (
                            <FormControl fullWidth error={!!validationErrors?.quantity}>
                                <InputLabel id="quantity-label" size='small'>
                                    Quantity
                                </InputLabel>
                                <Select
                                    label="Quantity"
                                    variant="outlined"
                                    size='small'
                                    value={formData.quantity}
                                    onChange={(e) => handleChange('quantity', e.target.value)}
                                    fullWidth
                                >
                                    {containerOptions.map((option) => (
                                        <MenuItem key={option.value} value={option.value}>
                                            {option.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {validationErrors?.quantity && (
                                    <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                                        {validationErrors.quantity}
                                    </Typography>
                                )}
                            </FormControl>
                        ) : (
                            <TextField
                                label="Quantity"
                                variant="outlined"
                                size='small'
                                type="number"
                                value={formData.quantity}
                                onChange={(e) => handleChange('quantity', e.target.value)}
                                error={!!validationErrors?.quantity}
                                helperText={validationErrors?.quantity}
                                inputProps={{
                                    min: 0,
                                    step: selectedUnit.toLowerCase() === 'piece' ? 1 : 0.1
                                }}
                                fullWidth
                            />
                        )}
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {imagePreview && (
                                <Box sx={{ position: 'relative', width: 'fit-content', margin: '0 auto' }}>
                                    <Box
                                        component="img"
                                        src={imagePreview}
                                        alt="Preview"
                                        sx={{
                                            width: 250,
                                            height: 250,
                                            objectFit: 'fill',
                                            borderRadius: 2,
                                            border: '1px solid',
                                            borderColor: 'divider',

                                        }}
                                    />
                                    <IconButton
                                        size="small"
                                        onClick={clearImage}
                                        sx={{
                                            position: 'absolute',
                                            top: -8,
                                            right: -8,
                                            bgcolor: palette.secondary.main,
                                            color: '#ffffff',
                                        }}
                                    >
                                        <Close sx={{ fontSize: 18 }} />
                                    </IconButton>
                                </Box>
                            )}

                            <Button
                                variant="outlined"
                                component="label"
                                startIcon={<CloudUpload />}
                                sx={{
                                    textTransform: 'none',
                                    borderColor: palette.primary.main,
                                    color: palette.primary.main,
                                    '&:hover': {
                                        borderColor: palette.secondary.main,
                                        color: palette.secondary.main,
                                    }
                                }}
                            >
                                Upload Image
                                <input
                                    type="file"
                                    accept="image/*"
                                    hidden
                                    name="inventory_image"
                                    onChange={handleImageChange}
                                />
                            </Button>




                            {validationErrors?.inventory_image && (
                                <Typography variant="caption" color="error">
                                    {validationErrors.inventory_image}
                                </Typography>
                            )}
                        </Box>
                    </Grid>
                </Grid>

                {!isEdit && (
                    <Accordion
                        sx={{ mt: 2 }}
                        elevation={1}
                        expanded={createTasks}
                        onChange={(e, isExpanded) => setCreateTasks(isExpanded)}
                    >
                        <AccordionSummary expandIcon={<ExpandMore />}>
                            <Typography>Create Task for this Inventory (Optional)</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Grid container spacing={2}>

                                <Grid size={{ xs: 12 }}>
                                    <TextField
                                        label="Task Title"
                                        variant="outlined"
                                        size='small'
                                        value={taskFormData.task_title}
                                        onChange={(e) => handleTaskChange('task_title', e.target.value)}
                                        error={!!validationErrors?.task_title}
                                        helperText={validationErrors?.task_title}
                                        fullWidth
                                        required
                                    />
                                </Grid>

                                <Grid size={{ xs: 12 }}>
                                    <TextField
                                        label="Task Description"
                                        variant="outlined"
                                        size='small'
                                        fullWidth
                                        multiline
                                        rows={3}
                                        value={taskFormData.task_description}
                                        onChange={(e) => handleTaskChange('task_description', e.target.value)}
                                        error={!!validationErrors?.task_description}
                                        inputProps={{ maxLength: 500 }}
                                        helperText={
                                            <>
                                                <span>{validationErrors.task_description}</span>
                                                <span>{taskFormData.task_description.length}/500</span>
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

                                <Grid size={{ xs: 12 }}>
                                    <FormControl component="fieldset">
                                        <FormLabel component="legend"
                                            sx={{
                                                color: validationErrors.task_schedule_type ? 'error.main' : 'inherit'
                                            }}
                                        >
                                            Schedule Type
                                        </FormLabel>
                                        <RadioGroup
                                            row
                                            value={taskFormData.task_schedule_type}
                                            onChange={(e) => {
                                                handleTaskChange('task_schedule_type', e.target.value);
                                                setRepeatData({});
                                            }}
                                        >
                                            {scheduleTypes.map((type) => (
                                                <FormControlLabel key={type} value={type} control={<Radio />} label={type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')} />
                                            ))}
                                        </RadioGroup>
                                        {validationErrors.task_schedule_type && (
                                            <Box sx={{ color: 'error.main', fontSize: '0.75rem', mt: 0.1 }}>
                                                {validationErrors.task_schedule_type}
                                            </Box>
                                        )}
                                    </FormControl>
                                </Grid>

                                {taskFormData.task_schedule_type && taskFormData.task_schedule_type !== 'fixed_dates' && (
                                    <>
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <TextField
                                                type="date"
                                                label="Start Date"
                                                size='small'
                                                value={taskFormData.task_start_date}
                                                onChange={(e) => handleTaskChange('task_start_date', e.target.value)}
                                                error={!!validationErrors?.task_start_date}
                                                helperText={validationErrors?.task_start_date}
                                                InputLabelProps={{ shrink: true }}
                                                fullWidth
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <TextField
                                                type="date"
                                                label="End Date"
                                                size='small'
                                                value={taskFormData.task_end_date}
                                                onChange={(e) => handleTaskChange('task_end_date', e.target.value)}
                                                error={!!validationErrors?.task_end_date}
                                                helperText={validationErrors?.task_end_date}
                                                InputLabelProps={{ shrink: true }}
                                                fullWidth
                                            />
                                        </Grid>
                                    </>
                                )}

                                {taskFormData.task_schedule_type === 'fixed_dates' && (
                                    <Grid size={{ xs: 12 }}>
                                        <TextField
                                            type="date"
                                            label="Select Date"
                                            fullWidth
                                            size="small"
                                            InputLabelProps={{ shrink: true }}
                                            onChange={(e) => {
                                                const dateVal = e.target.value;
                                                if (dateVal && !repeatData.dates?.includes(dateVal)) {
                                                    setRepeatData(prev => ({
                                                        ...prev,
                                                        dates: [...(prev.dates || []), dateVal].sort()
                                                    }));
                                                }
                                            }}
                                            error={!!validationErrors.task_repeat_on}
                                            helperText={validationErrors.task_repeat_on || 'Pick dates to add them'}
                                        />
                                        {repeatData.dates && repeatData.dates.length > 0 && (
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                                                {repeatData.dates.map((date) => (
                                                    <Box
                                                        key={date}
                                                        sx={{
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            bgcolor: palette.background.customPaper,
                                                            borderRadius: 2,
                                                            px: 1,
                                                            py: 0.3,
                                                            fontSize: '0.8rem',
                                                            gap: 0.5,
                                                        }}
                                                    >
                                                        {date}
                                                        <IconButton
                                                            size="small"
                                                            sx={{ p: 0, ml: 0.5 }}
                                                            onClick={() => {
                                                                setRepeatData(prev => ({
                                                                    ...prev,
                                                                    dates: prev.dates.filter(d => d !== date)
                                                                }));
                                                            }}
                                                        >
                                                            <CloseIcon sx={{ fontSize: 14 }} />
                                                        </IconButton>
                                                    </Box>
                                                ))}
                                            </Box>
                                        )}
                                    </Grid>
                                )}

                                {taskFormData.task_schedule_type === 'weekly' && (
                                    <Grid size={{ xs: 12 }}>
                                        <Autocomplete
                                            multiple
                                            limitTags={3}
                                            size="small"
                                            options={daysOfWeek}
                                            getOptionLabel={(option) => option.label}
                                            value={daysOfWeek.filter(day => repeatData.days?.includes(day.value)) || []}
                                            onChange={(event, newValue) => {
                                                const dayValues = newValue.map(day => day.value);
                                                setRepeatData({ days: dayValues });
                                            }}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label="Select Days"
                                                    placeholder="Choose days of the week"
                                                    required
                                                    error={!!validationErrors?.task_repeat_on}
                                                    helperText={validationErrors?.task_repeat_on || 'Select days of the week'}
                                                />
                                            )}
                                            isOptionEqualToValue={(option, value) => option.value === value.value}
                                        />
                                    </Grid>
                                )}

                                {taskFormData.task_schedule_type === 'monthly' && (
                                    <Grid size={{ xs: 12 }}>
                                        <Autocomplete
                                            multiple
                                            limitTags={5}
                                            size="small"
                                            options={datesOfMonth}
                                            getOptionLabel={(option) => String(option)}
                                            value={Array.isArray(repeatData.dates) ? repeatData.dates : []}
                                            onChange={(event, newValue) => {
                                                setRepeatData({ dates: newValue.sort((a, b) => a - b) });
                                            }}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label="Select Dates"
                                                    placeholder="Choose dates of the month"
                                                    required
                                                    error={!!validationErrors?.task_repeat_on}
                                                    helperText={validationErrors?.task_repeat_on || 'Select dates of the month (1-31)'}
                                                />
                                            )}
                                        />
                                    </Grid>
                                )}

                                {taskFormData.task_schedule_type === 'yearly' && (
                                    <>
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <Autocomplete
                                                multiple
                                                limitTags={3}
                                                size="small"
                                                options={monthsOfYear}
                                                getOptionLabel={(option) => option.label}
                                                value={monthsOfYear.filter(month => repeatData.months?.includes(month.value)) || []}
                                                onChange={(event, newValue) => {
                                                    const monthValues = newValue.map(month => month.value);
                                                    setRepeatData({ ...repeatData, months: monthValues });
                                                }}
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        label="Select Months"
                                                        placeholder="Choose months"
                                                        required
                                                        error={!!validationErrors?.task_repeat_on}
                                                        helperText={validationErrors?.task_repeat_on || 'Select months of the year'}
                                                    />
                                                )}
                                                isOptionEqualToValue={(option, value) => option.value === value.value}
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <Autocomplete
                                                multiple
                                                limitTags={3}
                                                size="small"
                                                options={datesOfMonth}
                                                getOptionLabel={(option) => String(option)}
                                                value={Array.isArray(repeatData.dates) ? repeatData.dates : []}
                                                onChange={(event, newValue) => {
                                                    setRepeatData({ ...repeatData, dates: newValue.sort((a, b) => a - b) });
                                                }}
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        label="Select Dates"
                                                        placeholder="Choose dates"
                                                        required
                                                        error={!!validationErrors?.task_repeat_on}
                                                        helperText={validationErrors?.task_repeat_on || 'Select dates (1-31)'}
                                                    />
                                                )}
                                            />
                                        </Grid>
                                    </>
                                )}

                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Autocomplete
                                        size="small"
                                        options={teamMembers}
                                        getOptionLabel={(option) => option.name ? String(option.name) : ""}
                                        value={teamMembers.find((item) => item.id === taskFormData.task_assigned_to) || null}
                                        onChange={(e, newValue) => {
                                            handleTaskChange('task_assigned_to', newValue ? newValue.id : '');
                                        }}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Assigned To"
                                                error={!!validationErrors?.task_assigned_to}
                                                helperText={validationErrors?.task_assigned_to}
                                            />
                                        )}
                                        isOptionEqualToValue={(option, value) => option.id === value.id}
                                    />
                                </Grid>

                                <Grid size={{ xs: 12 }} container spacing={2}>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={!!taskFormData.task_requires_photo}
                                                    onChange={handleTaskCheckboxChange}
                                                />
                                            }
                                            label="A Photo Proof is Required"
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={!!taskFormData.task_allows_inventory_update}
                                                    onChange={handleTaskInventoryCheckboxChange}
                                                />
                                            }
                                            label="Update Inventory Quantity"
                                        />
                                    </Grid>
                                </Grid>
                            </Grid>
                        </AccordionDetails>

                    </Accordion>
                )}


            </DialogContent>

            <DialogActions sx={{ px: 2, py: 2 }}>

                <Button
                    variant="contained"
                    size='small'
                    disableElevation
                    disabled={loading}
                    onClick={handleCreateUpdate}
                    sx={{
                        textTransform: 'none',
                        backgroundColor: palette.primary.main,
                        '&:hover': { backgroundColor: palette.secondary.main },
                        borderRadius: 10,
                        px: 2,
                    }}
                >
                    {loading ? 'Saving...' : isEdit ? 'Update' : 'Create Inventory'}
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default TileView_addEdit_Inventory