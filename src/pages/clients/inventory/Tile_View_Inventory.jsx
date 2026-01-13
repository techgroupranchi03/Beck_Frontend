import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
    Card,
    Container,
    Grid,
    Box,
    Button,
    Stack,
    IconButton,
    useTheme,
    TextField,
    CardMedia,
    CardContent,
    Typography,
    Menu,
    MenuItem,
    ListItemText,
    ListItemIcon,
    Divider,
    Collapse,
    Avatar,
    Select,
    Chip,
    Icon,
    Tooltip
} from '@mui/material';
import {
    Clear,
    FilterList,
    Search,
    SearchOff,
    MoreVert,
    Edit,
    Delete,
    ExpandMore,
    Add,
    AccessTime,
    CategoryOutlined,
    InventoryOutlined,
    HomeWorkOutlined,
    Person,
    Business,
    CalendarMonth,
    Task,
    Close,
    AssignmentTurnedIn,
    CameraAlt,
    FileCopy
} from '@mui/icons-material';
import InventoryFilter from './InventoryFilter';
import { useInventoryContext } from './InventoryManagement';
import Tag from '../../../resuable_components/Tag';
import TileView_addEdit_Inventory from './TileView_addEdit_Inventory';
import InventoryTask_AddEdit_Dialog from './InventoryTask_AddEdit_Dialog';
import { formatDate } from '../../../utils/dateFormat';
import ViewMoreText from '../../../resuable_components/ViewMore';
import CardSkeleton from '../../../resuable_components/CardSkeleton';
import { useSnackbar } from '../../../resuable_components/Snackbar';
import IconLabel from '../../../resuable_components/IconLabel';
import ConfirmationDialog from '../../../dialoge/clients/Confirmation_dialog';
import ImageViewer from '../../../resuable_components/ImageViewer';
import formatSchedule from '../../../utils/scheduleFormatter';
import PropertyDisplay from '../../../resuable_components/PropertyDisplay';
import { useViewMode } from '../../../context/ViewModeContext';

