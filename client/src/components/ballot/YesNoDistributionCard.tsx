import React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  useTheme,
  alpha,
} from "@mui/material";

interface ChoiceDistribution {
  optionId: number;
  title: string;
  votes: number;
}

interface YesNoDistributionCardProps {
  distribution: ChoiceDistribution[];
}

// yes/no vote distribution visualization with percentage breakdown
export const YesNoDistributionCard: React.FC<YesNoDistributionCardProps> = ({
  distribution,
}) => {
  const theme = useTheme();
  const totalVotes = distribution.reduce((sum, choice) => sum + choice.votes, 0);
  
  // Find yes and no votes
  const yesVotes = distribution.find(choice => choice.title.toLowerCase() === 'yes')?.votes || 0;
  const noVotes = distribution.find(choice => choice.title.toLowerCase() === 'no')?.votes || 0;
  
  // Calculate percentages
  const yesPercentage = totalVotes > 0 ? (yesVotes / totalVotes) * 100 : 50;
  const noPercentage = totalVotes > 0 ? (noVotes / totalVotes) * 100 : 50;

  return (
    <Card elevation={2} sx={{ height: "100%" }}>
      <CardContent sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center',
        height: '100%',
        justifyContent: 'center',
        px: 4,
      }}>
        <Typography variant="h6" gutterBottom color="primary" sx={{ mb: 4 }}>
          Choice Distribution
        </Typography>
        <Box
          sx={{
            position: "relative",
            height: { xs: 100, sm: 120 },
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 1,
            overflow: "hidden",
            bgcolor: alpha(theme.palette.divider, 0.1),
            width: "100%",
            maxWidth: 600,
            mx: "auto",
          }}
        >
          {/* Yes side */}
          <Box
            sx={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: `${yesPercentage}%`,
              bgcolor: theme.palette.success.main,
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start",
              pl: 2,
              color: "white",
              transition: "width 0.5s ease-in-out",
            }}
          >
            <Box sx={{ textAlign: "left" }}>
              <Typography variant="subtitle1" fontWeight="bold">
                Yes
              </Typography>
              <Typography variant="body2">
                {yesVotes} votes ({yesPercentage.toFixed(1)}%)
              </Typography>
            </Box>
          </Box>

          {/* Divider line */}
          <Box
            sx={{
              position: "absolute",
              left: `${yesPercentage}%`,
              top: 0,
              bottom: 0,
              width: 2,
              bgcolor: theme.palette.divider,
              zIndex: 1,
              transition: "left 0.5s ease-in-out",
            }}
          />

          {/* No side */}
          <Box
            sx={{
              position: "absolute",
              right: 0,
              top: 0,
              bottom: 0,
              width: `${noPercentage}%`,
              bgcolor: theme.palette.error.main,
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              pr: 2,
              color: "white",
              transition: "width 0.5s ease-in-out",
            }}
          >
            <Box sx={{ textAlign: "right" }}>
              <Typography variant="subtitle1" fontWeight="bold">
                No
              </Typography>
              <Typography variant="body2">
                {noVotes} votes ({noPercentage.toFixed(1)}%)
              </Typography>
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};
