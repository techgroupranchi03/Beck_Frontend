import { Clear, FilterList, Search, SearchOff, Edit, Delete, MoreVert, Phone, Business, CalendarMonth } from '@mui/icons-material'
import { Container, Divider, IconButton, Stack, TextField, useTheme, Grid, Card, CardHeader, CardContent, Typography, Box, Avatar, Chip, Menu, MenuItem, ListItemIcon, ListItemText, Button } from '@mui/material'
import React, { useState, useCallback, useEffect, useRef } from 'react'
import { useSnackbar } from '../../resuable_components/Snackbar';
import CardSkeleton from '../../resuable_components/CardSkeleton';
import IconLabel from '../../resuable_components/IconLabel';
import { formatDate } from '../../utils/dateFormat';
import { useClientsData } from './useClientsData';
import ConfirmationDialog from '../../dialoge/admin/Confirmation_dialog';
import ClientsFilter from './ClientsFilter';
import Tileview_addEdit_Clients from './Tileview_addEdit_Clients';

const ClientsTileView = () => {
  const theme = useTheme();
  const { palette } = theme;
  const { showSnackbar } = useSnackbar();

  const {
    clientsData,
    loading,
    removeClient,
    fetchClients,
    clientsPagination,
    createClient,
    updateClient,
  } = useClientsData();

  const [filterVisible, setFilterVisible] = useState(false);
  const [filters, setFilters] = useState({});
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);
  const [openAddEditDialog, setOpenAddEditDialog] = useState(false);

  const observerTarget = useRef(null);
  console.log("filters applied:", filters);
  // Reset page when search text changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchText, filters]);

  // Infinite scroll - load more clients
  const loadMoreClients = useCallback(async () => {
    if (isLoadingMore || loading || !clientsPagination.hasNextPage) {
      return;
    }

    try {
      setIsLoadingMore(true);
      const nextPage = currentPage + 1;
      await fetchClients(searchText, nextPage, true);
      setCurrentPage(nextPage);
    } catch (error) {
      showSnackbar('Failed to load more clients', 'error');
      console.error('Error loading more clients:', error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [clientsPagination, isLoadingMore, loading, currentPage, searchText, fetchClients, showSnackbar]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && clientsPagination.hasNextPage && !isLoadingMore && !loading) {
          loadMoreClients();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [loadMoreClients, clientsPagination, isLoadingMore, loading]);

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedClient(null);
  };

  const handleEdit = (client) => {
    setSelectedClient(client);
    setOpenAddEditDialog(true);
    setAnchorEl(null);
  };

  const openDeleteDialog = (client) => {
    setClientToDelete(client);
    setOpenConfirm(true);
    setAnchorEl(null);
  };

  const handleDeleteClient = async () => {
    if (clientToDelete) {
      try {
        const res = await removeClient(clientToDelete.id);
        showSnackbar(res.message || 'Client deleted successfully', 'success');
      } catch (error) {
        showSnackbar(error.message || 'Failed to delete client', 'error');
        console.error('Error deleting client:', error);
      }
    }
    setOpenConfirm(false);
    setClientToDelete(null);
  };

  const handleCancelDelete = () => {
    setOpenConfirm(false);
    setClientToDelete(null);
  };

  const handleCloseDialog = () => {
    setOpenAddEditDialog(false);
    setSelectedClient(null);
  };

  const handleFilterToggle = () => {
    setFilterVisible(prev => !prev);
  };

  // Handle search
  const handleSearch = async (text) => {
    setSearchText(text);
    setCurrentPage(1);
    try {
      await fetchClients(text);
    } catch (error) {
      console.error('Error searching clients:', error);
    }
  };
  const handleApplyFilters = async (appliedFilters) => {
    setFilters(appliedFilters);
    setCurrentPage(1);
    try {
      await fetchClients(appliedFilters, searchText);
    } catch (error) {
      console.error('Error applying filters:', error);
    }
  };
  return (
    <Container maxWidth="mx" disableGutters sx={{ mt: 2, px: 1 }}>

      {/* Add Client Button with Filter and Search */}
      <Stack direction="row" display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Button
          variant="contained"
          disableElevation
          size='small'
          onClick={() => {
            setSelectedClient(null);
            setOpenAddEditDialog(true);
          }}
          sx={{
            bgcolor: palette.primary.main,
            "&:hover": { bgcolor: palette.secondary.main },
            fontSize: '0.875rem',

          }}
        >
          Add New Client
        </Button>


        <Stack direction="row" spacing={1}>
          <IconButton
            onClick={handleFilterToggle}
            sx={{
              bgcolor: Object.keys(filters).some((key) => filters[key])
                ? palette.secondary.main
                : 'transparent',
            }}
          >
            <FilterList />
          </IconButton>
          <IconButton
            onClick={() => setIsSearchVisible((prev) => !prev)}
            sx={{
              bgcolor: isSearchVisible ? palette.secondary.main : 'transparent',
              color: isSearchVisible ? "#ffffff" : palette.text.primary,
              "&:hover": { bgcolor: palette.primary.main, color: "#ffffff" }
            }}
          >
            {isSearchVisible ? <SearchOff /> : <Search />}
          </IconButton>
        </Stack>
      </Stack>

      {/* search filed  */}
      {isSearchVisible && (
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search clients..."
          size="small"
          focused
          value={searchText}
          onChange={(e) => handleSearch(e.target.value)}
          InputProps={{
            endAdornment: (
              <IconButton onClick={() => handleSearch('')}>
                <Clear />
              </IconButton>
            ),
            sx: { paddingRight: 0 },
          }}
          sx={{ mb: 2 }}
        />
      )}

      {/* Clients Filter Drawer */}
      <ClientsFilter
        open={filterVisible}
        onClose={handleFilterToggle}
        onApplyFilters={handleApplyFilters}
        initialFilters={filters}
      />
      <Divider sx={{ my: 2 }} />

      {/* Clients Grid */}
      {clientsData.length === 0 && !loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <Typography variant="body2" color="text.secondary">
            No clients found.
          </Typography>
        </Box>
      )}

      <Grid container spacing={2}>
        {loading ? (
          Array.from({ length: 6 }).map((_, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} item key={`skeleton-${index}`}>
              <CardSkeleton />
            </Grid>
          ))
        ) : (
          clientsData.map((client) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} item key={client.id}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: 3,
                  border: `1px solid ${palette.divider}`,
                  bgcolor: palette.background.paper,
                  pb: 1,
                }}
              >
                <CardHeader
                  sx={{ pb: 0 }}
                  avatar={
                    <Avatar
                      sx={{
                        bgcolor: palette.primary.main,
                        width: 50,
                        height: 50,
                        fontSize: "1rem",
                        fontWeight: "bold",
                      }}
                    >
                      {client.name?.charAt(0)?.toUpperCase() || "?"}
                    </Avatar>
                  }
                  title={
                    <Typography variant="h6" color="text.primary">
                      {client.name}
                    </Typography>
                  }
                  action={
                    <IconButton
                      aria-label="settings"
                      onClick={(e) => {
                        setSelectedClient(client);
                        setAnchorEl(e.currentTarget);
                      }}
                    >
                      <MoreVert fontSize="medium" />
                    </IconButton>
                  }
                />

                <CardContent sx={{ pt: 1 }}>
                  {/* Status + Plan */}
                  <Stack
                    spacing={1}
                    mb={2}
                    direction="row"
                    justifyContent="space-between"
                  >
                    <Chip
                      label={client.status}
                      size="small"
                      sx={{
                        textTransform: 'capitalize',
                        bgcolor: client.status?.toLowerCase() === 'active'
                          ? palette.primary.light
                          : palette.grey[300],
                        color: client.status?.toLowerCase() === 'active'
                          ? palette.primary.dark
                          : palette.text.secondary,
                        px: 1.5,


                      }}
                    />
                    <Chip
                      label={client.plan}
                      size="small"
                      sx={{
                        textTransform: 'capitalize',
                        bgcolor: { 'basic': palette.custom.cream, 'premium': "#F5B301" }[client.plan?.toLowerCase()] || palette.grey[300],
                        color: palette.secondary.dark,
                        px: 1.5,
                      }}
                    />
                  </Stack>

                  <Stack direction="row" flexWrap="wrap" gap={1}>
                    {client.company && (
                      <IconLabel
                        icon={Business}
                        label={client.company}
                      />
                    )}
                    {client.phone && (
                      <IconLabel
                        icon={Phone}
                        label={client.phone}
                      />
                    )}
                    {client.valid_from && (
                      <IconLabel
                        icon={CalendarMonth}
                        label={`${formatDate(client.valid_from)} - ${formatDate(client.valid_to)}`}
                      />
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      {/* Loading more skeleton */}
      {isLoadingMore && (
        <Grid container spacing={2} sx={{ mt: 2 }}>
          {Array.from({ length: 3 }).map((_, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} item key={`loading-more-${index}`}>
              <CardSkeleton />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Intersection observer target */}
      <div ref={observerTarget} style={{ height: '20px' }} />

      {/* Pagination info */}
      {clientsPagination.totalPages > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Page {clientsPagination.page} of {clientsPagination.totalPages} • Total: {clientsPagination.total} clients
          </Typography>
        </Box>
      )}

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          elevation: 1,
          sx: {
            borderRadius: 1,
            overflow: "visible",
            mt: 1,
            "&::before": {
              content: '""',
              display: "block",
              position: "absolute",
              top: 0,
              right: 12,
              width: 12,
              height: 12,
              bgcolor: theme.palette.background.paper,
              transform: "translateY(-50%) rotate(45deg)",
              zIndex: 0,
              boxShadow: theme.palette.mode === "light"
                ? "0px -1px 1px rgba(0,0,0,0.1)"
                : "0px -1px 1px rgba(255,255,255,0.1)",
            },
          },
        }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={() => handleEdit(selectedClient)} dense>
          <ListItemIcon>
            <Edit fontSize="small" sx={{ color: palette.primary.main }} />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => openDeleteDialog(selectedClient)} dense>
          <ListItemIcon>
            <Delete fontSize="small" sx={{ color: palette.error.main }} />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      <ConfirmationDialog
        open={openConfirm}
        onCancel={handleCancelDelete}
        onDelete={handleDeleteClient}
        title="Delete Client"
        message="Are you sure you want to delete this client? This action cannot be undone."
      />

      <Tileview_addEdit_Clients
        open={openAddEditDialog}
        onClose={handleCloseDialog}
        client={selectedClient}
        createClient={createClient}
        updateClient={updateClient}
      />
    </Container>
  )
}

export default ClientsTileView