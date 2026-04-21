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
    useMediaQuery,
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
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { PickersDay } from '@mui/x-date-pickers/PickersDay';
import dayjs from 'dayjs';
import { daysOfWeek, monthsOfYear, datesOfMonth } from '../../../constant';
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
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
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
    const [showStartDateInput, setShowStartDateInput] = useState(false);
    const [yearlyMonth, setYearlyMonth] = useState('');
    const [yearlyDate, setYearlyDate] = useState('');
    const [isRepeat, setIsRepeat] = useState(false);
    const [repeatScheduleType, setRepeatScheduleType] = useState('weekly');
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedDates, setSelectedDates] = useState([]);
    const [datePickerOpen, setDatePickerOpen] = useState(false);
    const datePickerRef = useRef(null);

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
                schedule_type: schedule.type || 'fixed_dates',
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
                // Convert old yearly format to yearly_pairs if needed
                const rule = { ...recurrenceRule };
                if (schedule.type === 'yearly' && rule.months && rule.dates && !rule.yearly_pairs) {
                    const pairs = [];
                    for (const m of rule.months) {
                        for (const d of rule.dates) {
                            pairs.push({ month: m, date: d });
                        }
                    }
                    rule.yearly_pairs = pairs;
                    delete rule.months;
                    delete rule.dates;
                }
                setRepeatData(rule);
            }

            // Set repeat mode based on schedule type
            const schedType = schedule.type || 'fixed_dates';
            if (['weekly', 'monthly', 'yearly'].includes(schedType)) {
                setIsRepeat(true);
                setRepeatScheduleType(schedType);
            } else {
                setIsRepeat(false);
            }
            setSelectedDate('');

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
                schedule_type: 'fixed_dates',
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
        setShowStartDateInput(false);
        setIsRepeat(false);
        setRepeatScheduleType('weekly');
        setSelectedDate('');
        setSelectedDates([]);
        setDatePickerOpen(false);
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

    // Calculate first occurrence date based on schedule type and repeat data
    const calculateFirstOccurrence = (scheduleType, data) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (scheduleType === 'weekly' && data.days?.length > 0) {
            const todayDay = today.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
            let minDaysAhead = Infinity;
            for (const dayValue of data.days) {
                const jsDay = dayValue % 7; // 1=Mon→1, 7=Sun→0
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

    // Auto-populate repeat data from a selected date (appends to existing)
    const autoPopulateFromDate = (dateStr, type) => {
        if (!dateStr) return;
        const schedType = type || repeatScheduleType;
        const d = new Date(dateStr + 'T00:00:00');
        const dayOfWeek = d.getDay() === 0 ? 7 : d.getDay();
        const dateOfMonth = d.getDate();
        const month = d.getMonth() + 1;

        switch (schedType) {
            case 'weekly':
                setRepeatData(prev => ({
                    days: [...new Set([...(prev.days || []), dayOfWeek])]
                }));
                break;
            case 'monthly':
                setRepeatData(prev => ({
                    dates: [...new Set([...(prev.dates || []), dateOfMonth])].sort((a, b) => a - b)
                }));
                break;
            case 'yearly':
                setRepeatData(prev => {
                    const exists = (prev.yearly_pairs || []).some(
                        p => p.month === month && p.date === dateOfMonth
                    );
                    if (exists) return prev;
                    return {
                        yearly_pairs: [...(prev.yearly_pairs || []), { month, date: dateOfMonth }]
                            .sort((a, b) => a.month - b.month || a.date - b.date)
                    };
                });
                break;
            default:
                break;
        }
    };

    // Remove a date's contribution from repeat data
    const removeFromRepeatData = (dateStr, type) => {
        if (!dateStr) return;
        const schedType = type || repeatScheduleType;
        const d = new Date(dateStr + 'T00:00:00');
        const dayOfWeek = d.getDay() === 0 ? 7 : d.getDay();
        const dateOfMonth = d.getDate();
        const month = d.getMonth() + 1;

        switch (schedType) {
            case 'weekly':
                setRepeatData(prev => ({
                    days: (prev.days || []).filter(day => day !== dayOfWeek)
                }));
                break;
            case 'monthly':
                setRepeatData(prev => ({
                    dates: (prev.dates || []).filter(date => date !== dateOfMonth)
                }));
                break;
            case 'yearly':
                setRepeatData(prev => ({
                    yearly_pairs: (prev.yearly_pairs || []).filter(
                        p => !(p.month === month && p.date === dateOfMonth)
                    )
                }));
                break;
            default:
                break;
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
                break;
            case 'monthly':
                setRepeatData({ dates: dates.sort((a, b) => a - b) });
                break;
            case 'yearly':
                setRepeatData({ yearly_pairs: yearlyPairs.sort((a, b) => a.month - b.month || a.date - b.date) });
                break;
            default:
                setRepeatData({});
                break;
        }
    };

    // Auto-calculate start_date when repeat data changes (for new tasks)
    useEffect(() => {
        if (isEdit && !isDuplicate) return;
        if (showStartDateInput) return;
        if (formData.schedule_type === 'fixed_dates') return;

        const firstDate = calculateFirstOccurrence(formData.schedule_type, repeatData);
        if (firstDate) {
            setFormData(prev => ({ ...prev, start_date: firstDate }));
        }
    }, [formData.schedule_type, repeatData, isEdit, isDuplicate, showStartDateInput]);

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
            recurrenceRule = { ...repeatData };
            // Convert yearly_pairs to months+dates for backend compatibility
            if (formData.schedule_type === 'yearly' && recurrenceRule.yearly_pairs) {
                const months = [...new Set(recurrenceRule.yearly_pairs.map(p => p.month))].sort((a, b) => a - b);
                const dates = [...new Set(recurrenceRule.yearly_pairs.map(p => p.date))].sort((a, b) => a - b);
                recurrenceRule.months = months;
                recurrenceRule.dates = dates;
            }
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

                            {/* Date Picker + Repeat Toggle */}
                            <Grid size={{ xs: 12 , sm: 8}}>
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
                                                        autoPopulateFromDate(dateVal);
                                                    }
                                                }
                                            }}
                                            disabled={purchaseMode}
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
                                                    error: !isRepeat && !!validationErrors.repeat_on,
                                                    helperText: !isRepeat ? (validationErrors.repeat_on || 'Pick dates to add them') : 'Pick a date to pre-fill repeat options',
                                                    onClick: () => !purchaseMode && setDatePickerOpen(true),
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
                                                    const newIsRepeat = e.target.checked;
                                                    setIsRepeat(newIsRepeat);
                                                    if (newIsRepeat) {
                                                        setFormData(prev => ({ ...prev, schedule_type: repeatScheduleType }));
                                                        if (selectedDates.length > 0) {
                                                            autoPopulateFromMultipleDates(selectedDates, repeatScheduleType);
                                                        } else if (selectedDate) {
                                                            autoPopulateFromDate(selectedDate);
                                                        } else {
                                                            setRepeatData({});
                                                        }
                                                    } else {
                                                        setFormData(prev => ({ ...prev, schedule_type: 'fixed_dates' }));
                                                        setRepeatData({});
                                                        setShowStartDateInput(false);
                                                    }
                                                }}
                                                disabled={purchaseMode}
                                            />
                                        }
                                        label="Repeat"
                                        sx={{ whiteSpace: 'nowrap' }}
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
                                    {validationErrors.repeat_on && (
                                        <Box sx={{ color: 'error.main', fontSize: '0.75rem', mt: 0.5 }}>
                                            {validationErrors.repeat_on}
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
                                    {validationErrors.repeat_on && (
                                        <Box sx={{ color: 'error.main', fontSize: '0.75rem', mt: 0.5 }}>
                                            {validationErrors.repeat_on}
                                        </Box>
                                    )}
                                </Grid>
                            )}

                            {/* Fixed dates chips (when not repeating) */}
                            {!isRepeat && repeatData.dates?.length > 0 && (
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
                                                {formatDateDisplay(date)}
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

                            {/* Repeat Options */}
                            {isRepeat && (
                                <>
                                    <Grid size={{ xs: 12 }}>
                                        <RadioGroup
                                            row
                                            value={repeatScheduleType}
                                            onChange={(e) => {
                                                const newType = e.target.value;
                                                setRepeatScheduleType(newType);
                                                setFormData(prev => ({ ...prev, schedule_type: newType }));
                                                if (selectedDates.length > 0) {
                                                    autoPopulateFromMultipleDates(selectedDates, newType);
                                                } else if (selectedDate) {
                                                    autoPopulateFromDate(selectedDate, newType);
                                                } else {
                                                    setRepeatData({});
                                                }
                                                setShowStartDateInput(false);
                                            }}
                                        >
                                            <FormControlLabel value="weekly" control={<Radio />} label="Weekly" />
                                            <FormControlLabel value="monthly" control={<Radio />} label="Monthly" />
                                            <FormControlLabel value="yearly" control={<Radio />} label="Yearly" />
                                        </RadioGroup>
                                    </Grid>

                                    {/* Weekly - Select Days */}
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
                                                {validationErrors.repeat_on && (
                                                    <Box sx={{ color: 'error.main', fontSize: '0.75rem', mt: 0.5 }}>
                                                        {validationErrors.repeat_on}
                                                    </Box>
                                                )}
                                            </FormControl>
                                        </Grid>
                                    )}

                                    {/* Start / End Dates */}
                                    <Grid size={{ xs: 12 }}>
                                        {formData.start_date ? (
                                            <Box
                                                onClick={() => {
                                                    if (!(isEdit && !isDuplicate)) {
                                                        setDatePickerOpen(true);
                                                    }
                                                }}
                                                sx={{
                                                    cursor: (isEdit && !isDuplicate) ? 'default' : 'pointer',
                                                    color: palette.primary.main,
                                                    fontSize: '0.875rem',
                                                    py: 0.5,
                                                    '&:hover': !(isEdit && !isDuplicate) ? { textDecoration: 'underline' } : {},
                                                }}
                                            >
                                                Starts from {formatDateDisplay(formData.start_date)}
                                                {repeatScheduleType === 'weekly' && ' every Week'}
                                                {repeatScheduleType === 'monthly' && ' every Month'}
                                                {repeatScheduleType === 'yearly' && ' every Year'}
                                                {!(isEdit && !isDuplicate) && (
                                                    <span style={{ fontSize: '0.75rem', marginLeft: 8, opacity: 0.7 }}>(click to change)</span>
                                                )}
                                            </Box>
                                        ) : null}
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
                        disableElevation
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