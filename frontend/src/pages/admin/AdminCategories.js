import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchCategories, 
  createCategory, 
  updateCategory, 
  deleteCategory 
} from '../../store/slices/categorySlice';

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
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Grid,
  Avatar,
  Tooltip,
  Alert,
  CircularProgress
} from '@mui/material';

// MUI icons
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Image as ImageIcon
} from '@mui/icons-material';

// Formik and Yup for form handling and validation
import { useFormik } from 'formik';
import * as Yup from 'yup';

const AdminCategories = () => {
  const dispatch = useDispatch();
  const { categories, loading, error } = useSelector(state => state.categories);
  
  // Local state
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('create'); // 'create' or 'edit'
  const [currentCategory, setCurrentCategory] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  
  // Add a fileInputRef
  const fileInputRef = useRef(null);
  
  // Load categories
  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);
  
  // Form validation schema
  const categorySchema = Yup.object({
    name: Yup.string()
      .required('Category name is required'),
    description: Yup.string()
      .required('Description is required')
  });
  
  // Initialize form
  const formik = useFormik({
    initialValues: {
      name: '',
      description: '',
      image: ''
    },
    validationSchema: categorySchema,
    onSubmit: (values) => {
      if (dialogMode === 'create') {
        dispatch(createCategory(values))
          .unwrap()
          .then(() => {
            setOpenDialog(false);
            formik.resetForm();
          })
          .catch(error => {
            console.error('Failed to create category:', error);
          });
      } else {
        dispatch(updateCategory({ id: currentCategory._id, categoryData: values }))
          .unwrap()
          .then(() => {
            setOpenDialog(false);
            setCurrentCategory(null);
          })
          .catch(error => {
            console.error('Failed to update category:', error);
          });
      }
    }
  });
  
  // Handle image file upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file type and size
    const validImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!validImageTypes.includes(file.type)) {
      alert('Please upload an image file (JPEG, PNG, GIF)');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      alert('Image size should be less than 5MB');
      return;
    }
    
    // Create a data URL from the file
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      setImagePreview(dataUrl);
      formik.setFieldValue('image', dataUrl);
    };
    reader.readAsDataURL(file);
  };
  
  // Trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  // Open create dialog
  const handleCreateCategory = () => {
    setDialogMode('create');
    formik.resetForm();
    setImagePreview('');
    setOpenDialog(true);
  };
  
  // Open edit dialog
  const handleEditCategory = (category) => {
    setDialogMode('edit');
    setCurrentCategory(category);
    setImagePreview(category.image || '');
    formik.setValues({
      name: category.name || '',
      description: category.description || '',
      image: category.image || ''
    });
    setOpenDialog(true);
  };
  
  // Handle dialog close
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setTimeout(() => {
      formik.resetForm();
      setCurrentCategory(null);
      setImagePreview('');
    }, 300);
  };
  
  // Open delete confirmation dialog
  const handleDeleteConfirm = (category) => {
    setCategoryToDelete(category);
    setDeleteDialog(true);
  };
  
  // Handle category deletion
  const handleDeleteCategory = () => {
    if (categoryToDelete) {
      dispatch(deleteCategory(categoryToDelete._id))
        .unwrap()
        .then(() => {
          setDeleteDialog(false);
          setCategoryToDelete(null);
        })
        .catch(error => {
          console.error('Failed to delete category:', error);
        });
    }
  };
  
  // Category dialog content
  const renderCategoryDialog = () => (
    <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
      <DialogTitle>
        {dialogMode === 'create' ? 'Add New Category' : 'Edit Category'}
      </DialogTitle>
      <form onSubmit={formik.handleSubmit}>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="name"
                name="name"
                label="Category Name"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="description"
                name="description"
                label="Description"
                multiline
                rows={3}
                value={formik.values.description}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.description && Boolean(formik.errors.description)}
                helperText={formik.touched.description && formik.errors.description}
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Category Image
                </Typography>
                
                {/* Hidden file input */}
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={handleImageUpload}
                />
                
                {/* Image preview or placeholder */}
                <Box 
                  sx={{ 
                    width: '100%', 
                    display: 'flex', 
                    justifyContent: 'center', 
                    mb: 2 
                  }}
                >
                  {(imagePreview || formik.values.image) ? (
                    <Avatar 
                      variant="rounded" 
                      src={imagePreview || formik.values.image}
                      alt={formik.values.name}
                      sx={{ width: 200, height: 200 }}
                    />
                  ) : (
                    <Paper 
                      variant="outlined" 
                      sx={{ 
                        width: 200, 
                        height: 200, 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center',
                        bgcolor: 'background.default' 
                      }}
                    >
                      <ImageIcon sx={{ fontSize: 80, color: 'text.disabled' }} />
                    </Paper>
                  )}
                </Box>
                
                <Button
                  variant="outlined"
                  onClick={triggerFileInput}
                  startIcon={<ImageIcon />}
                  fullWidth
                >
                  Upload Image
                </Button>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Max file size: 5MB. Supported formats: JPEG, PNG, GIF
                </Typography>
              </Box>
              
              {/* Optionally keep URL field for external images */}
              <TextField
                fullWidth
                id="image"
                name="image"
                label="Image URL (or upload above)"
                placeholder="https://example.com/image.jpg"
                value={formik.values.image}
                onChange={(e) => {
                  formik.handleChange(e);
                  setImagePreview(''); // Clear preview when URL is manually entered
                }}
                onBlur={formik.handleBlur}
              />
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
          Are you sure you want to delete the category "{categoryToDelete?.name}"? 
          This action cannot be undone and may affect products in this category.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setDeleteDialog(false)}>Cancel</Button>
        <Button 
          onClick={handleDeleteCategory} 
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
          Categories
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={handleCreateCategory}
        >
          Add Category
        </Button>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Image</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              Array(5).fill().map((_, index) => (
                <TableRow key={index}>
                  <TableCell><CircularProgress size={20} /></TableCell>
                  <TableCell colSpan={3}><CircularProgress size={20} /></TableCell>
                </TableRow>
              ))
            ) : categories.length > 0 ? (
              categories.map((category) => (
                <TableRow key={category._id} hover>
                  <TableCell>
                    <Avatar 
                      variant="rounded" 
                      alt={category.name} 
                      src={category.image || ''}
                      sx={{ width: 60, height: 60 }}
                    >
                      <ImageIcon />
                    </Avatar>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle1">{category.name}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {category.description?.length > 100 
                        ? `${category.description.substring(0, 100)}...` 
                        : category.description}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Edit">
                      <IconButton onClick={() => handleEditCategory(category)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton color="error" onClick={() => handleDeleteConfirm(category)}>
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <Typography variant="body1" sx={{ py: 2 }}>
                    No categories found
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* Dialogs */}
      {renderCategoryDialog()}
      {renderDeleteDialog()}
    </>
  );
};

export default AdminCategories;
