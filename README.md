# TokenPulse Island

TokenPulse Island is our web-first version of the OpenToken feedback idea. It turns local OpenToken usage into an operator dashboard with live score, rank pressure, quests, badges, tool mix, weekly rhythm, and behavior signals.

The app is built from scratch after reviewing `ehomekevin/opentoken-island`. The upstream project has no license declaration, so this repository does not reuse its code.

## Run

```bash
npm install
npm run dev
```

The Vite dev server shows the full product in demo mode.

For real local OpenToken data, build and run the Node bridge:

```bash
npm run build
npm start
```

The local bridge serves the app and exposes:

- `GET /api/summary` reads `opentoken preview --json` if available
- `GET /api/health` reports service state

Configure a custom OpenToken binary if needed:

```bash
OPENTOKEN_BIN=/Users/huxy/.local/bin/opentoken npm start
```

## Deploy

Static hosting works because the browser falls back to demo data when `/api/summary` is not present. For a local real-data install, run the Node bridge on the Mac that has OpenToken installed.

