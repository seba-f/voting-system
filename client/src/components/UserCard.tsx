import React, { useState } from "react";
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
} from "@mui/material";
import {
	Edit as EditIcon,
	Delete as DeleteIcon,
	MoreVert as MoreVertIcon,
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import API from "../api/axios";
import { useAlert } from "./AlertContext";

interface UserCardProps {
	user: {
		id: number;
		username: string;
		isActive: boolean;
		roles: Array<{ name: string }>;
	};
	options: boolean;
	onDelete?: (userId: number) => void;
}

interface DeleteConfirmationDialogProps {
	open: boolean;
	onClose: () => void;
	username: string;
	onConfirm: () => void;
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

export const UserCard = ({ user, options, onDelete }: UserCardProps) => {
	const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
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

	return (
		<>
			<Card
				sx={{
					width: "100%",
					bgcolor: theme.palette.background.paper,
				}}
			>
				{" "}
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
									<Box
										key={index}
										sx={{
											px: 1,
											py: 0.5,
											borderRadius: 50,
											fontSize: "0.8125rem",
											bgcolor: alpha(theme.palette.secondary.main, 0.05),
											border: 1,
											borderColor: alpha(theme.palette.secondary.main, 0.2),
											color: theme.palette.text.primary,
										}}
									>
										{role.name}
									</Box>
								))}
							</Box>
						</Box>{" "}
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
		</>
	);
};
