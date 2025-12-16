import React, { useMemo, useState, useEffect } from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import {
  Box,
  Stack,
  Avatar,
  Typography,
  IconButton,
  Drawer,
  Tooltip,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { People, TrendingUp, Menu as MenuIcon, Business, Inventory, Assignment } from "@mui/icons-material";
import ProfileMenu from "./resuable_components/profile_menu.jsx";
import { useAuth } from "./context/AuthContext.jsx";

const getPageTitle = (pathname) => {
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
    if (path.includes("task")) return "Task Management";
    return "Client Portal";
  }
  if (path.startsWith("/teams")) {
    if (path.includes("dashboard")) return "Team Dashboard";
    if (path.includes("task")) return "Task Management";
    return "Team Portal";
  }
  return "Beck Holiday Homes";
};

export default function Layout({ role }) {
  const theme = useTheme();
  const location = useLocation();
  const { user } = useAuth();
  const pageTitle = getPageTitle(location.pathname);


  // Responsive breakpoints
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // < 600px
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md')); // 600px - 900px
  const isDesktop = useMediaQuery(theme.breakpoints.up('md')); // >= 900px

  // Drawer state - closed on mobile by default, open on desktop
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);

  console.log('Layout user:', user);

  // Auto-close drawer on mobile when route changes
  useEffect(() => {
    if (isMobile) {
      setDrawerOpen(false);
    }
  }, [location.pathname, isMobile]);

  const resolvedRole = useMemo(() => {
    if (role) return role;
    const p = location.pathname;
    if (p.startsWith("/admin")) return "admin";
    if (p.startsWith("/clients")) return "client";
    if (p.startsWith("/teams")) return "team";
    return "guest";
  }, [role, location.pathname]);

  const basePath = resolvedRole === "admin" ? "/admin" : resolvedRole === "client" ? "/clients" : resolvedRole === "team" ? "/teams" : "";
  // has permissions for nav items - checks if at least one operation is true
  const hasPermission = (module) => {
    if (!user?.permissions || !Object.prototype.hasOwnProperty.call(user.permissions, module)) {
      return false;
    }
    const modulePermissions = user.permissions[module];
    // Check if at least one operation (create, read, update, delete) is true
    return modulePermissions.create || modulePermissions.read || modulePermissions.update || modulePermissions.delete;
  };
  console.log('User permissions:', user?.permissions);

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
        { to: `${basePath}/property-management`, icon: <Business />, label: "Properties" },
        { to: `${basePath}/inventory-management`, icon: <Inventory />, label: "Inventory" },
        { to: `${basePath}/team-management`, icon: <People />, label: "Team" },
        { to: `${basePath}/task-management`, icon: <Assignment />, label: "Tasks" },
        // {to: `${basePath}/all-task`, icon: <Assignment />, label: "All Tasks" },
      ];
    }

    if (resolvedRole === "team") {
      return [
        { to: `${basePath}/dashboard`, icon: <TrendingUp />, label: "Dashboard" },
        hasPermission("property") && {
          to: `${basePath}/property-management`,
          icon: <Business />,
          label: "Properties",
        },
        hasPermission("task") && {
          to: `${basePath}/task-management`,
          icon: <Assignment />,
          label: "Tasks",
        },
        hasPermission("team") && {
          to: `${basePath}/team-management`,
          icon: <People />,
          label: "Team",
        },
        // hasPermission("inventory") && {
        //   to: `${basePath}/inventory-management`,
        //   icon: <Inventory />,
        //   label: "Inventory",
        // },


      ].filter(Boolean);
    }

    return [];
  }, [resolvedRole, basePath]);

  // Determine drawer width and variant based on screen size
  const drawerWidth = useMemo(() => {
    if (isMobile) return 260;
    if (isTablet && !drawerOpen) return 80;
    if (isTablet && !drawerOpen) return 200;
    return drawerOpen ? 260 : 80;
  }, [isMobile, isTablet, drawerOpen]);

  const drawerVariant = isMobile ? "temporary" : "permanent";

  return (
    <Box sx={{ bgcolor: theme.palette.background.default }}>
      {/* ==================== SIDEBAR ==================== */}
      <Drawer
        variant={drawerVariant}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            transition: "width 0.3s ease",
            overflowX: "hidden",
            display: "flex",
            flexDirection: "column",
            alignItems: (isMobile || (isDesktop && drawerOpen) || (isTablet && drawerOpen)) ? "flex-start" : "center",
          },
        }}
      >
        {/* Logo + App Name */}
        <Stack
          direction={(isMobile || drawerOpen) ? "row" : "column"}
          alignItems="center"
          spacing={(isMobile || drawerOpen) ? 1 : 0}
          sx={{
            p: 2,
            mt: 1,
            width: "100%",
            justifyContent: (isMobile || drawerOpen) ? "flex-start" : "center",
          }}
        >
          <Avatar
            src="/images/logo.png"
            alt="Beck Holiday Homes"
            sx={{
              width: isMobile ? 40 : 45,
              height: isMobile ? 40 : 45,
              border: "2px solid #fff"
            }}
          />
          {(isMobile || drawerOpen) && (
            <Typography
              variant={isMobile ? "body2" : "body1"}
              sx={{
                fontWeight: 700,
                whiteSpace: "nowrap",
                fontSize: isMobile ? '0.875rem' : isTablet ? '0.9rem' : '1rem'
              }}
            >
              Beck Holiday Homes
            </Typography>
          )}
        </Stack>

        {/* Navigation Links */}
        <Box component="nav" sx={{ width: "100%", mt: 2 }}>
          <Stack spacing={0.5}>
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                style={({ isActive }) => ({
                  display: "flex",
                  alignItems: "center",
                  gap: (isMobile || drawerOpen) ? 12 : 0,
                  justifyContent: (isMobile || drawerOpen) ? "flex-start" : "center",
                  padding: isMobile ? "10px 16px" : "12px 16px",
                  borderRadius: 2,
                  color: "#fff",
                  textDecoration: "none",
                  backgroundColor: isActive ? theme.palette.primary.main : "transparent",
                  fontWeight: isActive ? 600 : 400,
                  transition: "all 0.2s ease",
                })}
              >
                <Tooltip title={(!isMobile && !drawerOpen) ? item.label : ""} placement="right">
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: (isMobile || drawerOpen) ? "flex-start" : "center",
                    }}
                  >
                    {item.icon}
                    {(isMobile || drawerOpen) && (
                      <Typography
                        variant="body1"
                        sx={{
                          ml: 1,
                          fontSize: isMobile ? '0.875rem' : isTablet ? '0.9rem' : '1rem'
                        }}
                      >
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
      <Box
        flex={1}
        display="flex"
        flexDirection="column"
        sx={{
          marginLeft: isMobile ? 0 : `${drawerWidth}px`,
          transition: 'margin 0.3s ease',
          width: isMobile ? '100%' : `calc(100% - ${drawerWidth}px)`,
        }}
      >
        {/* Top Bar (Fixed) */}
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: isMobile ? 0 : drawerWidth,
            right: 0,
            height: isMobile ? 56 : 64,
            bgcolor: theme.palette.background.paper,
            borderBottom: `1px solid ${theme.palette.divider}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            px: isMobile ? 0 : 2,
            boxShadow: theme.palette.mode === "light"
              ? "0 1px 3px rgba(0,0,0,0.05)"
              : "0 1px 3px rgba(0,0,0,0.3)",
            transition: "left 0.3s ease",
            zIndex: 1100,
          }}
        >
          {/* Menu Icon + Page Title */}
          <Stack direction="row" alignItems="center" spacing={isMobile ? 1 : 2}>
            <IconButton
              onClick={() => setDrawerOpen(!drawerOpen)}
              size={isMobile ? "medium" : "large"}
            >
              <MenuIcon sx={{ color: theme.palette.text.primary }} />
            </IconButton>
            <Typography
              variant={isMobile ? "h6" : "h5"}
              fontWeight={600}
              color={theme.palette.text.primary}
              sx={{
                fontSize: isMobile ? '1.4rem' : isTablet ? '1.25rem' : '1.5rem',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: isMobile ? '150px' : 'none'
              }}
            >
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
            bgcolor: theme.palette.background.default,
            p: isMobile ? 1 : isTablet ? 1 : 0,
            mt: isMobile ? 7 : 8,
            ml: isMobile ? 0 : 0,
            overflowY: "auto",
            overflowX: "hidden",
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}











// import React, { useMemo, useState } from "react";
// import { Outlet, NavLink, useLocation } from "react-router-dom";
// import {
//   Box,
//   Stack,
//   Avatar,
//   Typography,
//   IconButton,
//   Drawer,
//   Tooltip,
//   useTheme,
// } from "@mui/material";
// import { People, TrendingUp, Menu as MenuIcon, Business, Inventory, Task, Assignment } from "@mui/icons-material";
// import ProfileMenu from "./resuable_components/profile_menu.jsx";
// // import AllTask from "./pages/clients/task/AllTask.jsx";

// const getPageTitle = (pathname) => {
//   const path = pathname.split(/[?#]/)[0];
//   if (path.startsWith("/admin")) {
//     if (path.includes("dashboard")) return "Admin Dashboard";
//     if (path.endsWith("/clients") || path.includes("/clients/")) return "Manage Clients";
//     return "Admin";
//   }
//   if (path.startsWith("/clients")) {
//     if (path.includes("dashboard")) return "Client Dashboard";
//     if (path.includes("property")) return "Property Management";
//     if (path.includes("inventory")) return "Inventory Management";
//     if (path.includes("team")) return "Team Management";
//     return "Client Portal";
//   }
//   return "Beck Holiday Homes";
// };

// export default function Layout({ role }) {
//   const theme = useTheme();
//   const location = useLocation();
//   const pageTitle = getPageTitle(location.pathname);
//   const [drawerOpen, setDrawerOpen] = useState(true);

//   const resolvedRole = useMemo(() => {
//     if (role) return role;
//     const p = location.pathname;
//     if (p.startsWith("/admin")) return "admin";
//     if (p.startsWith("/clients")) return "client";
//     return "guest";
//   }, [role, location.pathname]);

//   const basePath = resolvedRole === "admin" ? "/admin" : resolvedRole === "client" ? "/clients" : "";

//   const navItems = useMemo(() => {
//     if (resolvedRole === "admin") {
//       return [
//         { to: `${basePath}/dashboard`, icon: <TrendingUp />, label: "Dashboard" },
//         { to: `${basePath}/clients`, icon: <People />, label: "Clients" },
//       ];
//     }
//     if (resolvedRole === "client") {
//       return [
//         { to: `${basePath}/dashboard`, icon: <TrendingUp />, label: "Dashboard" },
//         { to: `${basePath}/property-management`, icon: <Business />, label: "Properties" },
//         { to: `${basePath}/inventory-management`, icon: <Inventory />, label: "Inventory" },
//         { to: `${basePath}/team-management`, icon: <People />, label: "Team" },
//         //  { to: `${basePath}/task-management`, icon: <Task />, label: "Tasks" },
//         {to: `${basePath}/task-management`, icon: <Assignment />, label: "Tasks" },
//       ];
//     }
//     return [];
//   }, [resolvedRole, basePath]);

//   return (
//     <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: theme.palette.background.default }}>
//       {/* ==================== SIDEBAR ==================== */}
//       <Drawer
//         variant="permanent"
//         open={drawerOpen}
//         sx={{
//           width: drawerOpen ? 260 : 80,
//           flexShrink: 0,
//           "& .MuiDrawer-paper": {
//             width: drawerOpen ? 260 : 80,
//             // bgcolor: theme.palette.primary.dark,
//             // color: "#fff",
//             transition: "width 0.4s ease",
//             overflowX: "hidden",
//             display: "flex",
//             flexDirection: "column",
//             alignItems: drawerOpen ? "flex-start" : "center",
//           },
//         }}
//       >
//         {/* Logo + App Name */}
//         <Stack
//           direction={drawerOpen ? "row" : "column"}
//           alignItems="center"
//           spacing={drawerOpen ? 1 : 0}
//           sx={{
//             p: 2,
//             mt: 1,
//             width: "100%",
//             justifyContent: drawerOpen ? "flex-start" : "center",
//           }}
//         >
//           <Avatar
//             src="/images/logo.png"
//             alt="Beck Holiday Homes"
//             sx={{ width: 45, height: 45, border: "2px solid #fff" }}
//           />
//           {drawerOpen && (
//             <Typography variant="body1" sx={{ fontWeight: 700, whiteSpace: "nowrap" }}>
//               Beck Holiday Homes
//             </Typography>
//           )}
//         </Stack>

//         {/* Navigation Links */}
//         <Box component="nav" sx={{ width: "100%", mt: 2 }}>
//           <Stack spacing={1}>
//             {navItems.map((item) => (
//               <NavLink
//                 key={item.to}
//                 to={item.to}
//                 style={({ isActive }) => ({
//                   display: "flex",
//                   alignItems: "center",
//                   gap: drawerOpen ? 12 : 0,
//                   justifyContent: drawerOpen ? "flex-start" : "center",
//                   padding: "12px 16px",
//                   borderRadius: 2,
//                   color: "#fff",
//                   textDecoration: "none",
//                   backgroundColor: isActive ? theme.palette.primary.main : "transparent",
//                   fontWeight: isActive ? 600 : 400,
//                   transition: "all 0.2s ease",
//                 })}
//               >
//                 <Tooltip title={!drawerOpen ? item.label : ""} placement="right">
//                   <Box
//                     sx={{
//                       display: "flex",
//                       alignItems: "center",
//                       justifyContent: drawerOpen ? "flex-start" : "center",
//                     }}
//                   >
//                     {item.icon}
//                     {drawerOpen && (
//                       <Typography variant="body1" sx={{ ml: 1 }}>
//                         {item.label}
//                       </Typography>
//                     )}
//                   </Box>
//                 </Tooltip>
//               </NavLink>
//             ))}
//           </Stack>
//         </Box>
//       </Drawer>

//       {/* ==================== MAIN CONTENT AREA ==================== */}
//       <Box flex={1} display="flex" flexDirection="column" sx={{ position: "relative" }}>
//         {/* Top Bar (Fixed) */}
//         <Box
//           sx={{
//             position: "fixed",
//             top: 0,
//             left: drawerOpen ? 260 : 80,
//             right: 0,
//             height: 64,
//             bgcolor: theme.palette.background.paper,
//             borderBottom: `1px solid ${theme.palette.divider}`,
//             display: "flex",
//             justifyContent: "space-between",
//             alignItems: "center",
//             boxShadow: theme.palette.mode === "light" 
//               ? "0 1px 3px rgba(0,0,0,0.05)" 
//               : "0 1px 3px rgba(0,0,0,0.3)",
//             transition: "left 0.4s ease, width 0.4s ease",
//             zIndex: 1000,
//           }}
//         >
//           {/* Menu Icon + Page Title */}
//           <Stack direction="row" alignItems="center" spacing={2}>
//             <IconButton onClick={() => setDrawerOpen(!drawerOpen)}>
//               <MenuIcon sx={{ color: theme.palette.text.primary }} />
//             </IconButton>
//             <Typography variant="h5" fontWeight={600} color={theme.palette.text.primary}>
//               {pageTitle}
//             </Typography>
//           </Stack>

//           {/* Profile Menu */}
//           <ProfileMenu />
//         </Box>

//         {/* Page Content (below top bar) */}
//         <Box
//           component="main"
//           sx={{
//             flex: 1,
//             bgcolor: theme.palette.background.default,
//             p: 3,
//             mt: 4,
//             overflowY: "auto",
//           }}
//         >
//           <Outlet />
//         </Box>
//       </Box>
//     </Box>
//   );
// }