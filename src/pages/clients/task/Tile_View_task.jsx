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
    useMediaQuery,
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
    InventoryOutlined,
    Close,
    AssignmentTurnedIn,
    CameraAlt,
    FileCopy,
    OpenInNew
} from "@mui/icons-material";
import ViewMoreText from "../../../resuable_components/ViewMore.jsx";
import ImageViewer from "../../../resuable_components/ImageViewer.jsx";
import TaskFilter from "./TaskFilter";
import TileView_AddEdit_Dialog from "./TileView_AddEdit_Dialog.jsx";
import TileVeiwAddEditGroupTaskDialog from "./TileVeiwAddEditGroupTaskDialog.jsx";
import { useTaskContext } from "./TaskManagement.jsx";
import { useSnackbar } from "../../../resuable_components/Snackbar";
import { GroupTaskCard } from "./GroupTaskCard.jsx";
import { formatDate } from "../../../utils/dateFormat.js";
import { Form, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext.jsx";
import IconLabel from "../../../resuable_components/IconLabel.jsx";
import ConfirmationDialog from "../../../dialoge/clients/Confirmation_dialog.jsx";
import { scheduleTypeOptions, taskStatusFilter } from "../../../constant.js";
import { formatSchedule } from "../../../utils/scheduleFormatter.js";
import { useViewMode } from "../../../context/ViewModeContext.jsx";
import TaskCardSkeleton from "./TaskCardSkeleton.jsx";
import { useTopBar } from "../../../context/TopBarContext.jsx";

export const Tile_View_task = () => {
    const theme = useTheme();
    const { palette } = theme;
    const { showSnackbar } = useSnackbar();
    const observerTarget = useRef(null);
    const location = useLocation();
    const navigate = useNavigate();
    const { viewMode } = useViewMode();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [openAddEditDialog, setOpenAddEditDialog] = useState(false);
    const [openAddEditGroupTaskDialog, setOpenAddEditGroupTaskDialog] = useState(false);
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
    const searchDebounceRef = useRef(null);

    // Register search actions in top bar for mobile
    const { registerActions, clearActions } = useTopBar();
    const hasActiveFilters = Object.keys(filters).some((key) => {
        const val = filters[key];
        return Array.isArray(val) ? val.length > 0 : val;
    });
    useEffect(() => {
        if (isMobile) {
            registerActions({
                onSearchToggle: () => setIsSearchVisible((prev) => !prev),
                isSearchActive: isSearchVisible,
            });
        }
        return () => { if (isMobile) clearActions(); };
    }, [isMobile, isSearchVisible]);

    const {
        allTasksData,
        deleteTask,
        deleteGroupTask,
        loading,
        fetchAllTasks,
        allTaskPagination,
        teamMembers,
        properties
    } = useTaskContext();

    // view details 
    const handleViewDetails = (task) => {
        const taskToView = task || selectedTask;
        if (!taskToView) return;
        const basePath = location.pathname.startsWith('/teams') ? '/teams' : '/clients';

        const taskSlug = taskToView.title.toLowerCase().replace(/\s+/g, '-');
        navigate(`${basePath}/task-management/task/${taskSlug}`, {
            state: { taskId: taskToView.id },
        });
    };

    useEffect(() => {
        setCurrentPage(1);
    }, [filters, searchText]);

    const tasksToRender = useMemo(() => {
        if (!allTasksData) return [];
        const groupTasks = (allTasksData.group_task || []).map(g => ({ ...g, is_task_group: true }));
        const tasks = allTasksData.tasks || [];
        return [...groupTasks, ...tasks];
    }, [allTasksData]);

    const loadMoreTasks = useCallback(async () => {
        if (!allTaskPagination?.hasNextPage || isLoadingMore || loading || isFetchingRef.current) return;

        isFetchingRef.current = true;
        setIsLoadingMore(true);
        const nextPage = currentPage + 1;
        try {
            await fetchAllTasks(filters, searchText, nextPage, true, 5);
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
    }, [allTaskPagination?.hasNextPage, isLoadingMore, loading, tasksToRender.length, loadMoreTasks]);

    const handleEdit = (task) => {
        setSelectedTask(task);
        if (task.is_task_group) {
            setOpenAddEditGroupTaskDialog(true);
        } else {
            setOpenAddEditDialog(true);
        }
        setAnchorEl(null);
    };

    const handleDuplicate = (task) => {
        setSelectedTask({ ...task, id: null, });
        if (task.is_task_group) {
            setOpenAddEditGroupTaskDialog(true);
        } else {
            setOpenAddEditDialog(true);
        }
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
            if (selectedTask.is_task_group) {
                const res = await deleteGroupTask(selectedTask.id);
                showSnackbar(res.message, "success");
            } else {
                const res = await deleteTask(selectedTask.id);
                showSnackbar(res.message, "success");
            }
        } catch (error) {
            console.error("Error deleting task:", error);
            showSnackbar(error.message, "error");
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
            await fetchAllTasks(appliedFilters, searchText, 1, false, 10);
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

            case 'schedule_type':
                if (Array.isArray(value)) {
                    const labels = value.map(val => {
                        const schedule = scheduleTypeOptions.find(s => s.value === val);
                        return schedule ? schedule.label : null;
                    }).filter(Boolean);
                    return labels.length > 0 ? `Schedule: ${labels.join(', ')}` : null;
                } else {
                    const schedule = scheduleTypeOptions.find(s => s.value === value);
                    return schedule ? `Schedule: ${schedule.label}` : null;
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

    // Auto-open add dialog from mobile FAB navigation
    useEffect(() => {
        if (location.state?.openAdd) {
            setSelectedTask(null);
            setOpenAddEditDialog(true);
            window.history.replaceState({}, document.title);
        }
        if (location.state?.openAddGroupTask) {
            setSelectedTask(null);
            setOpenAddEditGroupTaskDialog(true);
            window.history.replaceState({}, document.title);
        }
    }, [location.state?.openAdd, location.state?.openAddGroupTask]);

    const handleSearch = (text) => {
        setSearchText(text);

        if (searchDebounceRef.current) {
            clearTimeout(searchDebounceRef.current);
        }

        searchDebounceRef.current = setTimeout(async () => {
            if (isFetchingRef.current) return;

            isFetchingRef.current = true;
            setCurrentPage(1);
            try {
                await fetchAllTasks(filters, text, 1, false, 10);
            } catch (error) {
                console.error("Error searching tasks:", error);
            } finally {
                isFetchingRef.current = false;
            }
        }, 400);
    };

    useEffect(() => {
        return () => {
            if (searchDebounceRef.current) {
                clearTimeout(searchDebounceRef.current);
            }
        };
    }, []);

    const handleCloseDialog = () => {
        setOpenAddEditDialog(false);
        setSelectedTask(null);
    };

    const handleCloseGroupTaskDialog = () => {
        setOpenAddEditGroupTaskDialog(false);
        setSelectedTask(null);
    };

    return (
        <Container maxWidth={viewMode === 'center' ? 'md' : 'mx'} sx={{ mt: 2, px: viewMode === 'center' ? { xs: 2, sm: 3, md: 4 } : 0 }}>

            <Box display="flex" justifyContent={isMobile ? "flex-end" : "space-between"} alignItems="center" mb={2}>

                {!isMobile && <Stack direction="row" flexWrap="wrap" gap={1} alignItems="center">

                    <Button
                        variant="contained"
                        disableElevation
                        size="small"
                        sx={{
                            bgcolor: palette.primary.main,
                            "&:hover": { bgcolor: palette.secondary.main },
                            textTransform: "none",
                            borderRadius: 10,
                            px: 2,
                            fontSize: '0.800rem',
                        }}
                        onClick={() => {
                            setSelectedTask(null);
                            setOpenAddEditDialog(true);
                        }}
                    >
                        Create New Task
                    </Button>

                    <Button
                        variant="contained"
                        disableElevation
                        size="small"
                        sx={{
                            textTransform: "none",
                            borderRadius: 10,
                            bgcolor: palette.secondary.main,
                            "&:hover": { bgcolor: palette.primary.main },
                            px: 2,
                            fontSize: '0.800rem',
                        }}
                        onClick={() => {
                            setSelectedTask(null);
                            setOpenAddEditGroupTaskDialog(true);
                        }}
                    >
                        Create Group Task
                    </Button>

                </Stack>}

                <Stack direction="row" spacing={1} sx={{ display: isMobile ? 'none' : 'flex', py: 1 }}>
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
                            color: isSearchVisible ? "#ffffff" : palette.text.primary,
                            "&:hover": { bgcolor: palette.primary.main, color: "#ffffff" }
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

            {/* Mobile floating filter tab */}
            {isMobile && (
                <Box
                    onClick={handleFilterToggle}
                    sx={{
                        position: 'fixed',
                        right: 0,
                        top: '25%',
                        transform: 'translateY(-50%)',
                        zIndex: 1100,
                        bgcolor: hasActiveFilters ? palette.secondary.main : palette.secondary.main,
                        color: '#fff',
                        writingMode: 'vertical-rl',
                        textOrientation: 'mixed',
                        py: 1.5,
                        px: 0.5,
                        borderRadius: '8px 0 0 8px',
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        letterSpacing: '0.5px',
                        userSelect: 'none',
                        '&:active': { opacity: 0.8 },
                    }}
                >
                    Filter
                </Box>
            )}

            <TaskFilter
                open={isFilterVisible}
                onClose={handleFilterToggle}
                onApplyFilters={handleApplyFilters}
                initialFilters={filters}
            />

            <Divider sx={{ my: 2 , display : {xs : 'none' , sm : 'block'}}} />

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
                                    onMenuClick={(e, task) => {
                                        setSelectedTask(task);
                                        setAnchorEl(e.currentTarget);
                                    }}
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
                                            <Typography variant="body1" sx={{ textTransform: 'capitalize', fontWeight: 'bold', fontSize: '1rem' }} gutterBottom>
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

                                        <Stack direction="row" flexWrap="wrap" gap={1} mt={1} >
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
                                                        <CameraAlt color="action" sx={{ fontSize: 25 }} />
                                                    </Tooltip>
                                                )}
                                                {!!task.allows_inventory_update && (
                                                    <Tooltip title="Inventory Update" placement="top" arrow>
                                                        <AssignmentTurnedIn color="action" sx={{ fontSize: 22 }} />
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
                    <CircularProgress size={24} />
                </Box>
            )}

            {allTaskPagination && tasksToRender.length > 8 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                        Page {allTaskPagination.page} of {allTaskPagination.totalPages}  • Total: {allTaskPagination.total}
                    </Typography>
                </Box>
            )}

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
                        <Edit fontSize="small" sx={{ color: palette.secondary.main }} />
                    </ListItemIcon>
                    <ListItemText>Edit</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => openDeleteDialog(selectedTask)} dense>
                    <ListItemIcon>
                        <Delete fontSize="small" sx={{ color: palette.secondary.main }} />
                    </ListItemIcon>
                    <ListItemText>Delete</ListItemText>
                </MenuItem>

                {/* add the option to duplicate the task  */}
                <MenuItem onClick={() => { handleDuplicate(selectedTask); }} dense>
                    <ListItemIcon>
                        <FileCopy fontSize="small" sx={{ color: palette.secondary.main }} />
                    </ListItemIcon>
                    <ListItemText>Duplicate Task</ListItemText>
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

            <TileView_AddEdit_Dialog
                open={openAddEditDialog}
                onClose={handleCloseDialog}
                task={selectedTask}
            />

            <TileVeiwAddEditGroupTaskDialog
                open={openAddEditGroupTaskDialog}
                onClose={handleCloseGroupTaskDialog}
                task={selectedTask}
            />
            
        </Container>
    );
};


