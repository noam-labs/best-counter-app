# Ni non ni non

Un compteur familial partagé : appuyez sur **NON ! +1** chaque fois que quelqu’un commence une phrase par « non » sans raison. Le compteur se met à jour en direct pour tout le monde.

Stack : Vite + React + TypeScript, Supabase (Postgres + Realtime), déployé sur Vercel.

## Environnements

| Environnement | Branche git | Base Supabase |
| --- | --- | --- |
| Prod | `main` | `ni-non-ni-non-prod` (`qslutbuxxqvmvfpoldrg`) |
| Dev | `dev` | `ni-non-ni-non-dev` (`usyqicyfkbfloywvlgay`) |

Vercel déploie `main` en production et `dev` en preview ; chaque environnement a ses propres `VITE_SUPABASE_URL` et `VITE_SUPABASE_PUBLISHABLE_KEY`. En local, `.env.local` pointe vers la base de dev.

## Installation locale

1. Copier `.env.example` vers `.env.local` et renseigner l’URL et la clé publishable du projet **dev** (Project Settings → API).
2. `npm install && npm run dev`

## Migrations

Les migrations se trouvent dans `supabase/migrations/`. Appliquez-les d’abord sur la base dev, puis sur la base prod.

## Vérifications

```bash
npm test && npm run lint && npm run build
```
