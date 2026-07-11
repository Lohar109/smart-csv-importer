# Smart CSV Importer

An AI-powered CSV importer that intelligently extracts CRM lead information from **any** valid CSV format — Facebook Lead Ads exports, Google Ads exports, Excel exports, real-estate CRM exports, sales reports, or manually created spreadsheets. Field mapping is performed by an LLM (Gemini), not hardcoded column matching, so it adapts to arbitrary column names and layouts.

## Live Demo

- Frontend: _TODO — add Vercel URL after deploying_
- Backend API: _TODO — add Render/Railway URL after deploying_
- GitHub repo: https://github.com/Lohar109/smart-csv-importer

## How it works

1. **Upload** — drag & drop or pick a `.csv` file.
2. **Preview** — the file is parsed entirely client-side (PapaParse) into a scrollable, sticky-header table. No API calls happen yet.
3. **Confirm Import** — only on confirmation are the parsed rows sent to the backend, which splits them into batches of 20 and sends each batch to Gemini with a prompt that maps arbitrary columns onto a fixed CRM schema, following strict business rules (see below). Progress streams live via SSE.
4. **Review** — AI-extracted records land in an editable table before anything is finalized. Fields the AI wasn't confident about are highlighted for a quick human check.
5. **Results** — imported records, skipped records (with reasons), and any detected duplicates are shown, along with total counts and export options.

## CRM field schema

Every imported record is mapped to exactly these fields:

```
created_at, name, email, country_code, mobile_without_country_code, company,
city, state, country, lead_owner, crm_status, crm_note, data_source,
possession_time, description
```

Key extraction rules enforced in the AI prompt:

- `crm_status` is one of `GOOD_LEAD_FOLLOW_UP`, `DID_NOT_CONNECT`, `BAD_LEAD`, `SALE_DONE`, or blank if unclear.
- `data_source` is one of `leads_on_demand`, `meridian_tower`, `eden_park`, `varah_swamy`, `sarjapur_plots`, or blank if no confident match.
- `created_at` must be parseable by JavaScript's `new Date(...)`.
- Extra emails/phone numbers beyond the first are appended to `crm_note`.
- A row is skipped (not imported) if it has neither an email nor a mobile number; skipped rows are returned separately with a reason.

## Advanced features

These go beyond the base assignment spec:

### 1. AI confidence scoring + manual review step

Every imported record includes a `field_confidence` object (`"high" | "medium" | "low"` per CRM field), reflecting how clearly the AI could map a source column to that field — a column literally named `email` scores `high`; a free-text `notes` column that happens to contain a name scores `medium`/`low`. The frontend inserts a **Review** step between Preview and Results: low/medium-confidence cells are highlighted (amber border for low, yellow tint for medium) and inline-editable — a text input for most fields, a dropdown for `crm_status`/`data_source` to keep values valid. High-confidence fields stay plain text with a hover-only edit affordance. A legend badge shows how many fields need review, and edits are tracked locally until **Confirm & Import** finalizes the batch.

### 2. Duplicate lead detection

After AI extraction, records are checked for duplicates within the same upload — matching on a case-insensitive email or a normalized mobile number (spaces/dashes stripped, leading country-code digits dropped). Duplicates are **not** dropped or merged: the first occurrence stays untouched, later matches are tagged `is_duplicate: true` with a `duplicate_of` pointer back to the first occurrence's index, and the response includes a `duplicateCount`. The Results screen shows a "Duplicates Found" stat card (only when count > 0) and a "Duplicate of #N" badge on affected rows, leaving the merge decision to the user.

### 3. Real-time streaming batch progress

