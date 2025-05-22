import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Box,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Description as DescriptionIcon,
  AccountCircle as AccountCircleIcon
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';

const Navigation: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [mobileMenuAnchor, setMobileMenuAnchor] = React.useState<null | HTMLElement>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMobileMenuAnchor(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuAnchor(null);
  };

  const handleLogout = () => {
    logout();
    handleMobileMenuClose();
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Notification System
        </Typography>

        {isMobile ? (
          <>
            <IconButton
              edge="end"
              color="inherit"
              aria-label="menu"
              onClick={handleMobileMenuOpen}
            >
              <MenuIcon />
            </IconButton>
            <Menu
              anchorEl={mobileMenuAnchor}
              open={Boolean(mobileMenuAnchor)}
              onClose={handleMobileMenuClose}
            >
              {isAuthenticated && user?.role === 'ADMIN' && (
                <>
                  <MenuItem
                    component={RouterLink}
                    to="/admin/notifications"
                    onClick={handleMobileMenuClose}
                  >
                    <DashboardIcon sx={{ mr: 1 }} />
                    Dashboard
                  </MenuItem>
                  <MenuItem
                    component={RouterLink}
                    to="/admin/users"
                    onClick={handleMobileMenuClose}
                  >
                    <PeopleIcon sx={{ mr: 1 }} />
                    Users
                  </MenuItem>
                  <MenuItem
                    component={RouterLink}
                    to="/admin/templates"
                    onClick={handleMobileMenuClose}
                  >
                    <DescriptionIcon sx={{ mr: 1 }} />
                    Templates
                  </MenuItem>
                </>
              )}
              {isAuthenticated ? (
                <MenuItem onClick={handleLogout}>
                  <AccountCircleIcon sx={{ mr: 1 }} />
                  Logout
                </MenuItem>
              ) : (
                <>
                  <MenuItem
                    component={RouterLink}
                    to="/login"
                    onClick={handleMobileMenuClose}
                  >
                    Login
                  </MenuItem>
                  <MenuItem
                    component={RouterLink}
                    to="/register"
                    onClick={handleMobileMenuClose}
                  >
                    Register
                  </MenuItem>
                </>
              )}
            </Menu>
          </>
        ) : (
          <Box>
            {isAuthenticated && user?.role === 'ADMIN' && (
              <>
                <Button
                  color="inherit"
                  component={RouterLink}
                  to="/admin/notifications"
                  startIcon={<DashboardIcon />}
                  sx={{ mr: 2 }}
                >
                  Dashboard
                </Button>
                <Button
                  color="inherit"
                  component={RouterLink}
                  to="/admin/users"
                  startIcon={<PeopleIcon />}
                  sx={{ mr: 2 }}
                >
                  Users
                </Button>
                <Button
                  color="inherit"
                  component={RouterLink}
                  to="/admin/templates"
                  startIcon={<DescriptionIcon />}
                  sx={{ mr: 2 }}
                >
                  Templates
                </Button>
              </>
            )}
            {isAuthenticated ? (
              <Button
                color="inherit"
                onClick={logout}
                startIcon={<AccountCircleIcon />}
              >
                Logout
              </Button>
            ) : (
              <>
                <Button
                  color="inherit"
                  component={RouterLink}
                  to="/login"
                  sx={{ mr: 2 }}
                >
                  Login
                </Button>
                <Button
                  color="inherit"
                  component={RouterLink}
                  to="/register"
                >
                  Register
                </Button>
              </>
            )}
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navigation; 