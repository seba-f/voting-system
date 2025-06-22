import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Paper, CircularProgress, Alert } from '@mui/material';
import { PageHeader } from '../components/PageHeader';
import API from '../api/axios';
import { SingleChoiceVoteForm } from './voteForms/SingleChoiceVoteForm';
import { YesNoVoteForm } from './voteForms/YesNoVoteForm';
import { MultipleChoiceVoteForm } from './voteForms/MultipleChoiceVoteForm';
import { TextInputVoteForm } from './voteForms/TextInputVoteForm';
import { BallotResults } from '../components/BallotResults';

import { Ballot, BallotType } from '../types/ballot';

const ViewBallot: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [ballot, setBallot] = useState<Ballot | null>(null);
    const [userVote, setUserVote] = useState<any | null>(null);
    const [userVotes, setUserVotes] = useState<any[]>([]);
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
                    
                    // Handle both single and multiple votes
                    if (Array.isArray(voteResponse.data)) {
                        setUserVotes(voteResponse.data);
                        setUserVote(voteResponse.data[0]); // For backward compatibility
                    } else {
                        setUserVote(voteResponse.data);
                        setUserVotes(voteResponse.data ? [voteResponse.data] : []);
                    }
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
            // Clear the ballots cache to force a refresh
            sessionStorage.removeItem('ballots-user-' + response.data.userId);
            sessionStorage.removeItem('ballots-user-' + response.data.userId + '-timestamp');
            // Update local state before navigating
            if (Array.isArray(response.data)) {
                setUserVotes(response.data);
                setUserVote(response.data[0]); // For backward compatibility
            } else {
                setUserVote(response.data);
                setUserVotes([response.data]);
            }
            navigate('/dashboard', { state: { voteJustSubmitted: true } });
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
    }    const hasVoted = ballot.type === 'MULTIPLE_CHOICE' ? userVotes.length > 0 : !!userVote;
    const isReadOnly = hasVoted || ballot.status === 'Ended' || ballot.status === 'Suspended';
    console.log('[ViewBallot] Rendering form with state:', {
        ballotId: ballot.id,
        hasVoted,
        isReadOnly,
        ballotStatus: ballot.status,
        userVotes: ballot.type === 'MULTIPLE_CHOICE' ? userVotes : undefined
    });

    const statusAlert = isReadOnly ? (
        <Alert 
            severity={userVote ? "info" : "warning"}
            sx={{
                '& .MuiAlert-message': {
                    padding: '4px 0',
                },
                '& .MuiAlert-icon': {
                    padding: '4px 0',
                }
            }}
        >            {hasVoted 
                ? "You've already voted on this ballot" 
                : "This ballot is no longer active"
            }
        </Alert>
    ) : null;

    const renderVoteForm = () => {
        if (!ballot) return null;

        const isExpired = new Date(ballot.endDate) < new Date();
        const isReadOnly = isExpired || userVote !== null;

        switch (ballot.type) {
            case 'SINGLE_CHOICE':
                return (
                    <SingleChoiceVoteForm
                        ballot={ballot}
                        onSubmit={!isReadOnly ? handleVoteSubmit : undefined}
                        readOnly={isReadOnly}
                        selectedOptionId={userVote?.optionId}
                    />
                );
            case 'YES_NO':
                return (
                    <YesNoVoteForm
                        ballot={ballot}
                        onSubmit={!isReadOnly ? handleVoteSubmit : undefined}
                        readOnly={isReadOnly}
                        selectedOptionId={userVote?.optionId}
                    />
                );
            case 'MULTIPLE_CHOICE':
                return (
                    <MultipleChoiceVoteForm
                        ballot={ballot}
                        onSubmit={!isReadOnly ? handleVoteSubmit : undefined}
                        readOnly={isReadOnly}
                        selectedOptionIds={userVotes.map(v => v.optionId)}
                    />
                );
            case 'TEXT_INPUT':
                return (
                    <TextInputVoteForm
                        ballot={ballot}
                        onSubmit={!isReadOnly ? handleVoteSubmit : undefined}
                        readOnly={isReadOnly}
                        selectedOptionId={userVote?.optionId}
                        existingResponse={userVote?.textResponse}
                    />
                );
            default:
                return <Typography>Unsupported ballot type</Typography>;
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <PageHeader 
                title="View Ballot"
                statusAlert={statusAlert}
            />
            
            {renderVoteForm()}
            {/* Add similar blocks for other ballot types */}
        </Box>
    );
}

export default ViewBallot;
