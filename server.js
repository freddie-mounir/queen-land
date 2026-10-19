'use strict';

require('dotenv').config();

const path = require('path');
const fs = require('fs');
const express = require('express');
const nodemailer = require('nodemailer');

const app = express();
const PORT = Number(process.env.PORT) || 3000;

/* Product catalogue lives in data/products.json so categories/products can be
   added or edited in one place. It is read per request, so changes apply live. */
const CATALOG_PATH = path.join(__dirname, 'data', 'products.json');

function localizeName(name) {
    if (!name) return '';
    return name.en || name.ar || '';
}

function readCatalog() {
    const raw = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf8'));
    const index = new Map();
    (Array.isArray(raw.categories) ? raw.categories : []).forEach(function (category) {
        const products = new Map();
        (category.products || []).forEach(function (product) {
            products.set(product.id, localizeName(product.name));
        });
        index.set(category.id, { label: localizeName(category.name), products: products });
    });
    return index;
}

const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = Number(process.env.SMTP_PORT) || 465;
const MAIL_FROM = process.env.MAIL_FROM || process.env.SMTP_USER;
const MAIL_TO = process.env.MAIL_TO || 'info@queenland-group.com';

const mailer =
    process.env.SMTP_USER && process.env.SMTP_PASS
        ? nodemailer.createTransport({
              host: SMTP_HOST,
              port: SMTP_PORT,
              secure: SMTP_PORT === 465,
              auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
          })
        : null;

app.disable('x-powered-by');
app.use(express.json({ limit: '64kb' }));
app.use(express.urlencoded({ extended: false, limit: '64kb' }));

/* Never expose server-side or secret files through the static handler. */
const BLOCKED_PATHS = new Set([
    '/server.js',
    '/package.json',
    '/package-lock.json',
    '/.env',
    '/.env.example',
    '/.gitignore',
]);

app.use(function (req, res, next) {
    if (
        BLOCKED_PATHS.has(req.path) ||
        req.path.startsWith('/node_modules') ||
        req.path.startsWith('/.git')
    ) {
        return res.status(404).end();
    }
    next();
});

app.use(express.static(__dirname, { dotfiles: 'ignore', extensions: ['html'] }));

function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (character) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character];
    });
}

function isValidEmail(value) {
    return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/* Very light in-memory rate limit: 5 submissions per IP per 10 minutes. */
const submissions = new Map();
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 5;

function isRateLimited(ip) {
    const now = Date.now();
    const hits = (submissions.get(ip) || []).filter((time) => now - time < RATE_WINDOW_MS);
    hits.push(now);
    submissions.set(ip, hits);
    return hits.length > RATE_MAX;
}

function buildRow(label, value) {
    return (
        '<tr>' +
        '<td style="padding:8px 14px;border:1px solid #e5e7eb;background:#f7f9fb;font-weight:bold;white-space:nowrap;">' +
        escapeHtml(label) +
        '</td>' +
        '<td style="padding:8px 14px;border:1px solid #e5e7eb;">' +
        escapeHtml(value) +
        '</td>' +
        '</tr>'
    );
}

app.get('/api/health', function (req, res) {
    res.json({ ok: true, mailConfigured: Boolean(mailer) });
});

app.post('/api/quote-request', async function (req, res) {
    try {
        if (isRateLimited(req.ip)) {
            return res.status(429).json({ errorKey: 'formError' });
        }

        const body = req.body || {};
        const category = String(body.category || '').trim();
        const product = String(body.product || '').trim();
        const quantity = String(body.quantity || '').trim();
        const name = String(body.name || '').trim();
        const email = String(body.email || '').trim();
        const phone = String(body.phone || '').trim();
        const honeypot = String(body.company || '').trim();

        // Hidden field filled in => almost certainly a bot. Pretend success.
        if (honeypot) {
            return res.status(200).json({ ok: true });
        }

        let catalog;
        try {
            catalog = readCatalog();
        } catch (error) {
            console.error('Failed to read data/products.json:', error.message);
            return res.status(500).json({ errorKey: 'formError' });
        }

        const categoryEntry = catalog.get(category) || null;
        const productLabel = categoryEntry ? categoryEntry.products.get(product) : null;

        if (
            !categoryEntry ||
            !productLabel ||
            !quantity ||
            !name ||
            !isValidEmail(email) ||
            phone.length < 6
        ) {
            return res.status(400).json({ errorKey: 'formError' });
        }

        if (!mailer || !MAIL_FROM || !MAIL_TO) {
            console.error(
                'Mail transport is not configured. Set SMTP_USER, SMTP_PASS, MAIL_FROM and MAIL_TO in .env.',
            );
            return res.status(500).json({ errorKey: 'formError' });
        }

        const subject = 'New price offer request: ' + productLabel + ' - ' + name;

        const textBody = [
            'New price offer request',
            '',
            'Category: ' + categoryEntry.label,
            'Product: ' + productLabel,
            'Quantity: ' + quantity,
            'Client name: ' + name,
            'Email: ' + email,
            'Phone: ' + phone,
        ].join('\n');

        const htmlBody =
            '<div style="font-family:Arial,Helvetica,sans-serif;color:#232323;">' +
            '<h2 style="margin:0 0 16px;">New price offer request</h2>' +
            '<table style="border-collapse:collapse;font-size:14px;">' +
            buildRow('Category', categoryEntry.label) +
            buildRow('Product', productLabel) +
            buildRow('Quantity', quantity) +
            buildRow('Client name', name) +
            buildRow('Email', email) +
            buildRow('Phone', phone) +
            '</table>' +
            '<p style="margin:16px 0 0;font-size:12px;color:#6f6f6f;">Sent from the Queen Land Group website.</p>' +
            '</div>';

        await mailer.sendMail({
            from: '"Queen Land Website" <' + MAIL_FROM + '>',
            to: MAIL_TO,
            replyTo: { name: name, address: email },
            subject: subject,
            text: textBody,
            html: htmlBody,
        });

        return res.status(200).json({ ok: true });
    } catch (error) {
        console.error('Failed to send price offer request:', error);
        return res.status(500).json({ errorKey: 'formError' });
    }
});

app.listen(PORT, function () {
    console.log('Queen Land server running at http://localhost:' + PORT);
    if (mailer) {
        mailer.verify().then(
            function () {
                console.log('SMTP connection verified. Emails will be delivered.');
            },
            function (error) {
                console.error('SMTP verification failed:', error.message);
            },
        );
    } else {
        console.warn(
            'Mail transport not configured. Copy .env.example to .env and set SMTP_USER / SMTP_PASS to enable email.',
        );
    }
});
