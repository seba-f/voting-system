import React from "react";
import {
  Box,
  Typography,
  Stack,
  Paper,
  Avatar,
  useTheme,
} from "@mui/material";
import { Ballot as BallotIcon } from "@mui/icons-material";
import { scrollbarStyle } from "../../styles/scrollbar";

interface VotingOption {
  id: number;
  title: string;
}

interface VotingOptionsProps {
  options: VotingOption[];
}

export const VotingOptions: React.FC<VotingOptionsProps> = ({ options }) => {
  const theme = useTheme();

  return (
    <Box>
      <Typography
        variant="subtitle1"
        color="primary"
        sx={{
          display: "flex",
          alignItems: "center",
          mb: 3,
        }}
      >
        <BallotIcon sx={{ mr: 1 }} />
        Voting Options
      </Typography>
      <Box
        sx={{
          maxHeight: "50vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Stack
          spacing={2}
          sx={{
            ...scrollbarStyle,
            overflowY: "auto",
            pr: 1,
            pb: 2,
          }}
        >
          {options.map((option, index) => (
            <Paper
              key={option.id}
              elevation={1}
              sx={{
                p: 2,
                bgcolor: "background.default",
                transition: "all 0.2s",
              }}
            >
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar
                  sx={{
                    bgcolor: theme.palette.secondary.main,
                    color: theme.palette.secondary.contrastText,
                    width: 32,
                    height: 32,
                  }}
                >
                  {index + 1}
                </Avatar>
                <Typography sx={{ flex: 1 }}>{option.title}</Typography>
              </Stack>
            </Paper>
          ))}
        </Stack>
      </Box>
    </Box>
  );
};
