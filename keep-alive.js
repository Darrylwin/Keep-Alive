/**
 * keep-alive.js
 * Ping périodiquement une URL pour éviter le spin-down d'un service
 * hébergé sur une plateforme free tier avec mise en veille par inactivité
 * (Render, Railway, Fly.io, etc.).
 *
 * Configuration via variables d'environnement (voir .env.example) :
 *
 *   TARGET_URL        URL à pinguer (obligatoire)
 *   INTERVAL_MINUTES  Intervalle entre deux pings (défaut: 10)
 *   REQUEST_TIMEOUT_S Timeout d'une requête, en secondes (défaut: 20)
 *   PORT              Port du serveur de statut local (défaut: 3000)
 *
 * Usage:
 *   cp .env.example .env   # puis éditer .env
 *   npm install
 *   npm start
 */

require("dotenv").config();
const http = require("http");

const TARGET_URL = process.env.TARGET_URL;
const INTERVAL_MINUTES = Number(process.env.INTERVAL_MINUTES || 10);
const REQUEST_TIMEOUT_S = Number(process.env.REQUEST_TIMEOUT_S || 20);
const PORT = process.env.PORT || 3000;

if (!TARGET_URL) {
  console.error("Erreur: la variable d'environnement TARGET_URL est requise.");
  console.error("Copie .env.example vers .env et renseigne TARGET_URL.");
  process.exit(1);
}

const INTERVAL_MS = INTERVAL_MINUTES * 60 * 1000;

let lastPing = null;
let lastStatus = null;
let pingCount = 0;
let errorCount = 0;

async function pingTarget() {
  const startedAt = new Date();
  try {
    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      REQUEST_TIMEOUT_S * 1000,
    );

    const res = await fetch(TARGET_URL, { signal: controller.signal });
    clearTimeout(timeout);

    pingCount += 1;
    lastPing = startedAt;
    lastStatus = res.status;

    console.log(
      `[${startedAt.toISOString()}] Ping #${pingCount} -> ${TARGET_URL} : HTTP ${res.status}`,
    );
  } catch (err) {
    errorCount += 1;
    lastPing = startedAt;
    lastStatus = "error";
    console.error(
      `[${startedAt.toISOString()}] Ping échoué -> ${TARGET_URL} : ${err.message}`,
    );
  }
}

// Premier ping immédiat, puis toutes les INTERVAL_MINUTES
pingTarget();
setInterval(pingTarget, INTERVAL_MS);

// Petit serveur HTTP de statut, utile si tu héberges ce script lui-même
// sur une plateforme qui exige un port ouvert pour le considérer "up".
const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(
    JSON.stringify({
      status: "running",
      target: TARGET_URL,
      intervalMinutes: INTERVAL_MINUTES,
      pingCount,
      errorCount,
      lastPing,
      lastStatus,
    }),
  );
});

server.listen(PORT, () => {
  console.log(
    `Keep-alive démarré. Cible: ${TARGET_URL} toutes les ${INTERVAL_MINUTES} min.`,
  );
  console.log(`Statut consultable sur http://localhost:${PORT}`);
});
