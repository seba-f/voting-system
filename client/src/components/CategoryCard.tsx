import React, { useState } from 'react';
import {
    Card,
    CardContent,
    IconButton,
    Menu,
    MenuItem,
    Typography,
    Box,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Collapse,
    Chip,
    alpha,
    useTheme,
    Divider
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    MoreVert as MoreVertIcon,
    ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import API from '../api/axios';
import { useAlert } from './AlertContext';
import { MockChip } from './MockChip';

interface CategoryCardProps {
    category: {
        id: number;
        name: string;
        roles: Array<{ name: string }>;
        ballots: Array<{
            id: number;
            title: string;
            status: string;
        }>;
    };
    onDelete?: (categoryId: number) => void;
}

interface DeleteConfirmationDialogProps {
    open: boolean;
    onClose: () => void;
    categoryName: string;
    onConfirm: () => void;
}

const DeleteConfirmationDialog: React.FC<DeleteConfirmationDialogProps> = ({
    open,
    onClose,
    categoryName,
    onConfirm,
}) => (
    <Dialog open={open} onClose={onClose}>
        <DialogTitle>Delete Category</DialogTitle>
        <DialogContent>
            <Typography>
                Are you sure you want to delete the category "{categoryName}"? This action cannot be
                undone.
            </Typography>
        </DialogContent>
        <DialogActions>
            <Button onClick={onClose}>Cancel</Button>
            <Button onClick={onConfirm} color="error" variant="contained">
                Delete
            </Button>
        </DialogActions>
    </Dialog>
);

export const CategoryCard: React.FC<CategoryCardProps> = ({ category, onDelete }) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const theme = useTheme();
    const { showAlert } = useAlert();

    const handleDeleteConfirm = () => {
        showAlert("Deleting category...", "info");
        API.delete(`/categories/${category.id}`)
            .then(() => {
                showAlert("Category deleted successfully", "success");
                onDelete?.(category.id);
            })
            .catch((error) => {
                console.error("Error deleting category:", error);
                showAlert("Failed to delete category", "error");
            });
        setDeleteDialogOpen(false);
    };

    return (
        <>
            <Card sx={{ width: "100%" }}>
                {/* Clickable Header */}
                <Box
                    sx={{
                        cursor: 'pointer',
                        '&:hover': {
                            bgcolor: theme.palette.action.hover
                        }
                    }}
                    onClick={(event) => {
                        const target = event.target as HTMLElement;
                        if (!target.closest('#category-menu-button')) {
                            setExpanded(!expanded);
                        }
                    }}
                >
                    <CardContent sx={{ py: "12px", "&:last-child": { pb: "12px" } }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                <Typography variant="h6" component="div">
                                    {category.name}
                                </Typography>                                <Box sx={{ display: "flex", gap: 1 }}>
                                    <Box
                                        sx={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            height: '24px', // Similar to small Chip height
                                            px: 1,
                                            py: 0.5,
                                            fontSize: '0.75rem',
                                            fontWeight: 'medium',
                                            borderRadius: '12px',
                                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                                            color: theme.palette.primary.main,
                                            userSelect: 'none'
                                        }}
                                    >
                                        {`${category.roles.length} ${category.roles.length === 1 ? 'Role' : 'Roles'}`}
                                    </Box>
                                    <Box
                                        sx={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            height: '24px', // Similar to small Chip height
                                            px: 1,
                                            py: 0.5,
                                            fontSize: '0.75rem',
                                            fontWeight: 'medium',
                                            borderRadius: '12px',
                                            bgcolor: alpha(theme.palette.secondary.main, 0.1),
                                            color: theme.palette.secondary.main,
                                            userSelect: 'none'
                                        }}
                                    >
                                        {`${category.ballots.length} ${category.ballots.length === 1 ? 'Ballot' : 'Ballots'}`}
                                    </Box>
                                </Box>
                            </Box>
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                                <ExpandMoreIcon 
                                    sx={{ 
                                        transform: expanded ? 'rotate(180deg)' : 'none',
                                        transition: theme.transitions.create('transform'),
                                        color: theme.palette.primary.main,
                                        mr: 1
                                    }}
                                />
                                <IconButton
                                    id="category-menu-button"
                                    aria-label="more"
                                    aria-controls="category-menu"
                                    aria-haspopup="true"
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        setAnchorEl(event.currentTarget);
                                    }}
                                >
                                    <MoreVertIcon />
                                </IconButton>
                            </Box>
                        </Box>
                    </CardContent>
                </Box>

                {/* Divider and Expandable Content */}
                <Collapse in={expanded} timeout="auto">
                    <Divider />
                    <CardContent>
                        {/* Roles Section */}
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Roles with access:
                        </Typography>
                        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
                            {category.roles.length === 0 ? (
                                <Typography variant="body2" color="text.secondary">
                                    No roles assigned
                                </Typography>
                            ) : (
                                category.roles.map((role) => (
                                    <MockChip label={role.name} variant='info' size='small'></MockChip>
                                ))
                            )}
                        </Box>

                        {/* Ballots Section */}
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Associated ballots:
                        </Typography>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                            {category.ballots.length === 0 ? (
                                <Typography variant="body2" color="text.secondary">
                                    No ballots in this category
                                </Typography>
                            ) : (
                                category.ballots.map((ballot) => (
                                    <Box
                                        key={ballot.id}
                                        sx={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            px: 2,
                                            py: 1,
                                            borderRadius: 1,
                                            bgcolor: alpha(theme.palette.background.default, 0.6),
                                        }}
                                    >
                                        <Typography variant="body2">
                                            {ballot.title}
                                        </Typography>                                        <Box
                                            sx={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                height: '24px',
                                                px: 1,
                                                py: 0.5,
                                                fontSize: '0.75rem',
                                                fontWeight: 'medium',
                                                borderRadius: '12px',
                                                bgcolor: alpha(theme.palette.secondary.main, 0.1),
                                                color: theme.palette.secondary.main,
                                                userSelect: 'none'
                                            }}
                                        >
                                            {ballot.status}
                                        </Box>
                                    </Box>
                                ))
                            )}
                        </Box>
                    </CardContent>
                </Collapse>
            </Card>

            {/* Menu */}
            <Menu
                id="category-menu"
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
            >
                <MenuItem
                    onClick={() => {
                        /* handle edit */
                        setAnchorEl(null);
                    }}
                >
                    <EditIcon sx={{ mr: 1 }} />
                    Edit
                </MenuItem>
                <MenuItem
                    onClick={() => {
                        setDeleteDialogOpen(true);
                        setAnchorEl(null);
                    }}
                    sx={{ color: "error.main" }}
                >
                    <DeleteIcon sx={{ mr: 1 }} />
                    Delete
                </MenuItem>
            </Menu>

            {/* Delete Confirmation Dialog */}
            <DeleteConfirmationDialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                categoryName={category.name}
                onConfirm={handleDeleteConfirm}
            />
        </>
    );
};
