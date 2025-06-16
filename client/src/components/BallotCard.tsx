import React from "react";
import {
	Card,
	CardContent,
	Typography,
	Button,
	Box,
} from "@mui/material";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { MockChip } from "./MockChip";

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
				</Typography>				<Box sx={{ display: "flex", gap: 1, mb: 2 }}>
					<MockChip 
						label={`Type: ${ballot.type?.replace('_', ' ').toLowerCase()}`} 
						size="small" 
						variant="info" 
					/>
					<MockChip 
						label={ballot.status || 'Active'} 
						size="small" 
						variant={ballot.status === 'Suspended' ? 'error' : 'success'} 
					/>
				</Box><Typography variant="body2" color="text.secondary">
					Ends: {ballot.endDate ? format(new Date(ballot.endDate), "PPP 'at' p") : 'No end date set'}
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
