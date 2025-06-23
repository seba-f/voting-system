import React, { useState, useEffect } from "react";
import {
	Card,
	CardContent,
	IconButton,
	Menu,
	MenuItem,
	Typography,
	Box,
	alpha,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	TextField,
	Autocomplete,
	Chip,
	CircularProgress,
} from "@mui/material";
import {
	Edit as EditIcon,
	Delete as DeleteIcon,
	MoreVert as MoreVertIcon,
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import API from "../api/axios";
import { useAlert } from "./AlertContext";
import { MockChip } from "./MockChip";

interface UserCardProps {
	user: {
		id: number;
		username: string;
		isActive: boolean;
		roles: Array<{ id?: number; name: string }>;
	};
	options: boolean;
	onDelete?: (userId: number) => void;
	onUpdate?: (userId: number) => void;
}

interface DeleteConfirmationDialogProps {
	open: boolean;
	onClose: () => void;
	username: string;
	onConfirm: () => void;
}

interface EditUserDialogProps {
	open: boolean;
	onClose: () => void;
	user: {
		id: number;
		username: string;
		roles: Array<{ id?: number; name: string }>;
	};
	onConfirm: (id: number, username: string, roleIds: number[]) => Promise<void>;
}

interface Role {
	id: number;
	name: string;
}

const DeleteConfirmationDialog: React.FC<DeleteConfirmationDialogProps> = ({
	open,
	onClose,
	username,
	onConfirm,
}) => (
	<Dialog open={open} onClose={onClose}>
		<DialogTitle>Delete User</DialogTitle>
		<DialogContent>
			<Typography>
				Are you sure you want to delete {username}? This action cannot be
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

const EditUserDialog: React.FC<EditUserDialogProps> = ({
	open,
	onClose,
	user,
	onConfirm,
}) => {
	const [username, setUsername] = useState(user.username);
	const [roles, setRoles] = useState<Role[]>([]);
	const [selectedRoles, setSelectedRoles] = useState<Role[]>(
		user.roles.map((role) => ({ ...role, id: role.id || 0 }))
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
				// Initialize selected roles with the complete role objects from the fetched roles
				const initialSelectedRoles: Role[] = allRoles.filter((role: Role) => 
					user.roles.some((userRole: { id?: number; name: string }) => userRole.name === role.name)
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
	}, [showAlert, user.roles]);

	const handleSubmit = async () => {
		try {
			await onConfirm(user.id, username, selectedRoles.map((role) => role.id));
			onClose();
		} catch (error) {
			console.error("Error updating user:", error);
			showAlert("Failed to update user", "error");
		}
	};

	return (
		<Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
			<DialogTitle>Edit User</DialogTitle>
			<DialogContent>
				<Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
					<TextField
						fullWidth
						label="Username"
						value={username}
						onChange={(e) => setUsername(e.target.value)}
					/>
					{loading ? (
						<CircularProgress size={24} />
					) : error ? (
						<Typography color="error">{error}</Typography>
					) : (						<Autocomplete
							multiple
							disableCloseOnSelect
							value={selectedRoles}
							onChange={(_, newValue) => setSelectedRoles(newValue)}
							options={roles}
							getOptionLabel={(option) => option.name}							isOptionEqualToValue={(option, value) => option.id === value.id}
							renderInput={(params) => (
								<TextField
									{...params}
									label="Roles"
									placeholder={selectedRoles.length ? "Add more roles..." : "Select roles..."}
								/>
							)}							renderTags={(value: Role[]) =>
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
					disabled={loading || !username.trim()}
				>
					Save Changes
				</Button>
			</DialogActions>
		</Dialog>
	);
};

// user information card with role badges and admin actions
export const UserCard = ({ user, options, onDelete, onUpdate }: UserCardProps) => {
	const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [editDialogOpen, setEditDialogOpen] = useState(false);
	const theme = useTheme();
	const { showAlert } = useAlert();

	const handleDeleteConfirm = () => {
		showAlert("Deleting user...", "info");
		API.delete(`/users/${user.id}`)
			.then(() => {
				showAlert("User deleted successfully", "success");
				onDelete?.(user.id);
			})
			.catch((error) => {
				console.error("Error deleting user:", error);
				showAlert("Failed to delete user", "error");
			});
		setDeleteDialogOpen(false);
	};

	const handleEditConfirm = async (id: number, username: string, roleIds: number[]) => {
		try {
			showAlert("Updating user...", "info");
			await API.put(`/users/${id}`, { username, roleIds });
			showAlert("User updated successfully", "success");
			onUpdate?.(id);
		} catch (error) {
			console.error("Error updating user:", error);
			throw error;
		}
	};

	return (
		<>
			<Card
				sx={{
					width: "100%",
					bgcolor: theme.palette.background.paper,
				}}
			>
				<CardContent sx={{ py: "12px", "&:last-child": { pb: "12px" } }}>
					<Box
						sx={{
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
						}}
					>
						<Box
							sx={{
								display: "flex",
								gap: 2,
								alignItems: "center",
								flex: 1,
							}}
						>
							<Box sx={{ display: "flex", alignItems: "center" }}>
								<Box
									sx={{
										width: 10,
										height: 10,
										borderRadius: "50%",
										bgcolor: user.isActive ? "success.main" : "error.main",
										boxShadow: (theme) =>
											`0 0 8px ${
												user.isActive
													? alpha(theme.palette.success.main, 0.5)
													: alpha(theme.palette.error.main, 0.5)
											}`,
									}}
								/>
							</Box>
							<Typography variant="h6" sx={{ ml: 2 }}>
								{user.username}
							</Typography>
							<Box
								sx={{
									ml: 2,
									display: "flex",
									gap: 1,
									flexWrap: "wrap",
								}}
							>
								{user.roles.map((role, index) => (
									<MockChip
										key={index}
										label={role.name}
										variant="info"
										size="small"
									/>
								))}
							</Box>
						</Box>
						<Box>
							{options && (
								<>
									<IconButton
										aria-label="more"
										aria-controls="user-menu"
										aria-haspopup="true"
										onClick={(event) => setAnchorEl(event.currentTarget)}
									>
										<MoreVertIcon />
									</IconButton>
									<Menu
										id="user-menu"
										anchorEl={anchorEl}
										keepMounted
										open={Boolean(anchorEl)}
										onClose={() => setAnchorEl(null)}
									>
										<MenuItem
											onClick={() => {
												setEditDialogOpen(true);
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
								</>
							)}
						</Box>
					</Box>
				</CardContent>
			</Card>
			<DeleteConfirmationDialog
				open={deleteDialogOpen}
				onClose={() => setDeleteDialogOpen(false)}
				username={user.username}
				onConfirm={handleDeleteConfirm}
			/>
			<EditUserDialog
				open={editDialogOpen}
				onClose={() => setEditDialogOpen(false)}
				user={user}
				onConfirm={handleEditConfirm}
			/>
		</>
	);
};
