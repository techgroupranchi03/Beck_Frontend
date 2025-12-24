import React, { useEffect, useMemo, useState } from 'react'
import { Box, IconButton, Tooltip, Button, useTheme, MenuItem, Checkbox, Autocomplete, TextField, Typography, MenuList, ListItem, ListItemIcon } from '@mui/material'
import { MaterialReactTable } from 'material-react-table'
import { Delete, Edit as EditIcon } from '@mui/icons-material'
import { useSnackbar } from '../../../resuable_components/Snackbar'
import { taskTypes, scheduleTypes, recurringTypes, statusOpts, daysOfWeek, monthsOfYear, datesOfMonth } from '../../../constant'
import { formatDate } from '../../../utils/dateFormat'
import { useTaskContext } from './TaskManagement'
import ViewMoreText from "../../../resuable_components/ViewMore.jsx";
import ConfirmationDialog from '../../../dialoge/clients/Confirmation_dialog.jsx'



const TaskPlanner = () => {
    const theme = useTheme()
    const { palette } = theme
    const { showSnackbar } = useSnackbar();
    const [openConfirm, setOpenConfirm] = useState(false);
    const [taskToDelete, setTaskToDelete] = useState(null);


    // Get shared data from context
    const {
        allTasksData,
        deleteRecurringTask,
        properties,
        inventoryItems,
        teamMembers,
        loading,
        createTask,
        updateTaskPlannerData,
        fetchInventoryByProperty,
    } = useTaskContext();

    const [validationErrors, setValidationErrors] = useState({});
    console.log('allTasksData in TaskPlanner:', allTasksData);

    // Map of rowId -> inventory options for that row (used when editing/creating rows)
    const [inventoryOptionsMap, setInventoryOptionsMap] = useState({});

    console.log('inventoryOptionsMap:', inventoryOptionsMap);

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
                Cell: ({ cell }) => (
                    <ViewMoreText text={cell.getValue() || '-'} maxCharacter={20} />
                ),
            },
            {
                accessorKey: 'property_id',
                header: 'Property',
                size: 180,
                editVariant: 'select',
                editSelectOptions: properties.map(item => ({ value: item.id, label: item.name })),
                muiEditTextFieldProps: ({ row }) => ({
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
                    onChange: (e) => {
                        const value = e.target.value;
                        if (row && row._valuesCache) row._valuesCache['property_id'] = value;
                        if (!value) {
                            setInventoryOptionsMap(prev => ({ ...prev, [row.id]: inventoryItems || [] }));
                        } else {
                            if (fetchInventoryByProperty) {
                                fetchInventoryByProperty(value)
                                    .then((data) => setInventoryOptionsMap(prev => ({ ...prev, [row.id]: data || [] })))
                                    .catch(() => setInventoryOptionsMap(prev => ({ ...prev, [row.id]: [] })));
                            } else {
                                setInventoryOptionsMap(prev => ({ ...prev, [row.id]: inventoryItems || [] }));
                            }
                        }
                    },
                    children: [
                        <MenuItem key="empty-placeholder" value="">
                            <em>Select Property</em>
                        </MenuItem>,
                        ...properties.map((prop) => (
                            <MenuItem key={prop.id} value={prop.id}>
                                {prop.name}
                            </MenuItem>
                        )),
                    ],
                }),
                Cell: ({ row }) => {
                    const property = properties.find(p => p.id === row.original.property_id);
                    return property ? property.name : '-';
                },
            },
            {
                accessorKey: 'inventory_id',
                header: 'Inventory',
                size: 200,
                // show name in read-only cell
                Cell: ({ row }) => row.original.inventory_name || '-',
                // custom Edit UI so we can show inventory options based on selected property
                Edit: ({ row, cell }) => {
                    const rowKey = row.id;
                    const options = inventoryOptionsMap[rowKey] || inventoryItems || [];

                    // Ensure we have options for this row when editing: if not set, try to fetch based on current property
                    useEffect(() => {
                        if (inventoryOptionsMap[rowKey] === undefined) {
                            const propId = row._valuesCache?.property_id || row.original?.property_id;
                            if (propId) {
                                fetchInventoryByProperty(propId)
                                    .then((data) => setInventoryOptionsMap(prev => ({ ...prev, [rowKey]: data || [] })))
                                    .catch(() => setInventoryOptionsMap(prev => ({ ...prev, [rowKey]: [] })));
                            } else {
                                setInventoryOptionsMap(prev => ({ ...prev, [rowKey]: inventoryItems || [] }));
                            }
                        }
                    }, [rowKey]);

                    return (
                        <Autocomplete
                            size="small"
                            options={options}
                            getOptionLabel={(option) => option.name ? String(option.name) : ''}
                            value={options.find((it) => it.id === cell.getValue()) || null}
                            renderOption={(props, option) => (
                                <li {...props} key={option.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{option.name}</span>
                                    {(option.property_image_url) && (
                                        <img
                                            src={option.property_image_url}
                                            alt={option.name || ''}
                                            style={{ width: 30, height: 30, objectFit: 'cover', borderRadius: 100, marginLeft: 8 }}
                                        />
                                    )}
                                </li>
                            )}
                            onChange={(_, newValue) => {
                                // store selected id in the row cache so MRT will pick it up
                                row._valuesCache[cell.column.id] = newValue ? newValue.id : '';
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
                            clearOnEscape
                            fullWidth
                        />
                    );
                },
            },
            {
                accessorKey: 'schedule_type',
                header: 'Schedule Type',
                size: 130,
                editVariant: 'select',
                editSelectOptions: scheduleTypes
                    .filter(type => type !== 'one_time')
                    .map(type => ({ value: type, label: type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) })),
                muiEditTextFieldProps: {
                    select: true,
                    required: true,
                    error: !!validationErrors?.schedule_type,
                    helperText: validationErrors?.schedule_type,
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

                    console.log('Task Type Value:', value);  // Debug log
                    return (
                        <Box
                            sx={{
                                display: 'inline-block',
                                px: 1.5,
                                py: 0.5,
                                borderRadius: 1,
                                bgcolor: palette.taskType?.[value] || palette.grey[500],
                                color: 'white',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                textAlign: 'center',
                                textTransform: 'capitalize',
                                borderRadius: 10,
                            }}
                        >
                            {value}
                        </Box>
                    )
                },
            },
            {
                id: 'assigned_to',
                accessorKey: teamMembers && teamMembers.length > 0 ? 'assigned_to' : 'assigned_to_name',
                header: 'Assigned To',
                size: 150,
                enableEditing: teamMembers && teamMembers.length > 0,
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
                        })
                },
                Cell: ({ row }) => {
                    // if teamMembers is empty, show assigned_to_name  directly
                    if (!teamMembers || teamMembers.length === 0) {
                        return row.original.assigned_to_name || '-';
                    }
                    // Otherwise, find the member name from teamMembers
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
                accessorKey: 'update_inventory',
                header: 'Qty',
                size: 130,
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
                                input: { 'aria-label': 'update inventory' },
                            }}
                        />
                    );
                },
            }
        ],
        [validationErrors, properties, inventoryItems, teamMembers, taskTypes, scheduleTypes, statusOpts, palette, fetchInventoryByProperty, inventoryOptionsMap]
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
            const res = await createTask(values)
            showSnackbar(res.message || 'Task created successfully', 'success')
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
            const res = await updateTaskPlannerData(row.original.id, values)
            showSnackbar(res.message || 'Task updated successfully', 'success')
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
    const handleDelete = async () => {
        if (!taskToDelete) return;

        try {
            const res = await deleteRecurringTask(taskToDelete.id);
            showSnackbar(res.message || 'Task deleted successfully', 'success');
            setOpenConfirm(false);
            setTaskToDelete(null);
        } catch (error) {
            showSnackbar(error.message || 'Failed to delete task', 'error');
            console.error('Error deleting task:', error);
        }
    };

    return (
        <React.Fragment>
            <Box>
                <MaterialReactTable
                    columns={columns}
                    data={allTasksData?.recurring_tasks || []}
                    state={{
                        isLoading: loading,
                    }}
                    editDisplayMode="row"
                    createDisplayMode="row"
                    enableEditing
                    enableRowActions
                    positionActionsColumn="last"

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
                                    onClick={() => {
                                        setTaskToDelete(row.original);
                                        setOpenConfirm(true);
                                    }}
                                    size="small"
                                    sx={{ color: palette.secondary.main }}
                                >
                                    <Delete fontSize="small" />
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
                                borderRadius: 10,
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
                    muiTablePaperProps={{
                        elevation: 0,
                        sx: {
                            border: `1px solid ${palette.divider}`,
                            boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.13)',
                        },
                    }}
                    muiTableHeadCellProps={{
                        sx: {
                            bgcolor: palette.primary.main,
                            color: '#fff',
                            fontWeight: 600,
                        },
                    }}

                />
            </Box>

            <ConfirmationDialog
                open={openConfirm}
                onCancel={() => setOpenConfirm(false)}
                onDelete={handleDelete}
                title="Delete Task"
                message="Are you sure you want to delete this task? This action cannot be undone."
            />
        </React.Fragment>
    )
}

export default TaskPlanner