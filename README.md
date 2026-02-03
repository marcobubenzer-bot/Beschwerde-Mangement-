# KlinikBeschwerde – MVP

Eine schlanke MVP-Web-App für das Beschwerdemanagement in Kliniken. Die Anwendung läuft komplett clientseitig, speichert Daten lokal (LocalStorage) und bietet PDF-Exporte für Dashboard, Vorgangsliste und einzelne Fallblätter.

## Features
- Beschwerden erfassen mit klarer Formularstruktur.
- Automatische Vorgangsnummern (KB-YYYY-00001).
- Vorgänge filtern, sortieren, Details ansehen und Status ändern.
- Dashboard mit KPIs und Charts.
- PDF-Export für Dashboard, Liste und Fallblatt.
- Export/Import JSON als Backup sowie Beispieldaten-Generator.

## Setup
```bash
npm install
npm run dev
```

## Backend-Integration (später)
Die Repository-Schicht liegt in `src/storage/`. Aktuell liefert `LocalStorageComplaintRepository` die Daten. Für ein echtes Backend kann dort eine neue Implementierung (z. B. `ApiComplaintRepository`) erstellt werden, die dieselbe `ComplaintRepository`-Schnittstelle erfüllt und REST-Aufrufe (GET/POST/PUT/DELETE) umsetzt. Die App muss dann nur die Instanz in `src/storage/localStorageComplaintRepository.ts` ersetzen.
