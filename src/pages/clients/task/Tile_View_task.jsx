import React, { use, useEffect, useMemo, useState, useRef, useCallback } from "react";
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
    Button,
    CardHeader,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    TextField,
    Select,
    CircularProgress
} from "@mui/material";
import {
    Alarm,
    Business,
    CalendarMonth,
    Delete,
    Edit,
    FilterList,
    MoreVert,
    Person,
    Search,
    Clear,
    SearchOff,
    Inventory,
    InventoryOutlined,
    PhotoCameraBackOutlined
} from "@mui/icons-material";
import ViewMoreText from "../../../resuable_components/ViewMore.jsx";
import ImageViewer from "../../../resuable_components/ImageViewer.jsx";
import TaskFilter from "./TaskFilter";
import TileView_AddEdit_Dialog from "./TileView_AddEdit_Dialog.jsx";
import { useTaskContext } from "./TaskManagement.jsx";
import { useSnackbar } from "../../../resuable_components/Snackbar";
import { formatDate } from "../../../utils/dateFormat.js";
import { useLocation } from "react-router-dom";
import CardSkeleton from "../../../resuable_components/CardSkeleton.jsx";

export const Tile_View_task = () => {
    const location = useLocation();
    const [viewMode, setViewMode] = useState(() => {
        const savedViewMode = localStorage.getItem('taskViewMode');
        return savedViewMode ? savedViewMode : "taskPlanner";
    });
    const [openAddEditDialog, setOpenAddEditDialog] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [openImage, setOpenImage] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);
    const [isSearchVisible, setIsSearchVisible] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [isFilterVisible, setIsFilterVisible] = useState(false);
    const [filters, setFilters] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    const observerTarget = useRef(null);

    console.log("filters:", filters);

    console.log("selectedTask:", selectedTask);

    const theme = useTheme();
    const { palette } = theme;
    const { showSnackbar } = useSnackbar();

    // get Data from context
    const {
        taskPlannerData,
        activeTasksData,
        loading,
        updateActiveTaskStatus,
        deleteTask,
        properties,
        inventoryItems,
        teamMembers,
        fetchTaskPlannerData,
        fetchActiveTasksData,
        taskPlannerPagination,
        activeTasksPagination,
    } = useTaskContext();


    //get current pagination based on view mode 
    const pagination = useMemo(() => {
        return viewMode === "taskPlanner" ? taskPlannerPagination : activeTasksPagination;
    }, [viewMode, taskPlannerPagination, activeTasksPagination]);

    // display tasks based on view mode
    const tasks = useMemo(() => {
        return viewMode === "taskPlanner" ? taskPlannerData : activeTasksData;
    }, [viewMode, taskPlannerData, activeTasksData]);
    // handle navigation state and apply filters 
    useEffect(() => {
        if (location.state?.assignedTo) {
            const assignedToId = location.state.assignedTo;

            const newFilters = {
                assigned_to: assignedToId,
            };
            setFilters(newFilters);


            const applyNavigationFilter = async () => {
                try {
                    if (viewMode === "taskPlanner") {
                        await fetchTaskPlannerData(newFilters, searchText);
                    } else {
                        await fetchActiveTasksData(newFilters, searchText);
                    }
                    showSnackbar("Filter applied from navigation", "success");
                } catch (error) {
                    console.error("Error applying navigation filter:", error);
                    showSnackbar("Failed to apply filter from navigation", "error");
                }
            };
            applyNavigationFilter();

            // Clear the navigation state to prevent reapplying the filter
            window.history.replaceState({}, document.title);
        }
    }, [location.state, teamMembers, viewMode]);

    // reset page when view mode , filters or search text changes
    useEffect(() => {
        setCurrentPage(1);
    }, [viewMode, filters, searchText]);


    // infinite scroll observer

    // Infinite scroll observer
    const loadMoreTasks = useCallback(async () => {
        if (!pagination?.hasNextPage || isLoadingMore || loading) return;

        setIsLoadingMore(true);
        const nextPage = currentPage + 1;

        try {
            if (viewMode === "taskPlanner") {
                await fetchTaskPlannerData(filters, searchText, nextPage, true);
            } else {
                await fetchActiveTasksData(filters, searchText, nextPage, true);
            }
            setCurrentPage(nextPage);
        } catch (error) {
            console.error("Error loading more tasks:", error);
            showSnackbar("Failed to load more tasks", "error");
        } finally {
            setIsLoadingMore(false);
        }
    }, [pagination, isLoadingMore, loading, currentPage, viewMode, filters, searchText, fetchTaskPlannerData, fetchActiveTasksData, showSnackbar]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && pagination?.hasNextPage && !isLoadingMore) {
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
    }, [loadMoreTasks, pagination, isLoadingMore]);




    const handleEdit = (task) => {
        setSelectedTask(task);
        setOpenAddEditDialog(true);
        setAnchorEl(null);
    };

    const handleFilterToggle = () => {
        setIsFilterVisible((prev) => !prev);
    };

    const handleApplyFilters = async (appliedFilters) => {
        setFilters(appliedFilters);
        setCurrentPage(1);
        try {
            if (viewMode === "taskPlanner") {
                await fetchTaskPlannerData(appliedFilters, searchText);
            } else {
                await fetchActiveTasksData(appliedFilters, searchText);
            }
            showSnackbar("Filters applied successfully", "success");
        } catch (error) {
            console.error("Error applying filters:", error);
            showSnackbar("Failed to apply filters", "error");
        }
    };
    const handleSearch = async (text) => {
        setSearchText(text);
        setCurrentPage(1);
        try {
            if (viewMode === "taskPlanner") {
                await fetchTaskPlannerData(filters, text);
            } else {
                await fetchActiveTasksData(filters, text);
            }
        } catch (error) {
            console.error("Error searching tasks:", error);
        }
    };

    const handleCloseDialog = () => {
        setOpenAddEditDialog(false);
        setSelectedTask(null);
    };

    const handleChange = (event) => {
        setViewMode(event.target.value);
        setCurrentPage(1);
        localStorage.setItem('taskViewMode', event.target.value);
    };

    return (
        <Container maxWidth="mx" sx={{ mt: 2, px: 0 }}>
            {/* ---------- Header + Filter ---------- */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                {/* Create New Task Button when in Task Planner View */}
                {viewMode === "taskPlanner" && (
                    <Button
                        variant="contained"
                        disableElevation
                        size="medium"
                        sx={{
                            bgcolor: palette.primary.main,
                            "&:hover": { bgcolor: palette.secondary.main },
                            textTransform: "none",
                        }}
                        onClick={() => {
                            setSelectedTask(null);
                            setOpenAddEditDialog(true);
                        }}
                    >
                        Create New Task
                    </Button>
                )}
                {viewMode === "activeTasks" && (
                    <Select
                        value={viewMode}
                        onChange={handleChange}
                        size="small"
                        MenuProps={{
                            PaperProps: {
                                sx: {
                                    '& .MuiMenuItem-root': {
                                        minHeight: '30px',
                                        fontSize: '0.85rem',
                                    }
                                }
                            }
                        }}
                    >
                        <MenuItem value="taskPlanner">Task Planner</MenuItem>
                        <MenuItem value="activeTasks">Active Tasks</MenuItem>
                    </Select>
                )}
                <Stack direction="row" spacing={1}>
                    <IconButton
                        onClick={handleFilterToggle}
                        sx={{
                            bgcolor: Object.keys(filters).some((key) => filters[key])
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

            {/* TaskFilter Drawer */}
            <TaskFilter
                open={isFilterVisible}
                onClose={handleFilterToggle}
                onApplyFilters={handleApplyFilters}
                viewMode={viewMode}
                initialFilters={filters}
            />


            <Divider sx={{ my: 2 }} />
            {viewMode === "taskPlanner" && (
                <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2, mr: 1 }}>
                    <Select
                        value={viewMode}
                        onChange={handleChange}
                        size="small"
                        MenuProps={{
                            PaperProps: {
                                sx: {
                                    '& .MuiMenuItem-root': {
                                        minHeight: '30px',
                                        fontSize: '0.85rem',
                                    }
                                }
                            }
                        }}
                    >
                        <MenuItem value="taskPlanner">Task Planner</MenuItem>
                        <MenuItem value="activeTasks">Active Tasks</MenuItem>
                    </Select>
                </Box>
            )}



            {/* ---------- Task Grid ---------- */}
            {tasks.length === 0 && !loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                        No tasks found.
                    </Typography>
                </Box>
            )}
            <Grid container spacing={2}>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                        <Typography>Loading tasks...</Typography>
                    </Box>
                ) : (
                    tasks.map((task) => (
                        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={task.id}>
                            <Card
                                elevation={0}
                                sx={{
                                    borderRadius: 3,
                                    elevation: 0,
                                    border: `1px solid ${palette.divider}`,
                                    bgcolor: palette.background.paper,
                                    pb: 1,

                                }}
                            >

                                <CardHeader
                                    sx={{ pb: 0 }}
                                    title={
                                        <Typography variant="h6" color="text.primary">
                                            {task.title}
                                        </Typography>
                                    }
                                    action={
                                        // viewMode === "taskPlanner" ? (
                                        <IconButton
                                            aria-label="settings"
                                            onClick={(e) => {
                                                setSelectedTask(task);
                                                setAnchorEl(e.currentTarget);
                                            }}
                                        >
                                            <MoreVert fontSize="medium" />
                                        </IconButton>
                                        // ) : null
                                    }
                                />

                                <CardContent sx={{ pt: 0 }}>
                                    {/* Description */}
                                    <ViewMoreText text={task.description} limit={100} />

                                    {/* Task Type + Status */}
                                    <Stack
                                        spacing={1}
                                        mb={2}
                                        mt={1}
                                        direction="row"
                                        justifyContent="space-between"
                                    >
                                        <Tooltip placement="top" arrow title="Task Type">
                                            <Box
                                                sx={{
                                                    display: 'inline-block',
                                                    px: 1.5,
                                                    py: 0.5,
                                                    borderRadius: 2,
                                                    bgcolor: palette.taskType?.[task.task_type] || palette.grey[500],
                                                    color: 'white',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 600,
                                                    textTransform: 'capitalize',
                                                }}
                                            >
                                                {task.task_type}
                                            </Box>
                                        </Tooltip>

                                        {viewMode === "activeTasks" && (
                                            <Tooltip placement="top" arrow title="Task Status">
                                                <Chip
                                                    label={task.status.replace('_', ' ')}
                                                    size="small"
                                                    sx={{
                                                        fontSize: '0.75rem',
                                                        fontWeight: 600,
                                                        textTransform: 'capitalize',
                                                        bgcolor: palette.taskStatus?.[task.status] || palette.grey[500],
                                                        color: 'white',
                                                        px: 1.5,
                                                        borderRadius: 2,
                                                        py: 0.5,
                                                    }}
                                                />
                                            </Tooltip>
                                        )}
                                    </Stack>
                                    <Stack direction="row" flexWrap="wrap" gap={1}>
                                        <Chip
                                            label={task.inventory_name}
                                            variant="outlined"
                                            size="small"
                                            avatar={<InventoryOutlined fontSize="small" />}
                                            sx={{ fontWeight: 600, borderRadius: 1 }}
                                        />
                                        {task.schedule_type && (
                                            <Chip
                                                label={task.schedule_type}
                                                variant="outlined"
                                                size="small"
                                                avatar={<Alarm fontSize="small" />}
                                                sx={{ fontWeight: 600, borderRadius: 1 }}
                                            />
                                        )}

                                        <Chip
                                            label={task.assigned_to_name || '-'}
                                            variant="outlined"
                                            size="small"
                                            avatar={<Person size="small" />}
                                            sx={{ fontWeight: 600, borderRadius: 1 }}
                                        />
                                        {/* //schedule date */}
                                        {(task.scheduled_date || task.start_date) && (
                                            <Chip
                                                label={formatDate(task.scheduled_date || task.start_date)}
                                                variant="outlined"
                                                size="small"
                                                avatar={<CalendarMonth fontSize="small" />}
                                                sx={{ fontWeight: 600, borderRadius: 1 }}
                                            />
                                        )}



                                        {task.scheduled_day && (
                                            <Chip
                                                label={task.scheduled_day}
                                                variant="outlined"
                                                size="small"
                                                avatar={<CalendarMonth fontSize="medium" />}
                                                sx={{ fontWeight: 600, borderRadius: 1 }}
                                            />
                                        )}

                                        {!!task.is_photo_required && (
                                            <Chip
                                                label="📷 Photo Required "
                                                variant="outlined"
                                                size="small"
                                                sx={{ fontWeight: 600, borderRadius: 1 }}
                                            />
                                        )}
                                    </Stack>

                                    {/* Assigned To */}


                                    {/* <Divider sx={{ my: 1 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Images
                                    </Typography>
                                </Divider> */}

                                    {/* <Stack direction="row" spacing={1} sx={{ overflowX: "auto", display: "flex", justifyContent: "center" }}>
                                    {task.images.map((img, idx) => (
                                        <Box
                                            key={idx}
                                            component="img"
                                            src={img}
                                            alt={`task-${task.id}-${idx}`}
                                            onClick={() => {
                                                setSelectedImage(img);
                                                setOpenImage(true);
                                            }}

                                            sx={{
                                                width: 70,
                                                height: 70,
                                                borderRadius: 2,
                                                objectFit: "cover",
                                                border: `1px solid ${palette.divider}`,
                                            }}
                                        />
                                    ))}
                                </Stack> */}
                                </CardContent>
                            </Card>
                        </Grid>
                    ))
                )}
            </Grid>

                   {/* Loading indicator for infinite scroll */}
            {isLoadingMore && (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <CardSkeleton />
                </Box>
            )}

            {/* Observer target for infinite scroll */}
            <div ref={observerTarget} style={{ height: '20px' }} />

            {/* Pagination info */}
            {pagination && tasks.length > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                        Page {pagination.page} of {pagination.totalPages} • Total: {pagination.total}
                    </Typography>
                </Box>
            )}

            {/* EDIT AND DELETE ICON BUTTON  */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
                // point to the morevert icon
                PaperProps={{
                    elevation: 1,
                    sx: {
                        borderRadius: 1,
                        // p: 1,
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
                            bgcolor: theme.palette.background.paper,
                            transform: "translateY(-50%) rotate(45deg)",
                            zIndex: 0,
                            boxShadow: theme.palette.mode === "light"
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
                <MenuItem onClick={() => handleEdit(selectedTask)} dense>
                    <ListItemIcon>
                        <Edit fontSize="small" sx={{ color: palette.primary.main }} />
                    </ListItemIcon>
                    <ListItemText>Edit</ListItemText>
                </MenuItem>
                {/* <MenuItem onClick={() => openDeleteDialog(selectedTask)} dense>
                    <ListItemIcon>
                        <Delete fontSize="small" sx={{ color: palette.error.main }} />
                    </ListItemIcon>
                    <ListItemText>Delete</ListItemText>
                </MenuItem> */}
            </Menu>

            {/* <ConfirmationDialog
                open={openConfirm}
                onCancel={handleCancelDelete}
                onDelete={handleDeleteTask}
                title="Delete Task"
                message="Are you sure you want to delete this task? This action cannot be undone."
            /> */}

            <ImageViewer
                open={openImage}
                onClose={() => setOpenImage(false)}
                image={selectedImage}
            />

            {/* Add/Edit Task Dialog */}
            <TileView_AddEdit_Dialog
                open={openAddEditDialog}
                onClose={handleCloseDialog}
                task={selectedTask}
                viewMode={viewMode}
            />
        </Container>
    );
};
