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
import { useSnackbar } from '../../../resuable_components/Snackbar';
import Task_Accordian from './Task_Accordian';
import PropertyDisplay from '../../../resuable_components/PropertyDisplay';
import QuantityInput from '../../../resuable_components/QuantityInput';
import { categories, categoriess } from '../../../constant';
import { useInventoryContext } from './InventoryManagement';

const All_Inventory = () => {
  const theme = useTheme();
  const { palette } = theme;
  const { showSnackbar } = useSnackbar();

  const {
    inventoryData,
    properties,
    units,
    containerOptions,
    loading,
    createInventory,
    updateInventory,
    deleteInventory,
    inventoryPagination,
    fetchInventoryItems,
  } = useInventoryContext();

  const [openConfirm, setOpenConfirm] = useState(false);
  const [inventoryToDelete, setInventoryToDelete] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [selectedUnit, setSelectedUnit] = useState({});
  const [create_tasks, setCreate_tasks] = useState(false);
  const [task, setTask] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 9,
  });


  // Handle pagination changes
  useEffect(() => {
    const page = pagination.pageIndex + 1; 
    fetchInventoryItems({}, "", page);
  }, [pagination.pageIndex]);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const clearImageState = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleTaskCreation = (taskData) => {
    setTask(taskData);
  };

  const handleCreateInventory = async ({ values, table }) => {
    try {
      if (create_tasks && task) {
        const taskErrors = {};
        if (!task.title) taskErrors.task_title = "Task title is required";
        if (!task.description) taskErrors.task_description = "Task description is required";
        if (!task.assigned_to) taskErrors.task_assigned_to = "Assigned to is required";
        if (!task.schedule_type) taskErrors.task_schedule_type = "Schedule type is required";
        if (!task.task_type) taskErrors.task_task_type = "Task type is required";
        if (!task.start_date) taskErrors.task_start_date = "Start date is required";
        if (!task.status) taskErrors.task_status = "Status is required";

        if (['weekly', 'monthly', 'yearly'].includes(task.schedule_type)) {
          let repeatData = {};
          try {
            repeatData = task.repeat_on ?
              (typeof task.repeat_on === 'string' ? JSON.parse(task.repeat_on) : task.repeat_on) : {};
          } catch (error) {
            taskErrors.repeat_on = "Invalid repeat data format";
          }
          if (task.schedule_type === 'weekly') {
            if (!repeatData.days || repeatData.days.length === 0) {
              taskErrors.repeat_on = "Please select at least one day for weekly schedule";
            }
          } else if (task.schedule_type === 'monthly') {
            if (!repeatData.date || repeatData.date.length === 0) {
              taskErrors.repeat_on = "Please select at least one date for monthly schedule";
            }
          } else if (task.schedule_type === 'yearly') {
            if (!repeatData.date) {
              taskErrors.repeat_on = "Please select a date for yearly schedule";
            }
            if (!repeatData.month || repeatData.month.length === 0) {
              taskErrors.repeat_on = "Please select at least one month for yearly schedule";
            }
          }
        }
      }
      const formData = new FormData();
      formData.append('name', values.name);
      formData.append('category', values.category);
      formData.append('property_id', values.property_id);
      formData.append('quantity', values.quantity);
      formData.append('unit', values.unit);
      formData.append('create_tasks', create_tasks);
      formData.append('located_at', values.located_at);
      formData.append('lower_limit', values.lower_limit);

      if (create_tasks && task) {
        formData.append('task_title', task.title);
        formData.append('task_description', task.description);
        formData.append('task_assigned_to', task.assigned_to);
        formData.append('task_schedule_type', task.schedule_type || 'one_time');
        formData.append('task_is_photo_required', task.is_photo_required);
        formData.append('task_task_status', task.status);
        formData.append('task_task_type', task.task_type);
        // Use scheduled_date if available (from active task), otherwise use start_date (from task planner)
        formData.append('task_start_date', task.scheduled_date || task.start_date || '');

        // Parse repeat_on and send appropriate fields based on schedule_type
        if (['weekly', 'monthly', 'yearly'].includes(task.schedule_type) && task.repeat_on) {
          try {
            const repeatData = typeof task.repeat_on === 'string' ?
              JSON.parse(task.repeat_on) : task.repeat_on;

            if (task.schedule_type === 'weekly') {
              // For weekly: send repeat_days as array of days
              formData.append('repeat_days', JSON.stringify(repeatData.days || []));
            } else if (task.schedule_type === 'monthly') {
              // For monthly: send repeat_date as array of dates
              formData.append('repeat_date', JSON.stringify(repeatData.date || []));
            } else if (task.schedule_type === 'yearly') {
              // For yearly: send repeat_month as array and repeat_date as single value
              formData.append('repeat_month', JSON.stringify(repeatData.month || []));
              formData.append('repeat_date', repeatData.date || '');
            }
          } catch (error) {
            console.error("Error parsing repeat_on:", error);
            showSnackbar("Invalid repeat schedule format", "error");
            return;
          }
        }
      }

      if (imageFile) {
        formData.append('inventory_image', imageFile);
      }

      // console the formData entries for debugging
      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }

      const res = await createInventory(formData);
      showSnackbar(res.message, "success");
      table.setCreatingRow(null);
      clearImageState();
      setTask(null);
      setCreate_tasks(false);
      setValidationErrors({});
    } catch (error) {
      if (error.errors && Array.isArray(error.errors)) {
        const apiErrors = {};
        error.errors.forEach((err) => {
          Object.keys(err).forEach((key) => {
            apiErrors[key] = err[key];
          });
        });
        setValidationErrors(apiErrors);
      }
      showSnackbar(error.message, "error");
      console.error("Error creating inventory item:", error);
    }
  };

  const handleSaveInventory = async ({ values, table, row }) => {
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('name', values.name);
      formData.append('category', values.category);
      formData.append('property_id', values.property_id);
      formData.append('quantity', values.quantity);
      formData.append('unit', values.unit);
      formData.append('located_at', values.located_at);
      formData.append('lower_limit', values.lower_limit);

      if (imageFile) {
        formData.append('inventory_image', imageFile);
      }
      const res = await updateInventory(row.original.id, formData);
      console.log("Update response:", res);
      showSnackbar(res.message, "success");
      table.setEditingRow(null);
      clearImageState();
      setValidationErrors({});
    } catch (error) {
      if (error.errors && Array.isArray(error.errors)) {
        const apiErrors = {};
        error.errors.forEach((err) => {
          Object.keys(err).forEach((key) => {
            apiErrors[key] = err[key];
          });
        });
        setValidationErrors(apiErrors);
      }
      showSnackbar(error.message, "error");
      console.error("Error updating inventory item:", error);
    }
  };

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
        const res = await deleteInventory(inventoryToDelete);
        showSnackbar(res.message, "success");
      } catch (error) {
        console.log("Delete error:", error);
        showSnackbar(error.message, "error");
        console.error("Error deleting inventory item:", error);
      }
    }
    setOpenConfirm(false);
    setInventoryToDelete(null);
  };

  const columns = useMemo(() => [

    {
      accessorKey: 'id',
      header: 'ID',
      enableHiding: true,
      enableEditing: false,
    },

    {
      accessorKey: 'inventory_image_url',
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
      editSelectOptions: categoriess.map((cat) => ({ value: cat.value, label: cat.label })),
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
            const category = categoriess.find(cat => cat.value === selected);
            if (category) {
              const IconComponent = category.icon;
              return (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <IconComponent sx={{ fontSize: 18 }} />
                  {category.label}
                </Box>
              );
            }
            return selected;
          },
        },
        children: categoriess.map((cat) => {
          const IconComponent = cat.icon;
          return (
            <MenuItem key={cat.value} value={cat.value}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconComponent sx={{ fontSize: 18, color: palette.text.secondary }} />
                {cat.label}
              </Box>
            </MenuItem>
          );
        }),
        onFocus: () =>
          setValidationErrors({
            ...validationErrors,
            category: undefined,
          }),
      },
      Cell: ({ cell }) => {
        const value = cell.getValue();
        const category = categoriess.find(cat => cat.value === value);
        const IconComponent = category?.icon;

        return (
          <Box
            sx={{
              display: "inline-flex",
              alignItems: 'center',
              gap: 1,
              px: 1.5,
              py: 0.5,
              borderRadius: 1,
              color: palette.text.primary,
              fontSize: "0.75rem",
              fontWeight: 600,
            }}
          >
            {IconComponent && <IconComponent sx={{ fontSize: 18, color: palette.text.secondary }} />}
            {category?.label || value}
          </Box>
        );
      },
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
      accessorKey: 'located_at',
      header: 'Located At',
      size: 200,
      muiEditTextFieldProps: {
        error: !!validationErrors?.located_at,
        helperText: validationErrors?.located_at,
        onFocus: () =>
          setValidationErrors({
            ...validationErrors,
            located_at: undefined,
          }),
      },
    },

    {
      accessorKey: 'lower_limit',
      header: 'Lower Limit',
      size: 120,
      muiEditTextFieldProps: {
        type: 'number',
        inputProps: { min: 0, max: 9999, step: 0.01 },
        error: !!validationErrors?.lower_limit,
        helperText: validationErrors?.lower_limit,
        onFocus: () =>
          setValidationErrors({
            ...validationErrors,
            lower_limit: undefined,
          }),
      },
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
      size: 220,
      Edit: ({ row, table }) => {
        const rowId = row?.id || 'creating';
        const currentUnit = selectedUnit[rowId] || row?.original?.unit || '';
        const currentValue = row._valuesCache?.quantity ?? row.original?.quantity ?? '';

        return (
          <QuantityInput
            unit={currentUnit}
            value={currentValue}
            onChange={(val) => {
              row._valuesCache.quantity = val;
            }}
            size="small"
            showQuickFill={currentUnit.toLowerCase() !== 'container'}
          />
        );
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
          mt: -2,
          mb: 2,
          px: { xs: 1, sm: 2, md: 2 },

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
          rowCount={inventoryPagination?.total || 0}
          state={{
            isLoading: loading,
            columnVisibility: { id: false },
            pagination: pagination,
          }}
          onPaginationChange={setPagination}
          manualPagination
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
                        <Tooltip title={!hasNameAndCategory ? "Fill name and category first" : "Task Manager"}>
                          <span>
                            <IconButton
                              onClick={() => {
                                if (hasNameAndCategory) {
                                  row.toggleExpanded();
                                  setCreate_tasks(prev => !prev);
                                }
                              }}
                              // also disable when editing the row
                              disabled={!hasNameAndCategory || isEditing}
                              size="small"
                              sx={{
                                color: hasNameAndCategory ? palette.secondary.main : palette.grey[400],
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
            const hasAnyEditingRow = table.getState().editingRow !== null || table.getState().creatingRow !== null;

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
                    sx={{ color: palette.secondary.main }}
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
                <Tooltip title={hasAnyEditingRow ? "Finish editing first" : "Task Manager"} placement='top' arrow>
                  <span>
                    <IconButton
                      onClick={() => row.toggleExpanded()}
                      // disable when any row is being edited or created
                      disabled={hasAnyEditingRow}
                      size="small"
                      sx={{
                        color: hasAnyEditingRow ? palette.grey[400] : palette.secondary.main,
                        cursor: hasAnyEditingRow ? 'not-allowed' : 'pointer'
                      }}
                    >
                      <Assignment fontSize="small" />
                    </IconButton>
                  </span>
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
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Button
                  variant="contained"
                  disableElevation
                  onClick={() => {
                    table.setCreatingRow(true);
                  }}
                  startIcon={<Inventory2Rounded />}
                  sx={{
                    bgcolor: palette.primary.main,
                    "&:hover": { bgcolor: palette.secondary.main },
                    borderRadius: 10,
                  }}
                >
                  Add Inventorys
                </Button>
              </Box>
            );
          }}

          muiTopToolbarProps={{
            sx: {
              '& .MuiBox-root': {
                padding: 0,
                paddingLeft: 0.5,
              },
              '& .MuiIconButton-root': {
                padding: '8px',
              },
            }
          }}

          muiSearchTextFieldProps={{
            sx: {
              '& .MuiInputBase-root': {
                height: 40,
              }
            }
          }}

          enableColumnFilters={false}
          enableSorting={false}
          enablePagination
          enableDensityToggle={false}
          enableHiding={false}
          muiTablePaperProps={{
            elevation: 4,
            sx: {
              border: `1px solid ${palette.divider}`,
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
