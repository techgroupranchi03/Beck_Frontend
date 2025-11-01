import React, { useMemo, useState } from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import {
  Box,
  Stack,
  Avatar,
  Typography,
  IconButton,
  Drawer,
  Tooltip,
} from "@mui/material";
import { People, TrendingUp, Menu as MenuIcon } from "@mui/icons-material";
import ProfileMenu from "./resuable_components/profile_menu.jsx";

const palette = {
  dark: "#132421",
  primary: "#407f68",
  accent: "#6b603f",
  lightGreen: "#96d980",
  cream: "#fef7c5",
};

const getPageTitle = (pathname) => {
  // Normalize without query/hash
  const path = pathname.split(/[?#]/)[0];
  if (path.startsWith("/admin")) {
    if (path.includes("dashboard")) return "Admin Dashboard";
    if (path.endsWith("/clients") || path.includes("/clients/")) return "Manage Clients";
    return "Admin";
  }
  if (path.startsWith("/clients")) {
    if (path.includes("dashboard")) return "Client Dashboard";
    if (path.includes("property")) return "Property Management";
    if (path.includes("inventory")) return "Inventory Management";
    if (path.includes("team")) return "Team Management";
    return "Client Portal";
  }
  return "Beck Holiday Homes";
};

export default function Layout({ role }) {
  const location = useLocation();
  const pageTitle = getPageTitle(location.pathname);
  const [drawerOpen, setDrawerOpen] = useState(true);

  // Determine role if not passed explicitly (fallback based on path)
  const resolvedRole = useMemo(() => {
    if (role) return role;
    const p = location.pathname;
    if (p.startsWith("/admin")) return "admin";
    if (p.startsWith("/clients")) return "client";
    return "guest";
  }, [role, location.pathname]);

  const basePath = resolvedRole === "admin" ? "/admin" : resolvedRole === "client" ? "/clients" : "";

  const navItems = useMemo(() => {
    if (resolvedRole === "admin") {
      return [
        { to: `${basePath}/dashboard`, icon: <TrendingUp />, label: "Dashboard" },
        { to: `${basePath}/clients`, icon: <People />, label: "Clients" },
      ];
    }
    if (resolvedRole === "client") {
      return [
        { to: `${basePath}/dashboard`, icon: <TrendingUp />, label: "Dashboard" },
        { to: `${basePath}/property-management`, icon: <People />, label: "Properties" },
        { to: `${basePath}/inventory-management`, icon: <People />, label: "Inventory" },
        { to: `${basePath}/team-management`, icon: <People />, label: "Team" },
      ];
    }
    return [];
  }, [resolvedRole, basePath]);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f9f9f9" }}>
      {/* ==================== SIDEBAR ==================== */}
      <Drawer
        variant="permanent"
        open={drawerOpen}
        sx={{
          width: drawerOpen ? 260 : 80,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerOpen ? 260 : 80,
            bgcolor: palette.dark,
            color: "#fff",
            transition: "width 0.4s ease",
            overflowX: "hidden",
            display: "flex",
            flexDirection: "column",
            alignItems: drawerOpen ? "flex-start" : "center",
          },
        }}
      >
        {/* Logo + App Name */}
        <Stack
          direction={drawerOpen ? "row" : "column"}
          alignItems="center"
          spacing={drawerOpen ? 1 : 0}
          sx={{
            p: 2,
            mt: 1,
            width: "100%",
            justifyContent: drawerOpen ? "flex-start" : "center",
          }}
        >
          <Avatar
            src="/images/logo.png"
            alt="Beck Holiday Homes"
            sx={{ width: 45, height: 45, border: "2px solid #fff" }}
          />
          {drawerOpen && (
            <Typography variant="body1" sx={{ fontWeight: 700, whiteSpace: "nowrap" }}>
              Beck Holiday Homes
            </Typography>
          )}
        </Stack>

        {/* Navigation Links */}
        <Box component="nav" sx={{ width: "100%", mt: 2 }}>
          <Stack spacing={1}>
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                style={({ isActive }) => ({
                  display: "flex",
                  alignItems: "center",
                  gap: drawerOpen ? 12 : 0,
                  justifyContent: drawerOpen ? "flex-start" : "center",
                  padding: "12px 16px",
                  borderRadius: 2,
                  color: "#fff",
                  textDecoration: "none",
                  backgroundColor: isActive ? palette.primary : "transparent",
                  fontWeight: isActive ? 600 : 400,
                  transition: "all 0.2s ease",
                })}
              >
                <Tooltip title={!drawerOpen ? item.label : ""} placement="right">
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: drawerOpen ? "flex-start" : "center",
                    }}
                  >
                    {item.icon}
                    {drawerOpen && (
                      <Typography variant="body1" sx={{ ml: 1 }}>
                        {item.label}
                      </Typography>
                    )}
                  </Box>
                </Tooltip>
              </NavLink>
            ))}
          </Stack>
        </Box>
      </Drawer>

      {/* ==================== MAIN CONTENT AREA ==================== */}
      <Box flex={1} display="flex" flexDirection="column" sx={{ position: "relative" }}>
        {/* Top Bar (Fixed) */}
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: drawerOpen ? 260 : 80,
            right: 0,
            height: 64,
            bgcolor: "#fff",
            borderBottom: "1px solid #e0e0e0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            transition: "left 0.4s ease, width 0.4s ease",
            zIndex: 1000,
          }}
        >
          {/* Menu Icon + Page Title */}
          <Stack direction="row" alignItems="center" spacing={2}>
            <IconButton onClick={() => setDrawerOpen(!drawerOpen)}>
              <MenuIcon sx={{ color: palette.dark }} />
            </IconButton>
            <Typography variant="h5" fontWeight={600} color={palette.dark}>
              {pageTitle}
            </Typography>
          </Stack>

          {/* Profile Menu */}
          <ProfileMenu />
        </Box>

        {/* Page Content (below top bar) */}
        <Box
          component="main"
          sx={{
            flex: 1,
            bgcolor: "#f9f9f9",
            p: 3,
            mt: 4,
            overflowY: "auto",
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
