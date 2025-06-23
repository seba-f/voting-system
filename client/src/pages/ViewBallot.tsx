import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Paper, CircularProgress, Alert } from '@mui/material';
import { PageHeader } from '../components/PageHeader';
import API from '../api/axios';
import { SingleChoiceVoteForm } from './voteForms/SingleChoiceVoteForm';
import { YesNoVoteForm } from './voteForms/YesNoVoteForm';
import { MultipleChoiceVoteForm } from './voteForms/MultipleChoiceVoteForm';
import { TextInputVoteForm } from './voteForms/TextInputVoteForm';
import { LinearChoiceVoteForm } from './voteForms/LinearChoiceVoteForm';
import { RankedChoiceVoteForm } from './voteForms/RankedChoiceVoteForm';
import { BallotResults } from '../components/BallotResults';
import { BallotResultsSummary } from '../components/ballot/BallotResultsSummary';
import { useAuth } from '../auth/AuthContext';
import { contentContainerStyle, scrollableContentStyle } from '../styles/scrollbar';

import { Ballot, BallotType } from '../types/ballot';

const ViewBallot: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAdmin } = useAuth();
    const [ballot, setBallot] = useState<Ballot | null>(null);
    const [userVote, setUserVote] = useState<any | null>(null);
    const [userVotes, setUserVotes] = useState<any[]>([]);
    const [analytics, setAnalytics] = useState<any | null>(null);
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
                const [ballotResponse, analyticsResponse] = await Promise.all([
                    API.get(`/ballots/${id}`),
                    API.get(`/ballots/${id}/analytics`)
                ]);
                console.log('[ViewBallot] Received ballot:', ballotResponse.data);
                setBallot(ballotResponse.data);
                setAnalytics(analyticsResponse.data);

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
            <Box sx={contentContainerStyle}>
                <PageHeader title="View Ballot" />
                <Box sx={scrollableContentStyle}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                        <CircularProgress />
                    </Box>
                </Box>
            </Box>
        );
    }

    if (!ballot) {
        return (
            <Box sx={contentContainerStyle}>
                <PageHeader title="View Ballot" />
                <Box sx={scrollableContentStyle}>
                    <Alert severity="error" sx={{ m: 3 }}>
                        Ballot not found
                    </Alert>
                </Box>
            </Box>
        );
    }

    const hasVoted = ballot.type === 'MULTIPLE_CHOICE' ? userVotes.length > 0 : !!userVote;
    const isEnded = ballot.status === 'Ended';
    const isSuspended = ballot.status === 'Suspended';
    const isReadOnly = hasVoted || isEnded || isSuspended;
    const shouldShowResults = isEnded && !isAdmin();

    console.log('[ViewBallot] Rendering with state:', {
        ballotId: ballot.id,
        hasVoted,
        isReadOnly,
        isEnded,
        isSuspended,
        shouldShowResults,
        ballotStatus: ballot.status,
        userVotes: ballot.type === 'MULTIPLE_CHOICE' ? userVotes : undefined
    });

    const getStatusMessage = () => {
        if (hasVoted) {
            return "You've already voted on this ballot";
        }
        if (isSuspended) {
            return "This ballot has been suspended by an administrator";
        }
        if (isEnded && isAdmin()) {
            return "This ballot has ended";
        }
        return "";
    };

    const getStatusSeverity = () => {
        if (hasVoted) return "info";
        if (isSuspended) return "warning";
        return "info";
    };

    const statusAlert = isReadOnly && !shouldShowResults ? (
        <Alert 
            severity={getStatusSeverity()}
            sx={{
                '& .MuiAlert-message': {
                    padding: '4px 0',
                },
                '& .MuiAlert-icon': {
                    padding: '4px 0',
                }
            }}
        >
            {getStatusMessage()}
        </Alert>
    ) : null;

    const renderVoteForm = () => {
        if (!ballot) return null;

        // Check for expired, voted, or suspended status
        const isExpired = new Date(ballot.endDate) < new Date();
        const isFormReadOnly = isExpired || userVote !== null || ballot.status === 'Suspended';

        switch (ballot.type) {
            case 'RANKED_CHOICE':
                return (
                    <RankedChoiceVoteForm
                        ballot={ballot}
                        onSubmit={!isFormReadOnly ? handleVoteSubmit : undefined}
                        readOnly={isFormReadOnly}
                        selectedOptionIds={userVote ? [userVote.optionId] : []}
                    />
                );
            case 'SINGLE_CHOICE':
                return (
                    <SingleChoiceVoteForm
                        ballot={ballot}
                        onSubmit={!isFormReadOnly ? handleVoteSubmit : undefined}
                        readOnly={isFormReadOnly}
                        selectedOptionId={userVote?.optionId}
                    />
                );
            case 'YES_NO':
                return (
                    <YesNoVoteForm
                        ballot={ballot}
                        onSubmit={!isFormReadOnly ? handleVoteSubmit : undefined}
                        readOnly={isFormReadOnly}
                        selectedOptionId={userVote?.optionId}
                    />
                );
            case 'MULTIPLE_CHOICE':
                return (
                    <MultipleChoiceVoteForm
                        ballot={ballot}
                        onSubmit={!isFormReadOnly ? handleVoteSubmit : undefined}
                        readOnly={isFormReadOnly}
                        selectedOptionIds={userVotes.map(v => v.optionId)}
                    />
                );
            case 'TEXT_INPUT':
                return (
                    <TextInputVoteForm
                        ballot={ballot}
                        onSubmit={!isFormReadOnly ? handleVoteSubmit : undefined}
                        readOnly={isFormReadOnly}
                        selectedOptionId={userVote?.optionId}
                        existingResponse={userVote?.textResponse}
                    />                );
            case 'LINEAR_CHOICE':
                return (
                    <LinearChoiceVoteForm
                        ballot={ballot}
                        onSubmit={!isFormReadOnly ? handleVoteSubmit : undefined}
                        readOnly={isFormReadOnly}
                        selectedOptionId={userVote?.optionId}
                    />
                );
            default:
                return <Typography>Unsupported ballot type</Typography>;
        }
    };    const renderAnalytics = () => {
        if (!analytics) return null;

        return (
            <BallotResultsSummary
                analytics={analytics}
                ballotType={ballot.type}
            />
        );
    };return (
        <Box sx={contentContainerStyle}>
            <PageHeader 
                title={shouldShowResults ? ballot.title : "View Ballot"}
                statusAlert={statusAlert}
            />
            
            <Paper sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <Box sx={scrollableContentStyle}>
                    {shouldShowResults && analytics ? (
                        <BallotResultsSummary 
                            analytics={analytics}
                            ballotType={ballot.type}
                        />
                    ) : (
                        <Box sx={{ p: 3 }}>
                            {renderVoteForm()}
                        </Box>
                    )}
                </Box>
            </Paper>
        </Box>
    );
}

export default ViewBallot;
