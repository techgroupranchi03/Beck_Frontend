import React, { useEffect, useMemo, useState } from 'react'
import { Box, IconButton, Tooltip, Button, useTheme, MenuItem, Checkbox, Select, Autocomplete, TextField, Chip, Avatar, Typography } from '@mui/material'
import { MaterialReactTable, createRow } from 'material-react-table'
import { Edit as EditIcon, Close as CloseIcon, Save as SaveIcon, Delete as DeleteIcon, FileCopy } from '@mui/icons-material'
import { getInventoryById } from '../../../service/Clients/Inventory'
import { getTeamMembers } from '../../../service/Clients/Team'
import {
    createClientTask,
    updateTaskPlanner,
    updateActiveTask,
    createClientActiveTask,
    deleteOneTime,
    deleteClientTask,
    //    updateClientTaskStatusCompleted
} from '../../../service/Clients/Task'
import { useSnackbar } from '../../../resuable_components/Snackbar'
import { taskTypes, scheduleTypes, recurringTypes, statusOpts, daysOfWeek, monthsOfYear, datesOfMonth, taskTypesOptions } from '../../../constant';
import { formatDate } from '../../../utils/dateFormat'
import { useAuth } from '../../../context/AuthContext'
import {
    createTeamActiveTask,
    createTeamTask,
    getTeamsTeamMembers,
    updateTeamsActiveTask,
    updateTeamsTaskPlanner,
    deleteTeamOneTimeTask,
    deleteTeamRecurringTask,
    //    updateTeamTaskStatusCompleted 
} from '../../../service/Teams/Team_Task'
import { getTeamInventoryById } from '../../../service/Teams/Team_Inventory'
import ConfirmationDialog from '../../../dialoge/clients/Confirmation_dialog'
import TaskCompletionDialog from '../../../dialoge/clients/TaskCompletionDialog'
import ImageViewer from '../../../resuable_components/ImageViewer'
import ViewMoreText from '../../../resuable_components/ViewMore'
import formatSchedule from '../../../utils/scheduleFormatter'

