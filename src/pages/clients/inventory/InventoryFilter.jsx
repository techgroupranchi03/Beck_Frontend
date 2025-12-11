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
  const [category, setCategory] = useState("");
  const [propertyId, setPropertyId] = useState("");
  const [unit, setUnit] = useState("");
  const [quantity, setQuantity] = useState("");
  const [lowerLimit, setLowerLimit] = useState("");
  const [locatedAt, setLocatedAt] = useState("");
  const [isFilter, setIsFilter] = useState(false);
  // Get data from context
  const { properties, units, containerOptions } = useInventoryContext();

  const theme = useTheme();
  const { palette } = theme;

  const handleFilterApply = () => {
    const filters = {};
    if (category) filters.category = category;
    if (propertyId) filters.property_id = propertyId;
    if (unit) filters.unit = unit;
    if (quantity) filters.quantity = quantity;
    if (lowerLimit) filters.lower_limit = lowerLimit;
    if (locatedAt) filters.located_at = locatedAt;

    setIsFilter(Object.keys(filters).length > 0);
    onApplyFilters(filters);
    onClose();
  };

  const handleClearFilters = () => {
    setCategory("");
    setPropertyId("");
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
        {/* Property Filter */}
        <FormControl fullWidth>
          <TextField
            select
            label="Property"
            size="small"
            sx={{ mb: 3 }}
            value={propertyId}
            onChange={(event) => setPropertyId(event.target.value)}
          >
            {properties.map((property) => (
              <MenuItem key={property.id} value={property.id} dense>
                {property.name}
              </MenuItem>
            ))}
          </TextField>
        </FormControl>
        {/* Category Filter */}
        <FormControl fullWidth>
          <TextField
            select
            label="Category"
            size="small"
            sx={{ mb: 3 }}
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            {categories.map((cat) => (
              <MenuItem key={cat} value={cat} dense>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </MenuItem>
            ))}
          </TextField>
        </FormControl>
        {/* Unit Filter */}
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

        {/* quantity Filter based on selected unit and mapped containerOptions */}
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

        {/* Lower Limit Filter */}
        <TextField
          label="Enter Lower Limit"
          type="number"
          size="small"
          value={lowerLimit}
          onChange={(e) => setLowerLimit(e.target.value)}
          fullWidth
          sx={{ mb: 3 }}
        />
        {/* Located At Filter */}
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