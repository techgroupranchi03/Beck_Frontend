import React, { useEffect, useMemo, useState, useRef, useCallback } from "react";
import {
    Box,
    Container,
    Typography,
    Card,
    CardContent,
    Grid,
    Chip,
    IconButton,
    Stack,
    useTheme,
    Avatar,
    Divider,
    Tooltip,
    CardHeader,
    TextField,
    CircularProgress,
    Button,
} from "@mui/material";
import {
    Business,
    CalendarMonth,
    FilterList,
    Search,
    Clear,
    SearchOff,
    InventoryOutlined,
    Task,
    Close,
    AssignmentTurnedIn,
    CameraAlt
} from "@mui/icons-material";
import ViewMoreText from "../../resuable_components/ViewMore.jsx";
import ImageViewer from "../../resuable_components/ImageViewer.jsx";
import TaskFilter from "../clients/task/TaskFilter";
import TaskCompletionTabs from "../../dialoge/clients/TaskCompletionTabs.jsx";
import { useTaskContext } from "../clients/task/TaskManagement.jsx";
import { useSnackbar } from "../../resuable_components/Snackbar";
import { formatDate } from "../../utils/dateFormat.js";
import { useLocation } from "react-router-dom";
import CardSkeleton from "../../resuable_components/CardSkeleton.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import IconLabel from "../../resuable_components/IconLabel.jsx";
import { taskStatusFilter } from "../../constant.js";
import { formatSchedule } from "../../utils/scheduleFormatter.js";
import { useViewMode } from "../../context/ViewModeContext.jsx";
import { GroupTaskCard } from "../clients/task/GroupTaskCard.jsx";

