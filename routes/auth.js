const express = require('express');
const axios = require('axios');
const auth = require('../middleware/authenticate');
const router = express.Router();

const DUMMY = process.env.DUMMYJSON_BASE || 'https://dummyjson.com';

// Signup: create user on DummyJSON and then log them in
router.post('/signup', async (req, res) => {
    console.log(req.body);
    try {
        const { firstName, lastName, username, password, email } = req.body;

        // 1) Create user on DummyJSON
        const addResp = await axios.post(`${DUMMY}/users/add`, {
            firstName, lastName, username, password, email
        }, { headers: { 'Content-Type': 'application/json' } });

        const createdUser = addResp.data;

        // 2) Login (to get tokens). DummyJSON auth login expects username & password
        const loginResp = await axios.post(`${DUMMY}/auth/login`, {
            username,
            password,
            // you can pass expiresInMins if needed
        }, { headers: { 'Content-Type': 'application/json' } });

        const authData = loginResp.data; // contains accessToken, refreshToken, etc.

        // 3) Set httpOnly cookies for tokens (demo values — tune cookie options in prod)
        const maxAge = 1000 * 60 * 60 * 24 * 7; // 7 days
        res.cookie('accessToken', authData.accessToken, { httpOnly: true, sameSite: 'lax', maxAge });
        res.cookie('refreshToken', authData.refreshToken, { httpOnly: true, sameSite: 'lax', maxAge: 7 * 24 * 3600 * 1000 });

        // Reply with sanitized user info (avoid sending tokens in body if using httpOnly cookies)
        res.json({ ok: true, user: createdUser, auth: { expiresIn: authData.expiresIn } });
    } catch (err) {
        console.error('Signup error', err?.response?.data || err.message);
        const status = err.response?.status || 500;
        res.status(status).json({ message: err.response?.data || err.message });
    }
});

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
        res.json({ user: data }); // you can trim tokens here if preferred
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
        res.json(resp.data);
    } catch (err) {
        const status = err.response?.status || 401;
        res.status(status).json({ message: err.response?.data || 'Failed to fetch user data' });
    }
});

// Refresh token endpoint
router.post('/refresh', async (req, res) => {
    try {
        const { refreshToken, expiresInMins } = req.body;
        const resp = await axios.post(`${DUMMY}/auth/refresh`, { refreshToken, expiresInMins });
        const data = resp.data;
        res.cookie('accessToken', data.accessToken, { httpOnly: true });
        res.cookie('refreshToken', data.refreshToken, { httpOnly: true });
        res.json(data);
    } catch (err) {
        res.status(401).json({ message: 'Could not refresh' });
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
