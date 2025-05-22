import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  Box,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Snackbar,
  Button,
  Menu,
  MenuItem
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  FileDownload as FileDownloadIcon,
  MoreVert as MoreVertIcon
} from '@mui/icons-material';
import wsService from '../services/websocket.service';
import exportService from '../services/export.service';

interface NotificationMetrics {
  totalSent: number;
  totalFailed: number;
  failureRate: number;
  averageRetryAttempts: number;
  failuresByType: Record<string, number>;
  failuresByError: Record<string, number>;
  hourlyFailureRate: {
    hour: string;
    rate: number;
  }[];
  recentFailures: {
    id: string;
    type: string;
    error: string;
    timestamp: string;
    attempts: number;
  }[];
}

interface FailureTrends {
  daily: { date: string; rate: number }[];
  weekly: { week: string; rate: number }[];
  monthly: { month: string; rate: number }[];
}

interface AlertResponse {
  alerts: string[];
  metrics: NotificationMetrics;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const NotificationDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<NotificationMetrics | null>(null);
  const [trends, setTrends] = useState<FailureTrends | null>(null);
  const [alerts, setAlerts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [wsError, setWsError] = useState<string | null>(null);
  const [exportMenuAnchor, setExportMenuAnchor] = useState<null | HTMLElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [metricsRes, trendsRes, alertsRes] = await Promise.all([
          fetch('/api/notification-metrics'),
          fetch('/api/notification-metrics/trends'),
          fetch('/api/notification-metrics/check-alerts')
        ]);

        if (!metricsRes.ok || !trendsRes.ok || !alertsRes.ok) {
          throw new Error('Failed to fetch dashboard data');
        }

        const [metricsData, trendsData, alertsData] = await Promise.all([
          metricsRes.json(),
          trendsRes.json(),
          alertsRes.json()
        ]);

        setMetrics(metricsData);
        setTrends(trendsData);
        setAlerts(alertsData.alerts);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Set up WebSocket connection
    wsService.connect();

    // Subscribe to WebSocket messages
    const subscription = wsService.messages$.subscribe((message) => {
      switch (message.type) {
        case 'metrics':
          setMetrics((prevMetrics) => ({
            ...prevMetrics,
            ...message.data
          }));
          break;
        case 'alert':
          setAlerts((prevAlerts) => [...prevAlerts, message.data]);
          break;
        case 'error':
          setWsError(message.data);
          break;
      }
    });

    // Cleanup function
    return () => {
      subscription.unsubscribe();
      wsService.disconnect();
    };
  }, []);

  const handleExportClick = (event: React.MouseEvent<HTMLElement>) => {
    setExportMenuAnchor(event.currentTarget);
  };

  const handleExportClose = () => {
    setExportMenuAnchor(null);
  };

  const handleExport = (type: 'metrics' | 'trends' | 'failures', format: 'json' | 'csv') => {
    try {
      switch (type) {
        case 'metrics':
          if (metrics) exportService.exportMetrics(metrics, format);
          break;
        case 'trends':
          if (trends) exportService.exportTrends(trends, format);
          break;
        case 'failures':
          if (metrics?.recentFailures) exportService.exportFailures(metrics.recentFailures, format);
          break;
      }
    } catch (error) {
      setError('Failed to export data');
    }
    handleExportClose();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!metrics || !trends) {
    return <Alert severity="warning">No data available</Alert>;
  }

  const failureTypeData = Object.entries(metrics.failuresByType).map(([type, count]) => ({
    name: type,
    value: count
  }));

  const failureErrorData = Object.entries(metrics.failuresByError).map(([error, count]) => ({
    name: error,
    value: count
  }));

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          Notification Dashboard
        </Typography>
        <Button
          variant="contained"
          startIcon={<FileDownloadIcon />}
          onClick={handleExportClick}
        >
          Export
        </Button>
        <Menu
          anchorEl={exportMenuAnchor}
          open={Boolean(exportMenuAnchor)}
          onClose={handleExportClose}
        >
          <MenuItem onClick={() => handleExport('metrics', 'json')}>
            Export Metrics (JSON)
          </MenuItem>
          <MenuItem onClick={() => handleExport('metrics', 'csv')}>
            Export Metrics (CSV)
          </MenuItem>
          <MenuItem onClick={() => handleExport('trends', 'json')}>
            Export Trends (JSON)
          </MenuItem>
          <MenuItem onClick={() => handleExport('trends', 'csv')}>
            Export Trends (CSV)
          </MenuItem>
          <MenuItem onClick={() => handleExport('failures', 'json')}>
            Export Failures (JSON)
          </MenuItem>
          <MenuItem onClick={() => handleExport('failures', 'csv')}>
            Export Failures (CSV)
          </MenuItem>
        </Menu>
      </Box>

      {alerts.length > 0 && (
        <Box mb={3}>
          {alerts.map((alert, index) => (
            <Alert key={index} severity="warning" sx={{ mb: 1 }}>
              {alert}
            </Alert>
          ))}
        </Box>
      )}

      <Grid container spacing={3}>
        {/* Summary Cards */}
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Sent
              </Typography>
              <Typography variant="h4">{metrics.totalSent}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Failed Notifications
              </Typography>
              <Typography variant="h4" color="error">
                {metrics.totalFailed}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Failure Rate
              </Typography>
              <Typography variant="h4" color="error">
                {(metrics.failureRate * 100).toFixed(1)}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Avg. Retry Attempts
              </Typography>
              <Typography variant="h4">
                {metrics.averageRetryAttempts.toFixed(1)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Charts */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Failure Trends
              </Typography>
              <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
                <Tab label="Daily" />
                <Tab label="Weekly" />
                <Tab label="Monthly" />
              </Tabs>
              <Box height={400} mt={2}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={
                      activeTab === 0
                        ? trends.daily
                        : activeTab === 1
                        ? trends.weekly
                        : trends.monthly
                    }
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey={activeTab === 0 ? 'date' : activeTab === 1 ? 'week' : 'month'}
                    />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="rate"
                      stroke="#8884d8"
                      name="Failure Rate"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Distribution Charts */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Failures by Type
              </Typography>
              <Box height={300}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={failureTypeData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label
                    >
                      {failureTypeData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Failures by Error
              </Typography>
              <Box height={300}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={failureErrorData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label
                    >
                      {failureErrorData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Failures Table */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Failures
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Error</TableCell>
                      <TableCell>Timestamp</TableCell>
                      <TableCell>Attempts</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {metrics.recentFailures.map((failure) => (
                      <TableRow key={failure.id}>
                        <TableCell>{failure.id}</TableCell>
                        <TableCell>{failure.type}</TableCell>
                        <TableCell>{failure.error}</TableCell>
                        <TableCell>
                          {new Date(failure.timestamp).toLocaleString()}
                        </TableCell>
                        <TableCell>{failure.attempts}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Snackbar
        open={!!wsError}
        autoHideDuration={6000}
        onClose={() => setWsError(null)}
        message={wsError}
      />
    </Box>
  );
};

export default NotificationDashboard; 