import React, { useState } from "react";
import {
  useTheme,
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
  Chip,
  Button,
  TextField,
  Snackbar,
} from "@mui/material";
import {
  MoreVert, Edit, Delete, Phone, CheckCircle,
  Search,
  SearchOff,
  Clear
} from "@mui/icons-material";
import { useTeamContext } from './TeamManagement';
import { useSnackbar } from '../../../resuable_components/Snackbar';
import ConfirmationDialog from '../../../dialoge/clients/Confirmation_dialog';
import TileView_addEdit_team from "./TileView_addEdit_team";
import NavigateToTask from "./NavigateToTask";

const Tile_View_Team = () => {
  const theme = useTheme();
  const { palette } = theme;
  const { showSnackbar } = useSnackbar();

  const statusColors = {
    active: "#4CAF50",
    inactive: "#d8cecdd1",
    pending: "#FF9800",
  };

  // Get data from context
  const {
    teamData,
    loading,
    deleteTeam,
    fetchTeamMembers,
  } = useTeamContext();

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [openConfirm, setOpenConfirm] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState(null);
  const [openAddEditDialog, setOpenAddEditDialog] = useState(false);

  const [openNavigateDialog, setOpenNavigateDialog] = useState(false);
  const [deleteResponse, setDeleteResponse] = useState(null);

  console.log('selectedMember:', selectedMember);



  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedMember(null);
  };

  const handleEdit = (member) => {
    console.log("Editing member:", member);
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
        showSnackbar(res.message || 'Team member deleted successfully', 'success');
      } catch (error) {
        if (error.actionRequired === 'reassign_tasks') {
          setDeleteResponse(error);
          setOpenNavigateDialog(true);
        } else {
          showSnackbar(error.message || 'Failed to delete team member', 'error');
          console.error('Error deleting team member:', error);
        }
      }
    }
    setOpenConfirm(false);
    setMemberToDelete(null);
  };

  // handle search
  const handleSearch = async (text) => {
    setSearchText(text);
    try {
      await fetchTeamMembers(text);
    } catch (error) {
      console.error('Error searching team members:', error);
    }
  };

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

  return (
    <Container maxWidth="mx" sx={{ mt: 2, px: 0, }}>
      {/* add team mebers button with search icon */}
      <Stack direction="row" display="flex" justifyContent="space-between" alignItems="center" mb={2}>
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
          }}
        >
          Add Team Member
        </Button>
        <IconButton
          onClick={() => setIsSearchVisible((prev) => !prev)}
          sx={{
            bgcolor: isSearchVisible ? palette.secondary.main : "transparent",
            color: isSearchVisible ? "#ffffff" : palette.text.primary,
            "&:hover": { bgcolor: palette.primary.main, color: "#ffffff" }
          }}
        >
          {isSearchVisible ? <SearchOff /> : <Search />}
        </IconButton>
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


      {teamData.length === 0 && !loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <Typography variant="body2" color="text.secondary">
            No team members found.
          </Typography>
        </Box>
      )}
      <Grid container spacing={2}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4, width: '100%' }}>
            <Typography>Loading team members...</Typography>
          </Box>
        ) : (
          teamData.map((member) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={member.id}>
              <Card
                sx={{
                  mb: 2,
                  borderRadius: 3,
                  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                  bgcolor: palette.background.paper,
                }}>
                <CardContent sx={{ pb: "16px !important" }}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar
                        sx={{
                          height: 56,
                          width: 56,
                          bgcolor: palette.primary.main
                        }}
                      >
                        {member.name.split(" ").map((n) => n[0]).join("").toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" >
                          {member.name}
                        </Typography>
                        <Typography variant="body2" >
                          {member.role}
                        </Typography>
                      </Box>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                      {/* <Chip
                      label={member.status}
                      size="small"
                      sx={{
                        padding: "4px 8px",
                        bgcolor: member.status === "Active" ? palette.primary.light : palette.error.main,
                        color: palette.text.primary,
                      }}
                    /> */}
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
                        // bgcolor: palette.background.creme,
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
                      <Typography variant="body2" color="#E91E63">
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
                      <CheckCircle sx={{ color: statusColors[member.status.toLowerCase()] }} />
                      <Typography variant="body1" color={statusColors[member.status.toLowerCase()]}>
                        {member.status}
                      </Typography>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      {/* Menu for Edit and Delete */}
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
        <MenuItem onClick={() => handleEdit(selectedMember)} dense>
          <ListItemIcon>
            <Edit fontSize="small" sx={{ color: palette.primary.main }} />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => openDeleteDialog(selectedMember)} dense>
          <ListItemIcon>
            <Delete fontSize="small" sx={{ color: palette.error.main }} />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

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


      {/* add snackbar to navigate to task module when we try to delete the task first say you need to reassign the task */}
      <NavigateToTask
        open={openNavigateDialog}
        onClose={handleCloseNavigateDialog}
        deleteResponse={deleteResponse}
      />
    </Container>
  );
};

export default Tile_View_Team;