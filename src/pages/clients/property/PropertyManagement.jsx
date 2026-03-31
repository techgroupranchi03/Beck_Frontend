import React, { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
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
  useMediaQuery,
  Grid,
  CircularProgress,
  TextField,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { Clear, Search } from "@mui/icons-material";
import ActionMenu from "../../../resuable_components/ActionMenu";
import ConfirmationDialog from "../../../dialoge/clients/Confirmation_dialog";
import Add_property from "./Add_property";
import PropertyCardSkeleton from "./PropertyCardSkeleton";
import { getClientProperties, deleteClientProperty } from "../../../service/Clients/Properties";
import { useSnackbar } from "../../../resuable_components/Snackbar";
import { useAuth } from "../../../context/AuthContext";
import { deleteTeamProperty, getTeamProperties } from "../../../service/Teams/Team_Properties";
import { canCreate, canUpdate, canDelete, RESOURCES } from "../../../utils/permissions";
import { useTopBar } from "../../../context/TopBarContext";

const PropertyManagement = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const { palette } = theme;
  const { showSnackbar } = useSnackbar();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [propertiesList, setPropertiesList] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [addPropertyOpen, setAddPropertyOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const observerTarget = useRef(null);
  const isFetchingRef = useRef(false);
  const { registerActions, clearActions } = useTopBar();

  const isTeamMember = user?.role === 'team';

  // Check permissions for property resource
  const canCreateProperty = canCreate(user?.teamRole, RESOURCES.PROPERTY);
  const canUpdateProperty = canUpdate(user?.teamRole, RESOURCES.PROPERTY);
  const canDeleteProperty = canDelete(user?.teamRole, RESOURCES.PROPERTY);

  // Register mobile search toggle
  useEffect(() => {
    if (isMobile) {
      registerActions({
        onSearchToggle: () => setIsSearchVisible((prev) => !prev),
        isSearchActive: isSearchVisible,
      });
    }
    return () => { if (isMobile) clearActions(); };
  }, [isMobile, isSearchVisible, registerActions, clearActions]);

  // Auto-open add dialog from mobile FAB navigation
  useEffect(() => {
    if (location.state?.openAdd) {
      setAddPropertyOpen(true);
      setIsEdit(false);
      setSelectedProperty(null);
      window.history.replaceState({}, document.title);
    }
  }, [location.state?.openAdd]);

  // getclient properties call api 
  const getAllProperties = useCallback(async (pageNum = 1, append = false) => {

    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    try {
      if (!append) setLoading(true);
      else setIsLoadingMore(true);
      const res = isTeamMember
        ? await getTeamProperties(pageNum, searchText)
        : await getClientProperties(pageNum, searchText);
      if (append) {
        setPropertiesList((prev) => [...prev, ...(res.data || [])]);
      } else {
        setPropertiesList(res.data || []);
      }
      setHasNextPage(res.pagination?.hasNextPage || false);
      setPage(res.pagination?.page || pageNum);
    } catch (error) {
      console.error("Error fetching properties:", error);
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
      isFetchingRef.current = false;
    }
  }, [isTeamMember, searchText]);

  useEffect(() => {
    getAllProperties(1, false);
  }, [getAllProperties]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isLoadingMore && !loading) {
          getAllProperties(page + 1, true);
        }
      },
      { threshold: 0.1 }
    );
    const currentTarget = observerTarget.current;
    if (currentTarget) observer.observe(currentTarget);
    return () => {
      if (currentTarget) observer.unobserve(currentTarget);
    };
  }, [hasNextPage, isLoadingMore, loading, page, getAllProperties]);

  const handleEdit = (property) => {
    setSelectedProperty(property);
    setIsEdit(true);
    setAddPropertyOpen(true);
  };

  const handleDelete = async () => {
    //console.log("Delete property:", selectedProperty);
    try {
      if (isTeamMember) {
        await deleteTeamProperty(selectedProperty.id);
      } else {
        await deleteClientProperty(selectedProperty.id);
      }
      // getAllProperties();
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
      <Container maxWidth="mx" sx={{ mt: 2, mb: 4, px: 0 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="body1" sx={{ textTransform: 'capitalize', fontWeight: 'bold', fontSize: '1.2rem' }} gutterBottom>
            List of Properties
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            {!isMobile && (
              <TextField
                // variant="outlined"
                placeholder="Search properties..."
                size="small"
                value={searchText}
                onChange={(e) => {
                  setSearchText(e.target.value);
                  setPage(1);
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search fontSize="small" />
                    </InputAdornment>
                  ),
                  endAdornment: searchText && (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => { setSearchText(""); setPage(1); }}>
                        <Clear fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  minWidth: 400,
                  mr: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '18px',
                  },
                }}
              />
            )}
            {canCreateProperty && !isMobile && (
              <Button
                variant="contained"
                size="medium"
                disableElevation
                onClick={() => setAddPropertyOpen(true)}
                sx={{
                  bgcolor: palette.primary.main,
                  "&:hover": { bgcolor: palette.secondary.main },
                  textTransform: "none",
                  borderRadius: 10,
                }}
              >
                Add Property
              </Button>
            )}
          </Stack>
        </Stack>

        {/* Mobile search bar */}
        {isMobile && isSearchVisible && (
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search properties..."
            size="small"
            value={searchText}
            onChange={(e) => {
              setSearchText(e.target.value);
              setPage(1);
            }}
            InputProps={{
              endAdornment: searchText && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => { setSearchText(""); setPage(1); }}>
                    <Clear fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />
        )}


        {!loading && propertiesList.length === 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <Typography variant="body2" color="text.secondary">
              No properties found.
            </Typography>
          </Box>
        )}



        {loading ? (
          <PropertyCardSkeleton count={6} />
        ) : (
          <Grid container spacing={2}>
            {propertiesList.map((property) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={property.id} sx={{ display: 'flex' }}>
                <Card
                  sx={{
                    height: "100%",
                    width: "100%",
                    borderRadius: 3,
                    boxShadow: 1,
                    overflow: "hidden",
                    position: "relative",

                  }}
                >
                  <CardMedia
                    component="img"
                    height="250"
                    image={property.property_image_url}
                    alt={property.name}
                    sx={{ objectFit: "cover" }}
                  />
                  <CardContent
                    sx={{

                    }}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body1" sx={{ textTransform: 'capitalize', fontWeight: 'bold', fontSize: '1.2rem' }} gutterBottom>
                        {property.name}
                      </Typography>
                      {(canUpdateProperty || canDeleteProperty) && (
                        <ActionMenu
                          onEdit={canUpdateProperty ? () => handleEdit(property) : null}
                          onDelete={canDeleteProperty ? () => {
                            setSelectedProperty(property);
                            setDeleteDialogOpen(true);
                          } : null}
                        />
                      )}
                    </Stack>
                    <Typography variant="body2" color="text.secondary" sx={{ pb: 0 }}>
                      {property.address}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      <a
                        href={property.google_map_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: "#0288d1",
                          textDecoration: "none"
                        }}
                      >
                        View on Google Maps
                      </a>
                    </Typography>

                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Infinite scroll observer target  need property card skeleton here */}
        <div ref={observerTarget} style={{ height: 1 }} />
        {isLoadingMore && (
         <PropertyCardSkeleton count={3} />

        )}

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
          onSuccess={() => {
            // Refresh the list and close dialog on success
            getAllProperties(1, false);
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
