import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Container,
  Stack,
  Typography,
  useTheme,
  Grid,
  Pagination,
} from "@mui/material";
import ActionMenu from "../../../resuable_components/ActionMenu";
import ConfirmationDialog from "../../../dialoge/clients/Confirmation_dialog";
import Add_property from "./Add_property";
import { getClientProperties, createClientProperty, updateClientProperty, deleteClientProperty } from "../../../service/Clients/Properties";
import { useSnackbar } from "../../../resuable_components/Snackbar";

const PropertyManagement = () => {
  const theme = useTheme();
  const { palette } = theme;
  const { showSnackbar } = useSnackbar();
  const [propertiesList, setPropertiesList] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [addPropertyOpen, setAddPropertyOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);


 // console.log("Properties List:", propertiesList);

  // getclient properties call api 
  const getAllProperties = async () => {
    try {
      const res = await getClientProperties(page);
      //console.log("Fetched properties:", res);
      setPropertiesList(res.data);
      setTotalPages(res.pagination.total_pages || 1);
    } catch (error) {
      console.error("Error fetching properties:", error);
    }
  };
  useEffect(() => {
    getAllProperties();
  }, [page]);



  const handleEdit = (property) => {
    setSelectedProperty(property);
    setIsEdit(true);
    setAddPropertyOpen(true);
  };


  const handleDelete = async () => {
    //console.log("Delete property:", selectedProperty);
    try {
      await deleteClientProperty(selectedProperty.id);
      // Refresh the list after deletion
      getAllProperties();
      showSnackbar("Property deleted successfully", "success");
      setDeleteDialogOpen(false);
      setSelectedProperty(null);
    } catch (error) {
      console.error("Error deleting property:", error);
      setDeleteDialogOpen(false);
      setSelectedProperty(null);
    }
  };

  return (
    <React.Fragment>
      <Container maxWidth="mx" sx={{ mt: 4, mb: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
          <Typography variant="h4" component="h4" gutterBottom>
            List of Properties
          </Typography>
          <Button
            variant="contained"
            disableElevation
            onClick={() => setAddPropertyOpen(true)}
            sx={{
              bgcolor: palette.primary.main,
              "&:hover": { bgcolor: palette.secondary.main },
            }}
          >
            ADD PROPERTY
          </Button>
        </Stack>

        <Grid container spacing={3}>
          {propertiesList.map((property) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={property.id}>
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: 1,
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                <CardMedia
                  component="img"
                  height="250"
                  image={property.image_url || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=60"}
                  alt={property.name}
                  sx={{ objectFit: "cover" }}
                />
                <CardContent sx={{ pt: 0.5, }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="h5" >
                      {property.name}
                    </Typography>
                    <ActionMenu
                      onEdit={() => handleEdit(property)}
                      onDelete={() => {
                        setSelectedProperty(property);
                        setDeleteDialogOpen(true);
                      }}
                    />
                  </Stack>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {property.address}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {totalPages > 1 &&
          <Stack spacing={2} mt={4} alignItems="center">
            <Pagination
              count={totalPages}
              page={page}
              onChange={(event, value) => setPage(value)}
              color="primary"
            />
          </Stack>
        }

        <ConfirmationDialog
          open={deleteDialogOpen}
          onCancel={() => {
            setDeleteDialogOpen(false);
            setSelectedProperty(null);
          }}
          onDelete={handleDelete}
          title="Delete Property"
          message={selectedProperty ? `Are you sure you want to delete '${selectedProperty.name}' This action cannot be undone.` : ""}
        />

        <Add_property
          open={addPropertyOpen}
          onClose={() => {
            setAddPropertyOpen(false);
            setIsEdit(false);
            setSelectedProperty(null);
          }}
          mode={isEdit ? 'edit' : 'create'}
          initialData={isEdit ? selectedProperty : null}
          onSubmit={async (data, setErrors) => {
            try {
              // Create FormData for file upload
              const formData = new FormData();
              formData.append('name', data.name);
              formData.append('address', data.address);

              // Handle image file
              if (data.imageFile) {
                formData.append('image', data.imageFile);
              }

              if (isEdit && selectedProperty) {
                // Update existing property
                await updateClientProperty(selectedProperty.id, formData);
              } else {
                // Create new property
                await createClientProperty(formData);
              }
              // Refresh the list and close dialog on success
              getAllProperties();
              setAddPropertyOpen(false);
              setIsEdit(false);
              setSelectedProperty(null);
              showSnackbar(`Property ${isEdit ? "updated" : "created"} successfully`, "success");
            } catch (error) {
              console.error("Error saving property:", error);

              // Map API errors to form fields
              if (error.errors && Array.isArray(error.errors)) {
                const apiErrors = {
                  name: "",
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
                });

                // Set errors in the form
                if (setErrors) {
                  setErrors(apiErrors);
                }
              }
              // Dialog stays open to show errors
            }
          }}
        />
      </Container>
    </React.Fragment>
  );
};

export default PropertyManagement;
