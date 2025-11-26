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
      <Container maxWidth="mx" sx={{ mt: 4, mb: 4 }}>

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


















// import React, { useEffect, useMemo, useState } from 'react';
// import {
//   Box,
//   Button,
//   IconButton,
//   Container,
//   Typography,
//   useTheme,
//   Tooltip,
// } from '@mui/material';
// import { MaterialReactTable } from 'material-react-table';
// import { Edit as EditIcon, Delete as DeleteIcon, Visibility as VisibilityIcon, Inventory2Rounded } from '@mui/icons-material';
// import ConfirmationDialog from '../../../dialoge/clients/Confirmation_dialog';
// import { getInventoryItems, createInventoryItem, updateInventoryItem, deleteInventoryItem, getUnitsAndQuantities } from '../../../service/Clients/Inventory';
// import { getClientProperties } from '../../../service/Clients/Properties';
// import { useSnackbar } from '../../../resuable_components/Snackbar';

// const InventoryManagement = () => {
//   const theme = useTheme();
//   const { palette } = theme;
//   const { showSnackbar } = useSnackbar();
//   const [inventoryData, setInventoryData] = useState([]);
//   const [properties, setProperties] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [openConfirm, setOpenConfirm] = useState(false);
//   const [inventoryToDelete, setInventoryToDelete] = useState(null);
//   const [validationErrors, setValidationErrors] = useState({});
//   const [units, setUnits] = useState([]);

//   // Hardcoded options
//   const categoryOptions = ['electronics', 'furniture', 'appliances', 'safety', 'maintenance', 'outdoor'];
//   const unitOptions = ['pcs', 'units', 'boxes', 'meters', 'kits', 'liters', 'kg'];

//   // get units and quantity
//   const fetchUnitsAndQuantities = async () => {
//     try {
//       const res = await getUnitsAndQuantities();
//       setUnits(res.data.units || []);
//       console.log("Units and quantities fetched:", res);
//     } catch (error) {
//       console.error("Error fetching units and quantities:", error);
//     }
//   };
//   useEffect(() => {
//     fetchUnitsAndQuantities();
//   }, []);


//   // Fetch properties
//   const fetchProperties = async () => {
//     try {
//       const res = await getClientProperties(1);
//       setProperties(res.data || []);
//     } catch (error) {
//       console.error("Error fetching properties:", error);
//     }
//   };


//   // Fetch inventory items
//   const fetchInventoryItems = async () => {
//     setLoading(true);
//     try {
//       const res = await getInventoryItems();
//       setInventoryData(res.data || []);
//     } catch (error) {
//       console.error('Error fetching inventory items:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchProperties();
//     fetchInventoryItems();
//   }, []);

//   // CREATE
//   const handleCreateInventory = async ({ values, table }) => {
//     try {
//       setLoading(true);
//       const res = await createInventoryItem(values);
//       showSnackbar(res.message || "Inventory item created successfully", "success");
//       await fetchInventoryItems();
//       table.setCreatingRow(null);
//     } catch (error) {
//       if (error.errors && Array.isArray(error.errors)) {
//         const apiErrors = {
//           name: "",
//           category: "",
//           property_id: "",
//           quantity: "",
//           unit: "",
//         };

//         error.errors.forEach((err) => {
//           if (err.name) apiErrors.name = err.name;
//           if (err.category) apiErrors.category = err.category;
//           if (err.property_id) apiErrors.property_id = err.property_id;
//           if (err.quantity) apiErrors.quantity = err.quantity;
//           if (err.unit) apiErrors.unit = err.unit;
//         });

//         setValidationErrors(apiErrors);
//       }
//       console.error("Error creating inventory item:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // UPDATE
//   const handleSaveInventory = async ({ values, table, row }) => {
//     try {
//       setLoading(true);
//       const res = await updateInventoryItem(row.original.id, values);
//       showSnackbar(res.message || "Inventory item updated successfully", "success");
//       await fetchInventoryItems();
//       table.setEditingRow(null);
//     } catch (error) {
//       if (error.errors && Array.isArray(error.errors)) {
//         const apiErrors = {
//           name: "",
//           category: "",
//           property_id: "",
//           quantity: "",
//           unit: "",
//         };

