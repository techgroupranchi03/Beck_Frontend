import React, { useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

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
    Container,
    CardHeader,
    Divider,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    FormControl,
    Select,
} from '@mui/material';
import {
    ArrowBack,
    Person,
    CalendarMonth,
    MoreVert,
    Edit,
    Delete,
    FileCopy,
    Business,
    CameraAlt,
    AssignmentTurnedIn,
    EventNote,
} from '@mui/icons-material';
import { useTaskData } from './useTaskData';
import { TaskContext } from './TaskManagement';
import { formatSchedule } from '../../../utils/scheduleFormatter';
import { formatDate } from '../../../utils/dateFormat';
import IconLabel from '../../../resuable_components/IconLabel';
import { useAuth } from '../../../context/AuthContext';
import { useSnackbar } from '../../../resuable_components/Snackbar';
import ConfirmationDialog from '../../../dialoge/clients/Confirmation_dialog';
import TileView_AddEdit_Dialog from './TileView_AddEdit_Dialog';
import ImageViewer from '../../../resuable_components/ImageViewer';
import TaskCompletionTabs from '../../../dialoge/clients/TaskCompletionTabs';
import { taskStatusFilter } from '../../../constant';
import { canUpdate, canDelete, RESOURCES } from '../../../utils/permissions';

