import React, { useEffect, useMemo, useState } from 'react'
import { Container, Box, IconButton, Tooltip, Button, useTheme, MenuItem, Checkbox, Autocomplete, TextField } from '@mui/material'
import { MaterialReactTable } from 'material-react-table'
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material'
import ConfirmationDialog from '../../../dialoge/clients/Confirmation_dialog'
import { getClientTasks, createClientTask, updateClientTask, deleteClientTask } from '../../../service/Clients/Task'
import { getClientProperties } from '../../../service/Clients/Properties'
import { getInventoryItems } from '../../../service/Clients/Inventory'
import { getTeamMembers } from '../../../service/Clients/Team'
import { useSnackbar } from '../../../resuable_components/Snackbar'
import { taskTypes, scheduleTypes, recurringTypes, statusOpts, daysOfWeek, monthsOfYear, datesOfMonth } from '../../../constant'
import { formatDate } from '../../../utils/dateFormat'



const TaskPlanner = () => {
    const theme = useTheme()
    const { palette } = theme
    const { showSnackbar } = useSnackbar();

    const [validationErrors, setValidationErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [openConfirm, setOpenConfirm] = useState(false);
    const [taskToDelete, setTaskToDelete] = useState(null);
    const [newTaskData, setNewTaskData] = useState([]);
    const [properties, setProperties] = useState([]);
    const [inventoryItems, setInventoryItems] = useState([]);
    const [teamMembers, setTeamMembers] = useState([]);

    // get all task 
    const allTasks = async () => {
        try {
            const res = await getClientTasks();
            setNewTaskData(res.data);
        } catch (error) {
            console.error('Error fetching tasks:', error);
        }
    };
    useEffect(() => {
        allTasks();
    }, []);

    // Fetch properties
    const fetchProperties = async () => {
        try {
            const res = await getClientProperties();
            setProperties(res.data || []);
        } catch (error) {
            console.error('Error fetching properties:', error);
        }
    };

    // fetchInventory 
    const fetchInventoryItems = async () => {
        try {
            const res = await getInventoryItems();
            setInventoryItems(res.data || []);
        } catch (error) {
            console.error('Error fetching inventory items:', error);
        }
    };

    // fetch team members
    const fetchTeamMembers = async () => {
        try {
            const res = await getTeamMembers();
            setTeamMembers(res.data || []);
        } catch (error) {
            console.error('Error fetching team members:', error);
        }
    };

    useEffect(() => {
        fetchProperties();
        fetchInventoryItems();
        fetchTeamMembers();
    }, []);



    const columns = useMemo(
        () => [
            {
                accessorKey: 'title',
                header: 'Title',
                size: 150,
                muiEditTextFieldProps: {
                    required: true,
                    error: !!validationErrors?.title,
                    helperText: validationErrors?.title,
                    onFocus: () =>
                        setValidationErrors({
                            ...validationErrors,
                            title: undefined,
                        }),
                },
            },
            {
                accessorKey: 'description',
                header: 'Description',
                size: 200,
                muiEditTextFieldProps: {
                    required: true,
                    multiline: true,
                    rows: 2,
                    error: !!validationErrors?.description,
                    helperText: validationErrors?.description,
                    onFocus: () =>
                        setValidationErrors({
                            ...validationErrors,
                            description: undefined,
                        }),
                },
            },
            {
                accessorKey: 'property_id',
                header: 'Property',
                size: 180,
                editVariant: 'select',
                editSelectOptions: properties.map(prop => ({ value: prop.id, label: prop.name })),
                muiEditTextFieldProps: {
                    select: true,
                    required: true,
                    error: !!validationErrors?.property_id,
                    helperText: validationErrors?.property_id,
                    SelectProps: {
                        displayEmpty: true,
                        renderValue: (selected) => {
                            if (!selected) {
                                return <em>Select Property</em>;
                            }
                            const property = properties.find(p => p.id === selected);
                            return property ? property.name : selected;
                        },
                    },
                    onFocus: () =>
                        setValidationErrors({
                            ...validationErrors,
                            property_id: undefined,
                        }),
                    children: [
                        <MenuItem key="empty-placeholder" value="">
                            <em>Select Property</em>
                        </MenuItem>,
                        ...properties.map((prop) => (
                            <MenuItem key={prop.id} value={prop.id}>
                                {prop.name}
                            </MenuItem>
                        ))
                    ],
                },
                Cell: ({ row }) => row.original.property_name || '-',
            },
            {
                accessorKey: 'inventory_id',
                header: 'Inventory',
                size: 180,
                editVariant: 'select',
                editSelectOptions: inventoryItems.map(item => ({ value: item.id, label: item.name })),
                muiEditTextFieldProps: {
                    select: true,
                    required: true,
                    error: !!validationErrors?.inventory_id,
                    helperText: validationErrors?.inventory_id,
                    SelectProps: {
                        displayEmpty: true,
                        renderValue: (selected) => {
                            if (!selected) {
                                return <em>Select Inventory</em>;
                            }
                            const inventory = inventoryItems.find(i => i.id === selected);
                            return inventory ? inventory.name : selected;
                        },
                    },
                    onFocus: () =>
                        setValidationErrors({
                            ...validationErrors,
                            inventory_id: undefined,
                        }),
                    children: [
                        <MenuItem key="empty-placeholder" value="">
                            <em>Select Inventory</em>
                        </MenuItem>,
                        ...inventoryItems.map((item) => (
                            <MenuItem key={item.id} value={item.id}>
                                {item.name}
                            </MenuItem>
                        ))
                    ],
                },
                Cell: ({ row }) => row.original.inventory_name || '-',
            },
            {
                accessorKey: 'schedule_type',
                header: 'Schedule Type',
                size: 130,
                editVariant: 'select',
                editSelectOptions: scheduleTypes,
                muiEditTextFieldProps: {
                    select: true,
                    required: true,
                    error: !!validationErrors?.schedule_type,
                    helperText: validationErrors?.schedule_type,
                    SelectProps: {
                        displayEmpty: true,
                        renderValue: (selected) => {
                            if (!selected) {
                                return <em>Select Schedule Type</em>;
                            }
                            return selected;
                        },
                    },
                    onFocus: () =>
                        setValidationErrors({
                            ...validationErrors,
                            schedule_type: undefined,
                        }),
                },
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
                muiEditTextFieldProps: ({ row }) => ({
                    type: 'date',
                    required: true,
                    disabled: !!row?.original?.id,
                    error: !!validationErrors?.start_date,
                    helperText: validationErrors?.start_date,
                    InputLabelProps: {
                        shrink: true,
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
                editSelectOptions: taskTypes,
                muiEditTextFieldProps: {
                    select: true,
                    required: true,
                    error: !!validationErrors?.task_type,
                    helperText: validationErrors?.task_type,
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
                },
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
                muiEditTextFieldProps: {
                    select: true,
                    required: true,
                    error: !!validationErrors?.assigned_to,
                    helperText: validationErrors?.assigned_to,
                    SelectProps: {
                        displayEmpty: true,
                        renderValue: (selected) => {
                            if (!selected) {
                                return <em>Select Team Member</em>;
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
                    // children: [
                    //     <MenuItem key="empty-placeholder" value="">
                    //         <em>Select Team Member</em>
                    //     </MenuItem>,
                    //     ...teamMembers.map((member) => (
                    //         <MenuItem key={member.id} value={member.id}>
                    //             {member.name}
                    //         </MenuItem>
                    //     ))
                    // ],
                },
                // Cell: ({ row }) => row.original.assigned_to_name || '-',
                Cell: ({ row }) => {
                    const member = teamMembers.find(m => m.id === row.original.assigned_to);
                    return member ? member.name : '-';
                }

            },
            {
                accessorKey: 'is_photo_required',
                header: 'Photo',
                size: 100,
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
                    const [checked, setChecked] = useState(() => {
                        const currentValue = cell.getValue();
                        return currentValue === 1 ? true : false;
                    });

                    const handleChange = (e) => {
                        const newChecked = e.target.checked;
                        setChecked(newChecked);
                        row._valuesCache[cell.column.id] = newChecked ? 1 : 0;
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
                size: 130,
                editVariant: 'select',
                editSelectOptions: statusOpts.map(opt => opt.value),
                muiEditTextFieldProps: {
                    select: true,
                    required: true,
                    error: !!validationErrors?.status,
                    helperText: validationErrors?.status,
                    SelectProps: {
                        displayEmpty: true,
                        renderValue: (selected) => {
                            if (!selected) {
                                return <em>Select Status</em>;
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
                            <em>Select Status</em>
                        </MenuItem>,
                        ...statusOpts.map((status) => (
                            <MenuItem key={status.value} value={status.value}>
                                {status.label}
                            </MenuItem>
                        ))
                    ],
                },
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
        [validationErrors, properties, inventoryItems, teamMembers, taskTypes, scheduleTypes, statusOpts, palette]
    )

    // Add these helper functions before the return statement
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

            const res = await createClientTask(values)
            showSnackbar(res.message || 'Task created successfully', 'success')
            setNewTaskData((prevData) => [res.data, ...prevData]);
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
        }
    }

    // UPDATE action
    const handleSaveTask = async ({ values, table, row }) => {
        try {
            const res = await updateClientTask(row.original.id, values)
            showSnackbar(res.message || 'Task updated successfully', 'success')
            setNewTaskData((prevData) =>
                prevData.map((task) =>
                    task.id === row.original.id ? { ...task, ...values } : task
                )
            )
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
        }
    }

    // DELETE action
    const openDeleteDialog = (row) => {
        setTaskToDelete(row.original.id);
        setOpenConfirm(true);
    };

    const handleDelete = async () => {
        if (taskToDelete != null) {
            try {
                const res = await deleteClientTask(taskToDelete)
                showSnackbar(res.message || 'Task deleted successfully', 'success')
                setNewTaskData((prevData) => prevData.filter((task) => task.id !== taskToDelete));
            } catch (error) {
                showSnackbar(error.message || 'Failed to delete task', 'error')
                console.error('Error deleting task:', error)
            }
        }
        setOpenConfirm(false);
        setTaskToDelete(null);
    };

    const handleCancel = () => {
        setOpenConfirm(false);
        setTaskToDelete(null);
    };




    return (
        <React.Fragment>
            <Container
                maxWidth={false}
                sx={{
                    mt: 2,
                    mb: 2,
                    px: { xs: 1, sm: 2, md: 3 },

                }}
            >
                <MaterialReactTable
                    columns={columns}
                    data={newTaskData}
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
                            header: 'Actions',
                            size: 110,
                        },
                    }}
                    onCreatingRowSave={handleCreateTask}
                    onCreatingRowCancel={() => setValidationErrors({})}
                    onEditingRowSave={handleSaveTask}
                    onEditingRowCancel={() => setValidationErrors({})}
                    renderRowActions={({ row, table }) => (
                        <Box sx={{ display: 'flex', marginRight: 2, }}>
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
                    )}
                    renderTopToolbarCustomActions={({ table }) => (
                        <Button
                            variant="contained"
                            disableElevation
                            onClick={() => {
                                table.setCreatingRow(true)
                            }}
                            sx={{
                                bgcolor: palette.primary.main,
                                "&:hover": { bgcolor: palette.secondary.main },
                                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                px: { xs: 2, sm: 3 }
                            }}
                        >
                            Create New Task
                        </Button>
                    )}
                    enableColumnFilters={false}
                    enableSorting={false}
                    enableDensityToggle={false}
                    enableHiding={false}
                    enablePagination
                />

                <ConfirmationDialog
                    open={openConfirm}
                    onCancel={handleCancel}
                    onDelete={handleDelete}
                    title="Delete Task"
                    message="Are you sure you want to delete this task? This action cannot be undone."
                />
            </Container>
        </React.Fragment>
    )
}

export default TaskPlanner