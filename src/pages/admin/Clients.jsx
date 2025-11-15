import React, { useEffect, useMemo, useState } from "react";
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
import clientData from './Client';
import AddClientsDialog from "../../dialoge/admin/add_clients";
import ConfirmationDialog from "../../dialoge/admin/Confirmation_dialog";
import EditClientsDialog from "../../dialoge/admin/Edit_clients";
import { getAllClients } from "../../service/Admin/Admin_auth";

export default function Clients() {
  const theme = useTheme();
  const { palette } = theme;
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);
  const [data, setData] = useState(clientData);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editingClient, setEditingClient] = useState(null);

  const [clients, setClients] = useState([]);
  console.log("Clients from API:", clients);


  // call the API to get all clients and set the data
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await getAllClients();
        setClients(res.data);
      } catch (err) {
        console.error("Error fetching clients:", err);
      }
    };
    fetchClients();
  }, []);


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
                bgcolor: palette.primary.main,
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
    [theme]
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
    </React.Fragment>
  );
}