const Tile_View_Inventory = () => {
    const theme = useTheme();
    const { palette } = theme;
    const { viewMode } = useViewMode();
    const { showSnackbar } = useSnackbar();
    const [filters, setFilters] = useState({});
    const [isFilterVisible, setIsFilterVisible] = useState(false);
    const [isSearchVisible, setIsSearchVisible] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);
    const [expandedCards, setExpandedCards] = useState({});
    const [openAddEditDialog, setOpenAddEditDialog] = useState(false);
    const [openTaskDialog, setOpenTaskDialog] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [selectedInventoryId, setSelectedInventoryId] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [openConfirm, setOpenConfirm] = useState(false);
    const [taskAnchorEl, setTaskAnchorEl] = useState(null);
    const [openTaskConfirm, setOpenTaskConfirm] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [openImage, setOpenImage] = useState(false);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);
    const observerTarget = useRef(null);

    const {
        inventoryData,
        loading,
        fetchInventoryItems,
        inventoryPagination,
        deleteInventory,
        deleteOneTimeTask,
        deleteRecurringTask,
        properties,
        units,
    } = useInventoryContext();

    const handleFilterToggle = () => {
        setIsFilterVisible((prev) => !prev);
    };

    const handleRemoveFilter = async (filterKey) => {
        const updatedFilters = { ...filters };
        if (filterKey === 'category' || filterKey === 'property_id') {
            updatedFilters[filterKey] = [];
        } else {
            delete updatedFilters[filterKey];
        }
        await handleApplyFilters(updatedFilters);
    };

    const getFilterLabel = (key, value) => {
        if (!value || (Array.isArray(value) && value.length === 0)) return null;

        switch (key) {
            case 'category':
                if (Array.isArray(value)) {
                    const labels = value.map(cat => cat.charAt(0).toUpperCase() + cat.slice(1));
                    return labels.length > 0 ? `Category: ${labels.join(', ')}` : null;
                } else {
                    return `Category: ${value.charAt(0).toUpperCase() + value.slice(1)}`;
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
            case 'unit':
                const unitLabel = units.find(u => u.value === value);
                return unitLabel ? `Unit: ${unitLabel.label}` : null;
            case 'quantity':
                return `Quantity: ${value}`;
            case 'lower_limit':
                return `Lower Limit: ${value}`;
            case 'located_at':
                return `Located At: ${value}`;
            default:
                return null;
        }
    };

    const handleTaskMenuOpen = (event, task) => {
        setSelectedTask(task);
        setTaskAnchorEl(event.currentTarget);
    };

    const handleTaskEdit = () => {
        // if (selectedTask.taskSource === 'planner') {
        //     setOpenTaskDialog(true);
        // } else {
        //     setOpenTaskDialog(true);
        // }
        setOpenTaskDialog(true);
        setTaskAnchorEl(null);
    };

    const handleDuplicateTask = () => {
        setSelectedTask({ ...selectedTask, id: null, title: `Copy of ${selectedTask.title}` });
        setOpenTaskDialog(true);
        setTaskAnchorEl(null);
    };

    const openTaskDeleteDialog = () => {
        setOpenTaskConfirm(true);
        setTaskAnchorEl(null);
    };

    const handleCancelTaskDelete = () => {
        setOpenTaskConfirm(false);
        setSelectedTask(null);
    };

    const handleConfirmTaskDelete = async () => {
        if (selectedTask) {
            try {
                if (selectedTask.schedule_type && selectedTask.schedule_type !== 'one_time') {
                    const res = await deleteRecurringTask(selectedTask.id);
                    showSnackbar(res.message || 'Task deleted successfully', 'success');
                } else {
                    const res = await deleteOneTimeTask(selectedTask.id);
                    showSnackbar(res.message || 'Task deleted successfully', 'success');
                }
            } catch (error) {
                showSnackbar(error.message || 'Failed to delete task', 'error');
                console.error('Error deleting task:', error);
            }
        }
        setOpenTaskConfirm(false);
        setSelectedTask(null);
    };

    const handleEditEnventory = (inventory) => {
        setSelectedItem(inventory);
        setOpenAddEditDialog(true);
        setAnchorEl(null);
    };

    const handleCloseDialog = () => {
        setOpenAddEditDialog(false);
        setSelectedItem(null);
        setAnchorEl(null);
    };

    const handleCloseTaskDialog = () => {
        setOpenTaskDialog(false);
        setSelectedTask(null);
        setSelectedInventoryId(null);
    };

    const openDeleteDialog = (inventory) => {
        setSelectedItem(inventory);
        setOpenConfirm(true);
        setAnchorEl(null);
    };

    const handleCancelDelete = () => {
        setOpenConfirm(false);
        setSelectedItem(null);
    };

    const handleConfirmDelete = async () => {
        if (selectedItem) {
            try {
                const res = await deleteInventory(selectedItem.id);
                showSnackbar(res.message || 'Inventory deleted successfully', 'success');
            } catch (error) {
                showSnackbar(error.message || 'Failed to delete inventory', 'error');
                console.error('Error deleting inventory:', error);
            }
        }
        setOpenConfirm(false);
        setSelectedItem(null);
    };

    const handleApplyFilters = async (appliedFilters) => {
        setFilters(appliedFilters);
        try {
            await fetchInventoryItems(appliedFilters, searchText);
        } catch (error) {
            console.error("Error applying filters:", error);
        }
    };

    const handleCollapseToggle = (cardId) => {
        setExpandedCards(prev => ({
            ...prev,
            [cardId]: !prev[cardId]
        }));
    };

    const handleSearch = async (text) => {
        setSearchText(text);

        try {
            await fetchInventoryItems(filters, text);
        } catch (error) {
            console.error("Error searching inventory:", error);
        }
    };

    useEffect(() => {
        setCurrentPage(1);
    }, [filters, searchText]); 

    const loadMoreInventoryItems = useCallback(async () => {
        if (isLoadingMore || loading || !inventoryPagination.hasNextPage) {
            return;
        }

        try {
            setIsLoadingMore(true);
            const nextPage = currentPage + 1;
            await fetchInventoryItems(filters, searchText, nextPage, true);
            setCurrentPage(nextPage);
        } catch (error) {
            showSnackbar('Failed to load more inventory items', 'error');
            console.error('Error loading more inventory items:', error);
        } finally {
            setIsLoadingMore(false);
        }
    }, [inventoryPagination, isLoadingMore, loading, currentPage, filters, searchText, fetchInventoryItems, showSnackbar]);


    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && inventoryPagination.hasNextPage && !isLoadingMore && !loading) {
                    loadMoreInventoryItems();
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
    }, [loadMoreInventoryItems, inventoryPagination, isLoadingMore, loading]);

    return (
        <Container maxWidth={viewMode === 'center' ? "md" : "mx"} sx={{ mt: 2, px: viewMode === 'center' ? { xs: 2, sm: 3, md: 4 } : 0 }}>
           
            <Box
                sx={{
                    mb: 2,
                    position: 'relative',
                    display: 'block',
                    visibility: 'visible',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: { xs: '30px', md: '60px' },
                        background: theme.customGradients.right,
                        pointerEvents: 'none',
                        zIndex: 1,
                        opacity: canScrollLeft ? 1 : 0,
                        transition: 'opacity 0.3s ease',
                    },
                    '&::after': {
                        content: '""',
                        position: 'absolute',
                        right: 0,
                        top: 0,
                        bottom: 0,
                        width: { xs: '30px', md: '60px' },
                        background: theme.customGradients.left,
                        pointerEvents: 'none',
                        zIndex: 1,
                        opacity: canScrollRight ? 1 : 0,
                        transition: 'opacity 0.3s ease',
                    },
                }}
            >
                <PropertyDisplay
                    property={properties}
                    onScrollStateChange={({ canScrollLeft, canScrollRight }) => {
                        setCanScrollLeft(canScrollLeft);
                        setCanScrollRight(canScrollRight);
                    }}
                />
            </Box>

            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
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
                        setOpenAddEditDialog(true);
                        setSelectedItem(null);
                    }}
                >
                    Add Inventory
                </Button>

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

                    {/* <ViewToggle /> */}
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
                    placeholder="Search Inventory..."
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

            {inventoryData.length === 0 && !loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                        No inventory items found.
                    </Typography>
                </Box>
            )}

            <Grid container spacing={2}>
                {loading ? (
                    Array.from({ length: 6 }).map((_, index) => (
                        <Grid size={viewMode === 'center' ? { xs: 12, } : { xs: 12, sm: 6, md: 4 }} key={`skeleton-${index}`}>
                            <CardSkeleton />
                        </Grid>
                    ))
                ) : (inventoryData.map((item) => (
                    <Grid
                        size={viewMode === 'center' ? { xs: 12, } : { xs: 12, sm: 6, md: 4 }}
                        item key={item.id}
                    >
                        <Card
                            elevation={0}
                            sx={{
                                pt: 0,
                                borderRadius: 3,
                                position: "relative",
                                border: expandedCards[item.id]
                                    ? `1px solid ${palette.primary.main}`
                                    : `1px solid ${palette.divider}`,
                                bgcolor: expandedCards[item.id]
                                    ? palette.action.hover
                                    : palette.background.paper,
                            }}
                        >
                            <Box display="flex" alignItems="center">
                                <CardMedia
                                    component="img"
                                    sx={{
                                        borderRadius: 3,
                                        ml: 2,

                                        width: 80,
                                        height: 80,
                                        objectFit: 'cover',
                                        bgcolor: palette.background.default,
                                    }}
                                    image={item.inventory_image_url}
                                    alt={item.name || ''}
                                />
                                <CardContent sx={{ pl: 2, pb: 0, flex: 1 }}>
                                    <Typography variant="body1" sx={{ fontWeight: 600, }}>
                                        {item.name}
                                    </Typography>

                                    <Stack direction="row" flexWrap="wrap" gap={1} mb={2} mt={1}>
                                        <Tag
                                            icon={<CategoryOutlined size="small" />}
                                            label={item.category}
                                            bgcolor={palette.tagTask.categatory}
                                            color={palette.tagTask.color}

                                        />

                                        <Tag
                                            icon={<Business size="small" />}
                                            label={item.property_name}
                                            bgcolor={palette.tagTask.location}
                                            color={palette.tagTask.color}
                                        />

                                        <Tag
                                            icon={<InventoryOutlined size="small" />}
                                            label={`Qty: ${item.quantity} ${item.unit}`}
                                            bgcolor={palette.tagTask.quantity}
                                            color={palette.tagTask.color}
                                        />
                                        {/* i want to add  located_at and lower_limit tags here */}
                                        <Tag
                                            icon={<HomeWorkOutlined size="small" />}
                                            label={item.located_at || 'N/A'}
                                            bgcolor={palette.tagTask.location}
                                            color={palette.tagTask.color}
                                        />
                                        <Tag
                                            icon={<AccessTime size="small" />}
                                            label={`Low Limit: ${item.lower_limit}`}
                                            bgcolor={palette.tagTask.lower_limit}
                                            color={palette.tagTask.color}
                                        />

                                    </Stack>
                                </CardContent>
                                <IconButton
                                    onClick={(event) => {
                                        setSelectedItem(item)
                                        setAnchorEl(event.currentTarget)
                                    }}

                                    sx={{
                                        position: "absolute",
                                        top: 8,
                                        right: 8,
                                    }}
                                >
                                    <MoreVert />
                                </IconButton>
                            </Box>

                            {/* Tasks Section */}
                            <Divider sx={{ py: 0.5 }} />
                            <Box sx={{ px: 1, py: 0 }}>
                                <Stack
                                    direction="row"
                                    alignItems="center"
                                    justifyContent="space-between"
                                    onClick={() => handleCollapseToggle(item.id)}
                                    sx={{
                                        cursor: 'pointer',
                                        '&:hover': { backgroundColor: palette.action.hover },
                                        borderRadius: 1,
                                        p: 1,
                                        mx: -1
                                    }}
                                >
                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                        {expandedCards[item.id] ? 'Hide Tasks' : 'Show Tasks'}
                                    </Typography>
                                    <Stack direction="row" alignItems="center" spacing={1}>
                                        {/* add task button is here it show when the Collapse is open */}
                                        {expandedCards[item.id] && (
                                            <Button
                                                size="small"
                                                startIcon={<Add />}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedInventoryId(item.id);
                                                    setSelectedTask(null);
                                                    setOpenTaskDialog(true);
                                                }}
                                                sx={{
                                                    textTransform: 'none',
                                                    color: palette.primary.main,
                                                    fontSize: '0.75rem'
                                                }}
                                            >
                                                Add task
                                            </Button>
                                        )}
                                        <ExpandMore
                                            fontSize="medium"
                                            sx={{
                                                transform: expandedCards[item.id] ? 'rotate(180deg)' : 'rotate(0deg)',
                                                transition: 'transform 0.3s'
                                            }}
                                        />
                                    </Stack>
                                </Stack>
                            </Box>

                            <Collapse in={expandedCards[item.id]} timeout="auto" unmountOnExit>
                                {/* make scrollable area for tasks if more than 1 tasks */}
                                <Box sx={{
                                    maxHeight: 250,
                                    overflowY: 'auto',
                                }}>
                                    {(() => {
                                        const allTasks = [
                                            ...(item.task_instances || []).map(t => ({ ...t, taskSource: 'instance' })),
                                            ...(item.task_planner || []).map(t => ({ ...t, taskSource: 'planner' }))
                                        ];

                                        return allTasks.length > 0 ? (
                                            <Stack spacing={1.5} sx={{ py: 1, px: 1 }}>
                                                {allTasks.map((task) => (
                                                    <Card
                                                        key={`${task.taskSource}-${task.id}`}
                                                        elevation={0}
                                                        sx={{
                                                            position: 'relative',
                                                            border: `1px solid ${palette.divider}`,
                                                            borderRadius: 2,
                                                            bgcolor: palette.background.default,
                                                        }}
                                                    >
                                                        <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                                                            <IconButton
                                                                size="small"
                                                                sx={{ position: 'absolute', top: 8, right: 8 }}
                                                                onClick={(e) => handleTaskMenuOpen(e, task)}
                                                            >
                                                                <MoreVert fontSize="small" />
                                                            </IconButton>

                                                            <Stack direction="row" spacing={1} alignItems="flex-start">
                                                                {/* Content */}
                                                                <Box sx={{ flex: 1, pr: 3 }}>
                                                                    <Typography variant="body1" fontWeight={600} textTransform="capitalize" gutterBottom>
                                                                        {task.title}
                                                                    </Typography>

                                                                    {/* Repeat Days for Recurring Tasks */}
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

                                                                                {/* add status chip here */}
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
                                                                        )
                                                                    })()}



                                                                    {/* Task Type & Status */}
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
                                                                    {/* Task Description */}
                                                                        <ViewMoreText text={task.description} limit={40} />
                                                                   

                                                                    {/* Task chips */}
                                                                    <Stack direction="row" gap={1} flexWrap="wrap" mb={1} mt={1}>
                                                                        {task.taskSource === 'planner' ? (
                                                                            <>
                                                                                {task.task_type && (
                                                                                    <IconLabel icon={Task} label={task.task_type.replace('_', ' ')} />
                                                                                )}
                                                                                {task.assigned_to_name && (
                                                                                    <IconLabel icon={Person} label={task.assigned_to_name} />
                                                                                )}
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                {task.task_type && (
                                                                                    <IconLabel icon={Task} label={task.task_type.replace('_', ' ')} />
                                                                                )}
                                                                                {task.assigned_to_name && (
                                                                                    <IconLabel icon={Person} label={task.assigned_to_name} />
                                                                                )}
                                                                            </>
                                                                        )}
                                                                    </Stack>

                                                                    {/* Icons for Photo Required & Update Inventory */}
                                                                    <Stack direction="row" spacing={1} mt={1} alignItems="center"
                                                                        justifyContent={task.last_task?.scheduled_date ? "space-between" : "flex-end"}
                                                                    >
                                                                        {task.last_task?.scheduled_date && (
                                                                            <Typography variant="body2"
                                                                                sx={{
                                                                                    color: palette.primary.main,
                                                                                    fontWeight: 500
                                                                                }}>
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
                                                                                    icon={<CameraAlt />}
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
                                                                                    <CameraAlt color="action" sx={{ fontSize: 25 }} />
                                                                                </Tooltip>
                                                                            )}
                                                                            {!!task.update_inventory && (
                                                                                <Tooltip title="Inventory Update" placement="top" arrow>
                                                                                    <AssignmentTurnedIn color="action" sx={{ fontSize: 22 }} />
                                                                                </Tooltip>
                                                                            )}
                                                                        </Box>
                                                                    </Stack>
                                                                </Box>
                                                            </Stack>
                                                        </CardContent>
                                                    </Card>
                                                ))}
                                            </Stack>
                                        ) : (
                                            <Box
                                                textAlign="center"
                                                py={3}
                                                sx={{
                                                    bgcolor: palette.action.hover,
                                                    borderRadius: 2,
                                                }}
                                            >
                                                <Typography variant="caption" color="text.secondary">
                                                    No tasks found for this inventory
                                                </Typography>
                                            </Box>
                                        );
                                    })()}
                                </Box>
                            </Collapse>
                        </Card>
                    </Grid>
                )))}
            </Grid>

            {/* Loading indicator for infinite scroll */}
            {isLoadingMore && (
                <Grid container spacing={2} sx={{ mt: 2 }}>
                    {Array.from({ length: 6 }).map((_, index) => (
                        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={`loading-skeleton-${index}`}>
                            <CardSkeleton />
                        </Grid>
                    ))}
                </Grid>
            )}

            <div ref={observerTarget} style={{ height: '20px' }} />

            {inventoryData.length > 9 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 2, mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                        Page {inventoryPagination.page} of {inventoryPagination.totalPages} • Total: {inventoryPagination.total} items
                    </Typography>
                </Box>
            )}

            <Menu
                anchorEl={taskAnchorEl}
                open={Boolean(taskAnchorEl)}
                onClose={() => setTaskAnchorEl(null)}
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
                <MenuItem onClick={handleTaskEdit} dense>
                    <ListItemIcon>
                        <Edit fontSize="small" sx={{ color: palette.primary.main }} />
                    </ListItemIcon>
                    <ListItemText>Edit</ListItemText>
                </MenuItem>
                <MenuItem onClick={openTaskDeleteDialog} dense>
                    <ListItemIcon>
                        <Delete fontSize="small" sx={{ color: palette.primary.main }} />
                    </ListItemIcon>
                    <ListItemText>Delete</ListItemText>
                </MenuItem>
                <MenuItem onClick={handleDuplicateTask} dense>
                    <ListItemIcon>
                        <FileCopy fontSize="small" sx={{ color: palette.primary.main }} />
                    </ListItemIcon>
                    <ListItemText>Duplicate</ListItemText>
                </MenuItem>
            </Menu>

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
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
                <MenuItem onClick={() => handleEditEnventory(selectedItem)} dense>
                    <ListItemIcon>
                        <Edit fontSize="small" sx={{ color: palette.primary.main }} />
                    </ListItemIcon>
                    <ListItemText>Edit</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => openDeleteDialog(selectedItem)} dense>
                    <ListItemIcon>
                        <Delete fontSize="small" sx={{ color: palette.error.main }} />
                    </ListItemIcon>
                    <ListItemText>Delete</ListItemText>
                </MenuItem>
            </Menu>

            <TileView_addEdit_Inventory
                open={openAddEditDialog}
                onClose={handleCloseDialog}
                inventory={selectedItem}
            />

            <InventoryTask_AddEdit_Dialog
                open={openTaskDialog}
                onClose={handleCloseTaskDialog}
                task={selectedTask}
                inventoryId={selectedInventoryId}
            />

            <InventoryFilter
                open={isFilterVisible}
                onClose={() => setIsFilterVisible(false)}
                onApplyFilters={handleApplyFilters}
            />

            <ConfirmationDialog
                open={openConfirm}
                onCancel={handleCancelDelete}
                onDelete={handleConfirmDelete}
                title="Delete Inventory Item"
                message="Are you sure you want to delete this inventory item? This action cannot be undone."
            />

            <ConfirmationDialog
                open={openTaskConfirm}
                onCancel={handleCancelTaskDelete}
                onDelete={handleConfirmTaskDelete}
                title="Delete Task"
                message="Are you sure you want to delete this task? This action cannot be undone."
            />

            <ImageViewer
                open={openImage}
                onClose={() => setOpenImage(false)}
                image={selectedImage}
            />
        </Container>
    );
};

export default Tile_View_Inventory;