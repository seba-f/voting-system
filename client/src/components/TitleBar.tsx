import React from 'react';
import { Box, IconButton, useTheme } from '@mui/material';
import MinimizeIcon from '@mui/icons-material/Remove';
import MaximizeIcon from '@mui/icons-material/CropSquare';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useNavigate, useLocation } from 'react-router-dom';
import logoCheck from '../assets/logo_check.svg';
import { useAuth } from '../auth/AuthContext';
import API from '../api/axios';

// custom titlebar component with navigation controls and window management buttons
const TitleBar: React.FC = () => {
    const theme = useTheme();
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleBack = () => {
        navigate(-1);
    };

    const handleForward = () => {
        navigate(1);
    };

    const handleMinimize = () => {
        window.electron?.minimize();
    };

    const handleMaximize = () => {
        window.electron?.maximize();
    };    const handleClose = async () => {
        if (user) {
            try {
                await Promise.all([
                    API.put(`/users/${user.id}/active-status`, { isActive: false }),
                    API.put(`/sessions/active-status`, { isActive: false })
                ]);
            } catch (error) {
                console.error('Error updating active status:', error);
            }
        }
        window.electron?.close();
    };

    return (
        <Box
            sx={{
                height: 32,
                bgcolor: theme.palette.primary.main,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                WebkitAppRegion: 'drag',
                position: 'sticky',
                top: 0,
                zIndex: theme.zIndex.appBar,
                boxShadow: 0
            }}
        >
            {/* Navigation Controls */}
            <Box 
                sx={{ 
                    display: 'flex', 
                    WebkitAppRegion: 'no-drag',
                    ml: 1
                }}
            >
                <IconButton 
                    size="small" 
                    onClick={handleBack}
                    sx={{ 
                        borderRadius: 0,
                        color: 'white',
                        '&:hover': {
                            bgcolor: theme.palette.secondary.main,
                            color: theme.palette.secondary.contrastText
                        },
                        '&.Mui-disabled': {
                            color: 'rgba(255,255,255,0.3)'
                        }
                    }}
                >
                    <ArrowBackIcon fontSize="small" />
                </IconButton>
                <IconButton 
                    size="small" 
                    onClick={handleForward}
                    sx={{ 
                        borderRadius: 0,
                        color: 'white',
                        '&:hover': {
                            bgcolor: theme.palette.secondary.main,
                            color: theme.palette.secondary.contrastText
                        },
                        '&.Mui-disabled': {
                            color: 'rgba(255,255,255,0.3)'
                        }
                    }}
                >
                    <ArrowForwardIcon fontSize="small" />
                </IconButton>
            </Box>
            
            {/* Window Controls */}
            <Box 
                sx={{ 
                    display: 'flex', 
                    WebkitAppRegion: 'no-drag'
                }}
            >
                <IconButton 
                    size="small" 
                    onClick={handleMinimize}
                    sx={{ 
                        borderRadius: 0,
                        color: 'white',
                        '&:hover': {
                            bgcolor: theme.palette.secondary.main,
                            color: theme.palette.secondary.contrastText
                        }
                    }}
                >
                    <MinimizeIcon fontSize="small" />
                </IconButton>
                <IconButton 
                    size="small" 
                    onClick={handleMaximize}
                    sx={{ 
                        borderRadius: 0,
                        color: 'white',
                        '&:hover': {
                            bgcolor: theme.palette.secondary.main,
                            color: theme.palette.secondary.contrastText
                        }
                    }}
                >
                    <MaximizeIcon fontSize="small" />
                </IconButton>
                <IconButton 
                    size="small" 
                    onClick={handleClose}
                    sx={{ 
                        borderRadius: 0,
                        color: 'white',
                        '&:hover': {
                            bgcolor: 'error.main',
                            color: 'white'
                        }
                    }}
                >
                    <CloseIcon fontSize="small" />
                </IconButton>
            </Box>
        </Box>
    );
};

export default TitleBar;