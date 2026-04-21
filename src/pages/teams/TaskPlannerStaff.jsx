import React, { useMemo } from 'react'
import { Box, Typography, useTheme } from '@mui/material'
import { MaterialReactTable } from 'material-react-table'
import { CameraAlt, AssignmentTurnedIn } from '@mui/icons-material'
import { formatDate } from '../../utils/dateFormat'
import { useTaskContext } from '../clients/task/TaskManagement'
import ViewMoreText from '../../resuable_components/ViewMore'
import { formatSchedule } from '../../utils/scheduleFormatter'
import { taskTypesOptions } from '../../constant'

const TaskPlannerStaff = () => {
    const theme = useTheme()
    const { palette } = theme

    const {
        allTasksData,
        loading,
    } = useTaskContext();

    console.log('TaskPlannerStaff rendered with tasks:', allTasksData);

    const columns = useMemo(() => [
        {
            accessorKey: 'title',
            header: 'Title',
            size: 150,
        },

        {
            accessorKey: 'description',
            header: 'Description',
            size: 200,
            Cell: ({ cell }) => (
                <ViewMoreText text={cell.getValue() || '-'} maxCharacter={20} />
            ),
        },

        {
            accessorKey: 'property_name',
            header: 'Property',
            size: 180,
            Cell: ({ row }) => row.original.property_name || '-',
        },

        {
            accessorKey: 'inventory_name',
            header: 'Inventory',
            size: 200,
            Cell: ({ row }) => row.original.inventory_name || '-',
        },

        {
            accessorKey: 'schedule_type',
            header: 'Schedule Type',
            size: 130,
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
        },

        {
            accessorKey: 'start_date',
            header: 'Start Date',
            size: 130,
            Cell: ({ cell }) => formatDate(cell.getValue()),
        },

        {
            accessorKey: 'task_type',
            header: 'Task Type',
            size: 130,
            Cell: ({ cell }) => {
                const value = cell.getValue()
                const taskType = taskTypesOptions.find(t => t.value === value);
                const IconComponent = taskType?.icon;
                return (
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
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
            accessorKey: 'assigned_to_name',
            header: 'Assigned To',
            size: 150,
            Cell: ({ row }) => row.original.assigned_to_name || '-',
        },

        {
            accessorKey: 'is_photo_required',
            header: 'Photo',
            size: 100,
            Cell: ({ row }) => {
                if (!row.original.is_photo_required) return '-';
                return <CameraAlt color="action" sx={{ fontSize: 25 }} />;
            },
        },

        {
            accessorKey: 'update_inventory',
            header: 'Qty',
            size: 100,
            Cell: ({ row }) => {
                if (!row.original.update_inventory) return '-';
                return <AssignmentTurnedIn color="action" sx={{ fontSize: 22 }} />;
            },
        },

    ], [palette]);

    return (
        <React.Fragment>
            <Box>
                <MaterialReactTable
                    columns={columns}
                    data={allTasksData?.recurring_tasks || []}
                    initialState={{
                        isLoading: loading,
                    }}
                    enableEditing={false}
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
        </React.Fragment>
    )
}

export default TaskPlannerStaff