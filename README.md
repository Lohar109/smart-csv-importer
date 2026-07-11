# Smart CSV Importer

An AI-powered CSV importer that turns **any** CSV layout — Facebook Lead Ads exports, Google Ads exports, Excel exports, real-estate CRM exports, sales reports, manually created spreadsheets — into clean, structured CRM leads, with an AI confidence review step and duplicate detection built in.

> **Beyond the base spec:** this build adds AI confidence scoring with a manual review step, duplicate lead detection, and real-time streaming batch progress via SSE — see [Advanced](#advanced-built-beyond-bonus-points) below.

## Live Demo

- Frontend (Vercel): _TODO — add URL after deploying_
- Backend API (Render): _TODO — add URL after deploying_
- GitHub repo: https://github.com/Lohar109/smart-csv-importer

## Features

### Core (per assignment spec)

- Drag & drop CSV upload (or click to browse)
- Works with **any** column layout — no hardcoded column matching
- Client-side preview with a sticky-header, scrollable table before any API call
- Confirm-before-AI-call flow — nothing is sent to the backend until you click Confirm
- AI-powered field extraction mapping arbitrary columns onto the fixed GrowEasy CRM schema
- Skip logic: records with neither an email nor a mobile number are skipped, not silently dropped
- Results view with imported/skipped counts and full record detail

### Bonus (beyond spec)

- Dark mode toggle (persisted, respects system preference on first load)
- Export imported records as CSV
- Copy full result as JSON to clipboard
- Empty-state messaging when nothing was skipped or nothing was imported

### Advanced (built beyond bonus points)

- **AI confidence scoring + manual Review step** — every extracted field carries a `high`/`medium`/`low` confidence score; a dedicated Review step highlights and makes low/medium-confidence fields inline-editable before import is finalized
- **Duplicate lead detection** — records sharing an email or normalized mobile number within the same file are flagged (`is_duplicate`, `duplicate_of`) and surfaced in the UI, never silently merged or dropped
- **Real-time streaming batch progress** — `POST /api/extract/stream` streams per-batch progress over Server-Sent Events, driving a live "Processing batch N of M" bar, with automatic fallback to a plain request if streaming isn't available

## Tech Stack

| Layer    | Stack |
|----------|-------|
| Frontend | Next.js 16 (App Router), TypeScript, Tailwind CSS, PapaParse, Axios, lucide-react |
| Backend  | Node.js, Express, Multer, csv-parse, dotenv, cors |
| AI       | Google Gemini (`gemini-flash-latest` by default), abstracted behind a provider interface so it can be swapped for OpenAI/Claude |
| Database | None — the service is stateless |

## Architecture

The frontend does as much as it can without the network (parsing, preview) and only calls the backend once the user commits. The backend's only external dependency is the LLM provider — there's no database, so every request is self-contained.

```
┌──────────┐   parse locally   ┌──────────┐   confirm   ┌───────────────────┐
│  Upload  │ ────────────────► │ Preview  │ ──────────► │  POST /api/extract │
│ (client) │   (PapaParse)     │ (client) │   click     │  or /extract/stream│
└──────────┘                   └──────────┘             └─────────┬──────────┘
                                                                    │ batches of 20 rows
                                                                    ▼
                                                          ┌───────────────────┐
                                                          │   Express backend  │
                                                          │  batch + retry     │
                                                          │  + dedupe pass     │
                                                          └─────────┬──────────┘
                                                                    │ prompt per batch
                                                                    ▼
                                                          ┌───────────────────┐
                                                          │   Gemini (LLM)     │
                                                          │  field mapping +   │
                                                          │  confidence score  │
                                                          └─────────┬──────────┘
                                                                    │ SSE progress events
                                                                    ▼
┌──────────┐   edit low/med    ┌──────────┐   confirm   ┌───────────────────┐
│  Review  │ ◄──────────────── │  (data)  │ ──────────► │      Results       │
│ (client) │   confidence      └──────────┘             │ imported/skipped/  │
└──────────┘                                             │    duplicates      │
                                                          └───────────────────┘
```

## Setup Instructions

### Prerequisites

- Node.js 20+
- A Gemini API key ([Google AI Studio](https://aistudio.google.com/apikey))

### Clone

```bash
git clone https://github.com/Lohar109/smart-csv-importer.git
cd smart-csv-importer
```

### Backend

```bash
cd backend
cp .env.example .env      # fill in GEMINI_API_KEY (see table below)
npm install
npm run dev                # starts on http://localhost:5000
```

### Frontend

In a separate terminal:

```bash
cd frontend
cp .env.example .env.local # NEXT_PUBLIC_API_URL should point at the backend
npm install
npm run dev                 # starts on http://localhost:3000
```

Open http://localhost:3000, upload a CSV, and walk through Upload → Preview → Review → Results.

### With Docker Compose (optional)

```bash
GEMINI_API_KEY=your_key docker compose up --build
```

Starts the backend on port 5000 and the frontend on port 3000.

### Tests

No automated test suite exists yet. Each backend service module (`csvParser.service.js`, `extraction.service.js`, `dedupe.service.js`, `responseParser.js`) is small and pure enough to unit test in isolation if that's added later. In the meantime, `npm run lint` is available in both `frontend/` and `backend/`.

## Environment Variables

### `backend/.env` (see `backend/.env.example`)

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Port the Express server listens on | `5000` |
| `GEMINI_API_KEY` | Your Gemini API key | _required_ |
| `GEMINI_MODEL` | Gemini model name | `gemini-flash-latest` |
| `CORS_ORIGIN` | Allowed origin for CORS (set to your deployed frontend URL in production) | allows all origins if unset |

### `frontend/.env.local` (see `frontend/.env.example`)

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Base URL of the backend API | `http://localhost:5000` |

## API Reference

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/health` | GET | Health check |
| `/api/upload` | POST | Parses an uploaded CSV server-side, returns headers + row preview (not called by the frontend, which parses client-side, but available for programmatic use) |
| `/api/extract` | POST | Runs AI extraction on `{ rows }`, returns `{ imported, skipped, totalImported, totalSkipped, duplicateCount }`, with `field_confidence`, `is_duplicate`, and `duplicate_of` on each imported record |
| `/api/extract/stream` | POST | Same as `/api/extract`, but streams `batch_complete` / `done` events over SSE for live progress |

### `POST /api/extract` example

Request:

```json
{ "rows": [{ "Full Name": "John Doe", "Email": "john@example.com" }] }
```

Response:

```json
{
  "imported": [
    {
      "created_at": "...", "name": "John Doe", "email": "john@example.com", "...": "...",
      "field_confidence": { "name": "high", "email": "high", "...": "high" },
      "is_duplicate": false,
      "duplicate_of": null
    }
  ],
  "skipped": [ { "row": { "...": "..." }, "reason": "No email or mobile number provided." } ],
  "totalImported": 1,
  "totalSkipped": 0,
  "duplicateCount": 0
}
```

Rows are split into batches of 20, sent to Gemini in parallel, and retried up to 2 additional times on failure — a batch that still fails is marked skipped with the error as the reason rather than failing the whole import. After extraction, records are deduplicated by email/mobile within the batch.

### `POST /api/extract/stream` example

```
data: {"type":"batch_complete","batchIndex":1,"totalBatches":3,"recordsProcessedSoFar":20}

data: {"type":"batch_complete","batchIndex":2,"totalBatches":3,"recordsProcessedSoFar":40}

data: {"type":"done","imported":[...],"skipped":[...],"totalImported":55,"totalSkipped":5,"duplicateCount":2}
```

Consumed via `fetch` + a `ReadableStream` reader on the frontend (not `EventSource`, since this is a POST with a body).

## CRM Field Schema

Every imported record is mapped to exactly these fields:

```
created_at, name, email, country_code, mobile_without_country_code, company,
city, state, country, lead_owner, crm_status, crm_note, data_source,
possession_time, description
```

- `crm_status` is one of `GOOD_LEAD_FOLLOW_UP`, `DID_NOT_CONNECT`, `BAD_LEAD`, `SALE_DONE`, or blank if unclear.
- `data_source` is one of `leads_on_demand`, `meridian_tower`, `eden_park`, `varah_swamy`, `sarjapur_plots`, or blank if no confident match.
- `created_at` must be parseable by JavaScript's `new Date(...)`.
- Extra emails/phone numbers beyond the first are appended to `crm_note`.

## Deployment

- **Frontend → Vercel**: import the repo, set the root directory to `frontend`, add `NEXT_PUBLIC_API_URL` pointing at the deployed backend.
- **Backend → Render**: uses `render.yaml` at the repo root (root directory `backend`). Set `GEMINI_API_KEY` and `CORS_ORIGIN` (your Vercel URL) as environment variables in the Render dashboard.

## Project Structure

```
smart-csv-importer/
├── backend/
│   ├── src/
│   │   ├── app.js                 # Express app wiring
│   │   ├── server.js              # Entry point
│   │   ├── routes/                # upload, extract (+ /stream SSE variant), health routes
│   │   ├── services/              # CSV parsing, prompt building, extraction orchestration,
│   │   │   │                      # duplicate detection (dedupe.service.js)
│   │   │   └── llm/               # LLM provider abstraction (Gemini implementation)
│   │   ├── middleware/            # multer upload middleware, centralized error handler
│   │   └── utils/                 # CRM schema constants
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── app/                   # page.tsx (4-step wizard), layout.tsx, globals.css
│   │   ├── components/            # UploadStep, DataTable, ReviewStep, EditableCell,
│   │   │                          # ResultsView, LiveProgressScreen, AppGuideButton, ...
│   │   ├── lib/                   # axios client, SSE streaming client (sseExtract.ts)
│   │   └── types/                 # CRM schema types
│   └── .env.example
├── docker-compose.yml             # optional local orchestration
├── render.yaml                    # Render deployment config for the backend
└── frontend/vercel.json           # Vercel deployment config for the frontend
```

## Notes

- The Gemini model defaults to `gemini-flash-latest` — verified working against the Generative Language API at the time of writing (`gemini-1.5-flash` and `gemini-2.5-flash` have since been retired for new API keys). Override via `GEMINI_MODEL` if needed.
- The LLM call is abstracted behind `backend/src/services/llm/llmProvider.js` — swapping to OpenAI or Claude means implementing that interface and updating `llmProviderFactory.js`.
