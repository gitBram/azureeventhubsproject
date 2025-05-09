const express = require('express');
const path = require('path');
const apiRoutes = require('./src/routes/eventhubs.routes');
const restrictToLocalhost = require('./src/middleware/restrict.middleware');
const corsMiddleware = require('./src/middleware/cors.middleware');
const bodyParser = require('body-parser');

// Server setup
const app = express();
require('dotenv').config({path: path.join(__dirname, '.env')});

// Middleware
app.use('/api/*', restrictToLocalhost);
app.use(corsMiddleware);
app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // to support URL-encoded bodies

// API Routes
app.use('/api', apiRoutes);

// Serve frontend
app.use(express.static(path.join(__dirname, '../frontend', 'build')));
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend', 'build', "index.html"));
});

// Start server
const port = process.env.EXPRESS_PORT || 5000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});



