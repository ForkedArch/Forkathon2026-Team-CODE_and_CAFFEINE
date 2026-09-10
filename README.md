# CampusPulse

A real-time campus announcement and notification dashboard for students — sign-in, personalized feeds, acknowledgements, bookmarks, morning digests, and calendar (.ics) export.

## Project structure

```
CampusPulse/
├── app.py              # Python/Flask backend — API, WebSocket realtime feed, push notifications, SQLite data
├── requirements.txt    # Python dependencies
├── public/              # Frontend — plain HTML/CSS/JS (no build step needed)
│   ├── index.html
│   ├── app.js
│   ├── styles.css
│   ├── sw.js            # Service worker (background push notifications)
│   ├── favicon.svg
│   └── robots.txt
└── .gitignore
```

Everything is served by the one Flask app — there's no separate frontend server or build step. `app.py` serves the files in `public/` directly and exposes the API under `/api/...`.

## Running it locally

```bash
pip install -r requirements.txt
python app.py
```

Then open **http://localhost:8000**.

The SQLite database (`campuspulse.sqlite`) is created automatically the first time you run the app, and it's pre-seeded with demo accounts so you can log in instantly and try it out — no manual setup needed.

## Notes on what was removed

The original export was a Replit project folder containing a lot of scaffolding that wasn't part of the running app:

- **Version control internals** (`.git/`) and Replit **agent memory/config** (`.agents/`, `.replit*`) — environment-specific, not app code.
- A **225 MB duplicate archive** (`CampusPulse_Source.zip`) that was effectively a full copy of the Replit home directory (package manager caches, logs, etc.), not source code.
- An **unused React/TypeScript scaffold** (`src/App.tsx`, `main.tsx`, and a large `components/ui/` shadcn library) that Replit generated but the app never actually loads — `index.html` loads `app.js` directly, so the site is plain HTML/CSS/JS, not React.
- An **unused Node/Express + Drizzle ORM backend stub** (`lib/db`, `lib/api-zod`, `lib/api-client-react`, `artifacts/api-server/src/`) — a scaffolded alternative backend that was replaced by the working Python/Flask server (`app.py`) and never wired up.
- A **design-mockup sandbox** (`artifacts/mockup-sandbox/`) used only for Replit's visual preview tooling, not the shipped site.
- Build output (`dist/`), lockfiles, and generated TypeScript build caches, which regenerate automatically and don't need to be committed.

What's left is the actual, working application: the Flask/SQLite backend and the HTML/CSS/JS frontend it serves.
