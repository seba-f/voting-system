import React from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    useTheme,
    TableContainer,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    Paper,
    Tooltip,
} from '@mui/material';
import { Bar } from 'react-chartjs-2';
import { Option } from '../../types/ballot';

interface RankedChoiceDistributionCardProps {
    options: Option[];
    rankDistribution: {
        [optionId: number]: {
            [rank: number]: number;
        };
    };
    totalVotes: number;
}

export const RankedChoiceDistributionCard: React.FC<RankedChoiceDistributionCardProps> = ({
    options,
    rankDistribution,
    totalVotes,
}) => {
    const theme = useTheme();    // Generate colors that intuitively represent rank positions
    const rankColors = Array.from({ length: options.length }, (_, i) => {
        // Calculate position in the sequence (0 to 1)
        const position = i / (options.length - 1);
        
        // Define color stops for a gradient from best (gold) to worst (grey)
        const colorStops = [
            { pos: 0, hue: 45, sat: 100, light: 60 },    // Bright gold for 1st
            { pos: 0.2, hue: 40, sat: 85, light: 55 },   // Light gold for 2nd
            { pos: 0.4, hue: 35, sat: 70, light: 50 },   // Bronze for middle-high
            { pos: 0.6, hue: 0, sat: 0, light: 65 },     // Light grey for middle-low
            { pos: 0.8, hue: 0, sat: 0, light: 55 },     // Medium grey for low
            { pos: 1, hue: 0, sat: 0, light: 45 }        // Dark grey for lowest
        ];
        
        // Find the two color stops we're between
        let start = colorStops[0], end = colorStops[1];
        for (let j = 1; j < colorStops.length; j++) {
            if (position <= colorStops[j].pos) {
                start = colorStops[j - 1];
                end = colorStops[j];
                break;
            }
        }
        
        // Calculate how far we are between the two stops
        const segmentPosition = (position - start.pos) / (end.pos - start.pos);
        
        // Interpolate between the two colors
        const hue = start.hue + (end.hue - start.hue) * segmentPosition;
        const saturation = start.sat + (end.sat - start.sat) * segmentPosition;
        const lightness = start.light + (end.light - start.light) * segmentPosition;
        
        return `hsl(${hue}, ${saturation}%, ${lightness}%)`; 
    });

    // Convert the rank distribution data into a format suitable for the stacked bar chart
    const datasets = options.map((_, rankIndex) => ({
        label: `Rank ${rankIndex + 1}`,
        data: options.map(option => rankDistribution[option.id]?.[rankIndex + 1] || 0),
        backgroundColor: rankColors[rankIndex],
        borderColor: rankColors[rankIndex],
        borderWidth: 1,
        borderRadius: 4,
    }));

    const chartData = {
        labels: options.map(opt => opt.title),
        datasets,
    };

    const    chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'bottom' as const,
                labels: {
                    color: theme.palette.text.primary,
                    padding: 10,
                    usePointStyle: true,
                    pointStyle: 'circle',
                },
            },
            tooltip: {
                backgroundColor: theme.palette.background.paper,
                titleColor: theme.palette.text.primary,
                bodyColor: theme.palette.text.secondary,
                borderColor: theme.palette.divider,
                borderWidth: 1,
                padding: 12,
                boxPadding: 6,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                stacked: true,
                ticks: {
                    precision: 0,
                    color: theme.palette.text.secondary,
                },
                grid: {
                    color: theme.palette.divider,
                },
            },
            x: {
                stacked: true,
                ticks: {
                    color: theme.palette.text.secondary,
                },
                grid: {
                    color: theme.palette.divider,
                },
            },
        },
    };

    // Calculate Borda count scores
    const bordaScores = options.map(option => {
        let score = 0;
        const maxRank = options.length;
        for (let rank = 1; rank <= maxRank; rank++) {
            const votesForRank = rankDistribution[option.id]?.[rank] || 0;
            score += votesForRank * (maxRank - rank + 1);
        }
        return { option, score };
    }).sort((a, b) => b.score - a.score);

    return (
        <Card elevation={2}>
            <CardContent>
                <Typography variant="h6" gutterBottom color="primary" sx={{ mb: 2 }}>
                    Ranking Distribution
                </Typography>
                <Box sx={{ height: { xs: 300, sm: 350 } }}>
                    <Bar data={chartData} options={chartOptions} />
                </Box>

                {/* Borda Count Table */}
                <Box sx={{ mt: 4 }}>
                    <Typography variant="h6" gutterBottom color="primary">
                        Borda Count Results
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                        The Borda count is a positional voting method where voters rank options in order of preference. 
                        Each rank position is assigned points: the last rank gets 1 point, the second-to-last gets 2 points, 
                        and so on. The option with the highest total score wins.
                    </Typography>
                    <TableContainer component={Paper} variant="outlined">
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Rank</TableCell>
                                    <TableCell>Option</TableCell>
                                    <TableCell align="right">Borda Score</TableCell>
                                    <TableCell align="right">Normalized Score (%)</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {bordaScores.map(({ option, score }, index) => {
                                    const maxPossibleScore = totalVotes * options.length;
                                    const normalizedScore = (score / maxPossibleScore) * 100;
                                    
                                    return (
                                        <TableRow key={option.id}>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell>{option.title}</TableCell>
                                            <TableCell align="right">{score}</TableCell>
                                            <TableCell align="right">
                                                {normalizedScore.toFixed(1)}%
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            </CardContent>
        </Card>
    );
};
