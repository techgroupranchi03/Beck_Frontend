import React from "react";
import { Box, Tooltip, Typography, useTheme } from "@mui/material";

const TaskProgressbar = ({ statistics }) => {
    const theme = useTheme();
    const { palette } = theme;

    if (!statistics) return null;

    const {
        completed_tasks = 0,
        in_progress_tasks = 0,
        pending_tasks = 0,
        skipped_tasks = 0,
        total_tasks = 0,
    } = statistics;

    const getPercentage = (value) =>
        total_tasks > 0 ? (value / total_tasks) * 100 : 0;

    const segments = [
        {
            key: "Completed",
            value: completed_tasks,
            color: palette.taskStatus.completed,
        },
        {
            key: "In Progress",
            value: in_progress_tasks,
            color: palette.taskStatus.in_progress,
        },
        {
            key: "Pending",
            value: pending_tasks,
            color: palette.taskStatus.pending,
        },
        {
            key: "Skipped",
            value: skipped_tasks,
            color: palette.taskStatus.skipped,
        },
    ];

    return (
        
        <Box
            sx={{
                width: {
                    xs: "80%", 
                    sm: "70%", 
                    md: "60%", 
                },
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    width: "100%",
                    height: 14,
                    borderRadius: 6,
                    overflow: "hidden",
                    backgroundColor: palette.grey[300],
                }}
            >
                {segments.map((segment) => {
                    const percentage = getPercentage(segment.value);
                    if (percentage === 0) return null;

                    const rounded = Math.round(percentage);

                    return (
                        <Tooltip
                            key={segment.key}
                            title={`${segment.key}: ${segment.value} task${segment.value > 1 ? "s" : ""
                                } (${rounded}%)`}
                            arrow
                        >
                            <Box
                                sx={{
                                    width: `${percentage}%`,
                                    backgroundColor: segment.color,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: "#000",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    transition: "all 0.2s",
                                    "&:hover": {
                                        opacity: 0.9,
                                    },
                                }}
                            >
                                {percentage > 8 && (
                                    <Typography
                                        sx={{
                                            fontSize: "10px",
                                            color: "#000",
                                        }}
                                    >
                                        {rounded}%
                                    </Typography>
                                )}
                            </Box>
                        </Tooltip>
                    );
                })}
            </Box>
        </Box>
    );
};

export default TaskProgressbar;