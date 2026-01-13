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
    MenuItem,
    Chip,
    Box,
    Autocomplete,
    DialogActions,
    Button,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close';
import { scheduleTypes, daysOfWeek, monthsOfYear, datesOfMonth } from '../../../constant';
import { useTaskContext } from './TaskManagement';
import { useSnackbar } from '../../../resuable_components/Snackbar';

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
    const [taskScheduleType, setTaskScheduleType] = useState('one_time');
    const {
        createGroupTask,
        updateGroupTask,
        teamMembers,
    } = useTaskContext();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        group_scheduled_type: '',
        assigned_to: '',
        start_date: '',
        repeat_on: {},
        specific_dates: [],
    });
    const [currentSpecificDate, setCurrentSpecificDate] = useState('');
    const [repeatData, setRepeatData] = useState({
        days: [],
        dates: [],
        months: [],
    });

    // Update repeat_on whenever group_scheduled_type or repeatData changes
    useEffect(() => {
        if (taskScheduleType === 'recurring' && formData.group_scheduled_type) {
            let repeatOnObj = {};

            switch (formData.group_scheduled_type) {
                case 'daily':
                    repeatOnObj = {
                        frequency: 'daily'
                    };
                    break;
                case 'weekly':
                    repeatOnObj = {
                        frequency: 'weekly',
                        days: repeatData.days
                    };
                    break;
                case 'monthly':
                    repeatOnObj = {
                        frequency: 'monthly',
                        dates: repeatData.dates
                    };
                    break;
                case 'yearly':
                    repeatOnObj = {
                        frequency: 'yearly',
                        months: repeatData.months,
                        dates: repeatData.dates
                    };
                    break;
                default:
                    repeatOnObj = {};
            }

            setFormData(prev => ({
                ...prev,
                repeat_on:repeatOnObj,
            }));
        }
    }, [formData.group_scheduled_type, repeatData, taskScheduleType]);

    // Populate form when editing or duplicating
    useEffect(() => {
        if ((isEdit || isDuplicate) && task && open) {
            setFormData({
                title: task.title || '',
                description: task.description || '',
                group_scheduled_type: task.repeat_on?.frequency || '',
                assigned_to: task.assigned_to || '',
                start_date: task.start_date || '',
                repeat_on: task.repeat_on ? JSON.stringify(task.repeat_on) : '',
                specific_dates: task.specific_dates || [],
            });

            // Set task schedule type
            if (task.group_scheduled_type === 'recurring') {
                setTaskScheduleType('recurring');
            } else if (task.group_scheduled_type === 'specific_dates') {
                setTaskScheduleType('specific_dates');
            } else {
                setTaskScheduleType('one_time');
            }

            // Parse repeat_on data
            if (task.repeat_on) {
                const repeatOn = typeof task.repeat_on === 'string' ? JSON.parse(task.repeat_on) : task.repeat_on;
                setRepeatData({
                    days: repeatOn.days || [],
                    dates: repeatOn.dates || [],
                    months: repeatOn.months || [],
                });
            }
        } else if (open) {
            // Reset form for new task
            setFormData({
                title: '',
                description: '',
                group_scheduled_type: '',
                assigned_to: '',
                start_date: '',
                repeat_on: '',
                specific_dates: [],
            });
            setTaskScheduleType('one_time');
            setRepeatData({
                days: [],
                dates: [],
                months: [],
            });
        }
        setValidationErrors({});
    }, [task, isEdit, isDuplicate, open]);

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

    const handleSpecificDateChange = (e) => {
        const selectedDate = e.target.value;
        if (!selectedDate) return;

        setFormData((prev) => {
            const exists = prev.specific_dates.includes(selectedDate);

            return {
                ...prev,
                specific_dates: exists
                    ? prev.specific_dates.filter((d) => d !== selectedDate)
                    : [...prev.specific_dates, selectedDate],
            };
        });

        setCurrentSpecificDate('');
    };

    const handleSubmit = async () => {
        setValidationErrors({});
        setLoading(true);

        try {
            // Prepare payload
            const payload = {
                title: formData.title,
                description: formData.description,
                assigned_to: formData.assigned_to,
            };

            // Add schedule specific fields
            if (taskScheduleType === 'specific_dates') {
                payload.group_scheduled_type = 'specific_dates';
                payload.specific_dates = formData.specific_dates;
            } else if (taskScheduleType === 'recurring') {
                payload.group_scheduled_type = 'recurring';
                payload.repeat_on = formData.repeat_on;
                payload.start_date = formData.start_date;
            } else {
                payload.group_scheduled_type = 'one_time';
                payload.start_date = formData.start_date;
            }

            console.log('Submitting payload:', payload);

            let res;
            if (isEdit) {
                res = await updateGroupTask(task.id, payload);
                showSnackbar(res.message || 'Group task updated successfully', 'success');
            } else {
                res = await createGroupTask(payload);
                showSnackbar(res.message, 'success');
            }

            onClose();
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
                    <Grid container spacing={2} sx={{ mt: 1 }}>

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
                                rows={4}
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

                        <Grid size={{ xs: 12, sm: taskScheduleType === 'recurring' ? 6 : 12 }}>
                            <FormControl component="fieldset" disabled={isEdit && !isDuplicate} fullWidth>
                                <FormLabel component="legend">Task Schedule</FormLabel>
                                <RadioGroup
                                    row
                                    value={taskScheduleType}
                                    onChange={(e) => setTaskScheduleType(e.target.value)}
                                >
                                    <FormControlLabel value="one_time" control={<Radio />} label="One Time" />
                                    <FormControlLabel value="specific_dates" control={<Radio />} label="Specific Dates" />
                                    <FormControlLabel value="recurring" control={<Radio />} label="Recurring" />
                                </RadioGroup>
                            </FormControl>
                        </Grid>

                        {taskScheduleType === 'recurring' && (
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <FormControl component="fieldset">
                                    <FormLabel component="legend"
                                        sx={{
                                            color: validationErrors.group_scheduled_type ? theme.palette.error.main : 'inherit',
                                        }}
                                    >
                                        Schedule Type
                                    </FormLabel>
                                    <RadioGroup
                                        row
                                        value={formData.group_scheduled_type}
                                        onChange={handleChange('group_scheduled_type')}
                                    >
                                        {scheduleTypes.filter(type => type !== 'one_time').map((type) => (
                                            <FormControlLabel key={type} value={type} control={<Radio />} label={type.charAt(0).toUpperCase() + type.slice(1)} />
                                        ))}
                                    </RadioGroup>
                                    {validationErrors.group_scheduled_type && (
                                        <Box sx={{ color: 'error.main', fontSize: '0.75rem', mt: 0.1 }}>
                                            {validationErrors.group_scheduled_type}
                                        </Box>
                                    )}
                                </FormControl>
                            </Grid>
                        )}



                        {/* Weekly - Select Days */}
                        {taskScheduleType === 'recurring' && formData.group_scheduled_type === 'weekly' && (
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
                                        setRepeatData(prev => ({ ...prev, days: dayValues }));
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

                        {/* Monthly - Select Dates */}
                        {taskScheduleType === 'recurring' && formData.group_scheduled_type === 'monthly' && (
                            <Grid size={{ xs: 12 }}>
                                <Autocomplete
                                    multiple
                                    limitTags={5}
                                    size="small"
                                    options={datesOfMonth}
                                    getOptionLabel={(option) => String(option)}
                                    value={Array.isArray(repeatData.dates) ? repeatData.dates : []}
                                    onChange={(event, newValue) => {
                                        setRepeatData(prev => ({ ...prev, dates: newValue.sort((a, b) => a - b) }));
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

                        {/* Yearly - Select Months and Dates */}
                        {taskScheduleType === 'recurring' && formData.group_scheduled_type === 'yearly' && (
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
                                            setRepeatData(prev => ({ ...prev, months: monthValues }));
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
                                            setRepeatData(prev => ({ ...prev, dates: newValue.sort((a, b) => a - b) }));
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

                        {/* specific date should be multiple select */}
                        {/* specific date should be multiple select */}

                        {taskScheduleType === 'specific_dates' && (
                            <Grid size={{ xs: 12, }}>
                                <TextField
                                    type="date"
                                    label="Specific Date"
                                    value={currentSpecificDate}
                                    onChange={handleSpecificDateChange}
                                    fullWidth
                                    size="small"
                                    InputLabelProps={{ shrink: true }}
                                    error={!!validationErrors.specific_dates}
                                    helperText={validationErrors.specific_dates}
                                />

                                {/* selected dates should be displayed as chips */}
                                {formData.specific_dates.length > 0 && (
                                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                                        {formData.specific_dates.map((date, index) => (
                                            <Chip
                                                key={`${date}-${index}`}
                                                label={date}
                                                onDelete={() =>
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        specific_dates: prev.specific_dates.filter(
                                                            (d) => d !== date
                                                        ),
                                                    }))
                                                }
                                                size="small"
                                                color="primary"
                                                variant="outlined"
                                            />
                                        ))}
                                    </Box>
                                )}
                            </Grid>
                        )}

                        {taskScheduleType !== 'specific_dates' && (
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
                        )}

                        <Grid size={{ xs: 12, sm: taskScheduleType === 'specific_dates' ? 12 : 6 }}>
                            <TextField
                                select
                                label="Assign To"
                                value={formData.assigned_to}
                                onChange={handleChange('assigned_to')}
                                fullWidth
                                size="small"
                                error={!!validationErrors.assigned_to}
                                helperText={validationErrors.assigned_to}
                            >
                                {teamMembers.map((member) => (
                                    <MenuItem key={member.id} value={member.id}>
                                        {member.name}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                    </Grid>
                </DialogContent>

                <DialogActions sx={{ px: 3, py: 2 }}>
                    <Button
                        variant='text'
                        size='medium'
                        sx={{ textTransform: 'none', mr: 2 }}
                        onClick={onClose}
                        disabled={loading}
                    >
                        Cancel
                    </Button>

                    <Button
                        variant='contained'
                        disableElevation
                        size='small'
                        onClick={handleSubmit}
                        disabled={loading}
                        sx={{
                            textTransform: 'none',
                            backgroundColor: palette.primary.main,
                            '&:hover': { backgroundColor: palette.secondary.main },
                            borderRadius: 10,
                        }}
                    >
                        {loading ? 'Saving...' : (isEdit ? 'Update Group Task' : isDuplicate ? 'Duplicate Group Task' : 'Create Group Task')}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    )
}

export default TileVeiwAddEditGroupTaskDialog