import React, { useState } from 'react';
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
    Chip,
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
    AccessTime
} from '@mui/icons-material';
import InventoryFilter from './InventoryFilter';

const Tile_View_Inventory = () => {
    const theme = useTheme();
    const { palette } = theme;
    const [filters, setFilters] = useState({});
    const [isFilterVisible, setIsFilterVisible] = useState(false);
    const [isSearchVisible, setIsSearchVisible] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);
    const [expandedCards, setExpandedCards] = useState({});

    const handleFilterToggle = () => {
        setIsFilterVisible((prev) => !prev);
    };

    const handleMenuOpen = (event, item) => {
        setAnchorEl(event.currentTarget);
        setSelectedItem(item);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedItem(null);
    };

    const handleEdit = () => {
        console.log("Edit item:", selectedItem);
        handleMenuClose();
    };

    const handleDelete = () => {
        console.log("Delete item:", selectedItem);
        handleMenuClose();
    };

    const handleApplyFilters = (appliedFilters) => {
        setFilters(appliedFilters);
        console.log("Applied Filters:", appliedFilters);
    };

    const handleCollapseToggle = (cardId) => {
        setExpandedCards(prev => ({
            ...prev,
            [cardId]: !prev[cardId]
        }));
    };

    const inventoryItems = [
        {
            id: 1,
            image: "https://mui.com/static/images/cards/live-from-space.jpg",
            name: "Premium Wireless Headphones",
            category: "Electronics",
            property: "Warehouse A",
            quantity: "147 units",
            tasks: [
                {
                    id: 1,
                    title: "Restock inventory from warehouse",
                    status: "Active",
                    dueDate: "Today"
                },
                {
                    id: 2,
                    title: "Quality check batch",
                    status: "Todo",
                    dueDate: "Tomorrow"
                }
            ]
        },
        {
            id: 2,
            image: "https://mui.com/static/images/cards/paella.jpg",
            name: "Office Desk Chair",
            category: "Furniture",
            property: "Showroom B",
            quantity: "23 units",
            tasks: [
                {
                    id: 3,
                    title: "Update product information",
                    status: "Done",
                    dueDate: "Yesterday"
                }
            ]
        },
        {
            id: 3,
            image: "https://mui.com/static/images/cards/contemplative-reptile.jpg",
            name: "Laptop",
            category: "Electronics",
            property: "Main Building",
            quantity: "2 units",
            tasks: []
        },
        {
            id: 4,
            image: "https://mui.com/static/images/cards/live-from-space.jpg",
            name: "Desk Lamp",
            category: "Accessories",
            property: "RaiChandani",
            quantity: "8 units",
            tasks: [
                {
                    id: 4,
                    title: "Assembly required",
                    status: "Active",
                    dueDate: "Today"
                }
            ]
        },
    ];

    return (
        <Container maxWidth="lg" sx={{ mt: 2, px: 0 }}>
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
                    onChange={(e) => setSearchText(e.target.value)}
                    InputProps={{
                        endAdornment: (
                            <IconButton onClick={() => setSearchText("")}>
                                <Clear />
                            </IconButton>
                        ),
                        sx: { paddingRight: 0 },
                    }}
                    sx={{ mb: 2 }}
                />
            )}

            <Grid container spacing={2}>
                {inventoryItems.map((item) => (
                    <Grid
                        size={{ xs: 12, sm: 6, md: 4 }}
                        item key={item.id}
                    >
                        <Card
                            sx={{
                                pt: 0,
                                borderRadius: 3,
                                position: "relative",
                                transition: "transform 0.2s",
                                "&:hover": {
                                    transform: "scale(1.02)",
                                },
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
                                    image={item.image}
                                    alt={item.name}
                                />
                                <CardContent sx={{ pl: 2, pb: 0, flex: 1 }}>
                                    <Typography variant="body1" sx={{ fontWeight: 600,  }}>
                                        {item.name}
                                    </Typography>

                                    <Stack direction="row" flexWrap="wrap" gap={1} mb={2}>
                                        <Chip
                                            icon={<Category fontSize="small" />}
                                            label={item.category}
                                            variant="outlined"
                                            color="primary"
                                            sx={{
                                                height: 20,
                                                fontSize: "0.65rem",
                                                "& .MuiChip-icon": {
                                                    fontSize: "0.8rem"
                                                },
                                            }}
                                        />


                                        <Chip
                                            size='small'
                                            icon={<HomeWork fontSize='small' />}
                                            label={item.property}
                                            variant="outlined"
                                            color="secondary"
                                            sx={{
                                                height: 20,            
                                                fontSize: "0.65rem",   
                                                "& .MuiChip-icon": {
                                                    fontSize: "0.8rem"    
                                                },
                                            }}
                                        />

                                        <Chip
                                            size='small'
                                            icon={<Inventory fontSize='small' />}
                                            label={`Qty: ${item.quantity}`}
                                            variant="outlined"
                                            color="success"
                                            sx={{
                                                height: 20,             
                                                fontSize: "0.65rem",   
                                                "& .MuiChip-icon": {
                                                    fontSize: "0.8rem"   
                                                },
                                            }}
                                        />
                                    </Stack>
                                </CardContent>
                                <IconButton
                                    onClick={(event) => handleMenuOpen(event, item)}
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
                            <Divider sx={{py: 0.5}} />
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
                            <Divider sx={{ mx: 2 }} />

                            <Collapse in={expandedCards[item.id]} timeout="auto" unmountOnExit>
                                <Box sx={{ px: 1, }}>
                                    {item.tasks.length > 0 ? (
                                        <Box>
                                            <Stack direction="row" alignItems="center" justifyContent="space-between" >
                                                <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: '0.75rem', color: palette.text.secondary }}>
                                                    TASKS
                                                </Typography>
                                                <Button
                                                    size="small"
                                                    startIcon={<Add />}
                                                    sx={{
                                                        textTransform: 'none',
                                                        color: palette.primary.main,
                                                        fontSize: '0.75rem'
                                                    }}
                                                >
                                                    Add
                                                </Button>
                                            </Stack>
                                            <List dense>
                                                {item.tasks.map((task) => (
                                                    <ListItem
                                                        key={task.id}
                                                        sx={{
                                                            px: 0,
                                                            py: 0.5,
                                                            borderRadius: 1,
                                                            mb: 0.5
                                                        }}
                                                    >
                                                        <ListItemAvatar sx={{ minWidth: 32 }}>
                                                            {task.status === 'Done' ? (
                                                                <CheckCircle
                                                                    fontSize="small"
                                                                    sx={{ color: palette.success.main }}
                                                                />
                                                            ) : task.status === 'Active' ? (
                                                                <AccessTime
                                                                    fontSize="small"
                                                                    sx={{ color: palette.warning.main }}
                                                                />
                                                            ) : (
                                                                <RadioButtonUnchecked
                                                                    fontSize="small"
                                                                    sx={{ color: palette.text.secondary }}
                                                                />
                                                            )}
                                                        </ListItemAvatar>
                                                        <ListItemText
                                                            primary={
                                                                <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                                                                    {task.title}
                                                                </Typography>
                                                            }
                                                            secondary={`Due: ${task.dueDate}`}
                                                            sx={{ margin: 0 }}
                                                        />
                                                        <Chip
                                                            label={task.status}
                                                            size="small"
                                                            color={
                                                                task.status === 'Done' ? 'success' :
                                                                    task.status === 'Active' ? 'warning' : 'default'
                                                            }
                                                            sx={{ ml: 1, fontSize: '0.7rem', height: 20 }}
                                                        />
                                                    </ListItem>
                                                ))}
                                            </List>
                                        </Box>
                                    ) : (
                                        <Typography variant="body2" color="text.secondary">
                                            No tasks assigned to this inventory item.
                                        </Typography>
                                    )}
                                </Box>
                            </Collapse>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
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
                <MenuItem onClick={handleEdit} dense>
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

            <InventoryFilter
                open={isFilterVisible}
                onClose={() => setIsFilterVisible(false)}
                onApplyFilters={handleApplyFilters}
            />
        </Container>
    );
};

export default Tile_View_Inventory;