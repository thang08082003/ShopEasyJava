import React, { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
// Chart.js
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';

// MUI components
import {
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  CircularProgress,
  Alert
} from '@mui/material';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  ChartTooltip,
  Legend,
  Filler
);

const AdminAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('30days'); // '7days', '30days', '90days', 'year'
  const [analyticsData, setAnalyticsData] = useState({
    salesOverTime: [],
    topProducts: [],
    orderStatusDistribution: [],
    revenue: { total: 0, average: 0, change: 0 }
  });

  // Fetch analytics data based on time range
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setLoading(true);
      try {
        // Calculate date range based on selected timeRange
        let startDate = new Date();
        const endDate = new Date();
        
        switch (timeRange) {
          case '7days':
            startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case '90days':
            startDate = new Date(endDate.getTime() - 90 * 24 * 60 * 60 * 1000);
            break;
          case 'year':
            startDate = new Date(endDate.getFullYear() - 1, endDate.getMonth(), endDate.getDate());
            break;
          case 'month':
            startDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
            break;
          default: // 30days
            startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
        }
        
        // Format dates for API
        const formattedStartDate = startDate.toISOString().split('T')[0];
        const formattedEndDate = endDate.toISOString().split('T')[0];
        
        console.log(`Fetching analytics from ${formattedStartDate} to ${formattedEndDate}`);
        
        // Fetch real data using separate endpoints for different metrics
        const [salesResponse, ordersResponse, productsResponse] = await Promise.all([
          api.get('/api/analytics/sales', {
            params: { startDate: formattedStartDate, endDate: formattedEndDate }
          }),
          api.get('/api/analytics/orders/status'),
          api.get('/api/analytics/products/top', { params: { limit: 5 } })
        ]);
        
        console.log('Sales data:', salesResponse.data);
        console.log('Orders data:', ordersResponse.data);
        console.log('Products data:', productsResponse.data);
        
        // Process and combine the data
        let processedData = {
          salesOverTime: salesResponse.data.data || [],
          orderStatusDistribution: ordersResponse.data.data || [],
          topProducts: productsResponse.data.data || [],
          revenue: {
            total: salesResponse.data.total || 0,
            average: salesResponse.data.average || 0,
            change: salesResponse.data.change || 0
          }
        };
        
        // If any endpoint failed, use mock data for that section only
        if (!processedData.salesOverTime.length) {
          console.log('Using mock sales data');
          const mockData = generateMockData(timeRange);
          processedData.salesOverTime = mockData.salesOverTime;
          processedData.revenue = mockData.revenue;
        }
        
        if (!processedData.orderStatusDistribution.length) {
          console.log('Using mock order status data');
          processedData.orderStatusDistribution = generateMockData(timeRange).orderStatusDistribution;
        }
        
        if (!processedData.topProducts.length) {
          console.log('Using mock top products data');
          processedData.topProducts = generateMockData(timeRange).topProducts;
        }
        
        setAnalyticsData(processedData);
        setError(null);
      } catch (err) {
        console.error('Error fetching analytics data:', err);
        setError(`Failed to load analytics data: ${err.response?.data?.message || err.message}`);
        // Fall back to mock data for development
        setAnalyticsData(generateMockData(timeRange));
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnalyticsData();
  }, [timeRange]);

  // Generate mock data for development/preview
  const generateMockData = (range) => {
    let days = 30;
    switch (range) {
      case '7days': days = 7; break;
      case '90days': days = 90; break;
      case 'year': days = 365; break;
      case 'month': days = 30; break;
      default: days = 30;
    }
    
    // Generate sales data
    const salesData = Array(days).fill().map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (days - i - 1));
      return {
        date: date.toISOString().split('T')[0],
        revenue: Math.floor(Math.random() * 1000) + 500,
        orders: Math.floor(Math.random() * 10) + 1
      };
    });
    
    // Generate top products
    const topProducts = Array(5).fill().map((_, i) => ({
      _id: `product${i+1}`,
      name: `Product ${i+1}`,
      sales: Math.floor(Math.random() * 100) + 50,
      revenue: Math.floor(Math.random() * 5000) + 1000
    }));
    
    // Generate order status data
    const orderStatusDistribution = [
      { status: 'Pending', count: Math.floor(Math.random() * 30) + 10 },
      { status: 'Processing', count: Math.floor(Math.random() * 20) + 5 },
      { status: 'Shipped', count: Math.floor(Math.random() * 40) + 20 },
      { status: 'Delivered', count: Math.floor(Math.random() * 100) + 50 },
      { status: 'Cancelled', count: Math.floor(Math.random() * 10) + 1 }
    ];
    
    // Calculate totals
    const totalRevenue = salesData.reduce((sum, item) => sum + item.revenue, 0);
    
    return {
      salesOverTime: salesData,
      topProducts,
      orderStatusDistribution,
      revenue: {
        total: totalRevenue,
        average: totalRevenue / days,
        change: Math.floor(Math.random() * 30) - 10 // percentage change
      }
    };
  };

  // Sales over time chart data
  const salesChartData = {
    labels: analyticsData.salesOverTime.map(item => item.date),
    datasets: [
      {
        label: 'Revenue',
        data: analyticsData.salesOverTime.map(item => item.revenue),
        borderColor: '#2196f3',
        backgroundColor: 'rgba(33, 150, 243, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Orders',
        data: analyticsData.salesOverTime.map(item => item.orders),
        borderColor: '#ff9800',
        backgroundColor: 'transparent',
        tension: 0.4,
        yAxisID: 'y1'
      }
    ]
  };

  // Top products chart data
  const topProductsChartData = {
    labels: analyticsData.topProducts.map(product => product.name),
    datasets: [{
      label: 'Sales',
      data: analyticsData.topProducts.map(product => product.sales),
      backgroundColor: [
        '#4caf50', '#2196f3', '#ff9800', '#9c27b0', '#e91e63'
      ],
      borderWidth: 1
    }]
  };

  // Order status chart data
  const orderStatusChartData = {
    labels: analyticsData.orderStatusDistribution.map(item => item.status),
    datasets: [{
      data: analyticsData.orderStatusDistribution.map(item => item.count),
      backgroundColor: [
        '#ff9800', // pending
        '#2196f3', // processing
        '#9c27b0', // shipped
        '#4caf50', // delivered
        '#f44336'  // cancelled
      ],
      borderWidth: 1
    }]
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Analytics Dashboard
        </Typography>
        
        <FormControl size="small" sx={{ width: 150 }}>
          <InputLabel id="time-range-label">Time Range</InputLabel>
          <Select
            labelId="time-range-label"
            id="time-range"
            value={timeRange}
            label="Time Range"
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <MenuItem value="7days">Last 7 Days</MenuItem>
            <MenuItem value="30days">Last 30 Days</MenuItem>
            <MenuItem value="90days">Last 90 Days</MenuItem>
            <MenuItem value="month">This Month</MenuItem>
            <MenuItem value="year">This Year</MenuItem>
          </Select>
        </FormControl>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Key metrics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: 'primary.light', color: 'primary.contrastText' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Total Revenue</Typography>
              <Typography variant="h4">${analyticsData.revenue.total.toLocaleString()}</Typography>
              <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                {analyticsData.revenue.change >= 0 ? '↑' : '↓'} 
                {Math.abs(analyticsData.revenue.change)}% from previous period
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Average Daily Revenue</Typography>
              <Typography variant="h4">
                ${Math.round(analyticsData.revenue.average).toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Per day over selected period
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Total Orders</Typography>
              <Typography variant="h4">
                {analyticsData.salesOverTime.reduce((sum, day) => sum + day.orders, 0)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Orders over selected period
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Charts */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Revenue & Orders Trend</Typography>
            <Box sx={{ height: 350 }}>
              <Line 
                data={salesChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: 'Revenue ($)'
                      }
                    },
                    y1: {
                      position: 'right',
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: 'Orders'
                      },
                      grid: {
                        drawOnChartArea: false
                      }
                    }
                  }
                }}
              />
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>Top Products</Typography>
            <Box sx={{ height: 300 }}>
              <Bar 
                data={topProductsChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  indexAxis: 'y',
                  scales: {
                    x: {
                      beginAtZero: true
                    }
                  }
                }}
              />
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>Order Status Distribution</Typography>
            <Box sx={{ height: 300, display: 'flex', justifyContent: 'center' }}>
              <Pie 
                data={orderStatusChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom'
                    }
                  }
                }}
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminAnalytics;
