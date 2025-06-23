import React, { useState, useEffect } from 'react';
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
    Divider,
    TextField,
    Autocomplete,
    CircularProgress
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
        roles: Array<{ id?: number; name: string }>;
        ballots: Array<{
            id: number;
            title: string;
            status: string;
        }>;
    };
    onDelete?: (categoryId: number) => void;
    onUpdate?: (categoryId: number) => void;
}

interface DeleteConfirmationDialogProps {
    open: boolean;
    onClose: () => void;
    categoryName: string;
    onConfirm: () => void;
}

interface EditCategoryDialogProps {
    open: boolean;
    onClose: () => void;
    category: {
        id: number;
        name: string;
        roles: Array<{ id?: number; name: string }>;
    };
    onConfirm: (id: number, name: string, roleIds: number[]) => Promise<void>;
}

interface Role {
    id: number;
    name: string;
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

const EditCategoryDialog: React.FC<EditCategoryDialogProps> = ({
    open,
    onClose,
    category,
    onConfirm,
}) => {
    const [name, setName] = useState(category.name);
    const [roles, setRoles] = useState<Role[]>([]);
    const [selectedRoles, setSelectedRoles] = useState<Role[]>(
        category.roles.map((role) => ({ ...role, id: role.id || 0 }))
    );
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { showAlert } = useAlert();

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const response = await API.get("/roles");
                const allRoles = response.data.roles;
                setRoles(allRoles);
                const initialSelectedRoles = allRoles.filter((role: Role) =>
                    category.roles.some(categoryRole => categoryRole.name === role.name)
                );
                setSelectedRoles(initialSelectedRoles);
            } catch (err) {
                console.error("Failed to load roles:", err);
                showAlert("Failed to load roles", "error");
                setError("Failed to load roles");
            } finally {
                setLoading(false);
            }
        };

        fetchRoles();
    }, [showAlert, category.roles]);

    const handleSubmit = async () => {
        try {
            await onConfirm(category.id, name, selectedRoles.map((role) => role.id));
            onClose();
        } catch (error) {
            console.error("Error updating category:", error);
            showAlert("Failed to update category", "error");
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogContent>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
                    <TextField
                        fullWidth
                        label="Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    {loading ? (
                        <CircularProgress size={24} />
                    ) : error ? (
                        <Typography color="error">{error}</Typography>
                    ) : (
                        <Autocomplete
                            multiple
                            disableCloseOnSelect
                            value={selectedRoles}
                            onChange={(_, newValue) => setSelectedRoles(newValue)}
                            options={roles}
                            getOptionLabel={(option) => option.name}
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Roles"
                                    placeholder={selectedRoles.length ? "Add more roles..." : "Select roles..."}
                                />
                            )}
                            renderTags={(value: Role[]) =>
                                value.map((option: Role) => (
                                    <Box key={option.id} sx={{ m: 0.5 }}>
                                        <MockChip
                                            label={option.name}
                                            onDelete={() => {
                                                setSelectedRoles(selectedRoles.filter(r => r.id !== option.id));
                                            }}
                                            variant="info"
                                        />
                                    </Box>
                                ))
                            }
                            renderOption={(props, option: Role, { selected }) => (
                                <li {...props}>
                                    <Box
                                        component="span"
                                        sx={{
                                            width: 20,
                                            height: 20,
                                            border: "2px solid",
                                            borderColor: selected ? "primary.main" : "grey.400",
                                            borderRadius: 0.5,
                                            mr: 1,
                                            display: "inline-flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            backgroundColor: selected ? "primary.main" : "transparent",
                                        }}
                                    >
                                        {selected && (
                                            <Typography
                                                component="span"
                                                sx={{
                                                    color: "white",
                                                    fontSize: "0.8rem",
                                                    fontWeight: "bold",
                                                }}
                                            >
                                                ✓
                                            </Typography>
                                        )}
                                    </Box>
                                    {option.name}
                                </li>
                            )}
                        />
                    )}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={loading || !name.trim()}
                >
                    Save Changes
                </Button>
            </DialogActions>
        </Dialog>
    );
};

