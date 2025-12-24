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

import {taskStatusFilter, } from "../../../constant";
import { useTaskContext } from "./TaskManagement";




const TaskFilter = ({ open, onClose, onApplyFilters, initialFilters = {} }) => {
    const [AssignTo, setAssignTo] = useState(null);
    const [selectedProperty, setSelectedProperty] = useState(null);
    const [Status, setStatus] = useState("");
    const [isFilter, setIsFilter] = useState(false);
    const theme = useTheme();
    const { palette } = theme;

    // get data form context
    const {
        teamMembers,
        properties
    } = useTaskContext();

   // console.log("teamMembers in filter:", teamMembers);
    useEffect(() => {
        if (initialFilters.assigned_to) {
            setAssignTo(initialFilters.assigned_to);
            setIsFilter(true);
        }
        if (initialFilters.status) {
            setStatus(initialFilters.status);
            setIsFilter(true);
        }
        if (initialFilters.property_id) {
            setSelectedProperty(initialFilters.property_id);
            setIsFilter(true);
        }
    }, [initialFilters]);

    const handleFilterApply = () => {
        const filters = {
            assigned_to: AssignTo,
            status: Status,
            property_id: selectedProperty,
        };
        setIsFilter(true);
        onApplyFilters(filters);
        onClose();
    };

    const handleClearFilters = () => {
        setAssignTo(null);
        setStatus("");
        setSelectedProperty(null);
        setIsFilter(false);
        onApplyFilters({ assigned_to: null, status: "", property_id: null });
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

                <Autocomplete
                    size="small"
                    value={properties.find((property) => property.id === selectedProperty) || null}
                    onChange={(event, newValue) => {
                        setSelectedProperty(newValue ? newValue.id : null);
                    }}
                    options={properties}
                    getOptionLabel={(option) => option.name || ""}
                    renderOption={(props, option) => (
                        <li {...props} key={option.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{option.name}</span>
                            {option.image_url && (
                                <img
                                    src={option.image_url}
                                    alt={option.name || ''}
                                    style={{ width: 30, height: 30, objectFit: 'cover', borderRadius: 100, marginLeft: 8 }}
                                />
                            )}
                        </li>
                    )}
                    renderInput={(params) => (
                        <TextField {...params} label="Property" placeholder="Select property" />
                    )}
                    sx={{ mb: 3 }}
                />

                <FormControl fullWidth>
                    <TextField
                        select
                        label="Status"
                        size="small"
                        sx={{ mb: 3 }}
                        value={Status}
                        onChange={(event) => setStatus(event.target.value)}
                    >
                        {taskStatusFilter.map((status) => (
                            <MenuItem key={status.value} value={status.value} dense>
                                {status.label}
                            </MenuItem>
                        ))}
                    </TextField>
                </FormControl>
                <Button
                    variant="contained"
                    disableElevation
                    color="primary"
                    fullWidth
                    sx={{ mt: 1, bgcolor: palette.primary.main, '&:hover': { bgcolor: palette.secondary.main } ,borderRadius:10, textTransform: 'none'}}
                    onClick={handleFilterApply}
                >
                    Apply Filters
                </Button>
            </Box>
        </Drawer>
    );
};

export default TaskFilter;
