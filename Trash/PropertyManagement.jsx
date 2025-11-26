import React, { useState } from "react";
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
  Chip,
} from "@mui/material";
import ActionMenu from "../../../resuable_components/ActionMenu";
import ConfirmationDialog from "../../../dialoge/clients/Confirmation_dialog";
import Add_property from "./Add_property";
const properties = [
  {
    id: 1,
    name: "Greenwood Villa",
    address: "24 Maple Street, Springfield, IL 62704",
    type: "Residential",
    size: "2,500 sq ft",
    details: {
      floors: 2,
      rooms: 4,
      bathrooms: 2,
      features: ["Garden", "Balcony", "Garage"],
    },
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=60",
    status: "Active",
    built: "2015",
    owner: "Alice Johnson",
    ownershipStatus: "Owned",
  },
  {
    id: 2,
    name: "Sunny Side Cottage",
    address: "18 Pinewood Lane, Austin, TX 73301",
    type: "Residential",
    size: "1,800 sq ft",
    details: {
      floors: 1,
      rooms: 3,
      bathrooms: 2,
      features: ["Patio", "Fireplace"],
    },
    image:
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8cmVhbCUyMGVzdGF0ZXxlbnwwfHwwfHx8MA%3D%3D",
    status: "Active",
    built: "2018",
    owner: "Bob Smith",
    ownershipStatus: "Rented",
  },
];

const PropertyManagement = () => {
  const theme = useTheme();
  const { palette } = theme;

  const [propertiesList, setPropertiesList] = useState(properties);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [addPropertyOpen, setAddPropertyOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  const handleEdit = (property) => {
    setSelectedProperty(property);
    setIsEdit(true);
    setAddPropertyOpen(true);
  };


  const handleDelete = () => {
    console.log("Delete property:", selectedProperty);
    // Add your delete logic here
    setDeleteDialogOpen(false);
    setSelectedProperty(null);
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
                  boxShadow: 3,
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                <CardMedia
                  component="img"
                  height="180"
                  image={property.image}
                  alt={property.name}
                />
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    bgcolor: palette.primary.light,
                    color: palette.primary.dark,
                    px: 2,
                    py: 0.5,
                    fontWeight: 600,
                    fontSize: "0.75rem",
                    borderBottomRightRadius: 12,
                  }}
                >
                  {property.status}
                </Box>
                <CardContent sx={{ pt: 0.5 }}>
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

                  <Typography variant="body2" sx={{ mt: 1 }}>
                    <strong>Type:</strong> {property.type}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    <strong>Size:</strong> {property.size}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    <strong>Floors:</strong> {property.details.floors} |{" "}
                    <strong>Rooms:</strong> {property.details.rooms} |{" "}
                    <strong>Bathrooms:</strong> {property.details.bathrooms}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    <strong>Features:</strong> {property.details.features.join(", ")}
                  </Typography>

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mt: 2,
                      borderTop: "1px solid #eee",
                      pt: 1,
                    }}
                  >
                    <Typography variant="body2">
                      <strong>Built:</strong> {property.built.toLocaleString()}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Owner:</strong> {property.owner}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Ownership:</strong> {property.ownershipStatus}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
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
          onSubmit={(data) => {
            // map form data to property shape
            const mapToProperty = (form, existing) => ({
              id: existing?.id ?? (Math.max(0, ...propertiesList.map(p => p.id)) + 1),
              name: form.propertyName,
              address: form.address,
              type: form.propertyType,
              size: form.size,
              details: {
                floors: Number(form.floors) || 0,
                rooms: Number(form.rooms) || 0,
                bathrooms: Number(form.bathrooms) || 0,
                features: form.features ? form.features.split(',').map(s => s.trim()).filter(Boolean) : [],
              },
              image: form.image || existing?.image || '',
              status: form.status,
              built: form.built ? String(form.built) : (existing?.built ?? ''),
              owner: existing?.owner ?? '',
              ownershipStatus: form.ownershipStatus,
            });

            if (isEdit && selectedProperty) {
              const updated = mapToProperty(data, selectedProperty);
              setPropertiesList(prev => prev.map(p => p.id === selectedProperty.id ? updated : p));
            } else {
              const created = mapToProperty(data, null);
              setPropertiesList(prev => [created, ...prev]);
            }
            setAddPropertyOpen(false);
            setIsEdit(false);
            setSelectedProperty(null);
          }}
        />
      </Container>
    </React.Fragment>
  );
};

export default PropertyManagement;
