// cPanel Phusion Passenger must receive the handler — not a self-starting server.
// Requires env var ASTRO_NODE_AUTOSTART=disabled in the Node.js app settings.
import { handler } from './dist/server/entry.mjs';

export default handler;
