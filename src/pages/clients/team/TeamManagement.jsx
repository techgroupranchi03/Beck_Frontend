import React, { useEffect, useMemo, useState } from 'react'
import { Box, Button, IconButton, Container, useTheme, Typography, Tooltip, Select } from '@mui/material'
import { MaterialReactTable } from 'material-react-table'
import { Edit as EditIcon, Delete as DeleteIcon, Person2Rounded } from '@mui/icons-material'
import ConfirmationDialog from '../../../dialoge/clients/Confirmation_dialog'
import { getRoles, getTeamMembers, createTeamMember, updateTeamMember, deleteTeamMember } from '../../../service/Clients/Team';
import { useSnackbar } from '../../../resuable_components/Snackbar'

const TeamManagement = () => {
  const theme = useTheme();
  const { palette } = theme;
  const { showSnackbar } = useSnackbar();
  const [roles, setRoles] = useState([]);
  const [teamData, setTeamData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [teamMemberToDelete, setTeamMemberToDelete] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});


  // Fetch roles
  const fetchRoles = async () => {
    try {
      const res = await getRoles();
      setRoles(res.data || []);
    } catch (error) {
      console.error("Error fetching roles:", error);
    }
  };

  // Fetch team members
  const fetchTeamMembers = async () => {
    setLoading(true);
    try {
      const res = await getTeamMembers();
      setTeamData(res.data || []);
    } catch (error) {
      console.error("Error fetching team members:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
    fetchTeamMembers();
  }, []);

  // Status options
  const statusOptions = ['active', 'inactive', 'on_leave'];

  // CREATE 
  const handleCreateTeamMember = async ({ values, table }) => {
    try {
      setLoading(true);
      const res = await createTeamMember(values);
      showSnackbar(res.message || "Team member created successfully", "success");
      await fetchTeamMembers();
      table.setCreatingRow(null);
    } catch (error) {
      if (error.errors && Array.isArray(error.errors)) {
        const apiErrors = {
          name: "",
          role: "",
          phone: "",
          status: "",
        };

        error.errors.forEach((err) => {
          if (err.name) {
            apiErrors.name = err.name;
          }
          if (err.role) {
            apiErrors.role = err.role;
          }
          if (err.phone) {
            apiErrors.phone = err.phone;
          }
          if (err.status) {
            apiErrors.status = err.status;
          }
        });

        if (setValidationErrors) {
          setValidationErrors(apiErrors);
        }
      }
      console.error("Error creating team member:", error);
    } finally {
      setLoading(false);
    }
  };

  // UPDATE 
  const handleSaveTeamMember = async ({ values, table, row }) => {
    try {
      setLoading(true);
      const res = await updateTeamMember(row.original.id, values);
      showSnackbar(res.message || "Team member updated successfully", "success");
      await fetchTeamMembers();
      table.setEditingRow(null);
    } catch (error) {
      if (error.errors && Array.isArray(error.errors)) {
        const apiErrors = {
          name: "",
          role: "",
          phone: "",
          status: "",
        };

        error.errors.forEach((err) => {
          if (err.name) {
            apiErrors.name = err.name;
          }
          if (err.role) {
            apiErrors.role = err.role;
          }
          if (err.phone) {
            apiErrors.phone = err.phone;
          }
          if (err.status) {
            apiErrors.status = err.status;
          }
        });

        if (setValidationErrors) {
          setValidationErrors(apiErrors);
        }
      }
      console.error("Error updating team member:", error);
    } finally {
      setLoading(false);
    }
  };

  // DELETE 
  const openDeleteDialog = (row) => {
    setTeamMemberToDelete(row.original.id);
    setOpenConfirm(true);
  };

  const handleDelete = async () => {
    if (teamMemberToDelete != null) {
      try {
        setLoading(true);
        const res = await deleteTeamMember(teamMemberToDelete);
        showSnackbar(res.message || "Team member deleted successfully", "success");
        await fetchTeamMembers();
      } catch (error) {
        console.error("Error deleting team member:", error);
        alert("Failed to delete team member. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    setOpenConfirm(false);
    setTeamMemberToDelete(null);
  };

  const handleCancel = () => {
    setOpenConfirm(false);
    setTeamMemberToDelete(null);
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
        accessorKey: 'name',
        header: 'Name',
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
            <Box
              sx={{
                width: 40,
                height: 40,
                bgcolor: palette.primary.main,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 'bold',
                fontSize: '1rem',
              }}
            >
              {row.original.name.charAt(0)}
            </Box>
            <Typography variant="body2">{row.original.name}</Typography>
          </Box>
        ),
      },
      {
        accessorKey: 'role',
        header: 'Role',
        size: 150,
        editVariant: 'select',
        editSelectOptions: roles.map(role => role.name),
        muiEditTextFieldProps: {
          select: true,
          required: true,
          error: !!validationErrors?.role,
          helperText: validationErrors?.role,
          SelectProps: {
            displayEmpty: true,
            renderValue: (selected) => {
              if (!selected) {
                return <em>Select Role</em>;
              }
              return selected;
            },
          },
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              role: undefined,
            }),
        },
      },
      {
        accessorKey: 'phone',
        header: 'Phone',
        size: 150,
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.phone,
          helperText: validationErrors?.phone,
          placeholder: 'Enter phone number',
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              phone: undefined,
            }),
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        size: 130,
        editVariant: 'select',
        editSelectOptions: statusOptions,
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
              return selected;
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
          let bgcolor, color;

          if (status === 'active') {
            bgcolor = palette.success?.main;
            color = palette.text.primary;
          } else if (status === 'on_leave') {
            bgcolor = palette.error?.light;
            color = palette.text.primary;
          } else {
            bgcolor = palette.background.paper;
            color = palette.text.primary;
          }

          return (
            <Box
              sx={{
                display: "inline-block",
                px: 1.5,
                py: 0.5,
                borderRadius: 1,
                bgcolor,
                color,
                fontSize: "0.75rem",
                fontWeight: 600,
                textTransform: 'capitalize',
              }}
            >
              {status.replace('_', ' ')}
            </Box>
          );
        },
      },
    ],
    [validationErrors, roles, statusOptions, palette]
  );

  return (
    <React.Fragment>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <MaterialReactTable
          columns={columns}
          data={teamData}
          state={{
            isLoading: loading,
            columnVisibility: { id: false }
          }}
          editDisplayMode="row"
          enableEditing
          enableRowActions
          positionActionsColumn="last"
          createDisplayMode="row"
          onCreatingRowSave={handleCreateTeamMember}
          onCreatingRowCancel={() => setValidationErrors({})}
          onEditingRowSave={handleSaveTeamMember}
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
              startIcon={<Person2Rounded fontSize='large' />}
              sx={{
                fontSize: '1rem',
                bgcolor: palette.secondary.main,
                "&:hover": { bgcolor: palette.primary.main },
              }}
            >
              Add Team Member
            </Button>
          )}
          enableColumnFilters={true}
          enableSorting
          enablePagination
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
          onCancel={handleCancel}
          onDelete={handleDelete}
          title="Delete Team Member"
          message="Are you sure you want to delete this team member? This action cannot be undone."
        />
      </Container>
    </React.Fragment>
  );
};

export default TeamManagement;