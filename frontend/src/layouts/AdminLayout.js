import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/slices/authSlice';

// MUI components
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  CssBaseline,
  useTheme,
  useMediaQuery,
  Tooltip,
  Container
} from '@mui/material';

// MUI icons
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Category as CategoryIcon,
  ListAlt as OrdersIcon,
  ShoppingBag as ProductsIcon,
  AccountCircle,
  Logout as LogoutIcon,
  ShoppingBag,
  LocalOffer as CouponIcon
} from '@mui/icons-material';

// Drawer width - responsive
const drawerWidth = {
  xs: '100%',
  sm: 240
};

const AdminLayout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  
  const { user } = useSelector(state => state.auth);
  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  
  // Menu items - add the Coupons entry
  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin' },
    { text: 'Products', icon: <ProductsIcon />, path: '/admin/products' },
    { text: 'Categories', icon: <CategoryIcon />, path: '/admin/categories' },
    { text: 'Orders', icon: <OrdersIcon />, path: '/admin/orders' },
    { text: 'Coupons', icon: <CouponIcon />, path: '/admin/coupons' }
  ];
  
  const handleDrawerToggle = () => {
    setOpen(!open);
  };
  
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };
  
  const handleNavigate = (path) => {
    navigate(path);
    
    setOpen(false);
  };
  
  // Check if menu item is active
  const isActive = (path) => {
    if (path === '/admin') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };
  
  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 2, 
          backgroundColor: 'background.paper',
          color: 'text.primary',
          width: '100%', // Always full width
          transition: (theme) => theme.transitions.create('width'),
        }}
        elevation={1}
      >
        <Toolbar sx={{ 
          pr: isMobile ? 1 : 2,
        }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ 
              
              ml: isMobile ? 1 : 0 
            }}
          >
            <MenuIcon />
          </IconButton>
          
          {/* Logo with ShopEasy Admin text */}
          <Box 
            component="div" 
            sx={{ 
              display: 'flex',
              alignItems: 'center',
              flexGrow: 1, 
              cursor: 'pointer'
            }}
            onClick={() => navigate('/')}
          >
            <Box
              component="img"
              src="/Untitled-1-01.png"
              alt="ShopEasy Logo"
              sx={{ 
                height: isMobile ? 40 : 60,
                maxHeight: '100%',
                width: 'auto'
              }}
            />
            <Typography variant={isMobile ? "subtitle1" : "h6"} noWrap sx={{ ml: 1 }}>
              {isMobile ? "Admin" : "ShopEasy Admin"}
            </Typography>
          </Box>
          
          <Tooltip title="View Store">
            <IconButton
              color="inherit"
              edge="end"
              onClick={() => navigate('/')}
              sx={{ mr: isMobile ? 1 : 2 }}
            >
              <ShoppingBag fontSize={isMobile ? "small" : "medium"} />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Account">
            <IconButton
              onClick={handleMenuOpen}
              color="inherit"
              edge="end"
              aria-label="account"
              sx={{ 
                mr: isMobile ? 1 : 0 
              }}
            >
              {user?.name ? (
                <Avatar sx={{ width: isMobile ? 24 : 32, height: isMobile ? 24 : 32, bgcolor: 'primary.main' }}>
                  {user.name.charAt(0).toUpperCase()}
                </Avatar>
              ) : (
                <AccountCircle fontSize={isMobile ? "small" : "medium"} />
              )}
            </IconButton>
          </Tooltip>
          
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            onClick={handleMenuClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem onClick={() => navigate('/profile')}>Profile</MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      
      {/* Overlay that appears when drawer is open */}
      {open && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent gray overlay
            zIndex: (theme) => theme.zIndex.drawer,
            display: { xs: 'none', md: 'block' }, // Only show on larger screens
          }}
          onClick={handleDrawerToggle}
        />
      )}
      
      {/* Drawer */}
      <Drawer
        variant={isMobile ? "temporary" : "temporary"} // Changed to temporary for all devices
        open={open}
        onClose={handleDrawerToggle}
        sx={{
          width: isMobile ? '80%' : drawerWidth.sm,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: isMobile ? '80%' : drawerWidth.sm,
            boxSizing: 'border-box',
            top: '64px', // Positioned below the AppBar
            height: 'calc(100% - 64px)', // Adjust height to account for AppBar
            [theme.breakpoints.down('sm')]: {
              top: '56px', // Mobile AppBar is shorter
              height: 'calc(100% - 56px)'
            },
            zIndex: (theme) => theme.zIndex.drawer + 1, // Higher z-index to overlay content
          },
        }}
      >
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {menuItems.map((item) => (
              <ListItem
                button
                key={item.text}
                onClick={() => handleNavigate(item.path)}
                selected={isActive(item.path)}
                sx={{
                  py: isMobile ? 1.5 : 1,
                  '&.Mui-selected': {
                    backgroundColor: 'primary.light',
                    '&:hover': {
                      backgroundColor: 'primary.light',
                    },
                    borderRight: '3px solid',
                    borderColor: 'primary.main'
                  }
                }}
              >
                <ListItemIcon sx={{ 
                  color: isActive(item.path) ? 'primary.main' : 'inherit',
                  minWidth: isMobile ? 40 : 56
                }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  primaryTypographyProps={{
                    fontWeight: isActive(item.path) ? 'bold' : 'regular',
                    fontSize: isMobile ? '0.9rem' : 'inherit'
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
      
      {/* Main Content */}
      <Box component="main" sx={{ 
        flexGrow: 1, 
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center', // Center horizontally
      }}>
        <Toolbar /> {/* Keep this spacer for the AppBar */}
        <Container 
          maxWidth="xl" 
          sx={{ 
            mt: isMobile ? 2 : 3,
            px: isMobile ? 1 : 3,
            width: '100%',
            // Center the container contents
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Box
            sx={{
              width: '100%',
              maxWidth: '1200px', // Set a maximum width for the content
              p: isMobile ? 2 : 3,
            }}
          >
            <Outlet />
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default AdminLayout;
