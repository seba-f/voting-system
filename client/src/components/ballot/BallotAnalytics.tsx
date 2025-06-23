import React, { useState, useCallback } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Alert,
  Fade,
  useTheme,
  IconButton,
  Stack,
} from "@mui/material";
import {
  NavigateBefore as NavigateBeforeIcon,
  NavigateNext as NavigateNextIcon,
} from "@mui/icons-material";
import { format } from "date-fns";
import { Bar } from "react-chartjs-2";
import { ParticipationCard } from "./ParticipationCard";
import { YesNoDistributionCard } from "./YesNoDistributionCard";
import { RankedChoiceDistributionCard } from "./RankedChoiceDistributionCard";
import { scrollbarStyle } from "../../styles/scrollbar";

interface ChoiceDistribution {
  optionId: number;
  title: string;
  votes: number;
}

interface HourlyDistribution {
  hour: number;
  votes: number;
}

interface HourlyDistributionByDate {
  date: string;
  hourlyDistribution: HourlyDistribution[];
}

interface RankDistribution {
  [optionId: number]: {
    [rank: number]: number;
  };
}

interface Analytics {
  totalVotes: number;
  totalVoters: number;
  eligibleUsers: number;
  participationRate: number;
  choiceDistribution: ChoiceDistribution[];
  hourlyDistribution: HourlyDistribution[];
  hourlyDistributionByDate: HourlyDistributionByDate[];
  rankDistribution?: RankDistribution;
}

interface BallotOption {
  id: number;
  title: string;
}

interface BallotAnalyticsProps {
  analytics: Analytics | null;
  analyticsLoading: boolean;
  ballotType: string;
  options?: BallotOption[];
}

// comprehensive ballot analytics dashboard with charts and statistics
export const BallotAnalytics = ({
  analytics,
  analyticsLoading,
  ballotType,
  options = []
}: BallotAnalyticsProps) => {
  const theme = useTheme();
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);

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

  const choiceDistributionData = analytics && ballotType !== "TEXT_INPUT" && ballotType !== "RANKED_CHOICE" ? {
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
  } : null;

  const getCurrentDateData = useCallback(() => {
    if (!analytics?.hourlyDistributionByDate?.length) {
      return analytics?.hourlyDistribution || [];
    }
    return analytics.hourlyDistributionByDate[selectedDateIndex].hourlyDistribution;
  }, [analytics, selectedDateIndex]);

  const hourlyDistributionData = analytics ? {
    labels: getCurrentDateData().map((hour) => `${hour.hour}:00`),
    datasets: [
      {
        label: "Votes per Hour",
        data: getCurrentDateData().map((hour) => hour.votes),
        backgroundColor: theme.palette.primary.main,
        borderColor: theme.palette.primary.main,
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  } : null;

  const handlePreviousDay = () => {
    if (selectedDateIndex > 0) {
      setSelectedDateIndex(prev => prev - 1);
    }
  };

  const handleNextDay = () => {
    if (analytics?.hourlyDistributionByDate && selectedDateIndex < analytics.hourlyDistributionByDate.length - 1) {
      setSelectedDateIndex(prev => prev + 1);
    }
  };

  if (!analytics) {
    return (
      <Alert severity="info">No analytics data available for this ballot.</Alert>
    );
  }

  return (
    <Fade in={!analyticsLoading}>
      <Box
        sx={{
          height: "calc(100vh - 290px)", // Adjust based on your header/navigation height
          overflow: "hidden" // Prevent double scrollbars
        }}
      >
        <Box
          sx={{
            display: "grid",
            gap: 3,
            p: 2,
            height: "100%",
            overflowY: "auto",
            ...scrollbarStyle,
            gridTemplateColumns: {
              xs: "1fr",
              sm: ballotType === "TEXT_INPUT" 
                ? "minmax(200px, 300px) 1fr"
                : "minmax(200px, 300px) 1fr",
            },
            gridTemplateAreas: {
              xs: `
                "participation"
                "activity"
                "distribution"
              `,
              sm: `
                "participation activity"
                "distribution distribution"
              `
            }
          }}
        >
          <Box sx={{ 
            gridArea: "participation",
            height: { xs: "auto", sm: 400 }
          }}>
            <ParticipationCard
              participationRate={analytics.participationRate}
              totalVotes={analytics.totalVotes}
              totalVoters={analytics.totalVoters}
              eligibleUsers={analytics.eligibleUsers}
            />
          </Box>

          <Card 
            elevation={2} 
            sx={{ 
              gridArea: "activity",
              height: { xs: "auto", sm: 400 }
            }}
          >
            <CardContent sx={{ height: "100%" }}>
              <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                <Typography variant="h6" color="primary">
                  Voting Activity
                </Typography>
                {analytics.hourlyDistributionByDate?.length > 0 && (
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <IconButton
                      size="small"
                      onClick={handlePreviousDay}
                      disabled={selectedDateIndex === 0}
                    >
                      <NavigateBeforeIcon />
                    </IconButton>
                    <Typography variant="body2" color="text.secondary">
                      {format(new Date(analytics.hourlyDistributionByDate[selectedDateIndex].date), 'MMM d, yyyy')}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={handleNextDay}
                      disabled={selectedDateIndex === analytics.hourlyDistributionByDate.length - 1}
                    >
                      <NavigateNextIcon />
                    </IconButton>
                  </Stack>
                )}
              </Stack>
              <Box sx={{ height: "calc(100% - 62px)" }}>
                <Bar data={hourlyDistributionData} options={chartOptions} />
              </Box>
            </CardContent>
          </Card>

          {analytics.choiceDistribution && (
            <Box sx={{ gridArea: "distribution" }}>
              {ballotType === "YES_NO" ? (
                <YesNoDistributionCard distribution={analytics.choiceDistribution} />
              ) : ballotType === "RANKED_CHOICE" && analytics.rankDistribution ? (
                <RankedChoiceDistributionCard
                  rankDistribution={analytics.rankDistribution}
                  options={options}
                  totalVotes={analytics.totalVotes}
                />
              ) : (
                choiceDistributionData && (
                  <Card elevation={2}>
                    <CardContent>
                      <Typography
                        variant="h6"
                        gutterBottom
                        color="primary"
                        sx={{ mb: 2 }}
                      >
                        Choice Distribution
                      </Typography>
                      <Box sx={{ height: { xs: 250, sm: 300 } }}>
                        <Bar data={choiceDistributionData} options={chartOptions} />
                      </Box>
                    </CardContent>
                  </Card>
                )
              )}
            </Box>
          )}
        </Box>
      </Box>
    </Fade>
  );
};
