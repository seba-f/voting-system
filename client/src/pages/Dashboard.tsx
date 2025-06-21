import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../auth/AuthContext';
import { 
    Box, 
    Typography, 
    Card, 
    CardContent,
    CircularProgress,
    Alert
} from '@mui/material';
import { BallotCard } from '../components/BallotCard';
import API  from '../api/axios';
import { PageHeader } from '../components/PageHeader';

interface Ballot {
    id: number;
    title: string;
    description: string;
    startDate: Date;
    endDate: Date;
    status: string;
    type: string;
    allowedRoles: string[];
    categoryId: number;
}

export const Dashboard: React.FC = () => {
    const { user, isAdmin } = useAuth();
    const [ballots, setBallots] = useState<Ballot[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchBallots = useCallback(async () => {
        if (!user) {
            console.log('[Dashboard] No user found, skipping ballot fetch');
            return;
        }
        
        console.log('[Dashboard] Current user:', {
            id: user.id,
            username: user.username,
            roles: user.roles,
            isAdmin: isAdmin()
        });
        
        try {
            const cacheKey = `ballots-${isAdmin() ? 'admin' : 'user'}-${user.id}`;
            const cachedData = sessionStorage.getItem(cacheKey);
            const cachedTimestamp = sessionStorage.getItem(cacheKey + '-timestamp');
            
            // Use cached data if less than 30 seconds old
            if (cachedData && cachedTimestamp) {
                const age = Date.now() - parseInt(cachedTimestamp);
                if (age < 30000) { // 30 seconds
                    console.log('[Dashboard] Using cached ballot data, age:', age, 'ms');
                    setBallots(JSON.parse(cachedData));
                    setLoading(false);
                    return;
                }
            }

            const endpoint = isAdmin() ? '/ballots/active' : '/ballots/unvoted';
            console.log('[Dashboard] Fetching ballots from endpoint:', endpoint);

            const response = await API.get(endpoint);
            console.log('[Dashboard] Received ballots:', {
                count: response.data.length,
                ballots: response.data.map((b: Ballot) => ({ id: b.id, title: b.title, categoryId: b.categoryId }))
            });
            
            setBallots(response.data);
            
            // Cache the new data
            sessionStorage.setItem(cacheKey, JSON.stringify(response.data));
            sessionStorage.setItem(cacheKey + '-timestamp', Date.now().toString());
            setError(null);
        } catch (err: any) {
            console.error('[Dashboard] Error fetching ballots:', {
                message: err.message,
                response: err.response?.data
            });
            setError(err.response?.data?.message || 'Failed to load ballots');
        } finally {
            setLoading(false);
        }
    }, [isAdmin, user]);

    useEffect(() => {
        fetchBallots();
    }, [fetchBallots]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <PageHeader title={`Welcome, ${user?.username}!`} />

            <Box>
                <Typography variant="h5" gutterBottom sx={{ color: 'text.secondary', mb: 3 }}>
                    {isAdmin() ? 'Currently active ballots' : 'Ballots awaiting your vote'}
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}                {ballots.length === 0 ? (
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minHeight: '50vh',
                            backgroundColor: 'background.main',
                            borderRadius: 2,
                            p: 4,
                            textAlign: 'center'
                        }}
                    >
                        <Typography
                            variant="h6"
                            sx={{
                                color: 'text.secondary',
                                mb: 1,
                                fontWeight: 'medium'
                            }}
                        >
                            {isAdmin() 
                                ? 'No Active Ballots'
                                : 'All Caught Up!'}
                        </Typography>
                        <Typography
                            variant="body1"
                            sx={{
                                color: 'text.secondary',
                                maxWidth: '500px',
                                mx: 'auto'
                            }}
                        >
                            {isAdmin() 
                                ? 'There are currently no active ballots in the system. Create a new ballot to get started.'
                                : 'You\'ve voted on all available ballots. Check back later for new voting opportunities.'}
                        </Typography>
                    </Box>
                ) : (
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
                        {ballots.map(ballot => (
                            <BallotCard key={ballot.id} ballot={ballot} />
                        ))}
                    </Box>
                )}
            </Box>
        </Box>
    );
};