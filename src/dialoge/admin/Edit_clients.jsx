import * as React from 'react';
import { useEffect, useState } from 'react';
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
  Typography,
  InputAdornment,
  FormHelperText,
  CircularProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { getClientbyId, editClient } from '../../service/Admin/Admin_auth';
import { useSnackbar } from '../../resuable_components/Snackbar';


const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function EditClientsDialog({ open, onClose, clientId, onSave }) {
  const theme = useTheme();
  const { palette } = theme;
  const { showSnackbar } = useSnackbar();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [plan, setPlan] = useState('');
  const [valid_from, setValid_from] = useState('');
  const [valid_to, setValid_to] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('active');
  const [errors, setErrors] = useState({});

  console.log("EditClientsDialog", errors);

  // Fetch client data when dialog opens or clientId changes
  useEffect(() => {
    const fetchClientData = async () => {
      if (clientId && open) {
        setFetchingData(true);
        setErrors({});
        try {
          const response = await getClientbyId({ id: clientId });
          console.log('Client data:', response.data);
          const client = response.data;

          // Populate form fields
          setName(client.name || '');
          setPhone(client.phone || '');
          setCompany(client.company || '');
          setPlan(client.plan?.toLowerCase() || '');

          // Format dates to YYYY-MM-DD for date input
          if (client.valid_from) {
            const dateFrom = new Date(client.valid_from);
            setValid_from(dateFrom.toISOString().split('T')[0]);
          } else {
            setValid_from('');
          }

          if (client.valid_to) {
            const dateTo = new Date(client.valid_to);
            setValid_to(dateTo.toISOString().split('T')[0]);
          } else {
            setValid_to('');
          }

          setPassword(''); // Keep empty for security
          setStatus(client.status?.toLowerCase() || 'active');
        } catch (error) {
          console.error('Error fetching client data:', error);
        } finally {
          setFetchingData(false);
        }
      }
    };

    fetchClientData();
  }, [clientId, open]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setErrors({});

      const formData = {
        id: clientId,
        name,
        phone,
        company,
        plan,
        valid_from,
        valid_to,
        status,
      };

      // Only include password if it's been changed
      if (password && password.trim() !== '') {
        formData.password = password;
      }
      const res = await editClient(formData);
      showSnackbar(res.message || 'Client updated successfully', 'success');
      handleCancel();
      onSave();
    } catch (error) {
      console.error('Error updating client:', error);

      if (error.errors && Array.isArray(error.errors)) {
        const errorMap = {};

        error.errors.forEach(err => {
          Object.keys(err).forEach(field => {
            errorMap[field] = err[field];
          });
        });
        setErrors(errorMap);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setName('');
    setPhone('');
    setCompany('');
    setPlan('');
    setValid_from('');
    setValid_to('');
    setPassword('');
    setStatus('active');
    onClose();
  };

  return (
    <Dialog
      open={open}
      TransitionComponent={Transition}
      keepMounted
      aria-describedby="edit-client-dialog"
      fullWidth
      maxWidth="md"
      disableEscapeKeyDown
      PaperProps={{
        sx: {
          borderRadius: 2,
          m: { xs: 1, sm: 2 },
          backgroundColor: palette.background.paper,
        },
      }}
      sx={{
        '& .MuiBackdrop-root': {
          backgroundColor: 'rgba(0,0,0,0.6)',
        },
      }}
    >
      {/* HEADER */}
      <DialogTitle sx={{ color: palette.text.primary, fontWeight: 600, pb: 1 }}>
        Edit Client
      </DialogTitle>

      <IconButton
        onClick={handleCancel}
        disabled={loading || fetchingData}
        sx={{ position: 'absolute', top: 8, right: 8 }}
      >
        <CloseIcon />
      </IconButton>

      {/* CONTENT */}
      <DialogContent dividers sx={{ pt: 2 }}>
        {fetchingData ? (
          <Grid container justifyContent="center" alignItems="center" sx={{ minHeight: 300 }}>
            <CircularProgress />
          </Grid>
        ) : (
          <Grid container spacing={3}>
            {/* ROW 1 */}
            <Grid size={{ xs: 12 }}>
              <TextField
                autoFocus
                name="name"
                label="Name"
                size="small"
                fullWidth
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
                error={Boolean(errors?.name)}
                helperText={errors?.name}

              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                name="companyName"
                label="Company Name"
                size="small"
                fullWidth
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                disabled={loading}
                error={Boolean(errors?.company)}
                helperText={errors?.company}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                name="phone"
                label="Phone"
                size="small"
                fullWidth
                value={phone}
                onChange={(e) => {
                  const val = e.target.value;
                  // allow only numbers and max length 10
                  if (/^\d{0,10}$/.test(val)) {
                    setPhone(val);
                  }
                }}
                inputProps={{
                  maxLength: 10,
                  inputMode: 'numeric',
                  pattern: '[0-9]*',
                }}
                required
                disabled={loading}
                error={Boolean(errors?.phone)}
                helperText={errors?.phone}
              />
            </Grid>

            {/* ROW 3 */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl size="small" fullWidth disabled={loading}>
                <InputLabel>Plan*</InputLabel>
                <Select
                  name="plan"
                  value={plan}
                  onChange={(e) => setPlan(e.target.value)}
                  label="Plan"
                >
                  <MenuItem value="basic">Basic</MenuItem>
                  <MenuItem value="premium">Premium</MenuItem>
                </Select>
                {errors?.plan && (
                  <FormHelperText sx={{ color: 'error.main' }}>{errors.plan}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl size="small" fullWidth disabled={loading}>
                <InputLabel>State*</InputLabel>
                <Select
                  name="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  label="Status"
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
                {errors?.status && (
                  <FormHelperText sx={{ color: 'error.main' }}>{errors.status}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                name="password"
                label="Password (leave blank to keep current)"
                type={showPassword ? 'text' : 'password'}
                size="small"
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                helperText="Only fill this if you want to change the password"
                slotProps={{
                  input: {
                    endAdornment: password ? (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          sx={{ color: palette.text.primary }}
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ) : null,
                  },
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="body2" sx={{ mb: 1, color: palette.text.primary }}>
                Valid From *
              </Typography>
              <TextField
                name="valid_from"
                type="date"
                size="small"
                fullWidth
                variant="outlined"
                value={valid_from}
                onChange={(e) => setValid_from(e.target.value)}
                disabled={loading}
                error={Boolean(errors?.valid_from)}
                helperText={errors?.valid_from}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="body2" sx={{ mb: 1, color: palette.text.primary }}>
                Valid To *
              </Typography>
              <TextField
                name="valid_to"
                type="date"
                size="small"
                fullWidth
                variant="outlined"
                value={valid_to}
                onChange={(e) => setValid_to(e.target.value)}
                disabled={loading}
                error={Boolean(errors?.valid_to)}
                helperText={errors?.valid_to}
              />
            </Grid>
          </Grid>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button
          variant="contained"
          disableElevation
          onClick={handleSubmit}
          disabled={loading || fetchingData}
          sx={{
            textTransform: 'none',
            backgroundColor: palette.primary.main,
            '&:hover': { backgroundColor: palette.secondary.main },
          }}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {loading ? 'Updating...' : 'Update Client'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}