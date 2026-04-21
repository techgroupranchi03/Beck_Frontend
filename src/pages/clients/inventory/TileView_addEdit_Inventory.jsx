import { Close, Inventory, CloudUpload, ExpandMore, NavigateBefore, NavigateNext } from '@mui/icons-material';
import { Dialog, DialogContent, DialogTitle, IconButton, Typography, Slide, Grid, TextField, useTheme, useMediaQuery, DialogActions, Button, Select, MenuItem, FormControl, InputLabel, Autocomplete, Box, Checkbox, FormControlLabel, Radio, RadioGroup, FormLabel, Stepper, Step, StepLabel, Switch, Divider } from '@mui/material'
import React, { useState, useEffect, useRef, useCallback } from 'react'
import { daysOfWeek, monthsOfYear, datesOfMonth, categoriess } from '../../../constant';
import CloseIcon from '@mui/icons-material/Close';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { PickersDay } from '@mui/x-date-pickers/PickersDay';
import dayjs from 'dayjs';
import { useInventoryContext } from './InventoryManagement';
import { useSnackbar } from '../../../resuable_components/Snackbar';
import QuantityInput from '../../../resuable_components/QuantityInput';
import LowerLimitInput from '../../../resuable_components/LowerLimitInput';

const Transition = React.forwardRef(function transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});
const TileView_addEdit_Inventory = ({ open, onClose, inventory }) => {
    const isEdit = !!inventory;
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
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
        container_type: '',
        auto_purchase_order: false,
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [validationErrors, setValidationErrors] = useState({});
    const [selectedUnit, setSelectedUnit] = useState('');
    const [activeStep, setActiveStep] = useState(0);
    const [submitting, setSubmitting] = useState(false);
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
    const [showStartDateInput, setShowStartDateInput] = useState(false);
    const [yearlyMonth, setYearlyMonth] = useState('');
    const [yearlyDate, setYearlyDate] = useState('');
    const [isRepeat, setIsRepeat] = useState(false);
    const [repeatScheduleType, setRepeatScheduleType] = useState('weekly');
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedDates, setSelectedDates] = useState([]);
    const [datePickerOpen, setDatePickerOpen] = useState(false);
    const datePickerRef = useRef(null);

    useEffect(() => {
        if (isEdit && inventory) {
            setFormData({
                name: inventory.name || '',
                category: inventory.category || '',
                property_id: inventory.property_id || '',
                located_at: inventory.located_at || '',
                lower_limit: inventory.lower_limit || '',
                unit: inventory.unit ?? '',
                quantity: inventory.quantity ?? '',
                container_type: inventory.container_type || '',
                auto_purchase_order: Boolean(inventory.auto_purchase_order),
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
                container_type: '',
                auto_purchase_order: false,
            });
            setImagePreview(null);
            setSelectedUnit('');
            setImageFile(null);
        }
        setValidationErrors({});
        // Reset task form data
        setCreateTasks(false);
        setSubmitting(false);
        setShowStartDateInput(false);
        setTaskFormData({
            task_title: '',
            task_description: '',
            task_assigned_to: '',
            task_schedule_type: 'fixed_dates',
            task_start_date: '',
            task_end_date: '',
            task_requires_photo: false,
            task_allows_inventory_update: false,
        });
        setRepeatData({});
        setIsRepeat(false);
        setRepeatScheduleType('weekly');
        setSelectedDate('');
        setSelectedDates([]);
        setDatePickerOpen(false);
        setPropertySearchText('');
        setActiveStep(0);
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

    // Helper to format date as DD-MM-YYYY
    const formatDateDisplay = (dateStr) => {
        if (!dateStr) return '';
        const [y, m, d] = dateStr.split('-');
        return `${d}-${m}-${y}`;
    };

    // Format a Date object as YYYY-MM-DD using local time
    const toLocalDateString = (d) => {
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    };

    // Auto-populate repeat data from a selected date (appends to existing)
    const autoPopulateFromDate = (dateStr) => {
        if (!dateStr) return;
        const d = new Date(dateStr + 'T00:00:00');
        const dayOfWeek = d.getDay() === 0 ? 7 : d.getDay();
        const dateOfMonth = d.getDate();
        const month = d.getMonth() + 1;

        if (repeatScheduleType === 'weekly') {
            setRepeatData(prev => {
                const newDays = [...new Set([...(prev.days || []), dayOfWeek])];
                handleTaskChange('task_repeat_on', JSON.stringify({ days: newDays }));
                return { days: newDays };
            });
        } else if (repeatScheduleType === 'monthly') {
            setRepeatData(prev => {
                const newDates = [...new Set([...(prev.dates || []), dateOfMonth])].sort((a, b) => a - b);
                handleTaskChange('task_repeat_on', JSON.stringify({ dates: newDates }));
                return { dates: newDates };
            });
        } else if (repeatScheduleType === 'yearly') {
            setRepeatData(prev => {
                const exists = (prev.yearly_pairs || []).some(
                    p => p.month === month && p.date === dateOfMonth
                );
                if (exists) return prev;
                const newPairs = [...(prev.yearly_pairs || []), { month, date: dateOfMonth }]
                    .sort((a, b) => a.month - b.month || a.date - b.date);
                handleTaskChange('task_repeat_on', JSON.stringify({ yearly_pairs: newPairs }));
                return { yearly_pairs: newPairs };
            });
        }
    };

    // Remove a date's contribution from repeat data
    const removeFromRepeatData = (dateStr) => {
        if (!dateStr) return;
        const d = new Date(dateStr + 'T00:00:00');
        const dayOfWeek = d.getDay() === 0 ? 7 : d.getDay();
        const dateOfMonth = d.getDate();
        const month = d.getMonth() + 1;

        if (repeatScheduleType === 'weekly') {
            setRepeatData(prev => {
                const newDays = (prev.days || []).filter(day => day !== dayOfWeek);
                handleTaskChange('task_repeat_on', JSON.stringify({ days: newDays }));
                return { days: newDays };
            });
        } else if (repeatScheduleType === 'monthly') {
            setRepeatData(prev => {
                const newDates = (prev.dates || []).filter(date => date !== dateOfMonth);
                handleTaskChange('task_repeat_on', JSON.stringify({ dates: newDates }));
                return { dates: newDates };
            });
        } else if (repeatScheduleType === 'yearly') {
            setRepeatData(prev => {
                const newPairs = (prev.yearly_pairs || []).filter(
                    p => !(p.month === month && p.date === dateOfMonth)
                );
                handleTaskChange('task_repeat_on', JSON.stringify({ yearly_pairs: newPairs }));
                return { yearly_pairs: newPairs };
            });
        }
    };

    // Auto-populate repeat data from multiple dates at once
    const autoPopulateFromMultipleDates = (dateStrings, type) => {
        const schedType = type || repeatScheduleType;
        const days = [];
        const dates = [];
        const yearlyPairs = [];

        for (const dateStr of dateStrings) {
            const d = new Date(dateStr + 'T00:00:00');
            const dayOfWeek = d.getDay() === 0 ? 7 : d.getDay();
            const dateOfMonth = d.getDate();
            const month = d.getMonth() + 1;

            if (!days.includes(dayOfWeek)) days.push(dayOfWeek);
            if (!dates.includes(dateOfMonth)) dates.push(dateOfMonth);
            if (!yearlyPairs.some(p => p.month === month && p.date === dateOfMonth)) {
                yearlyPairs.push({ month, date: dateOfMonth });
            }
        }

        switch (schedType) {
            case 'weekly':
                setRepeatData({ days });
                handleTaskChange('task_repeat_on', JSON.stringify({ days }));
                break;
            case 'monthly':
                setRepeatData({ dates: dates.sort((a, b) => a - b) });
                handleTaskChange('task_repeat_on', JSON.stringify({ dates: dates.sort((a, b) => a - b) }));
                break;
            case 'yearly':
                setRepeatData({ yearly_pairs: yearlyPairs.sort((a, b) => a.month - b.month || a.date - b.date) });
                handleTaskChange('task_repeat_on', JSON.stringify({ yearly_pairs: yearlyPairs.sort((a, b) => a.month - b.month || a.date - b.date) }));
                break;
            default:
                setRepeatData({});
                break;
        }
    };

    // Calculate first occurrence date based on schedule type and repeat data
    const calculateFirstOccurrence = (scheduleType, data) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (scheduleType === 'weekly' && data.days?.length > 0) {
            const todayDay = today.getDay();
            let minDaysAhead = Infinity;
            for (const dayValue of data.days) {
                const jsDay = dayValue % 7;
                let daysAhead = jsDay - todayDay;
                if (daysAhead < 0) daysAhead += 7;
                if (daysAhead < minDaysAhead) minDaysAhead = daysAhead;
            }
            if (minDaysAhead !== Infinity) {
                const firstDate = new Date(today);
                firstDate.setDate(firstDate.getDate() + minDaysAhead);
                return toLocalDateString(firstDate);
            }
        }

        if (scheduleType === 'monthly' && data.dates?.length > 0) {
            const currentDate = today.getDate();
            const currentMonth = today.getMonth();
            const currentYear = today.getFullYear();
            const sortedDates = [...data.dates].sort((a, b) => a - b);
            for (const date of sortedDates) {
                if (date >= currentDate) {
                    return toLocalDateString(new Date(currentYear, currentMonth, date));
                }
            }
            return toLocalDateString(new Date(currentYear, currentMonth + 1, sortedDates[0]));
        }

        if (scheduleType === 'yearly' && data.yearly_pairs?.length > 0) {
            const currentMonth = today.getMonth() + 1;
            const currentDate = today.getDate();
            const currentYear = today.getFullYear();
            const sorted = [...data.yearly_pairs].sort((a, b) => a.month - b.month || a.date - b.date);
            for (const pair of sorted) {
                if (pair.month > currentMonth || (pair.month === currentMonth && pair.date >= currentDate)) {
                    return toLocalDateString(new Date(currentYear, pair.month - 1, pair.date));
                }
            }
            return toLocalDateString(new Date(currentYear + 1, sorted[0].month - 1, sorted[0].date));
        }

        return null;
    };

    // Auto-calculate task_start_date when repeat data changes
    useEffect(() => {
        if (!createTasks) return;
        if (showStartDateInput) return;
        if (taskFormData.task_schedule_type === 'fixed_dates') return;

        const firstDate = calculateFirstOccurrence(taskFormData.task_schedule_type, repeatData);
        if (firstDate) {
            setTaskFormData(prev => ({ ...prev, task_start_date: firstDate }));
        }
    }, [taskFormData.task_schedule_type, repeatData, createTasks, showStartDateInput]);

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
            handleChange('container_type', '');
        } else {
            handleChange('container_type', '');
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


    const steps = isEdit
        ? ['Basic Info', 'Location & Settings', 'Image']
        : ['Basic Info', 'Quantity & Location', 'Image', 'Task (Optional)'];

    const validateStep = (step) => {
        const errors = {};
        if (step === 0) {
            if (!formData.name?.trim()) errors.name = 'Name is required';
            if (!formData.category) errors.category = 'Category is required';
            if (!formData.property_id) errors.property_id = 'Property is required';
        }
        if (step === 1) {
            if (!isEdit) {
                if (!formData.unit) errors.unit = 'Unit is required';
                if (formData.quantity === '' || formData.quantity === null || formData.quantity === undefined) errors.quantity = 'Quantity is required';
            }
        }
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleNext = () => {
        if (!validateStep(activeStep)) return;
        if (activeStep === steps.length - 1) {
            handleCreateUpdate();
        } else {
            const nextStep = activeStep + 1;
            if (nextStep === 3 && !isEdit) {
                setTaskFormData(prev => ({
                    ...prev,
                    task_title: prev.task_title || `Update ${formData.name}`,
                    task_requires_photo: true,
                    task_allows_inventory_update: true,
                }));
            }
            setActiveStep(nextStep);
        }
    };

    const handleBack = () => {
        setActiveStep(prev => prev - 1);
    };

    const handleCreateUpdate = async () => {
        if (submitting) return;
        setSubmitting(true);
        try {
            const formDataToSend = new FormData();
            formDataToSend.append('name', formData.name);
            formDataToSend.append('category', formData.category);
            formDataToSend.append('property_id', formData.property_id);
            formDataToSend.append('quantity', formData.quantity);
            formDataToSend.append('unit', formData.unit);
            formDataToSend.append('located_at', formData.located_at);
            formDataToSend.append('lower_limit', formData.lower_limit);
            formDataToSend.append('auto_purchase_order', formData.auto_purchase_order ? 1 : 0);
            formDataToSend.append('create_tasks', createTasks);
            if (formData.unit === 'container' && formData.container_type) {
                formDataToSend.append('container_type', formData.container_type);
            }
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
                    const pairs = repeatData.yearly_pairs || [];
                    const months = [...new Set(pairs.map(p => p.month))].sort((a, b) => a - b);
                    const dates = [...new Set(pairs.map(p => p.date))].sort((a, b) => a - b);
                    formDataToSend.append('repeat_month', JSON.stringify(months));
                    formDataToSend.append('repeat_date', JSON.stringify(dates));
                    formDataToSend.append('yearly_pairs', JSON.stringify(pairs));
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
        } finally {
            setSubmitting(false);
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

                <Stepper activeStep={activeStep} sx={{ mb: 3, mt: 1 }} alternativeLabel>
                    {steps.map((label) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>

                {/* Step 0: Basic Info */}
                {activeStep === 0 && (
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12 }}>
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
                            <FormControl fullWidth error={!!validationErrors?.category} required>
                                <InputLabel id="category-label" size='small'>Category</InputLabel>
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
                    </Grid>
                )}

                {/* Step 1: Quantity & Location */}
                {activeStep === 1 && (
                    <Grid container spacing={2}>
                        {!isEdit && (
                            <Grid size={{ xs: 12, sm: 12 }}>
                                <FormControl fullWidth error={!!validationErrors?.unit} required>
                                    <InputLabel id="unit-label" size='small'>Unit</InputLabel>
                                    <Select
                                        label="Unit *"
                                        variant="outlined"
                                        size='small'
                                        required
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
                        )}

                        {!isEdit && (
                            <Grid size={{ xs: 12, sm: 12 }}>
                                <QuantityInput
                                    unit={selectedUnit}
                                    value={formData.quantity}
                                    onChange={(val) => handleChange('quantity', val)}
                                    error={validationErrors?.quantity}
                                    label="Quantity *"
                                    containerType={formData.container_type}
                                    onContainerTypeChange={(val) => {
                                        handleChange('container_type', val);
                                        handleChange('quantity', '');
                                    }}
                                />
                            </Grid>
                        )}

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
                            <LowerLimitInput
                                unit={selectedUnit}
                                value={formData.lower_limit}
                                onChange={(val) => handleChange('lower_limit', val)}
                                error={validationErrors?.lower_limit}
                                disabled={false}
                            />
                        </Grid>

                        {/* Show auto purchase order toggle in Edit mode since Task step is skipped */}
                        {isEdit && (
                            <Grid size={{ xs: 12 }}>
                                <FormControlLabel
                                    label="Create a Purchase order when Quantity reaches threshold (lower limit)"
                                    labelPlacement='start'
                                    control={
                                        <Checkbox
                                            checked={!!formData.auto_purchase_order}
                                            onChange={(e) => handleChange('auto_purchase_order', e.target.checked)}
                                            color="primary"
                                        />
                                    }
                                />
                            </Grid>
                        )}
                    </Grid>
                )}

                {/* Step 2: Image */}
                {activeStep === 2 && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
                        {imagePreview && (
                            <Box sx={{ position: 'relative', width: 'fit-content' }}>
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

                        {!imagePreview && (
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                Image is optional. You can skip this step.
                            </Typography>
                        )}
                    </Box>
                )}

                {/* Step 3: Task (Create mode only) */}
                {activeStep === 3 && !isEdit && (
                    <Box>
                        <FormControlLabel
                            label="Create a Purchase order when Quantity reaches threshold (lower limit)"
                            labelPlacement='start'
                            control={
                                <Checkbox
                                    checked={!!formData.auto_purchase_order}
                                    onChange={(e) => handleChange('auto_purchase_order', e.target.checked)}
                                    color="primary"
                                />
                            }
                        />

                        <FormControlLabel
                            label="Create a Task for this Inventory"
                            labelPlacement='start'
                            control={
                                <Switch
                                    checked={createTasks}
                                    onChange={(e) => {
                                        const checked = e.target.checked;
                                        setCreateTasks(checked);
                                        if (checked) {
                                            setTaskFormData(prev => ({
                                                ...prev,
                                                task_title: prev.task_title || `Update ${formData.name}`,
                                                task_requires_photo: true,
                                                task_allows_inventory_update: true,
                                            }));
                                        }
                                    }}
                                    color="primary"
                                />
                            }
                            sx={{ mb: 2 }}
                        />

                        {createTasks && (

                            <Grid container spacing={2}
                                sx={{
                                    p: 2,
                                    border: `1px solid ${theme.palette.primary.main}`,
                                    borderRadius: 2,
                                    boxShadow: `0 0 100px ${theme.palette.primary.main}33`,
                                }}>

                                {/* ── Task Details Section ── */}
                                <Grid size={{ xs: 12 }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                                        Task Details
                                    </Typography>
                                    <Divider />
                                </Grid>

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

                                {/* ── Schedule Section ── */}
                                <Grid size={{ xs: 12 }} sx={{ mt: 1 }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                                        Schedule
                                    </Typography>
                                    <Divider />
                                </Grid>

                                {/* Date Picker */}
                                <Grid size={{ xs: 12, sm: 8 }}>
                                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                                            <DatePicker
                                                ref={datePickerRef}
                                                label="Select Date"
                                                format="DD/MM/YYYY"
                                                open={datePickerOpen}
                                                onOpen={() => setDatePickerOpen(true)}
                                                onClose={() => setDatePickerOpen(false)}
                                                closeOnSelect={false}
                                                value={selectedDate ? dayjs(selectedDate) : null}
                                                onChange={(newValue) => {
                                                    if (!newValue || !newValue.isValid()) return;
                                                    const dateVal = newValue.format('YYYY-MM-DD');
                                                    setSelectedDate(dateVal);
                                                    const alreadySelected = selectedDates.includes(dateVal);
                                                    if (alreadySelected) {
                                                        setSelectedDates(prev => prev.filter(d => d !== dateVal));
                                                        if (!isRepeat) {
                                                            setRepeatData(prev => ({
                                                                ...prev,
                                                                dates: (prev.dates || []).filter(d => d !== dateVal)
                                                            }));
                                                        } else {
                                                            removeFromRepeatData(dateVal);
                                                        }
                                                    } else {
                                                        setSelectedDates(prev => [...prev, dateVal].sort());
                                                        if (!isRepeat) {
                                                            if (!repeatData.dates?.includes(dateVal)) {
                                                                setRepeatData(prev => ({
                                                                    ...prev,
                                                                    dates: [...(prev.dates || []), dateVal].sort()
                                                                }));
                                                            }
                                                        } else {
                                                            handleTaskChange('task_start_date', dateVal);
                                                            autoPopulateFromDate(dateVal);
                                                        }
                                                    }
                                                }}
                                                slots={{
                                                    day: (dayProps) => {
                                                        const dateStr = dayProps.day.format('YYYY-MM-DD');
                                                        const isHighlighted = !isRepeat
                                                            ? repeatData.dates?.includes(dateStr)
                                                            : selectedDates.includes(dateStr);
                                                        return <PickersDay {...dayProps} selected={dayProps.selected || isHighlighted} />;
                                                    }
                                                }}
                                                slotProps={{
                                                    textField: {
                                                        size: 'small',
                                                        fullWidth: true,
                                                        error: !isRepeat && !!validationErrors.task_repeat_on,
                                                        helperText: !isRepeat ? (validationErrors.task_repeat_on || 'Pick dates to add them') : 'Pick a date to pre-fill repeat options',
                                                        onClick: () => setDatePickerOpen(true),
                                                    },
                                                }}
                                            />
                                        </LocalizationProvider>

                                        <FormControlLabel
                                            labelPlacement="start"
                                            control={
                                                <Checkbox
                                                    checked={isRepeat}
                                                    onChange={(e) => {
                                                        const checked = e.target.checked;
                                                        setIsRepeat(checked);
                                                        if (checked) {
                                                            handleTaskChange('task_schedule_type', repeatScheduleType);
                                                            if (selectedDates.length > 0) {
                                                                autoPopulateFromMultipleDates(selectedDates, repeatScheduleType);
                                                            } else if (selectedDate) {
                                                                autoPopulateFromDate(selectedDate);
                                                            } else {
                                                                setRepeatData({});
                                                            }
                                                        } else {
                                                            handleTaskChange('task_schedule_type', 'fixed_dates');
                                                            setRepeatData({});
                                                            setShowStartDateInput(false);
                                                        }
                                                    }}
                                                />
                                            }
                                            label="Repeat"
                                        />
                                    </Box>
                                </Grid>

                                {/* Monthly - Selected Dates (below DatePicker) */}
                                {isRepeat && repeatScheduleType === 'monthly' && (
                                    <Grid size={{ xs: 12 }}>
                                        {repeatData.dates?.length > 0 ? (
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
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
                                        ) : (
                                            <Box sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>
                                                Select dates from the calendar above
                                            </Box>
                                        )}
                                        {validationErrors?.task_repeat_on && (
                                            <Box sx={{ color: 'error.main', fontSize: '0.75rem', mt: 0.5 }}>
                                                {validationErrors.task_repeat_on}
                                            </Box>
                                        )}
                                    </Grid>
                                )}

                                {/* Yearly - Selected Month/Date pairs (below DatePicker) */}
                                {isRepeat && repeatScheduleType === 'yearly' && (
                                    <Grid size={{ xs: 12 }}>
                                        {repeatData.yearly_pairs?.length > 0 ? (
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                {repeatData.yearly_pairs.map((pair, idx) => (
                                                    <Box
                                                        key={idx}
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
                                                        {monthsOfYear.find(m => m.value === pair.month)?.label} {pair.date}
                                                        <IconButton
                                                            size="small"
                                                            sx={{ p: 0, ml: 0.5 }}
                                                            onClick={() => {
                                                                setRepeatData(prev => ({
                                                                    ...prev,
                                                                    yearly_pairs: prev.yearly_pairs.filter((_, i) => i !== idx)
                                                                }));
                                                            }}
                                                        >
                                                            <CloseIcon sx={{ fontSize: 14 }} />
                                                        </IconButton>
                                                    </Box>
                                                ))}
                                            </Box>
                                        ) : (
                                            <Box sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>
                                                Select dates from the calendar above
                                            </Box>
                                        )}
                                        {validationErrors?.task_repeat_on && (
                                            <Box sx={{ color: 'error.main', fontSize: '0.75rem', mt: 0.5 }}>
                                                {validationErrors.task_repeat_on}
                                            </Box>
                                        )}
                                    </Grid>
                                )}

                                {/* Fixed dates chips */}
                                {!isRepeat && repeatData.dates && repeatData.dates.length > 0 && (
                                    <Grid size={{ xs: 12 }}>
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
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
                                    </Grid>
                                )}

                                {/* Repeat options */}
                                {isRepeat && (
                                    <>
                                        <Grid size={{ xs: 12 }}>
                                            <RadioGroup
                                                row
                                                value={repeatScheduleType}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    setRepeatScheduleType(val);
                                                    handleTaskChange('task_schedule_type', val);
                                                    if (selectedDates.length > 0) {
                                                        autoPopulateFromMultipleDates(selectedDates, val);
                                                    } else if (selectedDate) {
                                                        setRepeatData({});
                                                        setTimeout(() => autoPopulateFromDate(selectedDate), 0);
                                                    } else {
                                                        setRepeatData({});
                                                    }
                                                }}
                                            >
                                                <FormControlLabel value="weekly" control={<Radio />} label="Weekly" />
                                                <FormControlLabel value="monthly" control={<Radio />} label="Monthly" />
                                                <FormControlLabel value="yearly" control={<Radio />} label="Yearly" />
                                            </RadioGroup>
                                        </Grid>

                                        {/* Start/End date row */}
                                        <Grid size={{ xs: 12 }}>
                                            {taskFormData.task_start_date ? (
                                                <Box
                                                    onClick={() => setDatePickerOpen(true)}
                                                    sx={{
                                                        cursor: 'pointer',
                                                        color: palette.primary.main,
                                                        fontSize: '0.875rem',
                                                        py: 0.5,
                                                        '&:hover': { textDecoration: 'underline' },
                                                    }}
                                                >
                                                    Starts from {formatDateDisplay(taskFormData.task_start_date)}
                                                    {repeatScheduleType === 'weekly' && ' every Week'}
                                                    {repeatScheduleType === 'monthly' && ' every Month'}
                                                    {repeatScheduleType === 'yearly' && ' every Year'}
                                                    <span style={{ fontSize: '0.75rem', marginLeft: 8, opacity: 0.7 }}>(click to change)</span>
                                                </Box>
                                            ) : null}
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

                                        {/* Weekly */}
                                        {repeatScheduleType === 'weekly' && (
                                            <Grid size={{ xs: 12 }}>
                                                <FormControl component="fieldset" fullWidth>
                                                    <FormLabel component="legend" sx={{ mb: 1 }}>Select days of the week</FormLabel>
                                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                                        {daysOfWeek.map((day) => {
                                                            const isSelected = repeatData.days?.includes(day.value);
                                                            return (
                                                                <Button
                                                                    key={day.value}
                                                                    variant={isSelected ? 'contained' : 'outlined'}
                                                                    onClick={() => {
                                                                        const currentDays = repeatData.days || [];
                                                                        const newDays = isSelected
                                                                            ? currentDays.filter(d => d !== day.value)
                                                                            : [...currentDays, day.value];
                                                                        setRepeatData({ days: newDays });
                                                                    }}
                                                                    sx={{
                                                                        textTransform: 'none',
                                                                        borderRadius: 10,
                                                                        minWidth: 'auto',
                                                                        height: isMobile ? 25 : 30,
                                                                        ...(isSelected && {
                                                                            backgroundColor: palette.primary.main,
                                                                            color: palette.primary.contrastText,
                                                                            '&:hover': { backgroundColor: palette.secondary.main },
                                                                        }),
                                                                    }}
                                                                >
                                                                    {isMobile ? day.shortLabel : day.label}
                                                                </Button>
                                                            );
                                                        })}
                                                    </Box>
                                                    {validationErrors?.task_repeat_on && (
                                                        <Box sx={{ color: 'error.main', fontSize: '0.75rem', mt: 0.5 }}>
                                                            {validationErrors.task_repeat_on}
                                                        </Box>
                                                    )}
                                                </FormControl>
                                            </Grid>
                                        )}

                                    </>
                                )}

                                {/* ── Assignment & Settings Section ── */}
                                <Grid size={{ xs: 12 }} sx={{ mt: 1 }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5, color: palette.primary.main }}>
                                        Assignment & Settings
                                    </Typography>
                                    <Divider />
                                </Grid>

                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Autocomplete
                                        size="small"
                                        value={teamMembers.find((item) => item.id === taskFormData.task_assigned_to) || null}
                                        onChange={(e, newValue) => {
                                            handleTaskChange('task_assigned_to', newValue ? newValue.id : '');
                                        }}
                                        options={teamMembers || []}
                                        getOptionLabel={(option) => option.name ? String(option.name) : ''}
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
                                            label="A Photo Proof is Required"
                                            labelPlacement='start'
                                            control={
                                                <Checkbox
                                                    checked={!!taskFormData.task_requires_photo}
                                                    onChange={handleTaskCheckboxChange}
                                                />
                                            }
                                        />
                                    </Grid>

                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <FormControlLabel
                                            label="Update Inventory Quantity"
                                            labelPlacement='start'
                                            control={
                                                <Checkbox
                                                    checked={!!taskFormData.task_allows_inventory_update}
                                                    onChange={handleTaskInventoryCheckboxChange}
                                                />
                                            }
                                        />
                                    </Grid>
                                </Grid>

                            </Grid>
                        )}

                        {!createTasks && (
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                You can optionally create a recurring task linked to this inventory item.
                            </Typography>
                        )}
                    </Box>
                )}

            </DialogContent>

            <DialogActions sx={{ px: 2, py: 2, justifyContent: 'space-between' }}>
                <Button
                    variant="outlined"
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
                    variant="contained"
                    disableElevation
                    disabled={loading || submitting}
                    onClick={handleNext}
                    endIcon={activeStep < steps.length - 1 ? <NavigateNext /> : null}
                    sx={{
                        textTransform: 'none',
                        backgroundColor: palette.primary.main,
                        '&:hover': { backgroundColor: palette.secondary.main },
                        borderRadius: 10,
                    }}
                >
                    {submitting
                        ? 'Saving...'
                        : activeStep === steps.length - 1
                            ? (isEdit ? 'Update' : 'Create Inventory')
                            : 'Next'
                    }
                </Button>
            </DialogActions>

        </Dialog>
    )
}

export default TileView_addEdit_Inventory