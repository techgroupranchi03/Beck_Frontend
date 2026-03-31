import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import {
    Card,
    Container,
    Grid,
    Box,
    Button,
    Stack,
    IconButton,
    useTheme,
    useMediaQuery,
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
    Chip,
    Tooltip,
    CircularProgress
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
    Close,
    AssignmentTurnedIn,
    CameraAlt,
    FileCopy,
    CalendarMonth,
    ProductionQuantityLimitsOutlined
} from '@mui/icons-material';
import InventoryFilter from './InventoryFilter';
import { useInventoryContext } from './InventoryManagement';
import Tag from '../../../resuable_components/Tag';
import TileView_addEdit_Inventory from './TileView_addEdit_Inventory';
import InventoryTask_AddEdit_Dialog from './InventoryTask_AddEdit_Dialog';
import UpdateInventoryDialog from './UpdateInventoryDialog';
import ViewMoreText from '../../../resuable_components/ViewMore';
import InventoryCardSkeleton from './InventoryCardSkeleton';
import { useSnackbar } from '../../../resuable_components/Snackbar';
import IconLabel from '../../../resuable_components/IconLabel';
import ConfirmationDialog from '../../../dialoge/clients/Confirmation_dialog';
import ImageViewer from '../../../resuable_components/ImageViewer';
import PropertyDisplay from '../../../resuable_components/PropertyDisplay';
import { useViewMode } from '../../../context/ViewModeContext';
import formatSchedule from '../../../utils/scheduleFormatter';
import { formatDate } from '../../../utils/dateFormat';
import { useAuth } from '../../../context/AuthContext';
import { canCreate, canUpdate, canDelete, RESOURCES } from '../../../utils/permissions';
import { containerOptions } from '../../../constant';
import { useTopBar } from '../../../context/TopBarContext';