const TaskDetails = () => {
    const { user } = useAuth();
    const theme = useTheme();
    const { palette } = theme;
    const navigate = useNavigate();
    const location = useLocation();
    const { showSnackbar } = useSnackbar();
    const taskData = useTaskData();
    const { fetchTaskById, deleteTask, updateTask, updateTaskOccurrenceStatus, addConfirmationImageInTask, updateConfirmationImageInTask } = taskData;

    // Check permissions for task resource
    const canUpdateTask = canUpdate(user?.teamRole, RESOURCES.TASK);
    const canDeleteTask = canDelete(user?.teamRole, RESOURCES.TASK);

    const [task, setTask] = useState(null);
    const [occurrences, setOccurrences] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);
    const [openConfirm, setOpenConfirm] = useState(false);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [editTask, setEditTask] = useState(null);
    const [openImage, setOpenImage] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [openCompletionDialog, setOpenCompletionDialog] = useState(false);
    const [pendingTask, setPendingTask] = useState(null);
    const [activeTab, setActiveTab] = useState(0);
    const [selectedTaskOccurrence, setSelectedTaskOccurrence] = useState(null);
    const [occurrencePagination, setOccurrencePagination] = useState(null);

    const { taskId: paramTaskId } = useParams();
    const taskId = location.state?.taskId || Number(paramTaskId);

    console.log('task', task);
    console.log('occurrences', occurrences);

    const fetchDetails = useCallback(async () => {
        if (!taskId) {
            setError('No task ID provided');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const res = await fetchTaskById(taskId);
            setTask(res.data || null);
            setOccurrences(res.task_occurrences || []);
            setOccurrencePagination(res.pagination || null);
        } catch (err) {
            console.error('Error fetching task details:', err);
            setError('Failed to load task details');
        } finally {
            setLoading(false);
        }
    }, [taskId, fetchTaskById]);

    useEffect(() => {
        fetchDetails();
    }, [fetchDetails]);

    const handleBack = () => {
        const basePath = user?.role === 'team' ? '/teams' : '/clients';
        navigate(`${basePath}/task-management`);
    };

    // Menu handlers
    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleEdit = () => {
        setEditTask(task);
        setOpenEditDialog(true);
        handleMenuClose();
    };

    const handleDuplicate = () => {
        setEditTask({ ...task, id: null });
        setOpenEditDialog(true);
        handleMenuClose();
    };

    const handleDelete = () => {
        setOpenConfirm(true);
        handleMenuClose();
    };

    const handleConfirmDelete = async () => {
        try {
            const res = await deleteTask(task.id);
            showSnackbar(res.message || 'Task deleted successfully', 'success');
            handleBack();
        } catch (err) {
            console.error('Error deleting task:', err);
            showSnackbar(err.message || 'Failed to delete task', 'error');
        } finally {
            setOpenConfirm(false);
        }
    };

    const handleCloseEditDialog = async () => {
        setOpenEditDialog(false);
        setEditTask(null);
        // Refresh data after edit/duplicate
        try {
            const res = await fetchTaskById(taskId);
            setTask(res.data || null);
            setOccurrences(res.task_occurrences || []);
            setOccurrencePagination(res.pagination || null);
        } catch (err) {
            console.error('Error refreshing task data:', err);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed':
                return palette.taskStatus?.completed || palette.success.main;
            case 'pending':
                return palette.taskStatus?.pending;
            case 'in_progress':
                return palette.taskStatus?.in_progress || palette.info.main;
            default:
                return palette.grey[500];
        }
    };

    // Stats from occurrences
    const completedCount = occurrences.filter(o => o.status === 'completed').length;
    const pendingCount = occurrences.filter(o => o.status === 'pending').length;
    const totalCount = occurrences.length;
    const realTotal = occurrencePagination?.realTotal || totalCount;

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                <CircularProgress />
            </Box>
        );
    }

    if (error || !task) {
        return (
            <Container maxWidth="md" sx={{ py: 4 }}>
                <Typography color="error">{error || 'Task not found'}</Typography>
                <Button
                    onClick={handleBack}
                    sx={{ mt: 2 }}
                    startIcon={<ArrowBack />}
                >
                    Go Back
                </Button>
            </Container>
        );
    }

    const scheduleInfo = task.schedule
        ? formatSchedule(task.schedule.type, task.schedule.recurrence_rule)
        : null;

    return (
        <TaskContext.Provider value={taskData}>
            <Container maxWidth="md" sx={{ mt: 1, px: 0 }}>

                {/* Back Button */}
                <Button
                    startIcon={<ArrowBack />}
                    onClick={handleBack}
                >
                    Back to Task Management
                </Button>

                {/* Task Header Card */}
                <Card
                    elevation={0}
                    sx={{
                        bgcolor: palette.background.default,
                        position: 'relative',
                    }}
                >
                    <CardHeader
                        sx={{ pb: 0.5, px: 0 }}
                        title={
                            <Typography variant="body1" sx={{ textTransform: 'capitalize', fontWeight: 'bold', fontSize: '1.2rem' }} gutterBottom>
                                {task.title}
                            </Typography>
                        }
                        action={
                            (canUpdateTask || canDeleteTask) ? (
                                <IconButton onClick={handleMenuOpen}>
                                    <MoreVert fontSize="medium" />
                                </IconButton>
                            ) : null
                        }
                    />

                    <CardContent sx={{ pt: 0.5, px: 0 }}>
                        {/* Description */}
                        {task.description && (
                            <Typography variant="body2" color="text.secondary" mb={2} sx={{ textTransform: 'capitalize' }}>
                                {task.description}
                            </Typography>
                        )}

                        {/* Schedule Info */}
                        {scheduleInfo && (
                            <Stack
                                direction="row"
                                gap={1}
                                flexWrap="wrap"
                                alignItems="center"
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
                            </Stack>
                        )}

                        {/* Stats Chips */}
                        {totalCount > 0 && (
                            <Stack direction="row" gap={1} flexWrap="wrap" mb={2}>
                                {/* <Chip
                                    label={`${totalCount} Occurrence${totalCount !== 1 ? 's' : ''}`}
                                    size="small"
                                    sx={{
                                        //info color 
                                        bgcolor: palette.info.main,
                                        color: '#000',
                                        fontWeight: 500,
                                    }}
                                /> */}
                                <Chip
                                    label={`${completedCount} Completed`}
                                    size="small"
                                    sx={{
                                        bgcolor: palette.taskStatus?.completed || palette.success.main,
                                        color: '#000',
                                        fontWeight: 500,
                                    }}
                                />
                                <Chip
                                    label={`${pendingCount} Pending`}
                                    size="small"
                                    sx={{
                                        bgcolor: palette.taskStatus?.pending || palette.warning.main,
                                        color: '#000',
                                        fontWeight: 500,
                                    }}
                                />
                            </Stack>
                        )}

                        {/* Task Details Labels */}
                        <Stack direction="row" flexWrap="wrap" gap={1} mt={1}>
                            <IconLabel
                                icon={Person}
                                label={task.assigned_to?.name || 'Myself'}
                            />
                            {task.property && (
                                <IconLabel
                                    icon={Business}
                                    label={task.property.name}
                                />
                            )}
                            {task.schedule?.start_date && (
                                <IconLabel
                                    icon={CalendarMonth}
                                    label={`Start: ${formatDate(task.schedule.start_date)}`}
                                />
                            )}
                            {task.schedule?.end_date && (
                                <IconLabel
                                    icon={CalendarMonth}
                                    label={`End: ${formatDate(task.schedule.end_date)}`}
                                />
                            )}
                            {!!task.requires_photo && (
                                <IconLabel
                                    icon={CameraAlt}
                                    label="Photo Required"
                                />
                            )}
                            {!!task.allows_inventory_update && (
                                <IconLabel
                                    icon={AssignmentTurnedIn}
                                    label="Inventory Update"
                                />
                            )}
                            {task.task_group && (
                                <IconLabel
                                    icon={EventNote}
                                    label={`Group: ${task.task_group.name || task.task_group}`}
                                />
                            )}
                        </Stack>
                    </CardContent>
                </Card>

                <Divider sx={{ mb: 2 }} />

                {/* Occurrences Section */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" fontWeight={600}>
                        Task Occurrences
                    </Typography>
                    {realTotal > totalCount && (
                        <Typography variant="body2" color="text.secondary">
                            Showing last {totalCount} of {realTotal}
                        </Typography>
                    )}
                </Box>

                {occurrences.length > 0 ? (
                    <Stack direction="column" gap={2}>
                        {occurrences.map((occ) => (
                            <Card
                                key={occ.id}
                                elevation={0}
                                sx={{
                                    border: `1px solid ${palette.divider}`,
                                    borderRadius: 2,
                                    bgcolor: occ.status === 'completed'
                                        ? `${palette.success.main}08`
                                        : 'inherit',
                                }}
                            >
                                <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    {/* Row 1: date + edit icon */}
                                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                                        <Typography variant="body1">
                                            {formatDate(occ.scheduled_date)}
                                        </Typography>
                                        <IconButton
                                            onClick={() => {
                                                const taskForCompletion = {
                                                    ...task,
                                                    id: occ.id,
                                                    status: occ.status,
                                                    scheduled_date: occ.scheduled_date,
                                                    is_photo_required: task.requires_photo,
                                                    update_inventory: task.allows_inventory_update,
                                                    inventory_id: task.inventory?.id,
                                                    inventory_name: task.inventory?.name,
                                                    inventory_unit: task.inventory?.unit,
                                                    inventory_quantity: task.inventory?.quantity,
                                                    completion_images: occ.proofs?.file_names || [],
                                                    completion_image_urls: occ.proofs?.file_urls || [],
                                                };
                                                setPendingTask(taskForCompletion);
                                                setActiveTab(0);
                                                setOpenCompletionDialog(true);
                                                setSelectedTaskOccurrence(occ);
                                            }}
                                        >
                                            <Edit fontSize="small" />
                                        </IconButton>
                                    </Stack>
                                    {/* Row 2: images + status */}
                                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                                        {occ.proofs?.file_urls?.length > 0 ? (
                                            <Box sx={{ display: "flex", gap: 2, flexWrap: 'wrap' }}>
                                                {occ.proofs.file_urls.map((url, index) => (
                                                    <Box
                                                        key={index}
                                                        component="img"
                                                        src={url}
                                                        alt={`completion-${index}`}
                                                        onClick={() => {
                                                            setSelectedImage(url);
                                                            setOpenImage(true);
                                                        }}
                                                        sx={{
                                                            width: { xs: 40, sm: 60 },
                                                            height: { xs: 40, sm: 60 },
                                                            borderRadius: 1,
                                                            objectFit: "cover",
                                                            cursor: "pointer",
                                                            border: `1px solid ${palette.divider}`,
                                                        }}
                                                    />
                                                ))}
                                            </Box>
                                        ) : (
                                            <Typography variant="body2" color="text.secondary">
                                                No proof images
                                            </Typography>
                                        )}
                                        <FormControl size='small' sx={{ width: 130 }}>
                                            <Select
                                                value={occ.status}
                                                size="small"
                                                sx={{
                                                    height: 32,
                                                    borderRadius: 2,
                                                    bgcolor: getStatusColor(occ.status),
                                                    color: '#000',
                                                    '& .MuiSelect-icon': {
                                                        color: '#000',
                                                    },
                                                }}
                                                onChange={async (e) => {
                                                    const newStatus = e.target.value;
                                                    try {
                                                        const res = await updateTaskOccurrenceStatus(occ.id, newStatus);
                                                        showSnackbar(res.message, 'success');
                                                        setOccurrences((prev) =>
                                                            prev.map((o) =>
                                                                o.id === occ.id ? { ...o, status: newStatus } : o
                                                            )
                                                        );
                                                    } catch (err) {
                                                        console.error('Error updating task occurrence status:', err);
                                                        showSnackbar(err.message, 'error');
                                                    }
                                                }}
                                            >
                                                {taskStatusFilter.map((statusOption) => (
                                                    <MenuItem key={statusOption.value} value={statusOption.value}>
                                                        {statusOption.label}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Stack>
                                </CardContent>
                            </Card>
                        ))}
                    </Stack>
                ) : (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="body2" color="text.secondary">
                            No occurrences found for this task.
                        </Typography>
                    </Box>
                )}
            </Container>

            {/* Action Menu */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                PaperProps={{
                    elevation: 1,
                    sx: {
                        borderRadius: 1,
                        overflow: 'visible',
                        mt: 1,
                        '&::before': {
                            content: '""',
                            display: 'block',
                            position: 'absolute',
                            top: 0,
                            right: 12,
                            width: 12,
                            height: 12,
                            bgcolor: palette.background.paper,
                            transform: 'translateY(-50%) rotate(45deg)',
                            zIndex: 0,
                            boxShadow: palette.mode === 'light'
                                ? '0px -1px 1px rgba(0,0,0,0.1)'
                                : '0px -1px 1px rgba(255,255,255,0.1)',
                        },
                    },
                }}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <MenuItem onClick={handleEdit} dense>
                    <ListItemIcon>
                        <Edit fontSize="small" sx={{ color: palette.secondary.main }} />
                    </ListItemIcon>
                    <ListItemText>Edit</ListItemText>
                </MenuItem>
                <MenuItem onClick={handleDelete} dense>
                    <ListItemIcon>
                        <Delete fontSize="small" sx={{ color: palette.secondary.main }} />
                    </ListItemIcon>
                    <ListItemText>Delete</ListItemText>
                </MenuItem>
                <MenuItem onClick={handleDuplicate} dense>
                    <ListItemIcon>
                        <FileCopy fontSize="small" sx={{ color: palette.secondary.main }} />
                    </ListItemIcon>
                    <ListItemText>Duplicate Task</ListItemText>
                </MenuItem>
            </Menu>

            {/* Confirmation Dialog for Delete */}
            <ConfirmationDialog
                open={openConfirm}
                onCancel={() => setOpenConfirm(false)}
                onDelete={handleConfirmDelete}
                title="Delete Task"
                message="Are you sure you want to delete this task? This action cannot be undone."
            />

            {/* Edit / Duplicate Task Dialog */}
            {openEditDialog && (
                <TileView_AddEdit_Dialog
                    open={openEditDialog}
                    onClose={handleCloseEditDialog}
                    task={editTask}
                />
            )}

            {/* Image Viewer */}
            <ImageViewer
                open={openImage}
                onClose={() => setOpenImage(false)}
                image={selectedImage}
            />

            <TaskCompletionTabs
                open={openCompletionDialog}
                onClose={async (success) => {
                    setOpenCompletionDialog(false);
                    setPendingTask(null);
                    setActiveTab(0);

                    if (success) {
                        // Refresh task data after successful completion
                        try {
                            const res = await fetchTaskById(taskId);
                            setTask(res.data || null);
                            setOccurrences(res.task_occurrences || []);
                        } catch (err) {
                            console.error('Error refreshing task data:', err);
                        }
                    }
                }}
                task={pendingTask}
                addConfirmationImageInTask={addConfirmationImageInTask}
                updateConfirmationImageInTask={updateConfirmationImageInTask}
                taskOccurrence={selectedTaskOccurrence}
                activeTab={activeTab}
            />

        </TaskContext.Provider>
    );
};

export default TaskDetails;