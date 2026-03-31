import React, { useEffect, useState, useRef, useCallback } from 'react';
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
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    Tabs,
    Tab,
} from '@mui/material';
import {
    ArrowBack,
    CalendarMonth,
    Assignment,
    MoreVert,
    Edit,
    Delete,
    FileCopy,
    Business,
} from '@mui/icons-material';
import { useTaskData } from './useTaskData';
import { formatSchedule } from '../../../utils/scheduleFormatter';
import { formatDate } from '../../../utils/dateFormat';
import IconLabel from '../../../resuable_components/IconLabel';
import ConfirmationDialog from '../../../dialoge/clients/Confirmation_dialog';
import TileVeiwAddEditGroupTaskDialog from './TileVeiwAddEditGroupTaskDialog';
import { TaskContext } from './TaskManagement';
import AddEditTaskInsideGroup from './AddEditTaskInsideGroup';
import AddExistingTaskInsideGroupTask from './AddExistingTaskInsideGroupTask';
import { useSnackbar } from '../../../resuable_components/Snackbar';
import { useAuth } from '../../../context/AuthContext';
import GroupTasksList from './GroupTasksList';
import GroupOccurrences from './GroupOccurrences';
import TaskProgressbar from '../../../resuable_components/TaskProgressbar';
import { canUpdate, canDelete, RESOURCES } from '../../../utils/permissions';

