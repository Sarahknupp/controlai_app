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

const Navegacao: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [ancoraMenuMobile, setAncoraMenuMobile] = React.useState<null | HTMLElement>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleAbrirMenuMobile = (event: React.MouseEvent<HTMLElement>) => {
    setAncoraMenuMobile(event.currentTarget);
  };

  const handleFecharMenuMobile = () => {
    setAncoraMenuMobile(null);
  };

  const handleLogout = () => {
    logout();
    handleFecharMenuMobile();
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Sistema de Notificações
        </Typography>

        {isMobile ? (
          <>
            <IconButton
              edge="end"
              color="inherit"
              aria-label="menu"
              onClick={handleAbrirMenuMobile}
            >
              <MenuIcon />
            </IconButton>
            <Menu
              anchorEl={ancoraMenuMobile}
              open={Boolean(ancoraMenuMobile)}
              onClose={handleFecharMenuMobile}
            >
              {isAuthenticated && user?.role === 'ADMIN' && (
                <>
                  <MenuItem
                    component={RouterLink}
                    to="/admin/notifications"
                    onClick={handleFecharMenuMobile}
                  >
                    <DashboardIcon sx={{ mr: 1 }} />
                    Painel
                  </MenuItem>
                  <MenuItem
                    component={RouterLink}
                    to="/admin/users"
                    onClick={handleFecharMenuMobile}
                  >
                    <PeopleIcon sx={{ mr: 1 }} />
                    Usuários
                  </MenuItem>
                  <MenuItem
                    component={RouterLink}
                    to="/admin/templates"
                    onClick={handleFecharMenuMobile}
                  >
                    <DescriptionIcon sx={{ mr: 1 }} />
                    Templates
                  </MenuItem>
                </>
              )}
              {isAuthenticated ? (
                <MenuItem onClick={handleLogout}>
                  <AccountCircleIcon sx={{ mr: 1 }} />
                  Sair
                </MenuItem>
              ) : (
                <>
                  <MenuItem
                    component={RouterLink}
                    to="/login"
                    onClick={handleFecharMenuMobile}
                  >
                    Entrar
                  </MenuItem>
                  <MenuItem
                    component={RouterLink}
                    to="/register"
                    onClick={handleFecharMenuMobile}
                  >
                    Cadastrar
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
                  Painel
                </Button>
                <Button
                  color="inherit"
                  component={RouterLink}
                  to="/admin/users"
                  startIcon={<PeopleIcon />}
                  sx={{ mr: 2 }}
                >
                  Usuários
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
                Sair
              </Button>
            ) : (
              <>
                <Button
                  color="inherit"
                  component={RouterLink}
                  to="/login"
                  sx={{ mr: 2 }}
                >
                  Entrar
                </Button>
                <Button
                  color="inherit"
                  component={RouterLink}
                  to="/register"
                >
                  Cadastrar
                </Button>
              </>
            )}
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navegacao; 