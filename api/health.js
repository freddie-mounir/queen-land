'use strict';

const { isMailConfigured } = require('../lib/quote');

/* Vercel Function: GET /api/health */
module.exports = function handler(req, res) {
    res.status(200).json({ ok: true, mailConfigured: isMailConfigured() });
};
