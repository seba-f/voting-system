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
    const [userVote, setUserVote] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const searchParams = new URLSearchParams(window.location.search);
    const isVoted = searchParams.get('voted') === 'true';

    console.log('[ViewBallot] Initializing with:', {
        ballotId: id,
        isVoted,
        searchParams: Object.fromEntries(searchParams.entries())
    });

    // Fetch both ballot and vote data on component mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                console.log('[ViewBallot] Fetching ballot data...');
                const ballotResponse = await API.get(`/ballots/${id}`);
                console.log('[ViewBallot] Received ballot:', ballotResponse.data);
                setBallot(ballotResponse.data);

                // Always try to fetch vote data, not just when isVoted is true
                try {
                    console.log('[ViewBallot] Fetching user vote...');
                    const voteResponse = await API.get(`/ballots/${id}/vote`);
                    console.log('[ViewBallot] Received user vote:', voteResponse.data);
                    setUserVote(voteResponse.data);
                } catch (voteErr: any) {
                    console.error('[ViewBallot] Error fetching user vote:', {
                        error: voteErr,
                        response: voteErr.response?.data,
                        status: voteErr.response?.status
                    });
                    if (voteErr.response?.status !== 404) {
                        // Only log non-404 errors as actual errors
                        console.error('Error fetching vote:', voteErr);
                    }
                }
            } catch (err: any) {
                console.error('Error fetching ballot:', err);
                setError(err.response?.data?.message || 'Failed to load ballot');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]); // Removed isVoted from dependencies since we always want to check for votes

    const handleVoteSubmit = async (vote: any) => {
        console.log('[ViewBallot] Submitting vote:', {
            vote,
            ballotId: id,
            userVoteExists: !!userVote
        });
        
        try {
            const response = await API.post(`/ballots/${id}/vote`, vote);
            console.log('[ViewBallot] Vote submitted successfully:', response.data);
            // Update local state before navigating
            setUserVote(response.data);
            navigate('/dashboard');
        } catch (err: any) {
            console.error('[ViewBallot] Error submitting vote:', {
                error: err,
                response: err.response?.data,
                status: err.response?.status
            });
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
                <PageHeader title="View Ballot" />
                <Alert severity="error" sx={{ mt: 2 }}>
                    {error}
                </Alert>
            </Box>
        );
    }

    if (!ballot) {
        return (
            <Box sx={{ p: 3 }}>
                <PageHeader title="View Ballot" />
                <Alert severity="error" sx={{ mt: 2 }}>
                    Ballot not found
                </Alert>
            </Box>
        );
    }

    const isReadOnly = !!userVote || ballot.status === 'Ended' || ballot.status === 'Suspended';
    console.log('[ViewBallot] Rendering form with state:', {
        ballotId: ballot.id,
        hasUserVote: !!userVote,
        isReadOnly,
        ballotStatus: ballot.status
    });

    return (
        <Box sx={{ p: 3 }}>
            <PageHeader title="View Ballot" />
            
            {isReadOnly && (
                <Alert 
                    severity={userVote ? "info" : "warning"} 
                    sx={{ mt: 2, mb: 2 }}
                >
                    {userVote 
                        ? "You've already voted on this ballot" 
                        : "This ballot is no longer active"
                    }
                </Alert>
            )}
            
            {ballot.type === 'SINGLE_CHOICE' && (
                <SingleChoiceVoteForm
                    ballot={ballot}
                    onSubmit={!isReadOnly ? handleVoteSubmit : undefined}
                    readOnly={isReadOnly}
                    selectedOptionId={userVote?.optionId}
                />
            )}
            {/* Add similar blocks for other ballot types */}
        </Box>
    );
}

export default ViewBallot;
