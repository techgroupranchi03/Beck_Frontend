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
    Accordion,
    AccordionSummary,
    AccordionDetails,
    List,
    ListItem,
    ListItemAvatar,
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
    Category,
    HomeWork,
    Inventory,
    Edit,
    Delete,
    ExpandMore,
    Add,
    RadioButtonUnchecked,
    CheckCircle,
    AccessTime,
    LocationOn,
    LocationOnOutlined,
    CategoryOutlined,
    InventoryOutlined,
    HomeWorkOutlined,
    Assignment,
    Schedule,
    ScheduleOutlined,
    Alarm,
    Person,
    CalendarMonthOutlined,
    Camera,
    CameraAltOutlined,
    Business,
    PhotoCamera,
    Update
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

const Tile_View_Inventory = () => {
    const theme = useTheme();
    const { palette } = theme;
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

    const observerTarget = useRef(null);



    // get Data from context 
    const {
        inventoryData,
        loading,
        fetchInventoryItems,
        inventoryPagination,
        deleteInventory,
    } = useInventoryContext();

    //console.log("Inventory Data in Tile View:", inventoryData);

    const handleFilterToggle = () => {
        setIsFilterVisible((prev) => !prev);
    };

    // handle edit task planner
    const handleEditTaskPlanner = (task) => {
        setSelectedTask(task);
        setOpenTaskDialog(true);
    };

    const handleEditActiveTask = (task) => {
        setSelectedTask(task);
        setOpenTaskDialog(true);
    };

    const handleEdit = (inventory) => {
        setSelectedItem(inventory);
        setOpenAddEditDialog(true);
        //  console.log("Edit item:", inventory);
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

    // reset page when filters or search text changes
    useEffect(() => {
        setCurrentPage(1);
    }, [filters, searchText]);

    // Infinite scroll - load more inventory items
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

    // Intersection Observer for infinite scroll
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
        <Container maxWidth="mx" sx={{ mt: 2, px: 0 }}>
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

                    {/* <ViewToggle /> */}
                </Stack>
            </Box>

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
                        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={`skeleton-${index}`}>
                            <CardSkeleton />
                        </Grid>
                    ))
                ) : (inventoryData.map((item) => (
                    <Grid
                        size={{ xs: 12, sm: 6, md: 4 }}
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
                                    <ExpandMore
                                        fontSize="small"
                                        sx={{
                                            transform: expandedCards[item.id] ? 'rotate(180deg)' : 'rotate(0deg)',
                                            transition: 'transform 0.3s'
                                        }}
                                    />
                                </Stack>
                            </Box>

                            <Collapse in={expandedCards[item.id]} timeout="auto" unmountOnExit>

                                <Stack direction="row" alignItems="center" justifyContent="flex-start" py={1} px={1} >
                                    <Button
                                        size="small"
                                        startIcon={<Add />}
                                        onClick={() => {
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
                                </Stack>
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
                                                                onClick={() => {
                                                                    if (task.taskSource === 'planner') {
                                                                        handleEditTaskPlanner(task);
                                                                    } else {
                                                                        handleEditActiveTask(task);
                                                                    }
                                                                }}
                                                            >
                                                                <Edit fontSize="small" />
                                                            </IconButton>

                                                            <Stack direction="row" spacing={1} alignItems="flex-start">
                                                                {/* Content */}
                                                                <Box sx={{ flex: 1, pr: 3 }}>
                                                                    <Typography variant="body1" fontWeight={600} textTransform="capitalize" gutterBottom>
                                                                        {task.title}
                                                                    </Typography>

                                                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                                                        <ViewMoreText text={task.description} limit={40} />
                                                                    </Typography>

                                                                    {/* Repeat Days for Recurring Tasks */}
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

                                                                    {/* Task Type & Status */}
                                                                    <Stack
                                                                        spacing={1}
                                                                        mb={1}
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
                                                                                label={task.task_type?.replace('_', ' ') || 'N/A'}
                                                                                size="small"
                                                                            />
                                                                        </Tooltip>
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

                                                                    {/* Task Metadata */}
                                                                    <Stack direction="row" gap={1} flexWrap="wrap" mb={1}>
                                                                        {task.taskSource === 'planner' ? (
                                                                            <>
                                                                                {task.start_date && (
                                                                                    <IconLabel icon={CalendarMonthOutlined} label={formatDate(task.start_date)} />
                                                                                )}
                                                                                {task.assigned_to_name && (
                                                                                    <IconLabel icon={Person} label={task.assigned_to_name} />
                                                                                )}
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                {task.scheduled_date && (
                                                                                    <IconLabel icon={CalendarMonthOutlined} label={formatDate(task.scheduled_date)} />
                                                                                )}
                                                                                {task.assigned_to_name && (
                                                                                    <IconLabel icon={Person} label={task.assigned_to_name} />
                                                                                )}
                                                                            </>
                                                                        )}
                                                                    </Stack>

                                                                    {/* Icons for Photo Required & Update Inventory */}
                                                                    <Stack direction="row" spacing={1} mt={1} alignItems="center">
                                                                        {!!task.is_photo_required && (
                                                                            <PhotoCamera sx={{ color: palette.text.secondary }} />
                                                                        )}
                                                                        {!!task.update_inventory && (
                                                                            <Update sx={{ color: palette.text.secondary }} />
                                                                        )}
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

            {/* Intersection observer target */}
            <div ref={observerTarget} style={{ height: '20px' }} />

            {/* pagination info */}
            {inventoryData.length > 9 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 2, mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                        Page {inventoryPagination.page} of {inventoryPagination.totalPages} • Total: {inventoryPagination.total} items
                    </Typography>
                </Box>
            )}

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
                PaperProps={{
                    elevation: 2,
                    sx: {
                        borderRadius: 2,
                        p: 1,
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
                <MenuItem onClick={() => handleEdit(selectedItem)} dense>
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
        </Container>
    );
};

export default Tile_View_Inventory;