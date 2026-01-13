import React, { useState, useMemo } from 'react'
import { Box, Chip, useTheme, Tooltip, Button, Avatar } from '@mui/material'
import { MaterialReactTable } from 'material-react-table'
import { CameraAlt, AssignmentTurnedIn } from '@mui/icons-material'
import { formatDate } from '../../utils/dateFormat';
import { statusOpts, taskTypesOptions } from '../../constant';
import { useTaskContext } from '../clients/task/TaskManagement';
import { useSnackbar } from '../../resuable_components/Snackbar';
import ViewMoreText from '../../resuable_components/ViewMore';
import ImageViewer from '../../resuable_components/ImageViewer';
import TaskCompletionTabs from '../../dialoge/clients/TaskCompletionTabs';

const ActiveTaskStaff = () => {
    const theme = useTheme();
    const { palette } = theme;
    const { showSnackbar } = useSnackbar();
    const [showcompletionDialog, setShowCompletionDialog] = useState(false);
    const [pendingTask, setPendingTask] = useState(null);
    const [activeNameTab, setActiveNameTab] = useState(0);
    const [selectedImage, setSelectedImage] = useState(null);
    const [openImage, setOpenImage] = useState(false);
    const [markdoneClicked, setMarkdoneClicked] = useState(false);

    const {
        allTasksData,
        loading,
        updateTaskCompletionStatus,
    } = useTaskContext();

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
            Cell: ({ cell }) =>
                <ViewMoreText text={cell.getValue() || '-'} maxLength={20} />
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
            size: 180,
            Cell: ({ row }) => row.original.inventory_name || '-',
        },

        {
            accessorKey: 'scheduled_date',
            header: 'Schedule Date',
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
                        {IconComponent && <IconComponent sx={{ fontSize: 16, mr: 1 }} />}
                        {taskType?.label}
                    </Box>
                )
            },
        },

        {
            accessorKey: 'is_photo_required',
            header: 'Photo',
            size: 120,
            Cell: ({ row }) => {
                if (!row.original.is_photo_required) return '-';

                const hasImages = Array.isArray(row.original.completion_image_urls) && row.original.completion_image_urls.length > 0;

                if (hasImages) {
                    return (
                        <Chip
                            sx={{
                                px: 0.5,
                                height: 30,
                                '& .MuiChip-label': {
                                    p: 0.5,
                                },
                            }}
                            icon={
                                <Tooltip title="Photo Required" placement="top" arrow>
                                    <CameraAlt
                                        sx={{ cursor: row.original.status === 'completed' ? 'default' : 'pointer' }}
                                        onClick={(e) => {
                                            if (row.original.status !== 'completed') {
                                                e.stopPropagation();
                                                setPendingTask(row.original);
                                                setActiveNameTab(0);
                                                setShowCompletionDialog(true);
                                                setMarkdoneClicked(false);
                                            }
                                        }}
                                    />
                                </Tooltip>
                            }
                            label={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, marginLeft: 1 }}>
                                    {row.original.completion_image_urls.map((url, index) => (
                                        <Avatar
                                            key={index}
                                            src={url}
                                            variant="rounded"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedImage(url);
                                                setOpenImage(true);
                                            }}
                                            sx={{
                                                width: 25,
                                                height: 25,
                                                borderRadius: 10,
                                                cursor: 'pointer',
                                                border: `1px solid ${palette.divider}`,
                                                '&:hover': { opacity: 0.8 },
                                            }}
                                        />
                                    ))}
                                </Box>
                            }
                        />
                    );
                }

                return (
                    <Tooltip title="Photo Required" placement="top" arrow>
                        <CameraAlt
                            color="action"
                            sx={{ fontSize: 25, cursor: 'pointer' }}
                            onClick={(e) => {
                                e.stopPropagation();
                                setPendingTask(row.original);
                                setActiveNameTab(0);
                                setShowCompletionDialog(true);
                                setMarkdoneClicked(false);
                            }}
                        />
                    </Tooltip>
                );
            },
        },

        {
            accessorKey: 'update_inventory',
            header: 'Qty',
            size: 100,
            Cell: ({ row }) => {
                if (!row.original.update_inventory) return '-';

                return (
                    <Tooltip title="Inventory Update" placement="top" arrow>
                        <AssignmentTurnedIn
                            color="action"
                            sx={{ fontSize: 22, cursor: row.original.status === 'completed' ? 'default' : 'pointer' }}
                            onClick={(e) => {
                                if (row.original.status !== 'completed') {
                                    e.stopPropagation();
                                    setPendingTask(row.original);
                                    setActiveNameTab(row.original.is_photo_required ? 1 : 0);
                                    setShowCompletionDialog(true);
                                    setMarkdoneClicked(false);
                                }
                            }}
                        />
                    </Tooltip>
                );
            },
        },

        {
            accessorKey: 'status',
            header: 'Status',
            size: 130,
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
                        }}
                    >
                        {statusOpts.find(s => s.value === value)?.label || value}
                    </Box>
                )
            },
        },

    ], [palette]);

    const handleCompletionDialogClose = async (success) => {
        setShowCompletionDialog(false);
        setPendingTask(null);
        setActiveNameTab(0);
        setMarkdoneClicked(false);
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
                    enableEditing={false}
                    enableRowActions
                    positionActionsColumn="last"
                    displayColumnDefOptions={{
                        'mrt-row-actions': {
                            header: 'Actions',
                            size: 130,
                        },
                    }}
                    renderRowActions={({ row }) => (
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginRight: 2 }}>
                            <Button
                                variant="contained"
                                size="small"
                                disableElevation
                                disabled={row.original.status === 'completed'}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setPendingTask(row.original);
                                    setActiveNameTab(0);
                                    setShowCompletionDialog(true);
                                    setMarkdoneClicked(true);
                                }}
                                sx={{
                                    textTransform: 'none',
                                    height: 25,
                                    borderRadius: 10,
                                    fontSize: '0.75rem',
                                    bgcolor: palette.primary.main,
                                    '&:hover': {
                                        bgcolor: palette.secondary.main,
                                    },
                                }}
                            >
                                Mark Done
                            </Button>
                        </Box>
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

            <ImageViewer
                open={openImage}
                onClose={() => setOpenImage(false)}
                image={selectedImage}
            />

            <TaskCompletionTabs
                open={showcompletionDialog}
                onClose={handleCompletionDialogClose}
                task={pendingTask}
                updateTaskCompletionStatus={updateTaskCompletionStatus}
                activeTab={activeNameTab}
                markdoneClicked={markdoneClicked}
            />
        </React.Fragment>
    )
}

export default ActiveTaskStaff