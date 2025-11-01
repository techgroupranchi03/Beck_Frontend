import * as React from 'react';
import { useState } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Slide from '@mui/material/Slide';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { createTheme, ThemeProvider } from '@mui/material/styles';

// Custom Theme
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#407f68' },
    secondary: { main: '#6b603f' },
    background: { default: '#fef7c5', paper: '#ffffff' },
    text: { primary: '#132421' },
  },
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': { borderColor: '#407f68' },
            '&:hover fieldset': { borderColor: '#407f68' },
            '&.Mui-focused fieldset': { borderColor: '#407f68' },
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 600 },
        contained: {
          backgroundColor: '#407f68',
          color: '#ffffff',
          '&:hover': { backgroundColor: '#356a58' },
        },
      },
    },
  },
});

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function AddClientsDialog({ open, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    companyName: '',
    plan: '',
    validityDate: null,
    password: '',
    state: 'active',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date) => {
    setFormData((prev) => ({ ...prev, validityDate: date }));
  };

  const handleSubmit = () => {
    console.log('New Client:', formData);
    // TODO: API call
    onClose(); // Only close on submit
  };

  const handleCancel = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      companyName: '',
      plan: '',
      validityDate: null,
      password: '',
      state: 'active',
    });
    onClose();
  };

  // Prevent dialog from closing on outside click or Esc
  const handleDialogClose = (event, reason) => {
    if (reason === 'backdropClick' || reason === 'escapeKeyDown') {
      return; // Do nothing
    }
    handleCancel();
  };

  return (
    <ThemeProvider theme={theme}>
      <Dialog
        open={open}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleDialogClose}
        aria-describedby="add-client-dialog"
        fullWidth
        maxWidth="md"
        height="auto"
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
            backgroundColor: 'rgba(19, 36, 33, 0.7)', // Dark overlay
          },
        }}
      >
        <DialogTitle sx={{ color: '#132421', fontWeight: 600, pb: 1 }}>
          Add New Client
        </DialogTitle>
        <IconButton
          onClick={handleCancel}
          sx={{ position: 'absolute', top: 8, right: 8 }}
        >
          <CloseIcon />
        </IconButton>
        <DialogContent dividers sx={{ pt: 2 }}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
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
                <TextField
                  name="companyName"
                  label="Company Name"
                  type="text"
                  size="small"
                  fullWidth
                  variant="outlined"
                  value={formData.companyName}
                  onChange={handleChange}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  name="email"
                  label="Email"
                  type="email"
                  size="small"
                  fullWidth
                  variant="outlined"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </Grid>

           
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  name="phone"
                  label="Phone"
                  type="tel"
                  size="small"
                  fullWidth
                  variant="outlined"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </Grid>
             

              {/* Row 3 */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Plan</InputLabel>
                  <Select
                    name="plan"
                    value={formData.plan}
                    onChange={handleChange}
                    label="Plan"
                  >
                    <MenuItem value="">
                      <em>None</em>
                    </MenuItem>
                    <MenuItem value="basic">Basic</MenuItem>
                    <MenuItem value="premium">Premium</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <DatePicker
                  label="Validity Date"
                  value={formData.validityDate}
                  onChange={handleDateChange}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: 'small',
                      variant: 'outlined',
                    },
                  }}
                />
              </Grid>

              {/* Row 4 */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  name="password"
                  label="Password"
                  type="password"
                  size="small"
                  fullWidth
                  variant="outlined"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>State</InputLabel>
                  <Select
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    label="State"
                  >
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </LocalizationProvider>
        </DialogContent>

        <DialogActions sx={{ p: 2, justifyContent: 'end' }}>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!formData.name || !formData.email || !formData.password}
          >
            Add Client
          </Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
}