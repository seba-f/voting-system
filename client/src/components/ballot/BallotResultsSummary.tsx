import React from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Chip,
    Stack,
    Divider,
    useTheme,
    Paper,
    LinearProgress,
} from '@mui/material';
import { ParticipationCard } from './ParticipationCard';
import { Bar } from 'react-chartjs-2';
import { EmojiEvents as TrophyIcon } from '@mui/icons-material';
import { PersonOutline as PersonIcon } from '@mui/icons-material';

interface Choice {
    optionId: number;
    title: string;
    votes: number;
}

interface TopChoice extends Choice {
    place: number;
}

interface Analytics {
    totalVotes: number;
    totalVoters: number;
    eligibleUsers: number;
    participationRate: number;
    choiceDistribution?: Choice[];
    hourlyDistribution: Array<{
        hour: number;
        votes: number;
    }>;
    rankDistribution?: {
        [optionId: number]: {
            [rank: number]: number;
        };
    };
    textResponses?: Array<{
        response: string;
    }>;
}

interface BallotResultsSummaryProps {
    analytics: Analytics;
    ballotType: string;
}

const PlaceColors: { [key: number]: string } = {
    1: '#FFD700', // Gold
    2: '#C0C0C0', // Silver
    3: '#CD7F32', // Bronze
};

