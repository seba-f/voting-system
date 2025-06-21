import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Paper, CircularProgress, Alert } from '@mui/material';
import { PageHeader } from '../components/PageHeader';
import API from '../api/axios';
import { SingleChoiceVoteForm } from './voteForms/SingleChoiceVoteForm';
import { BallotResults } from '../components/BallotResults';

interface Option {
    id: number;
    title: string;
}

interface Ballot {
    id: number;
    title: string;
    description: string;
    type: string;
    endDate: string;
    status: string;
    options: Option[];
}

const ViewBallot: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [ballot, setBallot] = useState<Ballot | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchBallot = async () => {
            try {
                const response = await API.get(`/ballots/${id}`);
                setBallot(response.data);
            } catch (err: any) {
                console.error('Error fetching ballot:', err);
                setError(err.response?.data?.message || 'Failed to load ballot');
            } finally {
                setLoading(false);
            }
        };

        fetchBallot();
    }, [id]);

    const handleVoteSubmit = async (vote: any) => {
        try {
            await API.post(`/ballots/${id}/vote`, vote);
            navigate('/dashboard');
        } catch (err: any) {
            console.error('Error submitting vote:', err);
            setError(err.response?.data?.message || 'Failed to submit vote');
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 3 }}>
                <PageHeader title="Error" />
                <Alert severity="error" sx={{ mt: 2 }}>
                    {error}
                </Alert>
            </Box>
        );
    }

    if (!ballot) {
        return (
            <Box sx={{ p: 3 }}>
                <PageHeader title="Ballot Not Found" />
                <Alert severity="warning" sx={{ mt: 2 }}>
                    The requested ballot could not be found.
                </Alert>
            </Box>
        );
    }

    const isBallotExpired = new Date(ballot.endDate) < new Date() || ballot.status !== 'Active';

    return (
        <Box sx={{ p: 3 }}>
            <PageHeader title={isBallotExpired ? "Ballot Results" : "Vote"} />
              {isBallotExpired ? (
                <BallotResults ballot={ballot} />
            ) : (
                <>
                    {ballot.type === 'SINGLE_CHOICE' ? (
                        <SingleChoiceVoteForm ballot={ballot} onSubmit={handleVoteSubmit} />
                    ) : (
                        <Paper sx={{ p: 3 }}>
                            <Typography variant="body1" color="text.secondary">
                                Voting form for {ballot.type} type ballots coming soon...
                            </Typography>
                        </Paper>
                    )}
                </>
            )}
        </Box>
    );
};

export default ViewBallot;
