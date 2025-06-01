import React from 'react';
import { useAuth } from '../auth/AuthContext';
import { Box, Button, Typography } from '@mui/material';

export const Dashboard: React.FC = () => {
    const { user, logout, isAdmin } = useAuth();

    const handleLogout = async () => {
        await logout();
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Welcome, {user?.username}!
            </Typography>
            
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
        </Box>
    );
};