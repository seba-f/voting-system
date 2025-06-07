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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" gutterBottom>
                    Welcome, {user?.username}!
                </Typography>
            </Box>
            
            {isAdmin() && (
                <Typography variant="subtitle1" color="primary">
                    You have administrator privileges
                </Typography>
            )}
            <Button>
            </Button>
        </Box>
    );
};