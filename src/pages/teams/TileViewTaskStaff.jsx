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

    Tabs,
    Tab,
} from "@mui/material";
import Loader from '../../resuable_components/Loader.jsx';
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
    CameraAlt,
    Person,
    OpenInNew
} from "@mui/icons-material";
import ViewMoreText from "../../resuable_components/ViewMore.jsx";
import ImageViewer from "../../resuable_components/ImageViewer.jsx";
import TaskFilter from "../clients/task/TaskFilter";
import TaskCompletionTabs from "../../dialoge/clients/TaskCompletionTabs.jsx";
import { useTaskContext } from "../clients/task/TaskManagement.jsx";
import { useSnackbar } from "../../resuable_components/Snackbar";
import { formatDate } from "../../utils/dateFormat.js";
import { useLocation, useNavigate } from "react-router-dom";
import CardSkeleton from "../../resuable_components/CardSkeleton.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import IconLabel from "../../resuable_components/IconLabel.jsx";
import { taskStatusFilter } from "../../constant.js";
import { formatSchedule } from "../../utils/scheduleFormatter.js";
import { useViewMode } from "../../context/ViewModeContext.jsx";
import { GroupTaskCard } from "../clients/task/GroupTaskCard.jsx";
import TaskCardSkeleton from "../clients/task/TaskCardSkeleton.jsx";

