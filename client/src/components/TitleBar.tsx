import React from 'react';
import { Box, IconButton, useTheme } from '@mui/material';
import MinimizeIcon from '@mui/icons-material/Remove';
import MaximizeIcon from '@mui/icons-material/CropSquare';
import CloseIcon from '@mui/icons-material/Close';
import logoCheck from '../assets/logo_check.svg';
import { useAuth } from '../auth/AuthContext';
import API from '../api/axios';

const TitleBar: React.FC = () => {
    const theme = useTheme();
    const { user } = useAuth();

    const handleMinimize = () => {
        window.electron?.minimize();
    };

    const handleMaximize = () => {
        window.electron?.maximize();
    };    const handleClose = async () => {
        if (user) {
            try {
                await API.put(`/users/${user.id}/active-status`, { isActive: false });
            } catch (error) {
                console.error('Error updating user active status:', error);
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
                justifyContent: 'right',
                WebkitAppRegion: 'drag',
                borderBottom: `1px solid ${theme.palette.divider}`,
                pl: 1,
            }}
        >
            
            <Box 
                sx={{ 
                    display: 'flex', 
                    WebkitAppRegion: 'no-drag',
                    rm:'0'
                }}
            >
                <IconButton 
                    size="small" 
                    onClick={handleMinimize}
                    sx={{ borderRadius: 0,
                        color:'main.contrastText',
                        '&:hover': {
                            bgcolor: theme.palette.secondary.main,
                            color: theme.palette.secondary.contrastText
                        } }}
                >
                    <MinimizeIcon fontSize="small" />
                </IconButton>
                <IconButton 
                    size="small" 
                    onClick={handleMaximize}
                    sx={{ borderRadius: 0,
                        color:'main.contrastText',
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
                        color:'main.contrastText',
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