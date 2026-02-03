# KlinikBeschwerde – MVP

Eine schlanke MVP-Web-App für das Beschwerdemanagement in Kliniken. Die Anwendung läuft komplett clientseitig, speichert Daten lokal (IndexedDB) und bietet PDF-Exporte für Dashboard, Vorgangsliste und einzelne Fallblätter.

## Features
- Beschwerden erfassen mit klarer Formularstruktur (Report- und Admin-Bereich).
- Automatische Vorgangsnummern (KB-YYYY-00001).
- Vorgänge filtern, sortieren, Details ansehen und Status ändern.
- Dashboard mit KPIs und Charts.
- PDF-Export für Dashboard, Liste und Fallblatt (inkl. Anlagenübersicht).
- Anhänge als Bilddateien (PNG/JPG/WebP) in IndexedDB.
- Export/Import JSON als Backup sowie Beispieldaten-Generator.
- Theme: Hell/Dunkel/System (persistiert).

## Setup
```bash
npm install
npm run dev
```

## Backend-Integration (später)
Die Repository-Schicht liegt in `src/storage/`. Aktuell liefern `IndexedDbComplaintRepository` und `IndexedDbAttachmentRepository` die Daten. Für ein echtes Backend kann dort eine neue Implementierung (z. B. `ApiComplaintRepository`) erstellt werden, die dieselben Interfaces (`ComplaintRepository`, `AttachmentRepository`) erfüllt und REST-/S3-Aufrufe (GET/POST/PUT/DELETE) umsetzt. Die App muss dann nur die Instanzen in `src/storage/indexedDbComplaintRepository.ts` und `src/storage/attachmentRepository.ts` ersetzen.
