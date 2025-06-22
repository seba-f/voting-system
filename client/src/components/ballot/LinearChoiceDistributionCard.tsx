import React from 'react';
import { Box, Typography, Paper, useTheme } from '@mui/material';
import { Option } from '../../types/ballot';

interface LinearChoiceDistributionCardProps {
    options: Option[];
    optionCounts: { [key: number]: number };
    totalVotes: number;
}

export const LinearChoiceDistributionCard: React.FC<LinearChoiceDistributionCardProps> = ({
    options,
    optionCounts,
    totalVotes
}) => {
    const theme = useTheme();

    // Process options to get scale information
    const processedOptions = options.map(opt => {
        const [value, label] = opt.title.split(',');
        return {
            id: opt.id,
            value: parseInt(value),
            label: label || value,
            count: optionCounts[opt.id] || 0
        };
    }).sort((a, b) => a.value - b.value);

    const minValue = processedOptions[0].value;
    const maxValue = processedOptions[processedOptions.length - 1].value;
    const range = maxValue - minValue;

    // Calculate statistics
    const weightedSum = processedOptions.reduce((sum, opt) => sum + (opt.value * opt.count), 0);
    const average = totalVotes > 0 ? weightedSum / totalVotes : 0;

    // Find mode(s)
    const maxCount = Math.max(...processedOptions.map(opt => opt.count));
    const modes = processedOptions.filter(opt => opt.count === maxCount);

    return (
        <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
                Distribution
            </Typography>

            {/* Statistics */}
            <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                    Average: {average.toFixed(2)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Most chosen: {modes.map(mode => mode.label).join(', ')} ({maxCount} votes)
                </Typography>
            </Box>

            {/* Distribution bars */}
            <Box sx={{ display: 'flex', alignItems: 'flex-end', height: 200, gap: 1, mt: 2 }}>
                {processedOptions.map((opt) => {
                    const percentage = totalVotes > 0 ? (opt.count / totalVotes) * 100 : 0;
                    const isEndpoint = opt.value === minValue || opt.value === maxValue;
                    
                    return (
                        <Box
                            key={opt.id}
                            sx={{
                                flex: 1,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                            }}
                        >
                            <Box
                                sx={{
                                    width: '100%',
                                    height: `${Math.max(percentage, 2)}%`,
                                    bgcolor: theme.palette.primary.main,
                                    mb: 1,
                                    borderRadius: 1,
                                    transition: 'height 0.3s ease',
                                    '&:hover': {
                                        bgcolor: theme.palette.primary.dark,
                                    },
                                }}
                            />
                            <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{
                                    textAlign: 'center',
                                    transform: 'rotate(-45deg)',
                                    transformOrigin: 'top left',
                                    whiteSpace: 'nowrap',
                                    position: 'relative',
                                    top: 20,
                                    left: 8,
                                }}
                            >
                                {isEndpoint ? opt.label : opt.value}
                            </Typography>
                            <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{
                                    mt: 4,
                                    textAlign: 'center',
                                }}
                            >
                                {opt.count}
                            </Typography>
                        </Box>
                    );
                })}
            </Box>
        </Paper>
    );
};
