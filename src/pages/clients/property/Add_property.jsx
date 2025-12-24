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

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const Add_property = ({ open, onClose, onSubmit, mode = "create", initialData = null }) => {
    const theme = useTheme();
    const { palette } = theme;

    //Form State
    const [formData, setFormData] = useState({
        name: "",
        googleMapLink: "",
        address: "",
        image: "",
        imageFile: null, 
    });

    // console form data for debugging
    useEffect(() => {
        console.log('Form Data:', formData);
    }, [formData]);

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
                image: initialData.image_url ?? "",
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
        }
    };

    const handleCreate = async () => {
        if (onSubmit) {
            await onSubmit(formData, setErrors);
        }
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
                            rows={3}
                            variant="outlined"
                            size="small"
                            error={!!errors.address}
                            helperText={errors.address}
                            required
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
                        size="medium"
                        sx={{
                            textTransform: "none",
                            bgcolor: palette.primary.main,
                            "&:hover": { bgcolor: palette.secondary.main },
                            borderRadius: 10,
                            px: 3,
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
