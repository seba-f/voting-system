import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button
} from '@mui/material';

interface BallotActionDialogProps {
  open: boolean;
  action: 'suspend' | 'unsuspend' | 'end';
  onClose: () => void;
  onConfirm: () => void;
}

export const BallotActionDialog: React.FC<BallotActionDialogProps> = ({
  open,
  action,
  onClose,
  onConfirm
}) => {  const title = action === 'suspend' 
    ? 'Suspend Ballot' 
    : action === 'unsuspend'
    ? 'Resume Ballot'
    : 'End Ballot Early';
    
  const message = action === 'suspend'
    ? 'Are you sure you want to suspend this ballot? Users will not be able to vote until the ballot is resumed.'
    : action === 'unsuspend'
    ? 'Are you sure you want to resume this ballot? Users will be able to vote again.'
    : 'Are you sure you want to end this ballot early? This action cannot be undone.';

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="ballot-action-dialog-title"
      aria-describedby="ballot-action-dialog-description"
    >
      <DialogTitle id="ballot-action-dialog-title">
        {title}
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="ballot-action-dialog-description">
          {message}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button 
          onClick={onConfirm}          color={action === 'end' ? 'error' : 'warning'}
          variant="contained"
        >
          Confirm {
            action === 'suspend' ? 'Suspension' 
            : action === 'unsuspend' ? 'Resume' 
            : 'Ending'
          }
        </Button>
      </DialogActions>
    </Dialog>
  );
};
