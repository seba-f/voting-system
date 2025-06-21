import React from 'react';
import { Box, Paper, Typography } from '@mui/material';

interface BallotResultsProps {
    ballot: {
        id: number;
        title: string;
        description: string;
        type: string;
    };
}

export const BallotResults: React.FC<BallotResultsProps> = ({ ballot }) => {
    return (
        <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
                {ballot.title}
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
                {ballot.description}
            </Typography>

            <Box sx={{ mt: 3 }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                    Results
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Results visualization coming soon... (Ballot type: {ballot.type})
                </Typography>
            </Box>
        </Paper>
    );
};
