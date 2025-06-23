import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Box, 
    Typography, 
    TextField, 
    Button, 
    FormGroup,
    FormControlLabel,
    Checkbox,
    Alert,
    CircularProgress,
    Grid,
    InputAdornment,
    IconButton,
    Divider,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';
import { 
    Search as SearchIcon, 
    Visibility, 
    VisibilityOff,
    Add as AddIcon 
} from '@mui/icons-material';
import API from '../../api/axios';
import { PageHeader } from '../../components/PageHeader';
import { useAlert } from '../../components/AlertContext';

interface Role {
    id: number;
    name: string;
}

// admin page for creating new users with role assignments
export const NewUserPage: React.FC = () => {
    const navigate = useNavigate();
    const { showAlert } = useAlert();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [roles, setRoles] = useState<Role[]>([]);
    const [selectedRoles, setSelectedRoles] = useState<number[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [roleSearchTerm, setRoleSearchTerm] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [newRoleDialogOpen, setNewRoleDialogOpen] = useState(false);
    const [newRoleName, setNewRoleName] = useState('');
    const [roleError, setRoleError] = useState<string | null>(null);

    useEffect(() => {
        fetchRoles();
    }, []);

    const fetchRoles = async () => {
        try {
            const response = await API.get('/roles');
            setRoles(response.data.roles);
        } catch (err) {
            setError('Failed to load roles');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleRoleToggle = (roleId: number) => {
        setSelectedRoles(prev => {
            if (prev.includes(roleId)) {
                return prev.filter(id => id !== roleId);
            }
            return [...prev, roleId];
        });
    };

    const handleCreateRole = async () => {
        if (!newRoleName.trim()) {
            setRoleError('Role name is required');
            showAlert('Role name is required', 'error');
            return;
        }

        try {
            showAlert('Creating new role...', 'info');
            await API.post('/roles', { name: newRoleName.trim() });
            setNewRoleDialogOpen(false);
            setNewRoleName('');
            setRoleError(null);
            await fetchRoles(); // Refresh roles list
            showAlert('Role created successfully', 'success');
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Failed to create role';
            setRoleError(errorMessage);
            showAlert(errorMessage, 'error');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            showAlert('Passwords do not match', 'error');
            return;
        }

        try {
            showAlert('Creating new user...', 'info');
            await API.post('/users', {
                ...formData,
                roleIds: selectedRoles
            });
            showAlert('User created successfully', 'success');
            navigate('/admin/users');
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Failed to create user';
            setError(errorMessage);
            showAlert(errorMessage, 'error');
        }
    };

    const filteredRoles = roles.filter(role => 
        role.name.toLowerCase().includes(roleSearchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <PageHeader title="Add New User" />
            
            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            <Box sx={{ display: 'flex', gap: 4 }}>
                {/* Left side - Roles */}
                <Box sx={{ width: 280 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="h6">
                            Roles
                        </Typography>
                        <Button
                            startIcon={<AddIcon />}
                            onClick={() => setNewRoleDialogOpen(true)}
                            size="small"
                        >
                            New Role
                        </Button>
                    </Box>

                    <TextField
                        fullWidth
                        placeholder="Search roles..."
                        value={roleSearchTerm}
                        onChange={(e) => setRoleSearchTerm(e.target.value)}
                        sx={{ mb: 2 }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        }}
                    />

                    <Box sx={{ maxHeight: 'calc(100vh - 300px)', overflowY: 'auto', pr: 1 }}>
                        <FormGroup>
                            {filteredRoles.map(role => (
                                <FormControlLabel
                                    key={role.id}
                                    control={
                                        <Checkbox
                                            checked={selectedRoles.includes(role.id)}
                                            onChange={() => handleRoleToggle(role.id)}
                                        />
                                    }
                                    label={role.name}
                                />
                            ))}
                        </FormGroup>
                    </Box>
                </Box>

                {/* Divider */}
                <Divider orientation="vertical" flexItem />

                {/* Right side - User Form */}
                <Box sx={{ flex: 1 }}>
                    <form onSubmit={handleSubmit}>
                        <Typography variant="h6" gutterBottom>
                            User Details
                        </Typography>
                        
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, maxWidth: 500 }}>
                            <TextField
                                required
                                fullWidth
                                label="Username"
                                name="username"
                                value={formData.username}
                                onChange={handleInputChange}
                            />
                            
                            <TextField
                                required
                                fullWidth
                                label="Email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleInputChange}
                            />
                            
                            <TextField
                                required
                                fullWidth
                                label="Password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                value={formData.password}
                                onChange={handleInputChange}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => setShowPassword(!showPassword)}
                                                edge="end"
                                            >
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                            
                            <TextField
                                required
                                fullWidth
                                label="Confirm Password"
                                name="confirmPassword"
                                type={showConfirmPassword ? 'text' : 'password'}
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                edge="end"
                                            >
                                                {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
                                <Button 
                                    variant="outlined" 
                                    onClick={() => navigate('/admin/users')}
                                    size="large"
                                >
                                    Cancel
                                </Button>
                                <Button 
                                    type="submit" 
                                    variant="contained" 
                                    size="large"
                                >
                                    Create User
                                </Button>
                            </Box>
                        </Box>
                    </form>
                </Box>
            </Box>

            {/* New Role Dialog */}
            <Dialog 
                open={newRoleDialogOpen} 
                onClose={() => {
                    setNewRoleDialogOpen(false);
                    setNewRoleName('');
                    setRoleError(null);
                }}
            >
                <DialogTitle>Create New Role</DialogTitle>
                <DialogContent>
                    {roleError && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {roleError}
                        </Alert>
                    )}
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Role Name"
                        fullWidth
                        value={newRoleName}
                        onChange={(e) => setNewRoleName(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => {
                        setNewRoleDialogOpen(false);
                        setNewRoleName('');
                        setRoleError(null);
                    }}>
                        Cancel
                    </Button>
                    <Button onClick={handleCreateRole} variant="contained">
                        Create
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};
