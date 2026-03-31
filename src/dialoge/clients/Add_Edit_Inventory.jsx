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
import QuantityInput from '../../resuable_components/QuantityInput';
import { units } from '../../constant';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function Add_Edit_Inventory({
  open,
  onClose,
  onSave,
  inventoryItem,
  properties = [],
  teamMembers = [],
}) {
  const theme = useTheme();
  const isEdit = !!inventoryItem;

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    property_id: "",
    assigned_team_id: "",
    quantity: "",
    unit: "",
    container_type: "",
    expiry_date: "",
    check_frequency: "",
  });

  useEffect(() => {
    if (inventoryItem) {
      setFormData({
        name: inventoryItem.name || "",
        category: inventoryItem.category || "",
        property_id: inventoryItem.property_id || "",
        assigned_team_id: inventoryItem.assigned_team_id || "",
        quantity: inventoryItem.quantity || "",
        unit: inventoryItem.unit || "",
        container_type: inventoryItem.container_type || "",
        expiry_date: inventoryItem.expiry_date || "",
        check_frequency: inventoryItem.check_frequency || "",
      });
    } else {
      setFormData({
        name: "",
        category: "",
        property_id: "",
        assigned_team_id: "",
        quantity: "",
        unit: "",
        container_type: "",
        expiry_date: "",
        check_frequency: "",
      });
    }
  }, [inventoryItem]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      // Reset container_type when unit changes
      if (name === 'unit' && value !== 'container') {
        updated.container_type = '';
      }
      // Reset quantity when unit changes to container
      if (name === 'unit' && value === 'container') {
        updated.quantity = '';
        updated.container_type = '';
      }
      return updated;
    });
  };

  const handleSubmit = () => {
    if (isEdit) {
      const updatedItem = {
        ...inventoryItem,
        ...formData,
      };
      onSave(updatedItem);
    } else {
      const newItem = {
        id: Date.now(),
        ...formData,
      };
      onSave(newItem);
    }
    handleCancel();
  };

  const handleCancel = () => {
    setFormData({
      name: "",
      category: "",
      property_id: "",
      assigned_team_id: "",
      quantity: "",
      unit: "",
      container_type: "",
      expiry_date: "",
      check_frequency: "",
    });
    onClose();
  };

  const handleDialogClose = (event, reason) => {
    if (reason === "backdropClick" || reason === "escapeKeyDown") return;
    handleCancel();
  };

  return (
    <Dialog
      open={open}
      TransitionComponent={Transition}
      keepMounted
      onClose={handleDialogClose}
      aria-describedby="inventory-dialog"
      fullWidth
      maxWidth="md"
      disableEscapeKeyDown
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
          m: { xs: 1, sm: 2 },
        },
      }}
      sx={{
        "& .MuiBackdrop-root": {
          backgroundColor: "rgba(19, 36, 33, 0.7)",
        },
      }}
    >
      <DialogTitle sx={{ color: theme.palette.text.primary, fontWeight: 600, pb: 1 }}>
        {isEdit ? "Edit Inventory Item" : "Add New Inventory Item"}
      </DialogTitle>

      <IconButton
        onClick={handleCancel}
        sx={{ position: "absolute", top: 8, right: 8 }}
      >
        <CloseIcon />
      </IconButton>

      <DialogContent dividers sx={{ pt: 2 }}>
        <Grid container spacing={3}>

          {/* Item Name */}
          <Grid size={{ xs: 12 , sm: 6 }}>
            <TextField
              autoFocus
              name="name"
              label="Item Name"
              size="small"
              fullWidth
              value={formData.name}
              onChange={handleChange}
              required
            />
          </Grid>

          {/* Category */}
          <Grid size={{ xs: 12 , sm: 6 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Category</InputLabel>
              <Select
                name="category"
                value={formData.category}
                onChange={handleChange}
                label="Category"
                required
              >
                <MenuItem value="Safety">Safety</MenuItem>
                <MenuItem value="Maintenance">Maintenance</MenuItem>
                <MenuItem value="Supplies">Supplies</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Property List */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Property</InputLabel>
              <Select
                name="property_id"
                value={formData.property_id}
                onChange={handleChange}
                label="Property"
                required
              >
                {properties.map((p) => (
                  <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Assigned Team */}
          <Grid size={{ xs: 12 , sm: 6 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Assigned To</InputLabel>
              <Select
                name="assigned_team_id"
                value={formData.assigned_team_id}
                onChange={handleChange}
                label="Assigned To"
              >
                {teamMembers.map((t) => (
                  <MenuItem key={t.id} value={t.id}>
                    {t.name} ({t.role})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Unit */}
          <Grid size={{ xs: 12 , sm: 6 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Unit</InputLabel>
              <Select
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                label="Unit"
                required
              >
                {units.map((u) => (
                  <MenuItem key={u.value} value={u.value}>{u.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Quantity */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <QuantityInput
              unit={formData.unit}
              value={formData.quantity}
              onChange={(val) => setFormData(prev => ({ ...prev, quantity: val }))}
              label="Quantity"
              containerType={formData.container_type}
              onContainerTypeChange={(val) => setFormData(prev => ({ ...prev, container_type: val, quantity: '' }))}
            />
          </Grid>

          {/* Expiry Date */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              name="expiry_date"
              label="Expiry Date"
              type="date"
              size="small"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={formData.expiry_date}
              onChange={handleChange}
            />
          </Grid>

          {/* Check Frequency */}
          <Grid size={{ xs: 12 , sm: 6 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Check Frequency</InputLabel>
              <Select
                name="check_frequency"
                value={formData.check_frequency}
                onChange={handleChange}
                label="Check Frequency"
              >
                <MenuItem value="Daily">Daily</MenuItem>
                <MenuItem value="Weekly">Weekly</MenuItem>
                <MenuItem value="Monthly">Monthly</MenuItem>
                <MenuItem value="Quarterly">Quarterly</MenuItem>
                <MenuItem value="Yearly">Yearly</MenuItem>
              </Select>
            </FormControl>
          </Grid>

        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 2, justifyContent: "end" }}>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!formData.name || !formData.category || !formData.quantity}
          sx={{
            bgcolor: theme.palette.primary.main,
            "&:hover": {
              bgcolor: theme.palette.secondary.main,
            },
          }}
        >
          {isEdit ? "Save Changes" : "Add Inventory Item"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
