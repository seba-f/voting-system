import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box, useTheme } from '@mui/material';
import { lightTheme, darkTheme } from './theme';
import { AuthProvider } from './auth/AuthContext';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { Dashboard } from './pages/Dashboard';
import { Navbar } from './components/Navbar';
import { AdminUsers } from './components/AdminUsers';
import { AdminElections } from './components/AdminElections';

interface AppLayoutProps {
    isDarkMode: boolean;
    onThemeToggle: () => void;
}

const AppLayout: React.FC<AppLayoutProps> = ({ isDarkMode, onThemeToggle }) => {
    const theme = useTheme();
    return (
        <Box sx={{ display: 'flex', height: '100vh' }}>
            <Navbar onThemeToggle={onThemeToggle} isDarkMode={isDarkMode} />            <Box component="main" sx={{ 
                flexGrow: 1, 
                p: 3,
                ml: {
                    xs: `${64}px`,
                    md: `${240}px`
                },
                width: {
                    xs: `calc(100% - ${64}px)`,
                    md: `calc(100% - ${240}px)`
                },
                transition: theme.transitions.create(['margin', 'width'], {
                    easing: theme.transitions.easing.sharp,
                    duration: theme.transitions.duration.enteringScreen,
                }),
            }}>
                <Outlet />
            </Box>
        </Box>
    );
};

const App: React.FC = () => {
    const [isDarkMode, setIsDarkMode] = useState(false);

    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
    };

    return (
        <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
            <CssBaseline />
            <AuthProvider>
                <Router>
                    <Routes>
                        {/* Public route - no navbar */}
                        <Route path="/login" element={<LoginPage />} />
                        
                        {/* Protected routes - with navbar */}
                        <Route element={
                            <ProtectedRoute>
                                <AppLayout isDarkMode={isDarkMode} onThemeToggle={toggleTheme} />
                            </ProtectedRoute>
                        }>
                            <Route index element={<Navigate to="/dashboard" replace />} />
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/admin/*" element={
                                <ProtectedRoute requireAdmin>
                                    <Routes>
                                        <Route path="users" element={<AdminUsers />} />
                                        <Route path="elections" element={<AdminElections />} />
                                    </Routes>
                                </ProtectedRoute>
                            } />
                        </Route>
                    </Routes>
                </Router>
            </AuthProvider>
        </ThemeProvider>
    );
};

export default App;