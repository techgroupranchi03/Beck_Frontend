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
    CalendarMonthOutlined
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
    const [viewMode, setViewMode] = useState(() => {
        const savedMode = localStorage.getItem('inventoryViewMode');
        return savedMode ? savedMode : 'taskPlanner';
    });
    
    const observerTarget = useRef(null);
    


    // get Data from context 
    const {
        inventoryData,
        properties,
        units,
        containerOptions,
        loading,
        deleteInventory,
        fetchInventoryItems,
        inventoryPagination,
    } = useInventoryContext();

    const handleViewModeChange = (event) => {
        setViewMode(event.target.value);
        localStorage.setItem('inventoryViewMode', event.target.value);
    };

    // console.log("Inventory Data in Tile View:", inventoryData);

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

    const handleDelete = () => {
        //console.log("Delete item:", selectedItem);
        setAnchorEl(null);
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
                    <Box width="100%" textAlign="center" py={4}>
                        <Typography>Loading inventory...</Typography>
                    </Box>
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
                            <Box display="flex" alignItems="flex-start">
                                <CardMedia
                                    component="img"
                                    sx={{
                                        borderRadius: 3,
                                        ml: 2,
                                        mt: 2,
                                        width: 80,
                                        height: 80,
                                        objectFit: 'cover',
                                        bgcolor: palette.background.default,
                                    }}
                                    image={item.image_url}
                                    alt={item.name}
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
                                            icon={<LocationOnOutlined size="small" />}
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

                                <Stack direction="row" alignItems="center" justifyContent="space-between" py={1} px={1} >
                                    <Button
                                        size="small"
                                        startIcon={<Add />}
                                        disabled={viewMode === 'activeTasks'}
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

                                    <Select
                                        value={viewMode}
                                        onChange={handleViewModeChange}
                                        size="small"
                                        sx={{ fontSize: '0.75rem' }}
                                    >
                                        <MenuItem value="taskPlanner">Task Planner</MenuItem>
                                        <MenuItem value="activeTasks">Active Tasks</MenuItem>
                                    </Select>
                                </Stack>
                                {/* make scrollable area for tasks if more than 1 tasks */}
                                <Box sx={{
                                    maxHeight: 200,
                                    overflowY: 'auto',
                                }}>
                                    {viewMode === 'taskPlanner' ? (
                                        // Task Planner View
                                        item.task_planner && item.task_planner.length > 0 ? (
                                            <List dense sx={{ py: 0, px: 1 }}>
                                                {item.task_planner.map((task) => (
                                                    <ListItem
                                                        key={task.id}
                                                        alignItems="flex-start"

                                                        sx={{
                                                            position: 'relative',
                                                            border: `1px solid ${palette.primary.light}`,
                                                            borderRadius: 2,
                                                            mb: 1,
                                                            bgcolor: palette.background.default,

                                                        }}
                                                    >
                                                        <IconButton
                                                            size="small"
                                                            sx={{ position: 'absolute', top: 8, right: 8 }}
                                                            onClick={() => { handleEditTaskPlanner(task) }}
                                                        >
                                                            <Edit fontSize="small" />
                                                        </IconButton>
                                                        {/* Avatar */}
                                                        <ListItemAvatar>
                                                            <Avatar sx={{ bgcolor: palette.secondary.main, width: 35, height: 35 }}>
                                                                <ScheduleOutlined fontSize="small" />
                                                            </Avatar>
                                                        </ListItemAvatar>

                                                        {/* Title + Description + Chips (all in one column on the right) */}
                                                        <ListItemText
                                                            primary={
                                                                <Typography variant="body1" textTransform="capitalize">
                                                                    {task.title}
                                                                </Typography>
                                                            }
                                                            secondary={
                                                                <Box>
                                                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                                                        <ViewMoreText text={task.description} limit={40} />
                                                                    </Typography>

                                                                    {/* Chips below the description */}
                                                                    <Stack direction="row" gap={1} flexWrap="wrap" mb={1}>

                                                                        <Chip
                                                                            label={task.schedule_type}
                                                                            variant="outlined"
                                                                            size="small"
                                                                            avatar={<Alarm fontSize="small" />}
                                                                            sx={{ borderRadius: 1 }}
                                                                        />
                                                                        <Chip
                                                                            label={task.assigned_to_name}
                                                                            variant="outlined"
                                                                            size="small"
                                                                            avatar={<Person fontSize="small" />}
                                                                            sx={{ borderRadius: 1 }}
                                                                        />
                                                                        <Chip
                                                                            label={task.task_type}
                                                                            size="small"
                                                                            variant="outlined"
                                                                            avatar={<Assignment fontSize="small" />}
                                                                            sx={{

                                                                                borderRadius: 1,

                                                                            }}
                                                                        />

                                                                        <Chip
                                                                            label={formatDate(task.start_date)}
                                                                            variant="outlined"
                                                                            size="small"
                                                                            avatar={<CalendarMonthOutlined fontSize="small" />}
                                                                            sx={{ borderRadius: 1 }}
                                                                        />
                                                                        {!!task.is_photo_required && (
                                                                            <Chip
                                                                                label="📷 Photo Required "
                                                                                variant="outlined"
                                                                                size="small"
                                                                                sx={{ borderRadius: 1 }}
                                                                            />
                                                                        )}
                                                                    </Stack>
                                                                </Box>
                                                            }
                                                            sx={{ my: 0 }}
                                                        />
                                                    </ListItem>
                                                ))}
                                            </List>
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
                                                    No scheduled tasks for this inventory
                                                </Typography>
                                            </Box>
                                        )
                                    ) : (
                                        // Active Tasks View
                                        item.task_instances && item.task_instances.length > 0 ? (
                                            <List dense sx={{ py: 0, px: 1 }}>
                                                {item.task_instances.map((task) => (
                                                    <ListItem
                                                        key={task.id}
                                                        sx={{
                                                            border: `1px solid ${palette.primary.light}`,
                                                            borderRadius: 2,
                                                            mb: 1,
                                                            position: 'relative',
                                                            bgcolor: palette.background.default,

                                                        }}
                                                    >
                                                        {/* edit icon */}
                                                        <IconButton
                                                            size="small"
                                                            sx={{ position: 'absolute', top: 8, right: 8 }}
                                                            onClick={() => handleEditActiveTask(task)}
                                                        >
                                                            <Edit fontSize="small" />
                                                        </IconButton>

                                                        <ListItemAvatar>
                                                            <IconButton size="small">
                                                                {task.status === 'completed' ? (
                                                                    <CheckCircle color="success" />
                                                                ) : (
                                                                    <RadioButtonUnchecked color="disabled" />
                                                                )}
                                                            </IconButton>
                                                        </ListItemAvatar>
                                                        <Box sx={{ flex: 1 }}>
                                                            <Typography
                                                                variant="body2"
                                                                sx={{

                                                                    textTransform: "capitalize",
                                                                }}
                                                            >
                                                                {task.title}
                                                            </Typography>
                                                            <Typography variant="body2" color="text.secondary">
                                                                <ViewMoreText text={task.description} limit={40} />
                                                            </Typography>
                                                            <Stack direction="row" flexWrap="wrap" gap={0.5} mt={0.5}>
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
                                                                <Chip
                                                                    label={task.task_type}
                                                                    size="small"
                                                                    variant='outlined'

                                                                    avatar={<Assignment fontSize='small' />}
                                                                    sx={{
                                                                        borderRadius: 1,
                                                                        textTransform: "capitalize",
                                                                    }}
                                                                />
                                                                <Chip
                                                                    label={task.assigned_to_name}
                                                                    size="small"
                                                                    variant='outlined'

                                                                    avatar={<Person fontSize='small' />}
                                                                    sx={{
                                                                        textTransform: "capitalize",
                                                                        borderRadius: 1,
                                                                    }}
                                                                />
                                                                {!!task.is_photo_required && (
                                                                    <Chip
                                                                        label="📷 Photo Required "
                                                                        variant="outlined"
                                                                        size="small"
                                                                        sx={{ borderRadius: 1 }}
                                                                    />
                                                                )}
                                                                <Chip
                                                                    label={formatDate(task.scheduled_date)}
                                                                    size="small"
                                                                    variant='outlined'
                                                                    textTransform="capitalize"
                                                                    avatar={<CalendarMonthOutlined fontSize='small' />}
                                                                    sx={{

                                                                        textTransform: "capitalize",
                                                                        borderRadius: 1,
                                                                        fontSize: '0.75rem',
                                                                    }}
                                                                />
                                                            </Stack>
                                                        </Box>
                                                    </ListItem>
                                                ))}
                                            </List>
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
                                                    No active tasks for this inventory
                                                </Typography>
                                            </Box>
                                        )
                                    )}
                                </Box>
                            </Collapse>
                        </Card>
                    </Grid>
                )))}
            </Grid>

            {/* Loading indicator for infinite scroll */}
            {isLoadingMore && (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <CardSkeleton />
                </Box>
            )}

            {/* Intersection observer target */}
            <div ref={observerTarget} style={{ height: '20px' }} />

            {/* pagination info */}
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 2, mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                    Page {inventoryPagination.page} of {inventoryPagination.totalPages} • Total: {inventoryPagination.total} items
                </Typography>
            </Box>

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
                <MenuItem onClick={handleDelete} dense>
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
                viewmode={viewMode}
            />

            <InventoryTask_AddEdit_Dialog
                open={openTaskDialog}
                onClose={handleCloseTaskDialog}
                task={selectedTask}
                viewMode={viewMode}
                inventoryId={selectedInventoryId}
            />

            <InventoryFilter
                open={isFilterVisible}
                onClose={() => setIsFilterVisible(false)}
                onApplyFilters={handleApplyFilters}
            />
        </Container>
    );
};

export default Tile_View_Inventory;