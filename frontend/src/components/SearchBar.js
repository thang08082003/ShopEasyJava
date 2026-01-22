import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';

// MUI components
import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  Popper,
  ClickAwayListener,
  CircularProgress
} from '@mui/material';

// MUI icons
import {
  Search as SearchIcon,
  Clear as ClearIcon
} from '@mui/icons-material';

const SearchBar = () => {
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [isFocused, setIsFocused] = useState(false);
  
  const handleSearch = async (value) => {
    if (!value || value.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    
    setLoading(true);
    try {
      const response = await api.get('/api/products', {
        params: {
          search: value,
          limit: 5
        }
      });
      setSearchResults(response.data.data || []);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Debounce search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm) {
        handleSearch(searchTerm);
      }
    }, 300);
    
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);
  
  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (searchTerm && searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
      setAnchorEl(null);
      setSearchResults([]);
    }
  };
  
  const handleItemClick = (productId) => {
    navigate(`/products/${productId}`);
    setSearchTerm('');
    setSearchResults([]);
  };
  
  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setAnchorEl(e.currentTarget);
  };
  
  const handleClearSearch = () => {
    setSearchTerm('');
    setSearchResults([]);
  };
  
  const handleClickAway = () => {
    setIsFocused(false);
    // Keep results visible briefly when clicking away
    setTimeout(() => {
      if (!isFocused) {
        setSearchResults([]);
      }
    }, 200);
  };
  
  const open = Boolean(anchorEl) && searchResults.length > 0;
  
  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <Box sx={{ position: 'relative', width: '100%' }}>
        <Box component="form" onSubmit={handleFormSubmit}>
          <TextField
            placeholder="Search products..."
            variant="outlined"
            fullWidth
            size="small"
            value={searchTerm}
            onChange={handleInputChange}
            onFocus={(e) => {
              setIsFocused(true);
              if (searchTerm) setAnchorEl(e.currentTarget);
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  {loading ? (
                    <CircularProgress size={20} />
                  ) : searchTerm && (
                    <IconButton
                      aria-label="clear search"
                      onClick={handleClearSearch}
                      edge="end"
                      size="small"
                    >
                      <ClearIcon />
                    </IconButton>
                  )}
                </InputAdornment>
              )
            }}
          />
        </Box>
        
        <Popper
          open={open}
          anchorEl={anchorEl}
          placement="bottom-start"
          modifiers={[
            {
              name: 'offset',
              options: {
                offset: [0, 8]
              }
            }
          ]}
          style={{ width: anchorEl?.offsetWidth, zIndex: 1201 }}
        >
          <Paper elevation={3}>
            <List sx={{ p: 0 }}>
              {searchResults.map((product) => (
                <ListItem 
                  button 
                  key={product._id} 
                  onClick={() => handleItemClick(product._id)}
                  divider
                >
                  <ListItemAvatar>
                    <Avatar 
                      alt={product.name} 
                      src={product.images?.[0] || ''} 
                      variant="rounded"
                    />
                  </ListItemAvatar>
                  <ListItemText
                    primary={product.name}
                    secondary={
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 1,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        ${product.price.toFixed(2)}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
              <ListItem button onClick={handleFormSubmit}>
                <ListItemText
                  primary={`See all results for "${searchTerm}"`}
                  sx={{ textAlign: 'center', color: 'primary.main' }}
                />
              </ListItem>
            </List>
          </Paper>
        </Popper>
      </Box>
    </ClickAwayListener>
  );
};

export default SearchBar;
