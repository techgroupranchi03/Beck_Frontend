import React, { useEffect, useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
    useTheme,
    Grid,
    TextField,
    Button,
    Box,
    FormHelperText,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { CloudUpload } from "@mui/icons-material";
import Slide from "@mui/material/Slide";
import { createClientProperty, updateClientProperty } from "../../../service/Clients/Properties";
import { createTeamProperty, updateTeamProperty } from "../../../service/Teams/Team_Properties";
import { useSnackbar } from "../../../resuable_components/Snackbar";
import { useAuth } from "../../../context/AuthContext";

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const Add_property = ({ open, onClose, onSuccess, mode = "create", initialData = null }) => {
    const theme = useTheme();
    const { palette } = theme;
    const { showSnackbar } = useSnackbar();
    const { user } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isTeamMember = user?.role === 'team';

    //Form State
    const [formData, setFormData] = useState({
        name: "",
        googleMapLink: "",
        address: "",
        image: "",
        imageFile: null,
    });

    // Error State
    const [errors, setErrors] = useState({
        name: "",
        googleMapLink: "",
        address: "",
        image: "",
    });


    // editing 
    useEffect(() => {
        if (open && initialData) {
            setFormData({
                name: initialData.name ?? "",
                googleMapLink: initialData.google_map_link ?? "",
                address: initialData.address ?? "",
                image: initialData.property_image_url ?? "",
                imageFile: null,
            });
            // Clear errors
            setErrors({
                name: "",
                googleMapLink: "",
                address: "",
                image: "",
            });
        }
        if (open && !initialData && mode === "create") {
            // reset on open for create
            setFormData({
                name: "",
                googleMapLink: "",
                address: "",
                image: "",
                imageFile: null,
            });
            // Clear errors
            setErrors({
                name: "",
                googleMapLink: "",
                address: "",
                image: "",
            });
        }
    }, [open, initialData, mode]);

    // Validate URL format
    const isValidUrl = (urlString) => {
        if (!urlString) return true;
        try {
            const url = new URL(urlString);
            return url.protocol === 'http:' || url.protocol === 'https:';
        } catch (e) {
            return false;
        }
    };

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        // Handle file input
        if (name === "image" && files && files[0]) {
            setFormData((prev) => ({
                ...prev,
                image: URL.createObjectURL(files[0]),
                imageFile: files[0],
            }));
            // Clear image error
            setErrors((prev) => ({ ...prev, image: "" }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
            // Clear error for the field
            if (name === "name" || name === "address") {
                setErrors((prev) => ({ ...prev, [name]: "" }));
            }
            // Validate URL for googleMapLink
            if (name === "googleMapLink") {
                if (value && !isValidUrl(value)) {
                    setErrors((prev) => ({ ...prev, googleMapLink: "Please enter a valid URL (e.g., https://beckholiday.homes/...)" }));
                } else {
                    setErrors((prev) => ({ ...prev, googleMapLink: "" }));
                }
            }
        }
    };

    const handleSubmit = async () => {
        // Validate required fields
        const newErrors = {
            name: "",
            googleMapLink: "",
            address: "",
            image: "",
        };

        if (!formData.name.trim()) {
            newErrors.name = "Property name is required";
        }

        if (!formData.address.trim()) {
            newErrors.address = "Address is required";
        }

        if (!formData.image && mode === "create") {
            newErrors.image = "Property image is required";
        }

        // Validate Google Map Link URL
        if (formData.googleMapLink && !isValidUrl(formData.googleMapLink)) {
            newErrors.googleMapLink = "Please enter a valid URL (e.g., https://beckholiday.homes/...)";
        }

        // If there are validation errors, set them and return
        if (Object.values(newErrors).some(error => error !== "")) {
            setErrors(newErrors);
            return;
        }

        setIsSubmitting(true);

        try {
            // Create FormData for file upload
            const formDataToSend = new FormData();
            formDataToSend.append('name', formData.name);
            formDataToSend.append('address', formData.address);

            // Add Google Map Link if provided
            if (formData.googleMapLink) {
                formDataToSend.append('google_map_link', formData.googleMapLink);
            }

            // Handle image file
            if (formData.imageFile) {
                formDataToSend.append('image', formData.imageFile);
            }

            if (mode === "edit" && initialData) {
                // Update existing property
                if (isTeamMember) {
                    await updateTeamProperty(initialData.id, formDataToSend);
                } else {
                    await updateClientProperty(initialData.id, formDataToSend);
                }
                showSnackbar("Property updated successfully", "success");
            } else {
                // Create new property
                if (isTeamMember) {
                    await createTeamProperty(formDataToSend);
                } else {
                    await createClientProperty(formDataToSend);
                }
                showSnackbar("Property created successfully", "success");
            }

            // Call success callback to refresh list and close dialog
            if (onSuccess) {
                onSuccess();
            }
        } catch (error) {
            console.error("Error saving property:", error);

            // Map API errors to form fields
            if (error.errors && Array.isArray(error.errors)) {
                const apiErrors = {
                    name: "",
                    googleMapLink: "",
                    address: "",
                    image: "",
                };

                error.errors.forEach((err) => {
                    if (err.name) {
                        apiErrors.name = err.name;
                    }
                    if (err.address) {
                        apiErrors.address = err.address;
                    }
                    if (err.image) {
                        apiErrors.image = err.image;
                    }
                    if (err.google_map_link) {
                        apiErrors.googleMapLink = err.google_map_link;
                    }
                });

                setErrors(apiErrors);
            } else {
                showSnackbar(error.message || "Failed to save property", "error");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (

        <Dialog
            open={open}
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
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            variant="outlined"
                            size="small"
                            error={!!errors.name}
                            helperText={errors.name}
                            required
                        />
                    </Grid>

                    {/* add google map link (optional) field */}
                    <Grid size={{ xs: 12 }}>
                        <TextField
                            fullWidth
                            type="url"
                            label="Add Google Map Link (optional)"
                            name="googleMapLink"
                            value={formData.googleMapLink}
                            onChange={handleChange}
                            variant="outlined"
                            size="small"
                            error={!!errors.googleMapLink}
                            helperText={errors.googleMapLink}
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
                            rows={2}
                            variant="outlined"
                            size="small"
                            error={!!errors.address}
                            required
                            inputProps={{ maxLength: 200 }}
                            helperText={
                                <>
                                    <span>{errors.address}</span>
                                    <span>{formData.address.length}/200</span>
                                </>
                            }
                            slotProps={{
                                formHelperText: {
                                    sx: {
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                    },
                                },
                            }}
                        />
                    </Grid>

                    {/* Property Image */}
                    <Grid size={{ xs: 12 }}>

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
                                    onClick={() => setFormData({ ...formData, image: "", imageFile: null })}
                                    sx={{
                                        position: "absolute",
                                        top: 8,
                                        right: 8,
                                        backgroundColor: palette.secondary.main,
                                        color: "#ffffff",
                                    }}
                                    size="small"
                                >
                                    <CloseIcon
                                        fontSize="small"
                                        onClick={() => setFormData({ ...formData, image: "", imageFile: null })}
                                    />
                                </IconButton>
                            </Box>
                        )}

                        <Button
                            variant="outlined"
                            component="label"
                            fullWidth
                            size="large"
                            startIcon={<CloudUpload />}
                            sx={{
                                borderColor: errors.image ? palette.error.main : palette.primary.main,
                                color: errors.image ? palette.error.main : palette.primary.main,
                                "&:hover": {
                                    borderColor: errors.image ? palette.error.dark : palette.secondary.main,
                                    color: errors.image ? palette.error.dark : palette.secondary.main,
                                },
                            }}
                        >
                            Upload Image *
                            <input
                                type="file"
                                accept="image/*"
                                hidden
                                name="image"
                                onChange={handleChange}
                            />
                        </Button>
                        {errors.image && (
                            <FormHelperText error sx={{ ml: 2, mt: 0.5 }}>
                                {errors.image}
                            </FormHelperText>
                        )}


                    </Grid>

                </Grid>


                {/* Buttons */}
                <Box display="flex" justifyContent="flex-end" gap={2} mt={3}>
                    <Button
                        variant="contained"
                        disableElevation
                        onClick={handleSubmit}
                        size="medium"
                        disabled={isSubmitting}
                        sx={{
                            textTransform: "none",
                            bgcolor: palette.primary.main,
                            "&:hover": { bgcolor: palette.secondary.main },
                            borderRadius: 10,
                            px: 3,
                        }}
                    >
                        {isSubmitting ? "Saving..." : mode === "edit" ? "Save changes" : "Create"}
                    </Button>
                </Box>

            </DialogContent>

        </Dialog>

    );
};

export default Add_property;
