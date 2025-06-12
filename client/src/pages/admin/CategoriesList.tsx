import React, { useEffect, useState } from 'react';
import { 
    Box, 
    Typography, 
    CircularProgress, 
    Button,
    Divider,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Card,
    CardContent,
    useTheme,
    TextField,
    Paper,
    Collapse,
    IconButton,
    Grid,
    Autocomplete,
    Chip
} from '@mui/material';
import { 
    Add as AddIcon,
    ExpandMore as ExpandMoreIcon,
    Sort as SortIcon,
    FilterList as FilterListIcon
} from '@mui/icons-material';
import API from '../../api/axios';
import { PageHeader } from '../../components/PageHeader';
import { CategoryCard } from '../../components/CategoryCard';
import { useAlert } from '../../components/AlertContext';

interface Category {
    id: number;
    name: string;
    roles: Array<{ name: string }>;
    ballots: Array<{ 
        id: number;
        title: string;
        status: string;
    }>;
}

interface Role {
    id: number;
    name: string;
}

export const CategoriesList: React.FC = () => {
    const theme = useTheme();
    const { showAlert } = useAlert();
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [selectedRole, setSelectedRole] = useState<string>('all');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [newCategoryName, setNewCategoryName] = useState('');
    const [availableRoles, setAvailableRoles] = useState<{ id: number; name: string }[]>([]);
    const [selectedRoles, setSelectedRoles] = useState<Role[]>([]);
    const [isCreateFormExpanded, setIsCreateFormExpanded] = useState(false);

    const fetchCategories = async (showLoadingState = true) => {
        if (showLoadingState) {
            setLoading(true);
        } else {
            setIsRefreshing(true);
        }
        setError(null);

        try {
            const response = await API.get('/categories');
            setCategories(response.data.categories);
        } catch (err) {
            setError('Failed to load categories');
            console.error(err);
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    const fetchRoles = async () => {
        try {
            const response = await API.get('/roles');
            setAvailableRoles(response.data.roles);
        } catch (err) {
            console.error('Failed to load roles:', err);
            showAlert('Failed to load roles', 'error');
        }
    };

    useEffect(() => {
        fetchCategories();
        fetchRoles();
    }, []);

    const handleRefresh = () => {
        fetchCategories(false);
    };

    const handleCreateCategory = async () => {
        if (!newCategoryName.trim()) {
            showAlert('Category name is required', 'error');
            return;
        }

        try {
            await API.post('/categories', { 
                name: newCategoryName.trim(),
                roleIds: selectedRoles.map(role => role.id)
            });
            showAlert('Category created successfully', 'success');
            setNewCategoryName('');
            setSelectedRoles([]);
            setIsCreateFormExpanded(false);
            fetchCategories(false);
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Failed to create category';
            showAlert(errorMessage, 'error');
        }
    };

    const handleCategoryDelete = (categoryId: number) => {
        setCategories(prev => prev.filter(cat => cat.id !== categoryId));
    };

    const toggleSortOrder = () => {
        setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    };

    const handleRoleToggle = (roleId: number) => {
        setSelectedRoles(prev => {
            if (prev.includes(roleId)) {
                return prev.filter(id => id !== roleId);
            }
            return [...prev, roleId];
        });
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    const filteredCategories = categories
        .filter(category => 
            selectedRole === 'all' 
                ? true 
                : category.roles.some(role => role.name === selectedRole)
        )
        .sort((a, b) => 
            sortOrder === 'asc' 
                ? a.name.localeCompare(b.name) 
                : b.name.localeCompare(a.name)
        );

    return (
        <Box sx={{ p: 3 }}>
            <PageHeader 
                title="Manage Categories" 
                onRefresh={handleRefresh}
                isRefreshing={isRefreshing}
            />

            <Box sx={{ display: 'flex', gap: 3 }}>
                <Box sx={{ flex: 1 }}>
                    {/* Create Category Button Card */}
                    <Card 
                        sx={{ 
                            mb: 2,
                            cursor: 'pointer',
                            '&:hover': {
                                bgcolor: theme.palette.action.hover
                            }
                        }}
                    >
                        <CardContent 
                            onClick={() => setIsCreateFormExpanded(!isCreateFormExpanded)}
                            sx={{ 
                                p: '12px !important',
                                "&:last-child": { pb: '12px !important' }
                            }}
                        >
                            <Box 
                                sx={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between', 
                                    alignItems: 'center'
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <AddIcon color="primary" />
                                    <Typography variant="h6" color="primary">
                                        Create New Category
                                    </Typography>
                                </Box>
                                <ExpandMoreIcon 
                                    sx={{ 
                                        transform: isCreateFormExpanded ? 'rotate(180deg)' : 'none',
                                        transition: theme.transitions.create('transform'),
                                        color: theme.palette.primary.main
                                    }} 
                                />
                            </Box>
                        </CardContent>
                    </Card>

                    {/* Create Category Form Card */}
                    <Collapse in={isCreateFormExpanded}>
                        <Card sx={{ mb: 3 }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <TextField
                                        fullWidth
                                        label="Category Name"
                                        value={newCategoryName}
                                        onChange={(e) => setNewCategoryName(e.target.value)}
                                    />
                                      <Autocomplete
                                        multiple
                                        disableCloseOnSelect
                                        value={selectedRoles}
                                        onChange={(_, newValue) => setSelectedRoles(newValue)}
                                        options={availableRoles}
                                        getOptionLabel={(option) => option.name}
                                        renderOption={(props, option, { selected }) => (
                                            <li {...props}>
                                                <Box 
                                                    component="span" 
                                                    sx={{ 
                                                        width: 20, 
                                                        height: 20, 
                                                        border: '2px solid',
                                                        borderColor: selected ? 'primary.main' : 'grey.400',
                                                        borderRadius: 0.5,
                                                        mr: 1,
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        backgroundColor: selected ? 'primary.main' : 'transparent'
                                                    }}
                                                >
                                                    {selected && (
                                                        <Typography
                                                            component="span"
                                                            sx={{
                                                                color: 'white',
                                                                fontSize: '0.8rem',
                                                                fontWeight: 'bold'
                                                            }}
                                                        >
                                                            ✓
                                                        </Typography>
                                                    )}
                                                </Box>
                                                {option.name}
                                            </li>
                                        )}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Assign Roles"
                                                placeholder={selectedRoles.length ? "Add more roles..." : "Search roles..."}
                                            />
                                        )}
                                        renderTags={(value, getTagProps) =>
                                            value.map((option, index) => (
                                                <Chip
                                                    label={option.name}
                                                    {...getTagProps({ index })}
                                                    sx={{ 
                                                        backgroundColor: theme.palette.primary.main,
                                                        color: theme.palette.primary.contrastText
                                                    }}
                                                />
                                            ))
                                        }
                                    />

                                    <Button
                                        variant="contained"
                                        fullWidth
                                        onClick={handleCreateCategory}
                                        disabled={!newCategoryName.trim()}
                                    >
                                        Create Category
                                    </Button>
                                </Box>
                            </CardContent>
                        </Card>
                    </Collapse>

                    {/* Categories List */}
                    {error && (
                        <Typography color="error" sx={{ mb: 2 }}>
                            {error}
                        </Typography>
                    )}

                    <Box sx={{ 
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2
                    }}>
                        {filteredCategories.length === 0 ? (
                            <Typography color="text.secondary">
                                No categories found.
                            </Typography>
                        ) : (
                            filteredCategories.map(category => (
                                <CategoryCard 
                                    key={category.id}
                                    category={category}
                                    onDelete={handleCategoryDelete}
                                />
                            ))
                        )}
                    </Box>
                </Box>

                {/* Divider */}
                <Divider orientation="vertical" flexItem sx={{ backgroundColor: theme.palette.secondary.main }} />

                {/* Filters Side Panel */}
                <Box sx={{ width: 280 }}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Filters
                            </Typography>

                            {/* Role Filter */}
                            <FormControl fullWidth sx={{ mb: 2 }}>
                                <InputLabel>Filter by Role</InputLabel>
                                <Select
                                    value={selectedRole}
                                    label="Filter by Role"
                                    onChange={(e) => setSelectedRole(e.target.value)}
                                >
                                    <MenuItem value="all">All Roles</MenuItem>
                                    {availableRoles.map(role => (
                                        <MenuItem key={role.id} value={role.name}>
                                            {role.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            {/* Sort Order */}
                            <Button
                                variant="outlined"
                                fullWidth
                                onClick={toggleSortOrder}
                            >
                                Sort by Name: {sortOrder === 'asc' ? '↑' : '↓'}
                            </Button>
                        </CardContent>
                    </Card>
                </Box>
            </Box>
        </Box>
    );
};
