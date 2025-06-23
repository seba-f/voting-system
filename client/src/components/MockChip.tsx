import React from "react";
import { Box, Typography, useTheme, alpha, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

interface MockChipProps {
	label: string;
	variant?: "primary" | "secondary" | "success" | "error" | "warning" | "info";
	size?: "small" | "medium";
	onDelete?: () => void;
}

export const MockChip: React.FC<MockChipProps> = ({
	label,
	variant = "primary",
	size = "medium",
	onDelete,
}) => {
	const theme = useTheme();
	return (
		<Box
			sx={{
				display: "inline-flex",
				alignItems: "center",
				height: size === "small" ? "24px" : "32px",
				bgcolor: alpha(theme.palette[variant].main, 0.25),
				color: theme.palette[variant].main,
				borderRadius: "16px",
				px: size === "small" ? 1 : 1.5,
				py: 0.5,
			}}
		>
			<Typography
				variant={size === "small" ? "caption" : "body2"}
				sx={{
					fontWeight: 500,
					lineHeight: 1,
				}}
			>
				{label}
			</Typography>
			{onDelete && (
				<IconButton
					size="small"
					onClick={onDelete}
					sx={{
						ml: 0.5,
						mr: -0.5,
						p: size === "small" ? 0.2 : 0.3,
						color: "inherit",
						"&:hover": {
							bgcolor: alpha(theme.palette[variant].main, 0.4),
						},
					}}
				>
					<CloseIcon sx={{ fontSize: size === "small" ? 12 : 16 }} />
				</IconButton>
			)}
		</Box>
	);
};
