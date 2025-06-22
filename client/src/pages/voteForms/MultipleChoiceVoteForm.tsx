import React, { useState, useEffect } from 'react';
import {
    Box,
    FormControl,
    FormControlLabel,
    Checkbox,
    Button,
    Typography,
    Paper,
    Alert,
    FormGroup
} from '@mui/material';
import { scrollbarStyle } from '../../styles/scrollbar';

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

interface MultipleChoiceVoteFormProps {
    ballot: Ballot;
    onSubmit?: (vote: { optionIds: number[] }) => Promise<void>;
    readOnly?: boolean;
    selectedOptionIds?: number[];
}

export const MultipleChoiceVoteForm: React.FC<MultipleChoiceVoteFormProps> = ({ 
    ballot, 
    onSubmit, 
    readOnly = false,
    selectedOptionIds = []
}) => {
    console.log('[MultipleChoiceVoteForm] Rendering with props:', {
        ballotId: ballot.id,
        readOnly,
        selectedOptionIds,
        hasOnSubmit: !!onSubmit
    });

    const [selectedOptions, setSelectedOptions] = useState<number[]>(selectedOptionIds);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Update selectedOptions when selectedOptionIds prop changes
    useEffect(() => {
        setSelectedOptions(selectedOptionIds);
    }, [selectedOptionIds]);

    const handleOptionChange = (optionId: number) => (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
            setSelectedOptions(prev => [...prev, optionId]);
        } else {
            setSelectedOptions(prev => prev.filter(id => id !== optionId));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('[MultipleChoiceVoteForm] Attempting submit:', {
            readOnly,
            hasOnSubmit: !!onSubmit,
            selectedOptions
        });

        if (!onSubmit || readOnly) {
            console.log('[MultipleChoiceVoteForm] Submit prevented:', {
                reason: !onSubmit ? 'No onSubmit handler' : 'Form is readonly'
            });
            return;
        }

        if (selectedOptions.length === 0) {
            console.log('[MultipleChoiceVoteForm] Submit prevented: No options selected');
            setError('Please select at least one option');
            return;
        }

        setError(null);
        setIsSubmitting(true);
        try {
            await onSubmit({ optionIds: selectedOptions });
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
                    cursor: 'not-allowed'
                })
            }}
        >
            <Box sx={{ p: 3, overflow: 'auto', ...scrollbarStyle }}>
                <Typography variant="h6" gutterBottom>
                    {ballot.title}
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                    {ballot.description}
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <FormControl component="fieldset" fullWidth>
                    <FormGroup>
                        {ballot.options.map((option) => (
                            <FormControlLabel
                                key={option.id}
                                control={
                                    <Checkbox
                                        checked={selectedOptions.includes(option.id)}
                                        onChange={handleOptionChange(option.id)}
                                        disabled={readOnly}
                                    />
                                }
                                label={option.title}
                            />
                        ))}
                    </FormGroup>
                </FormControl>
            </Box>

            {!readOnly && onSubmit && (
                <Box sx={{ 
                    p: 2, 
                    borderTop: 1, 
                    borderColor: 'divider',
                    bgcolor: 'background.paper'
                }}>
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        fullWidth
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Submitting...' : 'Submit Vote'}
                    </Button>
                </Box>
            )}
        </Paper>
    );
};
