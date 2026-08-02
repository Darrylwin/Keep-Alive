# keep-alive

Petit script Node.js qui ping périodiquement une URL pour éviter la mise en
veille par inactivité d'un service hébergé sur une plateforme free tier
(Render, Railway, Fly.io, etc.).

## Pourquoi

Beaucoup de plateformes free tier arrêtent ("spin down") un service après
une période d'inactivité (souvent ~15 minutes), et le redémarrent au
prochain appel avec un délai de cold start (30s à 1min). Ce script envoie
une requête périodique à une URL cible (généralement un endpoint `/health`)
pour maintenir le service actif.

C'est un contournement, pas une solution officiellement supportée par
la plupart des plateformes. Pour un usage en production, préférer un plan
payant qui élimine le spin-down.

## Installation

```bash
npm install
cp .env.example .env
```

Éditer `.env` et renseigner au minimum `TARGET_URL`.

## Configuration

| Variable            | Obligatoire | Défaut | Description                             |
| ------------------- | :---------: | :----: | --------------------------------------- |
| `TARGET_URL`        |     oui     |   -    | URL à pinguer périodiquement            |
| `INTERVAL_MINUTES`  |     non     |   10   | Intervalle entre deux pings, en minutes |
| `REQUEST_TIMEOUT_S` |     non     |   20   | Timeout d'une requête, en secondes      |
| `PORT`              |     non     |  3000  | Port du serveur de statut local         |

## Utilisation

```bash
npm start
```

Le statut courant (nombre de pings, erreurs, dernier ping) est consultable
sur `http://localhost:PORT`.

## Prérequis

- Node.js >= 18 (utilise `fetch` natif)

## Licence

Usage interne / privé.
