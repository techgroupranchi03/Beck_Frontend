import React, { useEffect, useState } from 'react'
import { Box, Checkbox, Chip, Container, MenuItem, useTheme } from '@mui/material'
import { MaterialReactTable } from 'material-react-table'
import { getClientActiveTasks, updateClientActiveTaskStatus } from '../../../service/Clients/Task';
import { formatDate } from '../../../utils/dateFormat';
import { statusOpts } from '../../../constant';

const ActiveTask = () => {
  const theme = useTheme();
  const { palette } = theme;
  const [TasksData, setTasksData] = useState([]);


  const fetchActiveTasks = async () => {
    try {
      // Replace with your API call to fetch active tasks
      const res = await getClientActiveTasks();
      setTasksData(res.data);
    } catch (error) {
      console.error('Error fetching active tasks:', error);
    }
  };

  useEffect(() => {
    fetchActiveTasks();
  }, []);

  // Handle status update
  const handleSaveStatus = async ({ row, table }) => {
    try {
      const taskInstanceId = row.original.id;
      const newStatus = row._valuesCache.status;

      await updateClientActiveTaskStatus(taskInstanceId, newStatus);

      // Update local state
      setTasksData((prevData) =>
        prevData.map((task) =>
          task.id === taskInstanceId ? { ...task, status: newStatus } : task
        )
      );

      table.setEditingCell(null); // Exit editing mode
    } catch (error) {
      console.error('Error updating task status:', error);
      // Optionally show error message to user
    }
  };

  const columns = [
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
      header: 'Priority',
      enableEditing: false,
    },
    {
      accessorKey: 'inventory_name',
      header: 'Inventory',
      enableEditing: false,
    },
    {
      accessorKey: 'scheduled_date',
      header: 'Schedule Date',
      enableEditing: false,
      Cell: ({ cell }) => formatDate(cell.getValue()),
    },
    {
      accessorKey: 'scheduled_day',
      header: 'Schedule Day',
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
            {value}
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
      // need checkbox
      Cell: ({ row }) => (
        <Chip
          label={row.original.is_photo_required ? 'Yes' : 'No'}
          color={row.original.is_photo_required ? 'success' : 'default'}
          size="small"
          sx={{width: '60px' , fontSize: '0.75rem' }}
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
  ];
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
          data={TasksData} // Use fetched data here
          enableColumnFilters={false}
          enableSorting={false}
          enableDensityToggle={false}
          enableHiding={false}
          enableEditing={true}
          editDisplayMode="cell"
          muiEditTextFieldProps={({ cell }) => ({
            onBlur: (event) => {
              handleSaveStatus({ row: cell.row, column: cell.column, table: cell.getContext().table });
            },
          })}
        />
      </Container>
    </React.Fragment>
  )
}

export default ActiveTask