import React, { useState, useEffect } from 'react'
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
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close';
import { taskTypes, scheduleTypes, statusOpts, daysOfWeek, monthsOfYear, datesOfMonth } from '../../../constant';
import { useTaskContext } from './TaskManagement';
import { useSnackbar } from '../../../resuable_components/Snackbar';

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const TileView_AddEdit_Dialog = ({ open, onClose, task, viewMode }) => {
    const isEdit = !!task;
    const isActiveTask = viewMode === 'activeTasks';
    const isTaskPlanner = viewMode === 'taskPlanner';
    const theme = useTheme();
    const { palette } = theme;
    const { showSnackbar } = useSnackbar();

    console.log('TileView_AddEdit_Dialog viewMode:', viewMode);

    // Get data from context
    const {
        inventoryItems,
        teamMembers,
        createTask,
        updateTaskPlannerData,
        updateActiveTaskData
    } = useTaskContext();

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        property_id: '',
        inventory_id: '',
        schedule_type: '',
        repeat_on: '{}',
        start_date: '',
        scheduled_date: '',
        task_type: '',
        assigned_to: '',
        is_photo_required: 0,
        status: ''
    });

    const [validationErrors, setValidationErrors] = useState({});
    const [loading, setLoading] = useState(false);

    // Separate state for repeat_on data structure
    const [repeatData, setRepeatData] = useState({});

    // Initialize form data when task changes
    useEffect(() => {
        if (isEdit && task) {
            setFormData({
                title: task.title || '',
                description: task.description || '',
                // property_id: task.property_id || '',
                inventory_id: task.inventory_id || '',
                schedule_type: task.schedule_type || '',
                repeat_on: task.repeat_on || '{}',
                start_date: task.start_date || '',
                scheduled_date: task.scheduled_date || '',
                task_type: task.task_type || '',
                assigned_to: task.assigned_to || '',
                is_photo_required: task.is_photo_required || 0,
                status: task.status || ''
            });

            // Parse repeat_on for edit mode
            try {
                const repeatOnValue = task.repeat_on;
                if (repeatOnValue) {
                    const parsed = typeof repeatOnValue === 'string' ? JSON.parse(repeatOnValue) : repeatOnValue;
                    setRepeatData(parsed);
                } else {
                    setRepeatData({});
                }
            } catch {
                setRepeatData({});
            }
        } else {
            // Reset form for new task
            setFormData({
                title: '',
                description: '',
                // property_id: '',
                inventory_id: '',
                schedule_type: '',
                repeat_on: '{}',
                start_date: '',
                task_type: '',
                assigned_to: '',
                is_photo_required: 0,
                status: ''
            });
            setRepeatData({});
        }
        setValidationErrors({});
    }, [task, isEdit, open]);

    // Sync repeatData to formData.repeat_on
    useEffect(() => {
        if (['weekly', 'monthly', 'yearly'].includes(formData.schedule_type)) {
            setFormData(prev => ({
                ...prev,
                repeat_on: JSON.stringify(repeatData)
            }));
        }
    }, [repeatData, formData.schedule_type]);

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

    const handleCheckboxChange = (event) => {
        setFormData(prev => ({
            ...prev,
            is_photo_required: event.target.checked ? 1 : 0
        }));
    };

    const handleCreateUpdate = async () => {
        setValidationErrors({});
        setLoading(true);
        try {
            if (isEdit) {
                // Call different APIs based on viewMode
                let res;
                if (isActiveTask) {
                    // Update active task (task instance)
                    res = await updateActiveTaskData(task.id, formData);
                } else {
                    // Update task planner
                    res = await updateTaskPlannerData(task.id, formData);
                }
                showSnackbar(res.message || 'Task updated successfully', 'success');
            } else {
                const res = await createTask(formData);
                showSnackbar(res.message || 'Task created successfully', 'success');
            }
            onClose();
        } catch (error) {
            // Handle API validation errors
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
            showSnackbar(error.message || 'Operation failed', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog
            open={open}
            fullWidth
            maxWidth="md"
            aria-describedby='task-dialog-description'
            TransitionComponent={Transition}
        >
            <DialogTitle>
                {isEdit ? 'Edit Task' : 'Create New Task'}
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
                            value={formData.description}
                            onChange={handleChange('description')}
                            fullWidth
                            size="small"
                            multiline
                            rows={3}
                            required
                            error={!!validationErrors.description}
                            helperText={validationErrors.description}
                        />
                    </Grid>

                    {/* Property */}
                    {/* <Grid size={{ xs: 12, sm: 6 }}>
                        <Autocomplete
                            size="small"
                            options={properties}
                            getOptionLabel={(option) => option.name || ""}
                            value={properties.find((prop) => prop.id === formData.property_id) || null}
                            onChange={(e, newValue) => {
                                handleChange("property_id")({
                                    target: { value: newValue ? newValue.id : "" }
                                });
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Select Property"
                                    required
                                    error={!!validationErrors.property_id}
                                    helperText={validationErrors.property_id}
                                />
                            )}
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                        />
                    </Grid> */}

                    {/* Inventory */}
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <Autocomplete
                            size="small"
                            options={inventoryItems}
                            getOptionLabel={(option) => option.name ? String(option.name) : ""}
                            value={inventoryItems.find((item) => item.id === formData.inventory_id) || null}
                            onChange={(e, newValue) => {
                                handleChange("inventory_id")({
                                    target: { value: newValue ? newValue.id : "" }
                                });
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Select Inventory"
                                    required
                                    error={!!validationErrors.inventory_id}
                                    helperText={validationErrors.inventory_id}
                                />
                            )}
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                        />
                    </Grid>


                    {/* Start Date - Show when creating OR editing Task Planner */}
                    {(!isEdit || (isEdit && isTaskPlanner)) && (
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                type="date"
                                label="Start Date"
                                value={formData.start_date}
                                onChange={handleChange('start_date')}
                                fullWidth
                                size="small"
                                required
                                disabled={isEdit}
                                error={!!validationErrors.start_date}
                                helperText={validationErrors.start_date || (isEdit ? 'Cannot change start date' : '')}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />
                        </Grid>
                    )}

                    {/* Schedule Date - ONLY when editing Active Task */}
                    {isEdit && isActiveTask && (
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                type="date"
                                label="Schedule Date"
                                value={formData.scheduled_date}
                                onChange={handleChange('scheduled_date')}
                                fullWidth
                                size="small"
                                required
                                disabled={isEdit}
                                error={!!validationErrors.scheduled_date}
                                helperText={validationErrors.scheduled_date || (isEdit ? 'Cannot change schedule date' : '')}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />
                        </Grid>
                    )}

                    {/* Schedule Type - Show when creating new task OR editing Task Planner */}
                    {(!isEdit || (isEdit && isTaskPlanner)) && (
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Autocomplete
                                size="small"
                                fullWidth
                                options={scheduleTypes}
                                getOptionLabel={(option) => String(option)}
                                value={formData.schedule_type || null}
                                onChange={(e, newValue) => {
                                    handleChange("schedule_type")({
                                        target: { value: newValue || "" }
                                    });
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Schedule Type"
                                        placeholder="Select Schedule Type"
                                        required
                                        error={!!validationErrors.schedule_type}
                                        helperText={validationErrors.schedule_type}
                                    />
                                )}
                            />
                        </Grid>
                    )}



                    {/* Repeat On - Show when creating new task OR editing Task Planner */}
                    {(!isEdit || (isEdit && isTaskPlanner)) && formData.schedule_type === 'weekly' && (
                        <Grid size={{ xs: 12 }}>
                            <Autocomplete
                                multiple
                                limitTags={3}
                                size="small"
                                options={daysOfWeek}
                                getOptionLabel={(option) => String(option)}
                                //value={repeatData.days || []}
                                value={Array.isArray(repeatData.days) ? repeatData.days : []}
                                onChange={(event, newValue) => {
                                    setRepeatData({ days: newValue });
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
                            />
                        </Grid>
                    )}

                    {(!isEdit || (isEdit && isTaskPlanner)) && formData.schedule_type === 'monthly' && (
                        <Grid size={{ xs: 12 }}>
                            <Autocomplete
                                multiple
                                limitTags={5}
                                size="small"
                                options={datesOfMonth}
                                getOptionLabel={(option) => String(option)}
                                value={Array.isArray(repeatData.date) ? repeatData.date : []}
                                onChange={(event, newValue) => {
                                    setRepeatData({ date: newValue.sort((a, b) => a - b) });
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

                    {(!isEdit || (isEdit && isTaskPlanner)) && formData.schedule_type === 'yearly' && (
                        <>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    select
                                    label="Date"
                                    size="small"
                                    value={repeatData.date || ''}
                                    onChange={(e) => setRepeatData({ ...repeatData, date: parseInt(e.target.value) })}
                                    fullWidth
                                    required
                                    error={!!validationErrors.repeat_on}
                                    helperText={validationErrors.repeat_on}
                                >
                                    <MenuItem value="">
                                        <em>Select Date</em>
                                    </MenuItem>
                                    {datesOfMonth.map((date) => (
                                        <MenuItem key={date} value={date}>
                                            {date}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Autocomplete
                                    multiple
                                    limitTags={2}
                                    size="small"
                                    options={monthsOfYear}
                                    getOptionLabel={(option) => String(option)}
                                    value={Array.isArray(repeatData.month) ? repeatData.month : []}
                                    onChange={(event, newValue) => {
                                        setRepeatData({ ...repeatData, month: newValue });
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
                                />
                            </Grid>
                        </>
                    )}

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
                            {taskTypes.map((type) => (
                                <MenuItem key={type} value={type} dense>
                                    {type}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>

                    {/* Assigned To */}
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                            select
                            label="Assigned To"
                            value={formData.assigned_to}
                            onChange={handleChange('assigned_to')}
                            fullWidth
                            size="small"
                            required
                            error={!!validationErrors.assigned_to}
                            helperText={validationErrors.assigned_to}
                        >
                            {teamMembers.map((member) => (
                                <MenuItem key={member.id} value={member.id} dense>
                                    {member.name}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>

                    {/* Status - Show when creating one_time task OR editing Active Task */}
                    {((!isEdit && formData.schedule_type === 'one_time') || (isEdit && isActiveTask)) && (
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                select
                                label="Status"
                                value={formData.status}
                                onChange={handleChange('status')}
                                fullWidth
                                size="small"
                                required
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
                    )}

                    {/* Photo Required */}
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={formData.is_photo_required === 1}
                                    onChange={handleCheckboxChange}
                                />
                            }
                            label="Photo Required"
                        />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button
                    variant='text'
                    size='medium'
                    sx={{ textTransform: 'none' , mr: 2 }}
                    onClick={onClose}
                    disabled={loading}
                >
                    Cancel
                </Button>
                <Button
                    variant='contained'
                    disableElevation
                    size='medium'
                    onClick={handleCreateUpdate}
                    disabled={loading}
                    sx={{
                        textTransform: 'none',
                        backgroundColor: palette.primary.main,
                        '&:hover': { backgroundColor: palette.secondary.main }
                    }}
                >
                    {loading ? 'Saving...' : (isEdit ? 'Update Task' : 'Create Task')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
export default TileView_AddEdit_Dialog