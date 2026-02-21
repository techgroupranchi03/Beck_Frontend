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
    FormControl,
    RadioGroup,
    Radio,
    FormLabel,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close';
import { taskTypes, scheduleTypes, statusOpts, daysOfWeek, monthsOfYear, datesOfMonth, taskTypesOptions } from '../../../constant';
import { useInventoryContext } from './InventoryManagement';
import { useSnackbar } from '../../../resuable_components/Snackbar';
import TaskCompletionDialog from '../../../dialoge/clients/TaskCompletionDialog';

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const InventoryTask_AddEdit_Dialog = ({ open, onClose, task, inventoryId }) => {
    const isEdit = !!task && !!task.id;
    const isDuplicate = !!task && !task.id;
    const [taskScheduleType, setTaskScheduleType] = useState('one_time');
    const theme = useTheme();
    const { palette } = theme;
    const { showSnackbar } = useSnackbar();
    const [showCompletionDialog, setShowCompletionDialog] = useState(false);
    const [pendingTask, setPendingTask] = useState(null);
    const {
        inventoryData,
        properties,
        teamMembers,
        createTask,
        updateTaskPlannerData,
        updateActiveTaskData,
        updateTaskCompletionStatus
    } = useInventoryContext();
    const [loading, setLoading] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        inventory_id: inventoryId || '',
        property_id: '',
        schedule_type: '',
        repeat_on: '{}',
        start_date: '',
        scheduled_date: '',
        task_type: '',
        assigned_to: '',
        is_photo_required: 0,
        update_inventory: 0,
        status: ''
    });
    const [repeatData, setRepeatData] = useState({});

    useEffect(() => {
        if ((isEdit || isDuplicate) && task) {
            setFormData({
                title: task.title || '',
                description: task.description || '',
                inventory_id: task.inventory_id || '',
                property_id: task.property_id || '',
                schedule_type: task.schedule_type || '',
                repeat_on: task.repeat_on || '{}',
                start_date: task.start_date || '',
                scheduled_date: task.scheduled_date || '',
                task_type: task.task_type || '',
                assigned_to: task.assigned_to || '',
                is_photo_required: task.is_photo_required || 0,
                update_inventory: task.update_inventory || 0,
                status: task.status || ''
            });

            // Derive taskScheduleType from existing task's schedule_type
            const taskSchedule = task.schedule_type;
            if (taskSchedule && taskSchedule !== 'one_time') {
                setTaskScheduleType('recurring');
            } else {
                setTaskScheduleType('one_time');
            }

            // Parse repeat_on for edit/duplicate mode
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
            const selectedInventory = inventoryId ? inventoryData.find(item => item.id === inventoryId) : null;
            setFormData({
                title: '',
                description: '',
                inventory_id: inventoryId || '',
                property_id: selectedInventory?.property_id || '',
                schedule_type: '',
                repeat_on: '{}',
                start_date: '',
                task_type: '',
                assigned_to: '',
                is_photo_required: 0,
                update_inventory: 0,
                status: ''
            });
            setRepeatData({});
            setTaskScheduleType('one_time');
        }
        setValidationErrors({});
    }, [task, isEdit, isDuplicate, open, inventoryId, inventoryData]);

    useEffect(() => {
        if (formData.schedule_type && formData.schedule_type !== 'one_time') {
            setTaskScheduleType('recurring');
        } else {
            setTaskScheduleType('one_time');
        }
    }, [formData.schedule_type]);

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

    const handleInventoryChange = (event) => {
        setFormData(prev => ({
            ...prev,
            update_inventory: event.target.checked ? 1 : 0
        }));
    };

    const handleCreateUpdate = async () => {
        setValidationErrors({});
        setLoading(true);
        try {
            if (isEdit) {
                let res;
                if (taskScheduleType === 'one_time') {
                    res = await updateActiveTaskData(task.id, formData);
                } else {
                    const plannerPayload = { ...formData };
                    delete plannerPayload.status;
                    res = await updateTaskPlannerData(task.id, plannerPayload);
                }
                showSnackbar(res.message || 'Task updated successfully', 'success');
            } else {
                let res;
                if (taskScheduleType === 'one_time') {
                    const oneTimePayload = {
                        ...formData,
                        schedule_type: 'one_time',
                        repeat_on: '{}',
                        start_date: formData.scheduled_date || formData.start_date
                    };
                    delete oneTimePayload.scheduled_date;
                    res = await createTask(oneTimePayload);
                } else {
                    const recurringPayload ={
                        ...formData,
                        start_date: formData.start_date || formData.scheduled_date,
                    };
                    delete recurringPayload.scheduled_date;
                    delete recurringPayload.status;
                    res = await createTask(recurringPayload);
                }
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

    const handleCompletionDialogClose = () => {
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
                    {isEdit ? 'Edit Task' : isDuplicate ? 'Duplicate Task' : 'Create New Task'}
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
                                helperText={validationErrors.description}
                            />
                        </Grid>

                        <Grid size={{ xs: 12 }} container spacing={2}>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <FormControl component="fieldset" disabled={isEdit && !isDuplicate}>
                                    <FormLabel component="legend">Task Schedule</FormLabel>
                                    <RadioGroup
                                        row
                                        value={taskScheduleType}
                                        onChange={(e) => setTaskScheduleType(e.target.value)}
                                    >
                                        <FormControlLabel value="one_time" control={<Radio />} label="One Time" />
                                        <FormControlLabel value="recurring" control={<Radio />} label="Recurring" />
                                    </RadioGroup>
                                </FormControl>
                            </Grid>

                            {/* Schedule Type - Show when creating new task OR editing Task Planner */}
                            {taskScheduleType === 'recurring' && (
                                <Grid size={{ xs: 12, sm: 6 }}>
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
                                            onChange={handleChange('schedule_type')}
                                        >
                                            {scheduleTypes.filter(type => type !== 'one_time').map((type) => (
                                                <FormControlLabel key={type} value={type} control={<Radio />} label={type.charAt(0).toUpperCase() + type.slice(1)} />
                                            ))}
                                        </RadioGroup>
                                        {validationErrors.schedule_type && (
                                            <Box sx={{ color: 'error.main', fontSize: '0.75rem', mt: 0.1 }}>
                                                {validationErrors.schedule_type}
                                            </Box>
                                        )}
                                    </FormControl>
                                </Grid>
                            )}

                        </Grid>

                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Autocomplete
                                size="small"
                                options={properties}
                                getOptionLabel={(option) => option.name ? String(option.name) : ""}
                                value={properties.find((item) => item.id === formData.property_id) || null}
                                onChange={(e, newValue) => {
                                    handleChange("property_id")({
                                        target: { value: newValue ? newValue.id : "" }
                                    });
                                }}
                                disabled={!!formData.inventory_id}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Select Property"
                                        error={!!validationErrors.property_id}
                                        helperText={validationErrors.property_id || (formData.inventory_id ? 'Property auto-selected from inventory' : '')}
                                    />
                                )}
                                isOptionEqualToValue={(option, value) => option.id === value.id}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Autocomplete
                                size="small"
                                options={inventoryData}
                                getOptionLabel={(option) => option.name ? String(option.name) : ""}
                                value={inventoryData.find((item) => item.id === formData.inventory_id) || null}
                                onChange={(e, newValue) => {
                                    handleChange("inventory_id")({
                                        target: { value: newValue ? newValue.id : "" }
                                    });
                                }}
                                disabled={(isEdit && !isDuplicate) || !!inventoryId}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Select Inventory"
                                        required
                                        error={!!validationErrors.inventory_id}
                                        helperText={validationErrors.inventory_id || ((isEdit && !isDuplicate) ? 'Cannot change inventory' : inventoryId ? 'Inventory auto-selected' : '')}
                                    />
                                )}
                                isOptionEqualToValue={(option, value) => option.id === value.id}
                            />
                        </Grid>

                        {taskScheduleType === 'recurring' && (
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
                        )}

                        {taskScheduleType === 'one_time' && (
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    type="date"
                                    label="Schedule Date"
                                    value={formData.scheduled_date}
                                    onChange={handleChange('scheduled_date')}
                                    fullWidth
                                    size="small"
                                    error={!!validationErrors.scheduled_date}
                                    helperText={validationErrors.scheduled_date}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                />
                            </Grid>
                        )}

                        {taskScheduleType === 'recurring' && formData.schedule_type === 'weekly' && (
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

                        {taskScheduleType === 'recurring' && formData.schedule_type === 'monthly' && (
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

                        {taskScheduleType === 'recurring' && formData.schedule_type === 'yearly' && (
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

                        {(taskScheduleType === 'one_time' || (!isEdit && formData.schedule_type === 'one_time')) && (
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
                        )}

                        <Grid size={{ xs: 12 }} container spacing={2}>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={formData.is_photo_required === 1}
                                            onChange={handleCheckboxChange}
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
                        variant='contained'
                        disableElevation
                        size='medium'
                        onClick={handleCreateUpdate}
                        disabled={loading}
                        sx={{
                            textTransform: 'none',
                            backgroundColor: palette.primary.main,
                            '&:hover': { backgroundColor: palette.secondary.main },
                            borderRadius: 100,
                        }}
                    >
                        {loading ? 'Saving...' : (isEdit ? 'Update Task' : isDuplicate ? 'Duplicate Task' : 'Create Task')}
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

export default InventoryTask_AddEdit_Dialog;
