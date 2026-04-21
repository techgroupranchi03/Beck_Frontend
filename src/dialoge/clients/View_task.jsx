import React, { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    Card,
    CardContent,
    Typography,
    Box,
    Chip,
    Slide,
    Divider,
    Grid,
    Stack,
    Tooltip,
    useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { Task, CalendarMonth, Alarm, Person } from '@mui/icons-material';
import ViewMoreText from "../../resuable_components/ViewMore.jsx";
import ImageViewer from "../../resuable_components/ImageViewer.jsx";
import { formatDate } from '../../utils/dateFormat.js';




const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});
const View_task = ({ open, onClose, task }) => {
    const theme = useTheme();
    const { palette } = theme;
    const [openImage, setOpenImage] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);

    console.log("task in view task dialog:", task);

    // Ensure task is an array
    const tasks = Array.isArray(task) ? task : [];

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            TransitionComponent={Transition}
            transitionDuration={400}
            PaperProps={{
                sx: {
                    borderRadius: 4,
                    boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
                    overflow: "hidden",
                },
            }}
        >
            <DialogTitle
                sx={{
                    background: `linear-gradient(135deg, ${palette.primary.main} 0%, ${palette.primary.dark} 100%)`,
                    color: "#fff",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    p: 2.5,
                    position: "relative",
                    overflow: "hidden",
                    "&::before": {
                        content: '""',
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: "radial-gradient(circle at 20% 50%, rgba(150, 217, 128, 0.2), transparent 50%)",
                    },
                }}
            >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, zIndex: 1 }}>
                    <Task sx={{ fontSize: 28 }} />
                    <Typography variant="h6" fontWeight={700}>
                        Task List ({tasks.length})
                    </Typography>
                </Box>
                <IconButton
                    onClick={onClose}
                    sx={{
                        zIndex: 1,
                        color: "#fff",
                        bgcolor: "rgba(255,255,255,0.1)",
                        transition: "all 0.3s ease",
                        "&:hover": {
                            bgcolor: "rgba(255,255,255,0.2)",
                            transform: "rotate(90deg)",
                        },
                    }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent dividers sx={{ bgcolor: palette.background.default, display: 'flex', justifyContent: 'center' }}>
                {tasks.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="h6" color="text.secondary">
                            No tasks available
                        </Typography>
                    </Box>
                ) : (
                    <Grid container spacing={4}>
                        {tasks.map((taskItem) => (
                            <Grid item xs={12} sm={6} md={4} key={taskItem.id}>
                                <Card
                                    sx={{
                                        borderRadius: 3,
                                        boxShadow: 1,
                                        bgcolor: palette.background.paper, 
                                        elevation: 0,
                                        minWidth: 400,
                                        

                                    }}
                                >
                                    <CardContent>
                                        {/* Title */}
                                        <Tooltip
                                            placement="top"
                                            arrow
                                            title={taskItem.title}
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
                                                {taskItem.title}
                                            </Typography>
                                        </Tooltip>

                                        {/* Description */}
                                        <ViewMoreText text={taskItem.description || 'No description'} limit={100} />

                                        {/* Task Type + Status */}
                                        <Stack direction="row" spacing={1} mb={2} mt={1}>
                                            <Tooltip placement="top" arrow title="Task Type">
                                                <span>
                                                    <Chip
                                                        label={taskItem.task_type}
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
                                                    label={taskItem.status}
                                                    size="small"
                                                    color={
                                                        taskItem.status === "completed"
                                                            ? "success"
                                                            : taskItem.status === "in_progress"
                                                                ? "warning"
                                                                : "error"
                                                    }
                                                />
                                            </Tooltip>
                                        </Stack>

                                        {/* Meta Info */}
                                        <Stack direction="row" mb={2} flexWrap="wrap" gap={1}>
                                            <Chip
                                                label={`Created: ${formatDate(taskItem.created_at)}`}
                                                variant="outlined"
                                                size="small"
                                                icon={<CalendarMonth fontSize='medium' />}
                                                sx={{ fontSize: '0.9rem', borderRadius: 1 }}
                                            />
                                            {taskItem.schedule_type && (
                                                <Chip
                                                    label={taskItem.schedule_type.replace('_', ' ')}
                                                    variant="outlined"
                                                    size="small"
                                                    icon={<Alarm fontSize='medium' />}
                                                    sx={{ fontSize: '0.9rem', borderRadius: 1 }}
                                                />
                                            )}
                                        </Stack>

                                        {/* Assigned To */}
                                        {taskItem.assigned_to && (
                                            <Chip
                                                label={taskItem.assigned_to.name}
                                                variant="outlined"
                                                size="small"
                                                avatar={<Person size="small" />}
                                                sx={{ fontWeight: 600, borderRadius: 1 }}
                                            />
                                        )}



                                        {/* Images Section - if available */}
                                        {taskItem.images && taskItem.images.length > 0 && (
                                            <>
                                                <Divider sx={{ my: 1 }}>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Images
                                                    </Typography>
                                                </Divider>

                                                <Stack direction="row" spacing={1} sx={{ overflowX: "auto", display: "flex", justifyContent: "center" }}>
                                                    {taskItem.images.map((img, idx) => (
                                                        <Box
                                                            key={idx}
                                                            component="img"
                                                            src={img}
                                                            alt={`task-${taskItem.id}-${idx}`}
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
                                                                cursor: 'pointer',
                                                            }}
                                                        />
                                                    ))}
                                                </Stack>
                                            </>
                                        )}
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </DialogContent>

            <ImageViewer
                open={openImage}
                onClose={() => setOpenImage(false)}
                image={selectedImage}
            />
        </Dialog>
    )
}

export default View_task