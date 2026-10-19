'use strict';

const path = require('path');
require('dotenv').config();

const express = require('express');
const { handleQuoteRequest, isMailConfigured } = require('./lib/quote');

/* Local development server. On Vercel the app runs as functions in api/ and the
   static site is served from public/ by the CDN. */
const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.disable('x-powered-by');
app.use(express.json({ limit: '64kb' }));
app.use(express.urlencoded({ extended: false, limit: '64kb' }));

app.get('/api/health', function (req, res) {
    res.json({ ok: true, mailConfigured: isMailConfigured() });
});

app.post('/api/quote-request', handleQuoteRequest);

app.use(
    express.static(path.join(__dirname, 'public'), { dotfiles: 'ignore', extensions: ['html'] }),
);

app.listen(PORT, function () {
    console.log('Queen Land dev server running at http://localhost:' + PORT);
    if (isMailConfigured()) {
        console.log('Mail transport configured. Submissions will be emailed.');
    } else {
        console.warn(
            'Mail transport not configured. Copy .env.example to .env and set SMTP_USER / SMTP_PASS to enable email.',
        );
    }
});
