import React, { useMemo, useState } from "react";
import {
  Box,
  Button,
  Avatar,
  Typography,
  Container,
  useTheme,
  useMediaQuery,
  IconButton,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { MaterialReactTable } from "material-react-table";
import clientData from '../dummydata/Client';
import AddClientsDialog from "../components/dialoge/add_clients";
import ConfirmationDialog from "../components/dialoge/Confirmation_dialog";
import EditClientsDialog from "../components/dialoge/Edit_Clients";
const palette = {
  dark: "#132421",
  primary: "#407f68",
  accent: "#6b603f",
  lightGreen: "#96d980",
  cream: "#fef7c5",
};

export default function Clients() {
  const theme = useTheme();
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);
  const [data, setData] = useState(clientData);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editingClient, setEditingClient] = useState(null);



   // ----------------------------------Handlers--------------------

  const handleEditClient = (id) => {
    const found = data.find((c) => c.id === id);
    if (found) {
      setEditingClient(found);
      setOpenEditDialog(true);
    }
  };

  const handleDeleteClient = (id) => {
    setClientToDelete(id);
    setOpenConfirm(true);
  };

  const handleConfirmDelete = () => {
    if (clientToDelete != null) {
      setData((prev) => prev.filter((c) => c.id !== clientToDelete));
    }
    setOpenConfirm(false);
    setClientToDelete(null);
  };

  const handleCancelDelete = () => {
    setOpenConfirm(false);
    setClientToDelete(null);
  };

  const handleSaveEditedClient = (updated) => {
    setData((prev) => prev.map((c) => (c.id === updated.id ? { ...c, ...updated } : c)));
    setOpenEditDialog(false);
    setEditingClient(null);
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
                bgcolor: palette.primary,
                width: 45,
                height: 45,
                fontSize: "0.875rem",
                fontWeight: "bold",
              }}
            >
              {row.original.avatar}
            </Avatar>
            <Typography variant="body2">{row.original.name}</Typography>
          </Box>
        ),
      },
      {
        header: "Email",
        accessorKey: "email",
      },
      {
        header: "Phone",
        accessorKey: "phone",
      },
      {
        header: "Company",
        accessorKey: "company",
      },
      {
        header: "Registration Date",
        accessorKey: "registrationDate",
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
              bgcolor: cell.getValue() === "Active" ? palette.lightGreen : "#e0e0e0",
              color: cell.getValue() === "Active" ? palette.dark : "#666",
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
        header: "Validity Date",
        accessorKey: "validityDate",
      },
      // Action edit and delete icons  button
      {
        header: "Actions",
        accessorKey: "actions",
        Cell: ({ row }) => (
          <Box display="flex" gap={1}>
            <IconButton
              onClick={() => handleEditClient(row.original.id)}
              size="small"
              sx={{ color: palette.primary }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton
              onClick={() => handleDeleteClient(row.original.id)}
              size="small"
              sx={{ color: palette.accent }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        ),
      },
    ],
    []
  );

 
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Add New Client Button */}
      <Box display="flex" justifyContent="end" mb={2}>
        <Button
          variant="contained"
          disableElevation
          sx={{
            bgcolor: palette.primary,
            color: "#fff",
            "&:hover": { bgcolor: palette.accent },
          }}
          onClick={() => setOpenAddDialog(true)}
        >
          ADD NEW CLIENT
        </Button>
      </Box>

      {/* Material React Table */}
      <MaterialReactTable
        columns={columns}
        data={data}
        enableColumnActions={false}
        enableColumnFilters={true}
        enableSorting
        enablePagination
        muiTablePaperProps={{
          sx: { borderRadius: 2, boxShadow: "0px 2px 6px rgba(0,0,0,0.05)" },
        }}
        muiTableHeadCellProps={{
          sx: {
            bgcolor: palette.primary,
            color: "#fff",
            fontWeight: 600,
          },
        }}
        muiTableBodyRowProps={{
          hover: true,
          sx: { "&:hover": { bgcolor: "#f5f5f5" } },
        }}
      />
      <AddClientsDialog
        open={openAddDialog}
        onClose={() => setOpenAddDialog(false)}
      />
      <ConfirmationDialog
        open={openConfirm}
        onCancel={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Delete Client"
        message="Are you sure you want to delete this client? This action cannot be undone."
      />
      <EditClientsDialog
        open={openEditDialog}
        onClose={() => { setOpenEditDialog(false); setEditingClient(null); }}
        client={editingClient}
        onSave={handleSaveEditedClient}
      />
    </Container>
  );
}
