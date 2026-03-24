import React, { useState, useCallback, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import {
  useTheme,
  useMediaQuery,
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Stack,
  Button,
  TextField,
  CircularProgress,
} from "@mui/material";
import {
  MoreVert,
  Edit,
  Delete,
  Phone,
  CheckCircle,
  Search,
  SearchOff,
  Clear
} from "@mui/icons-material";
import { useTeamContext } from './TeamManagement';
import { useSnackbar } from '../../../resuable_components/Snackbar';
import ConfirmationDialog from '../../../dialoge/clients/Confirmation_dialog';
import TileView_addEdit_team from "./TileView_addEdit_team";
import NavigateToTask from "./NavigateToTask";
import { useViewMode } from "../../../context/ViewModeContext";
import TeamCardSkeleton from "./TeamCardSkeleton";
import { useAuth } from "../../../context/AuthContext";
import { canCreate, canUpdate, canDelete, RESOURCES } from "../../../utils/permissions";
import { useTopBar } from "../../../context/TopBarContext";

// Main Tile View Team Component
const Tile_View_Team = () => {
  const theme = useTheme();
  const { palette } = theme;
  const { showSnackbar } = useSnackbar();
  const { viewMode } = useViewMode();
  const { user } = useAuth();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const {
    teamData,
    loading,
    deleteTeam,
    fetchTeamMembers,
    teamPagination,
  } = useTeamContext();

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [openConfirm, setOpenConfirm] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState(null);
  const [openAddEditDialog, setOpenAddEditDialog] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [openNavigateDialog, setOpenNavigateDialog] = useState(false);
  const [deleteResponse, setDeleteResponse] = useState(null);
  const observerTarget = useRef(null);
  const location = useLocation();

  // Register search action in top bar for mobile
  const { registerActions, clearActions } = useTopBar();
  useEffect(() => {
    if (isMobile) {
      registerActions({
        onSearchToggle: () => setIsSearchVisible((prev) => !prev),
        isSearchActive: isSearchVisible,
      });
    }
    return () => { if (isMobile) clearActions(); };
  }, [isMobile, isSearchVisible]);

  // Auto-open add dialog from mobile FAB navigation
  useEffect(() => {
    if (location.state?.openAdd) {
      setSelectedMember(null);
      setOpenAddEditDialog(true);
      window.history.replaceState({}, document.title);
    }
  }, [location.state?.openAdd]);

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedMember(null);
  };

  const handleEdit = (member) => {
    setSelectedMember(member);
    setOpenAddEditDialog(true);
    setAnchorEl(null);
  };

  const openDeleteDialog = (member) => {
    setMemberToDelete(member);
    setOpenConfirm(true);
    setAnchorEl(null);
  };

  const handleDeleteMember = async () => {
    if (memberToDelete) {
      try {
        const res = await deleteTeam(memberToDelete.id);
        showSnackbar(res.message, 'success');
      } catch (error) {
        if (error.actionRequired === 'reassign_tasks') {
          setDeleteResponse(error);
          setOpenNavigateDialog(true);
        } else {
          showSnackbar(error.message, 'error');
          console.error('Error deleting team member:', error);
        }
      }
    }
    setOpenConfirm(false);
    setMemberToDelete(null);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchText]);

  const handleSearch = async (text) => {
    setSearchText(text);
    try {
      await fetchTeamMembers(text);
    } catch (error) {
      console.error('Error searching team members:', error);
    }
  };

  const loadMoreTeamMembers = useCallback(async () => {
    if (isLoadingMore || loading || !teamPagination.hasNextPage) {
      return;
    }

    try {
      setIsLoadingMore(true);
      const nextPage = currentPage + 1;
      await fetchTeamMembers(searchText, nextPage, true);
      setCurrentPage(nextPage);
    } catch (error) {
      showSnackbar('Failed to load more team members', 'error');
      console.error('Error loading more team members:', error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [teamPagination, isLoadingMore, loading, currentPage, searchText, fetchTeamMembers, showSnackbar]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && teamPagination.hasNextPage && !isLoadingMore && !loading) {
          loadMoreTeamMembers();
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
  }, [loadMoreTeamMembers, teamPagination, isLoadingMore, loading]);

  const handleCancelDelete = () => {
    setOpenConfirm(false);
    setMemberToDelete(null);
  };

  const handleCloseDialog = () => {
    setOpenAddEditDialog(false);
    setSelectedMember(null);
  };

  const handleCloseNavigateDialog = () => {
    setOpenNavigateDialog(false);
    setDeleteResponse(null);
  };

  console.log('user in tile view team:', user);

  // get teamRole then we need to give the access based on the role
  const teamRole = user?.teamRole;

  // Check permissions for team resource
  const canCreateTeam = canCreate(teamRole, RESOURCES.TEAM);
  const canUpdateTeam = canUpdate(teamRole, RESOURCES.TEAM);
  const canDeleteTeam = canDelete(teamRole, RESOURCES.TEAM);

  return (

    <Container maxWidth={viewMode === 'center' ? 'md' : 'mx'} sx={{ mt: 2, px: viewMode === 'center' ? { xs: 2, sm: 3, md: 4 } : 0 }}>

      <Stack direction="row" display="flex" justifyContent={isMobile ? "flex-end" : "space-between"} alignItems="center" mb={2} sx={{ py: 1 }}>

        {canCreateTeam && !isMobile && (
          <Button
            variant="contained"
            disableElevation
            size="medium"
            onClick={() => {
              setSelectedMember(null);
              setOpenAddEditDialog(true);
            }}
            sx={{
              bgcolor: palette.primary.main,
              "&:hover": { bgcolor: palette.secondary.main },
              textTransform: "none",
              borderRadius: 10,
            }}
          >
            Add Team Member
          </Button>
        )}
        {!canCreateTeam && !isMobile && <Box />}
        {!isMobile && <IconButton
          onClick={() => setIsSearchVisible((prev) => !prev)}
          sx={{
            bgcolor: isSearchVisible ? palette.secondary.main : "transparent",
            color: isSearchVisible ? "#ffffff" : palette.text.primary,
            "&:hover": { bgcolor: palette.primary.main, color: "#ffffff" }
          }}
        >
          {isSearchVisible ? <SearchOff /> : <Search />}
        </IconButton>}
      </Stack>

      {isSearchVisible && (
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search team members, roles..."
          size="small"
          focused
          value={searchText}
          onChange={(e) => handleSearch(e.target.value)}
          InputProps={{
            endAdornment: (
              <IconButton onClick={() => handleSearch("")}>
                <Clear />
              </IconButton>
            ),
            sx: { paddingRight: 0 },
          }}
          sx={{ mb: 2 }}
        />
      )}

      {/* Show skeleton when loading initial data */}
      {loading && teamData.length === 0 && (
        <TeamCardSkeleton count={6} viewMode={viewMode} />
      )}

      {/* Show empty state when no data and not loading */}
      {teamData.length === 0 && !loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <Typography variant="body2" color="text.secondary">
            No team members found.
          </Typography>
        </Box>
      )}

      {/* Show team member cards */}
      {teamData.length > 0 && (

        <Grid container spacing={2}>
          {teamData.map((member) => (
            <Grid size={viewMode === 'center' ? { xs: 12 } : { xs: 12, sm: 6, md: 4 }} key={member.id}>
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                  bgcolor: palette.background.paper,
                }}>
                <CardContent sx={{ pb: "16px !important" }}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar
                        sx={{
                          height: 50,
                          width: 50,
                          bgcolor: palette.primary.main
                        }}
                      >
                        {member.name.split(" ").map((n) => n[0]).join("").toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="body1" sx={{ textTransform: 'capitalize', fontWeight: 'bold', fontSize: '1rem' }} gutterBottom>
                          {member.name}
                        </Typography>
                        <Typography variant="body2" sx={{ textTransform: 'capitalize', }}>
                          {member.role}
                        </Typography>
                      </Box>
                    </Stack>

                    <Stack direction="row" spacing={1} alignItems="center">
                      {(canUpdateTeam || canDeleteTeam) && (
                        <IconButton
                          aria-label="settings"
                          onClick={(e) => {
                            setSelectedMember(member);
                            setAnchorEl(e.currentTarget);
                          }}
                          sx={{ color: palette.text.primary }}
                        >
                          <MoreVert />
                        </IconButton>
                      )}
                    </Stack>
                  </Stack>
                  <Stack direction="row" spacing={1} mt={2} justifyContent="space-evenly">
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      justifyContent="center"
                      sx={{
                        width: "200px",
                        bgcolor: palette.card_button.paper,
                        p: 1,
                        borderRadius: 2
                      }}>
                      <Phone
                        size="small"
                        sx={{
                          color: "#ffffff",
                          backgroundColor: palette.secondary.main,
                          borderRadius: "50%",
                          padding: "2px",
                          width: "20px",
                          height: "20px",
                        }} />
                      <Typography variant="body2" color="text.primary">
                        {member.phone}
                      </Typography>
                    </Stack>
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      justifyContent="center"
                      sx={{
                        width: "200px",
                        bgcolor: palette.card_button.paper,
                        p: 1,
                        borderRadius: 2
                      }}>
                      <CheckCircle sx={{ color: palette.primary.light }} />
                      <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                        {member.status}
                      </Typography>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

      )}

      {/* Loading more indicator */}
      {isLoadingMore && (

        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 2 }}>
          <CircularProgress size={24} />
        </Box>

      )}

      <div ref={observerTarget} style={{ height: '20px' }} />

      {/* Pagination info */}
      {teamPagination.totalPages > 9 && (

        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Page {teamPagination.page} of {teamPagination.totalPages} • Total: {teamPagination.total} members
          </Typography>
        </Box>

      )}

      {/* Context Menu */}

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          elevation: 2,
          sx: {
            borderRadius: 2,
            p: 1,
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
        {canUpdateTeam && (
          <MenuItem onClick={() => handleEdit(selectedMember)} dense>
            <ListItemIcon>
              <Edit fontSize="small" sx={{ color: palette.primary.main }} />
            </ListItemIcon>
            <ListItemText>Edit</ListItemText>
          </MenuItem>
        )}
        {canDeleteTeam && (
          <MenuItem onClick={() => openDeleteDialog(selectedMember)} dense>
            <ListItemIcon>
              <Delete fontSize="small" sx={{ color: palette.secondary.main }} />
            </ListItemIcon>
            <ListItemText>Delete</ListItemText>
          </MenuItem>
        )}
      </Menu>

      {/* Dialogs */}
      <ConfirmationDialog
        open={openConfirm}
        onCancel={handleCancelDelete}
        onDelete={handleDeleteMember}
        title="Delete Team Member"
        message="Are you sure you want to delete this team member? This action cannot be undone."
      />

      <TileView_addEdit_team
        open={openAddEditDialog}
        onClose={handleCloseDialog}
        teamMember={selectedMember}
      />

      <NavigateToTask
        open={openNavigateDialog}
        onClose={handleCloseNavigateDialog}
        deleteResponse={deleteResponse}
      />
    </Container>
  );
};

export default Tile_View_Team;