const TileViewTaskStaff = () => {
    const theme = useTheme();
    const { palette } = theme;
    const { showSnackbar } = useSnackbar();
    const observerTarget = useRef(null);
    const { user } = useAuth();
    const location = useLocation();
    const { viewMode } = useViewMode();
    const [openImage, setOpenImage] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [showCompletionDialog, setShowCompletionDialog] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [isSearchVisible, setIsSearchVisible] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [isFilterVisible, setIsFilterVisible] = useState(false);
    const [filters, setFilters] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [activeNameTab, setActiveNameTab] = useState("");
    const [markdoneClicked, setMarkdoneClicked] = useState(false);
    const isFetchingRef = useRef(false);

    const {
        allTasksData,
        loading,
        fetchAllTasks,
        allTaskPagination,
        teamMembers,
        properties,
        updateTaskCompletionStatus
    } = useTaskContext();

    console.log("selectedTask:", selectedTask);

    console.log("allTasksData:", allTasksData);

    useEffect(() => {
        setCurrentPage(1);
    }, [filters, searchText]);

    const tasksToRender = useMemo(() => {
        if (!allTasksData) return [];
        if (Array.isArray(allTasksData)) return allTasksData;
        if (allTasksData && (allTasksData.task_groups || allTasksData.active_tasks || allTasksData.recurring_tasks)) {
            const combined = [
                ...(allTasksData.task_groups || []),
                ...(allTasksData.active_tasks || []),
                ...(allTasksData.recurring_tasks || [])
            ];
            return combined;
        }
        return [];
    }, [allTasksData]);


    const loadMoreTasks = useCallback(async () => {
        if (!allTaskPagination?.hasNextPage || isLoadingMore || loading || isFetchingRef.current) return;

        isFetchingRef.current = true;
        setIsLoadingMore(true);
        const nextPage = currentPage + 1;
        try {
            await fetchAllTasks(filters, searchText, nextPage, true);
            setCurrentPage(nextPage);
        } catch (error) {
            console.error("Error loading more tasks:", error);
        } finally {
            setIsLoadingMore(false);
            isFetchingRef.current = false;
        }
    }, [allTaskPagination, isLoadingMore, loading, currentPage, fetchAllTasks, filters, searchText]);

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && allTaskPagination?.hasNextPage && !isLoadingMore && !loading && !isFetchingRef.current) {
                loadMoreTasks();
            }
        }, {
            threshold: 0.1,
            rootMargin: '50px',
        });

        const currentTarget = observerTarget.current;
        if (currentTarget && !loading && !isLoadingMore && tasksToRender.length > 0 && allTaskPagination?.hasNextPage) {
            observer.observe(currentTarget);
        }

        return () => {
            if (currentTarget) {
                observer.unobserve(currentTarget);
            }
            observer.disconnect();
        };
    }, [allTaskPagination?.hasNextPage, isLoadingMore, loading, tasksToRender.length, loadMoreTasks]);

    const handleFilterToggle = () => {
        setIsFilterVisible((prev) => !prev);
    };

    const handleApplyFilters = async (appliedFilters) => {
        if (isFetchingRef.current) return;

        isFetchingRef.current = true;
        setFilters(appliedFilters);
        setCurrentPage(1);
        try {
            await fetchAllTasks(appliedFilters, searchText);
        } catch (error) {
            console.error("Error applying filters:", error);
            showSnackbar("Failed to apply filters", "error");
        } finally {
            isFetchingRef.current = false;
        }
    };

    const handleRemoveFilter = async (filterKey) => {
        const updatedFilters = { ...filters };
        updatedFilters[filterKey] = [];
        await handleApplyFilters(updatedFilters);
    };

    const getFilterLabel = (key, value) => {
        if (!value || (Array.isArray(value) && value.length === 0)) return null;

        switch (key) {
            case 'assigned_to':
                if (Array.isArray(value)) {
                    const names = value.map(id => {
                        const member = teamMembers.find(m => m.id === id);
                        return member ? member.name : null;
                    }).filter(Boolean);
                    return names.length > 0 ? `Assigned: ${names.join(', ')}` : null;
                } else {
                    const member = teamMembers.find(m => m.id === value);
                    return member ? `Assigned: ${member.name}` : null;
                }
            case 'status':
                if (Array.isArray(value)) {
                    const labels = value.map(val => {
                        const status = taskStatusFilter.find(s => s.value === val);
                        return status ? status.label : null;
                    }).filter(Boolean);
                    return labels.length > 0 ? `Status: ${labels.join(', ')}` : null;
                } else {
                    const status = taskStatusFilter.find(s => s.value === value);
                    return status ? `Status: ${status.label}` : null;
                }
            case 'property_id':
                if (Array.isArray(value)) {
                    const names = value.map(id => {
                        const property = properties.find(p => p.id === id);
                        return property ? property.name : null;
                    }).filter(Boolean);
                    return names.length > 0 ? `Property: ${names.join(', ')}` : null;
                } else {
                    const property = properties.find(p => p.id === value);
                    return property ? `Property: ${property.name}` : null;
                }
            default:
                return null;
        }
    };

    useEffect(() => {
        if (location.state?.assignedTo) {
            const navFilters = {
                ...filters,
                assigned_to: location.state.assignedTo,
            };
            handleApplyFilters(navFilters);
            window.history.replaceState({}, document.title);
        }
    }, [location.state?.assignedTo]);

    const handleSearch = async (text) => {
        if (isFetchingRef.current) return;

        isFetchingRef.current = true;
        setSearchText(text);
        setCurrentPage(1);
        try {
            await fetchAllTasks(filters, text);
        } catch (error) {
            console.error("Error searching tasks:", error);
        } finally {
            isFetchingRef.current = false;
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
            setCurrentPage(1);
            await fetchAllTasks(1, filters, searchText);
        }
    };

    return (
        <Container maxWidth={viewMode === 'center' ? 'md' : 'mx'} sx={{ mt: 2, px: viewMode === 'center' ? { xs: 2, sm: 3, md: 4 } : 0 }}>

            <Box display="flex" justifyContent="flex-end" alignItems="center" mb={2}>
                <Stack direction="row" spacing={1}>
                    <IconButton
                        onClick={handleFilterToggle}
                        sx={{
                            bgcolor: Object.keys(filters).some((key) => {
                                const val = filters[key];
                                return Array.isArray(val) ? val.length > 0 : val;
                            })
                                ? palette.secondary.main
                                : "transparent",
                        }}
                    >
                        <FilterList />
                    </IconButton>
                    <IconButton
                        onClick={() => setIsSearchVisible((prev) => !prev)}
                        sx={{
                            bgcolor: isSearchVisible ? palette.secondary.main : "transparent",
                        }}
                    >
                        {isSearchVisible ? <SearchOff /> : <Search />}
                    </IconButton>
                </Stack>
            </Box>

            {Object.keys(filters).some((key) => {
                const val = filters[key];
                return Array.isArray(val) ? val.length > 0 : val;
            }) && (
                    <Stack direction="row" spacing={1} flexWrap="wrap" mb={2} gap={1}>
                        {Object.keys(filters).map((key) => {
                            const label = getFilterLabel(key, filters[key]);
                            if (!label) return null;
                            return (
                                <Chip
                                    key={key}
                                    label={label}
                                    onDelete={() => handleRemoveFilter(key)}
                                    deleteIcon={<Close />}
                                    size="small"
                                    sx={{
                                        bgcolor: palette.custom.cream,
                                        color: palette.text.primary,
                                    }}
                                />
                            );
                        })}
                    </Stack>
                )}

            {isSearchVisible && (
                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Search tasks..."
                    size="small"
                    focused
                    value={searchText}
                    onChange={(e) => handleSearch(e.target.value)}
                    InputProps={{
                        endAdornment: (
                            <IconButton onClick={() => handleSearch("")}>
                                <Clear />
                            </IconButton>
                        ),
                        sx: { paddingRight: 0 },
                    }}
                    sx={{ mb: 2 }}
                />
            )}

            <TaskFilter
                open={isFilterVisible}
                onClose={handleFilterToggle}
                onApplyFilters={handleApplyFilters}
                initialFilters={filters}
            />

            <Divider sx={{ my: 2 }} />

            {!loading && tasksToRender.length === 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                        No tasks found.
                    </Typography>
                </Box>
            )}


            {!loading && tasksToRender.length > 0 && (
                <Grid container spacing={2} key={`task-grid-${tasksToRender.length}-${currentPage}`}>
                    {tasksToRender.map((task) => (
                        <Grid size={viewMode === 'center' ? { xs: 12 } : { xs: 12, sm: 6, md: 4 }} key={`task-${task.id}-${task.is_task_group ? 'group' : 'single'}`}>
                            {task.is_task_group ? (
                                <GroupTaskCard
                                    task={task}
                                    onMenuClick={null}
                                />
                            ) : (
                                <Card
                                    elevation={0}
                                    sx={{
                                        borderRadius: 3,
                                        elevation: 0,
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
                                    />

                                    <CardContent sx={{ pt: 0 }}>
                                        {/* Schedule Information */}
                                        {(() => {
                                            const scheduleInfo = formatSchedule(task.schedule_type, task.repeat_on);
                                            if (!scheduleInfo) return null;

                                            return (
                                                <Stack
                                                    direction="row"
                                                    spacing={1}
                                                    flexWrap="wrap"
                                                    alignItems="center"
                                                    justifyContent="space-between"
                                                    mb={1}
                                                >
                                                    <Stack
                                                        direction="row"
                                                        spacing={0.2}
                                                        alignItems="center"
                                                    >
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
                                                                whiteSpace: 'normal',
                                                                bgcolor: palette.background.customPaper,
                                                                color: palette.text.secondary,
                                                                px: 1,
                                                                borderRadius: 1,
                                                                fontSize: '0.875rem',
                                                            }}
                                                        >
                                                            {scheduleInfo.description}
                                                        </Typography>
                                                    </Stack>

                                                    <Tooltip placement="top" arrow title="Task Status">
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
                                            );
                                        })()}

                                        {!(task.schedule_type === 'weekly' || task.schedule_type === 'monthly' || task.schedule_type === 'yearly') && (
                                            <Stack
                                                spacing={1}
                                                mb={1}
                                                mt={1}
                                                direction="row"
                                                justifyContent="space-between"
                                            >
                                                <IconLabel
                                                    icon={CalendarMonth}
                                                    label={
                                                        task.scheduled_date || task.start_date
                                                            ? formatDate(task.scheduled_date || task.start_date)
                                                            : "N/A"
                                                    }
                                                />

                                                <Tooltip placement="top" arrow title="Task Status">
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
                                        )}

                                        {/* Description */}
                                        <ViewMoreText text={task.description} limit={100} />
                                        <Stack direction="row" flexWrap="wrap" gap={1} mt={1}>
                                            <IconLabel
                                                icon={Task}
                                                label={task.task_type.replace('_', ' ')}
                                            />

                                            {task.scheduled_day && (
                                                <IconLabel
                                                    icon={CalendarMonth}
                                                    label={task.scheduled_day}
                                                />
                                            )}
                                            {task.inventory_name && (
                                                <IconLabel
                                                    icon={InventoryOutlined}
                                                    label={task.inventory_name}
                                                />
                                            )}
                                            {task.property_name && (
                                                <IconLabel
                                                    icon={Business}
                                                    label={task.property_name}
                                                />
                                            )}
                                        </Stack>

                                        <Stack direction="row" spacing={1} mt={0.5} alignItems="center"
                                            justifyContent={task.last_task?.scheduled_date ? "space-between" : "flex-end"}>
                                            {/* Last Executed Date */}
                                            {task.last_task?.scheduled_date && (
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        color: palette.primary.main,
                                                        fontWeight: 600,
                                                    }}
                                                >
                                                    Last Executed On: {formatDate(task.last_task.scheduled_date)}
                                                </Typography>
                                            )}
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
                                                                    cursor: task.is_recurring || task.status === 'completed' ? 'default' : 'pointer'
                                                                }}
                                                                onClick={(e) => {
                                                                    if (!task.is_recurring && task.status !== 'completed') {
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
                                                            sx={{ fontSize: 25, cursor: task.is_recurring ? 'default' : 'pointer' }}
                                                            onClick={(e) => {
                                                                !task.is_recurring
                                                                    ? (e.stopPropagation(),
                                                                        handleTaskClick(task, 0))
                                                                    : undefined;
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
                                                                cursor: task.is_recurring || task.status === 'completed' ? 'default' : 'pointer',
                                                            }}
                                                            onClick={
                                                                !task.is_recurring && task.status !== 'completed'
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
                                        </Stack>


                                    </CardContent>
                                    {/* is_recurring then no need to show Mark Done button */}
                                    {!task.is_recurring && (
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
                            )}
                        </Grid>
                    ))}
                </Grid>
            )}

            {loading && tasksToRender.length === 0 && (
                <Grid container spacing={2}>
                    {Array.from({ length: 6 }).map((_, index) => (
                        <Grid size={viewMode === 'center' ? { xs: 12 } : { xs: 12, sm: 6, md: 4 }} key={`skeleton-${index}`}>
                            <CardSkeleton />
                        </Grid>
                    ))}
                </Grid>
            )}

            {isLoadingMore && (
                <Grid container spacing={2} sx={{ mt: 2 }}>
                    {Array.from({ length: 3 }).map((_, index) => (
                        <Grid size={viewMode === 'center' ? { xs: 12 } : { xs: 12, sm: 6, md: 4 }} key={`skeleton-more-${index}`}>
                            <CardSkeleton />
                        </Grid>
                    ))}
                </Grid>
            )}

            <div ref={observerTarget} style={{ height: '10px', visibility: 'hidden' }}></div>

            {allTaskPagination && tasksToRender.length > 8 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                        Page {allTaskPagination.page} of {allTaskPagination.totalPages}  • Total: {allTaskPagination.total}
                    </Typography>
                </Box>
            )}

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
        </Container>
    );
};

export default TileViewTaskStaff;



