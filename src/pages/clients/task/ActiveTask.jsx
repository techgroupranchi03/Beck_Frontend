import React, { useState, useMemo, useEffect } from 'react'
import { Box, Chip, MenuItem, useTheme, Checkbox, Tooltip, IconButton, Button, Autocomplete, TextField, Icon, Avatar } from '@mui/material'
import { MaterialReactTable } from 'material-react-table'
import { Delete, Edit as EditIcon } from '@mui/icons-material'
import { formatDate } from '../../../utils/dateFormat';
import { statusOpts, taskTypes } from '../../../constant';
import { useTaskContext } from './TaskManagement';
import { useSnackbar } from '../../../resuable_components/Snackbar';
import ViewMoreText from '../../../resuable_components/ViewMore';
import ConfirmationDialog from '../../../dialoge/clients/Confirmation_dialog';
import ImageViewer from '../../../resuable_components/ImageViewer';
import TaskCompletionDialog from '../../../dialoge/clients/TaskCompletionDialog';

const ActiveTask = () => {
  const theme = useTheme();
  const { palette } = theme;
  const { showSnackbar } = useSnackbar();
  const [showcompletionDialog, setShowCompletionDialog] = useState(false);
  const [pendingTask, setPendingTask] = useState(null);

  const {
    allTasksData,
    deleteOneTimeTask,
    loading,
    inventoryItems,
    properties,
    teamMembers,
    createActiveTask,
    updateActiveTaskData,
    fetchInventoryByProperty,
    updateTaskCompletionStatus,
  } = useTaskContext();

  const [validationErrors, setValidationErrors] = useState({});
  const [inventoryOptionsMap, setInventoryOptionsMap] = useState({});
  const [openConfirm, setOpenConfirm] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [openImage, setOpenImage] = useState(false);
  const [tableRef, setTableRef] = useState(null);

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
      Cell: ({ cell }) =>
        <ViewMoreText text={cell.getValue() || '-'} maxLength={20} />
    },

    {
      accessorKey: 'property_id',
      header: 'Property',
      size: 180,
      Cell: ({ row }) => row.original.property_name || '-',
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
      size: 180,
      Cell: ({ row }) => row.original.inventory_name || '-',
      Edit: ({ row, cell }) => {
        const rowKey = row.id;
        const options = inventoryOptionsMap[rowKey] !== undefined ? inventoryOptionsMap[rowKey] : inventoryItems || [];

        useEffect(() => {
          if (inventoryOptionsMap[rowKey] === undefined) {
            const propId = row._valuesCache?.property_id || row.original?.property_id;
            if (propId && fetchInventoryByProperty) {
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
                  <img src={option.property_image_url} alt={option.name || ''} style={{ width: 30, height: 30, objectFit: 'cover', borderRadius: 100, marginLeft: 8 }} />
                )}
              </li>
            )}
            onChange={(_, newValue) => {
              row._valuesCache[cell.column.id] = newValue ? newValue.id : '';
              // Auto-select property based on inventory's property_id
              if (newValue && newValue.property_id) {
                row._valuesCache['property_id'] = newValue.property_id;
              }
            }}
            renderInput={(params) => (
              <TextField {...params} label="Select Inventory" required error={!!validationErrors?.inventory_id} helperText={validationErrors?.inventory_id} />
            )}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            clearOnEscape
            fullWidth
          />
        );
      },
    },

    {
      accessorKey: 'scheduled_date',
      header: 'Schedule Date',
      size: 130,
      muiEditTextFieldProps: ({ row }) => ({
        type: 'date',
        required: true,
        error: !!validationErrors?.scheduled_date,
        helperText: validationErrors?.scheduled_date,
        InputLabelProps: {
          shrink: true,
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
        return (
          <Box
            sx={{
              display: 'inline-block',
              px: 1.5,
              py: 0.6,
              borderRadius: 10,
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
      editSelectOptions: teamMembers && teamMembers.length > 0
        ? teamMembers.map(member => ({ value: member.id, label: member.name }))
        : [],
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
      },
      Cell: ({ row }) => {
        // If teamMembers is empty, show the assigned_to_name directly
        if (!teamMembers || teamMembers.length === 0) {
          return row.original.assigned_to_name || '-';
        }
        // Otherwise, find the member from teamMembers
        const member = teamMembers.find(m => m.id === row.original.assigned_to);
        return member ? member.name : (row.original.assigned_to_name || '-');
      }
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
        return (
          <Box
            sx={{
              display: 'inline-block',
              px: 1.5,
              py: 0.5,
              borderRadius: 10,
              bgcolor: palette.taskStatus?.[value] || palette.grey[500],
              color: 'white',
              fontSize: '0.75rem',
              fontWeight: 600,
              textAlign: 'center',
              textTransform: 'capitalize',
              borderRadius: 10,
            }}
          >
            {statusOpts.find(s => s.value === value)?.label || value}
          </Box>
        )
      },
    },

  ], [validationErrors, inventoryItems, teamMembers, taskTypes, statusOpts, palette, inventoryOptionsMap, fetchInventoryByProperty]);

  const handleCreateTask = async ({ values, table }) => {
    try {
      const res = await createActiveTask(values)
      showSnackbar(res.message, 'success')
      table.setCreatingRow(false)
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
      const res = await updateActiveTaskData(row.original.id, values)
      showSnackbar(res.message, 'success')
      table.setEditingRow(null)
      setValidationErrors({})
    } catch (error) {
      if (error.message === 'Completion photo is required for this task') {
        setPendingTask(row.original);
        setTableRef(table);
        setShowCompletionDialog(true);
        table.setEditingRow(null); // Close editing mode
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
      showSnackbar(error.message, 'error')
      console.error('Error updating task:', error)
    }
  }

  const handleDelete = async () => {
    if (!taskToDelete) return;
    try {
      const res = await deleteOneTimeTask(taskToDelete.id);
      showSnackbar(res.message, 'success');
      setOpenConfirm(false);
      setTaskToDelete(null);
    } catch (error) {
      showSnackbar(error.message, 'error');
      console.error('Error deleting task:', error);
    }
  };

  const handleCompletionDialogClose = () => {
    setShowCompletionDialog(false);
    setPendingTask(null);
  };

  return (

    <React.Fragment>

      <Box>

        <MaterialReactTable
          columns={columns}
          data={allTasksData?.active_tasks || []}
          initialState={{
            isLoading: loading,
          }}
          editDisplayMode="row"
          createDisplayMode="row"
          enableEditing={true}
          positionActionsColumn="last"
          displayColumnDefOptions={{
            'mrt-row-actions': {
              header: 'Actions',
              size: 110,
            },
          }}
          onCreatingRowSave={handleCreateTask}
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
                  size="small"
                  sx={{ color: palette.secondary.main }}
                  onClick={() => {
                    setTaskToDelete(row.original);
                    setOpenConfirm(true);
                  }}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          )}
          renderTopToolbarCustomActions={({ table }) => (
            <Button
              variant='contained'
              disableElevation
              onClick={() => table.setCreatingRow(true)}
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
          enableSorting={true}
          enableDensityToggle={false}
          enableHiding={false}
          muiTablePaperProps={{
            elevation: 4,
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

      <ImageViewer
        open={openImage}
        onClose={() => setOpenImage(false)}
        image={selectedImage}
      />

      <TaskCompletionDialog
        open={showcompletionDialog}
        onClose={handleCompletionDialogClose}
        task={pendingTask}
        updateTaskCompletionStatus={updateTaskCompletionStatus}
      />

    </React.Fragment>
  )
}

export default ActiveTask