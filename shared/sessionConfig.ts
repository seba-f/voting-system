/**
 * Shared session configuration between client and server
 */

/** Session duration in minutes */
const SESSION_DURATION_MIN = 0.5; // 1 hour

/** Minutes before session end to show warning */
const MINUTES_BEFORE_EXPIRY = 0.25;

/** Session duration in milliseconds */
export const SESSION_DURATION_MS = SESSION_DURATION_MIN * 60 * 1000;

/** How many ms before session end to show warning */
export const WARNING_BEFORE_MS = MINUTES_BEFORE_EXPIRY * 60 * 1000;

/** JWT expiry string */
export const JWT_EXPIRY = '30s';

/** Duration in seconds for JWT token */
export const SESSION_DURATION_SEC = Math.floor(SESSION_DURATION_MS / 1000);

/** Format remaining time as minutes and seconds */
export const formatTimeRemaining = (ms: number): string => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
};