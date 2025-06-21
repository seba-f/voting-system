import React, { useState } from 'react';
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
    onSubmit: (vote: { optionId: number }) => Promise<void>;
}

export const SingleChoiceVoteForm: React.FC<SingleChoiceVoteFormProps> = ({ ballot, onSubmit }) => {
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedOption === null) {
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
        <Paper sx={{ p: 3 }}>
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

            <form onSubmit={handleSubmit}>
                <FormControl component="fieldset" fullWidth>
                    <RadioGroup
                        value={selectedOption || ''}
                        onChange={(e) => setSelectedOption(Number(e.target.value))}
                    >
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            {ballot.options.map((option) => (
                                <FormControlLabel
                                    key={option.id}
                                    value={option.id}
                                    control={<Radio />}
                                    label={
                                        <Typography variant="body1">
                                            {option.title}
                                        </Typography>
                                    }
                                    sx={{
                                        p: 1,
                                        border: 1,
                                        borderColor: 'divider',
                                        borderRadius: 1,
                                        '&:hover': {
                                            backgroundColor: 'action.hover',
                                        }
                                    }}
                                />
                            ))}
                        </Box>
                    </RadioGroup>
                </FormControl>

                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={selectedOption === null || isSubmitting}
                        sx={{ minWidth: 120 }}
                    >
                        {isSubmitting ? 'Submitting...' : 'Submit Vote'}
                    </Button>
                </Box>
            </form>
        </Paper>
    );
};
