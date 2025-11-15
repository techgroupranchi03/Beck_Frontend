import React, { useMemo, useState } from 'react';
import {
  Box,
  Button,
  IconButton,
  Container,
  Typography,
  useTheme,
  MenuItem,
  TextField,
} from '@mui/material';
import { MaterialReactTable } from 'material-react-table';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import ConfirmationDialog from '../../../dialoge/clients/Confirmation_dialog';
import Add_Edit_Inventory from '../../../dialoge/clients/Add_Edit_Inventory';

const InventoryManagement = () => {
  const theme = useTheme();
  const { palette } = theme;

  // Initial sample inventory list
  const [inventoryData, setInventoryData] = useState([
    {
      id: 1,
      name: 'Fire Extinguisher',
      category: 'Safety',
      property: 'Greenwood Villa',
      quantity: 10,
      unit: 'pcs',
      expiry_date: '2026-10-15',
      assigned_team: 'John Doe',
      check_frequency: 'Monthly'
    },
    {
      id: 2,
      name: 'HVAC Filter',
      category: 'Maintenance',
      property: 'Sunset Apartments',
      quantity: 25,
      unit: 'pcs',
      expiry_date: '2025-07-25',
      assigned_team: 'Jane Smith',
      check_frequency: 'Quarterly'
    },
    {
      id: 3,
      name: 'Light Bulbs',
      category: 'Maintenance',
      property: 'Greenwood Villa',
      quantity: 50,
      unit: 'pcs',
      expiry_date: '2027-01-10',
      assigned_team: 'Mike Johnson',
      check_frequency: 'Monthly'
    },
    {
      id: 4,
      name: 'First Aid Kit',
      category: 'Safety',
      property: 'Sunset Apartments',
      quantity: 5,
      unit: 'kits',
      expiry_date: '2026-12-01',
      assigned_team: 'Emily Davis',
      check_frequency: 'Monthly'
    },
    {
      id: 5,
      name: 'Water Heater',
      category: 'Appliance',
      property: 'Lakeside Cottage',
      quantity: 2,
      unit: 'units',
      expiry_date: '2030-05-20',
      assigned_team: 'David Brown',
      check_frequency: 'Yearly'
    },
    {
      id: 6,
      name: 'Smoke Detector',
      category: 'Safety',
      property: 'Lakeside Cottage',
      quantity: 8,
      unit: 'pcs',
      expiry_date: '2028-11-30',
      assigned_team: 'Sarah Wilson',
      check_frequency: 'Monthly'
    },
    {
      id: 7,
      name: 'Air Conditioner',
      category: 'Appliance',
      property: 'Lakeside Cottage',
      quantity: 3,
      unit: 'units',
      expiry_date: '2031-03-15',
      assigned_team: 'Chris Martin',
      check_frequency: 'Yearly'
    },
    {
      id: 8,
      name: 'Garden Hose',
      category: 'Outdoor',
      property: 'Lakeside Cottage',
      quantity: 15,
      unit: 'meters',
      expiry_date: '2032-08-20',
      assigned_team: 'Anna Lee',
      check_frequency: 'Yearly'
    },
    {
      id: 9,
      name: 'Roofing Nails',
      category: 'Maintenance',
      property: 'Greenwood Villa',
      quantity: 100,
      unit: 'boxes',
      expiry_date: '2033-04-10',
      assigned_team: 'Tom Harris',
      check_frequency: 'Yearly'
    },
    {
      id: 10,
      name: 'Lawn Mower',
      category: 'Outdoor',
      property: 'Greenwood Villa',
      quantity: 1,
      unit: 'units',
      expiry_date: '2034-06-15',
      assigned_team: 'Alice Green',
      check_frequency: 'Yearly'
    }
  ]);

  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [editingInventory, setEditingInventory] = useState(null);
  const [inventoryToDelete, setInventoryToDelete] = useState(null);

  console.log('Inventory Data:', inventoryToDelete);

  const handleAddInventory = () => {
    setEditingInventory(null);
    setOpenAddDialog(true);
  };
  const handleSaveInventory = (inventoryItem) => {
    if (editingInventory) {
      // Edit existing inventory item
      setInventoryData((prevData) =>
        prevData.map((item) =>
          item.id === inventoryItem.id ? inventoryItem : item
        )
      );
    } else {
      // Add new inventory item
      setInventoryData((prevData) => [...prevData, inventoryItem]);
    }
    setOpenAddDialog(false);
  };

  const handleEdit = (row) => {
    setEditingInventory(row.original);
    setOpenAddDialog(true);
  };

  const handleDelete = (row) => {
    setInventoryToDelete(row.original.id);
    setOpenConfirm(true);
  };

  const handleConfirmDelete = () => {
    if (inventoryToDelete != null) {
      setInventoryData((prev) =>
        prev.filter((item) => item.id !== inventoryToDelete)
      );
    }
    setOpenConfirm(false);
    setInventoryToDelete(null);
  };

  const handleCancelDelete = () => {
    setOpenConfirm(false);
    setInventoryToDelete(null);
  };


  const columns = useMemo(
    () => [
      { header: 'Item Name', accessorKey: 'name' },
      { header: 'Category', accessorKey: 'category' },
      { header: 'Property', accessorKey: 'property' },
      { header: 'Quantity', accessorKey: 'quantity' },
      { header: 'Unit', accessorKey: 'unit' },
      { header: 'Expiry Date', accessorKey: 'expiry_date' },
      { header: 'Assigned Team', accessorKey: 'assigned_team' },
      { header: 'Check Frequency', accessorKey: 'check_frequency' },
      {
        header: 'Actions',
        Cell: ({ row }) => (
          <Box display="flex" gap={1}>
            <IconButton
              size="small"
              onClick={() => handleEdit(row)}
              sx={{ color: palette.primary.main }}
            >
              <EditIcon fontSize="small" />
            </IconButton>

            <IconButton
              size="small"
              onClick={() => handleDelete(row)}
              sx={{ color: palette.secondary.main }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        ),
      },
    ],
    [theme]
  );

  return (
    <React.Fragment>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>

        {/* Add Inventory Button */}
        <Box display="flex" justifyContent="end" mb={2}>
          <Button
            variant="contained"
            disableElevation
            sx={{
              bgcolor: palette.primary.main,
              "&:hover": { bgcolor: palette.secondary.main },
            }}
            onClick={handleAddInventory}
          >
            ADD INVENTORY
          </Button>
        </Box>

        {/* Inventory Table */}
        <MaterialReactTable
          columns={columns}
          data={inventoryData}
          enableColumnFilters
          enableSorting
          enablePagination
          muiTablePaperProps={{
            sx: { borderRadius: 2, boxShadow: "0px 2px 6px rgba(0,0,0,0.05)" },
          }}
          muiTableHeadCellProps={{
            sx: {
              bgcolor: palette.primary.main,
              color: "#fff",
              fontWeight: 600,
            },
          }}
        />

        <ConfirmationDialog
          open={openConfirm}
          onCancel={handleCancelDelete}
          onDelete={handleConfirmDelete}
          title="Delete Inventory Item"
          message="Are you sure you want to delete this inventory item? This action cannot be undone."
        />

        <Add_Edit_Inventory
          open={openAddDialog}
          onClose={() => setOpenAddDialog(false)}
          onSave={handleSaveInventory}
          inventoryItem={editingInventory}
        />

      </Container>
    </React.Fragment>
  );
};

export default InventoryManagement;
