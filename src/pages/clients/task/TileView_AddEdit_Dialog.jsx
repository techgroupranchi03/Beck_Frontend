import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Button,
    Slide,
    useTheme,
    TextField,
    Grid,
    MenuItem,
    Checkbox,
    FormControlLabel,
    Box,
    Autocomplete,
    FormControl,
    RadioGroup,
    Radio,
    FormLabel,
    Stepper,
    Step,
    StepLabel,
} from '@mui/material'
import { NavigateBefore, NavigateNext } from '@mui/icons-material'
import CloseIcon from '@mui/icons-material/Close';
import { scheduleTypes, daysOfWeek, monthsOfYear, datesOfMonth } from '../../../constant';
import { useTaskContext } from './TaskManagement';
import { useSnackbar } from '../../../resuable_components/Snackbar';
import TaskCompletionDialog from '../../../dialoge/clients/TaskCompletionDialog';

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const TileView_AddEdit_Dialog = ({ open, onClose, task, purchaseMode = false }) => {

    const isEdit = !purchaseMode && !!task && !!task.id;
    const isDuplicate = !purchaseMode && !!task && !task.id;
    const theme = useTheme();
    const { palette } = theme;
    const { showSnackbar } = useSnackbar();
    const [showCompletionDialog, setShowCompletionDialog] = useState(false);
    const [pendingTask, setPendingTask] = useState(null);


    //  console.log("task in dialog:", task);

    const {
        inventoryItems,
        properties,
        propertyPagination,
        inventoryPagination,
        teamMembers,
        createTask,
        updateTask,
        fetchInventoryByProperty,
        fetchProperties,
        fetchInventoryItems,
        updateTaskCompletionStatus
    } = useTaskContext();

    const [isLoadingMoreProperties, setIsLoadingMoreProperties] = useState(false);
    const [isLoadingMoreInventory, setIsLoadingMoreInventory] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        property_id: null,
        inventory_id: null,
        schedule_type: 'weekly',
        start_date: '',
        end_date: '',
        assigned_to: '',
        requires_photo: true,
        allows_inventory_update: false,
    });

    const [validationErrors, setValidationErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [inventoryOptions, setInventoryOptions] = useState(inventoryItems || []);
    const [propertyOptions, setPropertyOptions] = useState(properties || []);
    const [propertySearchText, setPropertySearchText] = useState('');
    const [inventorySearchText, setInventorySearchText] = useState('');
    const propertySearchTimer = useRef(null);
    const inventorySearchTimer = useRef(null);
    const [repeatData, setRepeatData] = useState({});
    const [activeStep, setActiveStep] = useState(0);

    const steps = ['Details', 'Schedule', 'Assignment'];

    useEffect(() => {
        if ((isEdit || isDuplicate || purchaseMode) && task) {
            const schedule = task.schedule || {};
            const recurrenceRule = schedule.recurrence_rule || {};

            setFormData({
                title: task.title || '',
                description: task.description || '',
                property_id: task.property?.id || task.property_id || '',
                inventory_id: task.inventory_details?.id || task.inventory_id || null,
                schedule_type: schedule.type || '',
                start_date: schedule.start_date ? schedule.start_date.split('T')[0] : '',
                end_date: schedule.end_date ? schedule.end_date.split('T')[0] : '',
                assigned_to: task.assigned_to?.id || task.assigned_to || '',
                requires_photo: !!task.requires_photo,
                allows_inventory_update: !!task.allows_inventory_update,
            });

            // For purchase mode with fixed_dates, add today's date by default
            if (purchaseMode && (schedule.type === 'fixed_dates' || !schedule.type)) {
                const today = new Date().toISOString().split('T')[0];
                const existingDates = recurrenceRule.dates || [];
                const dates = existingDates.includes(today) ? existingDates : [...existingDates, today].sort();
                setRepeatData({ ...recurrenceRule, dates });
                if (!schedule.type) {
                    setFormData(prev => ({ ...prev, schedule_type: 'fixed_dates' }));
                }
            } else {
                setRepeatData(recurrenceRule);
            }

            // Fetch inventory for the task's property when editing/duplicating
            const propId = task.property?.id || task.property_id;
            if (propId) {
                fetchInventoryByProperty(propId)
                    .then((data) => {
                        let options = data || [];
                        // Ensure selected inventory is in options even if not returned
                        const selectedInv = task.inventory_details;
                        if (selectedInv?.id && !options.find(i => i.id === selectedInv.id)) {
                            options = [selectedInv, ...options];
                        }
                        setInventoryOptions(options);
                    })
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
                inventory_id: null,
                schedule_type: 'weekly',
                start_date: '',
                end_date: '',
                assigned_to: '',
                requires_photo: true,
                allows_inventory_update: false,
            });
            setRepeatData({});
            setInventoryOptions(inventoryItems || []);
        }
        setPropertySearchText('');
        setInventorySearchText('');
        setValidationErrors({});
        setActiveStep(0);
    }, [task, isEdit, isDuplicate, purchaseMode, open]);

    // Sync propertyOptions with properties from context, merging in selected property when editing/purchaseMode
    useEffect(() => {
        let merged = [...(properties || [])];
        if ((isEdit || isDuplicate || purchaseMode) && task?.property) {
            const selectedProp = task.property;
            if (selectedProp?.id && !merged.find(p => p.id === selectedProp.id)) {
                merged = [selectedProp, ...merged];
            }
        }
        setPropertyOptions(merged);
    }, [properties, task, isEdit, isDuplicate, purchaseMode]);

    // Sync inventoryOptions with inventoryItems, merging in selected inventory when editing/purchaseMode
    useEffect(() => {
        if (!formData.property_id) {
            let merged = [...(inventoryItems || [])];
            if ((isEdit || isDuplicate || purchaseMode) && task?.inventory_details) {
                const selectedInv = task.inventory_details;
                if (selectedInv?.id && !merged.find(i => i.id === selectedInv.id)) {
                    merged = [selectedInv, ...merged];
                }
            }
            setInventoryOptions(merged);
        }
    }, [inventoryItems, formData.property_id, purchaseMode]);

    // Cleanup search timers on unmount
    useEffect(() => {
        return () => {
            if (propertySearchTimer.current) clearTimeout(propertySearchTimer.current);
            if (inventorySearchTimer.current) clearTimeout(inventorySearchTimer.current);
        };
    }, []);

    const handleChange = (field) => (event) => {
        const value = event.target.value;
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        // Clear validation error for this field
        if (validationErrors[field]) {
            setValidationErrors(prev => ({
                ...prev,
                [field]: undefined
            }));
        }
    };

    const handlePhotoChange = (event) => {
        setFormData(prev => ({
            ...prev,
            requires_photo: event.target.checked
        }));
    };

    const handleInventoryChange = (event) => {
        setFormData(prev => ({
            ...prev,
            allows_inventory_update: event.target.checked
        }));
    };


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

    // Debounced search handler for inventory dropdown (global search when no property selected)
    const handleInventorySearchInput = useCallback((event, value, reason) => {
        if (reason === 'input' && !formData.property_id) {
            setInventorySearchText(value);
            if (inventorySearchTimer.current) clearTimeout(inventorySearchTimer.current);
            inventorySearchTimer.current = setTimeout(() => {
                fetchInventoryItems({}, value, 1, false);
            }, 400);
        }
        if (reason === 'clear' && !formData.property_id) {
            setInventorySearchText('');
            fetchInventoryItems({}, '', 1, false);
        }
    }, [fetchInventoryItems, formData.property_id]);

    const validateStep = (step) => {
        const errors = {};
        if (step === 0) {
            if (!formData.title?.trim()) errors.title = 'Title is required';
        }
        if (step === 1) {
            if (!formData.schedule_type) errors.schedule_type = 'Schedule type is required';
        }
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleNext = () => {
        if (!validateStep(activeStep)) return;
        if (activeStep === steps.length - 1) {
            handleCreateUpdate();
        } else {
            setActiveStep(prev => prev + 1);
        }
    };

    const handleBack = () => {
        setActiveStep(prev => prev - 1);
    };

    const buildPayload = () => {
        const isFixedDates = formData.schedule_type === 'fixed_dates';

        // Parse recurrence_rule from repeatData
        let recurrenceRule = null;
        if (Object.keys(repeatData).length > 0) {
            recurrenceRule = repeatData;
        }

        const schedule = {
            schedule_type: formData.schedule_type,
            recurrence_rule: recurrenceRule,
            start_date: isFixedDates ? null : (formData.start_date || null),
            end_date: isFixedDates ? null : (formData.end_date || null),
        };

        return {
            title: formData.title,
            description: formData.description,
            property_id: formData.property_id,
            requires_photo: formData.requires_photo,
            allows_inventory_update: formData.allows_inventory_update,
            assigned_to: formData.assigned_to,
            inventory_id: formData.inventory_id || null,
            schedule,
        };
    };

    const handleCreateUpdate = async () => {
        setValidationErrors({});
        setLoading(true);
        try {
            if (isEdit) {
                const payload = buildPayload();
                const res = await updateTask(task.id, payload);
                showSnackbar(res.message, 'success');
            } else {
                const payload = buildPayload();
                const res = await createTask(payload);
                showSnackbar(res.message, 'success');
            }
            onClose();
        } catch (error) {
            if (error.message === 'Completion photo is required for this task') {
                setPendingTask(task);
                setShowCompletionDialog(true);
                onClose();
                return;
            }
            if (error.errors) {
                const apiErrors = {};
                if (Array.isArray(error.errors)) {
                    error.errors.forEach((err) => {
                        Object.keys(err).forEach((key) => {
                            apiErrors[key] = err[key];
                        });
                    });
                } else if (typeof error.errors === 'object') {
                    // Handle case where errors is an object
                    Object.keys(error.errors).forEach((key) => {
                        apiErrors[key] = Array.isArray(error.errors[key])
                            ? error.errors[key][0]
                            : error.errors[key];
                    });
                }
                setValidationErrors(apiErrors);
            }
            console.log('Error response:', error);
            showSnackbar(error.message || 'Operation failed', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleCompletionDialogClose = (success) => {
        setShowCompletionDialog(false);
        setPendingTask(null);
        if (success) {
            onClose();
        }
    };

    return (
        <>
            <Dialog
                open={open}
                fullWidth
                maxWidth="md"
                aria-describedby='task-dialog-description'
                TransitionComponent={Transition}
            >
                <DialogTitle>
                    {purchaseMode ? 'Purchase Task' : isEdit ? 'Edit Task' : isDuplicate ? 'Duplicate Task' : 'Create New Task'}
                    <IconButton
                        aria-label="close"
                        onClick={onClose}
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
                    <Stepper activeStep={activeStep} sx={{ mb: 3, mt: 1 }} alternativeLabel>
                        {steps.map((label) => (
                            <Step key={label}>
                                <StepLabel>{label}</StepLabel>
                            </Step>
                        ))}
                    </Stepper>

                    {/* Step 0: Details */}
                    {activeStep === 0 && (
                        <Grid container spacing={2}>

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

                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    label="Description"
                                    value={formData.description}
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

                            <Grid size={{ xs: 12, sm: 6 }}>

                                <Autocomplete
                                    size="small"
                                    options={propertyOptions}
                                    getOptionLabel={(option) => option.name ? String(option.name) : ""}
                                    value={propertyOptions.find((item) => item.id === formData.property_id) || null}
                                    onInputChange={handlePropertySearchInput}
                                    filterOptions={(x) => x}
                                    onChange={(e, newValue) => {
                                        const propId = newValue ? newValue.id : "";
                                        handleChange("property_id")({ target: { value: propId } });

                                        if (newValue) {
                                            fetchInventoryByProperty(newValue.id)
                                                .then((data) => {
                                                    setInventoryOptions(data || []);
                                                    // clear inventory_id if it's not in the fetched list
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
                                    disabled={purchaseMode}
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
                                            label="Select Property"
                                            error={!!validationErrors.property_id}
                                            helperText={validationErrors.property_id}
                                        />
                                    )}
                                    isOptionEqualToValue={(option, value) => option.id === value.id}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Autocomplete
                                    size="small"
                                    options={inventoryOptions}
                                    getOptionLabel={(option) => option.name ? String(option.name) : ""}
                                    value={inventoryOptions.find((item) => item.id === formData.inventory_id) || null}
                                    onInputChange={handleInventorySearchInput}
                                    filterOptions={!formData.property_id ? (x) => x : undefined}
                                    renderOption={(props, option) => (
                                        <li {...props} key={option.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{option.name}</span>
                                            {(option.property_image_url) && (
                                                <img
                                                    src={option.property_image_url}
                                                    alt={option.name || ''}
                                                    style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 100, marginLeft: 8 }}
                                                />
                                            )}
                                        </li>
                                    )}
                                    onChange={(e, newValue) => {
                                        handleChange("inventory_id")({
                                            target: { value: newValue ? newValue.id : "" }
                                        });

                                        // Auto-select property when inventory is selected
                                        if (newValue && newValue.property_id) {
                                            handleChange("property_id")({
                                                target: { value: newValue.property_id }
                                            });
                                        }

                                        // Auto-check inventory update when inventory is selected
                                        setFormData(prev => ({
                                            ...prev,
                                            allows_inventory_update: !!newValue,
                                        }));
                                    }}
                                    ListboxProps={{
                                        onScroll: async (event) => {
                                            const listboxNode = event.currentTarget;
                                            if (
                                                listboxNode.scrollHeight - listboxNode.scrollTop - listboxNode.clientHeight <= 10 &&
                                                inventoryPagination?.hasNextPage &&
                                                !isLoadingMoreInventory
                                            ) {
                                                setIsLoadingMoreInventory(true);
                                                try {
                                                    await fetchInventoryItems({}, inventorySearchText, (inventoryPagination.page || 1) + 1, true);
                                                } catch (err) {
                                                    console.error('Error loading more inventory:', err);
                                                } finally {
                                                    setIsLoadingMoreInventory(false);
                                                }
                                            }
                                        },
                                    }}
                                    disabled={purchaseMode}
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
                        </Grid>
                    )}

                    {/* Step 1: Schedule */}
                    {activeStep === 1 && (
                        <Grid container spacing={2}>

                            <Grid size={{ xs: 12 }}>
                                <FormControl component="fieldset">
                                    <FormLabel component="legend"
                                        sx={{
                                            color: validationErrors.schedule_type ? 'error.main' : 'inherit'
                                        }}
                                    >
                                        Schedule Type
                                    </FormLabel>
                                    <RadioGroup
                                        row
                                        value={formData.schedule_type}
                                        onChange={(e) => {
                                            handleChange('schedule_type')(e);
                                            setRepeatData({});
                                        }}
                                    >
                                        {scheduleTypes.map((type) => (
                                            <FormControlLabel key={type} value={type} control={<Radio />} label={type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')} disabled={purchaseMode && type !== 'fixed_dates'} />
                                        ))}
                                    </RadioGroup>
                                    {validationErrors.schedule_type && (
                                        <Box sx={{ color: 'error.main', fontSize: '0.75rem', mt: 0.1 }}>
                                            {validationErrors.schedule_type}
                                        </Box>
                                    )}
                                </FormControl>
                            </Grid>

                            {formData.schedule_type && formData.schedule_type !== 'fixed_dates' && (
                                <>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <TextField
                                            type="date"
                                            label="Start Date"
                                            value={formData.start_date}
                                            onChange={handleChange('start_date')}
                                            fullWidth
                                            size="small"
                                            disabled={isEdit && !isDuplicate}
                                            error={!!validationErrors.start_date}
                                            helperText={validationErrors.start_date || (isEdit && !isDuplicate ? 'Cannot change start date' : '')}
                                            InputLabelProps={{
                                                shrink: true,
                                            }}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <TextField
                                            type="date"
                                            label="End Date"
                                            value={formData.end_date}
                                            onChange={handleChange('end_date')}
                                            fullWidth
                                            size="small"
                                            error={!!validationErrors.end_date}
                                            helperText={validationErrors.end_date}
                                            InputLabelProps={{
                                                shrink: true,
                                            }}
                                        />
                                    </Grid>
                                </>
                            )}

                            {formData.schedule_type === 'fixed_dates' && (
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
                                        error={!!validationErrors.repeat_on}
                                        helperText={validationErrors.repeat_on || 'Pick dates to add them'}
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

                            {formData.schedule_type === 'weekly' && (
                                <Grid size={{ xs: 12 }}>
                                    <Autocomplete
                                        multiple
                                        limitTags={3}
                                        size="small"
                                        options={daysOfWeek}
                                        getOptionLabel={(option) => option.label}
                                        value={daysOfWeek.filter(day => repeatData.days?.includes(day.value)) || []}
                                        onChange={(event, newValue) => {
                                            // Extract only the numeric values
                                            const dayValues = newValue.map(day => day.value);
                                            setRepeatData({ days: dayValues });
                                        }}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Select Days"
                                                placeholder="Choose days of the week"
                                                required
                                                error={!!validationErrors.repeat_on}
                                                helperText={validationErrors.repeat_on || 'Select days of the week'}
                                            />
                                        )}
                                        isOptionEqualToValue={(option, value) => option.value === value.value}
                                    />
                                </Grid>
                            )}

                            {formData.schedule_type === 'monthly' && (
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
                                                error={!!validationErrors.repeat_on}
                                                helperText={validationErrors.repeat_on || 'Select dates of the month (1-31)'}
                                            />
                                        )}
                                    />
                                </Grid>
                            )}

                            {formData.schedule_type === 'yearly' && (
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
                                                    error={!!validationErrors.repeat_on}
                                                    helperText={validationErrors.repeat_on || 'Select months of the year'}
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
                                                    error={!!validationErrors.repeat_on}
                                                    helperText={validationErrors.repeat_on || 'Select dates (1-31)'}
                                                />
                                            )}
                                        />
                                    </Grid>
                                </>
                            )}
                        </Grid>
                    )}

                    {/* Step 2: Assignment */}
                    {activeStep === 2 && (
                        <Grid container spacing={2}>

                            <Grid size={{ xs: 12, }}>
                                <Autocomplete
                                    size="small"
                                    options={[{ id: '', name: 'Myself' }, ...(teamMembers || [])]}
                                    getOptionLabel={(option) => option.name ? String(option.name) : ""}
                                    value={[{ id: '', name: 'Myself' }, ...(teamMembers || [])].find((item) => item.id === (formData.assigned_to || '')) || null}
                                    onChange={(e, newValue) => {
                                        handleChange("assigned_to")({ target: { value: newValue ? newValue.id : "" } });
                                    }}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Assigned To"
                                            error={!!validationErrors.assigned_to}
                                            helperText={validationErrors.assigned_to}
                                        />
                                    )}
                                    isOptionEqualToValue={(option, value) => option.id === value.id}
                                />
                            </Grid>

                            <Grid size={{ xs: 12 }} container spacing={2}>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <FormControlLabel
                                            label="A Photo Proof is Required"
                                            labelPlacement='start'
                                        control={
                                            <Checkbox
                                                checked={!!formData.requires_photo}
                                                onChange={handlePhotoChange}
                                            />
                                        }
                                    />
                                </Grid>

                                {formData.inventory_id && (
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <FormControlLabel
                                                label="Update Inventory Quantity"
                                                labelPlacement='start'
                                            control={
                                                <Checkbox
                                                    checked={!!formData.allows_inventory_update}
                                                    onChange={handleInventoryChange}
                                                />
                                            }
                                        />
                                    </Grid>
                                )}
                            </Grid>

                        </Grid>
                    )}

                </DialogContent>

                <DialogActions sx={{ px: 3, py: 2, justifyContent: 'space-between' }}>
                    <Button
                        variant='outlined'
                        size='small'
                        disabled={activeStep === 0}
                        onClick={handleBack}
                        startIcon={<NavigateBefore />}
                        sx={{
                            textTransform: 'none',
                            borderRadius: 10,
                            visibility: activeStep === 0 ? 'hidden' : 'visible',
                        }}
                    >
                        Back
                    </Button>
                    <Button
                        variant='contained'
                        disableElevation
                        size='small'
                        onClick={handleNext}
                        disabled={loading}
                        endIcon={activeStep < steps.length - 1 ? <NavigateNext /> : null}
                        sx={{
                            textTransform: 'none',
                            backgroundColor: palette.primary.main,
                            '&:hover': { backgroundColor: palette.secondary.main },
                            borderRadius: 10,
                        }}
                    >
                        {loading
                            ? 'Saving...'
                            : activeStep === steps.length - 1
                                ? (isEdit ? 'Update Task' : 'Create Task')
                                : 'Next'
                        }
                    </Button>
                </DialogActions>

            </Dialog>

            <TaskCompletionDialog
                open={showCompletionDialog}
                onClose={handleCompletionDialogClose}
                task={pendingTask}
                updateTaskCompletionStatus={updateTaskCompletionStatus}
            />

        </>
    );
};
export default TileView_AddEdit_Dialog