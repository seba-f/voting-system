import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Box, 
    Typography, 
    CircularProgress, 
    Divider, 
    Button, 
    FormControl, 
    InputLabel, 
    Select, 
    MenuItem,
    Card,
    CardContent,
    useTheme
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useAuth } from '../../auth/AuthContext';
import API from '../../api/axios';
import { PageHeader } from '../../components/PageHeader';
import { UserCard } from '../../components/UserCard';
import { contentContainerStyle, scrollableContentStyle } from '../../styles/scrollbar';

interface User {
    id: number;
    username: string;
    email: string;
    isActive: boolean;
    roles: Array<{ id: number; name: string }>;

}


// admin interface for managing users and their roles
export const UsersList: React.FC = () => {
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedRole, setSelectedRole] = useState<string>('all');
    const [availableRoles, setAvailableRoles] = useState<string[]>([]);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    const theme = useTheme();

    const fetchUsers = async (showLoadingState = true) => {
        if (showLoadingState) {
            setLoading(true);
        } else {
            setIsRefreshing(true);
        }
        setError(null);

        try {
            const response = await API.get('/users');
            const allUsers = response.data.users;
            
            // Sort users to put current user first
            const sortedUsers = allUsers.sort((a: User, b: User) => {
                if (a.id === currentUser?.id) return -1;
                if (b.id === currentUser?.id) return 1;
                return 0;
            });
            
            setUsers(sortedUsers);
        } catch (err) {
            setError('Failed to load users');
            console.error(err);
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    const handleRefresh = () => {
        fetchUsers(false);
    };

    const handleUserDelete = (userId: number) => {
        setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
        // Update available roles since a user was deleted
        const remainingUsers = users.filter(user => user.id !== userId);
        const roles = new Set<string>();
        remainingUsers.forEach(user => {
            user.roles.forEach(role => roles.add(role.name));
        });
        setAvailableRoles(Array.from(roles));
    };

    const handleUserUpdate = async (userId: number) => {
        try {
            await fetchUsers(false); // Refresh users list with loading=false
        } catch (error) {
            console.error("Error refreshing users after update:", error);
        }
    };

    // Extract unique roles from users
    useEffect(() => {
        const roles = new Set<string>();
        users.forEach(user => {
            user.roles.forEach(role => roles.add(role.name));
        });
        setAvailableRoles(Array.from(roles));
    }, [users]);

    useEffect(() => {
        fetchUsers();
    }, [currentUser?.id]);

    // Filter users based on selected role and status
    const filteredUsers = users
        .filter(user => selectedRole === 'all' ? true : user.roles.some(role => role.name === selectedRole))
        .filter(user => {
            if (statusFilter === 'all') return true;
            return statusFilter === 'active' ? user.isActive : !user.isActive;
        })
        // Sort users by username
        .sort((a, b) => {
            if (currentUser?.id === a.id) return -1;
            if (currentUser?.id === b.id) return 1;
            return sortOrder === 'asc' 
                ? a.username.localeCompare(b.username)
                : b.username.localeCompare(a.username);
        });

    // Calculate statistics
    const totalUsers = users.length;
    const activeUsers = users.filter(user => user.isActive).length;    

    const handleAddUser = () => {
        navigate('/admin/users/new');
    };

    const toggleSortOrder = () => {
        setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    };

    return (
        <Box sx={contentContainerStyle}>
            <PageHeader title="Manage Users" />
            <Box sx={{ display: 'flex', gap: 3, height: '100%' }}>
                {/* Main Content - User Cards */}
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <Box sx={scrollableContentStyle}>
                        {loading ? (
                            <CircularProgress />
                        ) : error ? (
                            <Typography color="error">{error}</Typography>
                        ) : filteredUsers.length === 0 ? (
                            <Typography>No users found.</Typography>
                        ) : (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                {filteredUsers.map(user => (
                                    <UserCard
                                        key={user.id}
                                        user={user}
                                        options={currentUser?.id !== user.id}
                                        onDelete={handleUserDelete}
                                        onUpdate={handleUserUpdate}
                                    />
                                ))}
                            </Box>
                        )}
                    </Box>
                </Box>

                {/* Divider */}
                <Divider orientation="vertical" flexItem sx={{backgroundColor: theme.palette.secondary.main}} />

                {/* Right side - Controls and Stats */}
                <Box sx={{ width: 280 }}>
                    {/* Add User Button */}
                    <Button
                        variant="contained"
                        fullWidth
                        startIcon={<AddIcon />}
                        sx={{ mb: 3 }}
                        onClick={handleAddUser}
                    >
                        Add New User
                    </Button>

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
                                <MenuItem key={role} value={role}>{role}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {/* Status Filter */}
                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>Filter by Status</InputLabel>
                        <Select
                            value={statusFilter}
                            label="Filter by Status"
                            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
                        >
                            <MenuItem value="all">All Users</MenuItem>
                            <MenuItem value="active">Active Users</MenuItem>
                            <MenuItem value="inactive">Inactive Users</MenuItem>
                        </Select>
                    </FormControl>

                    {/* Sort Order */}
                    <Button
                        variant="outlined"
                        fullWidth
                        sx={{ mb: 3 }}
                        onClick={toggleSortOrder}
                    >
                        Sort by Username: {sortOrder === 'asc' ? '↑' : '↓'}
                    </Button>

                    {/* Statistics Cards */}
                    <Typography variant="h6" gutterBottom>Statistics</Typography>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Card sx={{ flex: 1 }}>
                            <CardContent>
                                <Typography color="textSecondary" gutterBottom>
                                    Total Users
                                </Typography>
                                <Typography variant="h4">
                                    {totalUsers}
                                </Typography>
                            </CardContent>
                        </Card>
                        <Card sx={{ flex: 1 }}>
                            <CardContent>
                                <Typography color="textSecondary" gutterBottom>
                                    Active Users
                                </Typography>
                                <Typography variant="h4">
                                    {activeUsers}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};