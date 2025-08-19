const JWT = require('jsonwebtoken');
const User = require('../models/userModel');
const { CacheService } = require('../config/redis');

// Enhanced authentication middleware with Redis caching
const authMiddleware = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Access token is required'
            });
        }

        const token = authHeader.split(' ')[1];

        // Check if token is blacklisted (logout functionality)
        const isBlacklisted = await CacheService.exists(`blacklist:${token}`);
        if (isBlacklisted) {
            return res.status(401).json({
                success: false,
                message: 'Token has been invalidated'
            });
        }

        // Verify token
        const decoded = JWT.verify(token, process.env.JWT_SECRET);
        
        // Check cache first for user data
        const cacheKey = `user:${decoded.id}`;
        let user = await CacheService.get(cacheKey);
        
        if (!user) {
            // If not in cache, fetch from database
            user = await User.findById(decoded.id).select('-password');
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'User not found'
                });
            }
            
            // Cache user data for 30 minutes
            await CacheService.set(cacheKey, user, 1800);
        }

        // Add user to request object
        req.user = user;
        next();

    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token has expired'
            });
        }

        console.error('Auth middleware error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// GraphQL context authentication
const getGraphQLUser = async (req) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return null;
        }

        const token = authHeader.split(' ')[1];
        
        // Check if token is blacklisted
        const isBlacklisted = await CacheService.exists(`blacklist:${token}`);
        if (isBlacklisted) {
            return null;
        }

        const decoded = JWT.verify(token, process.env.JWT_SECRET);
        
        // Check cache first
        const cacheKey = `user:${decoded.id}`;
        let user = await CacheService.get(cacheKey);
        
        if (!user) {
            user = await User.findById(decoded.id).select('-password');
            if (user) {
                await CacheService.set(cacheKey, user, 1800);
            }
        }

        return user;
    } catch (error) {
        return null;
    }
};

// Logout functionality - blacklist token
const logout = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(400).json({
                success: false,
                message: 'No token provided'
            });
        }

        const token = authHeader.split(' ')[1];
        
        // Get token expiration
        const decoded = JWT.verify(token, process.env.JWT_SECRET);
        const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);
        
        // Add token to blacklist with expiration
        await CacheService.set(`blacklist:${token}`, true, expiresIn);
        
        // Clear user cache
        await CacheService.del(`user:${decoded.id}`);

        res.status(200).json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Rate limiting per user
const createUserRateLimit = async (userId, limit = 100, windowMs = 15 * 60 * 1000) => {
    const key = `rate_limit:${userId}`;
    const current = await CacheService.get(key) || 0;
    
    if (current >= limit) {
        return false;
    }
    
    await CacheService.set(key, current + 1, Math.floor(windowMs / 1000));
    return true;
};

module.exports = {
    authMiddleware,
    getGraphQLUser,
    logout,
    createUserRateLimit
};
