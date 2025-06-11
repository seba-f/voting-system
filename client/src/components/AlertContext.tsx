import React, { createContext, useContext, useState, useCallback } from 'react';
import { Alert, Snackbar } from '@mui/material';
import { useTheme } from '@mui/material/styles';

type AlertType = 'success' | 'error' | 'info' | 'warning';

interface AlertContextType {
  showAlert: (message: string, type: AlertType) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};

interface AlertProviderProps {
  children: React.ReactNode;
}

export const AlertProvider: React.FC<AlertProviderProps> = ({ children }) => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [type, setType] = useState<AlertType>('info');

  const showAlert = useCallback((message: string, type: AlertType) => {
    setMessage(message);
    setType(type);
    setOpen(true);
  }, []);

  const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}      <Snackbar
        open={open}
        autoHideDuration={6000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleClose} 
          severity={type}
          sx={{
            width: '100%',
            color: 'white',
            '&.MuiAlert-standardSuccess': {
              backgroundColor: 'success.main',
              '& .MuiAlert-icon': {
                color: 'white'
              }
            },
            '&.MuiAlert-standardError': {
              backgroundColor: 'error.main',
              '& .MuiAlert-icon': {
                color: 'white'
              }
            },
            '&.MuiAlert-standardWarning': {
              backgroundColor: 'warning.main',
              '& .MuiAlert-icon': {
                color: 'white'
              }
            },
            '&.MuiAlert-standardInfo': {
              backgroundColor: 'info.main',
              '& .MuiAlert-icon': {
                color: 'white'
              }
            }
          }}
        >
          {message}
        </Alert>
      </Snackbar>
    </AlertContext.Provider>
  );
};