`POST /api/extract/stream` runs the same batched extraction pipeline but streams progress over Server-Sent Events — a `batch_complete` event as each batch finishes (in completion order) and a final `done` event with the full result. The frontend reads this via `fetch` + `ReadableStream` (not `EventSource`, which can't send a POST body) and drives a live "Processing batch N of M…" progress bar. If streaming fails or isn't supported, it falls back transparently to the plain `POST /api/extract` JSON endpoint and the original indeterminate spinner — the import flow never breaks.

## Tech stack

| Layer    | Stack |
|----------|-------|
| Frontend | Next.js 16 (App Router), TypeScript, Tailwind CSS, PapaParse, Axios |
| Backend  | Node.js, Express, Multer, csv-parse, dotenv, cors |
| AI       | Google Gemini (`gemini-flash-latest` by default), abstracted behind a provider interface so it can be swapped for OpenAI/Claude |
| Database | None — the service is stateless |

## Project structure

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
│   │   │                          # ResultsView, LiveProgressScreen, ThemeToggle, ...
│   │   ├── lib/                   # axios client, SSE streaming client (sseExtract.ts)
│   │   └── types/                 # CRM schema types
│   └── .env.example
├── docker-compose.yml             # optional local orchestration
├── render.yaml                    # Render deployment config for the backend
└── frontend/vercel.json           # Vercel deployment config for the frontend
```

## Running locally

### Prerequisites

- Node.js 20+
- A Gemini API key ([Google AI Studio](https://aistudio.google.com/apikey))

### Backend

```bash
cd backend
cp .env.example .env      # then fill in GEMINI_API_KEY
npm install
npm run dev                # starts on http://localhost:5000
```

### Frontend

```bash
cd frontend
cp .env.example .env.local # NEXT_PUBLIC_API_URL should point at the backend
npm install
npm run dev                 # starts on http://localhost:3000
```

Open http://localhost:3000, upload a CSV, preview it, and click **Confirm Import**.

### With Docker Compose (optional)

```bash
GEMINI_API_KEY=your_key docker compose up --build
```

This starts the backend on port 5000 and the frontend on port 3000.

## Environment variables

### `backend/.env`

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Port the Express server listens on | `5000` |
| `GEMINI_API_KEY` | Your Gemini API key | _required_ |
| `GEMINI_MODEL` | Gemini model name | `gemini-flash-latest` |
| `CORS_ORIGIN` | Allowed origin for CORS (set to your deployed frontend URL in production) | allows all origins if unset |

### `frontend/.env.local`

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Base URL of the backend API | `http://localhost:5000` |

## API reference

### `POST /api/upload`

Accepts a CSV file (`multipart/form-data`, field name `file`), parses it server-side, and returns headers + a row preview. Not called by the frontend (which parses client-side for the preview step), but available for programmatic use.

### `POST /api/extract`

```json
{ "rows": [{ "Full Name": "John Doe", "Email": "john@example.com" }] }
```

Returns:

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

Rows are split into batches of 20, sent to Gemini in parallel, and retried up to 2 additional times on failure. If a batch still fails after retries, its rows are marked as skipped with the underlying error as the reason rather than failing the whole import. After extraction, records are deduplicated by email/mobile within the batch (see Advanced features above).

### `POST /api/extract/stream`

Same request shape and extraction pipeline as `POST /api/extract`, but the response is `text/event-stream` instead of JSON. Emits one `batch_complete` event per finished batch, then a final `done` event carrying the full result shape shown above:

```
data: {"type":"batch_complete","batchIndex":1,"totalBatches":3,"recordsProcessedSoFar":20}

data: {"type":"batch_complete","batchIndex":2,"totalBatches":3,"recordsProcessedSoFar":40}

data: {"type":"done","imported":[...],"skipped":[...],"totalImported":55,"totalSkipped":5,"duplicateCount":2}

```

Intended to be consumed with `fetch` + a `ReadableStream` reader (not `EventSource`, since this is a POST with a body).

## Deployment

- **Frontend → Vercel**: import the repo, set the root directory to `frontend`, add `NEXT_PUBLIC_API_URL` pointing at the deployed backend.
- **Backend → Render**: uses `render.yaml` at the repo root (root directory `backend`). Set `GEMINI_API_KEY` and `CORS_ORIGIN` (your Vercel URL) as environment variables in the Render dashboard.

## Notes

- The Gemini model defaults to `gemini-flash-latest` — verified working against the Generative Language API at the time of writing (`gemini-1.5-flash` and `gemini-2.5-flash` have since been retired for new API keys). Override via `GEMINI_MODEL` if needed.
- The LLM call is abstracted behind `backend/src/services/llm/llmProvider.js` — swapping to OpenAI or Claude means implementing that interface and updating `llmProviderFactory.js`.
