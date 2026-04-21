import React, { useState } from "react";
import {
  Drawer,
  Box,
  Typography,
  Button,
  TextField,
  Autocomplete,
  FormControl,
  MenuItem,
  Stack,
  useTheme,
} from "@mui/material";
import { categories } from "../../../constant";
import { useInventoryContext } from "./InventoryManagement";

const InventoryFilter = ({ open, onClose, onApplyFilters }) => {
  const [category, setCategory] = useState([]);
  const [propertyId, setPropertyId] = useState([]);
  const [unit, setUnit] = useState("");
  const [quantity, setQuantity] = useState("");
  const [lowerLimit, setLowerLimit] = useState("");
  const [locatedAt, setLocatedAt] = useState("");
  const [isFilter, setIsFilter] = useState(false);
  const { properties, units, containerOptions } = useInventoryContext();
  const theme = useTheme();
  const { palette } = theme;

  const handleFilterApply = () => {
    const filters = {};
    if (category.length > 0) filters.category = category;
    if (propertyId.length > 0) filters.property_id = propertyId;
    if (unit) filters.unit = unit;
    if (quantity) filters.quantity = quantity;
    if (lowerLimit) filters.lower_limit = lowerLimit;
    if (locatedAt) filters.located_at = locatedAt;
    setIsFilter(Object.keys(filters).length > 0);
    onApplyFilters(filters);
    onClose();
  };

  const handleClearFilters = () => {
    setCategory([]);
    setPropertyId([]);
    setUnit("");
    setQuantity("");
    setLowerLimit("");
    setLocatedAt("");
    setIsFilter(false);
    onApplyFilters({});
  };

  return (

    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { width: 280, padding: 2, bgcolor: palette.background.paper },
      }}
    >
      <Box>

        <Stack
          spacing={2}
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          mb={2}
        >
          <Typography variant="h6" color={palette.text.primary}>
            Filter Inventory
          </Typography>
          {isFilter && (
            <Button
              variant="text"
              size="small"
              onClick={handleClearFilters}
              sx={{ textTransform: "none", color: palette.error.main }}
            >
              Clear Filters
            </Button>
          )}
        </Stack>
   
        <Autocomplete
          size="small"
          multiple
          limitTags={2}
          value={propertyId.map(id => properties.find(p => p.id === id)).filter(Boolean)}
          onChange={(event, newValue) => {
            setPropertyId(newValue.map(v => v.id));
          }}
          options={properties}
          getOptionLabel={(option) => option.name || ""}
          renderOption={(props, option) => (
            <li {...props} key={option.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{option.name}</span>
              {option.property_image_url && (
                <img
                  src={option.property_image_url}
                  alt={option.name || ''}
                  style={{ width: 30, height: 30, objectFit: 'cover', borderRadius: 100, marginLeft: 8 }}
                />
              )}
            </li>
          )}
          renderInput={(params) => (
            <TextField {...params} label="Property" placeholder="Select properties" />
          )}
          sx={{ mb: 3 }}
        />

        <Autocomplete
          size="small"
          multiple
          limitTags={2}
          value={category}
          onChange={(event, newValue) => {
            setCategory(newValue);
          }}
          options={categories}
          getOptionLabel={(option) => option.charAt(0).toUpperCase() + option.slice(1)}
          renderInput={(params) => (
            <TextField {...params} label="Category" placeholder="Select categories" />
          )}
          sx={{ mb: 3 }}
        />
   
        <FormControl fullWidth>
          <TextField
            select
            label="Unit"
            size="small"
            sx={{ mb: 3 }}
            value={unit}
            onChange={(event) => setUnit(event.target.value)}
          >
            {units.map((unit) => (
              <MenuItem key={unit.value} value={unit.value} dense>
                {unit.label}
              </MenuItem>
            ))}
          </TextField>
        </FormControl>

        {unit.toLowerCase() === "container" ? (
          <FormControl fullWidth>
            <TextField
              select
              label="Quantity"
              size="small"
              sx={{ mb: 3 }}
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
            >
              {containerOptions.map((option) => (
                <MenuItem key={option.value} value={option.value} dense>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </FormControl>
        ) : (
          <TextField
            label="Enter Quantity"
            type="number"
            size="small"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            fullWidth
            sx={{ mb: 3 }}
          />
        )}

        <TextField
          label="Enter Lower Limit"
          type="number"
          size="small"
          value={lowerLimit}
          onChange={(e) => setLowerLimit(e.target.value)}
          fullWidth
          sx={{ mb: 3 }}
        />
      
        <TextField
          label="Located At"
          size="small"
          value={locatedAt}
          onChange={(e) => setLocatedAt(e.target.value)}
          fullWidth
          sx={{ mb: 3 }}
        />

        <Button
          variant="contained"
          disableElevation
          color="primary"
          fullWidth
          sx={{
            mt: 1,
            bgcolor: palette.primary.main,
            "&:hover": { bgcolor: palette.secondary.main },
            borderRadius: 10,
          }}
          onClick={handleFilterApply}
        >
          Apply Filters
        </Button>
        
      </Box>
    </Drawer>
  );
};

export default InventoryFilter;