const Tile_View_Inventory = () => {
    const { user } = useAuth();
    const theme = useTheme();
    const { palette } = theme;
    const { viewMode } = useViewMode();
    const { showSnackbar } = useSnackbar();
    const location = useLocation();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    // Check permissions for inventory resource
    const canCreateInventory = canCreate(user?.teamRole, RESOURCES.INVENTORY);
    const canUpdateInventory = canUpdate(user?.teamRole, RESOURCES.INVENTORY);
    const canDeleteInventory = canDelete(user?.teamRole, RESOURCES.INVENTORY);

    // Check permissions for task resource (tasks within inventory)
    const canCreateTask = canCreate(user?.teamRole, RESOURCES.TASK);
    const canUpdateTask = canUpdate(user?.teamRole, RESOURCES.TASK);
    const canDeleteTask = canDelete(user?.teamRole, RESOURCES.TASK);

    const [filters, setFilters] = useState({});
    const [isFilterVisible, setIsFilterVisible] = useState(false);
    const [isSearchVisible, setIsSearchVisible] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);
    const [expandedCardId, setExpandedCardId] = useState(null);
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
    const isFetchingRef = useRef(false);
    const searchDebounceRef = useRef(null);
    const [inventoryTaskDataMap, setInventoryTaskDataMap] = useState({});
    const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
    const [updateItem, setUpdateItem] = useState(null);

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

    // Auto-open add dialog from mobile FAB navigation
    useEffect(() => {
        if (location.state?.openAdd) {
            setOpenAddEditDialog(true);
            setSelectedItem(null);
            window.history.replaceState({}, document.title);
        }
    }, [location.state?.openAdd]);

    console.log("Inventory Task Data Map:", inventoryTaskDataMap);
    console.log("SlectedInventoryId:", selectedInventoryId);
    console.log("selectedItem:", selectedItem);

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
        getInventoryDetails,
    } = useInventoryContext();


    console.log("Inventory Data:", inventoryData);


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

    const handleOpenUpdateInventory = (inventory) => {
        setUpdateItem(inventory);
        setOpenUpdateDialog(true);
        setAnchorEl(null);
    };

    const handleCloseUpdateDialog = () => {
        setOpenUpdateDialog(false);
        setUpdateItem(null);
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
                showSnackbar(res.message);
            } catch (error) {
                showSnackbar(error.message);
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

    const handleCollapseToggle = async (cardId) => {
        const isExpanding = expandedCardId !== cardId;

        // Close previous, open new (or just close if same card)
        setExpandedCardId(isExpanding ? cardId : null);

        if (isExpanding && !inventoryTaskDataMap[cardId]) {
            const res = await getInventoryDetails(cardId);
            setInventoryTaskDataMap(prev => ({
                ...prev,
                [cardId]: res || { task_definitions: [] }
            }));
        }
    };

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
                await fetchInventoryItems(filters, text, 1, false);
            } catch (error) {
                console.error("Error searching inventory:", error);
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
                    // mb: 2,
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

            <Box display="flex" justifyContent={isMobile ? "flex-end" : "space-between"} alignItems="center" mb={2}>
                {canCreateInventory && !isMobile ? (
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
                ) : <Box />}

                <Stack direction="row" spacing={1} sx={{ display: isMobile ? 'none' : 'flex' }}>
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
                    autoFocus
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

           
            <Divider sx={{ my: 2 , display: { xs: 'none', md: 'block' }}} />

            {/* show skeleton when loading initial data */}
            {loading && inventoryData.length === 0 && (
                <InventoryCardSkeleton count={6} viewMode={viewMode} />
            )}

            {!loading && inventoryData.length === 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                        No inventory items found.
                    </Typography>
                </Box>
            )}

            {!loading && inventoryData.length > 0 && (
                <Grid container spacing={2} >
                    {inventoryData.map((item) => (
                        <Grid
                            size={viewMode === 'center' ? { xs: 12, } : { xs: 12, sm: 6, md: 4 }}
                            item key={item.id}
                            sx={{ display: 'flex' }}
                        >
                            <Card
                                elevation={0}
                                sx={{
                                    pt: 0,
                                    borderRadius: 3,
                                    position: "relative",
                                    width: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    border: expandedCardId === item.id
                                        ? `1px solid ${palette.primary.main}`
                                        : `1px solid ${palette.divider}`,
                                    bgcolor: expandedCardId === item.id
                                        ? palette.action.hover
                                        : palette.background.paper,
                                }}
                            >
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "flex-start",
                                        p: 2,
                                        gap: 2,
                                        position: "relative",
                                        flexGrow: 1,
                                    }}
                                >
                                    {/* Image */}
                                    <CardMedia
                                        component="img"
                                        image={item.inventory_image_url}
                                        alt={item.name || ""}
                                        sx={{
                                            width: 70,
                                            height: 70,
                                            borderRadius: 2,
                                            objectFit: "cover",
                                            bgcolor: palette.background.default,
                                            flexShrink: 0,
                                        }}
                                    />

                                    {/* Content */}
                                    <CardContent
                                        sx={{
                                            p: 0,
                                            flex: 1,
                                        }}
                                    >
                                        <Typography variant="body1" sx={{ textTransform: 'capitalize', fontWeight: 'bold', fontSize: '1rem' }} gutterBottom>
                                            {item.name}
                                        </Typography>

                                        <Stack
                                            direction="row"
                                            flexWrap="wrap"
                                            gap={1}
                                            mt={1}
                                        >
                                            <Tag
                                                icon={<CategoryOutlined fontSize="small" />}
                                                label={item.category}
                                                bgcolor={palette.tagTask.categatory}
                                                color={palette.tagTask.color}
                                            />

                                            <Tag
                                                icon={<Business fontSize="small" />}
                                                label={item.property_name}
                                                bgcolor={palette.tagTask.location}
                                                color={palette.tagTask.color}
                                            />

                                            <Tag
                                                icon={<InventoryOutlined fontSize="small" />}
                                                label={`Qty: ${item.unit?.toLowerCase() === 'container'
                                                    ? (item.quantity || 'N/A')
                                                      + (item.container_type ? ` (${item.container_type.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())})` : '')
                                                    : item.quantity} ${item.unit?.toLowerCase() === 'container' ? '' : item.unit || ''}`}
                                                bgcolor={
                                                    (() => {
                                                        const unit = (item.unit || '').toLowerCase();
                                                        // Parse quantity to numeric for comparison
                                                        const parseQtyNum = (val) => {
                                                            if (!val || val === 'empty') return 0;
                                                            const str = String(val).replace('%', '');
                                                            const num = parseFloat(str);
                                                            return isNaN(num) ? null : num;
                                                        };
                                                        const numQty = parseQtyNum(item.quantity);
                                                        const numLimit = parseQtyNum(item.lower_limit);
                                                        if (numQty === 0 || item.quantity === 'empty') return '#ef535050';
                                                        if (numLimit !== null && numQty !== null && numQty <= numLimit) return '#ff980050';
                                                        return '#4caf5040';
                                                    })()
                                                }
                                                color={palette.tagTask.color}
                                            />

                                            <Tag
                                                icon={<HomeWorkOutlined fontSize="small" />}
                                                label={item.located_at || "N/A"}
                                                bgcolor={palette.tagTask.location}
                                                color={palette.tagTask.color}
                                            />

                                            <Tag
                                                icon={< ProductionQuantityLimitsOutlined fontSize="small" />}
                                                label={`Reorder On  ${item.lower_limit || 'N/A'}`}
                                                bgcolor={palette.tagTask.lower_limit}
                                                color={palette.tagTask.color}
                                            />

                                        </Stack>
                                    </CardContent>

                                    {/* Menu */}
                                    <Box sx={{ position: 'absolute', top: 8, right: 8, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        {canUpdateInventory && (
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                onClick={() => handleOpenUpdateInventory(item)}
                                                sx={{
                                                    textTransform: 'none',
                                                    fontSize: '0.7rem',
                                                    borderRadius: 2,
                                                    py: 0.3,
                                                    px: 1,
                                                    minWidth: 'auto',
                                                    borderColor: palette.primary.main,
                                                    color: palette.primary.main,
                                                    '&:hover': { borderColor: palette.secondary.main, color: palette.secondary.main },
                                                }}
                                            >
                                                Update Quantity
                                            </Button>
                                        )}
                                        {(canUpdateInventory || canDeleteInventory) && (
                                            <IconButton
                                                size="small"
                                                onClick={(event) => {
                                                    setSelectedItem(item);
                                                    setAnchorEl(event.currentTarget);
                                                }}
                                            >
                                                <MoreVert />
                                            </IconButton>
                                        )}
                                    </Box>
                                </Box>

                                {/* Tasks Section */}
                                <Divider />

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
                                            {expandedCardId === item.id ? 'Hide Tasks' : 'Show Tasks'} {item.task_count > 0 && `(${item.task_count})`}
                                        </Typography>
                                        <Stack direction="row" alignItems="center" spacing={1}>
                                            {/* add task button is here it show when the Collapse is open */}
                                            {expandedCardId === item.id && canCreateTask && (
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
                                                    transform: expandedCardId === item.id ? 'rotate(180deg)' : 'rotate(0deg)',
                                                    transition: 'transform 0.3s'
                                                }}
                                            />
                                        </Stack>
                                    </Stack>
                                </Box>

                                <Collapse in={expandedCardId === item.id} timeout="auto" unmountOnExit>
                                    {/* make scrollable area for tasks if more than 1 tasks */}
                                    <Box sx={{
                                        maxHeight: 250,
                                        overflowY: 'auto',
                                    }}>
                                        {(() => {
                                            const taskData = inventoryTaskDataMap[item.id];
                                            const allTasks = taskData?.task_definitions || [];

                                            return allTasks.length > 0 ? (
                                                <Stack spacing={1.5} sx={{ py: 1, px: 1 }}>
                                                    {allTasks.map((task) => (
                                                        <Card
                                                            key={`task-def-${task.id}`}
                                                            elevation={0}
                                                            sx={{
                                                                position: 'relative',
                                                                border: `1px solid ${palette.divider}`,
                                                                borderRadius: 2,
                                                                bgcolor: palette.background.default,
                                                            }}
                                                        >
                                                            <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>

                                                                {(canUpdateTask || canDeleteTask) && (
                                                                    <IconButton
                                                                        size="small"
                                                                        sx={{ position: 'absolute', top: 8, right: 8 }}
                                                                        onClick={(e) => handleTaskMenuOpen(e, task)}
                                                                    >
                                                                        <MoreVert fontSize="small" />
                                                                    </IconButton>
                                                                )}

                                                                <Stack direction="row" spacing={1} alignItems="flex-start">
                                                                    <Box sx={{ flex: 1, pr: 3 }}>
                                                                        {/* Title */}
                                                                        <Typography variant="body1" fontWeight={600} textTransform="capitalize" gutterBottom>
                                                                            {task.title}
                                                                        </Typography>

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

                                                                        {/* Assigned To & Property */}
                                                                        <Stack direction="row" flexWrap="wrap" gap={1} mt={1}>
                                                                            <IconLabel
                                                                                icon={Person}
                                                                                label={task.assigned_to?.name || 'Myself'}
                                                                            />
                                                                            {task.property?.name && (
                                                                                <IconLabel
                                                                                    icon={Business}
                                                                                    label={task.property.name}
                                                                                />
                                                                            )}
                                                                        </Stack>

                                                                        {/* Icons for Photo Required & Inventory Update */}
                                                                        <Stack direction="row" spacing={1} mt={1} alignItems="center" justifyContent="space-between">
                                                                            <Typography variant="body2" color="text.secondary">
                                                                                {`Last Occurrence: ${task.last_occurrence_date ? formatDate(task.last_occurrence_date) : 'N/A'}`}
                                                                            </Typography>
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
                    ))}

                </Grid>
            )}

            {/* Loading indicator for infinite scroll */}
            {isLoadingMore && (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                    <CircularProgress size={24} />
                </Box>
            )}

            <div ref={observerTarget} style={{ height: '20px' }} />

            {inventoryData.length > 9 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 2, mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                        Page {inventoryPagination.page} of {inventoryPagination.totalPages} • Total: {inventoryPagination.total} items
                    </Typography>
                </Box>
            )}

            {/* for task overview card */}
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
                        <Edit fontSize="small" sx={{ color: palette.secondary.main }} />
                    </ListItemIcon>
                    <ListItemText>Edit</ListItemText>
                </MenuItem>

                <MenuItem onClick={openTaskDeleteDialog} dense>
                    <ListItemIcon>
                        <Delete fontSize="small" sx={{ color: palette.secondary.main }} />
                    </ListItemIcon>
                    <ListItemText>Delete</ListItemText>
                </MenuItem>

                <MenuItem onClick={handleDuplicateTask} dense>
                    <ListItemIcon>
                        <FileCopy fontSize="small" sx={{ color: palette.secondary.main }} />
                    </ListItemIcon>
                    <ListItemText>Duplicate</ListItemText>
                </MenuItem>
            </Menu>

            {/* for inventory card menu */}
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
                {canUpdateInventory && (
                    <MenuItem onClick={() => handleEditEnventory(selectedItem)} dense>
                        <ListItemIcon>
                            <Edit fontSize="small" sx={{ color: palette.secondary.main }} />
                        </ListItemIcon>
                        <ListItemText>Edit</ListItemText>
                    </MenuItem>
                )}
                {canDeleteInventory && (
                    <MenuItem onClick={() => openDeleteDialog(selectedItem)} dense>
                        <ListItemIcon>
                            <Delete fontSize="small" sx={{ color: palette.secondary.main }} />
                        </ListItemIcon>
                        <ListItemText>Delete</ListItemText>
                    </MenuItem>
                )}
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

            <UpdateInventoryDialog
                open={openUpdateDialog}
                onClose={handleCloseUpdateDialog}
                inventory={updateItem}
            />

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
                message={
                    <>
                        Deleting this inventory item will also remove{" "}
                        <strong>
                            {(selectedItem?.task_count || 0)}{" "}
                            ASSOCIATED {selectedItem?.task_count === 1 ? "TASK" : "TASKS"}
                        </strong>. This action cannot be undone.
                    </>
                }
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