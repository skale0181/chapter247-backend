// Load environment variables from .env file
require('dotenv').config();

// Import core dependencies
const express = require('express'); // express.js
const cors = require('cors'); // cors middleware
const cookieParser = require('cookie-parser'); // cookie parser middleware use for cookies

// Import route modules
const authRoutes = require('./routes/auth');
const todoRoutes = require('./routes/todos');

// Initialize Express app
const app = express();

// Configure middleware
app.use(express.json()); // Parse JSON request bodies
app.use(cookieParser()); // Parse cookies
app.use(cors({
  origin: '*',   // Allow all origins
}));

// Register API routes
app.use('/api/auth', authRoutes);
app.use('/api/todos', todoRoutes);

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend running on ${PORT}`));
