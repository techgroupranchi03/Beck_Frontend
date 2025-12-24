import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Avatar,
  Typography,
  Container,
  useTheme,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  PersonAdd as PersonAddIcon,
} from "@mui/icons-material";
import { MaterialReactTable } from "material-react-table";
import ConfirmationDialog from "../../dialoge/admin/Confirmation_dialog";
import { getAllClients, deleteClient, addClient, editClient } from "../../service/Admin/Admin_auth";
import { useSnackbar } from "../../resuable_components/Snackbar";
import { formatDate } from "../../utils/dateFormat";

export default function Clients() {
  const theme = useTheme();
  const { palette } = theme;
  const { showSnackbar } = useSnackbar();
  const [openConfirm, setOpenConfirm] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});


  console.log("clients data:", clients);
  // Fetch all clients from API
  useEffect(() => {
    const fetchClients = async () => {
      setLoading(true);
      try {
        const res = await getAllClients();
        setClients(res.data);
      } catch (err) {
        console.error("Error fetching clients:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchClients();
  }, []);

  // Status and Plan options
  const statusOptions = ['active', 'inactive'];
  const planOptions = ['basic', 'premium'];

  // CREATE
  const handleCreateClient = async ({ values, table }) => {
    try {
      // Format dates to YYYY-MM-DD
      const formattedValues = { ...values };
      if (formattedValues.valid_from) {
        const dateFrom = new Date(formattedValues.valid_from);
        formattedValues.valid_from = dateFrom.toISOString().split('T')[0];
      }
      if (formattedValues.valid_to) {
        const dateTo = new Date(formattedValues.valid_to);
        formattedValues.valid_to = dateTo.toISOString().split('T')[0];
      }

      const res = await addClient(formattedValues);
      showSnackbar(res.message || "Client created successfully", "success");
      setClients((prev) => [...prev, res.data]);
      table.setCreatingRow(null);
    } catch (error) {
      if (error.errors && Array.isArray(error.errors)) {
        const apiErrors = {};
        error.errors.forEach((err) => {
          Object.keys(err).forEach((field) => {
            apiErrors[field] = err[field];
          });
        });
        setValidationErrors(apiErrors);
      }
      console.error("Error creating client:", error);
    } finally {
      setLoading(false);
    }
  };

  // UPDATE
  const handleSaveClient = async ({ values, table, row }) => {
    try {
      // Format dates to YYYY-MM-DD
      const formattedValues = { ...values };
      if (formattedValues.valid_from) {
        const dateFrom = new Date(formattedValues.valid_from);
        formattedValues.valid_from = dateFrom.toISOString().split('T')[0];
      }
      if (formattedValues.valid_to) {
        const dateTo = new Date(formattedValues.valid_to);
        formattedValues.valid_to = dateTo.toISOString().split('T')[0];
      }
      const res = await editClient({ id: row.original.id, ...formattedValues });
      showSnackbar(res.message || "Client updated successfully", "success");
      setClients((prev) => prev.map(client => client.id === row.original.id ? res.data : client));
      table.setEditingRow(null);
    } catch (error) {
      if (error.errors && Array.isArray(error.errors)) {
        const apiErrors = {};
        error.errors.forEach((err) => {
          Object.keys(err).forEach((field) => {
            apiErrors[field] = err[field];
          });
        });
        setValidationErrors(apiErrors);
      }
      console.error("Error updating client:", error);
    }
  };

  // DELETE
  const openDeleteDialog = (row) => {
    setClientToDelete(row.original.id);
    setOpenConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (clientToDelete != null) {
      try {
        const res = await deleteClient({ id: clientToDelete });
        showSnackbar(res.message || 'Client deleted successfully', 'success');
        setClients((prev) => prev.filter(client => client.id !== clientToDelete));
      } catch (err) {
        console.error('Error deleting client:', err);
        showSnackbar('Failed to delete client', 'error');
      }
    }
    setOpenConfirm(false);
    setClientToDelete(null);
  };

  const handleCancelDelete = () => {
    setOpenConfirm(false);
    setClientToDelete(null);
  };

  // Define columns for the table
  const columns = useMemo(
    () => [
      {
        accessorKey: 'id',
        header: 'ID',
        enableHiding: true,
        enableEditing: false,
      },
      {
        accessorKey: "name",
        header: "Name",
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
        Cell: ({ row }) => (
          <Box display="flex" alignItems="center" gap={1.5}>
            <Avatar
              sx={{
                bgcolor: palette.primary.main,
                width: 45,
                height: 45,
                fontSize: "0.875rem",
                fontWeight: "bold",
              }}
            >
              {row.original.name?.charAt(0)?.toUpperCase() || "?"}
            </Avatar>
            <Typography variant="body2">{row.original.name}</Typography>
          </Box>
        ),
      },
      {
        accessorKey: "company",
        header: "Company",
        size: 150,
        muiEditTextFieldProps: {
          error: !!validationErrors?.company,
          helperText: validationErrors?.company,
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              company: undefined,
            }),
        },
      },
      {
        accessorKey: "phone",
        header: "Phone",
        size: 150,
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.phone,
          helperText: validationErrors?.phone,
          placeholder: 'Enter phone number',
          inputProps: {
            maxLength: 10,
            inputMode: "numeric",
            pattern: "[0-9]*",
          },
          onChange: (e) => {
            const val = e.target.value;
            // Allow only numbers and max length 10
            if (!/^\d{0,10}$/.test(val)) {
              e.target.value = val.slice(0, -1);
            }
          },
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              phone: undefined,
            }),
        },
      },
      {
        accessorKey: "plan",
        header: "Plan",
        size: 120,
        editVariant: 'select',
        editSelectOptions: planOptions.map((plan) => ({ value: plan, label: plan.charAt(0).toUpperCase() + plan.slice(1) })),
        muiEditTextFieldProps: {
          select: true,
          required: true,
          error: !!validationErrors?.plan,
          helperText: validationErrors?.plan,
          SelectProps: {
            displayEmpty: true,
            renderValue: (selected) => {
              if (!selected) {
                return <em>Select Plan</em>;
              }
              return selected.charAt(0).toUpperCase() + selected.slice(1);
            },
          },
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              plan: undefined,
            }),
        },
        Cell: ({ cell }) => {
          const value = cell.getValue();
          return value ? value.charAt(0).toUpperCase() + value.slice(1) : '';
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        size: 130,
        editVariant: 'select',
        editSelectOptions: statusOptions.map((status) => ({ value: status, label: status.charAt(0).toUpperCase() + status.slice(1) })),
        muiEditTextFieldProps: {
          select: true,
          required: true,
          error: !!validationErrors?.status,
          helperText: validationErrors?.status,
          SelectProps: {
            displayEmpty: true,
            renderValue: (selected) => {
              if (!selected) {
                return <em>Select Status</em>;
              }
              return selected.charAt(0).toUpperCase() + selected.slice(1);
            },
          },
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              status: undefined,
            }),
        },
        Cell: ({ cell }) => {
          const status = cell.getValue();
          const isActive = status?.toLowerCase() === 'active';

          return (
            <Box
              sx={{
                display: "inline-block",
                px: 1.5,
                py: 0.5,
                borderRadius: 1,
                bgcolor: isActive ? palette.primary.light : palette.grey[300],
                color: isActive ? palette.primary.dark : palette.text.secondary,
                fontSize: "0.75rem",
                fontWeight: 600,
                textTransform: 'capitalize',
              }}
            >
              {status}
            </Box>
          );
        },
      },
      {
        accessorKey: 'valid_from',
        header: 'Valid From',
        size: 150,
        accessorFn: (row) => {
          if (!row.valid_from) return '';
          return new Date(row.valid_from).toISOString().split('T')[0];
        },
        muiEditTextFieldProps: {
          type: 'date',
          required: true,
          error: !!validationErrors?.valid_from,
          helperText: validationErrors?.valid_from,
          InputLabelProps: {
            shrink: true,
          },
          onFocus: () =>
            setValidationErrors((prev) => ({
              ...prev,
              valid_from: undefined,
            })),
        },
        Cell: ({ row }) => formatDate(row.original.valid_from),
      }
      ,

      {
        accessorKey: "valid_to",
        header: "Valid To",
        size: 150,
        accessorFn: (row) => {
          if (!row.valid_to) return '';
          return new Date(row.valid_to).toISOString().split('T')[0];
        },
        muiEditTextFieldProps: {
          type: 'date',
          required: true,
          error: !!validationErrors?.valid_to,
          helperText: validationErrors?.valid_to,
          InputLabelProps: {
            shrink: true,
          },
          onFocus: () =>
            setValidationErrors((prev) => ({
              ...prev,
              valid_to: undefined,
            })),
        },
        Cell: ({ row }) => formatDate(row.original.valid_to),
      },
    ],
    [validationErrors, palette]
  );

  return (
    <React.Fragment>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <MaterialReactTable
          columns={columns}
          data={clients}
          state={{
            isLoading: loading,
            columnVisibility: { id: false }
          }}
          editDisplayMode="row"
          enableEditing
          enableRowActions
          positionActionsColumn="last"
          createDisplayMode="row"
          onCreatingRowSave={handleCreateClient}
          onCreatingRowCancel={() => setValidationErrors({})}
          onEditingRowSave={handleSaveClient}
          onEditingRowCancel={() => setValidationErrors({})}
          renderRowActions={({ row, table }) => (
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
            </Box>
          )}
          renderTopToolbarCustomActions={({ table }) => (
            <Button
              variant="contained"
              disableElevation
              size='small'
              onClick={() => {
                table.setCreatingRow(true);
              }}
              sx={{
                textTransform: 'none',
                fontSize: '1rem',
                bgcolor: palette.primary.main,
                "&:hover": { bgcolor: palette.secondary.main },
                paddingTop: '8px',
              }}
            >
              Add New Client
            </Button>
          )}
          enableColumnActions={false}
          enableColumnFilters={false}

          enableSorting
          enablePagination
          // false show hide columns button
          enableHiding={false}
          enableDensityToggle={false}

          muiTablePaperProps={{
            elevation: 2,
            sx: {
              borderRadius: 2,
              boxShadow: '0px 2px 6px rgba(0,0,0,0.05)',
            },
          }}
          muiTableHeadCellProps={{
            sx: {
              bgcolor: palette.primary.main,
              color: '#fff',
              fontWeight: 600,
            },
          }}
          muiTableBodyRowProps={{
            hover: true,
            sx: {
              '&:hover': {
                bgcolor: theme.palette.mode === 'light'
                  ? '#f5f5f5'
                  : palette.background.paper
              }
            },
          }}
        />

        <ConfirmationDialog
          open={openConfirm}
          onCancel={handleCancelDelete}
          onDelete={handleConfirmDelete}
          title="Delete Client"
          message="Are you sure you want to delete this client? This action cannot be undone."
        />
      </Container>
    </React.Fragment>
  );
}