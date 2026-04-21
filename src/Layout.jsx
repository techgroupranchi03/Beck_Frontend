import React, { useMemo, useState, useEffect } from "react";
import { Outlet, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Stack,
  Avatar,
  Typography,
  IconButton,
  Drawer,
  Tooltip,
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  useTheme,
  useMediaQuery,

} from "@mui/material";
import { People, TrendingUp, Menu as MenuIcon, Business, Inventory, Assignment, Add, GroupWork, Home, Search, SearchOff } from "@mui/icons-material";
import ProfileMenu from "./resuable_components/profile_menu.jsx";
import { useAuth } from "./context/AuthContext.jsx";
import { useThemeMode } from "./context/ThemeContext.jsx";
import { TopBarProvider, useTopBar } from "./context/TopBarContext.jsx";
import PWAInstallPrompt from "./resuable_components/PWAInstallPrompt.jsx";
import Loader from "./resuable_components/Loader.jsx";

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
    if (path.includes("settings")) return "Settings";
    return "Client Portal";
  }
  if (path.startsWith("/teams")) {
    if (path.includes("dashboard")) return "Team Dashboard";
    if (path.includes("property")) return "Property Management";
    if (path.includes("inventory")) return "Inventory Management";
    if (path.includes("team")) return "Team Management";
    if (path.includes("task")) return "Task Management";
    return "Team Portal";
  }
  return "TaskBnb";
};

export default function Layout({ role }) {
  const theme = useTheme();
  const location = useLocation();
  const { user } = useAuth();
  const { syncUserTheme } = useThemeMode();
  const navigate = useNavigate();
  const pageTitle = getPageTitle(location.pathname);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  // const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // sync user theme form profile
  useEffect(() => {
    if (user?.theme) {
      syncUserTheme(user.theme);
    }
  }, [user, syncUserTheme]);


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
        hasPermission("inventory") && {
          to: `${basePath}/inventory-management`,
          icon: <Inventory />,
          label: "Inventory",
        },
        hasPermission("team") && {
          to: `${basePath}/team-management`,
          icon: <People />,
          label: "Team",
        },
        hasPermission("task") && {
          to: `${basePath}/task-management`,
          icon: <Assignment />,
          label: "Tasks",
        },
      ].filter(Boolean);
    }

    return [];
  }, [resolvedRole, basePath]);

  // SpeedDial quick-add actions based on role AND current page
  const speedDialActions = useMemo(() => {
    if (resolvedRole === "admin") return [];

    const hasCreatePermission = (module) => {
      if (!user?.permissions || !Object.prototype.hasOwnProperty.call(user.permissions, module)) {
        return false;
      }
      return user.permissions[module].create;
    };

    const path = location.pathname;
    const actions = [];

    if (resolvedRole === "client") {
      if (path.includes("property-management")) {
        actions.push({ icon: <Home />, name: "Add Property", stateKey: "openAdd" });
      } else if (path.includes("inventory-management")) {
        actions.push({ icon: <Inventory />, name: "Add Inventory", stateKey: "openAdd" });
      } else if (path.includes("team-management")) {
        actions.push({ icon: <People />, name: "Add Team Member", stateKey: "openAdd" });
      } else if (path.includes("task-management")) {
        actions.push(
          { icon: <Assignment sx={{ color: theme.palette.primary.main }} />, name: "Create Task", stateKey: "openAdd" },
          { icon: <GroupWork sx={{ color: theme.palette.primary.main }} />, name: "Create Group Task", stateKey: "openAddGroupTask" },
        );
      }
    }

    if (resolvedRole === "team") {
      if (path.includes("property-management") && hasCreatePermission("property")) {
        actions.push({ icon: <Home />, name: "Add Property", stateKey: "openAdd" });
      } else if (path.includes("inventory-management") && hasCreatePermission("inventory")) {
        actions.push({ icon: <Inventory />, name: "Add Inventory", stateKey: "openAdd" });
      } else if (path.includes("team-management") && hasCreatePermission("team")) {
        actions.push({ icon: <People />, name: "Add Team Member", stateKey: "openAdd" });
      } else if (path.includes("task-management") && hasCreatePermission("task")) {
        actions.push(
          { icon: <Assignment sx={{ color: theme.palette.primary.main }} />, name: "Create Task", stateKey: "openAdd" },
          { icon: <GroupWork sx={{ color: theme.palette.primary.main }} />, name: "Create Group Task", stateKey: "openAddGroupTask" },
        );
      }
    }

    return actions;
  }, [resolvedRole, basePath, user, location.pathname]);

  const drawerWidth = useMemo(() => {
    if (isMobile) return 260;
    return drawerOpen ? 260 : 80;
  }, [isMobile, drawerOpen]);

  const drawerVariant = "permanent";

  // Find active nav index for bottom navigation
  const activeNavIndex = useMemo(() => {
    const idx = navItems.findIndex((item) => location.pathname.startsWith(item.to));
    return idx >= 0 ? idx : 0;
  }, [navItems, location.pathname]);

  return (
    <TopBarProvider>
      <LayoutInner
        theme={theme}
        location={location}
        user={user}
        navigate={navigate}
        pageTitle={pageTitle}
        isMobile={isMobile}
        isDesktop={isDesktop}
        drawerOpen={drawerOpen}
        setDrawerOpen={setDrawerOpen}
        resolvedRole={resolvedRole}
        basePath={basePath}
        navItems={navItems}
        speedDialActions={speedDialActions}
        drawerWidth={drawerWidth}
        drawerVariant={drawerVariant}
        activeNavIndex={activeNavIndex}
      />
    </TopBarProvider>
  );
}

