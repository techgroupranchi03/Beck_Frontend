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

const itemNames = ["Shampoo", "Elevator", "Chair", "Table", "Lamp"];
const categories = ["Safety", "Furniture", "Building Maintenance"];
const properties = ["RaiChandani", "Tech Office", "Main Building", "Warehouse"];

const InventoryFilter = ({ open, onClose, onApplyFilters }) => {
  const [ItemName, setItemName] = useState(null);
  const [Category, setCategory] = useState("");
  const [Property, setProperty] = useState("");
  const [isFilter, setIsFilter] = useState(false);

  const theme = useTheme();
  const { palette } = theme;

  const handleFilterApply = () => {
    const filters = {
      ItemName,
      Category,
      Property,
    };
    setIsFilter(true);
    onApplyFilters(filters);
    onClose();
  };

  const handleClearFilters = () => {
    setItemName(null);
    setCategory("");
    setProperty("");
    setIsFilter(false);
    onApplyFilters({ ItemName: null, Category: "", Property: "" });
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

        {/* Item Name Filter */}
        <Autocomplete
          size="small"
          value={ItemName}
          onChange={(event, newValue) => {
            setItemName(newValue);
          }}
          options={itemNames}
          renderInput={(params) => (
            <TextField {...params} label="Item Name" />
          )}
          sx={{ mb: 3 }}
        />

        {/* Category Filter */}
        <FormControl fullWidth>
          <TextField
            select
            label="Category"
            size="small"
            sx={{ mb: 3 }}
            value={Category}
            onChange={(event) => setCategory(event.target.value)}
          >
            {categories.map((category) => (
              <MenuItem key={category} value={category}>
                {category}
              </MenuItem>
            ))}
          </TextField>
        </FormControl>

        {/* Property Filter */}
        <FormControl fullWidth>
          <TextField
            select
            label="Property"
            size="small"
            sx={{ mb: 3 }}
            value={Property}
            onChange={(event) => setProperty(event.target.value)}
          >
            {properties.map((property) => (
              <MenuItem key={property} value={property}>
                {property}
              </MenuItem>
            ))}
          </TextField>
        </FormControl>

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