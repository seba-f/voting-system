import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../auth/AuthContext';
import { useLocation } from 'react-router-dom';
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
import { contentContainerStyle, scrollableContentStyle } from '../styles/scrollbar';

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

interface BallotResponse {
    voted: Ballot[];
    unvoted: Ballot[];
}

// user dashboard showing active ballots and recent activity
export const Dashboard: React.FC = () => {
    const { user, isAdmin } = useAuth();
    const location = useLocation();
    const [ballots, setBallots] = useState<Ballot[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);

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
            // For admin users, always fetch fresh data
            if (isAdmin()) {
                const endpoint = '/ballots/active';
                console.log('[Dashboard] Admin user - fetching fresh data from:', endpoint);
                const response = await API.get(endpoint);
                setBallots(response.data || []);
                setLoading(false);
                return;
            }

            // For regular users, use caching logic
            const cacheKey = `ballots-user-${user.id}`;
            const cachedData = sessionStorage.getItem(cacheKey);
            const cachedTimestamp = sessionStorage.getItem(cacheKey + '-timestamp');
            
            const voteJustSubmitted = location.state?.voteJustSubmitted;
            if (!voteJustSubmitted && cachedData && cachedTimestamp) {
                const age = Date.now() - parseInt(cachedTimestamp);
                if (age < 30000) { // 30 seconds
                    console.log('[Dashboard] Using cached ballot data, age:', age, 'ms');
                    setBallots(JSON.parse(cachedData));
                    setLoading(false);
                    return;
                }
            }

            const endpoint = '/ballots/active-with-status';
            console.log('[Dashboard] Fetching ballots from endpoint:', endpoint);

            const response = await API.get(endpoint);
            const ballotsToShow = (response.data as BallotResponse).unvoted;

            console.log('[Dashboard] Processing ballots:', {
                total: ballotsToShow?.length || 0,
                dataType: Array.isArray(ballotsToShow) ? 'array' : typeof ballotsToShow
            });
            
            setBallots(ballotsToShow || []);
            
            // Cache the new data only for regular users
            sessionStorage.setItem(cacheKey, JSON.stringify(ballotsToShow));
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
    }, [user, isAdmin, location.state?.voteJustSubmitted]);

    useEffect(() => {
        fetchBallots();
        // Clear the voteJustSubmitted flag from location state
        if (location.state?.voteJustSubmitted) {
            window.history.replaceState({}, document.title);
        }
    }, [fetchBallots]);

    if (loading) {
        return (
            <Box sx={contentContainerStyle}>
                <PageHeader title={`Welcome, ${user?.username}!`} />
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <CircularProgress />
                </Box>
            </Box>
        );
    }

    return (
        <Box sx={contentContainerStyle}>
            <PageHeader title={`Welcome, ${user?.username}!`} />

            <Box sx={scrollableContentStyle}>
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