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
import { tasks } from "../data/tasks.js";
import { Alarm, CalendarMonth, Person } from "@mui/icons-material";
import ViewMoreText from "../../../resuable_components/ViewMore.jsx";
import ImageViewer from "../../../resuable_components/ImageViewer.jsx";

export const TaskList = () => {
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