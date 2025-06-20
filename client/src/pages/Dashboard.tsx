import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../auth/AuthContext';
import { 
    Box, 
    Typography, 
    Card, 
    CardContent,
    CircularProgress,
    Grid
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
    const [error, setError] = useState<string | null>(null);    const fetchBallots = useCallback(async () => {
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

            const endpoint = isAdmin() ? '/ballots/active' : `/ballots/active/${user.id}`;
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
        } catch (err: any) {
            console.error('[Dashboard] Error fetching ballots:', {
                message: err.message,
                response: err.response?.data
            });
            setError('Failed to load ballots');
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
                    Currently active ballots
                </Typography>

                {error && (
                    <Typography color="error" sx={{ mb: 2 }}>
                        {error}
                    </Typography>
                )}

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
                    {ballots.length === 0 ? (
                        <Card>
                            <CardContent>
                                <Typography color="text.secondary">
                                    No active ballots available.
                                </Typography>
                            </CardContent>
                        </Card>
                    ) : (
                        ballots.map(ballot => (
                            <BallotCard key={ballot.id} ballot={ballot} />
                        ))
                    )}
                </Box>
            </Box>
        </Box>
    );
};