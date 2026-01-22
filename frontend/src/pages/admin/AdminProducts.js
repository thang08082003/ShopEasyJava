import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchProducts, 
  deleteProduct, 
  createProduct, 
  updateProduct 
} from '../../store/slices/productSlice';
import { fetchCategories } from '../../store/slices/categorySlice';

// MUI components
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Chip,
  Avatar,
  Tooltip,
  Alert,
  CircularProgress,
  Switch,
  FormControlLabel
} from '@mui/material';

// MUI icons
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Search as SearchIcon,
  Image as ImageIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';

// Formik and Yup for form handling and validation
import { useFormik } from 'formik';
import * as Yup from 'yup';

const AdminProducts = () => {
  const dispatch = useDispatch();
  const { products, loading, error, total } = useSelector(state => state.products);
  const { categories } = useSelector(state => state.categories);
  
  // Local state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('create'); // 'create' or 'edit'
  const [currentProduct, setCurrentProduct] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [filterStock, setFilterStock] = useState(false);
  
  // Add file input ref for image upload
  const fileInputRef = useRef(null);
  
  // Add state for image previews (multiple images)
  const [imagePreviews, setImagePreviews] = useState([]);
  
  // Load products and categories
  useEffect(() => {
    const params = {
      page: page + 1,
      limit: rowsPerPage,
    };
    
    if (searchTerm) params.search = searchTerm;
    if (selectedCategory) params.category = selectedCategory;
    if (filterStock) params.in_stock = true;
    
    dispatch(fetchProducts(params));
    dispatch(fetchCategories());
  }, [dispatch, page, rowsPerPage, searchTerm, selectedCategory, filterStock]);
  
  // Form validation schema
  const productSchema = Yup.object({
    name: Yup.string()
      .required('Product name is required'),
    description: Yup.string()
      .required('Description is required'),
    price: Yup.number()
      .positive('Price must be positive')
      .required('Price is required'),
    salePrice: Yup.number()
      .min(0, 'Sale price cannot be negative')
      .nullable(),
    category: Yup.string()
      .required('Category is required'),
    stock: Yup.number()
      .integer('Stock must be an integer')
      .min(0, 'Stock cannot be negative')
      .required('Stock is required')
  });
  
  // Initialize form with empty values or current product data
  const formik = useFormik({
    initialValues: {
      name: '',
      description: '',
      price: '',
      salePrice: '',
      category: '',
      stock: '',
      images: []
    },
    validationSchema: productSchema,
    onSubmit: (values) => {
      const payload = {
        ...values,
        categoryId: values.category
      };
      if (dialogMode === 'create') {
        dispatch(createProduct(payload))
          .unwrap()
          .then(() => {
            setOpenDialog(false);
            formik.resetForm();
          })
          .catch(error => {
            console.error('Failed to create product:', error);
          });
      } else {
        dispatch(updateProduct({ id: currentProduct._id, productData: payload }))
          .unwrap()
          .then(() => {
            setOpenDialog(false);
            setCurrentProduct(null);
          })
          .catch(error => {
            console.error('Failed to update product:', error);
          });
      }
    }
  });
  
  // Handle image file upload
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    
    // Validate each file
    const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const validFiles = files.filter(file => {
      if (!validImageTypes.includes(file.type)) {
        return false;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        return false;
      }
      return true;
    });
    
    if (validFiles.length !== files.length) {
      alert('Some files were skipped. Please ensure all files are images under 5MB.');
    }
    
    // Process valid files
    const filePromises = validFiles.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    });
    
    Promise.all(filePromises).then(results => {
      const newPreviews = [...imagePreviews, ...results];
      setImagePreviews(newPreviews);
      formik.setFieldValue('images', newPreviews);
    });
  };
  
  // Trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };
  
  // Remove an image from the previews
  const removeImage = (indexToRemove) => {
    const newPreviews = imagePreviews.filter((_, index) => index !== indexToRemove);
    setImagePreviews(newPreviews);
    formik.setFieldValue('images', newPreviews);
  };
  
  // Open create dialog
  const handleCreateProduct = () => {
    setDialogMode('create');
    formik.resetForm();
    setImagePreviews([]);
    setOpenDialog(true);
  };
  
  // Open edit dialog
  const handleEditProduct = (product) => {
    setDialogMode('edit');
    setCurrentProduct(product);
    // Set image previews when editing
    setImagePreviews(product.images || []);
    formik.setValues({
      name: product.name || '',
      description: product.description || '',
      price: product.price || '',
      salePrice: product.salePrice || '',
      category: product.category?._id || product.category || '',
      stock: product.stock || 0,
      images: product.images || []
    });
    setOpenDialog(true);
  };
  
  // Handle dialog close
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setTimeout(() => {
      formik.resetForm();
      setCurrentProduct(null);
      setImagePreviews([]);
    }, 300);
  };
  
  // Open delete confirmation dialog
  const handleDeleteConfirm = (product) => {
    setProductToDelete(product);
    setDeleteDialog(true);
  };
  
  // Handle product deletion
  const handleDeleteProduct = () => {
    if (productToDelete) {
      dispatch(deleteProduct(productToDelete._id))
        .unwrap()
        .then(() => {
          setDeleteDialog(false);
          setProductToDelete(null);
        })
        .catch(error => {
          console.error('Failed to delete product:', error);
        });
    }
  };
  
  // Handle pagination changes
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Handle search and filter
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0); // Reset to first page when searching
  };
  
  const handleCategoryFilter = (event) => {
    setSelectedCategory(event.target.value);
    setPage(0); // Reset to first page when filtering
  };
  
  // Product dialog content
  const renderProductDialog = () => (
    <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
      <DialogTitle>
        {dialogMode === 'create' ? 'Add New Product' : 'Edit Product'}
      </DialogTitle>
      <form onSubmit={formik.handleSubmit}>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="name"
                name="name"
                label="Product Name"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="price"
                name="price"
                label="Price"
                type="number"
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                value={formik.values.price}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.price && Boolean(formik.errors.price)}
                helperText={formik.touched.price && formik.errors.price}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="salePrice"
                name="salePrice"
                label="Sale Price (Optional)"
                type="number"
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                value={formik.values.salePrice}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.salePrice && Boolean(formik.errors.salePrice)}
                helperText={formik.touched.salePrice && formik.errors.salePrice}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={formik.touched.category && Boolean(formik.errors.category)}>
                <InputLabel id="category-label">Category</InputLabel>
                <Select
                  labelId="category-label"
                  id="category"
                  name="category"
                  value={formik.values.category}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  label="Category"
                >
                  {categories.map((category) => (
                    <MenuItem key={category._id} value={category._id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
                {formik.touched.category && formik.errors.category && (
                  <Typography color="error" variant="caption">
                    {formik.errors.category}
                  </Typography>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="stock"
                name="stock"
                label="Stock"
                type="number"
                value={formik.values.stock}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.stock && Boolean(formik.errors.stock)}
                helperText={formik.touched.stock && formik.errors.stock}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="description"
                name="description"
                label="Description"
                multiline
                rows={4}
                value={formik.values.description}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.description && Boolean(formik.errors.description)}
                helperText={formik.touched.description && formik.errors.description}
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ border: '1px dashed grey', p: 2, borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Product Images
                </Typography>
                
                {/* Hidden file input */}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={handleImageUpload}
                />
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  {imagePreviews.length > 0 ? (
                    imagePreviews.map((image, index) => (
                      <Box 
                        key={index} 
                        sx={{ 
                          position: 'relative',
                          '&:hover .delete-button': {
                            opacity: 1
                          }
                        }}
                      >
                        <Avatar
                          alt={`Product image ${index + 1}`}
                          src={image}
                          variant="rounded"
                          sx={{ width: 80, height: 80 }}
                        />
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => removeImage(index)}
                          className="delete-button"
                          sx={{
                            position: 'absolute',
                            top: -8,
                            right: -8,
                            opacity: 0,
                            transition: 'opacity 0.2s',
                            bgcolor: 'background.paper',
                            '&:hover': {
                              bgcolor: 'background.paper',
                            }
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    ))
                  ) : (
                    <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                      <ImageIcon sx={{ mr: 1 }} />
                      <Typography variant="body2">No images uploaded</Typography>
                    </Box>
                  )}
                </Box>
                
                <Button 
                  variant="outlined" 
                  startIcon={<ImageIcon />} 
                  onClick={triggerFileInput}
                  fullWidth
                >
                  Upload Images
                </Button>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                  Max file size: 5MB per image. Supported formats: JPEG, PNG, GIF, WebP
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={formik.isSubmitting}
          >
            {formik.isSubmitting ? <CircularProgress size={24} /> : 
              dialogMode === 'create' ? 'Create' : 'Update'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
  
  // Delete confirmation dialog
  const renderDeleteDialog = () => (
    <Dialog
      open={deleteDialog}
      onClose={() => setDeleteDialog(false)}
    >
      <DialogTitle>Confirm Deletion</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Are you sure you want to delete the product "{productToDelete?.name}"? 
          This action cannot be undone.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setDeleteDialog(false)}>Cancel</Button>
        <Button 
          onClick={handleDeleteProduct} 
          color="error"
          variant="contained"
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
  
  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Products
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={handleCreateProduct}
        >
          Add Product
        </Button>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Paper sx={{ mb: 3, p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              id="search"
              label="Search Products"
              variant="outlined"
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="category-filter-label">Filter by Category</InputLabel>
              <Select
                labelId="category-filter-label"
                id="category-filter"
                value={selectedCategory}
                onChange={handleCategoryFilter}
                label="Filter by Category"
                startAdornment={
                  <InputAdornment position="start">
                    <FilterIcon />
                  </InputAdornment>
                }
              >
                <MenuItem value="">
                  <em>All Categories</em>
                </MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category._id} value={category._id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControlLabel
              control={
                <Switch
                  checked={filterStock}
                  onChange={(e) => setFilterStock(e.target.checked)}
                  color="primary"
                />
              }
              label="In Stock Only"
            />
          </Grid>
        </Grid>
      </Paper>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Image</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Stock</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              Array(rowsPerPage).fill().map((_, index) => (
                <TableRow key={index}>
                  <TableCell><CircularProgress size={20} /></TableCell>
                  <TableCell colSpan={5}><CircularProgress size={20} /></TableCell>
                </TableRow>
              ))
            ) : products.length > 0 ? (
              products.map((product) => (
                <TableRow key={product._id} hover>
                  <TableCell>
                    <Avatar
                      variant="rounded"
                      alt={product.name}
                      src={product.images?.[0] || ''}
                      sx={{ width: 50, height: 50 }}
                    >
                      <ImageIcon />
                    </Avatar>
                  </TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.category?.name || 'N/A'}</TableCell>
                  <TableCell>
                    {product.salePrice && product.price && product.salePrice < product.price ? (
                      <>
                        <Typography variant="body2" color="primary" component="span">
                          ${Number(product.salePrice || 0).toFixed(2)}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          color="text.secondary" 
                          component="span"
                          sx={{ textDecoration: 'line-through', ml: 1 }}
                        >
                          ${Number(product.price || 0).toFixed(2)}
                        </Typography>
                      </>
                    ) : (
                      `$${Number(product.price || 0).toFixed(2)}`
                    )}
                  </TableCell>
                  <TableCell>
                    {product.stock > 0 ? (
                      product.stock < 10 ? (
                        <Chip size="small" color="warning" label={`Low: ${product.stock}`} />
                      ) : (
                        product.stock
                      )
                    ) : (
                      <Chip size="small" color="error" label="Out of Stock" />
                    )}
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Edit">
                      <IconButton onClick={() => handleEditProduct(product)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton color="error" onClick={() => handleDeleteConfirm(product)}>
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography variant="body1" sx={{ py: 2 }}>
                    No products found
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={total || 0}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>
      
      {/* Dialogs */}
      {renderProductDialog()}
      {renderDeleteDialog()}
    </>
  );
};

export default AdminProducts;
