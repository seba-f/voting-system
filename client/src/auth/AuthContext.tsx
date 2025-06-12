/**
 * Authentication and Session Management Module
 * 
 * This module provides authentication context and session management for the application.
 * It handles user login/logout, session persistence, and automatic session expiry with warnings.
 */

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import API from "../api/axios";
import { SessionExpiryDialog } from '../components/SessionExpiryDialog';
import { useAlert } from '../components/AlertContext';
import { SESSION_DURATION_MS, WARNING_BEFORE_MS, formatTimeRemaining } from '../config/sessionConfig';

/** Represents a user in the application */
interface User {
    id: number;
    email: string;
    username: string;
    roles: Array<{name: string}>;
}

/** Authentication context interface */
interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (email: string, password: string, persist: boolean) => Promise<void>;
    logout: () => Promise<void>;
    isAdmin: () => boolean;
    showSessionDialog: boolean;
    countdown: number;
    extendSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({children}: {children: React.ReactNode}) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [showSessionDialog, setShowSessionDialog] = useState(false);
    const [countdown, setCountdown] = useState(Math.floor(WARNING_BEFORE_MS / 1000));
    const { showAlert } = useAlert();
    
    // Timer refs for session expiry warning and countdown
    const expiryTimerRef = useRef<NodeJS.Timeout | null>(null);
    const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const clearTimers = useCallback(() => {
        if (expiryTimerRef.current) {
            clearTimeout(expiryTimerRef.current);
            expiryTimerRef.current = null;
        }
        if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
        }
        setShowSessionDialog(false);
    }, []);

    // Handle session cleanup and user logout
    const logout = useCallback(async () => {
        clearTimers();
        const tokenToClear = localStorage.getItem('token');
        showAlert('Signing out...', 'info');
        
        try {
            if(tokenToClear) {
                await API.post('/logout', {}, {
                    headers: { Authorization: `Bearer ${tokenToClear}` },
                    timeout: 5000
                });
                
                setToken(null);
                setUser(null);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                localStorage.removeItem('sessionExpiry');
                delete API.defaults.headers.common['Authorization'];
                showAlert('Successfully signed out', 'success');
            }
        } catch (error) {
            console.error('Logout error:', error);
            showAlert('Error during sign out', 'error');
        }
    }, [clearTimers, token, showAlert]);

    // Set up session expiry timer
    const setupSessionExpiry = useCallback((persist: boolean) => {
        clearTimers();
        
        const expiryTime = Date.now() + SESSION_DURATION_MS;
        
        if (persist) {
            localStorage.setItem('sessionExpiry', expiryTime.toString());
        }

        const warningDelay = SESSION_DURATION_MS - WARNING_BEFORE_MS;
        
        expiryTimerRef.current = setTimeout(() => {
            setShowSessionDialog(true);
            setCountdown(Math.floor(WARNING_BEFORE_MS / 1000));
            showAlert('Your session will expire soon', 'warning');
            
            const startTime = Date.now();
            const warningDuration = WARNING_BEFORE_MS;
            const logoutTime = startTime + warningDuration;
            
            countdownIntervalRef.current = setInterval(() => {
                const now = Date.now();
                const remainingMs = logoutTime - now;
                
                if (remainingMs <= 0) {
                    clearTimers();
                    showAlert('Session expired', 'error');
                    logout();
                } else {
                    setCountdown(Math.ceil(remainingMs / 1000));
                }
            }, 1000);
        }, warningDelay);
    }, [clearTimers, logout, showAlert]);

    const login = async (email: string, password: string, persist: boolean = false) => {
        try {
            showAlert('Signing in...', 'info');
            const response = await API.post('/login', {email, password});
            const {token: newToken, user: userData} = response.data;

            // Set the Authorization header before state updates
            API.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

            // Update localStorage before state updates
            localStorage.setItem('token', newToken);
            localStorage.setItem('user', JSON.stringify(userData));
            
            if (persist) {
                localStorage.setItem('sessionExpiry', (Date.now() + SESSION_DURATION_MS).toString());
            }

            // State updates
            setToken(newToken);
            setUser(userData);

            // Set up session expiry after everything else
            setupSessionExpiry(persist);
            showAlert('Successfully signed in', 'success');
        } catch (error) {
            showAlert('Login failed', 'error');
            throw error;
        }
    };
    
    const extendSession = async () => {
        try {
            const response = await API.post('/extend-session');
            const { token: newToken } = response.data;
            
            // Update token in state and API headers
            setToken(newToken);
            API.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
            
            // Always update localStorage with new expiry time
            const expiryTime = Date.now() + 60*60*1000; //always extend by 1h
            localStorage.setItem('sessionExpiry', expiryTime.toString());
            localStorage.setItem('token', newToken);
            
            // Reset timers and hide dialog
            clearTimers();
            setupSessionExpiry(true);
            showAlert(`New expiry time: ${new Date(expiryTime).toLocaleString()}`, 'info');
        } catch (error) {
            console.error('Failed to extend session:', error);
            showAlert('Failed to extend session, signing out...', 'error');
            await logout();
        }
    };

    // Initialize stored session
    useEffect(() => {
        const init = async () => {
            const storedToken = localStorage.getItem('token');
            const storedUser = localStorage.getItem('user');
            const storedExpiry = localStorage.getItem('sessionExpiry');

            if (storedToken && storedUser && storedExpiry) {
                const expiryTime = parseInt(storedExpiry);                if (Date.now() < expiryTime) {
                    setToken(storedToken);
                    setUser(JSON.parse(storedUser));
                    API.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
                    await API.put(`/sessions/active-status`, { isActive: true });
                    setupSessionExpiry(true);
                } else {
                    await logout();
                }
            }
        };
        
        init().catch(console.error);
    }, [setupSessionExpiry, logout]);

    // Clean up before unload if session is not persisted
    useEffect(() => {
        const handleBeforeUnload = () => {
            if (!localStorage.getItem('sessionExpiry')) {
                logout();
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [logout]);

    // Clean up timer on unmount
    useEffect(() => {
        return () => clearTimers();
    }, [clearTimers]);

    // Log token changes
    useEffect(() => {
        console.log('Token changed:', token);
    }, [token]);

    const isAdmin = useCallback(() => {
        return user?.roles.some(role => role.name === 'admin' || role.name === 'DefaultAdmin') ?? false;
    }, [user]);

    return (
        <AuthContext.Provider value={{ 
            user, 
            token, 
            login, 
            logout, 
            isAdmin,
            showSessionDialog,
            countdown,
            extendSession 
        }}>
            {children}
            {<SessionExpiryDialog
                open={showSessionDialog}
                onExtend={extendSession}
                countdown={countdown}
            />}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};