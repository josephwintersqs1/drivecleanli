'use strict';

// cPanel Phusion Passenger expects module.exports (CommonJS), not a self-starting server.
process.env.ASTRO_NODE_AUTOSTART = 'disabled';

const express = require('express');

const app = express();
app.disable('x-powered-by');

const loadHandler = import('./dist/server/entry.mjs').then((mod) => {
  if (typeof mod.handler !== 'function') {
    throw new Error('Astro handler missing — run npm run build and upload dist/');
  }
  return mod.handler;
});

app.use((req, res, next) => {
  loadHandler
    .then((handler) => handler(req, res))
    .catch(next);
});

app.use((err, _req, res, _next) => {
  console.error('[driveclean]', err);
  if (!res.headersSent) {
    res.status(500).end('Application error — check Node.js logs in cPanel.');
  }
});

module.exports = app;
