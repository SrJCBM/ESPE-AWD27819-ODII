# Star Wars Starships — Parsecs to Light-Years (PHP + MongoDB)

A minimal web app to insert and list Star Wars starships, storing data in MongoDB Atlas and computing max distance in light-years. Hosted on Render (Docker), but can run locally.

## Tech
- Frontend: HTML/CSS/JS (single page) in `public/`
- Backend: PHP 8.2, REST-style endpoint at `public/api/starships.php`
- DB: MongoDB Atlas (`MONGODB_URI` env var)
- Compute: 1 parsec = 3.26 light-years (client and server)
 - Architecture: see `docs/architecture.md` for diagrams and flow

## Run locally

Prereqs: PHP 8.1+, Composer, MongoDB PHP extension (installed via Composer + bundled pecl in Dockerfile; for local Windows you can rely on Composer library without native ext if using Docker, otherwise install ext-mongodb).

1. Install dependencies
```powershell
cd "c:\Users\jcbla\Desktop\ESPE\Quinto Semestre\AWD\ESPE2510-AWDSW27819\exam\blacio\u1\Star Wars"
composer install
```

2. Configure environment variables (recommended: `.env` file)
  - Copy `.env.example` to `.env` and fill in your Atlas URI (this repo already includes a local `.env` for convenience but it is gitignored; rotate credentials if shared).
  - Or export env vars directly in the shell.
```powershell
# Option A: using shell env vars
$env:MONGODB_URI="mongodb+srv://<user>:<pass>@<cluster>/<db>?retryWrites=true&w=majority"
$env:DB_NAME="sw_db"
$env:COLLECTION_NAME="starships"
```

3. Run PHP built-in server
```powershell
php -S 127.0.0.1:8000 -t public
```

Open http://127.0.0.1:8000

### Run with Docker locally (no PHP setup needed)
```powershell
cd "c:\Users\jcbla\Desktop\ESPE\Quinto Semestre\AWD\ESPE2510-AWDSW27819\exam\blacio\u1\Star Wars"
docker build -t starships .
# Option A: pass env via flags
docker run -p 8080:8080 `
  -e MONGODB_URI="mongodb+srv://<user>:<pass>@<cluster>/<db>?retryWrites=true&w=majority" `
  -e DB_NAME=sw_db `
  -e COLLECTION_NAME=starships `
  starships
# Option B: mount local .env
# docker run -p 8080:8080 --env-file .env starships
```
Open http://localhost:8080

## Deploy to Render (Docker)
- Create a new Web Service from this repo.
- Use Docker.
- Set Environment Variables:
  - `MONGODB_URI` (required)
  - `DB_NAME=sw_db`
  - `COLLECTION_NAME=starships`
- No Start Command needed (Dockerfile sets entrypoint). Render will pass `PORT` automatically.
 - Healthcheck: Dockerfile includes `HEALTHCHECK` hitting `/health.php`.
 - Exposed port: `8080` (Render injects `$PORT`; entrypoint binds to it).
 - For faster cold starts keep image small: multi-stage build already in place.

## API
- `GET /api/starships.php` → list all
- `GET /api/starships.php?name=Falcon` → search by name (case-insensitive)
- `POST /api/starships.php` with JSON body:
```json
{
  "name": "Millennium Falcon",
  "model": "YT-1300f",
  "manufacturer": "Corellian Engineering Corporation",
  "maxDistanceParsec": 12.0,
  "hyperdriveRating": 0.5
}
```
Response includes `maxDistanceLy`.

## Notes
- Server recomputes `maxDistanceLy` to avoid tampering.
- Create an index on `name` in Atlas for faster search.
