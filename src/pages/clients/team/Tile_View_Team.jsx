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
} from "@mui/material";
import {
  MoreVert, Edit, Delete, Phone, CheckCircle,
  Search,
  SearchOff,
  Clear
} from "@mui/icons-material";

const teamMembers = [
  {
    id: 1,
    name: "Nitish Kumar",
    role: "Electrician",
    phone: "9798649094",
    status: "Active",
  },
  {
    id: 2,
    name: "Alice Johnson",
    role: "Plumber",
    phone: "9876543210",
    status: "Active",
  },
  {
    id: 3,
    name: "Bob Smith",
    role: "Carpenter",
    phone: "9123456780",
    status: "Inactive",
  },

  // Add more members as needed
];

const Tile_View_Team = () => {
  const theme = useTheme();
  const { palette } = theme;
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchText, setSearchText] = useState("");

  const handleMenuClick = (event, member) => {
    setAnchorEl(event.currentTarget);
    setSelectedMember(member);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedMember(null);
  };

  const handleEdit = () => {
    console.log("Edit member:", selectedMember);
    handleMenuClose();
  };

  const handleDelete = () => {
    console.log("Delete member:", selectedMember);
    handleMenuClose();
  };

  return (
    <Container maxWidth="mx" sx={{ mt: 2, px: 0, }}>
      {/* add team mebers button with search icon */}
      <Stack direction="row" display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Button
          variant="contained"
          disableElevation
          size="medium"
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
          onChange={(e) => setSearchText(e.target.value)}
          InputProps={{
            endAdornment: (
              <IconButton onClick={() => setSearchText("")}>
                <Clear />
              </IconButton>
            ),
            sx: { paddingRight: 0 },
          }}
          sx={{ mb: 2 }}
        />
      )}
      <Grid container spacing={2}>
        {teamMembers.map((member) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={member.id}>
            <Card
              sx={{
                mb: 0,
                borderRadius: 3,
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                bgcolor: palette.background.paper,
                transition: "transform 0.2s",
                "&:hover": {
                  transform: "scale(1.02)",
                },
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
                      onClick={(event) => handleMenuClick(event, member)}
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
                    <CheckCircle sx={{ color: "#4CAF50" }} />
                    <Typography variant="body2" color="#4CAF50">
                      {member.status}
                    </Typography>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
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
        <MenuItem onClick={handleEdit}>
          <ListItemIcon>
            <Edit sx={{ color: "#4CAF50" }} />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDelete}>
          <ListItemIcon>
            <Delete sx={{ color: "#F44336" }} />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>
    </Container>
  );
};

export default Tile_View_Team;