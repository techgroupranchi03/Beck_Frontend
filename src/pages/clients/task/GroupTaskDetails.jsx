import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Chip,
    IconButton,
    Stack,
    CircularProgress,
    useTheme,
    Tooltip,
    Container,
    CardHeader,
    Divider,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    Avatar,
} from '@mui/material';
import {
    ArrowBack,
    Person,
    CalendarMonth,
    Assignment,
    MoreVert,
    Edit,
    Delete,
    FileCopy,
    Task,
    Business,
    Inventory,
    CameraAlt,
    AssignmentTurnedIn,
} from '@mui/icons-material';
import { useTaskData } from './useTaskData';
import { formatSchedule } from '../../../utils/scheduleFormatter';
import { formatDate } from '../../../utils/dateFormat';
import ViewMoreText from '../../../resuable_components/ViewMore';
import IconLabel from '../../../resuable_components/IconLabel';
import ConfirmationDialog from '../../../dialoge/clients/Confirmation_dialog';
import ImageViewer from '../../../resuable_components/ImageViewer';
import TileVeiwAddEditGroupTaskDialog from './TileVeiwAddEditGroupTaskDialog';
import { TaskContext } from './TaskManagement';
import AddEditTaskInsideGroup from './AddEditTaskInsideGroup';
import AddExistingTaskInsideGroupTask from './AddExistingTaskInsideGroupTask';
import { useSnackbar } from '../../../resuable_components/Snackbar';
import { useAuth } from '../../../context/AuthContext';
import TaskCompletionTabs from '../../../dialoge/clients/TaskCompletionTabs';

