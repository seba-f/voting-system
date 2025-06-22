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
          justifyContent: "center",
          gap: 2,
        }}
      >
        <Typography
          variant="subtitle2"
          color="primary"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
          }}
        >
          <HowToVoteIcon fontSize="small" />
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
            size={120}
            thickness={3}
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
              width: "75%", // Make the content area smaller than the circle
              margin: "auto",
            }}
          >
            <Typography
              variant="h4"
              component="div"
              color="primary"
              sx={{ lineHeight: 1, mb: 0.5, fontSize: "1.75rem" }}
            >
              {(participationRate * 100).toFixed(1)}%
            </Typography>
          </Box>
        </Box>

        <Typography variant="caption" color="secondary" align="center" sx={{ mt: 1 }}>
          {totalVoters} of {eligibleUsers} users
        </Typography>
      </CardContent>
    </Card>
  );
};
