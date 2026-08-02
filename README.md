# keep-alive

Workflow GitHub Actions qui ping périodiquement une URL pour éviter la
mise en veille par inactivité d'un service hébergé sur une plateforme
free tier (Render, Railway, Fly.io, etc.).

## Pourquoi

Beaucoup de plateformes free tier arrêtent ("spin down") un service après
une période d'inactivité (souvent ~15 minutes), et le redémarrent au
prochain appel avec un délai de cold start (30s à 1min). Ce workflow
envoie une requête périodique à une URL cible (généralement un endpoint
`/health`) pour maintenir le service actif.

C'est un contournement, pas une solution officiellement supportée par
la plupart des plateformes. Pour un usage en production, préférer un plan
payant qui élimine le spin-down.

## Fonctionnement

Le fichier `.github/workflows/keep-alive.yml` exécute un simple `curl`
vers une URL cible selon un planning cron, directement sur l'infra
GitHub. Aucun serveur à héberger, aucune dépendance à installer.

## Configuration

Ajouter un secret dans le dépôt : **Settings → Secrets and variables →
Actions → New repository secret**.

| Secret       | Exemple de valeur                         |
| ------------ | ----------------------------------------- |
| `TARGET_URL` | `https://mon-service.onrender.com/health` |

## Planning

Par défaut, le workflow tourne toutes les 5 minutes (`*/5 * * * *`) -
c'est l'intervalle minimum pratique accepté par GitHub Actions.

Pour changer l'intervalle, éditer la ligne `cron` dans
`.github/workflows/keep-alive.yml`. Quelques exemples :

| Intervalle souhaité | Expression cron |
| ------------------- | --------------- |
| 5 minutes           | `*/5 * * * *`   |
| 10 minutes          | `*/10 * * * *`  |
| 15 minutes          | `*/15 * * * *`  |

## Déclenchement manuel

Le workflow inclut `workflow_dispatch`, ce qui permet de le lancer
manuellement depuis l'onglet **Actions** du dépôt (bouton "Run
workflow") - pratique pour tester sans attendre le prochain cron.

## Limites à connaître

- **Pas de garantie de timing exact** : GitHub peut retarder l'exécution
  d'un workflow schedulé de quelques minutes en cas de forte charge sur
  leur infra.
- **Désactivation après 60 jours d'inactivité** : si le dépôt n'a aucune
  activité (commit, etc.) pendant 60 jours, GitHub désactive
  automatiquement les workflows schedulés. Il faut alors les réactiver
  manuellement depuis l'onglet Actions.
- Consomme des minutes du quota Actions du dépôt (négligeable pour ce
  cas d'usage - un `curl` prend quelques secondes).
