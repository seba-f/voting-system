/**
 * Session Expiry Dialog Component
 * 
 * Displays a warning dialog when the user's session is about to expire.
 * Gives users the option to extend their session or logout.
 * Automatically appears 5 minutes before session expiry.
 */

import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

interface SessionExpiryDialogProps {
    /** Whether the dialog is visible */
    open: boolean;
    /** Callback to extend the session */
    onExtend: () => Promise<void>;
    /** Countdown in seconds until session expiry */
    countdown: number;
}

export const SessionExpiryDialog: React.FC<SessionExpiryDialogProps> = ({ 
    open, 
    onExtend, 
    countdown 
}) => {
    return (
        <Dialog
            open={open}
            disableEscapeKeyDown    // Prevent dismissal with Escape key
            disableAutoFocus         // Prevent auto-focusing the first button
            disableEnforceFocus     // Disable enforcing focus within the dialog
        >
            <DialogTitle>Session Expiring</DialogTitle>
            <DialogContent>
                <Typography>
                    Your session will expire in {countdown} seconds. Would you like to extend it?
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={onExtend}
                    variant="contained"
                    color="primary"
                    autoFocus  // Focus on extend button by default
                >
                    Extend Session
                </Button>
            </DialogActions>
        </Dialog>
    );
};