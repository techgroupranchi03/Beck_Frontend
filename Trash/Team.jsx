import React, { useMemo, useState } from 'react'
import { Box, Button, IconButton, Container, useTheme, Typography } from '@mui/material'
import { MaterialReactTable } from 'material-react-table'
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material'
import Add_Edit_TeamDialog from '../../../dialoge/clients/Add_Edit_TeamDialog'
import ConfirmationDialog from '../../../dialoge/clients/Confirmation_dialog'

const TeamManagement = () => {
  const theme = useTheme();
  const { palette } = theme;

  // Sample JSON data for team members
  const [teamData, setTeamData] = useState([
    {
      id: 1,
      name: 'John Doe',
      role: 'Manager',
      phone: '+1 234-567-8900',
      status: 'active',
    },
    {
      id: 2,
      name: 'Jane Smith',
      role: 'Technician',
      phone: '+1 234-567-8901',
      status: 'active',
    },
    {
      id: 3,
      name: 'Mike Johnson',
      role: 'Inspector',
      phone: '+1 234-567-8902',
      status: 'active',
    },
    {
      id: 4,
      name: 'Sarah Williams',
      role: 'Technician',
      phone: '+1 234-567-8903',
      status: 'inactive',
    },
    {
      id: 5,
      name: 'David Brown',
      role: 'Manager',
      phone: '+1 234-567-8904',
      status: 'on_leave',
    }
  ])

  const [openAddDialog, setOpenAddDialog] = useState(false)
  const [openConfirm, setOpenConfirm] = useState(false)
  const [editingTeamMember, setEditingTeamMember] = useState(null)
  const [teamMemberToDelete, setTeamMemberToDelete] = useState(null)

  const handleEdit = (row) => {
    setEditingTeamMember(row.original)
    setOpenAddDialog(true)
  }

  const handleDelete = (row) => {
    setTeamMemberToDelete(row.original.id)
    setOpenConfirm(true)
  }

  const handleConfirmDelete = () => {
    if (teamMemberToDelete != null) {
      setTeamData((prev) => prev.filter((t) => t.id !== teamMemberToDelete))
    }
    setOpenConfirm(false)
    setTeamMemberToDelete(null)
  }

  const handleCancelDelete = () => {
    setOpenConfirm(false)
    setTeamMemberToDelete(null)
  }

  const handleAddTeam = () => {
    setOpenAddDialog(true)
  }

  const handleSaveTeam = (teamMember) => {
    if (editingTeamMember) {
      // Edit existing team member
      setTeamData((prev) => prev.map((t) => (t.id === teamMember.id ? teamMember : t)))
    } else {
      // Add new team member
      setTeamData((prev) => [...prev, teamMember])
    }
    setOpenAddDialog(false)
    setEditingTeamMember(null)
  }

  const columns = useMemo(
    () => [
      {
        header: 'Name',
        accessorKey: 'name',
        // add  avatar or icon here
        Cell: ({ row }) => (
          <Box display="flex" alignItems="center" gap={1.5}>
            {/* You can replace this with an Avatar or Icon component */}
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
        header: 'Role',
        accessorKey: 'role',
      },
      {
        header: 'Phone',
        accessorKey: 'phone',
      },
      {
        header: 'Status',
        accessorKey: 'status',
        Cell: ({ cell }) => {
          const status = cell.getValue();
          let bgcolor, color;

          if (status === 'active') {
            bgcolor = palette.primary.light;
            color = palette.primary.dark;
          } else if (status === 'on_leave') {
            bgcolor = palette.warning?.light || '#fff3e0';
            color = palette.warning?.dark || '#e65100';
          } else {
            bgcolor = palette.grey[300];
            color = palette.text.secondary;
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
      {
        header: "Actions",
        accessorKey: "actions",
        Cell: ({ row }) => (
          <Box display="flex" gap={1}>
            <IconButton
              onClick={() => handleEdit(row)}
              size="small"
              sx={{ color: palette.primary.main }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton
              onClick={() => handleDelete(row)}
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
  )

  return (
    <React.Fragment>
      <Container maxWidth="mx" sx={{ mt: 4, mb: 4 }}>
        {/* Add Team Button */}
        <Box display="flex" justifyContent="end" mb={2}>
          <Button
            variant="contained"
            disableElevation
            sx={{
              bgcolor: palette.primary.main,
              "&:hover": { bgcolor: palette.secondary.main },
            }}
            onClick={handleAddTeam}
          >
            ADD TEAM
          </Button>
        </Box>

        {/* Material React Table */}
        <MaterialReactTable
          columns={columns}
          data={teamData}
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
        <Add_Edit_TeamDialog
          open={openAddDialog}
          onClose={() => {
            setOpenAddDialog(false);
            setEditingTeamMember(null);
          }}
          onSave={handleSaveTeam}
          teamMember={editingTeamMember}
        />
        <ConfirmationDialog
          open={openConfirm}
          onCancel={handleCancelDelete}
          onConfirm={handleConfirmDelete}
          title="Delete Team Member"
          message="Are you sure you want to delete this team member? This action cannot be undone."
        />
      </Container>
    </React.Fragment>
  )
}

export default TeamManagement