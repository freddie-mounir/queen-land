'use strict';

const express = require('express');
const { handleQuoteRequest } = require('../lib/quote');

/* Vercel Function: POST /api/quote-request */
const app = express();

app.use(express.json({ limit: '64kb' }));
app.use(express.urlencoded({ extended: false, limit: '64kb' }));

app.use(function (req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ errorKey: 'formError' });
    }
    return handleQuoteRequest(req, res);
});

module.exports = app;
