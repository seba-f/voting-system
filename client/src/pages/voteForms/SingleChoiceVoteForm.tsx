import React, { useState, useEffect } from 'react';
import {
    Box,
    FormControl,
    FormControlLabel,
    RadioGroup,
    Radio,
    Button,
    Typography,
    Paper,
    Alert
} from '@mui/material';
import { scrollbarStyle } from '../../styles/scrollbar';

import { Ballot, Option } from '../../types/ballot';

interface SingleChoiceVoteFormProps {
    ballot: Ballot;
    onSubmit?: (vote: { optionId: number }) => Promise<void>;
    readOnly?: boolean;
    selectedOptionId?: number;
}

export const SingleChoiceVoteForm: React.FC<SingleChoiceVoteFormProps> = ({ 
    ballot, 
    onSubmit, 
    readOnly = false,
    selectedOptionId
}) => {
    console.log('[SingleChoiceVoteForm] Rendering with props:', {
        ballotId: ballot.id,
        readOnly,
        selectedOptionId,
        hasOnSubmit: !!onSubmit
    });

    const [selectedOption, setSelectedOption] = useState<number | null>(selectedOptionId ?? null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Update selectedOption when selectedOptionId prop changes
    useEffect(() => {
        if (selectedOptionId !== undefined) {
            setSelectedOption(selectedOptionId);
        }
    }, [selectedOptionId]);    

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('[SingleChoiceVoteForm] Attempting submit:', {
            readOnly,
            hasOnSubmit: !!onSubmit,
            selectedOption
        });

        if (!onSubmit || readOnly) {
            console.log('[SingleChoiceVoteForm] Submit prevented:', {
                reason: !onSubmit ? 'No onSubmit handler' : 'Form is readonly'
            });
            return;
        }

        if (selectedOption === null) {
            console.log('[SingleChoiceVoteForm] Submit prevented: No option selected');
            setError('Please select an option');
            return;
        }

        setError(null);
        setIsSubmitting(true);
        try {
            await onSubmit({ optionId: selectedOption });
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to submit vote. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Paper 
            component="form"
            onSubmit={handleSubmit}
            sx={{ 
                position: 'relative',
                maxHeight: '75vh',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                ...(readOnly && {
                    backgroundColor: 'action.disabledBackground',
                    '& .MuiFormControlLabel-root': {
                        cursor: 'default'
                    }
                })
            }}
        >
            {/* Header section - always visible */}
            <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider', flexShrink: 0 }}>
                <Typography variant="h6" gutterBottom>
                    {ballot.title}
                </Typography>
                <Typography variant="body1">
                    {ballot.description}
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                        {error}
                    </Alert>
                )}
            </Box>

            {/* Scrollable options section */}
            <Box sx={{
                flex: 1,
                minHeight: 0,
                overflow: 'auto',
                ...scrollbarStyle
            }}>
                <FormControl 
                    component="fieldset" 
                    sx={{ 
                        width: '100%',
                        p: 3,
                        pt:1
                    }}
                >
                    <RadioGroup
                        value={selectedOption ?? ''}
                        onChange={(e) => !readOnly && setSelectedOption(Number(e.target.value))}
                    >
                        {ballot.options.map((option) => (
                            <FormControlLabel
                                key={option.id}
                                value={option.id}
                                control={
                                    <Radio 
                                        disabled={readOnly}
                                        checked={selectedOption === option.id}
                                    />
                                }
                                label={option.title}
                                disabled={readOnly}
                                sx={{
                                    ...(readOnly && selectedOption === option.id && {
                                        '.MuiFormControlLabel-label': {
                                            fontWeight: 'bold',
                                            color: 'primary.main'
                                        }
                                    })
                                }}
                            />
                        ))}
                    </RadioGroup>
                </FormControl>
            </Box>

            {/* Footer section - always visible */}
            {!readOnly && (
                <Box sx={{ 
                    p: 2, 
                    display: 'flex', 
                    justifyContent: 'flex-end',
                    borderTop: 1,
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                    flexShrink: 0
                }}>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={isSubmitting || selectedOption === null}
                    >
                        {isSubmitting ? 'Submitting...' : 'Submit Vote'}
                    </Button>
                </Box>
            )}
        </Paper>
    );
};
