import React from "react";
import { IconButton, Tooltip } from "@mui/material";
import { Brightness4, Brightness7, DarkModeTwoTone, LightMode, LightOutlined } from "@mui/icons-material";
import { useThemeMode } from "../ThemeContext";

export default function ThemeToggleButton() {
    const { mode, toggleTheme } = useThemeMode();

    return (
        <Tooltip title={`Switch to ${mode === "light" ? "dark" : "light"} mode`}>
            <IconButton onClick={toggleTheme} color="inherit">
                {
                    mode === "light" ?
                        <LightMode />
                        :
                         <DarkModeTwoTone />
                        }
            </IconButton>
        </Tooltip>
    );
}