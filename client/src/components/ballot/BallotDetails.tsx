import React from "react";
import {
  Box,
  Typography,
  Stack,
  Tooltip,
} from "@mui/material";
import {
  Description as DescriptionIcon,
  Category as CategoryIcon,
  AccessTime as AccessTimeIcon,
} from "@mui/icons-material";
import { format } from "date-fns";
import { MockChip } from "../MockChip";

interface Role {
  id: number;
  name: string;
  description?: string;
}

interface Category {
  id: number;
  name: string;
  roles: Role[];
}

interface BallotDetailsProps {
  description: string;
  type: string;
  category: Category | null;
  endDate: string;
  status: string;
  timeLeft?: number | null;
}

// detailed ballot information display component
export const BallotDetails: React.FC<BallotDetailsProps> = ({
  description,
  type,
  category,
  endDate,
  status,
  timeLeft,
}) => {
  return (
    <Stack spacing={3}>
      {/* Description section */}
      <Box>
        <Typography
          variant="subtitle1"
          color="primary"
          sx={{
            display: "flex",
            alignItems: "center",
            mb: 2,
          }}
        >
          <DescriptionIcon sx={{ mr: 1 }} />
          Description
        </Typography>
        <Typography variant="body1" sx={{ color: "text.secondary" }}>
          {description}
        </Typography>
      </Box>

      {/* Ballot Details section */}
      <Box>
        <Typography
          variant="subtitle1"
          color="primary"
          sx={{
            display: "flex",
            alignItems: "center",
            mb: 2,
          }}
        >
          <CategoryIcon sx={{ mr: 1 }} />
          Ballot Details
        </Typography>
        <Stack spacing={2}>
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Type:
            </Typography>
            <MockChip
              label={type.replace(/_/g, " ")}
              variant="info"
              size="small"
            />
          </Box>
          <Box>
            <Box
              sx={{
                display: "flex",
                alignItems: "flex-start",
                gap: 1,
                mb: 1,
              }}
            >
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Category:
              </Typography>
              <Typography variant="body1" sx={{ mt: 0.25 }}>
                {category?.name}
              </Typography>
            </Box>
            {category && (
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {category.roles?.map((role) => (
                  <Tooltip key={role.id} title={role.description || ""} arrow>
                    <Box>
                      <MockChip label={role.name} variant="info" size="small" />
                    </Box>
                  </Tooltip>
                ))}
                {(!category.roles || category.roles.length === 0) && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontStyle: "italic" }}
                  >
                    No roles available in this category
                  </Typography>
                )}
              </Stack>
            )}
          </Box>
        </Stack>
      </Box>

      {/* End Date section */}
      <Box>
        <Typography
          variant="subtitle1"
          color="primary"
          sx={{
            display: "flex",
            alignItems: "center",
            mb: 2,
          }}
        >
          <AccessTimeIcon sx={{ mr: 1 }} />
          {status === "Suspended" ? "Time remaining after resume" : "End date"}
        </Typography>
        <Stack spacing={2}>
          {status === "Suspended" && timeLeft ? (
            <Typography variant="body1">
              {Math.floor(timeLeft / 86400)} days,{" "}
              {Math.floor((timeLeft % 86400) / 3600)} hours,{" "}
              {Math.floor((timeLeft % 3600) / 60)} minutes
            </Typography>
          ) : (
            <Typography variant="body1">
              {format(new Date(endDate), "PPP")}
            </Typography>
          )}
        </Stack>
      </Box>
    </Stack>
  );
};
