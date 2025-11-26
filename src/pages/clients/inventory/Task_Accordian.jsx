import React, { useEffect, useMemo, useState } from 'react'
import { Box, IconButton, Tooltip, Button, useTheme, MenuItem, Checkbox } from '@mui/material'
import { MaterialReactTable } from 'material-react-table'
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material'
import ConfirmationDialog from '../../../dialoge/clients/Confirmation_dialog'
import { getInventoryById } from '../../../service/Clients/Inventory'
import { getTeamMembers } from '../../../service/Clients/Team'
import { createClientTask, updateClientTask, deleteClientTask } from '../../../service/Clients/Task'
import { useSnackbar } from '../../../resuable_components/Snackbar'

const Task_Accordian = ({ inventoryId }) => {
    const theme = useTheme()
    const { palette } = theme
    const { showSnackbar } = useSnackbar();

    const [validationErrors, setValidationErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [openConfirm, setOpenConfirm] = useState(false);
    const [taskToDelete, setTaskToDelete] = useState(null);
    const [newtaskData, setNewTaskData] = useState([]);
    const [teamMembers, setTeamMembers] = useState([]);
    const [properties_id, setProperties_id] = useState("");
    const [inventory_id, setInventory_id] = useState("");
    
    // console.log("teamMembers",teamMembers);
    // console.log("newtaskData",newtaskData);

    // get inventory by id 
    const fetchInventoryById = async (id) => {
        try {
            const res = await getInventoryById(id);
            setNewTaskData(res.data.tasks);
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
    // Task type options

    const taskTypes = ['inspection', 'maintenance', 'delivery', 'repair', 'other', 'cleaning']
    // schedule type 
    const scheduleTypes = ['recurring', 'one_time']
    // shcedule type 
    const recurringTypes = ['daily', 'weekly', 'monthly', 'yearly']

    // staus options
    const statusOpts = [
        { value: 'pending', label: 'Pending' },
        { value: 'in_progress', label: 'In Progress' },
        { value: 'completed', label: 'Completed' },
        { value: 'cancelled', label: 'Cancelled' },
        { value: 'overdue', label: 'Overdue' },
    ];

    // Initial JSON data
    const initialTaskData = []

    const [taskData, setTaskData] = useState(initialTaskData);

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
                    children: [
                        <MenuItem key="empty-placeholder" value="">
                            <em>Select Schedule Type</em>
                        </MenuItem>,
                        ...scheduleTypes.map((type) => (
                            <MenuItem key={type} value={type}>
                                {type}
                            </MenuItem>
                        ))
                    ],
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
                accessorKey: 'recurrence',
                header: 'Recurrence',
                size: 150,
                editVariant: 'select',
                editSelectOptions: recurringTypes,
                muiEditTextFieldProps: ({ row }) => ({
                    select: true,
                    required: false,
                    disabled: row._valuesCache?.schedule_type !== 'recurring',
                    error: !!validationErrors?.recurrence,
                    helperText: validationErrors?.recurrence,
                    SelectProps: {
                        displayEmpty: true,
                        renderValue: (selected) => {
                            if (!selected) {
                                return <em>Select Recurrence</em>;
                            }
                            return selected;
                        },
                    },
                    onFocus: () =>
                        setValidationErrors({
                            ...validationErrors,
                            recurrence: undefined,
                        }),
                    children: [
                        <MenuItem key="empty-placeholder" value="">
                            <em>Select Recurrence</em>
                        </MenuItem>,
                        ...recurringTypes.map((type) => (
                            <MenuItem key={type} value={type}>
                                {type}
                            </MenuItem>
                        ))
                    ],
                }),
                Cell: ({ cell }) => {
                    const value = cell.getValue()
                    return (
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
                            {value || '-'}
                        </Box>
                    )
                },
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
                    children: [
                        <MenuItem key="empty-placeholder" value="">
                            <em>Select Task Type</em>
                        </MenuItem>,
                        ...taskTypes.map((type) => (
                            <MenuItem key={type} value={type}>
                                {type}
                            </MenuItem>
                        ))
                    ],
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
                    children: [
                        <MenuItem key="empty-placeholder" value="">
                            <em>Select Team Member</em>
                        </MenuItem>,
                        ...teamMembers.map((member) => (
                            <MenuItem key={member.id} value={member.id}>
                                {member.name}
                            </MenuItem>
                        ))
                    ],
                },
                  Cell: ({ row }) => row.original.assigned_to_name || '-',
            },
            {
                accessorKey: 'is_photo_required',
                header: 'Photo Required',
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
        [validationErrors, teamMembers, taskTypes, scheduleTypes, recurringTypes, statusOpts, palette]
    )

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
                    columns={columns}
                    data={newtaskData}
                    state={{
                        isLoading: loading,
                    }}
                    editDisplayMode="row"
                    enableEditing
                    enableRowActions
                    positionActionsColumn="last"
                    createDisplayMode="row"
                    onCreatingRowSave={handleCreateTask}
                    onCreatingRowCancel={() => setValidationErrors({})}
                    onEditingRowSave={handleSaveTask}
                    onEditingRowCancel={() => setValidationErrors({})}
                    renderRowActions={({ row, table }) => (
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
                    )}
                    renderTopToolbarCustomActions={({ table }) => (
                        <Button
                            variant="contained"
                            disableElevation
                            onClick={() => {
                                table.setCreatingRow(true)
                            }}
                            sx={{
                                // button should be right end 
                                marginLeft: 'auto',
                                bgcolor: palette.secondary.main,
                                "&:hover": { bgcolor: palette.secondary.dark },
                            }}
                        >
                            Add New Task
                        </Button>
                    )}
                    enableColumnFilters={false}
                    enableGlobalFilter={false}
                    enableSorting={false}
                    enablePagination={false}
                    enableToolbarInternalActions={false}
                    enableDensityToggle={false}
                    enableFullScreenToggle={false}
                    enableHiding={false}
                    muiTablePaperProps={{
                        elevation: 2,
                        sx: {
                            borderRadius: 2,
                            boxShadow: '0px 2px 6px rgba(0,0,0,0.05)',
                        },
                    }}
                    muiTableHeadCellProps={{
                        sx: {
                            bgcolor: palette.primary.main,
                            color: '#fff',
                            fontWeight: 600,
                        },
                    }}
                    muiTableBodyRowProps={{
                        hover: true,
                        sx: {
                            '&:hover': {
                                bgcolor: theme.palette.mode === 'light'
                                    ? '#f5f5f5'
                                    : palette.background.paper
                            }
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