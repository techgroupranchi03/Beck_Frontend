import React, { useState, useEffect, useRef } from 'react'
import {
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    useTheme,
    useMediaQuery,
    Slide,
    TextField,
    Grid,
    FormControl,
    FormLabel,
    RadioGroup,
    FormControlLabel,
    Radio,
    Chip,
    Checkbox,
    Box,
    Autocomplete,
    DialogActions,
    Button,
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
import PaginatedAutocomplete from '../../../resuable_components/PaginatedAutocomplete';

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const TileVeiwAddEditGroupTaskDialog = ({ open, onClose, task }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const { palette } = theme;
    const { showSnackbar } = useSnackbar();
    const isEdit = !!task && !!task.id;
    const isDuplicate = !!task && !task.id;
    const [validationErrors, setValidationErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const {
        createGroupTask,
        updateGroupTask,
        properties,
        fetchProperties,
        propertyPagination,
    } = useTaskContext();
    const [formData, setFormData] = useState({
        title: '',
        property_id: '',
        schedule_type: 'fixed_dates',
        start_date: '',
        end_date: '',
    });
    const [repeatData, setRepeatData] = useState({});
    const [selectedProperty, setSelectedProperty] = useState(null);
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

    const steps = ['Details', 'Schedule'];


    //console.log("group task details ",task );

    // Populate form when editing or duplicating
    useEffect(() => {
        if ((isEdit || isDuplicate) && task && open) {
            const schedule = task.schedule || {};
            const recurrenceRule = schedule.recurrence_rule || task.recurrence_rule || {};

            setFormData({
                title: task.name || task.title || '',
                property_id: task.property_id || task.property?.id || '',
                schedule_type: schedule.type || task.schedule_type || 'weekly',
                start_date: (schedule.start_date || task.start_date || '').split('T')[0],
                end_date: (schedule.end_date || task.end_date || '').split('T')[0],
            });

            // Convert old yearly format to yearly_pairs if needed
            const rule = { ...recurrenceRule };
            if ((schedule.type || task.schedule_type) === 'yearly' && rule.months && rule.dates && !rule.yearly_pairs) {
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

            // Set repeat mode based on schedule type
            const schedType = schedule.type || task.schedule_type || 'fixed_dates';
            if (['weekly', 'monthly', 'yearly'].includes(schedType)) {
                setIsRepeat(true);
                setRepeatScheduleType(schedType);
            } else {
                setIsRepeat(false);
            }
            setSelectedDate('');

            // Set selected property
            const propertyId = task.property_id || task.property?.id;
            if (propertyId && task.property) {
                setSelectedProperty(task.property);
            }
        } else if (open) {
            // Reset form for new task
            setFormData({
                title: '',
                property_id: '',
                schedule_type: 'fixed_dates',
                start_date: '',
                end_date: '',
            });
            setRepeatData({});
            setSelectedProperty(null);
            setIsRepeat(false);
            setRepeatScheduleType('weekly');
            setSelectedDate('');
            setSelectedDates([]);
            setDatePickerOpen(false);
            // Fetch initial properties
            fetchProperties(1, false, '');
        }
        setValidationErrors({});
        setActiveStep(0);
        setShowStartDateInput(false);
    }, [task, isEdit, isDuplicate, open, fetchProperties]);


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
        setFormData((prevData) => ({
            ...prevData,
            [field]: value,
        }));
        // Clear validation error for the field
        if (validationErrors[field]) {
            setValidationErrors((prevErrors) => ({
                ...prevErrors,
                [field]: undefined,
            }));
        }
    };

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
            handleSubmit();
        } else {
            setActiveStep(prev => prev + 1);
        }
    };

    const handleStepBack = () => {
        setActiveStep(prev => prev - 1);
    };

    const handleSubmit = async () => {
        setValidationErrors({});
        setLoading(true);

        try {
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

            const payload = {
                name: formData.title,
                property_id: formData.property_id || null,
                schedule_type: formData.schedule_type,
                recurrence_rule: recurrenceRule,
                start_date: isFixedDates ? null : (formData.start_date || null),
                end_date: isFixedDates ? null : (formData.end_date || null),
            };

            //console.log('Submitting payload:', payload);

            let res;
            if (isEdit) {
                res = await updateGroupTask(task.id, payload);
                showSnackbar(res.message, 'success');
            } else {
                res = await createGroupTask(payload);
                showSnackbar(res.message, 'success');
            }

            onClose(true);
        } catch (error) {
            console.error('Error submitting group task:', error);

            if (error.errors) {
                const apiErrors = {};

                if (Array.isArray(error.errors)) {
                    error.errors.forEach((errObj) => {
                        Object.keys(errObj).forEach((field) => {
                            apiErrors[field] = errObj[field];
                        });
                    });
                } else if (typeof error.errors === 'object') {
                    Object.keys(error.errors).forEach((key) => {
                        apiErrors[key] =
                            error.errors[key]?.message || error.errors[key];
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
        <>

            <Dialog
                open={open}
                maxWidth="md"
                fullWidth
                aria-labelledby="add-edit-group-task-dialog-title"
                TransitionComponent={Transition}
            >
                <DialogTitle>
                    {isEdit ? 'Edit Group Task' : isDuplicate ? 'Duplicate Group Task' : 'Create Group Task'}
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

                        <Grid size={{ xs: 12, sm: 12 }}>
                            <PaginatedAutocomplete
                                label="Property"
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
                                        setValidationErrors((prevErrors) => ({
                                            ...prevErrors,
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
                                                error: !isRepeat && !!validationErrors.recurrence_rule,
                                                helperText: !isRepeat ? (validationErrors.recurrence_rule || 'Pick dates to add them') : 'Pick a date to pre-fill repeat options',
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
                                            // size="small"
                                        />
                                    }
                                    label="Repeat"
                                    sx={{ whiteSpace: 'nowrap'}}
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
                                {validationErrors.recurrence_rule && (
                                    <Box sx={{ color: 'error.main', fontSize: '0.75rem', mt: 0.5 }}>
                                        {validationErrors.recurrence_rule}
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
                                {validationErrors.recurrence_rule && (
                                    <Box sx={{ color: 'error.main', fontSize: '0.75rem', mt: 0.5 }}>
                                        {validationErrors.recurrence_rule}
                                    </Box>
                                )}
                            </Grid>
                        )}

                        {/* Fixed dates chips (when not repeating) */}
                        {!isRepeat && repeatData.dates?.length > 0 && (
                            <Grid size={{ xs: 12 }}>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {repeatData.dates.map((date) => (
                                        <Chip
                                            key={date}
                                            label={formatDateDisplay(date)}
                                            size="small"
                                            color="primary"
                                            variant="outlined"
                                            onDelete={() => {
                                                setRepeatData(prev => ({
                                                    ...prev,
                                                    dates: prev.dates.filter(d => d !== date)
                                                }));
                                            }}
                                        />
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
                                            {validationErrors.recurrence_rule && (
                                                <Box sx={{ color: 'error.main', fontSize: '0.75rem', mt: 0.5 }}>
                                                    {validationErrors.recurrence_rule}
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
                                        InputLabelProps={{ shrink: true }}
                                        error={!!validationErrors.end_date}
                                        helperText={validationErrors.end_date || 'Optional'}
                                    />
                                </Grid>
                            </>
                        )}
                    </Grid>
                    )}

                </DialogContent>

                <DialogActions disableSpacing  sx={{py: 2, justifyContent: 'space-between',}}>
                    <Button
                        variant='outlined'
                        disableElevation
                        disabled={activeStep === 0}
                        onClick={handleStepBack}
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
                                ? (isEdit ? 'Update Group Task' : isDuplicate ? 'Duplicate Group Task' : 'Create Group Task')
                                : 'Next'
                        }
                    </Button>
                </DialogActions>

            </Dialog>
        </>
    )
}

export default TileVeiwAddEditGroupTaskDialog