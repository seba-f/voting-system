import React, { useState } from 'react';
import {
    Box,
    FormControl,
    FormControlLabel,
    RadioGroup,
    Radio,
    Button,
    Typography,
    Paper
} from '@mui/material';

interface YesNoVoteFormProps {
    ballot: {
        id: number;
        title: string;
        description: string;
    };
    onSubmit: (vote: { value: 'yes' | 'no' }) => Promise<void>;
}

export const YesNoVoteForm: React.FC<YesNoVoteFormProps> = ({ ballot, onSubmit }) => {
    const [value, setValue] = useState<'yes' | 'no' | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!value) return;

        setIsSubmitting(true);
        try {
            await onSubmit({ value });
        } catch (error) {
            console.error('Error submitting vote:', error);
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

            <form onSubmit={handleSubmit}>
                <FormControl component="fieldset">
                    <RadioGroup
                        value={value || ''}
                        onChange={(e) => setValue(e.target.value as 'yes' | 'no')}
                    >
                        <FormControlLabel 
                            value="yes" 
                            control={<Radio />} 
                            label="Yes"
                            sx={{ mb: 1 }}
                        />
                        <FormControlLabel 
                            value="no" 
                            control={<Radio />} 
                            label="No"
                        />
                    </RadioGroup>
                </FormControl>

                <Box sx={{ mt: 3 }}>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={!value || isSubmitting}
                    >
                        {isSubmitting ? 'Submitting...' : 'Submit Vote'}
                    </Button>
                </Box>
            </form>
        </Paper>
    );
};
