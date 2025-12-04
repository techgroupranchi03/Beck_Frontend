// src/components/TaskList.jsx
import React, { useState } from "react";
import {
    Box,
    Container,
    Typography,
    Card,
    CardContent,
    Grid,
    Chip,
    IconButton,
    Stack,
    useTheme,
    Avatar,
    Divider,
    Tooltip,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import { tasks } from "../src/pages/clients/data/tasks.js";
import { Alarm, CalendarMonth, Person } from "@mui/icons-material";
import ViewMoreText from "../src/resuable_components/ViewMore.jsx";
import ImageViewer from "../src/resuable_components/ImageViewer.jsx";

const TaskList = () => {
    const [openImage, setOpenImage] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);

    const theme = useTheme();
    const { palette } = theme;

    return (
        <Container maxWidth="mx" sx={{ mt: 4, mb: 4 }}>
            {/* ---------- Header + Filter ---------- */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" fontWeight={600} color="text.primary">
                    Task List
                </Typography>

                <IconButton
                    sx={{
                        color: "#fff",
                        bgcolor: palette.primary.main,
                        "&:hover": { bgcolor: palette.secondary.main },
                    }}
                >
                    <FilterListIcon />
                </IconButton>
            </Box>

            {/* ---------- Task Grid ---------- */}
            <Grid container spacing={3}>
                {tasks.map((task) => (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={task.id}>
                        <Card
                            sx={{
                                borderRadius: 3,
                                boxShadow: 1,
                                bgcolor: palette.background.paper,
                            }}
                        >
                            <CardContent >
                                {/* Title */}
                                <Tooltip
                                    placement="top"
                                    arrow title={task.task_name}
                                    slotProps={{
                                        tooltip: {
                                            sx: {
                                                bgcolor: palette.primary.main,
                                                color: "#fff",
                                                fontSize: "14px",
                                                fontWeight: 600,
                                                padding: "8px 12px",
                                                minWidth: "120px",
                                                minHeight: "40px",
                                                borderRadius: "8px",
                                            }
                                        },
                                        arrow: {
                                            sx: {
                                                color: palette.primary.main
                                            }
                                        }
                                    }}
                                >
                                    <Typography
                                        variant="h5"
                                        color="text.primary"
                                        sx={{
                                            display: "-webkit-box",
                                            WebkitBoxOrient: "vertical",
                                            overflow: "hidden",
                                            WebkitLineClamp: 1,
                                        }}
                                    >
                                        {task.task_name}
                                    </Typography>
                                </Tooltip>

                                {/* Description */}
                                <ViewMoreText text={task.description} limit={100} />

                                {/* Task Type + Status */}
                                <Stack direction="row" spacing={1} mb={2} mt={1}>
                                    <Tooltip placement="top" arrow title="Task Type">
                                        <span>
                                            <Chip
                                                label={task.task_type}
                                                size="small"
                                                sx={{
                                                    bgcolor: palette.primary.main,
                                                    color: "#fff",
                                                    fontWeight: 600,
                                                    cursor: "pointer",
                                                }}
                                            />
                                        </span>
                                    </Tooltip>

                                    <Tooltip placement="top" arrow title="Task Status">
                                        <Chip
                                            label={task.status}
                                            size="small"
                                            color={
                                                task.status === "Completed"
                                                    ? "success"
                                                    : task.status === "In Progress"
                                                        ? "warning"
                                                        : "error"
                                            }
                                        />
                                    </Tooltip>
                                </Stack>

                                {/* Meta Info */}


                                <Stack direction="row" mb={2} flexWrap="wrap" gap={1}>
                                    <Chip
                                        label={`Created : ${task.created_on}`}
                                        variant="outlined"
                                        size="small"
                                        icon={<CalendarMonth fontSize='medium' />}
                                        sx={{ fontSize: '0.9rem', borderRadius: 1 }}
                                    />
                                    <Chip
                                        label={`${task.due_in_days} `}
                                        variant="outlined"
                                        size="small"
                                        icon={<Alarm fontSize='medium' />}
                                        sx={{ fontSize: '0.9rem', borderRadius: 1 }}
                                    />

                                </Stack>

                                {/* Assigned To */}
                                <Chip
                                    label={task.assigned_to}
                                    variant="outlined"
                                    size="small"
                                    avatar={<Person size="small" />}
                                    sx={{ fontWeight: 600, borderRadius: 1 }}
                                />

                                <Divider sx={{ my: 1 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Images
                                    </Typography>
                                </Divider>

                                <Stack direction="row" spacing={1} sx={{ overflowX: "auto", display: "flex", justifyContent: "center" }}>
                                    {task.images.map((img, idx) => (
                                        <Box
                                            key={idx}
                                            component="img"
                                            src={img}
                                            alt={`task-${task.id}-${idx}`}
                                            onClick={() => {
                                                setSelectedImage(img);
                                                setOpenImage(true);
                                            }}

                                            sx={{
                                                width: 70,
                                                height: 70,
                                                borderRadius: 2,
                                                objectFit: "cover",
                                                border: `1px solid ${palette.divider}`,
                                            }}
                                        />
                                    ))}
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <ImageViewer
                open={openImage}
                onClose={() => setOpenImage(false)}
                image={selectedImage}
            />
        </Container>
    );
};

export default TaskList;


// import React, { useEffect, useMemo, useState } from 'react'
// import { Container, Box, IconButton, Tooltip, Button, useTheme } from '@mui/material'
// import { MaterialReactTable } from 'material-react-table'
// import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material'
// import taskDataJson from './taskData.json'
// import ConfirmationDialog from '../../../dialoge/clients/Confirmation_dialog'
// import { getClientTasks } from '../../../service/Clients/Task'

// const AllTask = props => {
//     const theme = useTheme()
//     const { palette } = theme

//     const [taskData, setTaskData] = useState(taskDataJson);
//     const [validationErrors, setValidationErrors] = useState({});
//     const [openConfirm, setOpenConfirm] = useState(false);
//     const [taskToDelete, setTaskToDelete] = useState(null);
//     const [newTaskData, setNewTaskData] = useState([]);
//     console.log('Task Data:', newTaskData);



//     // get all task 

//     const allTasks = async () => {
//         try {
//             const res = await getClientTasks();
//             setNewTaskData(res.data);
//         } catch (error) {
//             console.error('Error fetching tasks:', error);
//         }
//     };
//     useEffect(() => {
//         allTasks();
//     }, []);

//     // People list for assigned_to dropdown
//     const peopleList = [
//         'Kelvin Langosh',
//         'Molly Purdy',
//         'Henry Lynch',
//         'Glenda Douglas',
//         'Leone Williamson',
//         'Mckenna Friesen',
//         'Wyman Jast',
//         'Janick Willms'
//     ]

//     // Task type options
//     const taskTypes = ['inspection', 'maintenance', 'delivery']

//     // Status options
//     const statusOptions = ['pending', 'progress', 'canceled']

//     const columns = useMemo(
//         () => [
//             {
//                 accessorKey: 'title',
//                 header: 'Title',
//                 size: 150,
//                 muiEditTextFieldProps: {
//                     required: true,
//                     error: !!validationErrors?.title,
//                     helperText: validationErrors?.title,
//                     onFocus: () =>
//                         setValidationErrors({
//                             ...validationErrors,
//                             title: undefined,
//                         }),
//                 },
//             },
//             {
//                 accessorKey: 'description',
//                 header: 'Description',
//                 size: 200,
//                 muiEditTextFieldProps: {
//                     required: true,
//                     multiline: true,
//                     rows: 2,
//                     error: !!validationErrors?.description,
//                     helperText: validationErrors?.description,
//                     onFocus: () =>
//                         setValidationErrors({
//                             ...validationErrors,
//                             description: undefined,
//                         }),
//                 },
//             },

//             {
//                 accessorKey: 'property_name',
//                 header: 'Property',
//                 size: 180,
//             },
//             {
//                 accessorKey: 'inventory_name',
//                 header: 'Inventory',
//                 size: 180,
//             },
//             {
//                 accessorKey: 'schedule_type',
//                 header: 'Schedule Type',
//                 size: 130,
//             },

//             {
//                 accessorKey: 'task_type',
//                 header: 'Task Type',
//                 size: 130,
//                 editVariant: 'select',
//                 editSelectOptions: taskTypes,
//                 muiEditTextFieldProps: {
//                     select: true,
//                     error: !!validationErrors?.task_type,
//                     helperText: validationErrors?.task_type,
//                 },
//                 Cell: ({ cell }) => {
//                     const value = cell.getValue()
//                     const colors = {
//                         inspection: palette.info?.main || '#2196f3',
//                         maintenance: palette.warning?.main || '#ff9800',
//                         delivery: palette.success?.main || '#4caf50'
//                     }
//                     return (
//                         <Box
//                             sx={{
//                                 display: 'inline-block',
//                                 px: 1.5,
//                                 py: 0.5,
//                                 borderRadius: 1,
//                                 bgcolor: colors[value] || palette.grey[500],
//                                 color: 'white',
//                                 fontSize: '0.75rem',
//                                 fontWeight: 600,
//                                 textAlign: 'center',
//                                 textTransform: 'capitalize',
//                             }}
//                         >
//                             {value}
//                         </Box>
//                     )
//                 },
//             },
//             {
//                 accessorKey: 'assigned_to_name',
//                 header: 'Assigned To',
//                 size: 150,
//                 editVariant: 'select',
//                 editSelectOptions: peopleList,
//                 muiEditTextFieldProps: {
//                     select: true,
//                 },
//             },
//             {
//                 accessorKey: 'status',
//                 header: 'Status',
//                 size: 130,
//                 editVariant: 'select',
//                 editSelectOptions: statusOptions,
//                 muiEditTextFieldProps: {
//                     select: true,
//                     error: !!validationErrors?.status,
//                     helperText: validationErrors?.status,
//                 },
//                 Cell: ({ cell }) => {
//                     const value = cell.getValue()
//                     const colors = {
//                         pending: palette.error?.main || '#f44336',
//                         progress: palette.info?.main || '#2196f3',
//                         canceled: palette.grey[500]
//                     }
//                     return (
//                         <Box
//                             sx={{
//                                 display: 'inline-block',
//                                 px: 1.5,
//                                 py: 0.5,
//                                 borderRadius: 1,
//                                 bgcolor: colors[value] || palette.grey[500],
//                                 color: 'white',
//                                 fontSize: '0.75rem',
//                                 fontWeight: 600,
//                                 textAlign: 'center',
//                                 textTransform: 'capitalize',
//                             }}
//                         >
//                             {value}
//                         </Box>
//                     )
//                 },
//             },
//         ],
//         [validationErrors, peopleList, taskTypes, statusOptions, palette]
//     )

//     // CREATE action
//     const handleCreateTask = ({ values, table }) => {
//         const newValidationErrors = validateTask(values)
//         if (Object.values(newValidationErrors).some((error) => error)) {
//             setValidationErrors(newValidationErrors)
//             return
//         }
//         setValidationErrors({})
//         const newTask = {
//             ...values,
//             id: Math.max(...taskData.map(t => t.id), 0) + 1
//         }
//         setTaskData([...taskData, newTask])
//         table.setCreatingRow(null)
//     }

//     // UPDATE action
//     const handleSaveTask = ({ values, table, row }) => {
//         const newValidationErrors = validateTask(values)
//         if (Object.values(newValidationErrors).some((error) => error)) {
//             setValidationErrors(newValidationErrors)
//             return
//         }
//         setValidationErrors({})
//         taskData[row.index] = values
//         setTaskData([...taskData])
//         table.setEditingRow(null)
//     }

//     // DELETE action
//     const openDeleteDialog = (row) => {
//         setTaskToDelete(row.original.id);
//         setOpenConfirm(true);
//     };

//     const handleDelete = () => {
//         if (taskToDelete != null) {
//             setTaskData(taskData.filter((task) => task.id !== taskToDelete));
//         }
//         setOpenConfirm(false);
//         setTaskToDelete(null);
//     };

//     const handleCancel = () => {
//         setOpenConfirm(false);
//         setTaskToDelete(null);
//     };

//     // Validation function
//     const validateTask = (task) => {
//         const errors = {}
//         if (!task.title) {
//             errors.title = 'Title is required'
//         }
//         if (!task.description) {
//             errors.description = 'Description is required'
//         }
//         if (!task.task_type) {
//             errors.task_type = 'Task type is required'
//         }
//         if (!task.status) {
//             errors.status = 'Status is required'
//         }
//         return errors
//     }

//     return (
//         <React.Fragment>
//             <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
//                 <MaterialReactTable
//                     columns={columns}
//                     data={newTaskData}
//                     editDisplayMode="row"
//                     enableEditing
//                     enableRowActions
//                     positionActionsColumn="last"
//                     createDisplayMode="row"
//                     onCreatingRowSave={handleCreateTask}
//                     onCreatingRowCancel={() => setValidationErrors({})}
//                     onEditingRowSave={handleSaveTask}
//                     onEditingRowCancel={() => setValidationErrors({})}
//                     renderRowActions={({ row, table }) => (
//                         <Box sx={{ display: 'flex', gap: 1 }}>
//                             <Tooltip title="Edit">
//                                 <IconButton
//                                     onClick={() => table.setEditingRow(row)}
//                                     size="small"
//                                     sx={{ color: palette.primary.main }}
//                                 >
//                                     <EditIcon fontSize="small" />
//                                 </IconButton>
//                             </Tooltip>
//                             <Tooltip title="Delete">
//                                 <IconButton
//                                     onClick={() => openDeleteDialog(row)}
//                                     size="small"
//                                     sx={{ color: palette.secondary.main }}
//                                 >
//                                     <DeleteIcon fontSize="small" />
//                                 </IconButton>
//                             </Tooltip>
//                         </Box>
//                     )}
//                     renderTopToolbarCustomActions={({ table }) => (
//                         <Button
//                             variant="contained"
//                             disableElevation
//                             onClick={() => {
//                                 table.setCreatingRow(true)
//                             }}
//                             sx={{
//                                 bgcolor: palette.primary.main,
//                                 "&:hover": { bgcolor: palette.secondary.main },
//                             }}
//                         >
//                             Create New Task
//                         </Button>
//                     )}
//                     enableColumnFilters={true}
//                     enableSorting
//                     enablePagination
//                     muiTablePaperProps={{
//                         elevation: 2,
//                         sx: {
//                             borderRadius: 2,
//                             boxShadow: '0px 2px 6px rgba(0,0,0,0.05)',
//                         },
//                     }}
//                     muiTableHeadCellProps={{
//                         sx: {
//                             bgcolor: palette.primary.main,
//                             color: '#fff',
//                             fontWeight: 600,
//                         },
//                     }}
//                     muiTableBodyRowProps={{
//                         hover: true,
//                         sx: {
//                             '&:hover': {
//                                 bgcolor: theme.palette.mode === 'light'
//                                     ? '#f5f5f5'
//                                     : palette.background.paper
//                             }
//                         },
//                     }}
//                 />

//                 <ConfirmationDialog
//                     open={openConfirm}
//                     onCancel={handleCancel}
//                     onDelete={handleDelete}
//                     title="Delete Task"
//                     message="Are you sure you want to delete this task? This action cannot be undone."
//                 />
//             </Container>
//         </React.Fragment>
//     )
// }

// export default AllTask