/**
 * Axios HTTP Client Configuration
 * 
 * Sets up a preconfigured axios instance for making HTTP requests to the backend API.
 * All API requests in the application should use this instance to ensure consistent
 * configuration and error handling.
 */

import axios from 'axios';
import { API_BASE_URL } from '../constants';

const API = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

export default API;