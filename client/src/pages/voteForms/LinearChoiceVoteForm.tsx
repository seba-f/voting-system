import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Typography,
    Paper,
    Alert,
    useTheme,
    Slider,
    Stack
} from '@mui/material';
import { scrollbarStyle } from '../../styles/scrollbar';
import { Ballot } from '../../types/ballot';

interface LinearChoiceVoteFormProps {
    ballot: Ballot;
    onSubmit?: (vote: { optionId: number }) => Promise<void>;
    readOnly?: boolean;
    selectedOptionId?: number;
}

export const LinearChoiceVoteForm: React.FC<LinearChoiceVoteFormProps> = ({
    ballot,
    onSubmit,
    readOnly = false,
    selectedOptionId
}) => {
    const theme = useTheme();
    const [selectedValue, setSelectedValue] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Process options to extract scale properties
    const options = ballot.options.map(opt => {
        const [value, label] = opt.title.split(',');
        return {
            id: opt.id,
            value: parseInt(value),
            label: label || value
        };
    }).sort((a, b) => a.value - b.value);

    const minOption = options[0];
    const maxOption = options[options.length - 1];

    // If in read-only mode and we have a selected option, find its value
    useEffect(() => {
        if (selectedOptionId) {
            const selected = options.find(opt => opt.id === selectedOptionId);
            if (selected) {
                setSelectedValue(selected.value);
            }
        }
    }, [selectedOptionId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!onSubmit || readOnly) {
            return;
        }

        if (selectedValue === null) {
            setError('Please select a value');
            return;
        }

        setError(null);
        setIsSubmitting(true);
        try {
            // Find the option ID that matches the selected value
            const option = options.find(opt => opt.value === selectedValue);
            if (!option) {
                throw new Error('Invalid selection');
            }
            await onSubmit({ optionId: option.id });
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to submit vote. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const marks = [
        {
            value: minOption.value,
            label: minOption.label || minOption.value.toString()
        },
        {
            value: maxOption.value,
            label: maxOption.label || maxOption.value.toString()
        }
    ];

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
                <Stack spacing={4}>
                    <Box>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                            Select a value between {minOption.value} and {maxOption.value}
                        </Typography>
                        <Box sx={{ px: 2, py: 3 }}>
                            <Slider
                                value={selectedValue ?? minOption.value}
                                onChange={(_, value) => setSelectedValue(value as number)}
                                min={minOption.value}
                                max={maxOption.value}
                                step={1}
                                marks={marks}
                                disabled={readOnly}
                                valueLabelDisplay="on"
                            />
                        </Box>
                    </Box>

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
                            {isSubmitting ? 'Submitting...' : 'Submit Vote'}
                        </Button>
                    )}
                </Stack>
            </Box>
        </Paper>
    );
};
