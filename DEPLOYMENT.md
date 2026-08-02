# Déploiement

Ce script est conçu pour tourner en continu, en tant que petit service
indépendant à côté du projet qu'il surveille.

## Option 1 - Petit VPS / serveur toujours actif

Utiliser un gestionnaire de process comme `pm2` pour garder le script
vivant et le relancer automatiquement en cas de crash ou de redémarrage
du serveur.

```bash
npm install -g pm2
pm2 start keep-alive.js --name keep-alive
pm2 save
pm2 startup
```

## Option 2 - Plateforme d'hébergement (Render, Railway, Fly.io...)

Le script inclut un petit serveur HTTP de statut (voir `PORT` dans
`.env`), ce qui permet de le déployer comme un service web classique sur
une plateforme qui exige un port ouvert pour considérer le service actif.

Étapes générales :

1. Créer un nouveau service à partir du dépôt contenant ce script.
2. Renseigner les variables d'environnement (`TARGET_URL`,
   `INTERVAL_MINUTES`, etc.) dans les paramètres de la plateforme plutôt
   que via un fichier `.env`.
3. Commande de démarrage : `npm start`.

Si la plateforme d'hébergement de ce script a elle-même un système de
spin-down par inactivité, ce script ne pingue pas son propre service -
il faudra prévoir un moyen de le garder actif lui aussi (ou l'héberger
sur une plateforme sans spin-down).

## Option 3 - Cron externe (sans script à héberger)

Si le seul besoin est de pinguer une URL à intervalle régulier, un
service de cron externe peut suffire, sans avoir à héberger ce script
du tout :

- [cron-job.org](https://cron-job.org)
- [UptimeRobot](https://uptimerobot.com) (plan gratuit, intervalle
  minimum de 5 minutes)

Ces services externes sont généralement plus fiables pour ce cas d'usage
que d'auto-héberger un pingueur, car ils ne dépendent pas eux-mêmes d'un
service qui peut se mettre en veille.

## Surveillance

Le script expose un endpoint de statut minimal sur `http://localhost:PORT`
(ou l'URL publique si déployé) renvoyant :

```json
{
  "status": "running",
  "target": "...",
  "intervalMinutes": 10,
  "pingCount": 42,
  "errorCount": 0,
  "lastPing": "...",
  "lastStatus": 200
}
```

Utile pour brancher une vérification externe sur ce statut si besoin.
