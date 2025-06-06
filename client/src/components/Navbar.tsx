import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { AppBar, Toolbar, Button, Box, useTheme, useMediaQuery, IconButton } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import logoFull from '../assets/logo_full.svg';
import logoCheck from '../assets/logo_check.svg';

export const Navbar: React.FC = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const { user, logout, isAdmin } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <AppBar position="sticky" color="primary">
            <Toolbar 
                sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: theme.spacing(1),
                    position: 'relative', // Added for absolute positioning of profile button
                }}
            >
                {/* Logo Section */}
                <Link to="/dashboard">
                    <img 
                        src={isMobile ? logoCheck : logoFull} 
                        alt="Logo" 
                        style={{ 
                            height: isMobile ? '30px' : '40px',
                            width: 'auto'
                        }} 
                    />
                </Link>

                {/* Navigation Buttons */}
                <Box sx={{ 
                    display: 'flex', 
                    gap: theme.spacing(2),
                    alignItems: 'center'
                }}>
                    {isAdmin() && (
                        <>
                            <Button 
                                color="inherit" 
                                component={Link} 
                                to="/admin/users"
                            >
                                Manage Users
                            </Button>
                            <Button 
                                color="inherit" 
                                component={Link} 
                                to="/admin/elections"
                            >
                                Manage Elections
                            </Button>
                        </>
                    )}
                    
                    <Button 
                        color="inherit" 
                        component={Link} 
                        to="/dashboard"
                    >
                        Dashboard
                    </Button>
                </Box>

                {/* Profile Button */}
                <IconButton 
                    color="inherit"
                    onClick={handleLogout}
                    sx={{
                        position: 'absolute',
                        bottom: theme.spacing(1),
                        right: theme.spacing(2),
                    }}
                >
                    <AccountCircleIcon />
                </IconButton>
            </Toolbar>
        </AppBar>
    );
};