import React from 'react';
import { Box, Typography, Divider, IconButton, Tooltip } from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';

interface PageHeaderProps {
    title: string;
    children?: React.ReactNode;
    onRefresh?: () => void;
    isRefreshing?: boolean;
    action?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ 
    title, 
    children, 
    onRefresh,
    isRefreshing = false,
    action
}) => {
    return (
        <Box sx={{ mb: 4 }}>
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                mb: 2
            }}>                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography 
                        variant="h4" 
                        sx={{ 
                            fontWeight: 'medium',
                            color: 'primary.main'
                        }}
                    >
                        {title}
                    </Typography>
                    {action}
                    {onRefresh && (
                        <Tooltip title="Refresh">
                            <IconButton
                                onClick={onRefresh} 
                                disabled={isRefreshing}
                                sx={{ 
                                    animation: isRefreshing ? 'rotate 1s linear infinite' : 'none',
                                    '@keyframes rotate': {
                                        '0%': {
                                            transform: 'rotate(0deg)'
                                        },
                                        '100%': {
                                            transform: 'rotate(360deg)'
                                        }
                                    }
                                }}
                            >
                                <RefreshIcon />
                            </IconButton>
                        </Tooltip>
                    )}
                </Box>
                {children}
            </Box>
            <Divider />
        </Box>
    );
};
