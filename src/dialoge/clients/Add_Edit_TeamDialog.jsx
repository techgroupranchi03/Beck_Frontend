import * as React from 'react';
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  IconButton,
  Slide,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function Add_Edit_TeamDialog({ open, onClose, onSave, teamMember }) {
  const theme = useTheme();
  const isEdit = !!teamMember;

  const [formData, setFormData] = useState({
    name: '',
    role: '',
    phone: '',
    status: 'active',
  });

  useEffect(() => {
    if (teamMember) {
      setFormData({
        name: teamMember.name || '',
        role: teamMember.role || '',
        phone: teamMember.phone || '',
        status: teamMember.status || 'active',
      });
    } else {
      setFormData({
        name: '',
        role: '',
        phone: '',
        status: 'active',
      });
    }
  }, [teamMember]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (isEdit) {
      const updatedTeamMember = {
        ...teamMember,
        ...formData,
      };
      onSave(updatedTeamMember);
    } else {
      const newTeamMember = {
        id: Date.now(),
        ...formData,
      };
      onSave(newTeamMember);
    }
    handleCancel();
  };

  const handleCancel = () => {
    setFormData({
      name: '',
      role: '',
      phone: '',
      status: 'active',
    });
    onClose();
  };

  // Prevent dialog from closing on outside click or Esc
  const handleDialogClose = (event, reason) => {
    if (reason === 'backdropClick' || reason === 'escapeKeyDown') {
      return;
    }
    handleCancel();
  };

  return (
    <Dialog
      open={open}
      TransitionComponent={Transition}
      keepMounted
      onClose={handleDialogClose}
      aria-describedby="team-dialog"
      fullWidth
      maxWidth="sm"
      disableEscapeKeyDown
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          m: { xs: 1, sm: 2 },
        },
      }}
      sx={{
        '& .MuiBackdrop-root': {
          backgroundColor: 'rgba(19, 36, 33, 0.7)',
        },
      }}
    >
      <DialogTitle sx={{ color: theme.palette.text.primary, fontWeight: 600, pb: 1 }}>
        {isEdit ? 'Edit Team Member' : 'Add New Team Member'}
      </DialogTitle>
      <IconButton
        onClick={handleCancel}
        sx={{ position: 'absolute', top: 8, right: 8 }}
      >
        <CloseIcon />
      </IconButton>
      <DialogContent dividers sx={{ pt: 2 }}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <TextField
              autoFocus
              name="name"
              label="Name"
              type="text"
              size="small"
              fullWidth
              variant="outlined"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Role</InputLabel>
              <Select
                name="role"
                value={formData.role}
                onChange={handleChange}
                label="Role"
                required
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                <MenuItem value="Manager">Manager</MenuItem>
                <MenuItem value="Technician">Technician</MenuItem>
                <MenuItem value="Inspector">Inspector</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <TextField
              name="phone"
              label="Phone"
              type="tel"
              size="small"
              fullWidth
              variant="outlined"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                name="status"
                value={formData.status}
                onChange={handleChange}
                label="Status"
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
                <MenuItem value="on_leave">On Leave</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 2, justifyContent: 'end' }}>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!formData.name || !formData.role || !formData.phone}
          sx={{
            bgcolor: theme.palette.primary.main,
            '&:hover': {
              bgcolor: theme.palette.secondary.main,
            },
          }}
        >
          {isEdit ? 'Save Changes' : 'Add Team Member'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

