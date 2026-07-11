# Smart CSV Importer

An AI-powered CSV importer that intelligently extracts CRM lead information from **any** valid CSV format — Facebook Lead Ads exports, Google Ads exports, Excel exports, real-estate CRM exports, sales reports, or manually created spreadsheets. Field mapping is performed by an LLM (Gemini), not hardcoded column matching, so it adapts to arbitrary column names and layouts.

## Live Demo

- Frontend: _TODO — add Vercel URL after deploying_
- Backend API: _TODO — add Render/Railway URL after deploying_
- GitHub repo: https://github.com/Lohar109/smart-csv-importer

## How it works

1. **Upload** — drag & drop or pick a `.csv` file.
2. **Preview** — the file is parsed entirely client-side (PapaParse) into a scrollable, sticky-header table. No API calls happen yet.
3. **Confirm Import** — only on confirmation are the parsed rows sent to the backend.
4. **AI Extraction** — the backend splits rows into batches of 20 and sends each batch to Gemini with a prompt that maps arbitrary columns onto a fixed CRM schema, following strict business rules (see below).
5. **Results** — imported records and skipped records (with reasons) are shown, along with total counts.

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
│   │   ├── routes/                # upload, extract, health routes
│   │   ├── services/              # CSV parsing, prompt building, extraction orchestration
│   │   │   └── llm/               # LLM provider abstraction (Gemini implementation)
│   │   ├── middleware/            # multer upload middleware, centralized error handler
│   │   └── utils/                 # CRM schema constants
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── app/                   # page.tsx (wizard), layout.tsx, globals.css
│   │   ├── components/            # UploadStep, DataTable, ResultsView, Spinner, ThemeToggle
│   │   ├── lib/                   # axios client
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
  "imported": [ { "created_at": "...", "name": "John Doe", "email": "john@example.com", "...": "..." } ],
  "skipped": [ { "row": { "...": "..." }, "reason": "No email or mobile number provided." } ],
  "totalImported": 1,
  "totalSkipped": 0
}
```

Rows are split into batches of 20, sent to Gemini in parallel, and retried up to 2 additional times on failure. If a batch still fails after retries, its rows are marked as skipped with the underlying error as the reason rather than failing the whole import.

## Deployment

- **Frontend → Vercel**: import the repo, set the root directory to `frontend`, add `NEXT_PUBLIC_API_URL` pointing at the deployed backend.
- **Backend → Render**: uses `render.yaml` at the repo root (root directory `backend`). Set `GEMINI_API_KEY` and `CORS_ORIGIN` (your Vercel URL) as environment variables in the Render dashboard.

## Notes

- The Gemini model defaults to `gemini-flash-latest` — verified working against the Generative Language API at the time of writing (`gemini-1.5-flash` and `gemini-2.5-flash` have since been retired for new API keys). Override via `GEMINI_MODEL` if needed.
- The LLM call is abstracted behind `backend/src/services/llm/llmProvider.js` — swapping to OpenAI or Claude means implementing that interface and updating `llmProviderFactory.js`.
