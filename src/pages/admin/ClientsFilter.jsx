import React, { useEffect, useState } from "react";
import {
    Drawer,
    Box,
    Typography,
    Button,
    TextField,
    FormControl,
    MenuItem,
    Stack,
    useTheme,
} from "@mui/material";

const ClientsFilter = ({ open, onClose, onApplyFilters, initialFilters = {} }) => {
    const [status, setStatus] = useState("");
    const [plan, setPlan] = useState("");
    const [validFrom, setValidFrom] = useState("");
    const [validTo, setValidTo] = useState("");
    const [isFilter, setIsFilter] = useState(false);
    const theme = useTheme();
    const { palette } = theme;

    const statusOptions = [
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" }
    ];

    const planOptions = [
        { value: "basic", label: "Basic" },
        { value: "premium", label: "Premium" }
    ];

    // Update filter states when initialFilters change
    useEffect(() => {
        if (initialFilters.status) {
            setStatus(initialFilters.status);
            setIsFilter(true);
        }
        if (initialFilters.plan) {
            setPlan(initialFilters.plan);
            setIsFilter(true);
        }
        if (initialFilters.valid_from) {
            setValidFrom(initialFilters.valid_from);
            setIsFilter(true);
        }
        if (initialFilters.valid_to) {
            setValidTo(initialFilters.valid_to);
            setIsFilter(true);
        }
    }, [initialFilters]);

    const handleFilterApply = () => {
        const filters = {
            status: status,
            plan: plan,
            valid_from: validFrom,
            valid_to: validTo,
        };
        setIsFilter(true);
        onApplyFilters(filters);
        onClose();
    };

    const handleClearFilters = () => {
        setStatus("");
        setPlan("");
        setValidFrom("");
        setValidTo("");
        setIsFilter(false);
        onApplyFilters({ status: "", plan: "", valid_from: "", valid_to: "" });
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
                        Filter Clients
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

                {/* Status Filter */}
                <FormControl fullWidth>
                    <TextField
                        select
                        label="Status"
                        size="small"
                        sx={{ mb: 3 }}
                        value={status}
                        onChange={(event) => setStatus(event.target.value)}
                    >
                        {statusOptions.map((option) => (
                            <MenuItem key={option.value} value={option.value} dense>
                                {option.label}
                            </MenuItem>
                        ))}
                    </TextField>
                </FormControl>

                {/* Plan Filter */}
                <FormControl fullWidth>
                    <TextField
                        select
                        label="Plan"
                        size="small"
                        sx={{ mb: 3 }}
                        value={plan}
                        onChange={(event) => setPlan(event.target.value)}
                    >
                        {planOptions.map((option) => (
                            <MenuItem key={option.value} value={option.value} dense>
                                {option.label}
                            </MenuItem>
                        ))}
                    </TextField>
                </FormControl>

                {/* Valid From Filter */}
                <FormControl fullWidth>
                    <TextField
                        type="date"
                        label="Valid From"
                        size="small"
                        sx={{ mb: 3 }}
                        value={validFrom}
                        onChange={(event) => setValidFrom(event.target.value)}
                        InputLabelProps={{
                            shrink: true,
                        }}
                    />
                </FormControl>

                {/* Valid To Filter */}
                <FormControl fullWidth>
                    <TextField
                        type="date"
                        label="Valid To"
                        size="small"
                        sx={{ mb: 3 }}
                        value={validTo}
                        onChange={(event) => setValidTo(event.target.value)}
                        InputLabelProps={{
                            shrink: true,
                        }}
                    />
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

export default ClientsFilter;