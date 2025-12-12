const express = require('express');
const axios = require('axios');
const auth = require('../middleware/authenticate');
const router = express.Router();
const DUMMY = process.env.DUMMYJSON_BASE || 'https://dummyjson.com';

// get all todos (supports limit/skip)
router.get('/', auth, async (req, res) => {
    try {
        const { limit, skip } = req.query;
        const resp = await axios.get(`${DUMMY}/todos`, {
            headers: { Authorization: `Bearer ${req.accessToken}` },
            params: { limit, skip }
        });
        res.json(resp.data);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// get todos by user id
router.get('/user/:userId', auth, async (req, res) => {
    const { userId } = req.params;

    try {
        // Option 1: query /todos with userId param (works if DummyJSON supports filtering)
        const resp = await axios.get(`${DUMMY}/todos/user/${userId}`, {
            headers: {
                // forward access token if available - DummyJSON may require it for protected endpoints
                ...(req.accessToken ? { Authorization: `Bearer ${req.accessToken}` } : {})
            },
        });

        // resp.data may contain { todos: [...], total, skip, limit } per DummyJSON
        return res.json(resp.data);
    } catch (err) {
        console.error('Error fetching user todos:', err?.response?.data || err.message);
        const status = err.response?.status || 500;
        return res.status(status).json({ message: err.response?.data || 'Failed to fetch todos' });
    }
});

// add todo 
router.post('/add-todo', auth, async (req, res) => {
    const { todo, completed, userId } = req.body;
    try {
        const resp = await axios.post(`${DUMMY}/todos/add`, { todo, completed, userId }, {
            headers: { Authorization: `Bearer ${req.accessToken}`, 'Content-Type': 'application/json' }
        });
        res.json(resp.data);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// update todo status
router.put('/update-status/:id', auth, async (req, res) => {
    const { completed } = req.body;
    try {
        const id = req.params.id;
        const resp = await axios.put(`${DUMMY}/todos/${id}`, { completed }, {
            headers: { Authorization: `Bearer ${req.accessToken}` }
        });
        res.json(resp.data);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// update todo data
router.put('/update-todo/:id', auth, async (req, res) => {
    const { todo, completed } = req.body;
    try {
        const id = req.params.id;
        const resp = await axios.put(`${DUMMY}/todos/${id}`, { todo, completed }, {
            headers: { Authorization: `Bearer ${req.accessToken}` }
        });
        res.json(resp.data);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// delete todo 
router.delete('/delete-todo/:id', auth, async (req, res) => {
    try {
        const id = req.params.id;
        const resp = await axios.delete(`${DUMMY}/todos/${id}`, {
            headers: { Authorization: `Bearer ${req.accessToken}` }
        });
        res.json(resp.data);
    } catch (err) { res.status(500).json({ message: err.message }); }
});



module.exports = router;
