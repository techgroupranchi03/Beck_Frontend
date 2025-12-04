import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  IconButton,
  Container,
  Typography,
  useTheme,
  Tooltip,
  MenuItem,
  Stack,
} from '@mui/material';
import { MaterialReactTable } from 'material-react-table';
import { Edit as EditIcon, Delete as DeleteIcon, Inventory2Rounded, Close as CloseIcon, Assignment, Business, Save as SaveIcon } from '@mui/icons-material';
import ConfirmationDialog from '../../../dialoge/clients/Confirmation_dialog';
import { getInventoryItems, createInventoryItem, updateInventoryItem, deleteInventoryItem, getUnitsAndQuantities } from '../../../service/Clients/Inventory';
import { getClientProperties } from '../../../service/Clients/Properties';
import { useSnackbar } from '../../../resuable_components/Snackbar';
import Task_Accordian from './Task_Accordian';
import PropertyDisplay from '../../../resuable_components/PropertyDisplay';
import { categories } from '../../../constant';

const All_Inventory = () => {
  const theme = useTheme();
  const { palette } = theme;
  const { showSnackbar } = useSnackbar();
  const [inventoryData, setInventoryData] = useState([]);
  const [properties, setProperties] = useState([]);

  const [loading, setLoading] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [inventoryToDelete, setInventoryToDelete] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [units, setUnits] = useState([]);
  const [containerOptions, setContainerOptions] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState({});
  const [create_tasks, setCreate_tasks] = useState(false);
  const [task, setTask] = useState(null);

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  console.log("task:", task);

  // console.log("containerOptions:", containerOptions);

  // console.log("inventoryData:", inventoryData);

  // get units and quantity
  const fetchUnitsAndQuantities = async () => {
    try {
      const res = await getUnitsAndQuantities();
      setUnits(res.data.units || []);
      setContainerOptions([...res.data.quantity?.containerOptions || []].reverse());
      // console.log("Units and quantities fetched:", res);
    } catch (error) {
      console.error("Error fetching units and quantities:", error);
    }
  };
  useEffect(() => {
    fetchUnitsAndQuantities();
  }, []);


  // Fetch properties
  const fetchProperties = async () => {
    try {
      const res = await getClientProperties(1);
      setProperties(res.data || []);
    } catch (error) {
      console.error("Error fetching properties:", error);
    }
  };


  // Fetch inventory items
  const fetchInventoryItems = async () => {
    setLoading(true);
    try {
      const res = await getInventoryItems();
      setInventoryData(res.data || []);
    } catch (error) {
      console.error('Error fetching inventory items:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
    fetchInventoryItems();
  }, []);

  // handleImageChange
  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  // Clear image state
  const clearImageState = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  // Handle task creation from child component
  const handleTaskCreation = (taskData) => {
    setTask(taskData);
  };

  // CREATE
  const handleCreateInventory = async ({ values, table }) => {
    try {
      setLoading(true);
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('name', values.name);
      formData.append('category', values.category);
      formData.append('property_id', values.property_id);
      formData.append('quantity', values.quantity);
      formData.append('unit', values.unit);
      formData.append('create_tasks', create_tasks);

      if (create_tasks && task) {
        formData.append('task_title', task.title);
        formData.append('task_description', task.description);
        formData.append('task_assigned_to', task.assigned_to);
        formData.append('task_schedule_type', task.schedule_type);
        formData.append('task_recurrence', task.recurrence);
        formData.append('task_is_photo_required', task.is_photo_required);
        formData.append('task_task_status', task.status);
        formData.append('task_type', task.task_type);
      }

      if (imageFile) {
        formData.append('inventory_image', imageFile);
      }

      const res = await createInventoryItem(formData);
      showSnackbar(res.message || "Inventory item created successfully", "success");
      await fetchInventoryItems();
      table.setCreatingRow(null);
      clearImageState();
      setTask(null);
      setCreate_tasks(false);
    } catch (error) {
      if (error.errors && Array.isArray(error.errors)) {
        const apiErrors = {
          name: "",
          category: "",
          property_id: "",
          quantity: "",
          unit: "",
          image: "",
        };

        error.errors.forEach((err) => {
          if (err.name) apiErrors.name = err.name;
          if (err.category) apiErrors.category = err.category;
          if (err.property_id) apiErrors.property_id = err.property_id;
          if (err.quantity) apiErrors.quantity = err.quantity;
          if (err.unit) apiErrors.unit = err.unit;
          if (err.image) apiErrors.image = err.image;
        });

        setValidationErrors(apiErrors);
      }
      console.error("Error creating inventory item:", error);
    } finally {
      setLoading(false);
    }
  };

  // UPDATE
  const handleSaveInventory = async ({ values, table, row }) => {
    try {
      setLoading(true);
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('name', values.name);
      formData.append('category', values.category);
      formData.append('property_id', values.property_id);
      formData.append('quantity', values.quantity);
      formData.append('unit', values.unit);

      if (imageFile) {
        formData.append('inventory_image', imageFile);
      }
      const res = await updateInventoryItem(row.original.id, formData);
      showSnackbar(res.message || "Inventory item updated successfully", "success");
      await fetchInventoryItems();
      table.setEditingRow(null);
      clearImageState();
    } catch (error) {
      if (error.errors && Array.isArray(error.errors)) {
        const apiErrors = {
          name: "",
          category: "",
          property_id: "",
          quantity: "",
          unit: "",
          image: "",
        };

        error.errors.forEach((err) => {
          if (err.name) apiErrors.name = err.name;
          if (err.category) apiErrors.category = err.category;
          if (err.property_id) apiErrors.property_id = err.property_id;
          if (err.quantity) apiErrors.quantity = err.quantity;
          if (err.unit) apiErrors.unit = err.unit;
          if (err.image) apiErrors.image = err.image;
        });

        setValidationErrors(apiErrors);
      }
      console.error("Error updating inventory item:", error);
    } finally {
      setLoading(false);
    }
  };

  // DELETE
  const openDeleteDialog = (row) => {
    setInventoryToDelete(row.original.id);
    setOpenConfirm(true);
  };

  const handleCancelDelete = () => {
    setOpenConfirm(false);
    setInventoryToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (inventoryToDelete != null) {
      try {
        setLoading(true);
        const res = await deleteInventoryItem(inventoryToDelete);
        showSnackbar(res.message || "Inventory item deleted successfully", "success");
        await fetchInventoryItems();
      } catch (error) {
        console.error("Error deleting inventory item:", error);
        showSnackbar("Failed to delete inventory item. Please try again.", "error");
      } finally {
        setLoading(false);
      }
    }
    setOpenConfirm(false);
    setInventoryToDelete(null);
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: 'id',
        header: 'ID',
        enableHiding: true,
        enableEditing: false,
      },
      {
        accessorKey: 'image_url',
        header: 'Image',
        size: 150,
        enableEditing: false,
        Cell: ({ cell, row, table }) => {
          const imageUrl = cell.getValue();
          const isEditing = table.getState().editingRow?.id === row.id;
          const isCreating = table.getState().creatingRow?.id === row.id;

          if (isEditing || isCreating) {
            return (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <input
                  accept="image/*"
                  type="file"
                  id={`image-upload-${row.id}`}
                  style={{ display: 'none' }}
                  onChange={handleImageChange}
                />
                <label htmlFor={`image-upload-${row.id}`}>
                  <Button
                    variant="outlined"
                    component="span"
                    size="small"
                    sx={{ fontSize: '0.75rem' }}
                  >
                    Upload
                  </Button>
                </label>

                {(imagePreview || imageUrl) && (
                  <Box sx={{ position: 'relative', width: 'fit-content' }}>
                    <Box
                      component="img"
                      src={imagePreview || imageUrl}
                      alt="Preview"
                      sx={{
                        width: 60,
                        height: 60,
                        objectFit: 'cover',
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: 'divider',
                      }}
                    />
                    <IconButton
                      size="small"
                      onClick={clearImageState}
                      sx={{
                        position: 'absolute',
                        top: -8,
                        right: -8,
                        bgcolor: 'error.main',
                        color: 'white',
                        width: 20,
                        height: 20,
                        '&:hover': {
                          bgcolor: 'error.dark',
                        },
                      }}
                    >
                      <CloseIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                  </Box>
                )}

                {validationErrors?.image && (
                  <Typography variant="caption" color="error">
                    {validationErrors.image}
                  </Typography>
                )}
              </Box>
            );
          }

          return imageUrl ? (
            <Box
              component="img"
              src={imageUrl}
              alt="Inventory"
              sx={{
                width: 50,
                height: 50,
                objectFit: 'cover',
                borderRadius: 1,
              }}
            />
          ) : (
            <Typography variant="caption" color="text.secondary">
              No Image
            </Typography>
          );
        },
      },
      {
        accessorKey: 'name',
        header: 'Item Name',
        size: 200,
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.name,
          helperText: validationErrors?.name,
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              name: undefined,
            }),
        },
      },


      {
        accessorKey: 'category',
        header: 'Category',
        size: 150,
        editVariant: 'select',
        editSelectOptions: categories,
        muiEditTextFieldProps: {
          select: true,
          required: true,
          error: !!validationErrors?.category,
          helperText: validationErrors?.category,
          SelectProps: {
            displayEmpty: true,
            renderValue: (selected) => {
              if (!selected) {
                return <em>Select Category</em>;
              }
              return selected;
            },
          },
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              category: undefined,
            }),
        },
        Cell: ({ cell }) => (
          <Box
            sx={{
              display: "inline-block",
              px: 1.5,
              py: 0.5,
              borderRadius: 1,
              // bgcolor: palette.primary.light,
              color: palette.text.primary,
              fontSize: "0.75rem",
              fontWeight: 600,
              textTransform: 'capitalize',
            }}
          >
            {cell.getValue()}
          </Box>
        ),
      },
      {
        accessorKey: 'property_id',
        header: 'Property',
        size: 200,
        editVariant: 'select',
        editSelectOptions: properties.map(prop => ({ value: prop.id, label: prop.name })),
        muiEditTextFieldProps: {
          select: true,
          required: true,
          error: !!validationErrors?.property_id,
          helperText: validationErrors?.property_id,
          SelectProps: {
            displayEmpty: true,
            renderValue: (selected) => {
              if (!selected) {
                return <em>Select Property</em>;
              }
              const property = properties.find(p => p.id === selected);
              return property ? property.name : selected;
            },
          },
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              property_id: undefined,
            }),
          children: [
            <MenuItem key="empty-placeholder" value="">
              <em>Select Property</em>
            </MenuItem>,
            ...properties.map((prop) => (
              <MenuItem key={prop.id} value={prop.id}>
                {prop.name}
              </MenuItem>
            ))
          ],
        },
        Cell: ({ row }) => row.original.property_name || '-',
      },
      {
        accessorKey: 'unit',
        header: 'Unit',
        size: 120,
        editVariant: 'select',
        editSelectOptions: units,
        muiEditTextFieldProps: ({ row, table }) => ({
          select: true,
          required: true,
          error: !!validationErrors?.unit,
          helperText: validationErrors?.unit,
          SelectProps: {
            displayEmpty: true,
            renderValue: (selected) => {
              if (!selected) {
                return <em>Select Unit</em>;
              }
              return selected;
            },
          },
          onChange: (e) => {
            const newUnit = e.target.value;
            const rowId = row?.id || 'creating';
            setSelectedUnit(prev => ({ ...prev, [rowId]: newUnit }));
            // Update the row value
            row._valuesCache.unit = newUnit;
            // Reset quantity when unit changes
            if (newUnit === 'container') {
              row._valuesCache.quantity = '';
            }
          },
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              unit: undefined,
            }),
        }),
      },
      {
        accessorKey: 'quantity',
        header: 'Quantity',
        size: 120,
        muiEditTextFieldProps: ({ row, table }) => {
          const rowId = row?.id || 'creating';
          const currentUnit = selectedUnit[rowId] || row?.original?.unit || '';
          const isContainer = currentUnit.toLowerCase() === 'container';

          if (isContainer && Array.isArray(containerOptions)) {
            return {
              select: true,
              required: true,
              error: !!validationErrors?.quantity,
              helperText: validationErrors?.quantity,
              SelectProps: {
                displayEmpty: true,
              },
              children: [
                <MenuItem key="empty-placeholder" value="">
                  <em>Select Level</em>
                </MenuItem>,
                ...containerOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))
              ],
              onFocus: () =>
                setValidationErrors({
                  ...validationErrors,
                  quantity: undefined,
                }),
            };
          }

          const isPiece = currentUnit.toLowerCase() === 'piece';
          const isKgOrLiters = currentUnit.toLowerCase() === 'kg' || currentUnit.toLowerCase() === 'liters' || currentUnit.toLowerCase() === 'l';

          return {
            type: 'number',
            required: true,
            error: !!validationErrors?.quantity,
            helperText: validationErrors?.quantity,
            inputProps: {
              min: 0,
              max: 9999,
              step: isPiece ? 1 : (isKgOrLiters ? 0.1 : 0.01),
            },
            onFocus: () =>
              setValidationErrors({
                ...validationErrors,
                quantity: undefined,
              }),
          };
        },
      },
    ],
    [validationErrors, properties, categories, units, palette, imageFile, imagePreview]
  );

  return (
    <React.Fragment>
      <Container
        maxWidth={false}
        sx={{
          mt: 2,
          mb: 2,
          px: { xs: 1, sm: 2, md: 3 },

        }}>
        <Box
          sx={{
            mt: 2,
            mb: 2,
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: '60px',
              background: theme.customGradients.right,
              pointerEvents: 'none',
              zIndex: 1,
              opacity: canScrollLeft ? 1 : 0,
              transition: 'opacity 0.3s ease',
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              right: 0,
              top: 0,
              bottom: 0,
              width: '60px',
              background: theme.customGradients.left,
              pointerEvents: 'none',
              zIndex: 1,
              opacity: canScrollRight ? 1 : 0,
              transition: 'opacity 0.3s ease',
            },
          }}
        >
          <PropertyDisplay property={properties} onScrollStateChange={({ canScrollLeft, canScrollRight }) => {
            setCanScrollLeft(canScrollLeft);
            setCanScrollRight(canScrollRight);
          }} />
        </Box>
        <MaterialReactTable
          columns={columns}
          data={inventoryData}
          state={{
            isLoading: loading,
            columnVisibility: { id: false }
          }}
          editDisplayMode="row"
          enableEditing
          enableExpandAll={false}
          displayColumnDefOptions={{
            'mrt-row-actions': {
              size: 180,
              muiTableBodyCellProps: ({ row, table }) => {
                const isEditing = table.getState().editingRow?.id === row.id;
                const isCreating = table.getState().creatingRow?.id === row.id;

                if (isEditing || isCreating) {
                  const hasNameAndCategory =
                    (row._valuesCache?.name || row.original?.name) &&
                    (row._valuesCache?.category || row.original?.category);

                  return {
                    children: (
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <Tooltip title="Cancel">
                          <IconButton
                            onClick={() => {
                              table.setEditingRow(null);
                              table.setCreatingRow(null);
                              setValidationErrors({});
                              clearImageState();
                            }}
                            size="small"
                            sx={{ color: palette.grey[600] }}
                          >
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Save">
                          <IconButton
                            onClick={() => {
                              if (isCreating) {
                                handleCreateInventory({ values: row._valuesCache, table });
                              } else {
                                handleSaveInventory({ values: row._valuesCache, table, row });
                              }
                            }}
                            size="small"
                            sx={{ color: palette.primary.main }}
                          >
                            <SaveIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={!hasNameAndCategory ? "Fill name and category first" : "Add Task"}>
                          <span>
                            <IconButton
                              onClick={() => {
                                if (hasNameAndCategory) {
                                  row.toggleExpanded();
                                  setCreate_tasks(true);
                                }
                              }}
                              disabled={!hasNameAndCategory}
                              size="small"
                              sx={{
                                color: hasNameAndCategory ? palette.primary.main : palette.grey[400],
                              }}
                            >
                              <Assignment fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </Box>
                    ),
                  };
                }
                return {};
              },
            },
            'mrt-row-expand': {
              size: 0,
              muiTableHeadCellProps: {
                sx: { display: 'none' }
              },
              muiTableBodyCellProps: {
                sx: { display: 'none' }
              }
            }
          }}
          enableRowActions
          positionActionsColumn="last"
          createDisplayMode="row"
          onCreatingRowSave={handleCreateInventory}
          onCreatingRowCancel={() => {
            setValidationErrors({});
            clearImageState();
          }}
          onEditingRowSave={handleSaveInventory}
          onEditingRowCancel={() => {
            setValidationErrors({});
            clearImageState();
          }}

          renderRowActions={({ row, table }) => {
            const isEditing = table.getState().editingRow?.id === row.id;
            const isCreating = table.getState().creatingRow?.id === row.id;

            if (isEditing || isCreating) {
              // Actions are handled by displayColumnDefOptions above
              return null;
            }

            return (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Tooltip title="Edit">
                  <IconButton
                    onClick={() => table.setEditingRow(row)}
                    size="small"
                    sx={{ color: palette.primary.main }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <IconButton
                    onClick={() => openDeleteDialog(row)}
                    size="small"
                    sx={{ color: palette.secondary.main }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Add Task" placement='top' arrow>
                  <IconButton
                    onClick={() => row.toggleExpanded()}
                    size="small"
                    sx={{ color: palette.primary.main }}
                  >
                    <Assignment fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            );
          }}

          renderDetailPanel={({ row }) => (
            <Box sx={{ padding: 0, bgcolor: palette.background.paper }}>
              <Task_Accordian
                inventoryId={row.original.id}
                create_tasks={create_tasks}
                onTaskCreate={handleTaskCreation}
              />
            </Box>
          )}
          renderTopToolbarCustomActions={({ table }) => {
            return (
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  disableElevation
                  size='small'
                  onClick={() => {
                    table.setCreatingRow(true);
                  }}
                  startIcon={<Inventory2Rounded fontSize='large' />}
                  sx={{
                    fontSize: '1rem',
                    bgcolor: palette.secondary.main,
                    "&:hover": { bgcolor: palette.primary.main },
                  }}
                >
                  Add Inventory
                </Button>
              </Box>
            );
          }}
          enableColumnFilters={false}
          enableSorting={false}
          enablePagination
          enableDensityToggle={false}
          enableHiding={false}
          muiTablePaperProps={{
            elevation: 4,
            sx: {
              borderRadius: 2,
              boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.13)',
            },
          }}
          muiTableHeadCellProps={{
            sx: {
              bgcolor: palette.primary.main,
              color: '#fff',
              fontWeight: 600,
            },
          }}
          muiTableBodyRowProps={({ row, table }) => ({
            hover: true,
            sx: {
              '&:hover': {
                bgcolor: theme.palette.mode === 'light'
                  ? '#f5f5f5'
                  : palette.background.paper
              },
              '& .MuiIconButton-root': {
                '&[aria-label="Save"]': {
                  color: palette.primary.main,
                },

              },
            },
          })}
        />
        <ConfirmationDialog
          open={openConfirm}
          onCancel={handleCancelDelete}
          onDelete={handleConfirmDelete}
          title="Delete Inventory Item"
          message="Are you sure you want to delete this inventory item? This action cannot be undone."
        />
      </Container>
    </React.Fragment>
  );
};

export default All_Inventory;
