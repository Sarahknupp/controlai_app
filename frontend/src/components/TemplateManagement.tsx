import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Switch,
  FormControlLabel,
  Chip,
  Stack,
  Grid,
  Select,
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment,
  TablePagination,
  Snackbar
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  Search as SearchIcon,
  Category as CategoryIcon
} from '@mui/icons-material';
import { templateService } from '../services/template.service';
import { NotificationTemplate, TemplateCategory, TemplateSearchParams, CreateTemplateData, UpdateTemplateData } from '../types/template.types';
import TemplateVersionHistory from './TemplateVersionHistory';

const TemplateManagement: React.FC = () => {
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [categories, setCategories] = useState<TemplateCategory[]>([]);
  const [loading, setLoading] = useState({
    templates: true,
    categories: true,
    preview: false,
    submit: false,
    delete: false,
    restore: false
  });
  const [error, setError] = useState<{
    message: string;
    type: 'templates' | 'categories' | 'preview' | 'submit' | 'delete' | 'restore';
  } | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openPreviewDialog, setOpenPreviewDialog] = useState(false);
  const [openCategoryDialog, setOpenCategoryDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<NotificationTemplate | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [menuTemplateId, setMenuTemplateId] = useState<string | null>(null);
  const [previewVariables, setPreviewVariables] = useState<Record<string, string>>({});
  const [previewResult, setPreviewResult] = useState<{ subject: string; body: string } | null>(null);
  const [formData, setFormData] = useState<Partial<CreateTemplateData>>({
    name: '',
    description: '',
    subject: '',
    body: '',
    variables: [],
    categoryId: '',
    changeReason: ''
  });
  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    description: ''
  });
  const [searchParams, setSearchParams] = useState<TemplateSearchParams>({
    search: '',
    categoryId: '',
    active: undefined,
    sortBy: 'name',
    sortOrder: 'asc'
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'success'
  });

  const fetchTemplates = async () => {
    try {
      setLoading(prev => ({ ...prev, templates: true }));
      setError(null);
      const data = await templateService.getTemplates({
        ...searchParams,
        page: page + 1,
        limit: rowsPerPage
      });
      setTemplates(data.items);
      setTotalCount(data.total);
    } catch (err) {
      setError({
        message: err instanceof Error ? err.message : 'Failed to fetch templates',
        type: 'templates'
      });
    } finally {
      setLoading(prev => ({ ...prev, templates: false }));
    }
  };

  const fetchCategories = async () => {
    try {
      setLoading(prev => ({ ...prev, categories: true }));
      setError(null);
      const data = await templateService.getCategories();
      setCategories(data);
    } catch (err) {
      setError({
        message: err instanceof Error ? err.message : 'Failed to fetch categories',
        type: 'categories'
      });
    } finally {
      setLoading(prev => ({ ...prev, categories: false }));
    }
  };

  useEffect(() => {
    fetchTemplates();
    fetchCategories();
  }, [searchParams, page, rowsPerPage]);

  const handleOpenDialog = (template?: NotificationTemplate) => {
    if (template) {
      setSelectedTemplate(template);
      setFormData({
        name: template.name,
        description: template.description,
        subject: template.subject,
        body: template.body,
        variables: template.variables,
        categoryId: template.categoryId,
        changeReason: template.changeReason
      });
    } else {
      setSelectedTemplate(null);
      setFormData({
        name: '',
        description: '',
        subject: '',
        body: '',
        variables: [],
        categoryId: '',
        changeReason: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedTemplate(null);
    setFormData({
      name: '',
      description: '',
      subject: '',
      body: '',
      variables: [],
      categoryId: '',
      changeReason: ''
    });
  };

  const handleOpenCategoryDialog = (category?: TemplateCategory) => {
    if (category) {
      setSelectedCategory(category);
      setCategoryFormData({
        name: category.name,
        description: category.description
      });
    } else {
      setSelectedCategory(null);
      setCategoryFormData({
        name: '',
        description: ''
      });
    }
    setOpenCategoryDialog(true);
  };

  const handleCloseCategoryDialog = () => {
    setOpenCategoryDialog(false);
    setSelectedCategory(null);
    setCategoryFormData({
      name: '',
      description: ''
    });
  };

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, templateId: string) => {
    setMenuAnchor(event.currentTarget);
    setMenuTemplateId(templateId);
  };

  const handleCloseMenu = () => {
    setMenuAnchor(null);
    setMenuTemplateId(null);
  };

  const handleOpenPreview = async (template: NotificationTemplate) => {
    setSelectedTemplate(template);
    setPreviewVariables(
      template.variables.reduce((acc, variable) => ({
        ...acc,
        [variable]: ''
      }), {})
    );
    setPreviewResult(null);
    setOpenPreviewDialog(true);
  };

  const handleClosePreview = () => {
    setOpenPreviewDialog(false);
    setSelectedTemplate(null);
    setPreviewVariables({});
    setPreviewResult(null);
  };

  const handlePreview = async () => {
    if (!selectedTemplate) return;
    try {
      setLoading(prev => ({ ...prev, preview: true }));
      setError(null);
      const result = await templateService.previewTemplate(selectedTemplate.id, previewVariables);
      setPreviewResult(result);
    } catch (err) {
      setError({
        message: err instanceof Error ? err.message : 'Failed to preview template',
        type: 'preview'
      });
    } finally {
      setLoading(prev => ({ ...prev, preview: false }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(prev => ({ ...prev, submit: true }));
      setError(null);
      if (selectedTemplate) {
        const updateData: UpdateTemplateData = {
          name: formData.name,
          description: formData.description,
          subject: formData.subject,
          body: formData.body,
          variables: formData.variables,
          categoryId: formData.categoryId,
          changeReason: formData.changeReason
        };
        await templateService.updateTemplate(selectedTemplate.id, updateData);
        setSnackbar({
          open: true,
          message: 'Template updated successfully',
          severity: 'success'
        });
      } else {
        const createData: CreateTemplateData = {
          name: formData.name!,
          description: formData.description!,
          subject: formData.subject!,
          body: formData.body!,
          variables: formData.variables!,
          categoryId: formData.categoryId!,
          changeReason: formData.changeReason
        };
        await templateService.createTemplate(createData);
        setSnackbar({
          open: true,
          message: 'Template created successfully',
          severity: 'success'
        });
      }
      handleCloseDialog();
      fetchTemplates();
    } catch (err) {
      setError({
        message: err instanceof Error ? err.message : 'Failed to save template',
        type: 'submit'
      });
      setSnackbar({
        open: true,
        message: err instanceof Error ? err.message : 'Failed to save template',
        severity: 'error'
      });
    } finally {
      setLoading(prev => ({ ...prev, submit: false }));
    }
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedCategory) {
        await templateService.updateCategory(
          selectedCategory.id,
          categoryFormData.name,
          categoryFormData.description
        );
        setSnackbar({
          open: true,
          message: 'Category updated successfully',
          severity: 'success'
        });
      } else {
        await templateService.createCategory(
          categoryFormData.name,
          categoryFormData.description
        );
        setSnackbar({
          open: true,
          message: 'Category created successfully',
          severity: 'success'
        });
      }
      handleCloseCategoryDialog();
      fetchCategories();
    } catch (err) {
      setError({
        message: err instanceof Error ? err.message : 'Failed to save category',
        type: 'categories'
      });
      setSnackbar({
        open: true,
        message: err instanceof Error ? err.message : 'Failed to save category',
        severity: 'error'
      });
    }
  };

  const handleDelete = async () => {
    if (!menuTemplateId) return;
    try {
      setLoading(prev => ({ ...prev, delete: true }));
      setError(null);
      await templateService.deleteTemplate(menuTemplateId);
      handleCloseMenu();
      setOpenDeleteDialog(false);
      fetchTemplates();
      setSnackbar({
        open: true,
        message: 'Template deleted successfully',
        severity: 'success'
      });
    } catch (err) {
      setError({
        message: err instanceof Error ? err.message : 'Failed to delete template',
        type: 'delete'
      });
      setSnackbar({
        open: true,
        message: err instanceof Error ? err.message : 'Failed to delete template',
        severity: 'error'
      });
    } finally {
      setLoading(prev => ({ ...prev, delete: false }));
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      await templateService.deleteCategory(categoryId);
      fetchCategories();
      setSnackbar({
        open: true,
        message: 'Category deleted successfully',
        severity: 'success'
      });
    } catch (err) {
      setError({
        message: err instanceof Error ? err.message : 'Failed to delete category',
        type: 'categories'
      });
      setSnackbar({
        open: true,
        message: err instanceof Error ? err.message : 'Failed to delete category',
        severity: 'error'
      });
    }
  };

  const handleToggleActive = async (template: NotificationTemplate) => {
    try {
      await templateService.toggleTemplateActive(template.id, !template.active);
      fetchTemplates();
      setSnackbar({
        open: true,
        message: `Template ${template.active ? 'deactivated' : 'activated'} successfully`,
        severity: 'success'
      });
    } catch (err) {
      setError({
        message: err instanceof Error ? err.message : 'Failed to update template status',
        type: 'templates'
      });
      setSnackbar({
        open: true,
        message: err instanceof Error ? err.message : 'Failed to update template status',
        severity: 'error'
      });
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchParams(prev => ({ ...prev, search: event.target.value }));
    setPage(0);
  };

  const handleCategoryChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSearchParams(prev => ({ ...prev, categoryId: event.target.value as string }));
    setPage(0);
  };

  const handleSortChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const [sortBy, sortOrder] = (event.target.value as string).split('-');
    setSearchParams(prev => ({ ...prev, sortBy: sortBy as 'name' | 'createdAt' | 'updatedAt', sortOrder: sortOrder as 'asc' | 'desc' }));
    setPage(0);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  if (loading.templates || loading.categories) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Template Management</Typography>
        <Box>
          <Button
            variant="contained"
            startIcon={<CategoryIcon />}
            onClick={() => handleOpenCategoryDialog()}
            sx={{ mr: 2 }}
            disabled={loading.categories}
          >
            Manage Categories
          </Button>
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={fetchTemplates}
            sx={{ mr: 2 }}
            disabled={loading.templates}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            disabled={loading.templates}
          >
            Add Template
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          onClose={() => setError(null)}
        >
          {error.message}
        </Alert>
      )}

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
        <Box sx={{ width: { xs: '100%', md: '33.33%' }, flexGrow: 1 }}>
          <TextField
            fullWidth
            placeholder="Search templates..."
            value={searchParams.search}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              )
            }}
          />
        </Box>
        <Box sx={{ width: { xs: '100%', md: '25%' }, flexGrow: 1 }}>
          <FormControl fullWidth>
            <InputLabel>Category</InputLabel>
            <Select
              value={searchParams.categoryId}
              onChange={(e) => handleCategoryChange(e as React.ChangeEvent<{ value: unknown }>)}
              label="Category"
            >
              <MenuItem value="">All Categories</MenuItem>
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <Box sx={{ width: { xs: '100%', md: '25%' }, flexGrow: 1 }}>
          <FormControl fullWidth>
            <InputLabel>Sort By</InputLabel>
            <Select
              value={`${searchParams.sortBy}-${searchParams.sortOrder}`}
              onChange={(e) => handleSortChange(e as React.ChangeEvent<{ value: unknown }>)}
              label="Sort By"
            >
              <MenuItem value="name-asc">Name (A-Z)</MenuItem>
              <MenuItem value="name-desc">Name (Z-A)</MenuItem>
              <MenuItem value="createdAt-desc">Newest First</MenuItem>
              <MenuItem value="createdAt-asc">Oldest First</MenuItem>
              <MenuItem value="updatedAt-desc">Recently Updated</MenuItem>
              <MenuItem value="updatedAt-asc">Least Recently Updated</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <Box sx={{ width: { xs: '100%', md: '16.67%' }, flexGrow: 1 }}>
          <FormControlLabel
            control={
              <Switch
                checked={searchParams.active === true}
                onChange={(e) => setSearchParams(prev => ({ ...prev, active: e.target.checked }))}
              />
            }
            label="Active Only"
          />
        </Box>
      </Box>

      <Card>
        <CardContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Variables</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Last Updated</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {templates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell>{template.name}</TableCell>
                    <TableCell>{template.description}</TableCell>
                    <TableCell>
                      {categories.find(c => c.id === template.categoryId)?.name || 'Uncategorized'}
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        {template.variables.map((variable) => (
                          <Chip
                            key={variable}
                            label={variable}
                            size="small"
                            variant="outlined"
                          />
                        ))}
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={template.active}
                            onChange={() => handleToggleActive(template)}
                            color="primary"
                          />
                        }
                        label={template.active ? 'Active' : 'Inactive'}
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(template.updatedAt).toLocaleString()}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        onClick={(e) => handleOpenMenu(e, template.id)}
                        size="small"
                      >
                        <MoreVertIcon />
                      </IconButton>
                      <TemplateVersionHistory
                        template={template}
                        onVersionRestored={fetchTemplates}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <TablePagination
              component="div"
              count={totalCount}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25, 50]}
            />
          </TableContainer>
        </CardContent>
      </Card>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleCloseMenu}
      >
        <MenuItem 
          onClick={() => {
            const template = templates.find(t => t.id === menuTemplateId);
            if (template) handleOpenDialog(template);
            handleCloseMenu();
          }}
          disabled={loading.templates}
        >
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem 
          onClick={() => {
            const template = templates.find(t => t.id === menuTemplateId);
            if (template) handleOpenPreview(template);
            handleCloseMenu();
          }}
          disabled={loading.templates}
        >
          <VisibilityIcon fontSize="small" sx={{ mr: 1 }} />
          Preview
        </MenuItem>
        <MenuItem 
          onClick={() => {
            setOpenDeleteDialog(true);
            handleCloseMenu();
          }}
          sx={{ color: 'error.main' }}
          disabled={loading.delete}
        >
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          {loading.delete ? 'Deleting...' : 'Delete'}
        </MenuItem>
      </Menu>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {selectedTemplate ? 'Edit Template' : 'Add New Template'}
          </DialogTitle>
          <DialogContent>
            <Box display="flex" flexDirection="column" gap={2} mt={1}>
              <TextField
                label="Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                fullWidth
              />
              <TextField
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                fullWidth
                multiline
                rows={2}
              />
              <FormControl fullWidth required>
                <InputLabel>Category</InputLabel>
                <Select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  label="Category"
                >
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                required
                fullWidth
              />
              <TextField
                label="Body"
                value={formData.body}
                onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                required
                fullWidth
                multiline
                rows={6}
              />
              <TextField
                label="Variables (comma-separated)"
                value={formData.variables?.join(', ')}
                onChange={(e) => setFormData({
                  ...formData,
                  variables: e.target.value.split(',').map(v => v.trim()).filter(Boolean)
                })}
                required
                fullWidth
                helperText="Enter variable names separated by commas (e.g., name, email, orderNumber)"
              />
              <TextField
                label="Change Reason"
                value={formData.changeReason || ''}
                onChange={(e) => setFormData({ ...formData, changeReason: e.target.value })}
                fullWidth
                multiline
                rows={2}
                helperText="Explain why you're making these changes"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} disabled={loading.submit}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="contained"
              disabled={loading.submit}
              startIcon={loading.submit ? <CircularProgress size={20} /> : null}
            >
              {selectedTemplate ? 'Save Changes' : 'Create Template'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog open={openCategoryDialog} onClose={handleCloseCategoryDialog} maxWidth="sm" fullWidth>
        <form onSubmit={handleCategorySubmit}>
          <DialogTitle>
            {selectedCategory ? 'Edit Category' : 'Add New Category'}
          </DialogTitle>
          <DialogContent>
            <Box display="flex" flexDirection="column" gap={2} mt={1}>
              <TextField
                label="Name"
                value={categoryFormData.name}
                onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                required
                fullWidth
              />
              <TextField
                label="Description"
                value={categoryFormData.description}
                onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
                required
                fullWidth
                multiline
                rows={2}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseCategoryDialog}>Cancel</Button>
            <Button type="submit" variant="contained">
              {selectedCategory ? 'Save Changes' : 'Create Category'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog open={openPreviewDialog} onClose={handleClosePreview} maxWidth="md" fullWidth>
        <DialogTitle>Preview Template</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            {selectedTemplate?.variables.map((variable) => (
              <TextField
                key={variable}
                label={variable}
                value={previewVariables[variable] || ''}
                onChange={(e) => setPreviewVariables({
                  ...previewVariables,
                  [variable]: e.target.value
                })}
                fullWidth
                disabled={loading.preview}
              />
            ))}
            {previewResult && (
              <>
                <Typography variant="h6" mt={2}>Preview Result</Typography>
                <Typography variant="subtitle1" fontWeight="bold">
                  Subject: {previewResult.subject}
                </Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                  {previewResult.body}
                </Typography>
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePreview} disabled={loading.preview}>
            Close
          </Button>
          <Button 
            onClick={handlePreview} 
            variant="contained"
            disabled={loading.preview}
            startIcon={loading.preview ? <CircularProgress size={20} /> : null}
          >
            Preview
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this template? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
            disabled={loading.delete}
            startIcon={loading.delete ? <CircularProgress size={20} /> : null}
          >
            {loading.delete ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TemplateManagement; 