//         error.errors.forEach((err) => {
//           if (err.name) apiErrors.name = err.name;
//           if (err.category) apiErrors.category = err.category;
//           if (err.property_id) apiErrors.property_id = err.property_id;
//           if (err.quantity) apiErrors.quantity = err.quantity;
//           if (err.unit) apiErrors.unit = err.unit;
//         });

//         setValidationErrors(apiErrors);
//       }
//       console.error("Error updating inventory item:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // DELETE
//   const openDeleteDialog = (row) => {
//     setInventoryToDelete(row.original.id);
//     setOpenConfirm(true);
//   };

//   const handleCancelDelete = () => {
//     setOpenConfirm(false);
//     setInventoryToDelete(null);
//   };

//   const handleConfirmDelete = async () => {
//     if (inventoryToDelete != null) {
//       try {
//         setLoading(true);
//         const res = await deleteInventoryItem(inventoryToDelete);
//         showSnackbar(res.message || "Inventory item deleted successfully", "success");
//         await fetchInventoryItems();
//       } catch (error) {
//         console.error("Error deleting inventory item:", error);
//         showSnackbar("Failed to delete inventory item. Please try again.", "error");
//       } finally {
//         setLoading(false);
//       }
//     }
//     setOpenConfirm(false);
//     setInventoryToDelete(null);
//   };

//   const columns = useMemo(
//     () => [
//       {
//         accessorKey: 'id',
//         header: 'ID',
//         enableHiding: true,
//         enableEditing: false,
//       },
//       {
//         accessorKey: 'name',
//         header: 'Item Name',
//         size: 200,
//         muiEditTextFieldProps: {
//           required: true,
//           error: !!validationErrors?.name,
//           helperText: validationErrors?.name,
//           onFocus: () =>
//             setValidationErrors({
//               ...validationErrors,
//               name: undefined,
//             }),
//         },
//       },
//       {
//         accessorKey: 'image_url',
//         header: 'Image',
//         size: 100,
//         enableEditing: false,
//         Cell: ({ cell }) => {
//           const imageUrl = cell.getValue();
//           return imageUrl ? (
//             <Box
//               component="img"
//               src={imageUrl}
//               alt="Inventory"
//               sx={{
//                 width: 50,
//                 height: 50,
//                 objectFit: 'cover',
//                 borderRadius: 1,
//               }}
//             />
//           ) : (
//             <Typography variant="caption" color="text.secondary">
//               No Image
//             </Typography>
//           );
//         },
//       },
//       {
//         accessorKey: 'category',
//         header: 'Category',
//         size: 150,
//         editVariant: 'select',
//         editSelectOptions: categoryOptions,
//         muiEditTextFieldProps: {
//           select: true,
//           required: true,
//           error: !!validationErrors?.category,
//           helperText: validationErrors?.category,
//           SelectProps: {
//             displayEmpty: true,
//             renderValue: (selected) => {
//               if (!selected) {
//                 return <em>Select Category</em>;
//               }
//               return selected;
//             },
//           },
//           onFocus: () =>
//             setValidationErrors({
//               ...validationErrors,
//               category: undefined,
//             }),
//         },
//         Cell: ({ cell }) => (
//           <Box
//             sx={{
//               display: "inline-block",
//               px: 1.5,
//               py: 0.5,
//               borderRadius: 1,
//               // bgcolor: palette.primary.light,
//               color: palette.text.primary,
//               fontSize: "0.75rem",
//               fontWeight: 600,
//               textTransform: 'capitalize',
//             }}
//           >
//             {cell.getValue()}
//           </Box>
//         ),
//       },
//       {
//         accessorKey: 'property_id',
//         header: 'Property',
//         size: 200,
//         editVariant: 'select',
//         editSelectOptions: properties.map(prop => ({ value: prop.id, label: prop.name })),
//         muiEditTextFieldProps: {
//           select: true,
//           required: true,
//           error: !!validationErrors?.property_id,
//           helperText: validationErrors?.property_id,
//           SelectProps: {
//             displayEmpty: true,
//             renderValue: (selected) => {
//               if (!selected) {
//                 return <em>Select Property</em>;
//               }
//               const property = properties.find(p => p.id === selected);
//               return property ? property.name : selected;
//             },
//           },
//           onFocus: () =>
//             setValidationErrors({
//               ...validationErrors,
//               property_id: undefined,
//             }),
//         },
//         Cell: ({ row }) => row.original.property_name || '-',
//       },
//       {
//         accessorKey: 'quantity',
//         header: 'Quantity',
//         size: 120,
//         muiEditTextFieldProps: {
//           type: 'number',
//           required: true,
//           error: !!validationErrors?.quantity,
//           helperText: validationErrors?.quantity,
//           onFocus: () =>
//             setValidationErrors({
//               ...validationErrors,
//               quantity: undefined,
//             }),
//         },
//       },
//       {
//         accessorKey: 'unit',
//         header: 'Unit',
//         size: 120,
//         editVariant: 'select',
//         editSelectOptions: units,
//         muiEditTextFieldProps: {
//           select: true,
//           required: true,
//           error: !!validationErrors?.unit,
//           helperText: validationErrors?.unit,
//           SelectProps: {
//             displayEmpty: true,
//             renderValue: (selected) => {
//               if (!selected) {
//                 return <em>Select Unit</em>;
//               }
//               return selected;
//             },
//           },
//           onFocus: () =>
//             setValidationErrors({
//               ...validationErrors,
//               unit: undefined,
//             }),
//         },
//       },
//     ],
//     [validationErrors, properties, categoryOptions, units, palette]
//   );

