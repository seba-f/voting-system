import React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Alert,
  Fade,
  useTheme,
} from "@mui/material";
import { Bar } from "react-chartjs-2";
import { ParticipationCard } from "./ParticipationCard";
import { YesNoDistributionCard } from "./YesNoDistributionCard";

interface ChoiceDistribution {
  optionId: number;
  title: string;
  votes: number;
}

interface HourlyDistribution {
  hour: number;
  votes: number;
}

interface Analytics {
  totalVotes: number;
  totalVoters: number;
  eligibleUsers: number;
  participationRate: number;
  choiceDistribution: ChoiceDistribution[];
  hourlyDistribution: HourlyDistribution[];
}

interface BallotAnalyticsProps {
  analytics: Analytics | null;
  analyticsLoading: boolean;
  ballotType: string;
}

export const BallotAnalytics: React.FC<BallotAnalyticsProps> = ({
  analytics,
  analyticsLoading,
  ballotType,
}) => {
  const theme = useTheme();

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: theme.palette.background.paper,
        titleColor: theme.palette.text.primary,
        bodyColor: theme.palette.text.secondary,
        borderColor: theme.palette.divider,
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
          color: theme.palette.text.secondary,
        },
        grid: {
          color: theme.palette.divider,
        },
      },
      x: {
        ticks: {
          color: theme.palette.text.secondary,
        },
        grid: {
          color: theme.palette.divider,
        },
      },
    },
  };

  const choiceDistributionData =
    analytics && ballotType !== "TEXT_INPUT" && ballotType !== "RANKED_CHOICE"
      ? {
          labels: analytics.choiceDistribution.map((choice) => choice.title),
          datasets: [
            {
              label: "Votes",
              data: analytics.choiceDistribution.map((choice) => choice.votes),
              backgroundColor: theme.palette.primary.main,
              borderColor: theme.palette.primary.main,
              borderWidth: 1,
              borderRadius: 4,
            },
          ],
        }
      : null;

  const hourlyDistributionData = analytics
    ? {
        labels: analytics.hourlyDistribution.map((hour) => `${hour.hour}:00`),
        datasets: [
          {
            label: "Votes per Hour",
            data: analytics.hourlyDistribution.map((hour) => hour.votes),
            backgroundColor: theme.palette.primary.main,
            borderColor: theme.palette.primary.main,
            borderWidth: 1,
            borderRadius: 4,
          },
        ],
      }
    : null;

  if (!analytics) {
    return (
      <Alert severity="info">No analytics data available for this ballot.</Alert>
    );
  }

  return (
    <Fade in={!analyticsLoading}>
      <Box
        sx={{
          display: "grid",
          gap: 3,
          gridTemplateColumns: {
            xs: "1fr",
            sm: "200px 1fr",
            lg: "200px 1fr 1fr",
          },
        }}
      >
        <ParticipationCard
          participationRate={analytics.participationRate}
          totalVotes={analytics.totalVotes}
          totalVoters={analytics.totalVoters}
          eligibleUsers={analytics.eligibleUsers}
        />
        {analytics.choiceDistribution && (
          ballotType === "YES_NO" ? (
            <YesNoDistributionCard distribution={analytics.choiceDistribution} />
          ) : (
            choiceDistributionData && (
              <Card elevation={2}>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="primary" sx={{ mb: 2 }}>
                    Choice Distribution
                  </Typography>
                  <Box sx={{ height: { xs: 250, sm: 300 } }}>
                    <Bar data={choiceDistributionData} options={chartOptions} />
                  </Box>
                </CardContent>
              </Card>
            )
          )
        )}

        <Card elevation={2}>
          <CardContent>
            <Typography variant="h6" gutterBottom color="primary" sx={{ mb: 2 }}>
              Voting Activity
            </Typography>
            <Box sx={{ height: { xs: 250, sm: 300 } }}>
              <Bar data={hourlyDistributionData} options={chartOptions} />
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Fade>
  );
};
