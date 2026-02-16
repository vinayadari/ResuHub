require('dotenv').config();
const express = require('express');
const cors = require('cors');
const resumeRoutes = require('../routes/resumes');
const aiRoutes = require('../routes/ai');

const app = express();

// Middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// CORS configuration from environment variables
const allowedOrigins = [
    process.env.FRONTEND_URL,
    process.env.FRONTEND_URL_ALT
].filter(Boolean);

app.use(cors({
    origin: allowedOrigins.length > 0 ? allowedOrigins : ['http://localhost:5173', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/resumes', resumeRoutes);
app.use('/api/ai', aiRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
});

// Export for Vercel serverless
module.exports = app;