const Task_Accordian = ({ inventoryId, create_tasks, onTaskCreate }) => {
    const { user } = useAuth();
    const theme = useTheme()
    const { palette } = theme
    const { showSnackbar } = useSnackbar();
    const [validationErrors, setValidationErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [taskPlanner, setTaskPlanner] = useState([]);
    const [activeTasks, setActiveTasks] = useState([]);
    const [teamMembers, setTeamMembers] = useState([]);
    const [properties_id, setProperties_id] = useState("");
    const [inventory_id, setInventory_id] = useState("");
    const [viewMode, setViewMode] = useState('taskPlanner');
    const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
    const [taskToDelete, setTaskToDelete] = useState(null);
    const [showcompletionDialog, setShowcompletionDialog] = useState(false);
    const [pendingTask, setPendingTask] = useState(null);
    const [tableRef, setTableRef] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [openImage, setOpenImage] = useState(false);
    const isTeamUser = user?.role === 'team';
    const handleViewChange = (event) => {
        setViewMode(event.target.value);
    };

    const getCurrentData = () => {
        switch (viewMode) {
            case 'taskPlanner':
                return taskPlanner;
            case 'activeTasks':
                return activeTasks;
            default:
                return taskPlanner;
        }
    };

    const fetchInventoryById = async (id) => {
        try {
            const res = isTeamUser
                ? await getTeamInventoryById(id)
                : await getInventoryById(id);
            console.log("Fetched inventory data:", res.data);
            setActiveTasks(res.data.task_instances || []);
            setTaskPlanner(res.data.tasks_planner || []);
            setProperties_id(res.data.property_id);
            setInventory_id(res.data.id);
        } catch (error) {
            console.error("Error fetching inventory by ID:", error);
            return null;
        }
    };


    const fetchTeamMembers = async () => {
        try {
            const res = isTeamUser
                ? await getTeamsTeamMembers()
                : await getTeamMembers();
            setTeamMembers(res.data || []);
        } catch (error) {
            console.error('Error fetching team members:', error);
        }
    };

    useEffect(() => {
        fetchInventoryById(inventoryId);
        fetchTeamMembers();
    }, [inventoryId]);

    const TaskPlannercolumns = useMemo(() => [

        {
            accessorKey: 'title',
            header: 'Title',
            size: 150,
            muiEditTextFieldProps: ({ row, table }) => ({
                required: true,
                error: !!validationErrors?.title,
                helperText: validationErrors?.title,
                onChange: (e) => {
                    row._valuesCache.title = e.target.value;
                    if (create_tasks && onTaskCreate) {
                        const taskData = {
                            ...row._valuesCache,
                            property_id: properties_id,
                            inventory_id: inventory_id
                        };
                        onTaskCreate(taskData);
                    }
                },
                onFocus: () =>
                    setValidationErrors({
                        ...validationErrors,
                        title: undefined,
                    }),
            }),
        },

        {
            accessorKey: 'description',
            header: 'Description',
            size: 200,
            muiEditTextFieldProps: ({ row, table }) => ({
                required: true,
                multiline: true,
                rows: 2,
                error: !!validationErrors?.description,
                helperText: validationErrors?.description,
                onChange: (e) => {
                    row._valuesCache.description = e.target.value;

                    if (create_tasks && onTaskCreate) {
                        const taskData = {
                            ...row._valuesCache,
                            property_id: properties_id,
                            inventory_id: inventory_id
                        };
                        //console.log("Auto-sending task data to parent:", taskData);
                        onTaskCreate(taskData);
                    }
                },
                onFocus: () =>
                    setValidationErrors({
                        ...validationErrors,
                        description: undefined,
                    }),
            }),
            Cell: ({ cell }) => (
                <ViewMoreText text={cell.getValue()} maxLength={20} />
            ),
        },

        {
            accessorKey: 'schedule_type',
            header: 'Schedule Type',
            size: 130,
            editVariant: 'select',
            editSelectOptions: scheduleTypes
                .filter(type => type !== 'one_time')
                .map(type => ({ value: type, label: type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) })),
            muiEditTextFieldProps: ({ row, table }) => ({
                select: true,
                required: true,
                error: !!validationErrors?.schedule_type,
                helperText: validationErrors?.schedule_type,
                onChange: (e) => {
                    row._valuesCache.schedule_type = e.target.value;

                    if (create_tasks && onTaskCreate) {
                        const taskData = {
                            ...row._valuesCache,
                            property_id: properties_id,
                            inventory_id: inventory_id
                        };
                        //console.log("Auto-sending task data to parent:", taskData);
                        onTaskCreate(taskData);
                    }
                },
                SelectProps: {
                    displayEmpty: true,
                    renderValue: (selected) => {
                        if (!selected) {
                            return <em>Select Type</em>;
                        }
                        return selected;
                    },
                },
                onFocus: () =>
                    setValidationErrors({
                        ...validationErrors,
                        schedule_type: undefined,
                    }),
            }),
            Cell: ({ cell }) => (
                <Box
                    sx={{
                        display: 'inline-block',
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 1,
                        color: palette.text.primary,
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        textTransform: 'capitalize',
                    }}
                >
                    {cell.getValue()}
                </Box>
            ),
        },

        {
            accessorKey: 'repeat_on',
            header: 'Repeat On',
            size: 200,
            muiEditTextFieldProps: ({ row }) => {
                const scheduleType = row._valuesCache?.schedule_type;
                const isVisible = ['weekly', 'monthly', 'yearly'].includes(scheduleType);

                return {
                    required: isVisible,
                    style: { display: isVisible ? 'block' : 'none' },
                    error: !!validationErrors?.repeat_on,
                    helperText: validationErrors?.repeat_on || getRepeatOnHelperText(scheduleType),
                    placeholder: getRepeatOnPlaceholder(scheduleType),
                    onFocus: () =>
                        setValidationErrors({
                            ...validationErrors,
                            repeat_on: undefined,
                        }),
                };
            },
            Cell: ({ row }) => {
                const scheduleType = row.original.schedule_type;
                const repeatOn = row.original.repeat_on;

                if (!['weekly', 'monthly', 'yearly'].includes(scheduleType) || !repeatOn) {
                    return '-';
                }

                try {
                    const data = typeof repeatOn === 'string' ? JSON.parse(repeatOn) : repeatOn;
                    const scheduleInfo = formatSchedule(scheduleType, data);

                    if (!scheduleInfo) {
                        return '-';
                    }
                    return (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            <Typography
                                variant="body2"
                                sx={{
                                    fontWeight: 600,
                                    color: palette.primary.main,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 0.5,
                                    fontSize: '0.875rem'
                                }}
                            >
                                {scheduleInfo.icon && <scheduleInfo.icon />}
                            </Typography>
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ fontSize: '0.75rem' }}
                            >
                                {scheduleInfo.description}
                            </Typography>
                        </Box>
                    );
                } catch (error) {
                    return '-';
                }

                return '-';
            },
            Edit: ({ row, cell, table }) => {
                const scheduleType = row._valuesCache?.schedule_type;
                const [repeatData, setRepeatData] = useState(() => {
                    try {
                        const value = cell.getValue();
                        return value ? (typeof value === 'string' ? JSON.parse(value) : value) : {};
                    } catch {
                        return {};
                    }
                });

                useEffect(() => {
                    row._valuesCache[cell.column.id] = JSON.stringify(repeatData);
                }, [repeatData]);

                if (!['weekly', 'monthly', 'yearly'].includes(scheduleType)) {
                    return null;
                }

                // Weekly: Autocomplete for multiple days selection
                if (scheduleType === 'weekly') {
                    return (
                        <Autocomplete
                            multiple
                            limitTags={2}
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
                                    placeholder="Choose days"
                                    error={!!validationErrors?.repeat_on}
                                    helperText={validationErrors?.repeat_on || 'Select days of the week'}
                                />
                            )}
                            isOptionEqualToValue={(option, value) => option.value === value.value}
                            sx={{ minWidth: 250 }}
                        />
                    );
                }

                // Monthly: Autocomplete for multiple dates selection
                if (scheduleType === 'monthly') {
                    return (
                        <Autocomplete
                            multiple
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
                                    placeholder="Choose dates"
                                    error={!!validationErrors?.repeat_on}
                                    helperText={validationErrors?.repeat_on || 'Select dates of the month'}
                                />
                            )}
                            sx={{ minWidth: 300 }}
                        />
                    );
                }

                // Yearly: Months + Dates as arrays
                if (scheduleType === 'yearly') {
                    return (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Autocomplete
                                multiple
                                limitTags={3}
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
                                        error={!!validationErrors?.repeat_on}
                                        helperText={validationErrors?.repeat_on || 'Select months of the year'}
                                    />
                                )}
                                isOptionEqualToValue={(option, value) => option.value === value.value}
                            />

                            <Autocomplete
                                multiple
                                limitTags={3}
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
                                        error={!!validationErrors?.repeat_on}
                                        helperText={validationErrors?.repeat_on || 'Select dates (1-31)'}
                                    />
                                )}
                            />
                        </Box>
                    );
                }

                return null;
            },
        },

        {
            accessorKey: 'start_date',
            header: 'Start Date',
            size: 130,
            muiEditTextFieldProps: ({ row, table }) => ({
                type: 'date',
                required: true,
                error: !!validationErrors?.start_date,
                helperText: validationErrors?.start_date,
                InputLabelProps: {
                    shrink: true,
                },
                onChange: (e) => {
                    row._valuesCache.start_date = e.target.value;

                    if (create_tasks && onTaskCreate) {
                        const taskData = {
                            ...row._valuesCache,
                            property_id: properties_id,
                            inventory_id: inventory_id
                        };
                        //console.log("Auto-sending task data to parent:", taskData);
                        onTaskCreate(taskData);
                    }
                },
                onFocus: () =>
                    setValidationErrors({
                        ...validationErrors,
                        start_date: undefined,
                    }),
            }),
            Cell: ({ cell }) => formatDate(cell.getValue()),
        },

        {
            accessorKey: 'task_type',
            header: 'Task Type',
            size: 130,
            editVariant: 'select',
            editSelectOptions: taskTypesOptions.map(type => ({ value: type.value, label: type.label })),
            muiEditTextFieldProps: ({ row, table }) => ({
                select: true,
                required: true,
                error: !!validationErrors?.task_type,
                helperText: validationErrors?.task_type,
                onChange: (e) => {
                    row._valuesCache.task_type = e.target.value;

                    if (create_tasks && onTaskCreate) {
                        const taskData = {
                            ...row._valuesCache,
                            property_id: properties_id,
                            inventory_id: inventory_id
                        };
                        onTaskCreate(taskData);
                    }
                },
                SelectProps: {
                    displayEmpty: true,
                    renderValue: (selected) => {
                        if (!selected) {
                            return <em>Select Task Type</em>;
                        }
                        const taskType = taskTypesOptions.find(t => t.value === selected);
                        if (taskType) {
                            const IconComponent = taskType.icon;
                            return (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <IconComponent sx={{ fontSize: 18 }} />
                                    {taskType.label}
                                </Box>
                            );
                        }
                        return selected;
                    },
                },

                children: taskTypesOptions.map((type) => {
                    const IconComponent = type.icon;
                    return (
                        <MenuItem key={type.value} value={type.value}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <IconComponent sx={{ fontSize: 18 }} />
                                {type.label}
                            </Box>
                        </MenuItem>
                    );
                }),

            }),
            Cell: ({ cell }) => {
                const value = cell.getValue();
                const taskType = taskTypesOptions.find(t => t.value === value);
                const IconComponent = taskType?.icon;
                return (
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 0.5,
                            px: 1.5,
                            height: 24,
                            borderRadius: 10,
                            bgcolor: palette.taskType?.[value] || palette.grey[500],
                            color: 'white',
                            fontSize: '0.75rem',
                            textTransform: 'capitalize',
                        }}
                    >
                        {IconComponent && <IconComponent sx={{ fontSize: 16 }} />}
                        {taskType?.label || value}
                    </Box>
                )
            },
        },

        {
            accessorKey: 'assigned_to',
            header: 'Assigned To',
            size: 150,
            editVariant: 'select',
            editSelectOptions: teamMembers.map(member => ({ value: member.id, label: member.name })),
            muiEditTextFieldProps: ({ row, table }) => ({
                select: true,
                required: true,
                error: !!validationErrors?.assigned_to,
                helperText: validationErrors?.assigned_to,
                onChange: (e) => {
                    row._valuesCache.assigned_to = e.target.value;

                    if (create_tasks && onTaskCreate) {
                        const taskData = {
                            ...row._valuesCache,
                            property_id: properties_id,
                            inventory_id: inventory_id
                        };
                        //console.log("Auto-sending task data to parent:", taskData);
                        onTaskCreate(taskData);
                    }
                },
                SelectProps: {
                    displayEmpty: true,
                    renderValue: (selected) => {
                        if (!selected) {
                            return <em>Select Member</em>;
                        }
                        const member = teamMembers.find(m => m.id === selected);
                        return member ? member.name : selected;
                    },
                },
                onFocus: () =>
                    setValidationErrors({
                        ...validationErrors,
                        assigned_to: undefined,
                    }),
            }),
            Cell: ({ row }) => {
                const member = teamMembers.find(m => m.id === row.original.assigned_to);
                return member ? member.name : '-';
            },
        },

        {
            accessorKey: 'is_photo_required',
            header: 'Photo',
            size: 30,
            Cell: ({ row }) => (
                <Checkbox
                    checked={row.original.is_photo_required === 1 ? true : false}
                    disabled
                    slotProps={{
                        input: { 'aria-label': 'photo required' },
                    }}
                />
            ),
            Edit: ({ row, cell, table }) => {
                const [checked, setChecked] = React.useState(() => {
                    const currentValue = cell.getValue();
                    return currentValue === 1 ? true : false;
                });

                const handleChange = (e) => {
                    const newChecked = e.target.checked;
                    setChecked(newChecked);
                    row._valuesCache[cell.column.id] = newChecked ? 1 : 0;

                    if (create_tasks && onTaskCreate) {
                        const taskData = {
                            ...row._valuesCache,
                            property_id: properties_id,
                            inventory_id: inventory_id
                        };
                        //console.log("Auto-sending task data to parent:", taskData);
                        onTaskCreate(taskData);
                    }
                };

                return (
                    <Checkbox
                        checked={checked}
                        onChange={handleChange}
                        slotProps={{
                            input: { 'aria-label': 'photo required' },
                        }}
                    />
                );
            },
        },

        {
            accessorKey: 'update_inventory',
            header: 'Inventory Qty',
            size: 50,
            Cell: ({ row }) => (
                <Checkbox
                    checked={row.original.update_inventory === 1 ? true : false}
                    disabled
                    slotProps={{
                        input: { 'aria-label': 'update inventory' },
                    }}
                />
            ),
            Edit: ({ row, cell, table }) => {
                const [checked, setChecked] = React.useState(() => {
                    const currentValue = cell.getValue();
                    return currentValue === 1 ? true : false;
                });

                const handleChange = (e) => {
                    const newChecked = e.target.checked;
                    setChecked(newChecked);
                    row._valuesCache[cell.column.id] = newChecked ? 1 : 0;

                    if (create_tasks && onTaskCreate) {
                        const taskData = {
                            ...row._valuesCache,
                            property_id: properties_id,
                            inventory_id: inventory_id
                        };
                        onTaskCreate(taskData);
                    }
                };

                return (
                    <Checkbox
                        checked={checked}
                        onChange={handleChange}
                        slotProps={{
                            input: { 'aria-label': 'update inventory' },
                        }}
                    />
                );
            },
        },

    ],
        [validationErrors, teamMembers, taskTypes, scheduleTypes, recurringTypes, statusOpts, palette, create_tasks, onTaskCreate, properties_id, inventory_id]
    )

    const ActiveTaskcolumns = useMemo(() => [

        {
            accessorKey: 'title',
            header: 'Title',
            size: 150,
            muiEditTextFieldProps: ({ row, table }) => ({
                required: true,
                error: !!validationErrors?.title,
                helperText: validationErrors?.title,
                onChange: (e) => {
                    row._valuesCache.title = e.target.value;
                    if (create_tasks && onTaskCreate) {
                        const taskData = {
                            ...row._valuesCache,
                            property_id: properties_id,
                            inventory_id: inventory_id
                        };
                        onTaskCreate(taskData);
                    }
                },
                onFocus: () =>
                    setValidationErrors({
                        ...validationErrors,
                        title: undefined,
                    }),
            }),
        },

        {
            accessorKey: 'description',
            header: 'Description',
            muiEditTextFieldProps: ({ row, table }) => ({
                required: true,
                multiline: true,
                rows: 2,
                error: !!validationErrors?.description,
                helperText: validationErrors?.description,
                onChange: (e) => {
                    row._valuesCache.description = e.target.value;

                    if (create_tasks && onTaskCreate) {
                        const taskData = {
                            ...row._valuesCache,
                            property_id: properties_id,
                            inventory_id: inventory_id
                        };
                        onTaskCreate(taskData);
                    }
                },
                onFocus: () =>
                    setValidationErrors({
                        ...validationErrors,
                        description: undefined,
                    }),


            }),
            Cell: ({ cell }) => (
                <ViewMoreText text={cell.getValue()} maxLength={20} />
            ),
        },

        {
            id: 'scheduled_date',
            accessorKey: 'scheduled_date',
            header: 'Scheduled Date',
            muiEditTextFieldProps: ({ row, table }) => ({
                type: 'date',
                required: true,
                error: !!validationErrors?.scheduled_date,
                helperText: validationErrors?.scheduled_date,
                InputLabelProps: {
                    shrink: true,
                },
                onChange: (e) => {
                    row._valuesCache.scheduled_date = e.target.value;

                    if (create_tasks && onTaskCreate) {
                        const taskData = {
                            ...row._valuesCache,
                            property_id: properties_id,
                            inventory_id: inventory_id
                        };
                        onTaskCreate(taskData);
                    }
                },
                onFocus: () =>
                    setValidationErrors({
                        ...validationErrors,
                        scheduled_date: undefined,
                    }),
            }),
            Cell: ({ cell }) => formatDate(cell.getValue()),
        },

        {
            accessorKey: 'task_type',
            header: 'Task Type',
            size: 130,
            editVariant: 'select',
            editSelectOptions: taskTypesOptions.map(type => ({ value: type.value, label: type.label })),
            muiEditTextFieldProps: ({ row, table }) => ({
                select: true,
                required: true,
                error: !!validationErrors?.task_type,
                helperText: validationErrors?.task_type,
                onChange: (e) => {
                    row._valuesCache.task_type = e.target.value;

                    if (create_tasks && onTaskCreate) {
                        const taskData = {
                            ...row._valuesCache,
                            property_id: properties_id,
                            inventory_id: inventory_id
                        };
                        onTaskCreate(taskData);
                    }
                },
                SelectProps: {
                    displayEmpty: true,
                    renderValue: (selected) => {
                        if (!selected) {
                            return <em>Select Task Type</em>;
                        }
                        const taskType = taskTypesOptions.find(t => t.value === selected);
                        if (taskType) {
                            const IconComponent = taskType.icon;
                            return (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <IconComponent sx={{ fontSize: 18 }} />
                                    {taskType.label}
                                </Box>
                            );
                        }
                        return selected;
                    }
                },
                onFocus: () =>
                    setValidationErrors({
                        ...validationErrors,
                        task_type: undefined,
                    }),
                children: taskTypesOptions.map((type) => {
                    const IconComponent = type.icon;
                    return (
                        <MenuItem key={type.value} value={type.value}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <IconComponent sx={{ fontSize: 16 }} />
                                {type.label}
                            </Box>
                        </MenuItem>
                    );
                }),
            }),
            Cell: ({ cell }) => {
                const value = cell.getValue();
                const taskType = taskTypesOptions.find(t => t.value === value);
                const IconComponent = taskType?.icon;
                return (
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 0.5,
                            px: 1.5,
                            height: 24,
                            borderRadius: 10,
                            bgcolor: palette.taskType?.[value] || palette.grey[500],
                            color: 'white',
                            fontSize: '0.75rem',
                            textTransform: 'capitalize',
                        }}
                    >
                        {IconComponent && <IconComponent sx={{ fontSize: 16 }} />}
                        {taskType?.label || value}
                    </Box>
                )
            },
        },

        {
            accessorKey: 'assigned_to',
            header: 'Assigned To',
            editVariant: 'select',
            editSelectOptions: teamMembers.map(member => ({ value: member.id, label: member.name })),
            muiEditTextFieldProps: ({ row, table }) => ({
                select: true,
                required: true,
                error: !!validationErrors?.assigned_to,
                helperText: validationErrors?.assigned_to,
                onChange: (e) => {
                    row._valuesCache.assigned_to = e.target.value;

                    if (create_tasks && onTaskCreate) {
                        const taskData = {
                            ...row._valuesCache,
                            property_id: properties_id,
                            inventory_id: inventory_id
                        };
                        onTaskCreate(taskData);
                    }
                },
                SelectProps: {
                    displayEmpty: true,
                    renderValue: (selected) => {
                        if (!selected) {
                            return <em>Select a team member</em>;
                        }
                        const member = teamMembers.find(m => m.id === selected);
                        return member ? member.name : '';
                    },
                },
                onFocus: () =>
                    setValidationErrors({
                        ...validationErrors,
                        assigned_to: undefined,
                    }),
            }),
            Cell: ({ row }) => {
                const member = teamMembers.find(m => m.id === row.original.assigned_to);
                return member ? member.name : '-';
            },
        },

        {
            accessorKey: 'is_photo_required',
            header: 'Photo',
            size: 100,
            Cell: ({ row }) => {
                const hasImages = Array.isArray(row.original.completion_image_urls) && row.original.completion_image_urls.length > 0;

                if (row.original.is_photo_required === 1 && hasImages) {
                    return (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            {row.original.completion_image_urls.map((url, index) => (
                                <Avatar
                                    key={index}
                                    src={url}
                                    variant="rounded"
                                    onClick={() => {
                                        setSelectedImage(url);
                                        setOpenImage(true);
                                    }}
                                    sx={{
                                        width: 30,
                                        height: 30,
                                        borderRadius: 10,
                                        cursor: 'pointer',
                                        border: `1px solid ${palette.divider}`,
                                        '&:hover': { opacity: 0.8 },
                                    }}
                                />
                            ))}
                        </Box>
                    );
                }

                return (
                    <Checkbox
                        checked={row.original.is_photo_required === 1 ? true : false}
                        disabled
                        slotProps={{
                            input: { 'aria-label': 'photo required' },
                        }}
                    />
                );
            },
            Edit: ({ row, cell, table }) => {
                const [checked, setChecked] = React.useState(() => {
                    const currentValue = cell.getValue();
                    return currentValue === 1 ? true : false;
                });

                const handleChange = (e) => {
                    const newChecked = e.target.checked;
                    setChecked(newChecked);
                    row._valuesCache[cell.column.id] = newChecked ? 1 : 0;
                    if (create_tasks && onTaskCreate) {
                        const taskData = {
                            ...row._valuesCache,
                            property_id: properties_id,
                            inventory_id: inventory_id
                        };
                        onTaskCreate(taskData);
                    }
                };

                return (
                    <Checkbox
                        checked={checked}
                        onChange={handleChange}
                        slotProps={{
                            input: { 'aria-label': 'photo required' },
                        }}
                    />
                );
            },
        },

        {
            accessorKey: 'update_inventory',
            header: 'Inventory Qty',
            size: 50,
            Cell: ({ row }) => (
                <Checkbox
                    checked={row.original.update_inventory === 1 ? true : false}
                    disabled
                    slotProps={{
                        input: { 'aria-label': 'update inventory' },
                    }}
                />
            ),
            Edit: ({ row, cell, table }) => {
                const [checked, setChecked] = React.useState(() => {
                    const currentValue = cell.getValue();
                    return currentValue === 1 ? true : false;
                });

                const handleChange = (e) => {
                    const newChecked = e.target.checked;
                    setChecked(newChecked);
                    row._valuesCache[cell.column.id] = newChecked ? 1 : 0;

                    if (create_tasks && onTaskCreate) {
                        const taskData = {
                            ...row._valuesCache,
                            property_id: properties_id,
                            inventory_id: inventory_id
                        };
                        //console.log("Auto-sending task data to parent:", taskData);
                        onTaskCreate(taskData);
                    }
                };

                return (
                    <Checkbox
                        checked={checked}
                        onChange={handleChange}
                        slotProps={{
                            input: { 'aria-label': 'update inventory' },
                        }}
                    />
                );
            },
        },

        {
            accessorKey: 'status',
            header: 'Status',
            editVariant: 'select',
            editSelectOptions: statusOpts.map(opt => opt.value),
            muiEditTextFieldProps: ({ row, table }) => ({
                select: true,
                required: true,
                error: !!validationErrors?.status,
                helperText: validationErrors?.status,
                onChange: (e) => {
                    row._valuesCache.status = e.target.value;
                    if (create_tasks && onTaskCreate) {
                        const taskData = {
                            ...row._valuesCache,
                            property_id: properties_id,
                            inventory_id: inventory_id
                        };
                        onTaskCreate(taskData);
                    }
                },
                SelectProps: {
                    displayEmpty: true,
                    renderValue: (selected) => {
                        if (!selected) {
                            return <em>Select</em>;
                        }
                        const status = statusOpts.find(s => s.value === selected);
                        return status ? status.label : selected;
                    },
                },
                onFocus: () =>
                    setValidationErrors({
                        ...validationErrors,
                        status: undefined,
                    }),
                children: [
                    <MenuItem key="empty-placeholder" value="">
                        <em>Select</em>
                    </MenuItem>,
                    ...statusOpts.map((status) => (
                        <MenuItem key={status.value} value={status.value}>
                            {status.label}
                        </MenuItem>
                    ))
                ],
            }),
            Cell: ({ cell }) => {
                const value = cell.getValue()
                const colors = {
                    pending: palette.warning?.main || '#ff9800',
                    in_progress: palette.info?.main || '#2196f3',
                    cancelled: palette.error?.main || '#f44336',
                    completed: palette.success?.main || '#4caf50',
                    overdue: palette.error?.dark || '#d32f2f',
                }
                return (
                    <Box
                        sx={{
                            display: 'inline-block',
                            px: 1.5,
                            height: 24,
                            width: 'fit-content',
                            borderRadius: 10,
                            bgcolor: colors[value] || palette.grey[500],
                            color: 'white',
                            fontSize: '0.75rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            textTransform: 'capitalize',
                        }}
                    >
                        {value.replace('_', ' ')}
                    </Box>
                )
            },
        },

    ],
        [validationErrors, teamMembers, taskTypes, statusOpts, palette]
    )

    const getRepeatOnHelperText = (scheduleType) => {
        switch (scheduleType) {
            case 'weekly':
                return 'Select days of the week';
            case 'monthly':
                return 'Select dates of the month';
            case 'yearly':
                return 'Select date and months';
            default:
                return '';
        }
    };

    const getRepeatOnPlaceholder = (scheduleType) => {
        switch (scheduleType) {
            case 'weekly':
                return 'Select days';
            case 'monthly':
                return 'Select dates';
            case 'yearly':
                return 'Select date and months';
            default:
                return '';
        }
    };

    const handleCreateTask = async ({ values, table }) => {
        try {
            setLoading(true)
            // Add property_id and inventory_id to the task data
            const taskData = {
                ...values,
                property_id: properties_id,
                inventory_id: inventory_id
            }

            // Call appropriate API based on view mode
            let res;
            if (viewMode === 'activeTasks') {
                // For active tasks, only send required fields
                const activeTaskData = {
                    title: taskData.title,
                    description: taskData.description,
                    task_type: taskData.task_type,
                    inventory_id: taskData.inventory_id,
                    assigned_to: taskData.assigned_to,
                    scheduled_date: taskData.scheduled_date,
                    status: taskData.status,
                    is_photo_required: taskData.is_photo_required
                };
                res = isTeamUser
                    ? await createTeamActiveTask(activeTaskData)
                    : await createClientActiveTask(activeTaskData);
            } else {
                // For task planner, send all fields
                res = isTeamUser
                    ? await createTeamTask(taskData)
                    : await createClientTask(taskData);
            }

            showSnackbar(res.message || 'Task created successfully', 'success')
            await fetchInventoryById(inventoryId)
            table.setCreatingRow(null)
            setValidationErrors({})
        } catch (error) {
            if (error.errors && Array.isArray(error.errors)) {
                const apiErrors = {}
                error.errors.forEach((err) => {
                    Object.keys(err).forEach((key) => {
                        apiErrors[key] = err[key]
                    })
                })
                setValidationErrors(apiErrors)
            }
            showSnackbar(error.message || 'Failed to create task', 'error')
            console.error('Error creating task:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSaveTaskPlanner = async ({ values, table, row }) => {
        try {
            setLoading(true)
            const taskData = {
                ...values,
                property_id: properties_id,
                inventory_id: inventory_id
            }
            const res = isTeamUser
                ? await updateTeamsTaskPlanner(row.original.id, taskData)
                : await updateTaskPlanner(row.original.id, taskData)
            showSnackbar(res.message, 'success')
            await fetchInventoryById(inventoryId)
            table.setEditingRow(null)
            setValidationErrors({})
        } catch (error) {
            if (error.errors && Array.isArray(error.errors)) {
                const apiErrors = {}
                error.errors.forEach((err) => {
                    Object.keys(err).forEach((key) => {
                        apiErrors[key] = err[key]
                    })
                })
                setValidationErrors(apiErrors)
            }
            showSnackbar(error.message || 'Failed to update task', 'error')
            console.error('Error updating task:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSaveActiveTask = async ({ values, table, row }) => {
        try {
            setLoading(true)
            const taskData = {
                ...values,
                property_id: properties_id,
                inventory_id: inventory_id
            }
            const res = isTeamUser
                ? await updateTeamsActiveTask(row.original.id, taskData)
                : await updateActiveTask(row.original.id, taskData)
            showSnackbar(res.message, 'success')
            await fetchInventoryById(inventoryId)
            table.setEditingRow(null)
            setValidationErrors({})
        } catch (error) {
            if (error.message === 'Completion photo is required for this task') {
                setPendingTask(row.original);
                setTableRef(table);
                setShowcompletionDialog(true);
                table.setEditingRow(null);
                return;
            }
            if (error.errors && Array.isArray(error.errors)) {
                const apiErrors = {}
                error.errors.forEach((err) => {
                    Object.keys(err).forEach((key) => {
                        apiErrors[key] = err[key]
                    })
                })
                setValidationErrors(apiErrors)
            }
            showSnackbar(error.message || 'Failed to update active task', 'error')
            console.error('Error updating active task:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteTask = (taskId, scheduleType) => {
        setTaskToDelete({ id: taskId, scheduleType });
        setOpenDeleteConfirm(true);
    };

    const handleCancelDelete = () => {
        setOpenDeleteConfirm(false);
        setTaskToDelete(null);
    };

    const handleConfirmDelete = async () => {
        if (!taskToDelete) return;

        setLoading(true);
        try {
            let res;
            const isRecurring = viewMode === 'taskPlanner' ||
                (taskToDelete.scheduleType && taskToDelete.scheduleType !== 'one_time');

            if (isRecurring) {
                // Delete recurring task (task planner)
                res = isTeamUser
                    ? await deleteTeamRecurringTask(taskToDelete.id)
                    : await deleteClientTask(taskToDelete.id);

                // Update local state
                setTaskPlanner(prevTasks => prevTasks.filter(task => task.id !== taskToDelete.id));
            } else {
                // Delete one-time task (active task)
                res = isTeamUser
                    ? await deleteTeamOneTimeTask(taskToDelete.id)
                    : await deleteOneTime(taskToDelete.id);

                // Update local state
                setActiveTasks(prevTasks => prevTasks.filter(task => task.id !== taskToDelete.id));
            }

            showSnackbar(res.message || 'Task deleted successfully', 'success');
        } catch (error) {
            showSnackbar(error.message || 'Failed to delete task', 'error');
            console.error('Error deleting task:', error);
        } finally {
            setLoading(false);
            setOpenDeleteConfirm(false);
            setTaskToDelete(null);
        }
    };

    const handleCompletionDialogClose = () => {
        setShowcompletionDialog(false);
        setPendingTask(null);
    };

    return (
        <React.Fragment>

            <Box>
                <MaterialReactTable
                    columns={viewMode === 'taskPlanner' ? TaskPlannercolumns : ActiveTaskcolumns}
                    data={getCurrentData()}
                    state={{
                        isLoading: loading,
                    }}
                    editDisplayMode="row"
                    enableEditing
                    enableRowActions
                    positionActionsColumn="last"
                    createDisplayMode="row"
                    displayColumnDefOptions={{
                        'mrt-row-actions': {
                            size: 120,
                            muiTableBodyCellProps: ({ row, table }) => {
                                const isEditing = table.getState().editingRow?.id === row.id;
                                const isCreating = table.getState().creatingRow?.id === row.id;

                                if (isEditing || isCreating) {
                                    return {
                                        children: (
                                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                                <Tooltip title="Cancel">
                                                    <IconButton
                                                        onClick={() => {
                                                            table.setEditingRow(null);
                                                            table.setCreatingRow(null);
                                                            setValidationErrors({});
                                                        }}
                                                        size="small"
                                                        sx={{ color: palette.grey[600] }}
                                                    >
                                                        <CloseIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                {/* if create_tasks is true then hide this button */}
                                                {!create_tasks && (
                                                    <Tooltip title="Save">
                                                        <IconButton
                                                            onClick={() => {
                                                                if (isCreating) {
                                                                    handleCreateTask({ values: row._valuesCache, table });
                                                                } else {
                                                                    if (viewMode === 'taskPlanner') {
                                                                        handleSaveTaskPlanner({ values: row._valuesCache, table, row });
                                                                    } else {
                                                                        handleSaveActiveTask({ values: row._valuesCache, table, row });
                                                                    }
                                                                }
                                                            }}
                                                            size="small"

                                                            sx={{
                                                                color: palette.primary.main

                                                            }}
                                                        >
                                                            <SaveIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                            </Box>
                                        ),
                                    };
                                }
                                return {};
                            },
                        },
                    }}
                    onCreatingRowSave={handleCreateTask}
                    onCreatingRowCancel={() => setValidationErrors({})}
                    onEditingRowSave={viewMode === 'taskPlanner' ? handleSaveTaskPlanner : handleSaveActiveTask}
                    onEditingRowCancel={() => setValidationErrors({})}

                    renderRowActions={({ row, table }) => {
                        const isEditing = table.getState().editingRow?.id === row.id;
                        const isCreating = table.getState().creatingRow?.id === row.id;

                        if (isEditing || isCreating) {
                            return null;
                        }

                        return (
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <Tooltip title="Edit">
                                    <IconButton
                                        onClick={() => table.setEditingRow(row)}
                                        size="small"
                                        sx={{ color: palette.secondary.main }}
                                    >
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete">
                                    <IconButton
                                        onClick={() => handleDeleteTask(
                                            row.original.id,
                                            row.original.schedule_type
                                        )}
                                        size="small"
                                        sx={{ color: palette.secondary.main }}
                                    >
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Duplicate Task" placement="top" arrow>
                                    <IconButton
                                        onClick={() => {
                                            const duplicatedData = { ...row.original };
                                            delete duplicatedData.id;
                                            // Create a proper MRT row with pre-filled data
                                            const newCreatingRow = createRow(table, duplicatedData);
                                            // Open the creation row pre-filled
                                            table.setCreatingRow(newCreatingRow);
                                        }}
                                        size="small"
                                        sx={{ color: palette.secondary.main }}
                                    >
                                        <FileCopy fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            </Box>
                        );
                    }}
                    renderTopToolbarCustomActions={({ table }) => (
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: 2,
                                width: '100%',
                            }}>
                            <Button
                                variant="contained"
                                disableElevation
                                size='small'
                                onClick={() => {
                                    table.setCreatingRow(true)
                                }}
                                sx={{
                                    bgcolor: palette.primary.main,
                                    "&:hover": { bgcolor: palette.secondary.main },
                                    textTransform: "none",
                                    borderRadius: 10,
                                }}
                            >
                                Add New Task
                            </Button>

                            <Select
                                value={viewMode}
                                onChange={handleViewChange}
                                size="small"
                                sx={{
                                    minWidth: 150,
                                    bgcolor: 'background.paper',

                                }}
                            >
                                <MenuItem value="taskPlanner">Recurring Tasks</MenuItem>
                                <MenuItem value="activeTasks">One-Time Tasks</MenuItem>
                            </Select>
                        </Box>
                    )}
                    enableColumnFilters={false}
                    enableGlobalFilter={false}
                    enableSorting={false}
                    enablePagination={false}
                    enableBottomToolbar={false}
                    enableToolbarInternalActions={false}
                    enableDensityToggle={false}
                    enableFullScreenToggle={false}
                    enableHiding={false}
                    muiTablePaperProps={{
                        elevation: 2,
                        sx: {
                            borderRadius: 2,
                            boxShadow: '0px 2px 6px rgba(105, 105, 101, 0.99)',
                        },
                    }}
                    muiTableHeadCellProps={{
                        sx: {
                            bgcolor: palette.primary.main,
                            color: '#fff',
                            fontWeight: 600,
                        },
                    }}
                    muiTableHeadProps={{
                        sx: {
                            bgcolor: palette.primary.main,
                        },
                    }}
                />

            </Box>

            <ConfirmationDialog
                open={openDeleteConfirm}
                onCancel={handleCancelDelete}
                onDelete={handleConfirmDelete}
                title="Delete Task"
                message="Are you sure you want to delete this task? This action cannot be undone."
            />

            <TaskCompletionDialog
                open={showcompletionDialog}
                onClose={handleCompletionDialogClose}
                task={pendingTask}
                updateTaskCompletionStatus={
                    isTeamUser ? updateTeamTaskStatusCompleted : updateClientTaskStatusCompleted
                }
            />

            <ImageViewer
                open={openImage}
                onClose={() => setOpenImage(false)}
                image={selectedImage}
            />
        </React.Fragment>
    )
}

export default Task_Accordian