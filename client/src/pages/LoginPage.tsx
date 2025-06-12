import { useLocation, useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useState } from "react";
import { Box, TextField, Button, Typography, Container, Alert, Card, CardContent, FormControlLabel, Checkbox } from "@mui/material";
import { useAlert } from "../components/AlertContext";
import logo from '../assets/logo_full.svg';
import TitleBar from "../components/TitleBar";

export const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<{
        type: 'auth' | 'generic' | null;
        message: string;
    }>({ type: null, message: '' });
    const [saveSession, setSaveSession] = useState(false);    
    const { login, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const { showAlert } = useAlert();

    const handleDevLogin = async (type: 'admin' | 'user1') => {
        const credentials = {
            admin: { email: 'admin@example.com', password: 'pass' },
            user1: { email: 'user1@email.com', password: 'user1' }
        };
        
        try {
            const { email, password } = credentials[type];
            setEmail(email);
            setPassword(password);
            await login(email, password, true);
            showAlert('Login successful', 'success');
            const from = location.state?.from?.pathname || '/dashboard';
            navigate(from, { replace: true });
        } catch (err: any) {
            if (err?.message?.includes('auth') || err?.code?.includes('auth')) {
                setError({
                    type: 'auth',
                    message: 'Invalid email or password'
                });
            } else {
                setError({
                    type: 'generic',
                    message: 'An error occurred. Please try again later.'
                });
            }
            console.error('Login error: ', err);
        }
    };

    if (user) {
        return <Navigate to="/dashboard" replace />;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await login(email, password, saveSession);
            showAlert('Login successful', 'success');
            const from = location.state?.from?.pathname || '/dashboard';
            navigate(from, { replace: true });
        } catch (err: any) {
            if (err?.message?.includes('auth') || err?.code?.includes('auth')) {
                setError({
                    type: 'auth',
                    message: 'Invalid email or password'
                });
            } else {
                setError({
                    type: 'generic',
                    message: 'An error occurred. Please try again later.'
                });
            }
            console.error('Login error: ', err);
        }
    };

    return (
        <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
            <TitleBar />
            <Container maxWidth="sm" sx={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
                py: 4
            }}>
                <img 
                    src={logo} 
                    alt="Logo" 
                    style={{ 
                        height: 60,
                        width: 'auto'
                    }} 
                />
                <Card sx={{ width: '100%' }}>
                    <CardContent>
                        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Typography variant="h5" component="h1" align="center" gutterBottom>
                                Login
                            </Typography>
                            {error.type && (
                                <Alert severity="error">
                                    {error.message}
                                </Alert>
                            )}
                            <TextField
                                required
                                fullWidth
                                label="Email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <TextField
                                required
                                fullWidth
                                label="Password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={saveSession}
                                        onChange={(e) => setSaveSession(e.target.checked)}
                                    />
                                }
                                label="Keep me signed in for 1 hour"
                            />
                            <Button
                                type="submit"
                                variant="contained"
                                fullWidth
                                size="large"
                            >
                                Login
                            </Button>
                            
                            {process.env.NODE_ENV === 'development' && (
                                <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                                    <Button
                                        fullWidth
                                        variant="outlined"
                                        color="primary"
                                        onClick={() => {handleDevLogin('admin')}}
                                    >
                                        Dev: Login as Admin
                                    </Button>
                                    <Button
                                        fullWidth
                                        variant="outlined"
                                        color="primary"
                                        onClick={() => handleDevLogin('user1')}
                                    >
                                        Dev: Login as User1
                                    </Button>
                                </Box>
                            )}
                        </Box>
                    </CardContent>
                </Card>
            </Container>
        </Box>
    );
};
