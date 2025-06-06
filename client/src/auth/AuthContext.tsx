/**
 * Authentication and Session Management Module
 * 
 * This module provides authentication context and session management for the application.
 * It handles user login/logout, session persistence, and automatic session expiry with warnings.
 */

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import API from "../api/axios";
import { SessionExpiryDialog } from '../components/SessionExpiryDialog';
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
    
    // Single timer for session expiry warning and auto-logout
    const expiryTimerRef = useRef<NodeJS.Timeout | null>(null);

    const clearTimer = useCallback(() => {
        if (expiryTimerRef.current) {
            clearTimeout(expiryTimerRef.current);
            expiryTimerRef.current = null;
        }
    }, []);

    // Handle session cleanup and user logout
    const logout = useCallback(async () => {
        clearTimer();
        // Get token directly from localStorage instead of state
        const tokenToClear = localStorage.getItem('token');
        console.log('Current token state:', token);
        console.log('Token from localStorage:', tokenToClear);
        
        try {
            if(tokenToClear) {
                console.log('Making logout API call with token:', tokenToClear);
                await API.post('/logout', {}, {
                    headers: { Authorization: `Bearer ${tokenToClear}` },
                    timeout: 5000
                });
                
                // Clear everything after successful API call
                setToken(null);
                setUser(null);
                setShowSessionDialog(false);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                localStorage.removeItem('sessionExpiry');
                delete API.defaults.headers.common['Authorization'];
            }
        } catch (error) {
            console.error('Logout error:', error);
        }
    }, [clearTimer]);    // Set up session expiry timer
    const setupSessionExpiry = useCallback((persist: boolean) => {
        clearTimer();
        
        const expiryTime = Date.now() + SESSION_DURATION_MS;
        
        if (persist) {
            localStorage.setItem('sessionExpiry', expiryTime.toString());
        }

        const warningDelay = SESSION_DURATION_MS - WARNING_BEFORE_MS;
        
        expiryTimerRef.current = setTimeout(() => {
            setShowSessionDialog(true);
            
            const startTime = Date.now();
            const warningDuration = WARNING_BEFORE_MS;
            const logoutTime = startTime + warningDuration;
            
            const countdownInterval = setInterval(() => {
                const now = Date.now();
                const remainingMs = logoutTime - now;
                
                if (remainingMs <= 0) {
                    clearInterval(countdownInterval);
                    setShowSessionDialog(false);
                    // Call logout regardless of token presence
                    logout();
                } else {
                    setCountdown(Math.ceil(remainingMs / 1000));
                }
            }, 100);
        }, warningDelay);
    }, [logout, clearTimer]); // Removed token dependency since we don't need it

    const login = async (email: string, password: string, persist: boolean = false) => {
        try {
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
        } catch (error) {
            throw error;
        }
    };

    const extendSession = async () => {
        try {
            const response = await API.post('/extend-session');
            const { token: newToken } = response.data;
            
            setToken(newToken);
            API.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
            
            setupSessionExpiry(!!localStorage.getItem('sessionExpiry'));
            setShowSessionDialog(false);
        } catch (error) {
            console.error('Failed to extend session:', error);
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
                const expiryTime = parseInt(storedExpiry);
                if (Date.now() < expiryTime) {
                    setToken(storedToken);
                    setUser(JSON.parse(storedUser));
                    API.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
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
        return () => clearTimer();
    }, [clearTimer]);

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