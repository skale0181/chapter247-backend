const express = require('express');
const axios = require('axios');
const auth = require('../middleware/authenticate');
const router = express.Router();

const DUMMY = process.env.DUMMYJSON_BASE || 'https://dummyjson.com';

// Login endpoint
router.post('/login', async (req, res) => {
    try {
        const { username, password, expiresInMins } = req.body;
        const resp = await axios.post(`${DUMMY}/auth/login`, {
            username, password, expiresInMins
        }, { headers: { 'Content-Type': 'application/json' } });
        const data = resp.data;
        // Set httpOnly cookies for access & refresh tokens
        res.cookie('accessToken', data.accessToken, { httpOnly: true, maxAge: 1000 * 60 * (expiresInMins || 60) });
        res.cookie('refreshToken', data.refreshToken, { httpOnly: true, maxAge: 1000 * 60 * 60 * 24 * 7 });
        // send data by without token 
        const { accessToken, refreshToken, ...user } = data;
        res.json(user);
    } catch (err) {
        const status = err.response?.status || 500;
        res.status(status).json({ message: err.response?.data || err.message });
    }
});

// Get current user endpoint
router.get('/me', auth, async (req, res) => {
    try {
        const resp = await axios.get(`${DUMMY}/auth/me`, {
            headers: {
                'Authorization': `Bearer ${req.accessToken}`
            }
        });
        const { accessToken, refreshToken, ...user } = resp.data;
        res.json(user);
    } catch (err) {
        const status = err.response?.status || 401;
        res.status(status).json({ message: err.response?.data || 'Failed to fetch user data' });
    }
});

// Logout endpoint
router.post('/logout', (req, res) => {
    // clear cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.json({ ok: true });
});

module.exports = router;
