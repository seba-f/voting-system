import React from 'react';
import { Box, Typography } from '@mui/material';

interface MockChipProps {
    label: string;
    variant?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
    size?: 'small' | 'medium';
}

const variantColors = {
    primary: {
        bg: '#e3f2fd',
        text: '#1976d2'
    },
    secondary: {
        bg: '#f5f5f5',
        text: '#757575'
    },
    success: {
        bg: '#e8f5e9',
        text: '#2e7d32'
    },
    error: {
        bg: '#ffebee',
        text: '#d32f2f'
    },
    warning: {
        bg: '#fff3e0',
        text: '#ed6c02'
    },
    info: {
        bg: '#e3f2fd',
        text: '#0288d1'
    }
};

export const MockChip: React.FC<MockChipProps> = ({ 
    label, 
    variant = 'primary',
    size = 'medium' 
}) => {
    const colors = variantColors[variant];
    return (
        <Box
            sx={{
                display: 'inline-flex',
                alignItems: 'center',
                height: size === 'small' ? '24px' : '32px',
                bgcolor: colors.bg,
                color: colors.text,
                borderRadius: '16px',
                px: size === 'small' ? 1 : 1.5,
                py: 0.5,
            }}
        >
            <Typography
                variant={size === 'small' ? 'caption' : 'body2'}
                sx={{ 
                    fontWeight: 500,
                    lineHeight: 1
                }}
            >
                {label}
            </Typography>
        </Box>
    );
};