const TileViewTaskStaff = () => {
    const theme = useTheme();
    const { palette } = theme;
    const { showSnackbar } = useSnackbar();
    const observerTarget = useRef(null);
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
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
    const [taskTypeTab, setTaskTypeTab] = useState(() => {
        const saved = localStorage.getItem('taskTypeTabIndex');
        return saved ? Number(saved) : 0;
    });
    const isFetchingRef = useRef(false);

    const {
        allTasksData,
        loading,
        fetchAllTasks,
        allTaskPagination,
        teamMembers,
        properties,
    } = useTaskContext();

    console.log("selectedTask:", selectedTask);
    console.log("allTasksData:", allTasksData);

    // view details
    const handleViewDetails = (task) => {
        const taskToView = task || selectedTask;
        if (!taskToView) return;
        const basePath = location.pathname.startsWith('/teams') ? '/teams' : '/clients';

        navigate(`${basePath}/task-management/task/${taskToView.id}`);
    };

    useEffect(() => {
        setCurrentPage(1);
    }, [filters, searchText, taskTypeTab]);

    const handleTaskTypeTabChange = (event, newValue) => {
        setTaskTypeTab(newValue);
        localStorage.setItem('taskTypeTabIndex', newValue);
    };

    const tasksToRender = useMemo(() => {
        if (!allTasksData) return [];
        const groupTasks = (allTasksData.group_task || []).map(g => ({ ...g, is_task_group: true }));
        const tasks = allTasksData.tasks || [];
        if (taskTypeTab === 1) return groupTasks;
        if (taskTypeTab === 2) return tasks;
        return [...groupTasks, ...tasks];
    }, [allTasksData, taskTypeTab]);


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

    // const handleTaskClick = (task, tabIndex = 0) => {
    //     setSelectedTask(task);
    //     setActiveNameTab(tabIndex);
    //     setShowCompletionDialog(true);
    //     setMarkdoneClicked(false);
    // };

    // const handleCompletionDialogClose = async (success) => {
    //     setShowCompletionDialog(false);
    //     setSelectedTask(null);
    //     setMarkdoneClicked(false);

    //     if (success) {
    //         setCurrentPage(1);
    //         await fetchAllTasks(1, filters, searchText);
    //     }
    // };

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

            <Tabs
                value={taskTypeTab}
                onChange={handleTaskTypeTabChange}
                sx={{
                    minHeight: 36,
                    '& .MuiTab-root': {
                        textTransform: 'none',
                        minHeight: 36,
                        fontWeight: 600,
                        fontSize: '0.85rem',
                    },
                }}
            >
                <Tab label="All" />
                <Tab label="Group" />
                <Tab label="Individual" />
            </Tabs>

            <Divider sx={{ mb: 2 }} />

            {/* show skeleton when loading intial data  */}
            {loading && tasksToRender.length === 0 && (
                <TaskCardSkeleton count={6} viewMode={viewMode} />
            )}

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
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                    }}
                                >
                                    <CardHeader
                                        sx={{ pb: 0.5 }}
                                        title={
                                            <Typography variant="h6" color="text.primary" sx={{ textTransform: 'capitalize' }} gutterBottom>
                                                {task.title}
                                            </Typography>
                                        }
                                    />

                                    <CardContent sx={{ pt: 0, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                                        {/* Schedule Information */}
                                        {(() => {
                                            const scheduleInfo = formatSchedule(task.schedule?.type, task.schedule?.recurrence_rule);
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
                                                </Stack>
                                            );
                                        })()}

                                        {/* Task Type + Status should not be shown for weekly/monthly/yearly tasks */}
                                        {!(task.schedule?.type === 'weekly' || task.schedule?.type === 'monthly' || task.schedule?.type === 'yearly') && (
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
                                                        task.schedule?.recurrence_rule?.dates?.length
                                                            ? task.schedule.recurrence_rule.dates
                                                                .map((date) => formatDate(date))
                                                                .join(", ")
                                                            : "N/A"
                                                    }
                                                />

                                                {task.status && (
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
                                                )}
                                            </Stack>
                                        )}

                                        {/* Description */}
                                        <ViewMoreText text={task.description} limit={100} />

                                        <Stack direction="row" flexWrap="wrap" gap={1} mt={1}>
                                            <IconLabel
                                                icon={Person}
                                                label={task.assigned_to?.name || '-'}
                                            />

                                            {task.property && (
                                                <IconLabel
                                                    icon={Business}
                                                    label={task.property.name}
                                                />
                                            )}
                                        </Stack>

                                        <Stack direction="row" spacing={1} mt="auto" pt={1} alignItems="center"
                                            justifyContent="space-between"
                                        >
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                {!!task.requires_photo && (
                                                    <Tooltip title="Photo Required" placement="top" arrow>
                                                        <CameraAlt
                                                            color="action"
                                                            sx={{ fontSize: 25 }}
                                                        />
                                                    </Tooltip>
                                                )}
                                                {!!task.allows_inventory_update && (
                                                    <Tooltip title="Inventory Update" placement="top" arrow>
                                                        <AssignmentTurnedIn
                                                            color="action"
                                                            sx={{ fontSize: 22, }}
                                                        />
                                                    </Tooltip>
                                                )}
                                            </Box>

                                            <Box>
                                                <Tooltip placement="top" arrow title="View Details">
                                                    <IconButton
                                                        aria-label="view details"
                                                        onClick={() => handleViewDetails(task)}
                                                    >
                                                        <OpenInNew fontSize="medium" />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        </Stack>

                                        {(task.last_occurrence || task.next_occurrence) && (
                                            <Stack direction="row" spacing={1} sx={{ mt: 0.5, flexWrap: 'wrap' }} alignItems="center">
                                                {task.last_occurrence && (
                                                    <Chip
                                                        label={`Last: ${formatDate(task.last_occurrence.date)}${task.last_occurrence.status === 'completed' || task.last_occurrence.status === 'skipped' ? '' : ' (Pending)'}`}
                                                        size="small"
                                                        variant="outlined"
                                                        color={task.last_occurrence.status === 'completed' ? 'success' : task.last_occurrence.status === 'skipped' ? 'default' : 'warning'}
                                                    />
                                                )}
                                                {task.next_occurrence && (
                                                    <Chip
                                                        label={`Next: ${formatDate(task.next_occurrence.date)}${task.next_occurrence.date === new Date().toISOString().slice(0, 10) ? ' (Today)' : ''}`}
                                                        size="small"
                                                        variant="outlined"
                                                        color="info"
                                                    />
                                                )}
                                            </Stack>
                                        )}
                                    </CardContent>
                                </Card>
                            )}
                        </Grid>
                    ))}
                </Grid>
            )}

            <div ref={observerTarget} style={{ height: '10px' }}></div>

            {isLoadingMore && (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                    <Loader inline size={24} />
                </Box>
            )}
            {/* give the message no more tasks to load  */}
            {!allTaskPagination?.hasNextPage && tasksToRender.length > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                        No more tasks to load.
                    </Typography>
                </Box>
            )}

            {/* {allTaskPagination && tasksToRender.length > 8 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                        Page {allTaskPagination.page} of {allTaskPagination.totalPages}  • Total: {allTaskPagination.total}
                    </Typography>
                </Box>
            )}

            {allTaskPagination && tasksToRender.length > 8 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                        Page {allTaskPagination.page} of {allTaskPagination.totalPages}  • Total: {allTaskPagination.total}
                    </Typography>
                </Box>
            )} */}

            <ImageViewer
                open={openImage}
                onClose={() => setOpenImage(false)}
                image={selectedImage}
            />

            {/* <TaskCompletionTabs
                open={showCompletionDialog}
                onClose={handleCompletionDialogClose}
                task={selectedTask}
                updateTaskCompletionStatus={updateTaskCompletionStatus}
                activeTab={activeNameTab}
                markdoneClicked={markdoneClicked}
            /> */}
        </Container>
    );
};

export default TileViewTaskStaff;



