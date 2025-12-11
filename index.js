// Load environment variables from .env file
require('dotenv').config();

// Import core dependencies
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

// Import route modules
const authRoutes = require('./routes/auth');
const todoRoutes = require('./routes/todos');

// Initialize Express app
const app = express();

// Configure middleware
app.use(express.json()); // Parse JSON request bodies
app.use(cookieParser()); // Parse cookies
app.use(cors({
    origin: 'http://localhost:3000', // Must specify exact origin when using credentials
    credentials: true // Enable credentials (cookies, auth headers)
}));

// Register API routes
app.use('/api/auth', authRoutes);
app.use('/api/todos', todoRoutes);

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend running on ${PORT}`));
