import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';

// MUI Components
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Badge,
  MenuItem,
  Menu,
  Container,
  Avatar,
  Button,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  useMediaQuery,
  useTheme,
  InputBase,
  alpha
} from '@mui/material';

// MUI Icons
import {
  Menu as MenuIcon,
  AccountCircle,
  Mail as MailIcon,
  ShoppingCart as ShoppingCartIcon,
  Favorite as FavoriteIcon,
  Home as HomeIcon,
  Category as CategoryIcon,
  Store as StoreIcon,
  Dashboard as DashboardIcon
} from '@mui/icons-material';

// Components
import Footer from '../components/Footer';

// Custom Styles
const searchStyles = (theme) => ({
  position: 'relative',
  borderRadius: 1,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: 2,
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: 3,
    width: 'auto',
  },
  display: 'flex',
  alignItems: 'center',
});

const inputBaseStyles = (theme) => ({
  color: 'inherit',
  width: '100%',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1),
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
  },
});

const MainLayout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { isAuthenticated, user, isAdmin } = useSelector(state => state.auth);
  const { items } = useSelector(state => state.cart);
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const isMenuOpen = Boolean(anchorEl);
  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMoreAnchorEl(null);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    handleMobileMenuClose();
  };

  const handleLogout = () => {
    dispatch(logout());
    handleMenuClose();
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${searchQuery}`);
      setSearchQuery('');
    }
  };

  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setDrawerOpen(open);
  };

  const menuId = 'primary-search-account-menu';
  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      id={menuId}
      keepMounted
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      open={isMenuOpen}
      onClose={handleMenuClose}
    >
      {isAuthenticated ? (
        <>
          <MenuItem onClick={() => { handleMenuClose(); navigate('/profile'); }}>Profile</MenuItem>
          <MenuItem onClick={() => { handleMenuClose(); navigate('/orders'); }}>My Orders</MenuItem>
          <MenuItem onClick={() => { handleMenuClose(); navigate('/wishlist'); }}>Wishlist</MenuItem>
          {isAdmin && (
            <MenuItem onClick={() => { handleMenuClose(); navigate('/admin'); }}>Admin Dashboard</MenuItem>
          )}
          <Divider />
          <MenuItem onClick={handleLogout}>Logout</MenuItem>
        </>
      ) : (
        <>
          <MenuItem onClick={() => { handleMenuClose(); navigate('/login'); }}>Login</MenuItem>
          <MenuItem onClick={() => { handleMenuClose(); navigate('/register'); }}>Register</MenuItem>
        </>
      )}
    </Menu>
  );

  const mobileMenuId = 'primary-search-account-menu-mobile';
  const renderMobileMenu = (
    <Menu
      anchorEl={mobileMoreAnchorEl}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      id={mobileMenuId}
      keepMounted
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      open={isMobileMenuOpen}
      onClose={handleMobileMenuClose}
    >
      <MenuItem onClick={() => { handleMobileMenuClose(); navigate('/cart'); }}>
        <IconButton size="large" color="inherit">
          <Badge badgeContent={items.length} color="error">
            <ShoppingCartIcon />
          </Badge>
        </IconButton>
        <p>Cart</p>
      </MenuItem>
      {isAuthenticated && (
        <MenuItem onClick={() => { handleMobileMenuClose(); navigate('/wishlist'); }}>
          <IconButton size="large" color="inherit">
            <FavoriteIcon />
          </IconButton>
          <p>Wishlist</p>
        </MenuItem>
      )}
      <MenuItem onClick={handleProfileMenuOpen}>
        <IconButton
          size="large"
          aria-label="account of current user"
          aria-controls="primary-search-account-menu"
          aria-haspopup="true"
          color="inherit"
        >
          {isAuthenticated && user?.name ? (
            <Avatar sx={{ width: 24, height: 24, bgcolor: 'secondary.main' }}>
              {user.name.charAt(0).toUpperCase()}
            </Avatar>
          ) : (
            <AccountCircle />
          )}
        </IconButton>
        <p>Profile</p>
      </MenuItem>
    </Menu>
  );

  const drawer = (
    <Box
      sx={{ width: 250 }}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <List>
        <ListItem button onClick={() => navigate('/')}>
          <ListItemIcon>
            <HomeIcon />
          </ListItemIcon>
          <ListItemText primary="Home" />
        </ListItem>
        <ListItem button onClick={() => navigate('/products')}>
          <ListItemIcon>
            <StoreIcon />
          </ListItemIcon>
          <ListItemText primary="Products" />
        </ListItem>
        <ListItem button onClick={() => navigate('/products?category=new')}>
          <ListItemIcon>
            <CategoryIcon />
          </ListItemIcon>
          <ListItemText primary="Categories" />
        </ListItem>
      </List>
      <Divider />
      {isAuthenticated ? (
        <List>
          <ListItem button onClick={() => navigate('/profile')}>
            <ListItemIcon>
              <AccountCircle />
            </ListItemIcon>
            <ListItemText primary="Profile" />
          </ListItem>
          <ListItem button onClick={() => navigate('/orders')}>
            <ListItemIcon>
              <MailIcon />
            </ListItemIcon>
            <ListItemText primary="Orders" />
          </ListItem>
          <ListItem button onClick={() => navigate('/wishlist')}>
            <ListItemIcon>
              <FavoriteIcon />
            </ListItemIcon>
            <ListItemText primary="Wishlist" />
          </ListItem>
          {isAdmin && (
            <ListItem button onClick={() => navigate('/admin')}>
              <ListItemIcon>
                <DashboardIcon />
              </ListItemIcon>
              <ListItemText primary="Admin Dashboard" />
            </ListItem>
          )}
          <ListItem button onClick={handleLogout}>
            <ListItemText primary="Logout" />
          </ListItem>
        </List>
      ) : (
        <List>
          <ListItem button onClick={() => navigate('/login')}>
            <ListItemText primary="Login" />
          </ListItem>
          <ListItem button onClick={() => navigate('/register')}>
            <ListItemText primary="Register" />
          </ListItem>
        </List>
      )}
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="sticky">
        <Container maxWidth="xl">
          <Toolbar sx={{ p: isMobile ? 1 : 2 }}>
            <IconButton
              size={isMobile ? "medium" : "large"}
              edge="start"
              color="inherit"
              aria-label="open drawer"
              sx={{ mr: isMobile ? 1 : 2 }}
              onClick={toggleDrawer(true)}
            >
              <MenuIcon />
            </IconButton>
            
            {/* Logo with ShopEasy text */}
            <Box 
              component="div" 
              sx={{ 
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                mr: isMobile ? 1 : 2,
                flexShrink: 0
              }}
              onClick={() => navigate('/')}
            >
              <Box
                component="img"
                src="/3.png"
                alt="ShopEasy Logo"
                sx={{ 
                  height: isMobile ? 30 : 40,
                  width: isMobile ? 30 : 40,
                  borderRadius: '80%',
                  objectFit: 'cover',
                  border: '2px solid',
                  borderColor: 'primary.light',
                  p: 0,
                  bgcolor: 'white'
                }}
              />
              <Typography
                variant={isMobile ? "body1" : "h6"}
                noWrap
                component="div"
                sx={{ 
                  fontWeight: 'bold',
                  ml: isMobile ? 0.5 : 1,
                  display: isMobile ? { xs: 'none', sm: 'block' } : 'block'
                }}
              >
                ShopEasy
              </Typography>
            </Box>
            
            <Box 
              component="form" 
              sx={{ 
                ...searchStyles(theme), 
                flexGrow: 1,
                maxWidth: isMobile ? 'calc(100% - 140px)' : 'auto'
              }} 
              onSubmit={handleSearch}
            >
              <InputBase
                placeholder={isMobile ? "Search" : "Search…"}
                sx={inputBaseStyles(theme)}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                inputProps={{ 
                  'aria-label': 'search',
                  style: { 
                    fontSize: isMobile ? '0.875rem' : 'inherit',
                    padding: isMobile ? '6px 8px' : undefined
                  }
                }}
              />
            </Box>
            
            <Box sx={{ flexGrow: isMobile ? 0 : 1 }} />
            
            {!isMobile && (
              <Box sx={{ display: 'flex' }}>
                <Button color="inherit" onClick={() => navigate('/products')}>
                  Products
                </Button>
                {isAdmin && (
                  <Button color="inherit" onClick={() => navigate('/admin')}>
                    Admin
                  </Button>
                )}
              </Box>
            )}
            
            <Box sx={{ display: 'flex' }}>
              <IconButton
                size={isMobile ? "medium" : "large"}
                color="inherit"
                onClick={() => navigate('/cart')}
                sx={{ ml: isMobile ? 0.5 : 1 }}
              >
                <Badge badgeContent={items.length} color="error">
                  <ShoppingCartIcon fontSize={isMobile ? "small" : "medium"} />
                </Badge>
              </IconButton>
              
              {isAuthenticated && !isMobile && (
                <IconButton
                  size={isMobile ? "medium" : "large"}
                  color="inherit"
                  onClick={() => navigate('/wishlist')}
                >
                  <FavoriteIcon fontSize={isMobile ? "small" : "medium"} />
                </IconButton>
              )}
              
              <IconButton
                size={isMobile ? "medium" : "large"}
                edge="end"
                aria-label="account of current user"
                aria-controls={menuId}
                aria-haspopup="true"
                onClick={handleProfileMenuOpen}
                color="inherit"
                sx={{ ml: isMobile ? 0.5 : 1 }}
              >
                {isAuthenticated && user?.name ? (
                  <Avatar sx={{ width: isMobile ? 20 : 24, height: isMobile ? 20 : 24, bgcolor: 'secondary.main' }}>
                    {user.name.charAt(0).toUpperCase()}
                  </Avatar>
                ) : (
                  <AccountCircle fontSize={isMobile ? "small" : "medium"} />
                )}
              </IconButton>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
      
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
      >
        {drawer}
      </Drawer>
      
      {renderMobileMenu}
      {renderMenu}
      
      <Container component="main" sx={{ mt: 3, mb: 3, flexGrow: 1, px: isMobile ? 2 : 3 }}>
        <Outlet />
      </Container>
      
      <Footer />
    </Box>
  );
};

export default MainLayout;
