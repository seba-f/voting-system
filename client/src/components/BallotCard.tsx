import React from "react";
import {
	Card,
	CardContent,
	Typography,
	Button,
	Box,
	Chip,
} from "@mui/material";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

interface BallotCardProps {
	ballot: {
		id: number;
		title: string;
		description: string;
		startDate: Date;
		endDate: Date;
		status: string;
		type: string;
	};
}

export const BallotCard = React.memo((props: BallotCardProps) => {
	const { ballot } = props;
	const navigate = useNavigate();

	return (
		<Card>
			<CardContent>
				<Typography variant="h6" gutterBottom>
					{ballot.title}
				</Typography>

				<Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
					{ballot.description}
				</Typography>

				<Box sx={{ display: "flex", gap: 1, mb: 2 }}>
					<Chip label={`Type: ${ballot.type}`} size="small" color="primary" />
					<Chip label={ballot.status} size="small" color="secondary" />
				</Box>

				<Typography variant="body2" color="text.secondary">
					Ends: {format(new Date(ballot.endDate), "PPP")}
				</Typography>

				<Box sx={{ mt: 2 }}>
					<Button
						variant="contained"
						color="primary"
						onClick={() => navigate(`/ballot/${ballot.id}`)}
					>
						View Ballot
					</Button>{" "}
				</Box>
			</CardContent>
		</Card>
	);
});
