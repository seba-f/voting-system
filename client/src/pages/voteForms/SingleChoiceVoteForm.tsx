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

interface Option {
    id: number;
    title: string;
}

interface Ballot {
    id: number;
    title: string;
    description: string;
    options: Option[];
}

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
                p: 3,
                position: 'relative',
                ...(readOnly && {
                    backgroundColor: 'action.disabledBackground',
                    '& .MuiFormControlLabel-root': {
                        cursor: 'default'
                    }
                })
            }}
        >
            <Typography variant="h6" gutterBottom>
                {ballot.title}
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
                {ballot.description}
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            <FormControl component="fieldset" sx={{ width: '100%' }}>
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

            {!readOnly && (
                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
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
