import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
    Box,
    Typography,
    Chip,
    Stack,
    useTheme,
    CircularProgress,
    FormControl,
    Select,
    MenuItem,
    IconButton,
} from '@mui/material';
import {
    Edit,
    KeyboardArrowDown,
    KeyboardArrowRight,
    ImageNotSupported,
} from '@mui/icons-material';
import { formatDate } from '../../../utils/dateFormat';
import TaskCompletionTabs from '../../../dialoge/clients/TaskCompletionTabs';
import { taskStatusFilter } from '../../../constant';
import { useSnackbar } from '../../../resuable_components/Snackbar';
import { useTaskData } from './useTaskData';
import ImageViewer from '../../../resuable_components/ImageViewer';
import TaskProgressbar from '../../../resuable_components/TaskProgressbar';

const GroupOccurrences = ({
    groupId,
    updateTaskOccurrenceStatus,
    addConfirmationImageInTask,
    updateConfirmationImageInTask,
    completedOccurrences,
    pendingOccurrences,
}) => {
    const theme = useTheme();
    const { palette } = theme;
    const { showSnackbar } = useSnackbar();
    const taskData = useTaskData();
    const {
        fetchTaskGroupOccurrecesByGroupId,
        fetchTaskOccurrencesByTaskGroupOccurrenceId
    } = taskData;

    const [groupOccurrences, setGroupOccurrences] = useState([]);
    const [loading, setLoading] = useState(false);
    const [openCompletionDialog, setOpenCompletionDialog] = useState(false);
    const [pendingTask, setPendingTask] = useState(null);
    const [selectedTaskOccurrence, setSelectedTaskOccurrence] = useState(null);
    const [activeTab, setActiveTab] = useState(0);
    const [expandedDate, setExpandedDate] = useState(null);
    const [occurrenceTasks, setOccurrenceTasks] = useState({});
    const [loadingTasks, setLoadingTasks] = useState({});
    const [openImage, setOpenImage] = useState(false);
    const [selectedImage, setSelectedImage] = useState('');
    const [pagination, setPagination] = useState({ hasNextPage: false, page: 1 });
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [realTotal, setRealTotal] = useState(0);
    const observerTarget = useRef(null);
    const isFetchingRef = useRef(false);
    const MAX_OCCURRENCES = 30;

    console.log('GroupOccurrences', groupOccurrences);

    // Initial fetch of occurrences
    useEffect(() => {
        const fetchOccurrences = async () => {
            if (!groupId) return;
            try {
                setLoading(true);
                const response = await fetchTaskGroupOccurrecesByGroupId(groupId, 1, 5);
                if (response?.data) {
                    setGroupOccurrences(response.data);
                    setPagination({
                        hasNextPage: response.pagination?.hasNextPage || false,
                        page: response.pagination?.page || 1
                    });
                    setRealTotal(response.pagination?.realTotal || response.pagination?.total || 0);
                    setCurrentPage(1);
                }
            } catch (error) {
                showSnackbar('Failed to fetch occurrences', 'error');
            } finally {
                setLoading(false);
            }
        };
        fetchOccurrences();
    }, [groupId, fetchTaskGroupOccurrecesByGroupId, showSnackbar]);

    // Load more occurrences for infinite scroll
    const loadMoreOccurrences = useCallback(async () => {
        if (!pagination.hasNextPage || isLoadingMore || loading || isFetchingRef.current || groupOccurrences.length >= MAX_OCCURRENCES) {
            return;
        }

        try {
            isFetchingRef.current = true;
            setIsLoadingMore(true);
            const nextPage = currentPage + 1;
            const response = await fetchTaskGroupOccurrecesByGroupId(groupId, nextPage, 5);

            if (response?.data) {
                setGroupOccurrences((prev) => [...prev, ...response.data]);
                setPagination({
                    hasNextPage: response.pagination?.hasNextPage || false,
                    page: response.pagination?.page || nextPage
                });
                setCurrentPage(nextPage);
            }
        } catch (error) {
            showSnackbar('Failed to load more occurrences', 'error');
        } finally {
            setIsLoadingMore(false);
            isFetchingRef.current = false;
        }
    }, [pagination.hasNextPage, isLoadingMore, loading, currentPage, fetchTaskGroupOccurrecesByGroupId, groupId, showSnackbar]);

    // Intersection Observer for infinite scroll
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && pagination.hasNextPage && !isLoadingMore && !loading && groupOccurrences.length < MAX_OCCURRENCES) {
                    loadMoreOccurrences();
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
    }, [pagination.hasNextPage, isLoadingMore, loading, loadMoreOccurrences]);

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed':
                return palette.taskStatus?.completed || palette.success.main;
            case 'pending':
                return palette.taskStatus?.pending || palette.warning.main;
            case 'in_progress':
                return palette.taskStatus?.in_progress || palette.info.main;
            case 'skipped':
                return palette.grey[500];
            default:
                return palette.grey[500];
        }
    };

    const fetchTasksForOccurrence = async (occurrenceId, force = false) => {
        if (!force && occurrenceTasks[occurrenceId]) return;
        try {
            setLoadingTasks((prev) => ({ ...prev, [occurrenceId]: true }));
            const response = await fetchTaskOccurrencesByTaskGroupOccurrenceId(occurrenceId, 1, 10);
            if (response?.data) {
                setOccurrenceTasks((prev) => ({
                    ...prev,
                    [occurrenceId]: response.data
                }));
            }
        } catch (error) {
            showSnackbar('Failed to fetch tasks', 'error');
        } finally {
            setLoadingTasks((prev) => ({ ...prev, [occurrenceId]: false }));
        }
    };

    const toggleDateExpansion = async (occurrenceId) => {
        if (expandedDate === occurrenceId) {
            setExpandedDate(null);
        } else {
            setExpandedDate(occurrenceId);
            await fetchTasksForOccurrence(occurrenceId);
        }
    };

    const handleEditTask = (task) => {
        let completionImages = [];
        try {
            if (task.proofs?.file_name) {
                completionImages = typeof task.proofs.file_name === 'string'
                    ? JSON.parse(task.proofs.file_name)
                    : task.proofs.file_name;
            }
        } catch (e) {
            console.error('Error parsing file_name:', e);
        }

        const taskForCompletion = {
            id: task.id,
            title: task.task?.title,
            status: task.status,
            scheduled_date: task.scheduled_date,
            is_photo_required: task.task?.requires_photo || false,
            update_inventory: task.task?.allows_inventory_update || false,
            inventory_id: task.inventory?.id || null,
            inventory_name: task.inventory?.name || '',
            inventory_unit: task.inventory?.unit || '',
            inventory_quantity: task.inventory?.quantity || '',
            completion_images: completionImages,
            completion_image_urls: task.proofs?.file_urls || [],
        };
        setPendingTask(taskForCompletion);
        setActiveTab(0);
        setOpenCompletionDialog(true);
        setSelectedTaskOccurrence(task);
    };

    if (loading && groupOccurrences.length === 0) {
        return (
            <Box display="flex" justifyContent="center" py={6}>
                <CircularProgress size={24} />
            </Box>
        );
    }

    if (groupOccurrences.length === 0) {
        return (
            <Box textAlign="center" py={6}>
                <Typography color="text.secondary">No occurrences found.</Typography>
            </Box>
        );
    }

    return (
        <>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {groupOccurrences.map((dateOccurrence) => {
                    const date = dateOccurrence.scheduled_date;
                    const occurrenceId = dateOccurrence.id;
                    const tasksForDate = occurrenceTasks[occurrenceId] || [];
                    const isExpanded = expandedDate === occurrenceId;
                    const isLoadingOccurrenceTasks = loadingTasks[occurrenceId];
                    const dateStatus = dateOccurrence.status || 'pending';

                    return (
                        <Box
                            key={occurrenceId}
                            sx={{
                                border: `1px solid ${palette.divider}`,
                                borderRadius: 2,
                                overflow: 'hidden',
                            }}
                        >
                            {/* Date Header - Clickable */}
                            <Box
                                onClick={() => toggleDateExpansion(occurrenceId)}
                                sx={{
                                    pl: 1,
                                    py: 1.5,
                                    cursor: "pointer",
                                    bgcolor: palette.background.paper,
                                    "&:hover": { bgcolor: palette.action.hover },
                                    transition: "background-color 0.2s",
                                }}
                            >
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1.5,
                                        width: "100%",
                                    }}
                                >
                                    {isExpanded ? (
                                        <KeyboardArrowDown
                                            fontSize="small"
                                            sx={{ color: palette.text.secondary }}
                                        />
                                    ) : (
                                        <KeyboardArrowRight
                                            fontSize="small"
                                            sx={{ color: palette.text.secondary }}
                                        />
                                    )}

                                    {/* Date */}
                                    <Typography variant="subtitle2" fontWeight={600} sx={{ width: 90 }} >
                                        {formatDate(date)}
                                    </Typography>

                                    {/* Center Progress */}
                                    <Box sx={{ flex: 1 , display: "flex", justifyContent: "center"}}>
                                        <TaskProgressbar statistics={dateOccurrence.statistics} />
                                    </Box>
                                </Box>
                            </Box>

                            {/* Expanded Tasks - Card Layout */}
                            {isExpanded && (
                                <Box sx={{ borderTop: `1px solid ${palette.divider}` }}>
                                    {/* Loading */}
                                    {isLoadingOccurrenceTasks && (
                                        <Box display="flex" justifyContent="center" py={4}>
                                            <CircularProgress size={20} />
                                        </Box>
                                    )}

                                    {/* Empty */}
                                    {!isLoadingOccurrenceTasks && tasksForDate.length === 0 && (
                                        <Box textAlign="center" py={4}>
                                            <Typography variant="body2" color="text.secondary">
                                                No tasks found for this date
                                            </Typography>
                                        </Box>
                                    )}

                                    {/* Task Cards */}
                                    {!isLoadingOccurrenceTasks && tasksForDate.map((task, taskIndex) => (
                                        <Box
                                            key={task.id}
                                            sx={{
                                                px: 2,
                                                py: 1.5,
                                                borderBottom: taskIndex !== tasksForDate.length - 1
                                                    ? `1px solid ${palette.divider}`
                                                    : 'none',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: 1,
                                            }}
                                        >
                                            {/* Row 1: Title + Edit Button */}
                                            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
                                                <Typography
                                                    variant="body2"
                                                    fontWeight={500}
                                                    color="primary"
                                                    sx={{ wordBreak: 'break-word', flex: 1 }}
                                                >
                                                    {task.task?.title}
                                                </Typography>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleEditTask(task)}
                                                    sx={{ ml: 0.5, flexShrink: 0 }}
                                                >
                                                    <Edit fontSize="small" />
                                                </IconButton>
                                            </Box>

                                            {/* Row 2: Status Dropdown + Photos */}
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                                                <FormControl size="small" sx={{ minWidth: 120 }}>
                                                    <Select
                                                        value={task.status}
                                                        onChange={async (e) => {
                                                            const newStatus = e.target.value;
                                                            try {
                                                                const res = await updateTaskOccurrenceStatus(task.id, newStatus);
                                                                showSnackbar(res.message, 'success');
                                                                setOccurrenceTasks((prev) => ({
                                                                    ...prev,
                                                                    [occurrenceId]: prev[occurrenceId].map((t) =>
                                                                        t.id === task.id ? { ...t, status: newStatus } : t
                                                                    )
                                                                }));
                                                            } catch (err) {
                                                                showSnackbar(err.message || 'Failed to update status', 'error');
                                                            }
                                                        }}
                                                        sx={{
                                                            height: 25,
                                                            fontSize: '0.90rem',
                                                            borderRadius: 4,
                                                            bgcolor: getStatusColor(task.status),
                                                            textTransform: 'capitalize',
                                                        }}
                                                    >
                                                        {taskStatusFilter.map((statusOption) => (
                                                            <MenuItem key={statusOption.value} value={statusOption.value}>
                                                                {statusOption.label}
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                </FormControl>

                                                {/* Photos */}
                                                <Box sx={{ ml: 'auto' }}>
                                                    {task.proofs?.file_urls && task.proofs.file_urls.length > 0 ? (
                                                        <Stack direction="row" spacing={0.5} flexWrap="wrap">
                                                            {task.proofs.file_urls.map((url, index) => (
                                                                <Box
                                                                    key={index}
                                                                    component="img"
                                                                    src={url}
                                                                    alt={`proof-${index}`}
                                                                    onClick={() => {
                                                                        setSelectedImage(url);
                                                                        setOpenImage(true);
                                                                    }}
                                                                    sx={{
                                                                        width: 40,
                                                                        height: 40,
                                                                        borderRadius: 1,
                                                                        objectFit: 'cover',
                                                                        cursor: 'pointer',
                                                                        border: `1px solid ${palette.divider}`,
                                                                        '&:hover': { opacity: 0.8 },
                                                                        transition: 'opacity 0.2s',
                                                                    }}
                                                                />
                                                            ))}
                                                        </Stack>
                                                    ) : (
                                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                            <ImageNotSupported sx={{ fontSize: 14 }} /> No photos
                                                        </Typography>
                                                    )}
                                                </Box>
                                            </Box>
                                        </Box>
                                    ))}
                                </Box>
                            )}
                        </Box>
                    );
                })}
            </Box>

            {/* Loading More Indicator */}
            {isLoadingMore && (
                <Box display="flex" justifyContent="center" py={2}>
                    <CircularProgress size={24} />
                </Box>
            )}

            {/* Observer Target for Infinite Scroll */}
            {pagination.hasNextPage && !isLoadingMore && groupOccurrences.length < MAX_OCCURRENCES && (
                <Box ref={observerTarget} sx={{ height: 20, visibility: 'hidden' }} />
            )}

            {/* Show message when capped at 30 */}
            {realTotal > groupOccurrences.length && groupOccurrences.length >= MAX_OCCURRENCES && (
                <Typography variant="body2" color="text.secondary" textAlign="center" py={1}>
                    Showing last {groupOccurrences.length} of {realTotal} occurrences
                </Typography>
            )}

            {/* Task Completion Dialog */}
            {openCompletionDialog && pendingTask && (
                <TaskCompletionTabs
                    open={openCompletionDialog}
                    onClose={async (success) => {
                        setOpenCompletionDialog(false);
                        setPendingTask(null);
                        setSelectedTaskOccurrence(null);
                        if (success && expandedDate) {
                            await fetchTasksForOccurrence(expandedDate, true);
                        }
                    }}
                    task={pendingTask}
                    addConfirmationImageInTask={addConfirmationImageInTask}
                    updateConfirmationImageInTask={updateConfirmationImageInTask}
                    taskOccurrence={selectedTaskOccurrence}
                    activeTab={activeTab}
                />
            )}

            {/* Image Viewer */}
            <ImageViewer
                open={openImage}
                onClose={() => setOpenImage(false)}
                image={selectedImage}
            />
        </>
    );
};

export default GroupOccurrences;
