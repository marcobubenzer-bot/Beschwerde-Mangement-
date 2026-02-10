# Patientenbefragung – MVP + Backend API

Dieses Repository enthält weiterhin das bestehende Frontend (Vite/React) und zusätzlich ein neues Backend (Node.js + Fastify + Prisma + PostgreSQL via Docker Compose).

## Projektstruktur

- `src/` – bestehendes Frontend.
- `backend/` – Fastify API + Prisma Schema/Migrationen.
- `docker-compose.yml` – startet PostgreSQL und Backend.

## Voraussetzungen

- Docker + Docker Compose
- Optional lokal ohne Docker: Node.js 20+

## Schnellstart (Docker Compose)

```bash
docker compose up --build
```

Was passiert dabei:
1. PostgreSQL startet auf `localhost:5432`.
2. Backend startet auf `localhost:3000`.
3. Beim Backend-Start wird automatisch `prisma migrate deploy` ausgeführt.

## Environment / DATABASE_URL

Im Compose-Setup wird genutzt:

```env
DATABASE_URL=postgresql://survey:survey@db:5432/survey?schema=public
```

Für lokalen Backend-Start ohne Docker kann `backend/.env.example` als Vorlage genutzt werden.

## Prisma Workflow

Migrationen sind bereits enthalten unter:

- `backend/prisma/migrations/202602100001_init/migration.sql`

Im Container läuft bei Start:

```bash
npm run prisma:migrate
```

Lokal (im Ordner `backend`):

```bash
npm install
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

## API Endpoints

### Health

```bash
curl -s http://localhost:3000/health
```

### A) POST `/survey`

Speichert SurveyResponse inkl. normalisierten Likert-Antworten.

```bash
curl -s -X POST http://localhost:3000/survey \
  -H 'Content-Type: application/json' \
  -d '{
    "station": "A1",
    "zimmer": "12",
    "aufnahmeart": ["planned", "emergency"],
    "q31": "JA",
    "q33": 2,
    "freitext": "Test",
    "contactRequested": false,
    "likert": { "q1": 5, "q2": 4 }
  }'
```

Hinweise:
- `aufnahmeart` wird intern gemappt (z. B. `planned -> GEPLANT`, `emergency -> NOTFALL`).
- `likert` (`q1..q30`) wird in `SurveyLikertAnswer` normalisiert gespeichert.
- `clientIp` und `userAgent` werden aus dem Request übernommen.

### B) GET `/survey/:id`

```bash
curl -s http://localhost:3000/survey/<ID>
```

### C) GET `/stats/questions`

Filter: `from`, `to`, `station`, `aufnahmeart` (einmal oder mehrfach als Query-Param).

```bash
curl -s 'http://localhost:3000/stats/questions?from=2025-01-01T00:00:00.000Z&to=2026-12-31T23:59:59.999Z&station=A1&aufnahmeart=planned&aufnahmeart=emergency'
```

Antwort: pro `questionNo` -> `avgScore`, `countAnswers`.

### D) GET `/stats/overall`

```bash
curl -s 'http://localhost:3000/stats/overall?station=A1&aufnahmeart=planned'
```

Antwort:
- `weightedAvgScore`
- `totalAnswers`
- `totalResponsesWithLikert`
- `meanOfResponseAverages`

## Backend-Datenmodell (Prisma)

- `SurveyResponse`
  - Metadaten, Freitext, Kontaktfelder, `aufnahmeart` als `String[]` (Postgres `TEXT[]`), Relation zu Likert-Antworten.
- `SurveyLikertAnswer`
  - Normalisierte Einträge pro Frage (`questionNo` 1..30), `score` 1..5, Enum-Option.
  - Unique: `(responseId, questionNo)`.
- `SurveyComplaint`
  - Schema vorbereitet.

### Indizes

- `SurveyLikertAnswer`: Index auf `responseId`, `questionNo` + kombiniert.
- `SurveyResponse`: Index auf `createdAt` und `(station, createdAt)`.
- `SurveyResponse.aufnahmeart`: GIN-Index via SQL-Migration.

## Kurze Test-Checkliste (curl)

1. `docker compose up --build`
2. `curl -s http://localhost:3000/health`
3. `POST /survey` mit Beispielpayload
4. `GET /survey/:id` mit zurückgegebener ID
5. `GET /stats/questions` mit/ohne Filter
6. `GET /stats/overall` mit/ohne Filter
