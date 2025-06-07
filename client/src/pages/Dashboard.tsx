import React, { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { 
    Box, 
    Typography, 
    Card, 
    CardContent,
    CircularProgress,
    Grid
} from '@mui/material';
import { BallotCard } from '../components/dashboard/BallotCard';
import API  from '../api/axios';

interface Ballot {
    id: string;
    title: string;
    description: string;
    startDate: Date;
    endDate: Date;
    status: string;
    type: string;
    allowedRoles: string[];
}

export const Dashboard: React.FC = () => {
    const { user, isAdmin } = useAuth();
    const [ballots, setBallots] = useState<Ballot[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchBallots = async () => {
            try {
                const response = await API.get(
                    isAdmin() ? '/ballots/active' : '/ballots/active/user'
                );
                setBallots(response.data);
            } catch (err) {
                setError('Failed to load ballots');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchBallots();
    }, [isAdmin]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Welcome, {user?.username}!
            </Typography>

            <Box sx={{ mt: 4 }}>
                <Typography variant="h5" gutterBottom>
                    Currently active ballots
                </Typography>

                {error && (
                    <Typography color="error" sx={{ mb: 2 }}>
                        {error}
                    </Typography>
                )}

                <Grid container spacing={3}>
                    {ballots.length === 0 ? (
                        <Grid size= {{xs:12}}>
                            <Card>
                                <CardContent>
                                    <Typography color="text.secondary">
                                        No active ballots available.
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ) : (
                        ballots.map(ballot => (
                            <Grid size={{xs:12, md:6}} key={ballot.id}>
                                <BallotCard ballot={ballot} />
                            </Grid>
                        ))
                    )}
                </Grid>
            </Box>
        </Box>
    );
};