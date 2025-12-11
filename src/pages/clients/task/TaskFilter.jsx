import React, { useEffect, useState } from "react";
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

import { taskTypes, scheduleTypes, statusOpts, } from "../../../constant";
import { useTaskContext } from "./TaskManagement";




const TaskFilter = ({ open, onClose, onApplyFilters, viewMode, initialFilters = {} }) => {
    const [AssignTo, setAssignTo] = useState(null);
    const [Status, setStatus] = useState("");
    const [TaskType, setTaskType] = useState("");
    const [ScheduleType, setScheduleType] = useState("");
    const [isFilter, setIsFilter] = useState(false);
    const theme = useTheme();
    const { palette } = theme;

    // get data form context
    const {
        teamMembers,
    } = useTaskContext();

    // // Apply initial filters on mount
    // useEffect(() => {
    //     if (initialFilters) {
    //         setAssignTo(initialFilters.assigned_to || null);
    //         setStatus(initialFilters.status || "");
    //         setTaskType(initialFilters.task_type || "");
    //         setScheduleType(initialFilters.schedule_type || "");
    //         setIsFilter(
    //             initialFilters.assigned_to ||
    //             initialFilters.status ||
    //             initialFilters.task_type ||
    //             initialFilters.schedule_type
    //         );
    //     }
    // }, [initialFilters]);
     // Update filter states when initialFilters change
    useEffect(() => {
        if (initialFilters.assigned_to) {
            setAssignTo(initialFilters.assigned_to);
            setIsFilter(true);
        }
        if (initialFilters.status) {
            setStatus(initialFilters.status);
            setIsFilter(true);
        }
        if (initialFilters.task_type) {
            setTaskType(initialFilters.task_type);
            setIsFilter(true);
        }
        if (initialFilters.schedule_type) {
            setScheduleType(initialFilters.schedule_type);
            setIsFilter(true);
        }
    }, [initialFilters]);

    const handleFilterApply = () => {
        const filters = {
            assigned_to: AssignTo,
            status: Status,
            task_type: TaskType,
            schedule_type: ScheduleType,
        };
        setIsFilter(true);
        onApplyFilters(filters);
        onClose();
    };

    const handleClearFilters = () => {
        setAssignTo(null);
        setStatus("");
        setTaskType("");
        setScheduleType("");
        setIsFilter(false);
        onApplyFilters({ assigned_to: null, status: "", task_type: "", schedule_type: "" });
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
                    value={teamMembers.find((member) => member.id === AssignTo) || null}
                    onChange={(event, newValue) => {
                        // set id of selected team member
                        setAssignTo(newValue ? newValue.id : null);
                    }}
                    options={teamMembers}
                    getOptionLabel={(option) => option.name || ""}
                    renderInput={(params) => (
                        <TextField {...params} label="Assign To" />
                    )}
                    sx={{ mb: 3 }}
                />

                {/* Status Filter only show when the view mode is Active Tasks */}
                {viewMode === 'activeTasks' &&
                    <FormControl fullWidth>
                        <TextField
                            select
                            label="Status"
                            size="small"
                            sx={{ mb: 3 }}
                            value={Status}
                            onChange={(event) => setStatus(event.target.value)}
                        >
                            {statusOpts.map((status) => (
                                <MenuItem key={status.value} value={status.value} dense>
                                    {status.label}
                                </MenuItem>
                            ))}
                        </TextField>
                    </FormControl>
                }

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
                            <MenuItem key={type} value={type} dense>
                                {type}
                            </MenuItem>
                        ))}
                    </TextField>
                </FormControl>
                {/* Schedule Type Filter when the view mode is Task Planner */}
                {viewMode === 'taskPlanner' &&
                    <FormControl fullWidth>
                        <TextField
                            select
                            label="Schedule Type"
                            size="small"
                            sx={{ mb: 3 }}
                            value={ScheduleType}
                            onChange={(event) => setScheduleType(event.target.value)}
                        >
                            {scheduleTypes.map((type) => (
                                <MenuItem key={type} value={type} dense>
                                    {type.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                                </MenuItem>
                            ))}
                        </TextField>
                    </FormControl>
                }

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