export const BallotResultsSummary: React.FC<BallotResultsSummaryProps> = ({
    analytics,
    ballotType,
}) => {
    const theme = useTheme();

    // Chart options for regular ballots
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
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
                ticks: {
                    precision: 0,
                    color: theme.palette.text.secondary,
                },
                grid: {
                    color: theme.palette.divider,
                },
            },
            x: {
                ticks: {
                    color: theme.palette.text.secondary,
                },
                grid: {
                    color: theme.palette.divider,
                },
            },
        },
    };

    // Chart options for ranked choice
    const rankedChartOptions = {
        ...chartOptions,
        plugins: {
            ...chartOptions.plugins,
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
        },
        scales: {
            ...chartOptions.scales,
            y: {
                ...chartOptions.scales.y,
                stacked: true,
            },
            x: {
                ...chartOptions.scales.x,
                stacked: true,
            },
        },
    };

    // Regular distribution data
    const choiceDistributionData = analytics.choiceDistribution ? {
        labels: analytics.choiceDistribution.map((choice) => choice.title),
        datasets: [
            {
                label: 'Votes',
                data: analytics.choiceDistribution.map((choice) => choice.votes),
                backgroundColor: theme.palette.primary.main,
                borderColor: theme.palette.primary.main,
                borderWidth: 1,
                borderRadius: 4,
            },
        ],
    } : null;

    // Ranked choice distribution data with color gradient
    const getRankedDistributionData = () => {
        if (!analytics.rankDistribution || !analytics.choiceDistribution) return null;

        const options = analytics.choiceDistribution;
        const maxRank = options.length;

        // Generate colors that intuitively represent rank positions
        const rankColors = Array.from({ length: maxRank }, (_, i) => {
            const position = i / (maxRank - 1);
            const colorStops = [
                { pos: 0, hue: 45, sat: 100, light: 60 },    // Bright gold
                { pos: 0.2, hue: 40, sat: 85, light: 55 },   // Light gold
                { pos: 0.4, hue: 35, sat: 70, light: 50 },   // Bronze
                { pos: 0.6, hue: 0, sat: 0, light: 65 },     // Light grey
                { pos: 0.8, hue: 0, sat: 0, light: 55 },     // Medium grey
                { pos: 1, hue: 0, sat: 0, light: 45 }        // Dark grey
            ];
            
            let start = colorStops[0], end = colorStops[1];
            for (let j = 1; j < colorStops.length; j++) {
                if (position <= colorStops[j].pos) {
                    start = colorStops[j - 1];
                    end = colorStops[j];
                    break;
                }
            }
            
            const segmentPosition = (position - start.pos) / (end.pos - start.pos);
            const hue = start.hue + (end.hue - start.hue) * segmentPosition;
            const saturation = start.sat + (end.sat - start.sat) * segmentPosition;
            const lightness = start.light + (end.light - start.light) * segmentPosition;
            
            return `hsl(${hue}, ${saturation}%, ${lightness}%)`; 
        });

        const datasets = options.map((_, rankIndex) => ({
            label: `Rank ${rankIndex + 1}`,
            data: options.map(option => analytics.rankDistribution![option.optionId]?.[rankIndex + 1] || 0),
            backgroundColor: rankColors[rankIndex],
            borderColor: rankColors[rankIndex],
            borderWidth: 1,
            borderRadius: 4,
        }));

        return {
            labels: options.map(opt => opt.title),
            datasets,
        };
    };

    // Calculate Borda count and handle ties
    const getTop3WithTies = () => {
        if (!analytics.choiceDistribution) return [];

        if (ballotType === 'RANKED_CHOICE' && analytics.rankDistribution) {
            const maxRank = analytics.choiceDistribution.length;
            const scores = analytics.choiceDistribution.map(choice => {
                let score = 0;
                const ranks = analytics.rankDistribution![choice.optionId] || {};
                for (let rank = 1; rank <= maxRank; rank++) {
                    const votesForRank = ranks[rank] || 0;
                    score += votesForRank * (maxRank - rank + 1);
                }
                return {
                    ...choice,
                    votes: score
                };
            });

            // Sort by score and handle ties properly
            const sortedScores = scores.sort((a, b) => b.votes - a.votes);
            const scoreGroups = new Map<number, TopChoice[]>();
            let currentPlace = 1;

            for (const choice of sortedScores) {
                if (currentPlace > 3) break;
                
                const existingGroup = Array.from(scoreGroups.entries())
                    .find(([score]) => score === choice.votes);
                
                if (existingGroup) {
                    // Add to existing tie group
                    existingGroup[1].push({ ...choice, place: existingGroup[1][0].place });
                } else {
                    // Start new group at current place
                    scoreGroups.set(choice.votes, [{ ...choice, place: currentPlace }]);
                    // Increment place by the size of previous groups to ensure proper spacing
                    currentPlace = Array.from(scoreGroups.values())
                        .reduce((sum, group) => sum + group.length, 1);
                }
            }

            // Flatten the groups into the final array
            return Array.from(scoreGroups.values()).flat().slice(0, 3);
        }

        // For regular ballots, handle ties in vote counts
        const sortedChoices = [...analytics.choiceDistribution].sort((a, b) => b.votes - a.votes);
        const voteGroups = new Map<number, TopChoice[]>();
        let currentPlace = 1;

        for (const choice of sortedChoices) {
            if (currentPlace > 3) break;

            const existingGroup = Array.from(voteGroups.entries())
                .find(([votes]) => votes === choice.votes);
            
            if (existingGroup) {
                // Add to existing tie group
                existingGroup[1].push({ ...choice, place: existingGroup[1][0].place });
            } else {
                // Start new group at current place
                voteGroups.set(choice.votes, [{ ...choice, place: currentPlace }]);
                // Increment place by the size of previous groups to ensure proper spacing
                currentPlace = Array.from(voteGroups.values())
                    .reduce((sum, group) => sum + group.length, 1);
            }
        }

        return Array.from(voteGroups.values()).flat().slice(0, 3);
    };    const topChoices: TopChoice[] = getTop3WithTies();
    const hasTopVotes = topChoices[0]?.votes > 0;

    if (ballotType === 'TEXT_INPUT') {
        return (
            <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Progress card with participation info */}
                <Card elevation={2}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom color="primary">
                            Response Progress
                        </Typography>
                        <Box sx={{ 
                            display: 'flex', 
                            flexDirection: 'column',
                            gap: 2,
                        }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <PersonIcon fontSize="small" color="primary" />
                                    <Typography variant="body2" color="text.secondary">
                                        {analytics.totalVoters} out of {analytics.eligibleUsers} participants
                                    </Typography>
                                </Box>
                                <Typography variant="body2" color="primary" sx={{ fontWeight: 'medium' }}>
                                    {analytics.participationRate.toFixed(1)}% complete
                                </Typography>
                            </Box>
                            <LinearProgress 
                                variant="determinate" 
                                value={analytics.participationRate}
                                sx={{
                                    height: 8,
                                    borderRadius: 4,
                                    backgroundColor: theme.palette.action.hover,
                                    '& .MuiLinearProgress-bar': {
                                        borderRadius: 4,
                                    }
                                }}
                            />
                        </Box>
                    </CardContent>
                </Card>

                {/* Responses card */}
                <Card elevation={2} sx={{ flex: 1 }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom color="primary" sx={{ mb: 2 }}>
                            All Responses ({analytics.textResponses?.length || 0})
                        </Typography>
                        <Box sx={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            gap: 2,
                            maxHeight: 'calc(100vh - 400px)',
                            overflowY: 'auto',
                            pr: 1,
                            mr: -1,
                            '&::-webkit-scrollbar': {
                                width: '8px',
                            },
                            '&::-webkit-scrollbar-track': {
                                backgroundColor: theme.palette.action.hover,
                                borderRadius: '8px',
                            },
                            '&::-webkit-scrollbar-thumb': {
                                backgroundColor: theme.palette.primary.main,
                                borderRadius: '8px',
                                '&:hover': {
                                    backgroundColor: theme.palette.primary.dark,
                                }
                            },
                            scrollbarWidth: 'thin',
                            scrollbarColor: `${theme.palette.primary.main} ${theme.palette.action.hover}`,
                        }}>
                            {analytics.textResponses?.map((response, index) => (
                                <Paper
                                    key={index}
                                    elevation={0}
                                    sx={{
                                        p: 2,
                                        backgroundColor: theme.palette.action.hover,
                                        borderRadius: 2,
                                        borderLeft: `4px solid ${theme.palette.primary.main}`,
                                    }}
                                >
                                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                                        {response.response}
                                    </Typography>
                                </Paper>
                            ))}
                            {(!analytics.textResponses || analytics.textResponses.length === 0) && (
                                <Typography 
                                    variant="body2" 
                                    color="text.secondary"
                                    sx={{ 
                                        textAlign: 'center',
                                        py: 4,
                                    }}
                                >
                                    No responses submitted yet.
                                </Typography>
                            )}
                        </Box>
                    </CardContent>
                </Card>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Grid with participation and distribution */}
            <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', md: '300px 1fr' } }}>
                {/* Participation card */}
                <ParticipationCard
                    participationRate={analytics.participationRate}
                    totalVotes={analytics.totalVotes}
                    totalVoters={analytics.totalVoters}
                    eligibleUsers={analytics.eligibleUsers}
                />

                {/* Results visualization */}
                <Card elevation={2}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom color="primary">
                            {ballotType === 'RANKED_CHOICE' ? 'Ranking Distribution' : 'Vote Distribution'}
                        </Typography>
                        {ballotType === 'RANKED_CHOICE' ? (
                            getRankedDistributionData() ? (
                                <Box sx={{ height: 300 }}>
                                    <Bar data={getRankedDistributionData()} options={rankedChartOptions} />
                                </Box>
                            ) : (
                                <Typography variant="body2" color="text.secondary">
                                    No ranking data available.
                                </Typography>
                            )
                        ) : (
                            choiceDistributionData ? (
                                <Box sx={{ height: 300 }}>
                                    <Bar data={choiceDistributionData} options={chartOptions} />
                                </Box>
                            ) : (
                                <Typography variant="body2" color="text.secondary">
                                    No voting data available.
                                </Typography>
                            )
                        )}
                    </CardContent>
                </Card>
            </Box>

            {/* Top choices section with improved tie handling */}
            {hasTopVotes && (
                <Card elevation={2}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <TrophyIcon sx={{ color: PlaceColors[1] }} />
                            {ballotType === 'RANKED_CHOICE' ? 'Top Choices (Borda Count)' : 'Top Choices'}
                        </Typography>
                        <Stack spacing={2}>
                            {(() => {
                                // Group choices by place to handle ties
                                const choicesByPlace = topChoices.reduce((acc, choice) => {
                                    if (!acc[choice.place]) acc[choice.place] = [];
                                    acc[choice.place].push(choice);
                                    return acc;
                                }, {} as { [key: number]: TopChoice[] });

                                return Object.entries(choicesByPlace)
                                    .sort(([a], [b]) => Number(a) - Number(b))
                                    .map(([place, choices], groupIndex, groups) => (
                                        <Box key={place}>
                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                                {choices.map((choice, index) => (
                                                    <Box key={choice.optionId} sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 1,
                                                        p: 1,
                                                        backgroundColor: theme.palette.action.hover,
                                                        borderRadius: 1,
                                                    }}>
                                                        <Chip
                                                            label={`#${place}${choices.length > 1 ? ' (Tie)' : ''}`}
                                                            size="small"
                                                            sx={{
                                                                bgcolor: PlaceColors[Number(place)],
                                                                color: '#000',
                                                                fontWeight: 'bold',
                                                                minWidth: '80px',
                                                            }}
                                                        />
                                                        <Typography 
                                                            variant="subtitle1" 
                                                            sx={{ 
                                                                flex: 1,
                                                                color: theme.palette.text.primary,
                                                            }}
                                                        >
                                                            {choice.title}
                                                        </Typography>
                                                        <Typography 
                                                            variant="subtitle1" 
                                                            sx={{ 
                                                                color: theme.palette.text.secondary,
                                                                minWidth: ballotType === 'RANKED_CHOICE' ? '100px' : '150px',
                                                                textAlign: 'right',
                                                            }}
                                                        >
                                                            {ballotType === 'RANKED_CHOICE' ? (
                                                                `Score: ${choice.votes}`
                                                            ) : (
                                                                `${choice.votes} votes (${((choice.votes / analytics.totalVotes) * 100).toFixed(1)}%)`
                                                            )}
                                                        </Typography>
                                                    </Box>
                                                ))}
                                            </Box>
                                            {groupIndex < groups.length - 1 && <Divider sx={{ my: 1 }} />}
                                        </Box>
                                    ));
                            })()}
                        </Stack>
                    </CardContent>
                </Card>
            )}
        </Box>
    );
};
