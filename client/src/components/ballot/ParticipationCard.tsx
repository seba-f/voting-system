import React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  useTheme,
} from "@mui/material";
import { HowToVote as HowToVoteIcon } from "@mui/icons-material";

interface ParticipationCardProps {
  participationRate: number;
  totalVotes: number;
  totalVoters: number;
  eligibleUsers: number;
}

export const ParticipationCard: React.FC<ParticipationCardProps> = ({
  participationRate,
  totalVotes,
  totalVoters,
  eligibleUsers,
}) => {
  const theme = useTheme();

  return (
    <Card elevation={2} sx={{ height: "100%" }}>
      <CardContent
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-around",
          py: 4, // Increased padding vertically
        }}
      >
        <Typography
          variant="h6"
          color="primary"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <HowToVoteIcon />
          Participation
        </Typography>

        <Box
          sx={{
            position: "relative",
            display: "inline-flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <CircularProgress
            variant="determinate"
            value={participationRate * 100}
            size={200} // Increased from 120
            thickness={4} // Increased from 3
            sx={{
              color: theme.palette.primary.main,
              backgroundColor: theme.palette.background.paper,
              borderRadius: "50%",
            }}
          />
          <Box
            sx={{
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              position: "absolute",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              width: "75%",
              margin: "auto",
            }}
          >
            <Typography
              variant="h3" // Increased from h4
              component="div"
              color="primary"
              sx={{ lineHeight: 1, mb: 1, fontWeight: "medium" }}
            >
              {(participationRate * 100).toFixed(1)}%
            </Typography>
          </Box>
        </Box>

        <Box sx={{ textAlign: "center" }}>
          <Typography
            variant="h6"
            color="text.primary"
            sx={{ mb: 1 }}
          >
            {totalVoters} of {eligibleUsers}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            eligible users voted
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};
