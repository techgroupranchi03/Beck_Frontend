import React, { useEffect, useState } from "react";
import {
    Drawer,
    Box,
    Typography,
    Button,
    TextField,
    Autocomplete,
    Stack,
    useTheme,
} from "@mui/material";
import { taskStatusFilter, } from "../../../constant";
import { useTaskContext } from "./TaskManagement";

const TaskFilter = ({ open, onClose, onApplyFilters, initialFilters = {} }) => {
    const [AssignTo, setAssignTo] = useState([]);
    const [selectedProperty, setSelectedProperty] = useState([]);
    const [Status, setStatus] = useState([]);
    const [isFilter, setIsFilter] = useState(false);
    const theme = useTheme();
    const { palette } = theme;

    const {
        teamMembers,
        properties
    } = useTaskContext();

    useEffect(() => {
        if (initialFilters.assigned_to > 0) {
            setAssignTo(Array.isArray(initialFilters.assigned_to) ? initialFilters.assigned_to : [initialFilters.assigned_to]);
            setIsFilter(true);
        }
        if (initialFilters.status > 0) {
            setStatus(Array.isArray(initialFilters.status) ? initialFilters.status : [initialFilters.status]);
            setIsFilter(true);
        }
        if (initialFilters.property_id > 0) {
            setSelectedProperty(Array.isArray(initialFilters.property_id) ? initialFilters.property_id : [initialFilters.property_id]);
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
        setAssignTo([]);
        setStatus([]);
        setSelectedProperty([]);
        setIsFilter(false);
        onApplyFilters({ assigned_to: [], status: [], property_id: [] });
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
                    multiple
                    limitTags={2}
                    value={AssignTo.map(id => teamMembers.find(member => member.id === id)).filter(Boolean)}
                    onChange={(event, newValue) => {
                        setAssignTo(newValue.map(v => v.id));
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
                    multiple
                    limitTags={2}
                    value={selectedProperty.map(id => properties.find(p => p.id === id)).filter(Boolean)}
                    onChange={(event, newValue) => {
                        setSelectedProperty(newValue.map(v => v.id));
                    }}
                    options={properties}
                    getOptionLabel={(option) => option.name || ""}
                    renderOption={(props, option) => (
                        <li {...props} key={option.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{option.name}</span>
                            {option.property_image_url && (
                                <img
                                    src={option.property_image_url}
                                    alt={option.name || ''}
                                    style={{ width: 30, height: 30, objectFit: 'cover', borderRadius: 100, marginLeft: 8 }}
                                />
                            )}
                        </li>
                    )}
                    renderInput={(params) => (
                        <TextField {...params} label="Property" placeholder="Select properties" />
                    )}
                    sx={{ mb: 3 }}
                />

                <Autocomplete
                    size="small"
                    multiple
                    limitTags={2}
                    value={Status}
                    onChange={(event, newValue) => {
                        setStatus(newValue);
                    }}
                    options={taskStatusFilter.map(s => s.value)}
                    getOptionLabel={(option) => {
                        const status = taskStatusFilter.find(s => s.value === option);
                        return status ? status.label : option;
                    }}
                    renderInput={(params) => (
                        <TextField {...params} label="Status" placeholder="Select status" />
                    )}
                    sx={{ mb: 3 }}
                />

                <Button
                    variant="contained"
                    disableElevation
                    color="primary"
                    fullWidth
                    sx={{ mt: 1, bgcolor: palette.primary.main, '&:hover': { bgcolor: palette.secondary.main }, borderRadius: 10, textTransform: 'none' }}
                    onClick={handleFilterApply}
                >
                    Apply Filters
                </Button>

            </Box>

        </Drawer>
    );
};

export default TaskFilter;
