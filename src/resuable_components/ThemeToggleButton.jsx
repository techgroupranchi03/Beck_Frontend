import React from "react";
import { IconButton, Tooltip } from "@mui/material";
import { Brightness4, Brightness7, DarkModeTwoTone, LightMode, } from "@mui/icons-material";
import { useThemeMode } from "../context/ThemeContext";

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