/**
 * @module passport-easypanel
 */

import { Strategy as BearerStrategy } from 'passport-http-bearer';
import axios from 'axios';

/**
 * @typedef {Object} EasypanelUser
 * @property {string} id - The unique identifier of the user
 * @property {string} email - The user's email address
 * @property {boolean} admin - Whether the user has admin privileges
 * @property {Date} createdAt - When the user was created
 * @property {boolean} twoFactorEnabled - Whether 2FA is enabled for the user
 */

/**
 * @typedef {Object} LoginCredentials
 * @property {string} email - User's email address
 * @property {string} password - User's password
 * @property {boolean} [rememberMe] - Whether to remember the login
 * @property {string} [code] - 2FA code if enabled
 */

/**
 * @typedef {Object} StrategyOptions
 * @property {string} baseUrl - The base URL of the Easypanel instance
 */

/**
 * Error class for Easypanel authentication errors
 * @extends Error
 */
export class EasypanelAuthError extends Error {
    /**
     * Creates an instance of EasypanelAuthError
     * @param {string} message - Error message
     * @param {number} statusCode - HTTP status code
     */
    constructor(message, statusCode) {
        super(message);
        this.name = 'EasypanelAuthError';
        this.statusCode = statusCode;
    }
}

/**
 * Passport strategy for authenticating with Easypanel using bearer tokens
 * @extends BearerStrategy
 */
export class EasypanelStrategy extends BearerStrategy {
    /**
     * Creates an instance of EasypanelStrategy
     * @param {StrategyOptions} options - Configuration options
     * @throws {Error} Will throw an error if baseUrl is not provided
     */
    constructor(options = {}) {
        if (!options.baseUrl) {
            throw new Error('baseUrl is required for EasypanelStrategy');
        }

        super(async (token, done) => {
            try {
                const user = await this.validateUser(token, options.baseUrl);
                return done(null, user);
            } catch (error) {
                return done(error);
            }
        });

        this.name = 'easypanel';
        this.baseUrl = options.baseUrl.replace(/\/$/, '');
    }

    /**
     * Validates a user token against the Easypanel API
     * @param {string} token - The authentication token
     * @param {string} baseUrl - The base URL of the Easypanel instance
     * @returns {Promise<EasypanelUser>} The validated user object
     * @throws {EasypanelAuthError} If validation fails
     * @private
     */
    async validateUser(token, baseUrl) {
        try {
            const response = await axios.get(`${baseUrl}/api/trpc/auth.getUser`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': '*/*'
                }
            });

            if (!response.data?.result?.data?.json) {
                throw new EasypanelAuthError('Invalid response format', 500);
            }

            const userData = response.data.result.data.json;
            return {
                id: userData.id,
                email: userData.email,
                admin: userData.admin,
                createdAt: new Date(userData.createdAt),
                twoFactorEnabled: userData.twoFactorEnabled
            };
        } catch (error) {
            if (error.response) {
                throw new EasypanelAuthError(
                    error.response.data?.message || 'Authentication failed',
                    error.response.status
                );
            }
            throw new EasypanelAuthError('Authentication service unavailable', 503);
        }
    }

    /**
     * Authenticates user credentials and returns a token
     * @param {string} baseUrl - The base URL of the Easypanel instance
     * @param {LoginCredentials} credentials - User login credentials
     * @returns {Promise<string>} Authentication token
     * @throws {EasypanelAuthError} If login fails
     * @static
     */
    static async login(baseUrl, credentials) {
        try {
            const response = await axios.post(
                `${baseUrl}/api/trpc/auth.login`,
                {
                    json: {
                        email: credentials.email,
                        password: credentials.password,
                        rememberMe: credentials.rememberMe || false,
                        code: credentials.code
                    }
                },
                {
                    headers: {
                        'Accept': '*/*',
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (!response.data?.result?.data?.json?.token) {
                throw new EasypanelAuthError('Invalid response format', 500);
            }

            return response.data.result.data.json.token;
        } catch (error) {
            if (error.response) {
                throw new EasypanelAuthError(
                    error.response.data?.message || 'Login failed',
                    error.response.status
                );
            }
            throw new EasypanelAuthError('Authentication service unavailable', 503);
        }
    }
}