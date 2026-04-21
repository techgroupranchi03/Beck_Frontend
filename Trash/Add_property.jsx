import React, { useEffect, useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
    Typography,
    Slide,
    useTheme,
    Grid,
    TextField,
    MenuItem,
    Button,
    Box,
    FormControl,
    InputLabel,
    Select,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { CloudUpload } from "@mui/icons-material";
import dayjs from 'dayjs';

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const Add_property = ({ open, onClose, onSubmit, mode = "create", initialData = null }) => {
    const theme = useTheme();
    const { palette } = theme;

    // ✅ Form State
    const [formData, setFormData] = useState({
        propertyName: "",
        propertyType: "",
        address: "",
        ownershipStatus: "",
        built: null,
        status: "Active",
        floors: "",
        rooms: "",
        bathrooms: "",
        size: "",
        features: "",
        image: "",
    });

    // Prefill when editing
    useEffect(() => {
        if (open && initialData) {
            setFormData({
                propertyName: initialData.name ?? "",
                propertyType: initialData.type ?? "",
                address: initialData.address ?? "",
                ownershipStatus: initialData.ownershipStatus ?? "",
                built: initialData.built ? Number(String(initialData.built)) : null,
                status: initialData.status ?? "Active",
                floors: initialData.details?.floors ?? "",
                rooms: initialData.details?.rooms ?? "",
                bathrooms: initialData.details?.bathrooms ?? "",
                size: initialData.size ?? "",
                features: Array.isArray(initialData.details?.features)
                    ? initialData.details.features.join(", ")
                    : (initialData.features ?? ""),
                image: initialData.image ?? "",
            });
        }
        if (open && !initialData && mode === "create") {
            // reset on open for create
            setFormData({
                propertyName: "",
                propertyType: "",
                address: "",
                ownershipStatus: "",
                built: null,
                status: "Active",
                floors: "",
                rooms: "",
                bathrooms: "",
                size: "",
                features: "",
                image: "",
            });
        }
    }, [open, initialData, mode]);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        // Handle file input (optional)
        if (name === "image" && files) {
            setFormData((prev) => ({
                ...prev,
                image: URL.createObjectURL(files[0]), // Preview
            }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleCreate = () => {
        console.log("Property Submitted:", formData);
        if (onSubmit) onSubmit(formData);
        onClose();
    };

    return (
        <Dialog
            open={open}
            // onClose={onClose}
            fullWidth
            maxWidth="md"
            TransitionComponent={Transition}
            keepMounted
            disableEscapeKeyDown
            PaperProps={{
                sx: {
                    borderRadius: 2,
                    boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
                    backgroundColor: palette.background.paper,
                },
            }}
        >
            {/* Title */}
            <DialogTitle variant="h5">
                {mode === "edit" ? "Edit Property" : "Add New Property"}
            </DialogTitle>
            <IconButton
                onClick={onClose}
                sx={{ position: "absolute", top: 10, right: 10 }}
            >
                <CloseIcon />
            </IconButton>

            <DialogContent dividers sx={{ pt: 3 }}>
                <Grid container spacing={3}>
                    {/* Property Name */}
                    <Grid size={{ xs: 12 }}>
                        <TextField
                            fullWidth
                            label="Property Name"
                            name="propertyName"
                            value={formData.propertyName}
                            onChange={handleChange}
                            variant="outlined"
                            size="small"
                        />
                    </Grid>

                    {/* Property Type */}
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <FormControl fullWidth variant="outlined" size="small">
                            <InputLabel>Property Type</InputLabel>
                            <Select
                                label="Property Type"
                                name="propertyType"
                                value={formData.propertyType}
                                onChange={handleChange}
                            >
                                <MenuItem value="Apartment">Apartment</MenuItem>
                                <MenuItem value="House">House</MenuItem>
                                <MenuItem value="Condo">Condo</MenuItem>
                                <MenuItem value="Townhouse">Townhouse</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    {/* Property Status */}
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <FormControl fullWidth variant="outlined" size="small">
                            <InputLabel>Property Status</InputLabel>
                            <Select
                                label="Property Status"
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                            >
                                <MenuItem value="Active">Active</MenuItem>
                                <MenuItem value="Inactive">Inactive</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>



                    {/* Ownership Status */}
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <FormControl fullWidth variant="outlined" size="small">
                            <InputLabel>Ownership Status</InputLabel>
                            <Select
                                label="Ownership Status"
                                name="ownershipStatus"
                                value={formData.ownershipStatus}
                                onChange={handleChange}
                            >
                                <MenuItem value="Owned">Owned</MenuItem>
                                <MenuItem value="Rented">Rented</MenuItem>
                                <MenuItem value="Leased">Leased</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>

                    {/* Built Year */}
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                                label="Built Year"
                                views={['year']}
                                format="YYYY"
                                value={formData.built ? dayjs().year(formData.built) : null}
                                onChange={(newValue) => {
                                    setFormData({
                                        ...formData,
                                        built: newValue ? newValue.year() : null,
                                    });
                                }}
                                slotProps={{
                                    textField: { fullWidth: true, size: 'small', variant: 'outlined' },
                                }}
                            />
                        </LocalizationProvider>
                    </Grid>
                    {/* Floors */}
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                            fullWidth
                            label="Number of Floors"
                            name="floors"
                            type="number"
                            value={formData.floors}
                            onChange={handleChange}
                            variant="outlined"
                            size="small"
                            sx={{
                                '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
                                    WebkitAppearance: 'none',
                                    margin: 0,
                                },
                            }}
                        />
                    </Grid>

                    {/* Rooms */}
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                            fullWidth
                            label="Rooms"
                            name="rooms"
                            type="number"
                            value={formData.rooms}
                            onChange={handleChange}
                            variant="outlined"
                            size="small"
                            sx={{
                                '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
                                    WebkitAppearance: 'none',
                                    margin: 0,
                                },
                            }}
                        />
                    </Grid>

                    {/* Bathrooms */}
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                            fullWidth
                            label="Bathrooms"
                            name="bathrooms"
                            type="number"
                            value={formData.bathrooms}
                            onChange={handleChange}
                            variant="outlined"
                            size="small"
                            sx={{
                                '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
                                    WebkitAppearance: 'none',
                                    margin: 0,
                                },
                            }}
                        />
                    </Grid>

                    {/* Size */}
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                            fullWidth
                            label="Size (e.g. 2500 sq ft)"
                            name="size"
                            value={formData.size}
                            onChange={handleChange}
                            variant="outlined"
                            size="small"
                        />
                    </Grid>

                    {/* Features */}
                    <Grid size={{ xs: 12 }}>
                        <TextField
                            fullWidth
                            label="Features (comma separated)"
                            name="features"
                            value={formData.features}
                            onChange={handleChange}
                            variant="outlined"
                            size="small"
                            multiline
                            rows={2}
                        />
                    </Grid>

                    {/* Address */}
                    <Grid size={{ xs: 12 }}>
                        <TextField
                            fullWidth
                            label="Address"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            multiline
                            rows={3}
                            variant="outlined"
                            size="small"
                        />
                    </Grid>
                    {/* Property Image */}
                    <Grid size={{ xs: 12 }}>
                        <Button
                            variant="outlined"
                            component="label"
                            fullWidth
                            size="large"
                            startIcon={<CloudUpload />}
                            sx={{

                                borderColor: palette.primary.main,
                                color: palette.primary.main,
                                "&:hover": {
                                    borderColor: palette.secondary.main,
                                    color: palette.secondary.main,
                                },
                            }}
                        >
                            Upload Image
                            <input
                                type="file"
                                accept="image/*"
                                hidden
                                name="image"
                                onChange={handleChange}
                            />
                        </Button>

                        {/* Image Preview */}
                        {formData.image && (
                            <Box mt={2} position="relative" display="inline-block" width="100%">
                                <img
                                    src={formData.image}
                                    alt="Preview"
                                    style={{
                                        width: "100%",
                                        maxHeight: "200px",
                                        objectFit: "contain",
                                        borderRadius: "8px",
                                        border: `1px solid ${palette.divider}`,
                                    }}
                                />
                                <IconButton
                                    onClick={() => setFormData({ ...formData, image: "" })}
                                    sx={{
                                        position: "absolute",
                                        top: 8,
                                        right: 8,
                                        backgroundColor: palette.background.paper,
                                        "&:hover": {
                                            backgroundColor: palette.error?.light || "#ffebee",
                                        },
                                    }}
                                    size="small"
                                >
                                    <CloseIcon fontSize="small" />
                                </IconButton>
                            </Box>
                        )}
                    </Grid>
                </Grid>


                {/* Buttons */}
                <Box display="flex" justifyContent="flex-end" gap={2} mt={3}>
                    <Button
                        variant="outlined"
                        disableElevation
                        onClick={onClose}
                        sx={{
                            textTransform: "none",
                            color: palette.primary.main,
                            borderColor: palette.primary.main,
                            "&:hover": {
                                borderColor: palette.secondary.main,
                                color: palette.secondary.main,
                            },
                        }}
                    >
                        Cancel
                    </Button>

                    <Button
                        variant="contained"
                        disableElevation
                        onClick={handleCreate}
                        sx={{
                            textTransform: "none",
                            bgcolor: palette.primary.main,
                            "&:hover": { bgcolor: palette.secondary.main },
                        }}
                    >
                        {mode === "edit" ? "Save changes" : "Create"}
                    </Button>
                </Box>
            </DialogContent>
        </Dialog>
    );
};

export default Add_property;
