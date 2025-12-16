import React, { useState, useMemo } from 'react'
import { Box, Chip, MenuItem, useTheme, Checkbox, Tooltip, IconButton, Button } from '@mui/material'
import { MaterialReactTable } from 'material-react-table'
import { Edit as EditIcon } from '@mui/icons-material'
import { formatDate } from '../../../utils/dateFormat';
import { statusOpts, taskTypes } from '../../../constant';
import { useTaskContext } from './TaskManagement';
import { useSnackbar } from '../../../resuable_components/Snackbar';

const ActiveTask = () => {
  const theme = useTheme();
  const { palette } = theme;
  const { showSnackbar } = useSnackbar();

  // Get data from context
  const {
    activeTasksData,
    loading,
    inventoryItems,
    teamMembers,
    createTask,
    updateActiveTaskData
  } = useTaskContext();

  console.log("Active Tasks Data:", activeTasksData);
  console.log("teamMembers in ActiveTask:", teamMembers);

  const [validationErrors, setValidationErrors] = useState({});

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
      },
      Cell: ({ cell }) => {
        const value = cell.getValue()
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
            }}
          >
            {value}
          </Box>
        )
      },
    },
    //   {
    //   accessorKey: 'assigned_to',
    //   header: 'Assigned To',
    //   size: 150,
    //   editVariant: 'select',
    //   editSelectOptions: teamMembers.map(member => ({ value: member.id, label: member.name })),
    //   muiEditTextFieldProps: {
    //     select: true,
    //     required: true,
    //     error: !!validationErrors?.assigned_to,
    //     helperText: validationErrors?.assigned_to,
    //     SelectProps: {
    //       displayEmpty: true,
    //       renderValue: (selected) => {
    //         if (!selected) {
    //           return <em>Select Team Member</em>;
    //         }
    //         const member = teamMembers.find(m => m.id === selected);
    //         return member ? member.name : selected;
    //       },
    //     },
    //     onFocus: () =>
    //       setValidationErrors({
    //         ...validationErrors,
    //         assigned_to: undefined,
    //       }),
    //   },
    //   Cell: ({ row }) => {
    //     const member = teamMembers.find(m => m.id === row.original.assigned_to);
    //     return member ? member.name : '-';
    //   }
    // },
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
        return (
          <Box
            sx={{
              display: 'inline-block',
              px: 1.5,
              py: 0.5,
              borderRadius: 1,
              bgcolor: palette.taskStatus?.[value] || palette.grey[500],
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
  ], [validationErrors, inventoryItems, teamMembers, taskTypes, statusOpts, palette]);

  // CREATE action
  const handleCreateTask = async ({ values, table }) => {
    try {
      const res = await createTask(null, values)
      showSnackbar(res.message || 'Task created successfully', 'success')
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
      showSnackbar(error.message || 'Failed to create task', 'error')
      console.error('Error creating task:', error)
    }
  }
  // UPDATE action
  const handleSaveTask = async ({ values, table, row }) => {
    try {
      const res = await updateActiveTaskData(row.original.id, values)
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
  return (
    <React.Fragment>
      <Box>
        <MaterialReactTable
          columns={columns}
          data={activeTasksData}
          state={{
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
            </Box>
          )}
          // renderTopToolbarCustomActions={({ table }) => (
          //   <Button
          //     variant='contained'
          //     disableElevation
          //     onClick={() => table.setCreatingRow(true)}
          //     sx={{
          //       bgcolor: palette.primary.main,
          //       "&:hover": { bgcolor: palette.secondary.main },
          //       fontSize: { xs: '0.75rem', sm: '0.875rem' },
          //       px: { xs: 2, sm: 3 }
          //     }}
          //   >
          //     Create New Task
          //   </Button>
          // )}
          enableColumnFilters={false}
          enableSorting={false}
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
    </React.Fragment>
  )
}

export default ActiveTask