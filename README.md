<div align="center">

# 🎬 Havan Streaming Service

### A production-ready, full-stack Video on Demand platform with adaptive HLS streaming, multi-profile user architecture, and decoupled cloud deployment.

<br/>

[![Django](https://img.shields.io/badge/Django-6.0.6-092E20?style=for-the-badge&logo=django&logoColor=white)](https://www.djangoproject.com/)
[![DRF](https://img.shields.io/badge/Django_REST_Framework-3.17.1-red?style=for-the-badge&logo=django&logoColor=white)](https://www.django-rest-framework.org/)
[![React](https://img.shields.io/badge/React-19.2.6-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)

<br/>

[![Deployed on Render](https://img.shields.io/badge/Backend-Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://render.com/)
[![Deployed on Vercel](https://img.shields.io/badge/Frontend-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)
[![HLS](https://img.shields.io/badge/Streaming-HLS%20%2B%20hls.js-FF6B6B?style=for-the-badge&logo=video&logoColor=white)](https://github.com/video-dev/hls.js/)
[![JWT](https://img.shields.io/badge/Auth-SimpleJWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://django-rest-framework-simplejwt.readthedocs.io/)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](./LICENSE)

<br/>

> 🚀 **Live Demo** → [https://havan-streaming-service.vercel.app](https://havan-streaming-service.vercel.app)

</div>

---

## 📋 Table of Contents

- [✨ Feature Highlights](#-feature-highlights)
- [🏗️ System Architecture](#️-system-architecture)
- [🗄️ Data Model](#️-data-model)
- [🔌 API Reference](#-api-reference)
- [⚙️ Environment Variables](#️-environment-variables)
- [💻 Local Development Setup](#-local-development-setup)
- [☁️ Deployment Strategy](#️-deployment-strategy)
- [🔒 Security Architecture](#-security-architecture)
- [📁 Project Structure](#-project-structure)

---

## ✨ Feature Highlights

<table>
  <thead>
    <tr>
      <th>Category</th>
      <th>Feature</th>
      <th>Implementation Detail</th>
      <th>Status</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td rowspan="4">🎥 <strong>Video Engine</strong></td>
      <td>Adaptive Bitrate Streaming</td>
      <td>HLS <code>.m3u8</code> manifests + <code>.ts</code> segments via <code>hls.js v1.6</code></td>
      <td>✅</td>
    </tr>
    <tr>
      <td>Manual Quality Switching</td>
      <td>Runtime quality level selection (Auto / 480p / 720p / 1080p) via <code>hls.currentLevel</code></td>
      <td>✅</td>
    </tr>
    <tr>
      <td>Native Safari Fallback</td>
      <td>Falls back to <code>video.src</code> for browsers with native HLS support (<code>canPlayType</code>)</td>
      <td>✅</td>
    </tr>
    <tr>
      <td>Skip Intro / Recap</td>
      <td>Per-movie <code>intro_start</code>, <code>intro_end</code>, <code>recap_start</code>, <code>recap_end</code> stored in DB</td>
      <td>✅</td>
    </tr>
    <tr>
      <td rowspan="4">👤 <strong>Profile System</strong></td>
      <td>Multi-Profile Architecture</td>
      <td>Up to 5 sub-profiles per account, each with an independent identity</td>
      <td>✅</td>
    </tr>
    <tr>
      <td>4-Digit PIN Lock</td>
      <td>Per-profile PIN verified server-side via <code>POST /api/verify-pin/</code></td>
      <td>✅</td>
    </tr>
    <tr>
      <td>Per-Profile Watch History</td>
      <td>Progress tracked in seconds; <code>update_or_create</code> upsert on every playback tick</td>
      <td>✅</td>
    </tr>
    <tr>
      <td>Per-Profile Watchlist</td>
      <td>Unique-constrained <code>Watchlist</code> join table; full CRUD via JWT + <code>Profile-Id</code> header</td>
      <td>✅</td>
    </tr>
    <tr>
      <td rowspan="3">🤖 <strong>Discovery</strong></td>
      <td>Personalised Recommendations</td>
      <td>Union of profile's genre preferences + historically-watched genres, ranked by <code>popularity</code></td>
      <td>✅</td>
    </tr>
    <tr>
      <td>Multi-Axis Filtering</td>
      <td>Genre, language, country, release year, content rating, category flags, free-text search</td>
      <td>✅</td>
    </tr>
    <tr>
      <td>Editorial Categories</td>
      <td>Trending, Featured, Award-Winning, Family-Friendly, Recently Added as first-class DB flags</td>
      <td>✅</td>
    </tr>
    <tr>
      <td rowspan="3">🔐 <strong>Security</strong></td>
      <td>JWT Access + Refresh Rotation</td>
      <td>1-day access token, 30-day sliding refresh via <code>SimpleJWT 5.5.1</code></td>
      <td>✅</td>
    </tr>
    <tr>
      <td>Hardened CORS</td>
      <td>Explicit origin allowlist; <code>CORS_ALLOW_ALL_ORIGINS = False</code> enforced in all environments</td>
      <td>✅</td>
    </tr>
    <tr>
      <td>Custom Request Header</td>
      <td><code>Profile-Id</code> header whitelisted in <code>CORS_ALLOW_HEADERS</code> for profile-scoped API calls</td>
      <td>✅</td>
    </tr>
    <tr>
      <td rowspan="2">🌐 <strong>Media Assets</strong></td>
      <td>Multi-Quality Video Tracks</td>
      <td><code>VideoQuality</code> model: per-movie label, resolution, bitrate, and stream URL</td>
      <td>✅</td>
    </tr>
    <tr>
      <td>Subtitles & Audio Dubs</td>
      <td><code>Subtitle</code> (WebVTT) and <code>AudioTrack</code> models with ISO 639-1 language codes</td>
      <td>✅</td>
    </tr>
  </tbody>
</table>

---

## 🏗️ System Architecture

The platform operates as three fully decoupled cloud services. The React SPA on Vercel communicates exclusively with the DRF API on Render over HTTPS. The API connects to Supabase PostgreSQL via IPv4 Connection Pooling. HLS media chunks are served directly to the client from the CDN — the API never proxies binary video data.

```mermaid
flowchart TD
    subgraph CLIENT["🖥️ Client Browser"]
        REACT["React 19 SPA\n(Vercel CDN)"]
        HLSJS["hls.js Engine\nManifest Parser"]
        AUTHCTX["AuthContext\nJWT Token Store\n(localStorage)"]
    end

    subgraph RENDER["⚙️ Render — Django API"]
        GUNICORN["Gunicorn WSGI\nWeb Process"]
        DRF["Django REST Framework\nAPI Views"]
        JWT["SimpleJWT\nAccess / Refresh\nToken Validation"]
        WHITENOISE["WhiteNoise\nStatic Asset Server"]
        CORS["django-cors-headers\nOrigin Allowlist"]
    end

    subgraph SUPABASE["🗄️ Supabase — PostgreSQL"]
        POOLER["IPv4 Connection\nPooler (PgBouncer)"]
        DB[("PostgreSQL\nDatabase")]
    end

    subgraph CDN["☁️ Media CDN / Storage"]
        M3U8["master.m3u8\nManifest File"]
        TS_CHUNKS["720p.ts / 1080p.ts\nVideo Segments"]
    end

    REACT -- "POST /api/login/\n{username, password}" --> CORS
    CORS --> GUNICORN --> DRF
    DRF -- "JWT access + refresh tokens" --> REACT
    AUTHCTX -- "Stores tokens" --> REACT

    REACT -- "GET /api/movies/\nAuthorization: Bearer {access}\nProfile-Id: {id}" --> CORS
    CORS --> JWT
    JWT -- "Validated request" --> DRF
    DRF -- "SQL Query via dj-database-url" --> POOLER
    POOLER --> DB
    DB -- "Movie rows incl. hls_stream_url" --> DRF
    DRF -- "JSON response with hls_stream_url" --> REACT

    REACT -- "Passes hls_stream_url to hls.js" --> HLSJS
    HLSJS -- "GET master.m3u8\n(direct — no API)" --> M3U8
    M3U8 -- "Rendition playlist URLs" --> HLSJS
    HLSJS -- "GET *.ts segments\n(ABR-selected quality)" --> TS_CHUNKS
    TS_CHUNKS -- "Binary video data" --> HLSJS

    style CLIENT fill:#1e3a5f,stroke:#3b82f6,color:#fff
    style RENDER fill:#1a2e1a,stroke:#22c55e,color:#fff
    style SUPABASE fill:#1a2635,stroke:#3ecf8e,color:#fff
    style CDN fill:#2d1a1a,stroke:#f97316,color:#fff
```

### Request Lifecycle Sequence

```mermaid
sequenceDiagram
    actor User
    participant SPA as React SPA (Vercel)
    participant API as Django API (Render)
    participant DB as Supabase PostgreSQL
    participant CDN as Media CDN

    User->>SPA: Opens platform
    SPA->>API: POST /api/login/ {credentials}
    API->>DB: SELECT user WHERE username=?
    DB-->>API: User record
    API-->>SPA: {access_token, refresh_token}

    User->>SPA: Selects profile
    SPA->>API: GET /api/profiles/ [Bearer token]
    API-->>SPA: [{id, name, avatar, is_locked}]

    User->>SPA: Browses movie catalogue
    SPA->>API: GET /api/movies/?category=trending [Bearer + Profile-Id]
    API->>DB: SELECT movies WHERE is_trending=true
    DB-->>API: Movie rows
    API-->>SPA: JSON array (hls_stream_url included)

    User->>SPA: Clicks Play
    SPA->>CDN: GET /path/to/master.m3u8 (direct)
    CDN-->>SPA: HLS manifest (quality renditions)
    SPA->>CDN: GET /path/to/720p/seg001.ts
    CDN-->>SPA: Binary video segment
    Note over SPA: hls.js decodes & renders<br/>Quality auto-adjusts to bandwidth
```

---

## 🗄️ Data Model

```mermaid
erDiagram
    User ||--o{ UserProfile : "has up to 5"
    UserProfile ||--o{ Watchlist : "maintains"
    UserProfile ||--o{ WatchHistory : "records"
    UserProfile }o--o{ Genre : "prefers"
    Movie ||--o{ VideoQuality : "has renditions"
    Movie ||--o{ Subtitle : "has tracks"
    Movie ||--o{ AudioTrack : "has dubs"
    Movie }o--o{ Genre : "categorised by"
    Movie ||--o| Movie : "next_episode (self-ref)"
    Watchlist }o--|| Movie : "references"
    WatchHistory }o--|| Movie : "references"

    UserProfile {
        int id PK
        int user_id FK
        string name
        string avatar
        string pin
        bool is_main
        bool is_locked
    }

    Movie {
        int id PK
        string title
        string hls_stream_url
        string thumbnail_url
        string backdrop_url
        int intro_start
        int intro_end
        bool is_trending
        bool is_featured
    }

    WatchHistory {
        int id PK
        int profile_id FK
        int movie_id FK
        int progress_secs
        bool completed
        datetime watched_at
    }
```

---

## 🔌 API Reference

All endpoints are prefixed with `/api/`. Every protected route requires `Authorization: Bearer <access_token>`. Profile-scoped endpoints additionally require the `Profile-Id: <profile_id>` custom request header.

### 🔑 Authentication

### 👤 Profiles

### 🎬 Movies & Discovery

**`/api/movies/` Query Parameters:**

| Parameter | Type | Values / Example |
| --- | --- | --- |
| `genre` | `string` | Genre name (case-insensitive) — `Action`, `Drama` |
| `language` | `string` | `English`, `Tamil`, `Hindi` |
| `country` | `string` | `USA`, `India` |
| `year` | `int` | `2023` |
| `rating` | `string` | `G`, `PG`, `PG-13`, `R`, `NC-17` |
| `search` | `string` | Full-text search on `title` + `description` |
| `category` | `string` | `trending`, `featured`, `award_winning`, `family_friendly`, `recently_added` |
| `sort` | `string` | `popularity`, `-popularity`, `release_year`, `-created_at` |

### 📋 User Data

---

## ⚙️ Environment Variables

### Backend — Django (`/` root, served from Render)

| Variable | Required | Description | Example Value |
| --- | --- | --- | --- |
| `SECRET_KEY` | ✅ | Django cryptographic signing key. Generate with `python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"` | `django-insecure-...` |
| `DEBUG` | ✅ | Must be `False` in production | `False` |
| `ALLOWED_HOSTS` | ✅ | Comma-separated list of valid Host headers | `your-app.onrender.com,localhost` |
| `DATABASE_URL` | ✅ | Supabase IPv4 Connection Pooler URI (Transaction mode, port `6543`) | `postgresql://user:pass@aws-0-us-east-1.pooler.supabase.com:6543/postgres` |
| `CORS_ALLOWED_ORIGINS` | ✅ | Comma-separated list of permitted request origins (no trailing slash) | `https://your-app.vercel.app,http://localhost:5173` |

### Frontend — Vite React (`havan-frontend/`)

| Variable | Required | Description | Example Value |
| --- | --- | --- | --- |
| `VITE_API_URL` | ✅ | Fully qualified URL of the Django API, no trailing slash | `https://your-app.onrender.com/api` |

> **Note:** In the Vite build, only variables prefixed with `VITE_` are exposed to the client bundle. All other variables remain server-side.

---

## 💻 Local Development Setup

**Prerequisites:**

* Python 3.11+ (production target: 3.12+)
* Node.js 20+ and npm
* Git
* A running PostgreSQL instance **or** a Supabase project URI (SQLite is also supported for pure local dev via the `dj-database-url` fallback)

### Backend Setup

```bash
# 1. Clone the repository
git clone https://github.com/Madhavan-dev18/Havan-Streaming-Service.git
cd Havan-Streaming-Service

# 2. Create and activate a virtual environment
python -m venv venv
source venv/bin/activate          # macOS / Linux
# .\venv\Scripts\activate         # Windows PowerShell

# 3. Install all Python dependencies
pip install -r requirements.txt

# 4. Set your local environment variables
#    Create a .env file (or export directly in your shell)
#    DO NOT commit this file — add it to .gitignore
cat > .env << 'EOF'
SECRET_KEY=your-local-secret-key-here
DEBUG=True
ALLOWED_HOSTS=127.0.0.1,localhost
DATABASE_URL=sqlite:///db.sqlite3
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
EOF

# 5. Apply database migrations
python manage.py migrate

# 6. (Optional) Seed the database with sample movie records
python seed_movies.py

# 7. Create a Django superuser for the Admin panel
python manage.py createsuperuser

# 8. Start the development server
python manage.py runserver
```

The API will be available at `http://127.0.0.1:8000/api/`.

The Django Admin panel is at `http://127.0.0.1:8000/admin/`.

> **HLS Content:** To test streaming, open the Admin panel, create a `Movie` record, and paste a publicly accessible `.m3u8` URL (e.g., from a Supabase Storage bucket or any CORS-permissive CDN) into the `hls_stream_url` field.

### Frontend Setup

```bash
# 1. Navigate to the frontend directory
cd havan-frontend

# 2. Install Node dependencies
npm install

# 3. Configure the API endpoint
#    Create a .env.local file in the havan-frontend/ directory
cat > .env.local << 'EOF'
VITE_API_URL=http://127.0.0.1:8000/api
EOF

# 4. Start the Vite development server
npm run dev
```

The React SPA will be available at `http://localhost:5173`.

**To build for production:**

```bash
npm run build
# Output is placed in havan-frontend/dist/
# This dist/ directory is what Vercel deploys.
```

### Admin Media Management

The `MovieAdmin` configuration exposes inline editors for all related media models directly on the Movie edit page:

| Inline Section | Model | Purpose |
| --- | --- | --- |
| Video Qualities | `VideoQuality` | Add per-resolution HLS stream URLs and bitrates |
| Subtitles | `Subtitle` | Attach WebVTT files per language |
| Audio Tracks | `AudioTrack` | Add dubbed language stream URLs |

Navigate to `/admin/core/movie/add/` to create your first movie with full media assets.

---

## ☁️ Deployment Strategy

The platform is decomposed into three independent, stateless services. No service shares a filesystem with another.

```
┌─────────────────────────────────────────────────────────────────────┐
│                     PRODUCTION TOPOLOGY                                │
│                                                                         │
│   ┌──────────────────┐      HTTPS       ┌────────────────────────┐   │
│   │  Vercel (CDN)     │◄────────────────►│  Render (Web Service)  │   │
│   │  React SPA        │                  │  Gunicorn + Django     │   │
│   │  Static Bundle    │                  │  DRF API               │   │
│   └──────────────────┘                  └──────────┬─────────────┘   │
│                                                      │ dj-database-url │
│                                           ┌──────────▼─────────────┐   │
│                                           │  Supabase PostgreSQL   │   │
│                                           │  PgBouncer Pooler      │   │
│                                           │  Port 6543 (IPv4)      │   │
│                                           └────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

**Render Deployment Checklist:**

1. Connect your GitHub repository to a new Render Web Service.
2. Set **Build Command** to: `pip install -r requirements.txt && python manage.py migrate && python manage.py collectstatic --noinput`
3. Set **Start Command** to: `gunicorn netflix_site.wsgi:application --bind 0.0.0.0:$PORT`
4. Add all backend environment variables from the [Environment Variables](#️-environment-variables) section.
5. Set `ALLOWED_HOSTS` to include your Render service hostname (e.g., `your-app.onrender.com`).
6. Set `CORS_ALLOWED_ORIGINS` to your Vercel deployment URL.

**Vercel Deployment Checklist:**

1. Import the repository into Vercel and set the **Root Directory** to `havan-frontend`.
2. Set **Build Command** to: `npm run build`
3. Set **Output Directory** to: `dist`
4. Add `VITE_API_URL` pointing to your live Render API (e.g., `https://your-app.onrender.com/api`).

---

## 🔒 Security Architecture

| Layer | Mechanism | Configuration |
| --- | --- | --- |
| **Transport** | HTTPS enforced at platform level | Render + Vercel provision TLS by default |
| **Origin Control** | `django-cors-headers` allowlist | `CORS_ALLOW_ALL_ORIGINS = False`; origins loaded from env var at startup |
| **Authentication** | JWT Bearer tokens (SimpleJWT) | Access TTL: 1 day · Refresh TTL: 30 days · `ROTATE_REFRESH_TOKENS = True` |
| **PIN Protection** | Server-side string comparison | PIN stored in DB; never returned in `UserProfileSerializer` response |
| **Host Validation** | Django `ALLOWED_HOSTS` | Comma-separated list from `ALLOWED_HOSTS` env var |
| **Static Assets** | WhiteNoise with manifest hashing | `CompressedManifestStaticFilesStorage` provides cache-busted filenames |
| **Profile Isolation** | `Profile-Id` header + `user=request.user` query filter | All profile-scoped queries are doubly validated: valid JWT **and** profile ownership |

> **Important:** The `SECRET_KEY` fallback in `settings.py` (`'fallback-insecure-key-for-local-dev-only'`) is intentional for local development only. A production `SECRET_KEY` must always be provided via the `SECRET_KEY` environment variable on Render. Failure to do so breaks CSRF validation and session signing.

---

## 📁 Project Structure

```
Havan-Streaming-Service/
├── Procfile                        # Gunicorn start command for Render
├── requirements.txt                # All Python dependencies (pinned versions)
├── manage.py
├── seed_movies.py                  # DB seeder script for development
├── fix_ghost_movies.py             # Utility: prune orphaned/inactive records
│
├── netflix_site/                   # Django project configuration
│   ├── settings.py                 # All configuration, env-var driven
│   ├── urls.py                     # Root URL conf — mounts core under /api/
│   ├── wsgi.py                     # WSGI entrypoint (Gunicorn target)
│   └── asgi.py
│
├── core/                           # Primary Django application
│   ├── models.py                   # Movie, UserProfile, Watchlist, WatchHistory, etc.
│   ├── serializers.py              # DRF serializers (read/write separation)
│   ├── views.py                    # APIView-based endpoints
│   ├── urls.py                     # API route definitions
│   ├── admin.py                    # Django Admin with inline media editors
│   └── migrations/
│
└── havan-frontend/                 # React + Vite SPA
    ├── vite.config.js              # Tailwind CSS v4 via Vite plugin
    ├── package.json
    └── src/
        ├── main.jsx                # ReactDOM entry — wraps app in AuthProvider
        ├── App.jsx                 # SPA router, global state, data-fetching
        ├── context/
        │   └── AuthContext.jsx     # JWT storage, login/register/logout, authFetch
        ├── components/
        │   ├── AdvancedPlayer.jsx  # hls.js engine, quality switching, keyboard controls
        │   ├── VideoPlayer.jsx     # Lightweight fallback player
        │   ├── ProfileManager.jsx  # Create/edit/delete sub-profiles
        │   ├── ProfileSelector.jsx # PIN-gated profile selection UI
        │   ├── EditorialGrid.jsx   # Movie catalogue grid layout
        │   ├── FilterBar.jsx       # Multi-axis filter controls
        │   ├── MovieCard.jsx       # Thumbnail + metadata card component
        │   └── Navbar.jsx          # Top navigation with route links
        └── pages/
            ├── Login.jsx           # Login + Register forms
            └── ProfilePage.jsx     # Profile detail and preference editor
```

---

<div align="center">

Built by [Madhavan Shivakumar](https://linkedin.com/in/madhavan-shivakumar-dev) · [GitHub](https://github.com/Madhavan-dev18)

</div>