const GroupTaskDetails = () => {
    const { user } = useAuth();
    const theme = useTheme();
    const { palette } = theme;
    const navigate = useNavigate();
    const location = useLocation();
    const { showSnackbar } = useSnackbar();
    // Access task data functions from context
    const taskData = useTaskData();
    const { fetchGroupTasksByGroupId, deleteGroupTask, deleteSubTaskInsideGroup, updateTaskCompletionStatus } = taskData;
    const [groupTaskData, setGroupTaskData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedTask, setSelectedTask] = useState(null);
    const [openConfirm, setOpenConfirm] = useState(false);
    const [openInsideGroupTaskDialog, setOpenInsideGroupTaskDialog] = useState(false);
    const [openAddEditGroupTaskDialog, setOpenAddEditGroupTaskDialog] = useState(false);
    const [openAddExistingTaskDialog, setOpenAddExistingTaskDialog] = useState(false);
    const [selectedGroupTaskData, setSelectedGroupTaskData] = useState(null);
    const [openImage, setOpenImage] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [showCompletionDialog, setShowCompletionDialog] = useState(false);
    const [activeNameTab, setActiveNameTab] = useState(0);
    const [markdoneClicked, setMarkdoneClicked] = useState(false);


    console.log('groupTaskData:', groupTaskData);
    console.log('user:', user);



    const groupId = location.state?.groupId;

    useEffect(() => {
        const fetchData = async () => {
            if (!groupId) {
                setError('No group ID provided');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const data = await fetchGroupTasksByGroupId(groupId);
                setGroupTaskData(data);
            } catch (err) {
                console.error('Error fetching group task details:', err);
                setError('Failed to load group task details');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [groupId, fetchGroupTasksByGroupId]);

    const handleBack = () => {
        navigate(user?.role === 'team' ? '/teams/task-management' : '/clients/task-management');
    };

    const handleMenuClick = (event, task, isSubTask = false) => {
        console.log('Menu clicked for task:', task);
        setAnchorEl(event.currentTarget);
        if (isSubTask) {
            setSelectedGroupTaskData({ ...task, isSubTask: true });
            setSelectedTask(null);
        } else {
            setSelectedTask(task);
            setSelectedGroupTaskData(null);
        }
    };


    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleEdit = () => {
        if (selectedGroupTaskData?.isSubTask) {
            setOpenInsideGroupTaskDialog(true);
        } else {
            setOpenAddEditGroupTaskDialog(true);
        }
        handleMenuClose();
    };

    const handleDelete = () => {
        setOpenConfirm(true);
        handleMenuClose();
    };

    const handleDuplicate = () => {
        if (selectedGroupTaskData?.isSubTask) {
            setSelectedGroupTaskData({ ...selectedGroupTaskData, id: null });
            setOpenInsideGroupTaskDialog(true);
        } else {
            setSelectedTask({ ...selectedTask, id: null });
            setOpenAddEditGroupTaskDialog(true);
        }
        handleMenuClose();
    };

    const handleCancelDelete = () => {
        setOpenConfirm(false);
        setSelectedTask(null);
        setSelectedGroupTaskData(null);
    };

    const handleDeleteTask = async () => {
        try {
            if (selectedGroupTaskData?.isSubTask) {
                const res = await deleteSubTaskInsideGroup(groupId, selectedGroupTaskData.id);
                showSnackbar(res.message, 'success');
                // Refresh the group task data to reflect the deleted sub-task
                const data = await fetchGroupTasksByGroupId(groupId);
                setGroupTaskData(data);
            } else {
                const res = await deleteGroupTask(selectedTask.id);
                showSnackbar(res.message, 'success');
                navigate('/clients/task-management');
            }
        } catch (error) {
            console.error('Error deleting task:', error);
            // showSnackbar('Failed to delete task', 'error');
        } finally {
            setOpenConfirm(false);
            setSelectedTask(null);
            setSelectedGroupTaskData(null);
        }
    };

    const handleCloseGroupTaskDialog = async () => {
        setOpenAddEditGroupTaskDialog(false);
        setSelectedTask(null);

        // Refresh the data after edit/duplicate
        try {
            const data = await fetchGroupTasksByGroupId(groupId);
            setGroupTaskData(data);
        } catch (error) {
            console.error('Error refreshing data:', error);
        }
    };

    const handleCloseInsideGroupTaskDialog = async () => {
        setOpenInsideGroupTaskDialog(false);
        setSelectedGroupTaskData(null);
        // Refresh the data after edit/duplicate
        try {
            const data = await fetchGroupTasksByGroupId(groupId);
            setGroupTaskData(data);
        } catch (error) {
            console.error('Error refreshing data:', error);
        }
    };

    const handleCloseAddExistingTaskDialog = async (shouldRefresh) => {
        setOpenAddExistingTaskDialog(false);
        // Refresh the data if tasks were added successfully
        if (shouldRefresh) {
            try {
                const data = await fetchGroupTasksByGroupId(groupId);
                setGroupTaskData(data);
            } catch (error) {
                console.error('Error refreshing data:', error);
            }
        }
    };

    const handleTaskClick = (task, tabIndex = 0) => {
        setSelectedTask(task);
        setActiveNameTab(tabIndex);
        setShowCompletionDialog(true);
        setMarkdoneClicked(false);
    };

    const handleCompletionDialogClose = async (success) => {
        setShowCompletionDialog(false);
        setSelectedTask(null);
        setMarkdoneClicked(false);

        if (success) {
            try {
                const data = await fetchGroupTasksByGroupId(groupId);
                setGroupTaskData(data);
            } catch (error) {
                console.error('Error refreshing data:', error);
            }
        }
    };


    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                <CircularProgress />
            </Box>
        );
    }

    if (error || !groupTaskData) {
        return (
            <Container maxWidth="md" sx={{ py: 4 }}>
                <Typography color="error">{error || 'Group task not found'}</Typography>
                <Button onClick={handleBack} sx={{ mt: 2 }}>Go Back</Button>
            </Container>
        );
    }

    const scheduleInfo = formatSchedule(
        groupTaskData.repeat_on?.frequency,
        groupTaskData.repeat_on
    );

    return (
        <>
            <TaskContext.Provider value={taskData}>
                <Container maxWidth="md" sx={{ py: 4 }}>
                    {/* Back Button */}
                    <Button
                        startIcon={<ArrowBack />}
                        onClick={handleBack}
                        sx={{ mb: 2, color: palette.text.primary }}
                    >
                        Back
                    </Button>

                    <Card
                        elevation={0}
                        sx={{
                            bgcolor: palette.background.default,
                            position: 'relative',
                            mb: 3,
                        }}
                    >
                        <CardHeader
                            title={
                                <Typography variant="h5" color="text.primary" fontWeight={600}>
                                    {groupTaskData.title}
                                </Typography>
                            }

                            action={(user?.role !== 'team' || user?.teamRole === 'Property Manager') ? (
                                <IconButton
                                    aria-label="settings"
                                    onClick={(e) => handleMenuClick(e, groupTaskData)}
                                >
                                    <MoreVert fontSize="medium" />
                                </IconButton>
                            ) : null}
                        />

                        <CardContent sx={{ pt: 0.5 }}>
                            {/* Schedule Information */}
                            {scheduleInfo && (
                                <Stack
                                    direction="row"
                                    gap={1}
                                    flexWrap="wrap"
                                    alignItems="center"
                                    justifyContent="space-between"
                                    mb={2}
                                >
                                    <Stack direction="row" gap={0.5} alignItems="center">
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                color: palette.primary.main,
                                            }}
                                        >
                                            <scheduleInfo.icon fontSize="small" />
                                        </Box>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                bgcolor: palette.background.customPaper,
                                                color: palette.text.secondary,
                                                px: 1,
                                                borderRadius: 1,
                                            }}
                                        >
                                            {scheduleInfo.description}
                                        </Typography>
                                    </Stack>

                                    <Chip
                                        label={groupTaskData.status.replace('_', ' ')}
                                        size="small"
                                        sx={{
                                            bgcolor: palette.taskStatus?.[groupTaskData.status] || palette.grey[500],
                                            color: 'white',
                                            px: 1.5,
                                            borderRadius: 5,
                                        }}
                                    />
                                </Stack>
                            )}

                            {/* Description */}
                            <ViewMoreText text={groupTaskData.description} limit={200} />

                            {/* Group Details */}
                            <Stack direction="row" flexWrap="wrap" gap={1} mt={2}>
                                <IconLabel
                                    icon={Person}
                                    label={groupTaskData.assigned_to_name || 'Unassigned'}
                                />

                                {groupTaskData.start_date && (
                                    <IconLabel
                                        icon={CalendarMonth}
                                        label={formatDate(groupTaskData.start_date)}
                                    />
                                )}
                                {groupTaskData.total_tasks > 0 && (
                                    <Chip
                                        icon={<Assignment sx={{ fontSize: 16 }} />}
                                        label={`${groupTaskData.total_tasks || 0} Task${groupTaskData.total_tasks !== 1 ? 's' : ''}`}
                                        size="small"
                                        sx={{
                                            bgcolor: palette.background.customPaper,
                                            color: palette.text.primary,
                                            fontWeight: 500,
                                        }}
                                    />
                                )}
                            </Stack>
                        </CardContent>

                    </Card>

                    <Divider sx={{ mb: 3 }} />

                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                        <Typography variant="h6" fontWeight={600}>
                            Tasks in this Group
                        </Typography>
                        {(user?.role !== 'team' || user?.teamRole === 'Property Manager') && (
                            <Stack direction="row" gap={2} flexWrap="wrap">
                                <Button
                                    variant="contained"
                                    disableElevation
                                    sx={{
                                        bgcolor: palette.primary.main,
                                        '&:hover': { bgcolor: palette.secondary.main },
                                        borderRadius: 10,
                                        height: '32px',
                                        fontSize: '0.75rem',
                                        textTransform: 'none',
                                    }}
                                    onClick={() => {
                                        setSelectedGroupTaskData(null);
                                        setOpenInsideGroupTaskDialog(true);
                                    }}
                                >
                                    Add New Task
                                </Button>
                                <Button
                                    variant="contained"
                                    disableElevation
                                    onClick={() => setOpenAddExistingTaskDialog(true)}
                                    sx={{
                                        bgcolor: palette.secondary.main,
                                        '&:hover': { bgcolor: palette.primary.main },
                                        borderRadius: 10,
                                        height: '32px',
                                        fontSize: '0.75rem',
                                        textTransform: 'none',
                                    }}
                                >
                                    Add Existing Task
                                </Button>
                            </Stack>
                        )}
                    </Stack>

                    {/* Tasks List */}

                    {groupTaskData.tasks && groupTaskData.tasks.length > 0 ? (
                        <Stack spacing={2}>
                            {groupTaskData.tasks.map((task) => (
                                <Card
                                    key={task.id}
                                    elevation={0}
                                    sx={{
                                        borderRadius: 2,
                                        border: `1px solid ${palette.divider}`,
                                        bgcolor: palette.background.paper,
                                    }}
                                >
                                    <CardHeader
                                        sx={{ pb: 0.5 }}
                                        title={
                                            <Typography variant="h6" color="text.primary">
                                                {task.title}
                                            </Typography>
                                        }
                                        action={(user?.role !== 'team' || user?.teamRole === 'Property Manager') ? (
                                            <IconButton
                                                aria-label="settings"
                                                onClick={(e) => handleMenuClick(e, task, true)}
                                            >
                                                <MoreVert fontSize="medium" />
                                            </IconButton>
                                        ) : null}
                                    />

                                    <CardContent sx={{ pt: 0.5 }}>
                                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                            <ViewMoreText text={task.description} limit={150} />
                                            <Tooltip title={`Status: ${task.status}`} placement="top">
                                                <Chip
                                                    label={task.status.replace('_', ' ')}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: palette.taskStatus?.[task.status] || palette.grey[500],
                                                        color: 'white',
                                                        px: 1.5,
                                                        borderRadius: 5,
                                                    }}
                                                />
                                            </Tooltip>
                                        </Stack>
                                        <Stack direction="row" gap={1} mt={1} flexWrap="wrap">
                                            {task.task_type && (
                                                <IconLabel
                                                    icon={Task}
                                                    label={task.task_type.replace('_', ' ')}
                                                />
                                            )}
                                            {task.property_name && (
                                                <IconLabel
                                                    icon={Business}
                                                    label={task.property_name}
                                                />
                                            )}
                                            {task.inventory_name && (
                                                <IconLabel
                                                    icon={Inventory}
                                                    label={task.inventory_name}
                                                />
                                            )}

                                        </Stack>
                                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 1, mt: 1 }}>
                                            {!!task.is_photo_required && task.completion_image_urls && (
                                                <Chip
                                                    sx={{
                                                        px: 0.5,
                                                        height: 30,
                                                        '& .MuiChip-label': {
                                                            p: 0.5,
                                                        },
                                                    }}
                                                    icon={
                                                        <CameraAlt
                                                            sx={{
                                                                cursor: task.is_recurring || task.status === 'completed' || user?.role !== 'team' || user?.teamRole === 'Property Manager' ? 'default' : 'pointer'
                                                            }}
                                                            onClick={(e) => {
                                                                if (!task.is_recurring && task.status !== 'completed' && user?.role === 'team' && user?.teamRole !== 'Property Manager') {
                                                                    e.stopPropagation();
                                                                    handleTaskClick(task, 0);
                                                                }
                                                            }}
                                                        />
                                                    }
                                                    label={
                                                        Array.isArray(task.completion_image_urls) &&
                                                            task.completion_image_urls.length > 0 ? (
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, marginLeft: 1 }}>
                                                                {task.completion_image_urls.map((url, index) => (
                                                                    <Avatar
                                                                        key={index}
                                                                        src={url}
                                                                        variant="rounded"
                                                                        onClick={() => {
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
                                                        ) : null
                                                    }
                                                />
                                            )}

                                            {!!task.is_photo_required && !task.completion_image_urls && (
                                                <Tooltip title="Photo Required" placement="top" arrow>
                                                    <CameraAlt
                                                        color="action"
                                                        sx={{ fontSize: 25, cursor: task.is_recurring || task.status === 'completed' || user?.role !== 'team' || user?.teamRole === 'Property Manager' ? 'default' : 'pointer' }}
                                                        onClick={(e) => {
                                                            if (!task.is_recurring && task.status !== 'completed' && user?.role === 'team' && user?.teamRole !== 'Property Manager') {
                                                                e.stopPropagation();
                                                                handleTaskClick(task, 0);
                                                            }
                                                        }}
                                                    />
                                                </Tooltip>
                                            )}
                                            {!!task.update_inventory && (
                                                <Tooltip title="Inventory Update" placement="top" arrow>
                                                    <AssignmentTurnedIn
                                                        color="action"
                                                        sx={{
                                                            fontSize: 22,
                                                            cursor: task.is_recurring || task.status === 'completed' || user?.role !== 'team' || user?.teamRole === 'Property Manager' ? 'default' : 'pointer',
                                                        }}
                                                        onClick={
                                                            !task.is_recurring && task.status !== 'completed' && user?.role === 'team' && user?.teamRole !== 'Property Manager'
                                                                ? (e) => {
                                                                    e.stopPropagation();
                                                                    handleTaskClick(task, task.is_photo_required ? 1 : 0);
                                                                }
                                                                : undefined
                                                        }
                                                    />
                                                </Tooltip>
                                            )}
                                        </Box>
                                    </CardContent>

                                    {/* Mark Done button for non-recurring tasks */}
                                    {!task.is_recurring && user?.role === 'team' && user?.teamRole !== 'Property Manager' && (
                                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1, pr: 2 }}>
                                            <Button
                                                variant="contained"
                                                size="small"
                                                disableElevation
                                                disabled={task.status === 'completed'}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleTaskClick(task);
                                                    setMarkdoneClicked(true);
                                                }}
                                                sx={{
                                                    textTransform: 'none',
                                                    height: 22,
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

                                </Card>
                            ))}
                        </Stack>
                    ) : (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                            <Typography variant="body2" color="text.secondary">
                                No tasks in this group yet.
                            </Typography>
                        </Box>
                    )}
                </Container>

                {/* Menu for Group Task */}
                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                    PaperProps={{
                        elevation: 1,
                        sx: {
                            borderRadius: 1,
                            overflow: "visible",
                            mt: 1,
                            "&::before": {
                                content: '""',
                                display: "block",
                                position: "absolute",
                                top: 0,
                                right: 12,
                                width: 12,
                                height: 12,
                                bgcolor: palette.background.paper,
                                transform: "translateY(-50%) rotate(45deg)",
                                zIndex: 0,
                                boxShadow: palette.mode === "light"
                                    ? "0px -1px 1px rgba(0,0,0,0.1)"
                                    : "0px -1px 1px rgba(255,255,255,0.1)",
                            },
                        },
                    }}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                    }}
                >
                    <MenuItem onClick={handleEdit} dense>
                        <ListItemIcon>
                            <Edit fontSize="small" sx={{ color: palette.primary.main }} />
                        </ListItemIcon>
                        <ListItemText>Edit</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={handleDelete} dense>
                        <ListItemIcon>
                            <Delete fontSize="small" sx={{ color: palette.primary.main }} />
                        </ListItemIcon>
                        <ListItemText>Delete</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={handleDuplicate} dense>
                        <ListItemIcon>
                            <FileCopy fontSize="small" sx={{ color: palette.primary.main }} />
                        </ListItemIcon>
                        <ListItemText>Duplicate Task</ListItemText>
                    </MenuItem>
                </Menu>

                {/* Confirmation Dialog for Delete */}
                <ConfirmationDialog
                    open={openConfirm}
                    onCancel={handleCancelDelete}
                    onDelete={handleDeleteTask}
                    title={selectedGroupTaskData?.isSubTask ? "Delete Sub-Task" : "Delete Group Task"}
                    message={`Are you sure you want to delete this ${selectedGroupTaskData?.isSubTask ? 'sub task' : 'group task'}? This action cannot be undone.`}
                />

                {/* Add/Edit Group Task Dialog */}
                {openAddEditGroupTaskDialog && (
                    <TileVeiwAddEditGroupTaskDialog
                        open={openAddEditGroupTaskDialog}
                        onClose={handleCloseGroupTaskDialog}
                        task={selectedTask}
                    />
                )}

                {/* open group task dialog */}
                {openInsideGroupTaskDialog && (
                    <AddEditTaskInsideGroup
                        open={openInsideGroupTaskDialog}
                        onClose={handleCloseInsideGroupTaskDialog}
                        task={selectedGroupTaskData}
                        groupTaskId={groupTaskData.id}
                    />
                )}

                {/* Add Existing Task Dialog */}
                {openAddExistingTaskDialog && (
                    <AddExistingTaskInsideGroupTask
                        open={openAddExistingTaskDialog}
                        onClose={handleCloseAddExistingTaskDialog}
                        groupId={groupTaskData.id}
                    />
                )}

                {/* Image Viewer */}
                <ImageViewer
                    open={openImage}
                    onClose={() => setOpenImage(false)}
                    image={selectedImage}
                />

                <TaskCompletionTabs
                    open={showCompletionDialog}
                    onClose={handleCompletionDialogClose}
                    task={selectedTask}
                    updateTaskCompletionStatus={updateTaskCompletionStatus}
                    activeTab={activeNameTab}
                    markdoneClicked={markdoneClicked}
                />
            </TaskContext.Provider>
        </>
    );
};

export default GroupTaskDetails;