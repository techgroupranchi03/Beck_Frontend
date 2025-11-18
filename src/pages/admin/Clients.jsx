import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Avatar,
  Typography,
  Container,
  useTheme,
  IconButton,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { MaterialReactTable } from "material-react-table";
import { formatDate } from "../../utils/dateFormat";
import ConfirmationDialog from "../../dialoge/admin/Confirmation_dialog";
import EditClientsDialog from "../../dialoge/admin/Edit_clients";
import { getAllClients, deleteClient } from "../../service/Admin/Admin_auth";
import Add_ClientsDialog from "../../dialoge/admin/add_clients";
import { useSnackbar } from "../../resuable_components/Snackbar";

export default function Clients() {
  const theme = useTheme();
  const { palette } = theme;
  const { showSnackbar } = useSnackbar();
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch all clients from API
  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const res = await getAllClients();
      setClients(res.data);
      console.log("Clients from API:", res.data);
    } catch (err) {
      console.error("Error fetching clients:", err);
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------Handlers--------------------

  const handleEditClient = (id) => {
    // Just pass the ID, don't fetch the full client data here
    setEditingClient(id);
    setOpenEditDialog(true);
  };

  const handleSaveEditedClient = async () => {
    // Just close the dialog and refresh
    setOpenEditDialog(false);
    setEditingClient(null);
    await fetchClients();
  };

  const handleDeleteClient = (id) => {
    setClientToDelete(id);
    setOpenConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (clientToDelete != null) {
      try {
        setLoading(true);
        // Call delete API
        const res = await deleteClient({ id: clientToDelete });
        setClients((prev) => prev.filter((c) => c.id !== clientToDelete));
        await fetchClients();
        showSnackbar(res.message || 'Client deleted successfully', 'success');
      } catch (err) {
        console.error('Error deleting client:', err);
        showSnackbar('Failed to delete client', 'error');
      } finally {
        setLoading(false);
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
        header: "Name",
        accessorKey: "name",
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
        header: "Company",
        accessorKey: "company",
      },
      {
        header: "Phone",
        accessorKey: "phone",
      },
      {
        header: "Valid From",
        accessorKey: "valid_from",
        Cell: ({ cell }) => formatDate(cell.getValue()),
      },
      {
        header: "Status",
        accessorKey: "status",
        Cell: ({ cell }) => (
          <Box
            sx={{
              display: "inline-block",
              px: 1.5,
              py: 0.5,
              borderRadius: 1,
              bgcolor: cell.getValue() === "Active" ? palette.primary.light : palette.grey[300],
              color: cell.getValue() === "Active" ? palette.primary.dark : palette.text.secondary,
              fontSize: "0.75rem",
              fontWeight: 600,
            }}
          >
            {cell.getValue()}
          </Box>
        ),
      },
      {
        header: "Plan",
        accessorKey: "plan",
      },
      {
        header: "Valid To",
        accessorKey: "valid_to",
        Cell: ({ cell }) => formatDate(cell.getValue()),
      },
      {
        header: "Actions",
        accessorKey: "actions",
        Cell: ({ row }) => (
          <Box display="flex" gap={1}>
            <IconButton
              onClick={() => handleEditClient(row.original.id)}
              size="small"
              sx={{ color: palette.primary.main }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton
              onClick={() => handleDeleteClient(row.original.id)}
              size="small"
              sx={{ color: palette.secondary.main }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        ),
      },
    ],
    [theme, clients]
  );

  return (
    <React.Fragment>
      <Container sx={{ mt: 4, mb: 4 }}>
        {/* Add New Client Button */}
        <Box display="flex" justifyContent="end" mb={2}>
          <Button
            variant="contained"
            disableElevation
            sx={{
              bgcolor: palette.primary.main,
              "&:hover": { bgcolor: palette.secondary.main },
            }}
            onClick={() => setOpenAddDialog(true)}
          >
            ADD NEW CLIENT
          </Button>
        </Box>

        {/* Material React Table */}
        <MaterialReactTable
          columns={columns}
          data={clients}
          enableColumnActions={false}
          enableColumnFilters={true}
          enableSorting
          enablePagination
          state={{ isLoading: loading }}
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
          muiTableBodyRowProps={{
            hover: true,
            sx: {
              "&:hover": {
                bgcolor: theme.palette.mode === "light"
                  ? "#f5f5f5"
                  : palette.background.paper
              }
            },
          }}
        />

        <Add_ClientsDialog
          open={openAddDialog}
          onClose={() => {
            setOpenAddDialog(false);
            fetchClients(); // Refresh list after adding
          }}
        />

        <ConfirmationDialog
          open={openConfirm}
          onCancel={handleCancelDelete}
          onDelete={handleConfirmDelete}
          title="Delete Client"
          message="Are you sure you want to delete this client? This action cannot be undone."
        />

        <EditClientsDialog
          open={openEditDialog}
          onClose={() => {
            setOpenEditDialog(false);
            setEditingClient(null);
          }}
          clientId={editingClient}
          onSave={handleSaveEditedClient}
        />
      </Container>
    </React.Fragment>
  );
}