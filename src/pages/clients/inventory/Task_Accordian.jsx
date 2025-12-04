import React, { useEffect, useMemo, useState } from 'react'
import { Box, IconButton, Tooltip, Button, useTheme, MenuItem, Checkbox, Select, Autocomplete, TextField, Chip } from '@mui/material'
import { MaterialReactTable } from 'material-react-table'
import { Edit as EditIcon, Delete as DeleteIcon, Close as CloseIcon, Save as SaveIcon } from '@mui/icons-material'
import ConfirmationDialog from '../../../dialoge/clients/Confirmation_dialog'
import { getInventoryById } from '../../../service/Clients/Inventory'
import { getTeamMembers } from '../../../service/Clients/Team'
import { createClientTask, updateClientTask, deleteClientTask } from '../../../service/Clients/Task'
import { useSnackbar } from '../../../resuable_components/Snackbar'
import { taskTypes, scheduleTypes, recurringTypes, statusOpts, daysOfWeek, monthsOfYear, datesOfMonth } from '../../../constant';
import { formatDate } from '../../../utils/dateFormat'

const Task_Accordian = ({ inventoryId, create_tasks, onTaskCreate }) => {
    const theme = useTheme()
    const { palette } = theme
    const { showSnackbar } = useSnackbar();
    const [validationErrors, setValidationErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [openConfirm, setOpenConfirm] = useState(false);
    const [taskToDelete, setTaskToDelete] = useState(null);
    const [newtaskData, setNewTaskData] = useState([]);
    const [taskPlanner, setTaskPlanner] = useState([]);
    const [activeTasks, setActiveTasks] = useState([]);
    const [teamMembers, setTeamMembers] = useState([]);
    const [properties_id, setProperties_id] = useState("");
    const [inventory_id, setInventory_id] = useState("");
    const [viewMode, setViewMode] = useState('taskPlanner');

    const handleViewChange = (event) => {
        setViewMode(event.target.value);
    };

    // console.log("create_tasks", create_tasks);
    // console.log("newtaskData", newtaskData);
    // console.log("taskPlanner", taskPlanner);
    // console.log("activeTasks", activeTasks);

    // Get the current data based on view mode
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

    // get inventory by id 
    const fetchInventoryById = async (id) => {
        try {
            const res = await getInventoryById(id);
            console.log("Fetched inventory data:", res.data);
            setActiveTasks(res.data.task_instances || []);
            setTaskPlanner(res.data.tasks_planner || []);
            setNewTaskData(res.data.tasks || []);
            setProperties_id(res.data.property_id);
            setInventory_id(res.data.id);
        } catch (error) {
            console.error("Error fetching inventory by ID:", error);
            return null;
        }
    };

    // get team members
    const fetchTeamMembers = async () => {
        try {
            const res = await getTeamMembers();
            setTeamMembers(res.data || []);
        } catch (error) {
            console.error('Error fetching team members:', error);
        }
    };


    useEffect(() => {
        fetchInventoryById(inventoryId);
        fetchTeamMembers();
    }, [inventoryId]);
    const TaskPlannercolumns = useMemo(
        () => [
            {
                accessorKey: 'title',
                header: 'Title',
                size: 150,
                muiEditTextFieldProps: ({ row, table }) => ({
                    required: true,
                    error: !!validationErrors?.title,
                    helperText: validationErrors?.title,
                    onChange: (e) => {
                        // Update the cached value
                        row._valuesCache.title = e.target.value;

                        // If create_tasks is true, automatically send data to parent
                        if (create_tasks && onTaskCreate) {
                            const taskData = {
                                ...row._valuesCache,
                                property_id: properties_id,
                                inventory_id: inventory_id
                            };
                            console.log("Auto-sending task data to parent:", taskData);
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
                            console.log("Auto-sending task data to parent:", taskData);
                            onTaskCreate(taskData);
                        }
                    },
                    onFocus: () =>
                        setValidationErrors({
                            ...validationErrors,
                            description: undefined,
                        }),
                }),
            },
            {
                accessorKey: 'schedule_type',
                header: 'Schedule Type',
                size: 130,
                editVariant: 'select',
                editSelectOptions: scheduleTypes,
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
                            console.log("Auto-sending task data to parent:", taskData);
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
                    children: [
                        <MenuItem key="empty-placeholder" value="">
                            <em>Select Type</em>
                        </MenuItem>,
                        ...scheduleTypes.map((type) => (
                            <MenuItem key={type} value={type}>
                                {type}
                            </MenuItem>
                        ))
                    ],
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

                        if (scheduleType === 'weekly') {
                            return data.days?.join(', ') || '-';
                        } else if (scheduleType === 'monthly') {
                            return data.date?.join(', ') || '-';
                        } else if (scheduleType === 'yearly') {
                            return `${data.date || '-'} ${data.month?.join(', ') || '-'}`;
                        }
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
                                value={repeatData.days || []}
                                onChange={(event, newValue) => {
                                    setRepeatData({ days: newValue });
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
                                value={repeatData.date || []}
                                onChange={(event, newValue) => {
                                    setRepeatData({ date: newValue.sort((a, b) => a - b) });
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

                    // Yearly: Date dropdown + Autocomplete for months
                    if (scheduleType === 'yearly') {
                        return (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <TextField
                                    select
                                    label="Date"
                                    value={repeatData.date || ''}
                                    onChange={(e) => setRepeatData({ ...repeatData, date: parseInt(e.target.value) })}
                                    fullWidth
                                    SelectProps={{
                                        displayEmpty: true,
                                    }}
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

                                <Autocomplete
                                    multiple
                                    options={monthsOfYear}
                                    value={repeatData.month || []}
                                    onChange={(event, newValue) => {
                                        setRepeatData({ ...repeatData, month: newValue });
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
                            console.log("Auto-sending task data to parent:", taskData);
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
            // {
            //     accessorKey: 'recurrence',
            //     header: 'Recurrence',
            //     size: 150,
            //     editVariant: 'select',
            //     editSelectOptions: recurringTypes,
            //     muiEditTextFieldProps: ({ row }) => ({
            //         select: true,
            //         required: false,
            //         disabled: row._valuesCache?.schedule_type !== 'recurring',
            //         error: !!validationErrors?.recurrence,
            //         helperText: validationErrors?.recurrence,
            //         onChange: (e) => {
            //             row._valuesCache.recurrence = e.target.value;

            //             if (create_tasks && onTaskCreate) {
            //                 const taskData = {
            //                     ...row._valuesCache,
            //                     property_id: properties_id,
            //                     inventory_id: inventory_id
            //                 };
            //                 console.log("Auto-sending task data to parent:", taskData);
            //                 onTaskCreate(taskData);
            //             }
            //         },
            //         SelectProps: {
            //             displayEmpty: true,
            //             renderValue: (selected) => {
            //                 if (!selected) {
            //                     return <em>Select</em>;
            //                 }
            //                 return selected;
            //             },
            //         },
            //         onFocus: () =>
            //             setValidationErrors({
            //                 ...validationErrors,
            //                 recurrence: undefined,
            //             }),
            //         children: [
            //             <MenuItem key="empty-placeholder" value="">
            //                 <em>Select</em>
            //             </MenuItem>,
            //             ...recurringTypes.map((type) => (
            //                 <MenuItem key={type} value={type}>
            //                     {type}
            //                 </MenuItem>
            //             ))
            //         ],
            //     }),
            //     Cell: ({ cell }) => {
            //         const value = cell.getValue()
            //         return (
            //             <Box
            //                 sx={{
            //                     display: 'inline-block',
            //                     px: 1.5,
            //                     py: 0.5,
            //                     borderRadius: 1,
            //                     color: palette.text.primary,
            //                     fontSize: '0.75rem',
            //                     fontWeight: 600,
            //                     textTransform: 'capitalize',
            //                 }}
            //             >
            //                 {value || '-'}
            //             </Box>
            //         )
            //     },
            // },
            {
                accessorKey: 'task_type',
                header: 'Task Type',
                size: 130,
                editVariant: 'select',
                editSelectOptions: taskTypes,
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
                            console.log("Auto-sending task data to parent:", taskData);
                            onTaskCreate(taskData);
                        }
                    },
                    SelectProps: {
                        displayEmpty: true,
                        renderValue: (selected) => {
                            if (!selected) {
                                return <em>Select Task Type</em>;
                            }
                            return selected;
                        },
                    },
                    onFocus: () =>
                        setValidationErrors({
                            ...validationErrors,
                            task_type: undefined,
                        }),
                    // children: [
                    //     <MenuItem key="empty-placeholder" value="">
                    //         <em>Select Task Type</em>
                    //     </MenuItem>,
                    //     ...taskTypes.map((type) => (
                    //         <MenuItem key={type} value={type}>
                    //             {type}
                    //         </MenuItem>
                    //     ))
                    // ],
                }),
                Cell: ({ cell }) => {
                    const value = cell.getValue()
                    const colors = {
                        inspection: palette.info?.main || '#2196f3',
                        maintenance: palette.warning?.main || '#ff9800',
                        delivery: palette.success?.main || '#4caf50',
                        repair: palette.error?.main || '#f44336',
                        cleaning: palette.primary?.main || '#1976d2',
                        other: palette.grey[500]
                    }
                    return (
                        <Box
                            sx={{
                                display: 'inline-block',
                                px: 1.5,
                                py: 0.5,
                                borderRadius: 1,
                                bgcolor: colors[value] || palette.grey[500],
                                color: 'white',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                textAlign: 'center',
                                textTransform: 'capitalize',
                            }}
                        >
                            {value}
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
                            console.log("Auto-sending task data to parent:", taskData);
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
                            console.log("Auto-sending task data to parent:", taskData);
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
                accessorKey: 'status',
                header: 'Status',
                size: 120,
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
                            console.log("Auto-sending task data to parent:", taskData);
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
                        pending: palette.error?.main || '#f44336',
                        in_progress: palette.info?.main || '#2196f3',
                        completed: palette.success?.main || '#4caf50',
                        cancelled: palette.grey[500],
                        overdue: palette.warning?.main || '#ff9800'
                    }
                    return (
                        <Box
                            sx={{
                                display: 'inline-block',
                                px: 1.5,
                                py: 0.5,
                                borderRadius: 1,
                                bgcolor: colors[value] || palette.grey[500],
                                color: 'white',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                textAlign: 'center',
                                textTransform: 'capitalize',
                            }}
                        >
                            {statusOpts.find(s => s.value === value)?.label || value}
                        </Box>
                    )
                },
            },
        ],
        [validationErrors, teamMembers, taskTypes, scheduleTypes, recurringTypes, statusOpts, palette, create_tasks, onTaskCreate, properties_id, inventory_id]
    )

    const ActiveTaskcolumns = [
        {
            accessorKey: 'title',
            header: 'Title',
            enableEditing: false,
        },
        {
            accessorKey: 'description',
            header: 'Description',
            enableEditing: false,
        },
        {
            accessorKey: 'property_name',
            header: 'Property',
            enableEditing: false,
        },
        {
            accessorKey: 'inventory_name',
            header: 'Inventory',
            enableEditing: false,
        },
        {
            accessorKey: 'scheduled_date',
            header: 'Scheduled Date',
            enableEditing: false,
        },
        {
            accessorKey: 'scheduled_day',
            header: 'Scheduled Day',
            enableEditing: false,
        },
        {
            accessorKey: 'task_type',
            header: 'Task Type',
            enableEditing: false,
            Cell: ({ cell }) => {
                const value = cell.getValue()
                const colors = {
                    inspection: palette.info?.main || '#2196f3',
                    maintenance: palette.warning?.main || '#ff9800',
                    delivery: palette.success?.main || '#4caf50',
                    repair: palette.error?.main || '#f44336',
                    cleaning: palette.primary?.main || '#1976d2',
                    other: palette.grey[500]
                }
                return (
                    <Box
                        sx={{
                            display: 'inline-block',
                            px: 1.5,
                            py: 0.5,
                            borderRadius: 1,
                            bgcolor: colors[value] || palette.grey[500],
                            color: 'white',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            textAlign: 'center',
                            textTransform: 'capitalize',
                        }}
                    >
                        {taskTypes.find(t => t.value === value)?.label || value}
                    </Box>
                )
            },
        },
        {
            accessorKey: 'assigned_to_name',
            header: 'Assigned To',
            enableEditing: false,
        },
        {
            accessorKey: 'is_photo_required',
            header: 'Photo',
            enableEditing: false,
            Cell: ({ row }) => (
                <Chip
                    label={row.original.is_photo_required === 1 ? 'Yes' : 'No'}
                    color={row.original.is_photo_required === 1 ? 'success' : 'default'}
                    size='small'
                    sx={{ minWidth: 40 }}
                />
            )
        },
        {
            accessorKey: 'status',
            header: 'Status',
            enableEditing: true,
            editVariant: 'select',
            editSelectOptions: statusOpts.map(opt => opt.value),
            muiTableBodyCellEditTextFieldProps: ({ cell }) => ({
                select: true,
                children: statusOpts.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                        {option.label}
                    </MenuItem>
                )),
                onChange: (event) => {
                    const newStatus = event.target.value;
                    cell.row._valuesCache.status = newStatus;
                },
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
                            py: 0.5,
                            borderRadius: 1,
                            bgcolor: colors[value] || palette.grey[500],
                            color: 'white',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            textAlign: 'center',
                            textTransform: 'capitalize',
                        }}
                    >
                        {value.replace('_', ' ')}
                    </Box>
                )
            },
        },
    ]

    // Add these helper functions
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

    // CREATE action
    const handleCreateTask = async ({ values, table }) => {
        try {
            setLoading(true)
            // Add property_id and inventory_id to the task data
            const taskData = {
                ...values,
                property_id: properties_id,
                inventory_id: inventory_id
            }
            const res = await createClientTask(taskData)
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

    // UPDATE action
    const handleSaveTask = async ({ values, table, row }) => {
        try {
            setLoading(true)
            // Add property_id and inventory_id to the task data
            const taskData = {
                ...values,
                property_id: properties_id,
                inventory_id: inventory_id
            }
            const res = await updateClientTask(row.original.id, taskData)
            showSnackbar(res.message || 'Task updated successfully', 'success')
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

    // DELETE action
    const openDeleteDialog = (row) => {
        setTaskToDelete(row.original.id)
        setOpenConfirm(true)
    }

    const handleDelete = async () => {
        if (taskToDelete != null) {
            try {
                setLoading(true)
                const res = await deleteClientTask(taskToDelete)
                showSnackbar(res.message || 'Task deleted successfully', 'success')
                await fetchInventoryById(inventoryId)
            } catch (error) {
                showSnackbar(error.message || 'Failed to delete task', 'error')
                console.error('Error deleting task:', error)
            } finally {
                setLoading(false)
            }
        }
        setOpenConfirm(false)
        setTaskToDelete(null)
    }

    const handleCancel = () => {
        setOpenConfirm(false)
        setTaskToDelete(null)
    }

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
                    enableEditing={viewMode === 'taskPlanner'}
                    enableRowActions={viewMode === 'taskPlanner'}
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
                                                                    handleSaveTask({ values: row._valuesCache, table, row });
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
                    onEditingRowSave={handleSaveTask}
                    onEditingRowCancel={() => setValidationErrors({})}
                    // it should not we show row Action when active task view

                    renderRowActions={({ row, table }) => {
                        const isEditing = table.getState().editingRow?.id === row.id;
                        const isCreating = table.getState().creatingRow?.id === row.id;

                        if (isEditing || isCreating) {
                            // Actions are handled by displayColumnDefOptions above
                            return null;
                        }

                        return (
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <Tooltip title="Edit">
                                    <IconButton
                                        onClick={() => table.setEditingRow(row)}
                                        size="small"
                                        sx={{ color: palette.primary.main }}
                                    >
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete">
                                    <IconButton
                                        onClick={() => openDeleteDialog(row)}
                                        size="small"
                                        sx={{ color: palette.secondary.main }}
                                    >
                                        <DeleteIcon fontSize="small" />
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
                                justifyContent: viewMode === 'taskPlanner' ? 'space-between' : 'flex-end',
                                width: '100%',
                            }}>
                            {viewMode === 'taskPlanner' && (
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
                                    }}
                                >
                                    Add New Task
                                </Button>
                            )}

                            <Select
                                value={viewMode}
                                onChange={handleViewChange}
                                size="small"
                                sx={{
                                    minWidth: 150,
                                    bgcolor: 'background.paper',

                                }}
                            >
                                <MenuItem value="taskPlanner">Task Planner</MenuItem>
                                <MenuItem value="activeTasks">Active Tasks</MenuItem>
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
                            boxShadow: '0px 2px 6px rgba(28, 227, 38, 0.99)',
                        },
                    }}
                    muiTableHeadCellProps={{
                        sx: {
                            bgcolor: palette.primary.main,
                            color: '#fff',
                            fontWeight: 600,
                        },
                    }}
                    // change table header color to primary main
                    muiTableHeadProps={{
                        sx: {
                            bgcolor: palette.primary.main,
                        },
                    }}

                />

                <ConfirmationDialog
                    open={openConfirm}
                    onCancel={handleCancel}
                    onDelete={handleDelete}
                    title="Delete Task"
                    message="Are you sure you want to delete this task? This action cannot be undone."
                />
            </Box>
        </React.Fragment>
    )
}

export default Task_Accordian