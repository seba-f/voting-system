import React from 'react';
import { Box, IconButton, useTheme } from '@mui/material';
import MinimizeIcon from '@mui/icons-material/Remove';
import MaximizeIcon from '@mui/icons-material/CropSquare';
import CloseIcon from '@mui/icons-material/Close';
import logoCheck from '../assets/logo_check.svg';

const TitleBar: React.FC = () => {
    const theme = useTheme();

    const handleMinimize = () => {
        window.electron?.minimize();
    };

    const handleMaximize = () => {
        window.electron?.maximize();
    };

    const handleClose = () => {
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