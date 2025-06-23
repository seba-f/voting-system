import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Typography,
    Paper,
    Alert,
    List,
    ListItem,
    ListItemText,
    IconButton,
    styled,
} from '@mui/material';
import DragHandleIcon from '@mui/icons-material/DragHandle';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { scrollbarStyle } from '../../styles/scrollbar';
import { Ballot } from '../../types/ballot';

interface RankedChoiceVoteFormProps {
    ballot: Ballot;
    onSubmit?: (vote: { optionIds: number[] }) => Promise<void>;
    readOnly?: boolean;
    selectedOptionIds?: number[];
}

const DragItem = styled(ListItem)(({ theme }) => ({
    backgroundColor: theme.palette.background.paper,
    marginBottom: theme.spacing(1),
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
    '&:last-child': {
        marginBottom: 0,
    },
    '&.dragging': {
        backgroundColor: theme.palette.action.hover,
    },
}));

// drag-and-drop ranked choice voting form with preference ordering
export const RankedChoiceVoteForm: React.FC<RankedChoiceVoteFormProps> = ({
    ballot,
    onSubmit,
    readOnly = false,
    selectedOptionIds = []
}) => {
    const [rankedOptions, setRankedOptions] = useState<Array<{ id: number; title: string }>>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Initialize or update ranked options when ballot or selectedOptionIds change
    useEffect(() => {
        if (selectedOptionIds.length > 0) {
            // If we have selected options, order the ballot options according to the selection
            const orderedOptions = selectedOptionIds.map(id => {
                const option = ballot.options.find(opt => opt.id === id);
                return option ? { id: option.id, title: option.title } : null;
            }).filter((opt): opt is { id: number; title: string } => opt !== null);

            // Add any remaining unranked options
            const remainingOptions = ballot.options
                .filter(opt => !selectedOptionIds.includes(opt.id))
                .map(opt => ({ id: opt.id, title: opt.title }));

            setRankedOptions([...orderedOptions, ...remainingOptions]);
        } else {
            // If no selection, initialize with ballot options in original order
            setRankedOptions(ballot.options.map(opt => ({
                id: opt.id,
                title: opt.title
            })));
        }
    }, [ballot, selectedOptionIds]);

    const handleDragEnd = (result: any) => {
        if (!result.destination || readOnly) return;

        const items = Array.from(rankedOptions);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);
        setRankedOptions(items);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!onSubmit || readOnly) {
            return;
        }

        // All options must be ranked
        if (rankedOptions.length !== ballot.options.length) {
            setError('Please rank all options');
            return;
        }

        setError(null);
        setIsSubmitting(true);

        try {
            await onSubmit({ optionIds: rankedOptions.map(opt => opt.id) });
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
            <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="h6" gutterBottom>
                    {ballot.title}
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                    {ballot.description}
                </Typography>
                
                <Typography variant="body2" color="text.secondary">
                    {readOnly 
                        ? "Here's how you ranked the options:"
                        : "Drag and drop to rank the options in your preferred order (1 = most preferred)"}
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                        {error}
                    </Alert>
                )}
            </Box>

            <Box sx={{ 
                flex: 1,
                overflow: 'auto',
                ...scrollbarStyle,
                px: 3,
                py: 2
            }}>
                <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="ranked-options">
                        {(provided) => (
                            <List 
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                                sx={{ py: 0 }}
                            >
                                {rankedOptions.map((option, index) => (
                                    <Draggable
                                        key={option.id}
                                        draggableId={option.id.toString()}
                                        index={index}
                                        isDragDisabled={readOnly}
                                    >
                                        {(provided, snapshot) => (
                                            <DragItem
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                className={snapshot.isDragging ? 'dragging' : ''}
                                            >
                                                <IconButton
                                                    {...provided.dragHandleProps}
                                                    sx={{ 
                                                        mr: 1,
                                                        cursor: readOnly ? 'default' : 'grab',
                                                        '&:hover': {
                                                            backgroundColor: readOnly ? 'transparent' : undefined
                                                        }
                                                    }}
                                                >
                                                    <DragHandleIcon />
                                                </IconButton>
                                                <ListItemText
                                                    primary={option.title}
                                                    secondary={`Rank: ${index + 1}`}
                                                />
                                            </DragItem>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </List>
                        )}
                    </Droppable>
                </DragDropContext>
            </Box>

            {!readOnly && (
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