function LayoutInner({
  theme, location, user, navigate, pageTitle, isMobile, isDesktop,
  drawerOpen, setDrawerOpen, resolvedRole, basePath, navItems,
  speedDialActions, drawerWidth, drawerVariant, activeNavIndex,
}) {
  const { actions: topBarActions } = useTopBar();

  return (
    <Box sx={{ bgcolor: theme.palette.background.default }}>
      {/* Desktop Sidebar Drawer - hidden on mobile */}
      {!isMobile && (
        <Drawer
          variant={drawerVariant}
          open={drawerOpen}
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              transition: "width 0.3s ease",
              overflowX: "hidden",
              display: "flex",
              flexDirection: "column",
              alignItems: (isDesktop && drawerOpen) ? "flex-start" : "center",
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
              src="/images/new_logo.gif"
              alt="TaskBnb Logo"
              sx={{
                width: 60,
                height: 60,
                '& img': {
                  objectFit: 'cover',
                  width: '100%',
                  height: '100%',
                }
              }}
            />
            {drawerOpen && (
              <Stack>
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: 700,
                    whiteSpace: "nowrap",
                    fontSize: '1rem'
                  }}
                >
                  TaskBnb
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    whiteSpace: "nowrap",
                    fontSize: '0.875rem',
                  }}
                >
                  Property Management
                </Typography>
              </Stack>
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
                    gap: drawerOpen ? 12 : 0,
                    justifyContent: drawerOpen ? "flex-start" : "center",
                    padding: "12px 16px",
                    borderRadius: 2,
                    color: "#fff",
                    textDecoration: "none",
                    backgroundColor: isActive ? theme.palette.primary.main : "transparent",
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
                        <Typography
                          variant="body1"
                          sx={{ ml: 1, fontSize: '1rem' }}
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
      )}

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
            px: isMobile ? 1.5 : 3,
            boxShadow: theme.palette.mode === "light"
              ? "0 2px 8px rgba(0,0,0,0.08)"
              : "0 2px 8px rgba(0,0,0,0.4)",
            backdropFilter: "blur(8px)",
            background: theme.palette.mode === "light"
              ? `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`
              : `linear-gradient(135deg, ${theme.palette.background.paper} 0%, rgba(26,26,26,0.95) 100%)`,
            transition: "all 0.3s ease",
            zIndex: 1100,
          }}
        >
          {/* Menu Icon + Page Title */}
          <Stack direction="row" alignItems="center" spacing={isMobile ? 1 : 2}>
            {!isMobile && (
              <IconButton
                onClick={() => setDrawerOpen(!drawerOpen)}
                size="large"
              >
                <MenuIcon sx={{ color: theme.palette.text.primary }} />
              </IconButton>
            )}
            <Box>
              <Typography
                variant={isMobile ? "h6" : "h5"}
                fontWeight={700}
                sx={{
                  fontSize: isMobile ? '1.1rem' : '1.5rem',
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: isMobile ? '150px' : 'none',
                }}
              >
                {pageTitle}
              </Typography>
              {!isMobile && (
                <Typography
                  variant="caption"
                  sx={{
                    color: theme.palette.text.secondary,
                    fontSize: '0.75rem',
                    fontWeight: 500,
                  }}
                >
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </Typography>
              )}
            </Box>
          </Stack>

          {/* Profile Menu + Mobile Search */}
          <Stack direction="row" alignItems="center" spacing={0.5}>
            {isMobile && topBarActions?.onSearchToggle && (
              <IconButton
                onClick={topBarActions.onSearchToggle}
                size="small"
                sx={{
                  color: topBarActions.isSearchActive
                    ? theme.palette.primary.main
                    : theme.palette.text.primary,
                }}
              >
                {topBarActions.isSearchActive ? <SearchOff /> : <Search />}
              </IconButton>
            )}
            <ProfileMenu />
          </Stack>
        </Box>

        {/* Page Content (below top bar) */}
        <Box
          component="main"
          sx={{
            flex: 1,
            bgcolor: theme.palette.background.default,
            p: isMobile ? 1 : 0,
            mt: isMobile ? 7 : 8,
            mb: isMobile ? '64px' : 0,
            overflowY: "auto",
            overflowX: "hidden",
          }}
        >
          <React.Suspense fallback={<Loader />}>
            <Outlet />
          </React.Suspense>
        </Box>

      </Box>

      {/* Mobile SpeedDial FAB for quick-add actions */}
      {isMobile && speedDialActions.length > 0 && (
        speedDialActions.length === 1 ? (
          <Box
            sx={{
              position: 'fixed',
              bottom: 80,
              right: 20,
              zIndex: 1201,
            }}
          >
            <IconButton
              onClick={() => navigate(location.pathname, { state: { [speedDialActions[0].stateKey]: Date.now() }, replace: true })}
              sx={{
                width: 52,
                height: 52,
                bgcolor: theme.palette.primary.main,
                color: '#fff',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                '&:hover': {
                  bgcolor: theme.palette.primary.dark,
                },
              }}
            >
              <Add />
            </IconButton>
          </Box>
        ) : (
          <SpeedDial
            ariaLabel="Quick actions"
            sx={{
              position: 'fixed',
              bottom: 80,
              right: 20,
              zIndex: 1201,
              '& .MuiFab-primary': {
                bgcolor: theme.palette.primary.main,
                color: '#fff',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                '&:hover': {
                  bgcolor: theme.palette.primary.dark,
                },
                width: 52,
                height: 52,
              },
            }}
            icon={<SpeedDialIcon openIcon={<Add />} />}
          >
            {speedDialActions.map((action) => (
              <SpeedDialAction
                key={action.name}
                icon={action.icon}
                tooltipTitle={action.name}
                tooltipOpen
                onClick={() => navigate(location.pathname, { state: { [action.stateKey]: Date.now() }, replace: true })}
                sx={{
                  '& .MuiSpeedDialAction-staticTooltipLabel': {
                    whiteSpace: 'nowrap',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    bgcolor: theme.palette.primary.main,
                    color: '#fff',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  },
                }}
              />
            ))}
          </SpeedDial>
        )
      )}

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <Paper
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1200,
            borderTop: `1px solid ${theme.palette.divider}`,
          }}
          elevation={8}
        >
          <BottomNavigation
            value={activeNavIndex}
            showLabels
            sx={{
              bgcolor: theme.palette.background.paper,
              height: 64,
              '& .MuiBottomNavigationAction-root': {
                minWidth: 'auto',
                px: 0.5,
                color: theme.palette.text.secondary,
                '&.Mui-selected': {
                  color: theme.palette.primary.main,
                },
              },
              '& .MuiBottomNavigationAction-label': {
                fontSize: '0.65rem',
                '&.Mui-selected': {
                  fontSize: '0.7rem',
                  fontWeight: 600,
                },
              },
            }}
          >
            {navItems.map((item) => (
              <BottomNavigationAction
                key={item.to}
                label={item.label}
                icon={item.icon}
                component={NavLink}
                to={item.to}
              />
            ))}
          </BottomNavigation>
        </Paper>
      )}

      {/* PWA Install Prompt Banner */}
      <PWAInstallPrompt />

    </Box>
  );
}