// category display card with role assignments and management options
export const CategoryCard: React.FC<CategoryCardProps> = ({ category, onDelete, onUpdate }) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const theme = useTheme();
    const { showAlert } = useAlert();

    const handleExpandClick = (event: React.MouseEvent) => {
        const target = event.target as HTMLElement;
        if (!target.closest('#category-menu-button') && !target.closest('#category-menu')) {
            setExpanded(!expanded);
        }
    };    const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        setAnchorEl(event.currentTarget);
    };

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

    const handleEditConfirm = async (id: number, name: string, roleIds: number[]) => {
        try {
            showAlert("Updating category...", "info");
            await API.put(`/categories/${id}`, { name, roleIds });
            showAlert("Category updated successfully", "success");
            onUpdate?.(id);
        } catch (error) {
            console.error("Error updating category:", error);
            throw error;
        }
    };

    return (
        <>
            <Card sx={{ width: "100%" }}>
                <Box
                    sx={{
                        cursor: 'pointer',
                        '&:hover': {
                            bgcolor: theme.palette.action.hover
                        }
                    }}
                    onClick={handleExpandClick}
                >
                    <CardContent sx={{ py: "12px", "&:last-child": { pb: "12px" } }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                <Typography variant="h6" component="div">
                                    {category.name}
                                </Typography>
                                <Box sx={{ display: "flex", gap: 1 }}>
                                    <Box
                                        sx={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            height: '24px',
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
                                    onClick={handleMenuClick}
                                    size="small"
                                >
                                    <MoreVertIcon />
                                </IconButton>
                                <Menu
                                    id="category-menu"
                                    anchorEl={anchorEl}
                                    keepMounted
                                    open={Boolean(anchorEl)}
                                    onClick={(event) => event.stopPropagation()}
                                    onClose={() => setAnchorEl(null)}
                                >
                                    <MenuItem
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            setEditDialogOpen(true);
                                            setAnchorEl(null);
                                        }}
                                    >
                                        <EditIcon sx={{ mr: 1 }} />
                                        Edit
                                    </MenuItem>
                                    <MenuItem
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            setDeleteDialogOpen(true);
                                            setAnchorEl(null);
                                        }}
                                        sx={{ color: "error.main" }}
                                    >
                                        <DeleteIcon sx={{ mr: 1 }} />
                                        Delete
                                    </MenuItem>
                                </Menu>
                            </Box>
                        </Box>
                    </CardContent>
                </Box>

                <Collapse in={expanded} timeout="auto">
                    <Divider />
                    <CardContent>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Roles with access:
                        </Typography>
                        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
                            {category.roles.length === 0 ? (
                                <Typography variant="body2" color="text.secondary">
                                    No roles assigned
                                </Typography>
                            ) : (
                                category.roles.map((role, index) => (
                                    <MockChip 
                                        key={index}
                                        label={role.name} 
                                        variant="info" 
                                        size="small"
                                    />
                                ))
                            )}
                        </Box>

                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Ballots:
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
                                            bgcolor: alpha(theme.palette.background.default, 0.5),
                                            p: 1,
                                            borderRadius: 1,
                                        }}
                                    >
                                        <Typography variant="body2">{ballot.title}</Typography>
                                        <MockChip
                                            label={ballot.status}
                                            variant={
                                                ballot.status === "Active"
                                                    ? "success"
                                                    : ballot.status === "Suspended"
                                                    ? "error"
                                                    : "warning"
                                            }
                                            size="small"
                                        />
                                    </Box>
                                ))
                            )}
                        </Box>
                    </CardContent>
                </Collapse>
            </Card>

            <DeleteConfirmationDialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                categoryName={category.name}
                onConfirm={handleDeleteConfirm}
            />

            <EditCategoryDialog
                open={editDialogOpen}
                onClose={() => setEditDialogOpen(false)}
                category={category}
                onConfirm={handleEditConfirm}
            />
        </>
    );
};
