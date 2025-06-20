import React from "react";
import { Box, Typography, useTheme, alpha } from "@mui/material";

interface MockChipProps {
	label: string;
	variant?: "primary" | "secondary" | "success" | "error" | "warning" | "info";
	size?: "small" | "medium";
}

export const MockChip: React.FC<MockChipProps> = ({
	label,
	variant = "primary",
	size = "medium",
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
		</Box>
	);
};
