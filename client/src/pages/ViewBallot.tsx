import React from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Paper } from '@mui/material';
import { PageHeader } from '../components/PageHeader';

const ViewBallot: React.FC = () => {
    const { id } = useParams();

    return (
        <Box sx={{p:3}}>
            <PageHeader title="Vote" />
            <Paper sx={{ p: 3, mx:'auto'}}>
                <Typography variant="h6" gutterBottom>
                    Ballot Voting View
                </Typography>
                <Typography variant="body1" paragraph>
                    Ballot ID: {id}
                </Typography>
                <Typography variant="body1">
                    This is the user voting view of the ballot (placeholder)
                </Typography>
            </Paper>
        </Box>
    );
};

export default ViewBallot;
