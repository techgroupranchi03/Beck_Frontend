import * as React from 'react';
import { useState } from 'react';
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
} from '@mui/material';

import CloseIcon from '@mui/icons-material/Close';
import { addClient } from '../../service/Admin/Admin_auth';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useSnackbar } from '../../resuable_components/Snackbar';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function Add_ClientsDialog({ open, onClose }) {
  const theme = useTheme();
  const { palette } = theme;
  const { showSnackbar } = useSnackbar();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [plan, setPlan] = useState('');
  const [valid_from, setValid_from] = useState('');
  const [valid_to, setValid_to] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');
  const [errors, setErrors] = useState(null);


  const formData = {
    name,
    phone,
    company,
    plan,
    valid_from,
    valid_to,
    password,
    status,
  };


  const handleSubmit = async () => {
    try {
      setLoading(true);
      const response = await addClient(formData);
      showSnackbar(response.message || 'Client added successfully', 'success');
      setLoading(false);
      handleCancel();
    } catch (error) {
      if (error.errors && Array.isArray(error.errors)) {
        const errorMap = {};
        error.errors.forEach(err => {
          Object.keys(err).forEach(field => {
            errorMap[field] = err[field];
          });
        });
        setErrors(errorMap);
      }
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setName("");
    setPhone("");
    setCompany("");
    setPlan("");
    setValid_from(null);
    setValid_to(null);
    setPassword("");
    setStatus("active");
    onClose();
  };
  return (
    <Dialog
      open={open}
      TransitionComponent={Transition}
      keepMounted
      aria-describedby="add-client-dialog"
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
        Add New Client
      </DialogTitle>

      <IconButton
        onClick={handleCancel}
        sx={{ position: "absolute", top: 8, right: 8 }}
      >
        <CloseIcon />
      </IconButton>

      {/* CONTENT */}
      <DialogContent dividers sx={{ pt: 2 }}>

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
                inputMode: "numeric",
                pattern: "[0-9]*",
              }}
              required
              error={Boolean(errors?.phone)}
              helperText={errors?.phone}
            />
          </Grid>


          {/* ROW 3 */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl size="small" fullWidth>
              <InputLabel>Plan</InputLabel>
              <Select
                name="plan"
                value={plan}
                onChange={(e) => setPlan(e.target.value)}
                label="Plan"
              >
                <MenuItem value="basic">Basic</MenuItem>
                <MenuItem value="premium">Premium</MenuItem>
              </Select>
              {errors && <FormHelperText sx={{ color: 'error.main' }}>{errors.plan}</FormHelperText>}
            </FormControl>
            
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl size="small" fullWidth>
              <InputLabel>State</InputLabel>
              <Select
                name="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                label="Status"
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
              {errors && <FormHelperText sx={{ color: 'error.main' }}>{errors.status}</FormHelperText>}
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              name="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              size="small"
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              error={Boolean(errors?.password)}
              helperText={errors?.password}
              slotProps={{
                input: {
                  endAdornment: password ? (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        sx={{ color: palette.text.primary }}
                        aria-label={showPassword ? "Hide password" : "Show password"}
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
              error={Boolean(errors?.valid_to)}
              helperText={errors?.valid_to}
            />
          </Grid>

        </Grid>
      </DialogContent>

      {/* FOOTER */}
      <DialogActions sx={{ p: 2 }}>
        <Button
          variant="contained"
          disableElevation
          onClick={handleSubmit}
          disabled={loading}
          sx={{ textTransform: 'none', backgroundColor: palette.primary.main, '&:hover': { backgroundColor: palette.secondary.main } }}

        >
          {loading ? 'Adding...' : 'Add Client'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
