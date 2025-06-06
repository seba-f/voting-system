import React from 'react';
import { useAuth } from '../auth/AuthContext';
import { Box, Button, Typography, IconButton } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

interface DashboardProps {
    onThemeToggle: () => void;
    isDarkMode: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({ onThemeToggle, isDarkMode }) => {
    const { user, logout, isAdmin } = useAuth();

    const handleLogout = async () => {
        await logout();
    };

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" gutterBottom>
                    Welcome, {user?.username}!
                </Typography>
                <IconButton onClick={onThemeToggle} color="inherit">
                    {isDarkMode ? <Brightness7Icon /> : <Brightness4Icon />}
                </IconButton>
            </Box>
            
            {isAdmin() && (
                <Typography variant="subtitle1" color="primary">
                    You have administrator privileges
                </Typography>
            )}
            
            <Button 
                variant="contained" 
                color="secondary" 
                onClick={handleLogout}
                sx={{ mt: 2 }}
            >
                Logout
            </Button>
            <Button>
            </Button>
        </Box>
    );
};