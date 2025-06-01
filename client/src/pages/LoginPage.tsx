import { useLocation, useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useState } from "react";
import { Box, TextField, Button, Typography, Container, Alert } from "@mui/material";

export const LoginPage : React.FC = ()=>{
    const [email,setEmail]=useState('');
    const [password,setPassword]=useState('');
    const [error,setError]=useState('');
    const {login,user}=useAuth();
    const navigate=useNavigate();
    const location=useLocation();

    if(user){
        return <Navigate to="/dashboard" replace/>;
    }

    const handleSubmit=async(e:React.FormEvent)=>{
        e.preventDefault();
        try{
            await login(email,password);
            const from=location.state?.from?.pathname || '/dashboard';
            navigate(from,{replace:true});
        }catch(err){
            setError('Invalid email or password');
            console.error('Login error: ',err);
        }
    };

    return(
        <Container component="main" maxWidth="xs">
            <Box sx={{
                marginTop:8,
                display:'flex',
                flexDirection:'column',
                alignItems:'center',
            }}>
                <Typography component="h1" variant="h5">
                    Sign in
                </Typography>
                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="email"
                        label="Email Address"
                        name="email"
                        autoComplete="email"
                        autoFocus
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Password"
                        type="password"
                        id="password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                    >
                        Sign In
                    </Button>
                </Box>
            </Box>
        </Container>
    );
}