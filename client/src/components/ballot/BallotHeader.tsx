import React from "react";
import {
  Stack,
  Button,
} from "@mui/material";
import {
  PauseCircle as PauseCircleIcon,
  StopCircle as StopCircleIcon,
} from "@mui/icons-material";
import { MockChip } from "../MockChip";
import { PageHeader } from "../PageHeader";

interface BallotHeaderProps {
  title: string;
  status: string;
  isAdmin: boolean;
  isSubmitting: boolean;
  onSuspend: () => void;
  onEndEarly: () => void;
}

export const BallotHeader: React.FC<BallotHeaderProps> = ({
  title,
  status,
  isAdmin,
  isSubmitting,
  onSuspend,
  onEndEarly,
}) => {
  return (
    <PageHeader
      title={title}
      action={
        <Stack direction="row" spacing={2} alignItems="center">
          {isAdmin && status.toLowerCase() === "active" && (
            <>
              <Button
                variant="outlined"
                color="warning"
                size="small"
                startIcon={<PauseCircleIcon />}
                onClick={onSuspend}
                disabled={isSubmitting}
              >
                Suspend
              </Button>
              <Button
                variant="outlined"
                color="error"
                size="small"
                startIcon={<StopCircleIcon />}
                onClick={onEndEarly}
                disabled={isSubmitting}
              >
                End Early
              </Button>
            </>
          )}
          <MockChip
            label={status || "Active"}
            size="medium"
            variant={
              status === "Ended"
                ? "error"
                : status === "Suspended"
                ? "warning"
                : "success"
            }
          />
        </Stack>
      }
    />
  );
};
