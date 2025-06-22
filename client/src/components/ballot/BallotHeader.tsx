import React, { useState } from "react";
import {
  Stack,
  Button,
} from "@mui/material";
import {
  PauseCircle as PauseCircleIcon,
  StopCircle as StopCircleIcon,
  PlayCircle as PlayCircleIcon,
} from "@mui/icons-material";
import { MockChip } from "../MockChip";
import { PageHeader } from "../PageHeader";
import { BallotActionDialog } from "./BallotActionDialog";

interface BallotHeaderProps {
  title: string;
  status: string;
  isAdmin: boolean;
  isSubmitting: boolean;
  onSuspend: () => void;
  onUnsuspend: () => void;
  onEndEarly: () => void;
}

export const BallotHeader = ({
  title,
  status,
  isAdmin,
  isSubmitting,  onSuspend,
  onUnsuspend,
  onEndEarly,
}: BallotHeaderProps) => {
  const [actionDialog, setActionDialog] = useState<'suspend' | 'unsuspend' | 'end' | null>(null);
  const handleAction = (action: 'suspend' | 'unsuspend' | 'end') => {
    if (action === 'suspend') {
      onSuspend();
    } else if (action === 'unsuspend') {
      onUnsuspend();
    } else {
      onEndEarly();
    }
    setActionDialog(null);
  };
  return (
    <>
      <PageHeader
        title={title}
        action={
          <Stack direction="row" spacing={2} alignItems="center">            {isAdmin && (status.toLowerCase() === "active" || status.toLowerCase() === "suspended") && (
              <>
                {status.toLowerCase() === "active" ? (
                  <Button
                    variant="outlined"
                    color="warning"
                    size="small"
                    startIcon={<PauseCircleIcon />}
                    onClick={() => setActionDialog('suspend')}
                    disabled={isSubmitting}
                  >
                    Suspend
                  </Button>
                ) : (
                  <Button
                    variant="outlined"
                    color="warning"
                    size="small"                    startIcon={<PlayCircleIcon />}
                    onClick={() => setActionDialog('unsuspend')}
                    disabled={isSubmitting}
                  >
                    Resume
                  </Button>
                )}
                {status.toLowerCase() === "active" && (
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    startIcon={<StopCircleIcon />}
                    onClick={() => setActionDialog('end')}
                    disabled={isSubmitting}
                  >
                    End Early
                  </Button>
                )}
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
      {actionDialog && (
        <BallotActionDialog
          open={true}
          action={actionDialog}
          onClose={() => setActionDialog(null)}
          onConfirm={() => handleAction(actionDialog)}
        />
      )}
    </>  );
};
