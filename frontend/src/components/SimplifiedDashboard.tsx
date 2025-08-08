import React from 'react';
import { Box, Typography, Grid, Card, CardActionArea, CardContent } from '@mui/material';
import { Dashboard as DashboardIcon, People as PeopleIcon, Description as DescriptionIcon } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';

/**
 * Simplified dashboard with quick access cards to main admin sections.
 * Designed for users with basic computer skills.
 */
const SimplifiedDashboard: React.FC = () => {
  const cards = [
    { icon: <DashboardIcon fontSize="large" />, label: 'Notificações', to: '/admin/notifications' },
    { icon: <PeopleIcon fontSize="large" />, label: 'Usuários', to: '/admin/users' },
    { icon: <DescriptionIcon fontSize="large" />, label: 'Templates', to: '/admin/templates' }
  ];

  return (
    <Box p={3} textAlign="center">
      <Typography variant="h4" gutterBottom>
        Painel Simplificado
      </Typography>
      <Grid container spacing={3} justifyContent="center">
        {cards.map(({ icon, label, to }) => (
          <Grid item xs={12} sm={6} md={4} key={label}>
            <Card>
              <CardActionArea component={RouterLink} to={to}>
                <CardContent>
                  <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" p={2}>
                    {icon}
                    <Typography variant="h6" mt={1}>
                      {label}
                    </Typography>
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default SimplifiedDashboard;
