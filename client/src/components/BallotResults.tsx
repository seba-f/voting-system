import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { ParticipationCard } from './ballot/ParticipationCard';
import { LinearChoiceDistributionCard } from './ballot/LinearChoiceDistributionCard';
import { Ballot, BallotType } from '../types/ballot';

interface AnalyticsData {
    totalVotes: number;
    totalVoters: number;
    eligibleUsers: number;
    participationRate: number;
    optionCounts?: {
        [key: number]: number;
    };
    textResponses?: {
        optionId: number;
        response: string;
    }[];
}

interface BallotResultsProps {
    ballot: Ballot;
    analytics?: AnalyticsData;
}

export const BallotResults: React.FC<BallotResultsProps> = ({ ballot, analytics }) => {
    if (!analytics) {
        return (
            <Paper sx={{ p: 3 }}>
                <Typography variant="body1" color="text.secondary">
                    Loading analytics...
                </Typography>
            </Paper>
        );
    }

    return (
        <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
                Results
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Participation Card - full width for text input, 1/3 width for others */}
                <Box sx={{ 
                    width: ballot.type === BallotType.TEXT_INPUT ? '100%' : { xs: '100%', md: '33%' }
                }}>
                    <ParticipationCard
                        participationRate={analytics.participationRate}
                        totalVotes={analytics.totalVotes}
                        totalVoters={analytics.totalVoters}
                        eligibleUsers={analytics.eligibleUsers}
                    />
                </Box>

                {/* Choice distribution - hide for text input */}
                {ballot.type !== BallotType.TEXT_INPUT && (
                    <Box sx={{ flex: 1 }}>
                        {ballot.type === BallotType.LINEAR_CHOICE ? (
                            <LinearChoiceDistributionCard
                                options={ballot.options}
                                optionCounts={analytics.optionCounts || {}}
                                totalVotes={analytics.totalVotes}
                            />
                        ) : (
                            <Typography variant="body1" color="text.secondary">
                                Choice distribution visualization coming soon...
                            </Typography>
                        )}
                    </Box>
                )}

                {/* Text responses - show only for text input */}
                {ballot.type === BallotType.TEXT_INPUT && analytics.textResponses && (
                    <Box>
                        <Typography variant="h6" gutterBottom>
                            Responses
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {analytics.textResponses.map((response, index) => (
                                <Paper
                                    key={index}
                                    sx={{
                                        p: 2,
                                        backgroundColor: 'background.default'
                                    }}
                                >
                                    <Typography variant="body1">
                                        {response.response}
                                    </Typography>
                                </Paper>
                            ))}
                        </Box>
                    </Box>
                )}
            </Box>
        </Paper>
    );
};
