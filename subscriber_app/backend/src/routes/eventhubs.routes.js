const express = require('express');
const { SqlServerClient } = require('../clients/SqlServerClient');
const path = require('path');
require('dotenv').config({path: path.join(__dirname, '../../.env')})

const router = express.Router();
const sqlServerClient = new SqlServerClient({
    user: process.env.SQL_SERVER_USER,
    password: process.env.SQL_SERVER_PASSWORD,
    server: process.env.SQL_SERVER_HOST,
    database: process.env.SQL_SERVER_DATABASE,
    options: {
        encrypt: true, // Use encryption
        trustServerCertificate: true, // Trust the server certificate
    },
    emulate: process.env.EMULATION_ACTIVE === 'true', // Enable emulation if specified
});

router.get('/query', (req, res) => {
    const query = req.query.query;
    const params = req.query.params ? JSON.parse(req.query.params) : {};
    sqlServerClient.query(query, params)
        .then((result) => {
            res.json(result);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error executing query');
        });
});

module.exports = router;