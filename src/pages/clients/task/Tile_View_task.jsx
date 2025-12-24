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
    CircularProgress,
    Switch,
    FormControlLabel,
    Icon
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
    PhotoCameraBackOutlined,
    Update,
    PhotoCamera
} from "@mui/icons-material";
import ViewMoreText from "../../../resuable_components/ViewMore.jsx";
import ImageViewer from "../../../resuable_components/ImageViewer.jsx";
import TaskFilter from "./TaskFilter";
import TileView_AddEdit_Dialog from "./TileView_AddEdit_Dialog.jsx";
import { useTaskContext } from "./TaskManagement.jsx";
import { useSnackbar } from "../../../resuable_components/Snackbar";
import { formatDate } from "../../../utils/dateFormat.js";
import { Form, useLocation } from "react-router-dom";
import CardSkeleton from "../../../resuable_components/CardSkeleton.jsx";
import { useAuth } from "../../../context/AuthContext.jsx";
import IconLabel from "../../../resuable_components/IconLabel.jsx";
import ConfirmationDialog from "../../../dialoge/clients/Confirmation_dialog.jsx";

export const Tile_View_task = () => {
    const theme = useTheme();
    const { palette } = theme;
    const { showSnackbar } = useSnackbar();
    const observerTarget = useRef(null);
    const { user } = useAuth();
    const location = useLocation();
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
    const [openConfirm, setOpenConfirm] = useState(false);
    const isFetchingRef = useRef(false);

    //console.log('filters applied:', filters);


    //console.log('selectedTask for delete:', selectedTask);

    // get Data from context
    const {
        allTasksData,
        deleteOneTimeTask,
        deleteRecurringTask,
        loading,
        fetchAllTasks,
        allTaskPagination
    } = useTaskContext();

    //console.log('allTasksData:', allTasksData);
    // reset page when filters or search text changes
    useEffect(() => {
        setCurrentPage(1);
    }, [filters, searchText]);

    // normalize tasks: merge active and recurring arrays when provided separately
    const tasksToRender = useMemo(() => {
        if (Array.isArray(allTasksData)) return allTasksData;
        if (allTasksData && (allTasksData.active_tasks || allTasksData.recurring_tasks)) {
            return [...(allTasksData.active_tasks || []), ...(allTasksData.recurring_tasks || [])];
        }
        return [];
    }, [allTasksData]);

    // infinite scroll observer
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
        // Reset fetching flag when filters or search change
        isFetchingRef.current = false;

        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && allTaskPagination?.hasNextPage && !isLoadingMore && !loading && !isFetchingRef.current) {
                loadMoreTasks();
            }
        }, {
            threshold: 0.5,
            rootMargin: '100px',
        });

        const currentTarget = observerTarget.current;
        if (currentTarget && !loading && tasksToRender.length > 0) {
            observer.observe(currentTarget);
        }

        return () => {
            if (currentTarget) {
                observer.unobserve(currentTarget);
            }
            observer.disconnect();
        };
    }, [allTaskPagination?.hasNextPage, isLoadingMore, loading, tasksToRender.length]);

    const handleEdit = (task) => {
        setSelectedTask(task);
        setOpenAddEditDialog(true);
        setAnchorEl(null);
    };
    const openDeleteDialog = (task) => {
        setSelectedTask(task);
        setOpenConfirm(true);
        setAnchorEl(null);
    };
    const handleCancelDelete = () => {
        setOpenConfirm(false);
        setSelectedTask(null);
    };

    const handleDeleteTask = async () => {
        try {
            if (selectedTask.schedule_type && selectedTask.schedule_type !== 'one_time') {
                const res = await deleteRecurringTask(selectedTask.id);
                showSnackbar(res.message, "success");
            } else {
                const res = await deleteOneTimeTask(selectedTask.id);
                showSnackbar(res.message, "success");
            }
        } catch (error) {
            console.error("Error deleting task:", error);
            showSnackbar("Failed to delete task", "error");
        } finally {
            setOpenConfirm(false);
            setSelectedTask(null);
        }
    };


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

    // handle navigation state for filters
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

    const handleCloseDialog = () => {
        setOpenAddEditDialog(false);
        setSelectedTask(null);
    };

    return (
        <Container maxWidth="mx" sx={{ mt: 2, px: 0 }}>
            {/* ---------- Header + Filter ---------- */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                {/* Create New Task Button when in Task Planner View */}
                <Button
                    variant="contained"
                    disableElevation
                    size="medium"

                    sx={{
                        bgcolor: palette.primary.main,
                        "&:hover": { bgcolor: palette.secondary.main },
                        textTransform: "none",
                        borderRadius: 10,
                    }}
                    onClick={() => {
                        setSelectedTask(null);
                        setOpenAddEditDialog(true);
                    }}
                >
                    Create New Task
                </Button>
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
                initialFilters={filters}
            />

            <Divider sx={{ my: 2 }} />

            {/* ---------- Task Grid ---------- */}
            {tasksToRender.length === 0 && !loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                        No tasks found.
                    </Typography>
                </Box>
            )}
            <Grid container spacing={2}>
                {loading ? (
                    Array.from({ length: 6 }).map((_, index) => (
                        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={`skeleton-${index}`}>
                            <CardSkeleton />
                        </Grid>
                    ))
                ) : (
                    tasksToRender.map((task) => (
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
                                        <IconButton
                                            aria-label="settings"
                                            onClick={(e) => {
                                                setSelectedTask(task);
                                                setAnchorEl(e.currentTarget);
                                            }}
                                        >
                                            <MoreVert fontSize="medium" />
                                        </IconButton>
                                    }
                                />

                                <CardContent sx={{ pt: 0 }}>
                                    {/* Description */}
                                    <ViewMoreText text={task.description} limit={60} />
                                    {task.schedule_type && task.schedule_type !== 'one_time' && (
                                        <Stack direction="row" alignItems="center" flexWrap="wrap" mb={1} mt={1} spacing={1}>
                                            {task.repeat_on?.days && task.repeat_on.days.length > 0 && (
                                                <>
                                                    {task.repeat_on.days.map((day, idx) => (
                                                        <Chip
                                                            key={idx}
                                                            label={day}
                                                            size="small"
                                                            variant="contained"
                                                            sx={{
                                                                height: 22,
                                                                // fontSize: '0.8rem',
                                                                px: 0.5,
                                                                '&:hover': {
                                                                    bgcolor: palette.primary.main,
                                                                    color: palette.primary.contrastText,
                                                                }
                                                            }}
                                                        />
                                                    ))}
                                                </>
                                            )}
                                        </Stack>
                                    )}


                                    {/* Task Type + Status */}
                                    <Stack
                                        spacing={1}
                                        mb={2}
                                        mt={1}
                                        direction="row"
                                        justifyContent="space-between"
                                    >
                                        <Tooltip placement="top" arrow title="Task Type">
                                            <Chip
                                                sx={{
                                                    px: 1.5,
                                                    borderRadius: 5,
                                                    bgcolor: palette.taskType?.[task.task_type] || palette.grey[500],
                                                    color: 'white',
                                                }}
                                                label={task.task_type.replace('_', ' ')}
                                                size="small"
                                            />
                                        </Tooltip>
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

                                    <Stack direction="row" flexWrap="wrap" gap={1}>
                                        {(task.scheduled_date || task.start_date) && (
                                            <IconLabel
                                                icon={CalendarMonth}
                                                label={formatDate(task.scheduled_date || task.start_date)}
                                            />

                                        )}

                                        <IconLabel
                                            icon={Person}
                                            label={task.assigned_to_name || '-'}
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
                                        )
                                        }
                                    </Stack>
                                    <Stack direction="row" spacing={1} mt={2} alignItems="center">
                                        {!!task.is_photo_required && (
                                            <PhotoCamera sx={{ color: palette.text.secondary }} />
                                        )}
                                         {!!task.update_inventory && (
                                            <Update sx={{ color: palette.text.secondary }} />
                                        )}
                                    </Stack>


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

            {/* observer target for infinite scroll */}
            <div ref={observerTarget} style={{ height: '10px' }}></div>
            {isLoadingMore && (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                    <CircularProgress size={24} />
                </Box>
            )}
            {/* pagination Info */}
            {allTaskPagination && tasksToRender.length > 8 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                        Page {allTaskPagination.page} of {allTaskPagination.totalPages}  • Total: {allTaskPagination.total}
                    </Typography>
                    {/* You can add pagination controls here if needed */}
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
                <MenuItem onClick={() => openDeleteDialog(selectedTask)} dense>
                    <ListItemIcon>
                        <Delete fontSize="small" sx={{ color: palette.error.main }} />
                    </ListItemIcon>
                    <ListItemText>Delete</ListItemText>
                </MenuItem>
            </Menu>

            <ConfirmationDialog
                open={openConfirm}
                onCancel={handleCancelDelete}
                onDelete={handleDeleteTask}
                title="Delete Task"
                message="Are you sure you want to delete this task? This action cannot be undone."
            />

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
            />
        </Container>
    );
};
