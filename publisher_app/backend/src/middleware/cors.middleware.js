const path = require('path');
require('dotenv').config({path: path.join(__dirname, '../../../.env')});

// Exporting a middleware function for handling CORS (Cross-Origin Resource Sharing)
module.exports = (req, res, next) => {
    // Allow requests from the specified origin (in this case, http://localhost:3000)
    res.header('Access-Control-Allow-Origin', `http://localhost:${process.env.CLIENT_PORT}`);
    
    // Specify the allowed headers for incoming requests
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    
    // Pass control to the next middleware function in the stack
    next();
};