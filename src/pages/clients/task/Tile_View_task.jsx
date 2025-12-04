import React, { useState } from "react";
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
    Select
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
    SearchOff
} from "@mui/icons-material";
import ViewMoreText from "../../../resuable_components/ViewMore.jsx";
import ImageViewer from "../../../resuable_components/ImageViewer.jsx";
import TaskFilter from "./TaskFilter";
import TileView_AddEdit_Dialog from "./TileView_AddEdit_Dialog.jsx";
import { tasks } from "../data/tasks.js";

export const Tile_View_task = () => {
    const [viewMode, setViewMode] = useState("taskPlanner");
    const [openAddEditDialog, setOpenAddEditDialog] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [openImage, setOpenImage] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);
    const [isSearchVisible, setIsSearchVisible] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [isFilterVisible, setIsFilterVisible] = useState(false);
    const [filters, setFilters] = useState({});

    const theme = useTheme();
    const { palette } = theme;

    const handleEdit = (task) => {
        setSelectedTask(task);
        setOpenAddEditDialog(true);
        setAnchorEl(null);
    };

    const handleDelete = () => {
        console.log("Delete clicked");
        setAnchorEl(null);
    };

    const handleFilterToggle = () => {
        setIsFilterVisible((prev) => !prev);
    };

    const handleApplyFilters = (appliedFilters) => {
        setFilters(appliedFilters);
    };

    const handleSaveTask = () => {
        setOpenAddEditDialog(false);
        setSelectedTask(null);
    };

    return (
        <Container maxWidth="mx" sx={{ mt: 2, px: 0 }}>
            {/* ---------- Header + Filter ---------- */}
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

            {/* TaskFilter Drawer */}
            <TaskFilter
                open={isFilterVisible}
                onClose={handleFilterToggle}
                onApplyFilters={handleApplyFilters}
            />


            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2, mr: 1 }}>
                <Select
                    value={viewMode}
                    onChange={(e) => setViewMode(e.target.value)}
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



            {/* ---------- Task Grid ---------- */}
            <Grid container spacing={1}>
                {tasks.map((task) => (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={task.id}>
                        <Card
                            sx={{
                                borderRadius: 3,
                                boxShadow: 1,
                                bgcolor: palette.background.paper,
                            }}
                        >
                            <CardHeader
                                sx={{ pb: 0 }}
                                title={
                                    <Typography variant="h6" color="text.primary">
                                        {task.task_name}
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
                                        <span>
                                            <Chip
                                                label={task.task_type}
                                                size="small"
                                                sx={{
                                                    bgcolor: palette.primary.main,
                                                    color: "#fff",
                                                    fontWeight: 600,
                                                    cursor: "pointer",
                                                }}
                                            />
                                        </span>
                                    </Tooltip>

                                    <Tooltip placement="top" arrow title="Task Status">
                                        <Chip
                                            label={task.status}
                                            size="small"
                                            color={
                                                task.status === "Completed"
                                                    ? "success"
                                                    : task.status === "In Progress"
                                                        ? "warning"
                                                        : "error"
                                            }
                                        />
                                    </Tooltip>
                                </Stack>
                                <Stack direction="row" flexWrap="wrap" gap={1}>
                                    <Chip
                                        label={task.property}
                                        variant="outlined"
                                        size="small"
                                        avatar={<Business size="small" />}
                                        sx={{ fontWeight: 600, borderRadius: 1 }}
                                    />
                                    <Chip
                                        label={`${task.due_in_days} `}
                                        variant="outlined"
                                        size="small"
                                        icon={<Alarm fontSize="medium" />}
                                        sx={{ fontWeight: 600, borderRadius: 1 }}
                                    />
                                    <Chip
                                        label={task.assigned_to}
                                        variant="outlined"
                                        size="small"
                                        avatar={<Person size="small" />}
                                        sx={{ fontWeight: 600, borderRadius: 1 }}
                                    />
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
                ))}
            </Grid>

            {/* EDIT AND DELETE ICON BUTTON  */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
                // point to the morevert icon
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
                <MenuItem onClick={() => handleEdit(selectedTask)} dense>
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

            <ImageViewer
                open={openImage}
                onClose={() => setOpenImage(false)}
                image={selectedImage}
            />

            {/* Add/Edit Task Dialog */}
            <TileView_AddEdit_Dialog
                open={openAddEditDialog}
                onClose={() => setOpenAddEditDialog(false)}
                onSave={handleSaveTask}
                task={selectedTask}
            />
        </Container>
    );
};
