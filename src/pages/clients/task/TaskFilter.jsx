import React, { useState } from "react";
import {
    Drawer,
    Box,
    Typography,
    Button,
    TextField,
    Autocomplete,
    FormControl,
    MenuItem,
    Stack,
    useTheme,
} from "@mui/material";

const assignees = ["John", "Jane", "Doe", "Smith", "Emily", "Michael", "Sarah", "David"];
const statuses = ["Pending", "Active"];
const taskTypes = ["Cleaning", "Inspection"];

const TaskFilter = ({ open, onClose, onApplyFilters }) => {
    const [AssignTo, setAssignTo] = useState(null);
    const [Status, setStatus] = useState("");
    const [TaskType, setTaskType] = useState("");
    const [isFilter, setIsFilter] = useState(false);

    const theme = useTheme();
    const { palette } = theme;

    const handleFilterApply = () => {
        const filters = {
            AssignTo,
            Status,
            TaskType,
        };
        setIsFilter(true);
        onApplyFilters(filters);
        onClose();
    };

    const handleClearFilters = () => {
        setAssignTo(null);
        setStatus("");
        setTaskType("");
        setIsFilter(false);
        onApplyFilters({ AssignTo: null, Status: "", TaskType: "" });
    };

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: { width: 280, padding: 2, bgcolor: palette.background.paper },
            }}
        >
            <Box>
                <Stack spacing={2} direction="row" alignItems="center" justifyContent="space-between" mb={2}>
                    <Typography variant="h6" color={palette.text.primary}>
                        Filter Tasks
                    </Typography>
                    {isFilter && (
                        <Button
                            variant="text"
                            size="small"
                            onClick={handleClearFilters}
                            sx={{ textTransform: 'none', color: palette.error.main }}
                        >
                            Clear Filters
                        </Button>
                    )}
                </Stack>

                {/* Assignee Filter */}
                <Autocomplete
                    size="small"
                    value={AssignTo}
                    onChange={(event, newValue) => {
                        setAssignTo(newValue);
                    }}
                    options={assignees}
                    renderInput={(params) => (
                        <TextField {...params} label="Assign To" />
                    )}
                    sx={{ mb: 3 }}
                />

                {/* Status Filter */}
                <FormControl fullWidth>
                    <TextField
                        select
                        label="Status"
                        size="small"
                        sx={{ mb: 3 }}
                        value={Status}
                        onChange={(event) => setStatus(event.target.value)}
                    >
                        {statuses.map((status) => (
                            <MenuItem key={status} value={status}>
                                {status}
                            </MenuItem>
                        ))}
                    </TextField>
                </FormControl>

                {/* Task Type Filter */}
                <FormControl fullWidth>
                    <TextField
                        select
                        label="Task Type"
                        size="small"
                        sx={{ mb: 3 }}
                        value={TaskType}
                        onChange={(event) => setTaskType(event.target.value)}
                    >
                        {taskTypes.map((type) => (
                            <MenuItem key={type} value={type}>
                                {type}
                            </MenuItem>
                        ))}
                    </TextField>
                </FormControl>

                <Button
                    variant="contained"
                    disableElevation
                    color="primary"
                    fullWidth
                    sx={{ mt: 1, bgcolor: palette.primary.main, '&:hover': { bgcolor: palette.secondary.main } }}
                    onClick={handleFilterApply}
                >
                    Apply Filters
                </Button>
            </Box>
        </Drawer>
    );
};

export default TaskFilter;