const GroupTaskDetails = () => {
    const { user } = useAuth();
    
    // Check permissions for task resource
    const canUpdateTask = canUpdate(user?.teamRole, RESOURCES.TASK);
    const canDeleteTask = canDelete(user?.teamRole, RESOURCES.TASK);
    const theme = useTheme();
    const { palette } = theme;
    const navigate = useNavigate();
    const location = useLocation();
    const { showSnackbar } = useSnackbar();
    // Access task data functions from context
    const taskData = useTaskData();
    const {
        fetchGroupTasksByGroupId,
        deleteGroupTask,
        deleteSubTaskInsideGroup,
    } = taskData;

    const [groupTaskData, setGroupTaskData] = useState(null);
    const [pagination, setPagination] = useState({ hasNextPage: false, page: 1 });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedTask, setSelectedTask] = useState(null);
    const [openConfirm, setOpenConfirm] = useState(false);
    const [openInsideGroupTaskDialog, setOpenInsideGroupTaskDialog] = useState(false);
    const [openAddEditGroupTaskDialog, setOpenAddEditGroupTaskDialog] = useState(false);
    const [openAddExistingTaskDialog, setOpenAddExistingTaskDialog] = useState(false);
    const [selectedGroupTaskData, setSelectedGroupTaskData] = useState(null);
    const [activeNameTab, setActiveNameTab] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const observerTarget = useRef(null);
    const isFetchingRef = useRef(false);

    console.log('Current Group Task Data:', groupTaskData);


    const { groupId: paramGroupId } = useParams();
    const groupId = location.state?.groupId || Number(paramGroupId);

    // Initial fetch of group tasks
    useEffect(() => {
        const fetchData = async () => {
            if (!groupId) {
                setError('No group ID provided');
                return;
            }

            try {
                setLoading(true);
                setCurrentPage(1);
                const res = await fetchGroupTasksByGroupId(groupId, 1, 3);

                const { pagination: paginationData, ...groupData } = res.data;
                setGroupTaskData(groupData);
                setPagination({
                    hasNextPage: paginationData?.hasNextPage || false,
                    hasPreviousPage: paginationData?.hasPreviousPage || false,
                    page: paginationData?.page || 1,
                    total: paginationData?.total || 0,
                    totalPages: paginationData?.totalPages || 1,
                });
            } catch (err) {
                console.error('Error fetching group task details:', err);
                setError('Failed to load group task details');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [groupId, fetchGroupTasksByGroupId]);

    // Load more tasks for infinite scroll
    const loadMoreTasks = useCallback(async () => {
        if (!pagination?.hasNextPage || isLoadingMore || loading || isFetchingRef.current) {
            return;
        }

        try {
            isFetchingRef.current = true;
            setIsLoadingMore(true);
            const nextPage = currentPage + 1;

            const res = await fetchGroupTasksByGroupId(groupId, nextPage, 3);
            const { pagination: paginationData, ...groupData } = res.data;

            // Append tasks to existing data
            setGroupTaskData((prev) => ({
                ...groupData,
                tasks: [...(prev?.tasks || []), ...(groupData.tasks || [])],
            }));

            setPagination({
                hasNextPage: paginationData?.hasNextPage || false,
                hasPreviousPage: paginationData?.hasPreviousPage || false,
                page: paginationData?.page || nextPage,
                total: paginationData?.total || 0,
                totalPages: paginationData?.totalPages || 1,
            });

            setCurrentPage(nextPage);
        } catch (error) {
            console.error("Error loading more tasks:", error);
            showSnackbar('Failed to load more tasks', 'error');
        } finally {
            setIsLoadingMore(false);
            isFetchingRef.current = false;
        }
    }, [pagination?.hasNextPage, isLoadingMore, loading, currentPage, fetchGroupTasksByGroupId, groupId, showSnackbar]);

    // Intersection Observer for infinite scroll
    useEffect(() => {
        // Only set up observer for Group Tasks tab
        if (activeNameTab !== 0) {
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && pagination?.hasNextPage && !isLoadingMore && !loading) {
                    loadMoreTasks();
                }
            },
            { threshold: 0.1 }
        );

        const currentTarget = observerTarget.current;
        if (currentTarget) {
            observer.observe(currentTarget);
        }

        return () => {
            if (currentTarget) {
                observer.unobserve(currentTarget);
            }
        };
    }, [activeNameTab, pagination?.hasNextPage, isLoadingMore, loading, loadMoreTasks]);

    const handleBack = () => {
        navigate(user?.role === 'team' ? '/teams/task-management' : '/clients/task-management');
    };

    const handleMenuClick = (event, task, isSubTask = false) => {
        // console.log('Menu clicked for task:', task);
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
                // Refresh data after delete
                const refreshRes = await fetchGroupTasksByGroupId(groupId, 1, 3);
                const { pagination: paginationData, ...groupData } = refreshRes.data;
                setGroupTaskData(groupData);
                setPagination({
                    hasNextPage: paginationData?.hasNextPage || false,
                    hasPreviousPage: paginationData?.hasPreviousPage || false,
                    page: paginationData?.page || 1,
                    total: paginationData?.total || 0,
                    totalPages: paginationData?.totalPages || 1,
                });
                setCurrentPage(1);
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

    const handleCloseGroupTaskDialog = async (shouldRefresh) => {
        setOpenAddEditGroupTaskDialog(false);
        setSelectedTask(null);

        // Refresh the data after edit/duplicate
        if (shouldRefresh) {
            try {
                const res = await fetchGroupTasksByGroupId(groupId, 1, 3);
                const { pagination: paginationData, ...groupData } = res.data;
                setGroupTaskData(groupData);
                setPagination({
                    hasNextPage: paginationData?.hasNextPage || false,
                    hasPreviousPage: paginationData?.hasPreviousPage || false,
                    page: paginationData?.page || 1,
                    total: paginationData?.total || 0,
                    totalPages: paginationData?.totalPages || 1,
                });
                setCurrentPage(1);
            } catch (error) {
                console.error('Error refreshing data:', error);
            }
        }
    };

    const handleCloseInsideGroupTaskDialog = async (shouldRefresh) => {
        setOpenInsideGroupTaskDialog(false);
        setSelectedGroupTaskData(null);

        // Refresh the data if task was added/edited successfully
        if (shouldRefresh) {
            try {
                const res = await fetchGroupTasksByGroupId(groupId, 1, 3);
                const { pagination: paginationData, ...groupData } = res.data;
                setGroupTaskData(groupData);
                setPagination({
                    hasNextPage: paginationData?.hasNextPage || false,
                    hasPreviousPage: paginationData?.hasPreviousPage || false,
                    page: paginationData?.page || 1,
                    total: paginationData?.total || 0,
                    totalPages: paginationData?.totalPages || 1,
                });
                setCurrentPage(1);
            } catch (error) {
                console.error('Error refreshing data:', error);
            }
        }
    };

    const handleCloseAddExistingTaskDialog = async (shouldRefresh) => {
        setOpenAddExistingTaskDialog(false);
        // Refresh the data if tasks were added successfully
        if (shouldRefresh) {
            try {
                const res = await fetchGroupTasksByGroupId(groupId, 1, 3);
                const { pagination: paginationData, ...groupData } = res.data;
                setGroupTaskData(groupData);
                setPagination({
                    hasNextPage: paginationData?.hasNextPage || false,
                    hasPreviousPage: paginationData?.hasPreviousPage || false,
                    page: paginationData?.page || 1,
                    total: paginationData?.total || 0,
                    totalPages: paginationData?.totalPages || 1,
                });
                setCurrentPage(1);
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
                <Button
                    onClick={handleBack} sx={{ mt: 2 }}
                    // add back icon
                    startIcon={<ArrowBack />}
                >
                    Back to Task Management
                </Button>
            </Container>
        );
    }

    // Group scheduleInfo
    const scheduleInfo = formatSchedule(groupTaskData.schedule?.type, groupTaskData.schedule?.recurrence_rule);

    return (
        <>
            <TaskContext.Provider value={taskData}>
                <Container maxWidth="md" disableGutters sx={{ py: 2 }}>
                    {/* Back Button */}
                    <Button
                        startIcon={<ArrowBack />}
                        onClick={handleBack}
                    >
                        Back to Task Management
                    </Button>

                    <Card
                        elevation={0}
                        disableGutters
                        sx={{
                            bgcolor: palette.background.default,
                            position: 'relative',
                        }}
                    >
                        <CardHeader
                            sx={{ px: 1, pt: 0, pb: 0 }}
                            title={
                                <Typography variant="body1" sx={{ textTransform: 'capitalize', fontWeight: 'bold', fontSize: '1.2rem' }} gutterBottom>
                                    {groupTaskData.name}
                                </Typography>
                            }

                            action={(canUpdateTask || canDeleteTask) ? (
                                <IconButton
                                    aria-label="settings"
                                    onClick={(e) => handleMenuClick(e, groupTaskData)}
                                >
                                    <MoreVert fontSize="medium" />
                                </IconButton>
                            ) : null}
                        />

                        <CardContent sx={{ p: 0, "&:last-child": { p: 1 } }}>

                            {/* Group Details */}
                            <Stack direction="row" flexWrap="wrap" gap={1} >
                                {groupTaskData.property && (
                                    <IconLabel
                                        icon={Business}
                                        label={groupTaskData.property.name}
                                    />
                                )}

                                {groupTaskData.schedule?.start_date && (
                                    <IconLabel
                                        icon={CalendarMonth}
                                        label={`Starts: ${formatDate(groupTaskData.schedule.start_date)}`}
                                    />
                                )}
                                {groupTaskData.schedule?.end_date && (
                                    <IconLabel
                                        icon={CalendarMonth}
                                        label={`Ends:  ${formatDate(groupTaskData.schedule.end_date)}`}
                                    />
                                )}

                                {groupTaskData.statistics?.total_tasks > 0 && (
                                    <Chip
                                        icon={<Assignment sx={{ fontSize: 16 }} />}
                                        label={`${groupTaskData.statistics.total_tasks} Task${groupTaskData.statistics.total_tasks !== 1 ? 's' : ''}`}
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

                    <Divider sx={{ mb: 1 }} />

                    {/* Add tabs for "Group tasks" "Occurrences" */}

                    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 1 }}>
                        <Tabs
                            value={activeNameTab}
                            onChange={(e, newValue) => setActiveNameTab(newValue)}
                            aria-label="Group Task Tabs"
                            variant="scrollable"
                            scrollButtons="auto"
                           
                        >
                            <Tab label="Group Tasks" />
                            <Tab label="Occurrences" />
                        </Tabs>
                    </Box>

                    {activeNameTab === 0 && (
                        <GroupTasksList
                            tasks={groupTaskData.tasks}
                            onMenuClick={handleMenuClick}
                            user={user}
                            onAddNewTask={() => {
                                setSelectedGroupTaskData(null);
                                setOpenInsideGroupTaskDialog(true);
                            }}
                            onAddExistingTask={() => setOpenAddExistingTaskDialog(true)}
                        />
                    )}

                    {activeNameTab === 1 && (
                        <GroupOccurrences
                            groupId={groupId}
                            updateTaskOccurrenceStatus={taskData.updateTaskOccurrenceStatus}
                            addConfirmationImageInTask={taskData.addConfirmationImageInTask}
                            updateConfirmationImageInTask={taskData.updateConfirmationImageInTask}
                            completedOccurrences={groupTaskData.statistics?.completed_occurrences || 0}
                            pendingOccurrences={groupTaskData.statistics?.pending_occurrences || 0}
                        />
                    )}

                    {/* Loading More Indicator - Only for Group Tasks Tab */}
                    {activeNameTab === 0 && isLoadingMore && (
                        <Box display="flex" justifyContent="center" py={2}>
                            <CircularProgress size={24} />
                        </Box>
                    )}

                    {/* Observer Target for Infinite Scroll - Only for Group Tasks Tab */}
                    {activeNameTab === 0 && pagination?.hasNextPage && !isLoadingMore && (
                        <Box ref={observerTarget} sx={{ height: 20, visibility: 'hidden' }} />
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
                        groupData={groupTaskData}
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

            </TaskContext.Provider>
        </>
    );
};

export default GroupTaskDetails;