# Prime Calc

Calculatrice publicitaire satirique pour démonstration UX locale.

## Commandes

```bash
npm install
npm run dev
npm run build
```

## Configuration

La configuration principale est dans `src/main.js` :

- `DEMO_REDIRECT_URL` centralise l'URL neutre ouverte par les interactions satiriques.
- `SATIRE_MODE_ENABLED` désactive les comportements invasifs quand il vaut `false`.
- `ADS_LOOP_ENABLED` désactive les apparitions automatiques quand il vaut `false`.
- `ADS_ON_DIGIT_ENABLED` désactive les pop-ins déclenchées par les chiffres quand il vaut `false`.

Le projet ne contient pas de paiement réel, pas de régie publicitaire externe, pas de tracking tiers et pas de collecte de données.