//   return (
//     <React.Fragment>
//       <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
//         <MaterialReactTable
//           columns={columns}
//           data={inventoryData}
//           state={{
//             isLoading: loading,
//             columnVisibility: { id: false }
//           }}
//           editDisplayMode="row"
//           enableEditing
//           enableRowActions
//           positionActionsColumn="last"
//           createDisplayMode="row"
//           onCreatingRowSave={handleCreateInventory}
//           onCreatingRowCancel={() => setValidationErrors({})}
//           onEditingRowSave={handleSaveInventory}
//           onEditingRowCancel={() => setValidationErrors({})}
//           renderRowActions={({ row, table }) => (
//             <Box sx={{ display: 'flex', gap: 1 }}>
//               <Tooltip title="View">
//                 <IconButton
//                   onClick={() => {/* Add view functionality */ }}
//                   size="small"
//                   sx={{ color: palette.info.main }}
//                 >
//                   <VisibilityIcon fontSize="small" />
//                 </IconButton>
//               </Tooltip>
//               <Tooltip title="Edit">
//                 <IconButton
//                   onClick={() => table.setEditingRow(row)}
//                   size="small"
//                   sx={{ color: palette.primary.main }}
//                 >
//                   <EditIcon fontSize="small" />
//                 </IconButton>
//               </Tooltip>
//               <Tooltip title="Delete">
//                 <IconButton
//                   onClick={() => openDeleteDialog(row)}
//                   size="small"
//                   sx={{ color: palette.secondary.main }}
//                 >
//                   <DeleteIcon fontSize="small" />
//                 </IconButton>
//               </Tooltip>
//             </Box>
//           )}
//           renderTopToolbarCustomActions={({ table }) => (
//             <Button
//               variant="contained"
//               disableElevation
//               size='small'
//               onClick={() => {
//                 table.setCreatingRow(true);
//               }}
//               startIcon={<Inventory2Rounded fontSize='large' />}
//               sx={{
//                 fontSize: '1rem',
//                 bgcolor: palette.secondary.main,
//                 "&:hover": { bgcolor: palette.primary.main },
//               }}
//             >
//               Add Inventory Item
//             </Button>
//           )}
//           enableColumnFilters={true}
//           enableSorting
//           enablePagination
//           muiTablePaperProps={{
//             elevation: 2,
//             sx: {
//               borderRadius: 2,
//               boxShadow: '0px 2px 6px rgba(0,0,0,0.05)',
//             },
//           }}
//           muiTableHeadCellProps={{
//             sx: {
//               bgcolor: palette.primary.main,
//               color: '#fff',
//               fontWeight: 600,
//             },
//           }}
//           muiTableBodyRowProps={{
//             hover: true,
//             sx: {
//               '&:hover': {
//                 bgcolor: theme.palette.mode === 'light'
//                   ? '#f5f5f5'
//                   : palette.background.paper
//               }
//             },
//           }}
//         />

//         <ConfirmationDialog
//           open={openConfirm}
//           onCancel={handleCancelDelete}
//           onDelete={handleConfirmDelete}
//           title="Delete Inventory Item"
//           message="Are you sure you want to delete this inventory item? This action cannot be undone."
//         />
//       </Container>
//     </React.Fragment>
//   );
// };

// export default InventoryManagement;
