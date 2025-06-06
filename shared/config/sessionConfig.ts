/**
 * Session Configuration
 * 
 * This file contains shared session configuration settings used by both
 * the client and server to ensure consistent session management.
 */

// Session duration is 1 hour (in milliseconds)
export const SESSION_DURATION_MS = 60 * 60 * 1000;

// Show warning 5 minutes before expiry
export const WARNING_BEFORE_MS = 5 * 60 * 1000;

// JWT token expiry matches session duration
export const JWT_EXPIRY = '1h';

/**
 * Format remaining time as MM:SS
 */
export function formatTimeRemaining(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}
