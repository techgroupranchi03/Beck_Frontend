import React, { useState, useEffect } from 'react'
import {
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    useTheme,
    Slide,
    TextField,
    Grid,
    FormControl,
    FormLabel,
    RadioGroup,
    FormControlLabel,
    Radio,
    Chip,
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
import { scheduleTypes, daysOfWeek, monthsOfYear, datesOfMonth } from '../../../constant';
import { useTaskContext } from './TaskManagement';
import { useSnackbar } from '../../../resuable_components/Snackbar';
import PaginatedAutocomplete from '../../../resuable_components/PaginatedAutocomplete';

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const TileVeiwAddEditGroupTaskDialog = ({ open, onClose, task }) => {
    const theme = useTheme();
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
        schedule_type: 'weekly',
        start_date: '',
        end_date: '',
    });
    const [repeatData, setRepeatData] = useState({});
    const [selectedProperty, setSelectedProperty] = useState(null);
    const [activeStep, setActiveStep] = useState(0);

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

            setRepeatData(recurrenceRule);
            
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
                schedule_type: 'weekly',
                start_date: new Date().toISOString().split('T')[0],
                end_date: '',
            });
            setRepeatData({});
            setSelectedProperty(null);
            // Fetch initial properties
            fetchProperties(1, false, '');
        }
        setValidationErrors({});
        setActiveStep(0);
    }, [task, isEdit, isDuplicate, open, fetchProperties]);


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
                recurrenceRule = repeatData;
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

                        <Grid size={{ xs: 12 }}>
                            <FormControl component="fieldset" fullWidth>
                                <FormLabel component="legend"
                                    sx={{
                                        color: validationErrors.schedule_type ? theme.palette.error.main : 'inherit',
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
                                        <FormControlLabel key={type} value={type} control={<Radio />} label={type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')} />
                                    ))}
                                </RadioGroup>
                                {validationErrors.schedule_type && (
                                    <Box sx={{ color: 'error.main', fontSize: '0.75rem', mt: 0.1 }}>
                                        {validationErrors.schedule_type}
                                    </Box>
                                )}
                            </FormControl>
                        </Grid>

                        {/* Weekly - Select Days */}
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
                                        const dayValues = newValue.map(day => day.value);
                                        setRepeatData({ days: dayValues });
                                    }}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Select Days"
                                            placeholder="Choose days of the week"
                                            required
                                            error={!!validationErrors.recurrence_rule}
                                            helperText={validationErrors.recurrence_rule || 'Select days of the week'}
                                        />
                                    )}
                                    isOptionEqualToValue={(option, value) => option.value === value.value}
                                />
                            </Grid>
                        )}

                        {/* Monthly - Select Dates */}
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
                                            error={!!validationErrors.recurrence_rule}
                                            helperText={validationErrors.recurrence_rule || 'Select dates of the month (1-31)'}
                                        />
                                    )}
                                />
                            </Grid>
                        )}

                        {/* Yearly - Select Months and Dates */}
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
                                                error={!!validationErrors.recurrence_rule}
                                                helperText={validationErrors.recurrence_rule || 'Select months of the year'}
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
                                                error={!!validationErrors.recurrence_rule}
                                                helperText={validationErrors.recurrence_rule || 'Select dates (1-31)'}
                                            />
                                        )}
                                    />
                                </Grid>
                            </>
                        )}

                        {/* Fixed Dates - Date Picker with Chips */}
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
                                    error={!!validationErrors.recurrence_rule}
                                    helperText={validationErrors.recurrence_rule || 'Pick dates to add them'}
                                />
                                {repeatData.dates && repeatData.dates.length > 0 && (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                                        {repeatData.dates.map((date) => (
                                            <Chip
                                                key={date}
                                                label={date}
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
                                )}
                            </Grid>
                        )}

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
                                        InputLabelProps={{ shrink: true }}
                                        error={!!validationErrors.start_date}
                                        helperText={validationErrors.start_date}
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

                <DialogActions sx={{ px: 3, py: 2, justifyContent: 'space-between' }}>
                    <Button
                        variant='outlined'
                        size='small'
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