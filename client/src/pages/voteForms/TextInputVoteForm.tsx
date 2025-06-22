import React, { useState, useEffect } from 'react';
import {
    Box,
    TextField,
    Button,
    Typography,
    Paper,
    Alert,
    useTheme
} from '@mui/material';
import { scrollbarStyle } from '../../styles/scrollbar';
import { Ballot } from '../../types/ballot';

interface TextInputVoteFormProps {
    ballot: Ballot;
    onSubmit?: (vote: { optionId: number; textResponse: string }) => Promise<void>;
    readOnly?: boolean;
    selectedOptionId?: number;
    existingResponse?: string;
}

export const TextInputVoteForm: React.FC<TextInputVoteFormProps> = ({
    ballot,
    onSubmit,
    readOnly = false,
    selectedOptionId,
    existingResponse = ''
}) => {
    const theme = useTheme();
    const [textResponse, setTextResponse] = useState(existingResponse);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Update text response when existingResponse prop changes
    useEffect(() => {
        if (existingResponse) {
            setTextResponse(existingResponse);
        }
    }, [existingResponse]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!onSubmit || readOnly) {
            return;
        }

        if (!textResponse.trim()) {
            setError('Please enter a response');
            return;
        }

        setError(null);
        setIsSubmitting(true);
        try {
            // We assume the first (and only) option is the text input option
            await onSubmit({
                optionId: ballot.options[0].id,
                textResponse: textResponse.trim()
            });
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to submit response. Please try again.');
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
                    backgroundColor: theme.palette.action.disabledBackground,
                    cursor: 'default'
                })
            }}
        >
            <Box
                sx={{
                    p: 3,
                    overflowY: 'auto',
                    ...scrollbarStyle
                }}
            >
                <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Your Response"
                    value={textResponse}
                    onChange={(e) => setTextResponse(e.target.value)}
                    disabled={readOnly || isSubmitting}
                    placeholder="Enter your response here..."
                    error={!!error && !textResponse.trim()}
                    helperText={error}
                    sx={{ mb: 2 }}
                />

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {!readOnly && (
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={isSubmitting}
                        fullWidth
                    >
                        {isSubmitting ? 'Submitting...' : 'Submit Response'}
                    </Button>
                )}
            </Box>
        </Paper>
    );
};
