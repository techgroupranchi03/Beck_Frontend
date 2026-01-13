import React, { useEffect, useMemo, useState } from 'react'
import { Box, IconButton, Tooltip, Button, useTheme, MenuItem, Checkbox, Autocomplete, TextField, Typography, MenuList, ListItem, ListItemIcon } from '@mui/material'
import { MaterialReactTable, createRow } from 'material-react-table'
import { Delete, Edit as EditIcon, FileCopy } from '@mui/icons-material'
import { useSnackbar } from '../../../resuable_components/Snackbar'
import { taskTypes, scheduleTypes, statusOpts, daysOfWeek, monthsOfYear, datesOfMonth, taskTypesOptions } from '../../../constant'
import { formatDate } from '../../../utils/dateFormat'
import { useTaskContext } from './TaskManagement'
import ViewMoreText from "../../../resuable_components/ViewMore.jsx";
import ConfirmationDialog from '../../../dialoge/clients/Confirmation_dialog.jsx'
import { formatSchedule } from '../../../utils/scheduleFormatter.js'

const TaskPlanner = () => {
    const theme = useTheme()
    const { palette } = theme
    const { showSnackbar } = useSnackbar();
    const [openConfirm, setOpenConfirm] = useState(false);
    const [taskToDelete, setTaskToDelete] = useState(null);
    const [validationErrors, setValidationErrors] = useState({});
    const [inventoryOptionsMap, setInventoryOptionsMap] = useState({});
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 6,
    });

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
        allTaskPagination,
        fetchAllTasks
    } = useTaskContext();

    console.log("allTaskData:", allTasksData);


    // handle pagination change
    useEffect(() => {
        const page = pagination.pageIndex + 1;
        fetchAllTasks({}, "", page);
    }, [pagination.pageIndex]);


    const columns = useMemo(() => [

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
            Cell: ({ row }) => {
                const property = properties.find(p => p.id === row.original.property_id);
                return property ? property.name : '-';
            },
            Edit: ({ row, cell }) => {
                return (
                    <Autocomplete
                        size="small"
                        options={properties}
                        getOptionLabel={(option) => option.name ? String(option.name) : ''}
                        value={properties.find((prop) => prop.id === cell.getValue()) || null}
                        renderOption={(props, option) => (
                            <li {...props} key={option.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{option.name}</span>
                                {(option.image_url) && (
                                    <img
                                        src={option.image_url}
                                        alt={option.name || ''}
                                        style={{ width: 30, height: 30, objectFit: 'cover', borderRadius: 100, marginLeft: 8 }}
                                    />
                                )}
                            </li>
                        )}
                        onChange={(_, newValue) => {
                            const value = newValue ? newValue.id : '';
                            row._valuesCache[cell.column.id] = value;
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
                        }}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Select Property"
                                required
                                error={!!validationErrors.property_id}
                                helperText={validationErrors.property_id}
                                onFocus={() =>
                                    setValidationErrors({
                                        ...validationErrors,
                                        property_id: undefined,
                                    })
                                }
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
            accessorKey: 'inventory_id',
            header: 'Inventory',
            size: 200,
            Cell: ({ row }) => row.original.inventory_name || '-',
            Edit: ({ row, cell }) => {
                const rowKey = row.id;
                const options = inventoryOptionsMap[rowKey] || inventoryItems || [];
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
                            row._valuesCache[cell.column.id] = newValue ? newValue.id : '';
                            if (newValue && newValue.property_id) {
                                row._valuesCache['property_id'] = newValue.property_id;
                            }
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
            editSelectOptions: taskTypesOptions.map(type => ({ value: type.value, label: type.label })),
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
                        const taskType = taskTypesOptions.find(t => t.value === selected);
                        if (taskType) {
                            const IconComponent = taskType.icon;
                            return (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    {IconComponent && <IconComponent sx={{ fontSize: 16 }} />}
                                    {taskType.label}
                                </Box>
                            );
                        }
                        return selected;
                    },
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
                            {IconComponent && <IconComponent sx={{ fontSize: 16, mr: 1 }} />}
                            {type.label}
                        </MenuItem>
                    );
                }),
            },
            Cell: ({ cell }) => {
                const value = cell.getValue()
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
                        {taskType?.label}
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

        [validationErrors, properties, inventoryItems, teamMembers, taskTypesOptions, scheduleTypes, statusOpts, palette, fetchInventoryByProperty, inventoryOptionsMap]

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

    const handleCreateTask = async ({ values, table }) => {
        try {
            const res = await createTask(values)
            showSnackbar(res.message, 'success')
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
            showSnackbar(error.message, 'error')
            console.error('Error creating task:', error)
        }
    }

    const handleSaveTask = async ({ values, table, row }) => {
        try {
            const res = await updateTaskPlannerData(row.original.id, values)
            showSnackbar(res.message, 'success')
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

    const handleDelete = async () => {
        if (!taskToDelete) return;

        try {
            const res = await deleteRecurringTask(taskToDelete.id);
            showSnackbar(res.message, 'success');
            setOpenConfirm(false);
            setTaskToDelete(null);
        } catch (error) {
            showSnackbar(error.message, 'error');
            console.error('Error deleting task:', error);
        }
    };

    return (

        <React.Fragment>

            <Box>

                <MaterialReactTable
                    columns={columns}
                    data={allTasksData?.recurring_tasks || []}
                    rowCount={allTaskPagination?.total || 0}
                    state={{
                        isLoading: loading,
                        pagination: pagination,
                    }}
                    onPaginationChange={setPagination}
                    manualPagination
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
                            <Tooltip title="Edit" placement="top" arrow>
                                <IconButton
                                    onClick={() => table.setEditingRow(row)}
                                    size="small"
                                    sx={{ color: palette.primary.main }}
                                >
                                    <EditIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete" placement="top" arrow>
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
                            <Tooltip title="Duplicate Task" placement="top" arrow>
                                <IconButton
                                    onClick={() => {
                                        const duplicatedData = { ...row.original };
                                        delete duplicatedData.id; 
                                        const newCreatingRow = createRow(table, duplicatedData);
                                        table.setCreatingRow(newCreatingRow);
                                    }}
                                    size="small"
                                    sx={{ color: palette.primary.light }}
                                >
                                    <FileCopy fontSize="small" />
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