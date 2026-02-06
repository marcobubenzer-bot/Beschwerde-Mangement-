# Patientenbefragung – MVP

Eine schlanke MVP-Web-App für eine Patientenbefragung mit öffentlichem Formular und Admin-Dashboard. Die Anwendung läuft komplett clientseitig, speichert Daten lokal (LocalStorage) und bietet CSV/XLSX-Exporte.

## Features
- Öffentliche Patientenbefragung mit 33 Fragen (Likert/Ja-Nein/Gesamtnote).
- Kontaktwunsch optional mit Pflichtfeldern bei Aktivierung.
- Admin-Dashboard mit KPIs, Filter und Chart für schwächste Fragen.
- Admin-Listenansicht, Detailansicht und Beschwerden/Lob-Verwaltung.
- CSV- und XLSX-Export für Antworten und Beschwerden.
- Lokales Rate-Limit + Honeypot als Basisschutz.

## Setup
```bash
npm install
npm run dev
```

## Admin-Zugang
- Standard-PIN: `1234` (im Admin-Bereich unter Einstellungen änderbar).
- Die Admin-Session wird im SessionStorage gespeichert.

## Datenhaltung
- Antworten und Beschwerden werden im Browser (LocalStorage) gespeichert.
- DSGVO-Löschfrist ist als TODO vorgesehen (empfohlen: Cron/Job im Backend).

## Backend-Integration (optional)
Die Repository-Schicht liegt in `src/storage/surveyRepository.ts`. Für ein echtes Backend kann dort eine neue Implementierung erstellt werden (z. B. REST-API mit PostgreSQL/Prisma), die dieselben Methoden anbietet.
