<p align="center">
  <img src="https://i.ibb.co.com/7NrtB6Vv/image.png" alt="CampusPulse banner" width="100%" />
</p>

<h1 align="center">CampusPulse</h1>
<p align="center"><b>One inbox for everything that matters on campus.</b></p>

<p align="center">
  Built for <b>ForkedArch Freshers Hackathon 2026</b> by <b>Team CODE_and_CAFFEINE</b>
</p>

<p align="center">
  <a href="https://instant-launch-link--marufrahmancode.replit.app/"><b>🔗 Live Demo</b></a>
</p>

---

## Presentation on Youtube

[![Campus Pulse Presentation](https://youtube.com)](https://youtube.com/watch?v=GkeHwD8SYdU&si=NmrKDZ4PBjdVKzYz)

---


## 👥 Team — CODE_and_CAFFEINE

| Name | Roll | Department | GitHub |
| --- | --- | --- | --- |
| Md. Maksudur Rahman | 2K2507068 | CSE | [@maksudurr173](https://github.com/maksudurr173) |
| Zawad Ibrahim | 2K2507081 | CSE | [@Zawad-2007](https://github.com/Zawad-2007) |
| Maruf Rahman | 2K2507088 | CSE | [@maruf-codes33](https://github.com/maruf-codes33) |
| Sheikh Rahatul Islam | 2K2507067 | CSE | [@RISami29](https://github.com/RISami29) |


---

## 📑 Table of Contents

- [Project Overview](#-project-overview)
- [Problem Statement](#-problem-statement)
- [Proposed Solution](#-proposed-solution)
- [Features](#-features)
- [Technology Stack](#️-technology-stack)
- [System Workflow](#-system-workflow)
- [Architecture](#️-architecture)
- [Setup Instructions](#-setup-instructions)
- [Environment Variables](#-environment-variables)
- [API Documentation](#-api-documentation)
- [Database Structure](#-database-structure)
- [AI Usage](#-ai-usage)
- [Testing / Quality Assurance](#-testing--quality-assurance)
- [Limitations](#-limitations)
- [Future Improvements](#-future-improvements)
- [Live Demo](#-live-demo)

---

## 📝 Project Overview

**CampusPulse** is a targeted, role-aware campus announcement platform. Instead of broadcasting every message to everyone, it matches each announcement against a user's department, batch, section, hall, club memberships, and self-selected topic preferences — so people only ever see what's actually relevant to them, delivered in real time, with proof that it was seen.

---

## ❔ Problem Statement

Campus communication today is scattered across too many channels — group chats, notice boards, emails, word-of-mouth — which means students routinely miss the updates that matter most: class changes, club registrations, exam schedules, and campus-wide alerts. Important information gets buried under noise, or lost entirely.

Every student is part of overlapping communities — a department, a batch, a section, a hall, a club — and each broadcasts through its own group chat, so students end up muting most of them just to survive the noise. The cost is real: a CR reposts a room change five times because half the section never saw it the first time; a club's registration deadline passes unnoticed; a hall's water-outage notice gets buried under fifty unrelated messages. The underlying problem isn't a lack of communication — it's a lack of *relevance*.

---

## 💡 Proposed Solution

CampusPulse solves this by making relevance a first-class concept rather than an afterthought. Every announcement is authored with structured metadata (audience, category, urgency) instead of free text, and every user profile carries the same structured attributes (department, batch, section, hall, clubs, opted-in topics, noise-filter level). A matching engine in the backend compares the two before a notice is ever shown or pushed to a user, so people only ever see what's meant for them — delivered instantly over WebSockets, with acknowledgment tracking to prove the message was actually seen, and a daily digest as a safety net for anything missed live.

---

## ✨ Features

### 1. Account Access — Sign Up, Log In, Log Out
Every user's journey starts with establishing an identity, since everything downstream — filtering, targeting, notifications — depends on knowing who the person is and what they belong to.

- **Sign Up** — Users register with their name, university email, password, and role (student, CR, or faculty), along with department, batch, section, hall, clubs, and enrolled courses. Every field becomes a filter used later to decide relevance — a CSE Batch 21 Section A student will never see a notice meant only for EEE Batch 23 Section B.
- **Log In** — Returning users authenticate with email and password. A one-click **Demo Login** using pre-seeded personas is also available, so new visitors can explore the app instantly without creating an account.
- **Log Out** — Securely clears the session and returns to the login screen — important on shared devices like hall common rooms or library terminals.
- **Preference Setup** — Right after signup (or anytime from settings), users choose a **noise filter** (strict, balanced, or all) and their preferred topics.

### 2. Topic-Based Notification Preferences
To solve notification fatigue, users explicitly opt into the categories they care about: **academics, clubs, admin, hall,** or **community**. A final-year student might only want academics and admin; a club executive might add clubs and community; a CR might prioritize academics, admin, and hall. Preferences can be updated anytime as priorities shift through the semester.

Every announcement has to pass **two layers of relevance** before it reaches someone:
1. Is this person in the intended audience (department/batch/section/hall/club)?
2. Did they opt into this category of update?

### 3. Publishing an Announcement — Including Scheduled Notices
CRs, faculty, and club organizers use a structured **Broadcast Announcement** form (not free-form messaging), keeping every notice consistent and machine-filterable:

- **Urgency level** — critical, high, medium, or low, controlling how aggressively it's surfaced.
- **Category** — academics, clubs, admin, hall, or community.
- **Title, full content, and a short TL;DR** — so even a glance at the feed communicates the essential point.
- **Target audience** — specific department, batch, section, club, hall, or `ALL`.
- **Scheduled publish time** — notices can be written in advance and set to go live at exactly the right moment (an exam schedule, a "registration closes in 24 hours" reminder) without anyone needing to trigger it manually.
- **Optional extras** — a deadline (for calendar export), a room/location change, and a call-to-action button with a label and link.

### 4. Targeted Routing & Notification Matching
The core intelligence of the platform. Every announcement — whether published immediately or unlocked later by its schedule — is run through a matching process against every user's profile:

- Does the target (department/batch/section/club/hall, or `ALL`) match this user?
- Does the category fall within their opted-in topics?
- Does their noise filter allow this urgency level through?

Only users who pass all three checks receive the notice and get actively notified — preventing the classic group-chat spam problem.

### 5. Real-Time Delivery
Once an announcement clears the targeting checks, it's pushed live to every matching, connected user over a **WebSocket** connection — no page refresh required. Critical, time-sensitive alerts additionally trigger a sticky flash banner with an audio chime, so they can't be casually scrolled past.

### 6. Acknowledgment & Proof of Reach
For notices that matter — an urgent relocation, a mandatory policy change — publishers can require acknowledgment. Students tap **Acknowledge**, and each tap is recorded and reflected back to the publisher as a live, ticking counter — verifiable confirmation the message was actually seen.

### 7. Bookmarking & Calendar Export
Students can bookmark any announcement to revisit later. Notices with an attached deadline can be exported as a `.ics` calendar file, dropping straight into Google Calendar, Apple Calendar, or Outlook.

### 8. Morning Digest
Each day, the platform compiles a personalized digest for every user — critical alerts, deadlines due within 72 hours, and highlights from their preferred topics and department — acting as a safety net for anyone who missed a live notification.

---

## 🛠️ Technology Stack

| Layer | Technology | Role in this project |
| --- | --- | --- |
| Backend | Python + Flask | Serves the REST API, runs the matching/filtering logic, and hosts the WebSocket endpoint. |
| Realtime | WebSockets (`flask-sock`) | Keeps an in-memory list of connected clients and pushes `NEW_ANNOUNCEMENT` events the instant a notice is published. |
| Push Notifications | Web Push (VAPID keys + `pywebpush`), Service Worker (`sw.js`) | Delivers notifications even when the browser tab is closed. |
| Database | SQLite (`campuspulse.sqlite`) | Single-file relational store for users, announcements, acknowledgments, and bookmarks — auto-created and seeded on first run. |
| Frontend | Plain HTML, CSS, JavaScript (no build step) | `app.js` runs directly in the browser and drives the dashboard, forms, and live feed. |
| Auth | Session cookies + Werkzeug password hashing | Flask's signed session cookie (`session["user_id"]`) is the entire auth mechanism — no JWTs or separate auth service. |

> As required by the rulebook (§8, §15), the choice of stack was kept intentionally simple — no build tooling, one database file, no external auth service — so that architecture, data flow, and API behavior stay easy to explain and verify.

---

## 🔄 System Workflow

```
User (browser)
 ↓
Static frontend (public/index.html, app.js, styles.css)
 ↓
Flask REST API (app.py)
 ↓
Session-cookie authentication (Werkzeug password hashing)
 ↓
Relevance/matching logic (department, batch, section, hall, club, category, urgency, noise filter)
 ↓
SQLite database (users, announcements, acknowledgments, bookmarks)
 ↓
Response (JSON) → Frontend
      + WebSocket push (flask-sock) → connected clients
      + Web Push (VAPID / pywebpush) → offline/closed-tab clients
```

Step by step:

1. **Serving the app** — The browser hits the Flask server on port `8000`. Catch-all routes (`/` and `/<path:filename>`) serve static files from `public/`, starting with `index.html`, which loads `styles.css` and `app.js`. There's no build step — `app.js` runs directly in the browser.
2. **Auth gate** — On load, `app.js` calls `GET /api/auth/me`. Flask checks the session cookie for a `user_id`; if valid, it returns that user's row and the dashboard loads. Otherwise, the login/signup screen appears (or the demo persona list from `POST /api/auth/demo-login`, which logs you in as a pre-seeded user with no password needed).
3. **Signup / Login** — `POST /api/auth/signup` hashes the password with Werkzeug and inserts a new row into `users`. `POST /api/auth/login` looks up the user by email and verifies the hash. Either way, Flask sets `session["user_id"]` in a signed cookie.
4. **Realtime channel** — Once logged in, `app.js` opens a WebSocket to `/api/ws`. On the server, `flask-sock` keeps the connection alive in an in-memory list (`ws_clients`), used purely for push-style updates.
5. **Loading the feed** — `GET /api/announcements` pulls every row from `announcements`, joins in each user's acknowledgment/bookmark counts, and runs it through a filter + relevance-scoring pass in Python (matching department/batch/section/hall/clubs, urgency, search text, selected tab) before returning the sorted, scored list as JSON.
6. **Publishing a notice** — When a CR/faculty user submits the "Post Notice" form, `POST /api/announcements` inserts the row, then immediately calls `broadcast()` to push a `NEW_ANNOUNCEMENT` message down every open WebSocket, and `send_push_for_notice()` to fire Web Push notifications (via VAPID keys + `pywebpush`) — reaching users even if the tab is closed, via the service worker (`sw.js`).
7. **Acknowledge / bookmark / digest / export** — `POST /api/announcements/<id>/acknowledge` and `.../bookmark` insert rows into their respective join tables. `GET /api/digest` builds the Morning Briefing summary. `GET /api/export-ics/<id>` generates a downloadable `.ics` calendar file for a notice's deadline.
8. **Storage** — Everything lives in a single SQLite file (`campuspulse.sqlite`), created and seeded automatically the first time `app.py` runs — no separate database server needed.

---

## 🏗️ Architecture

```
CampusPulse/
├── app.py              # Python/Flask backend — API, WebSocket realtime feed, push notifications, SQLite data
├── requirements.txt    # Python dependencies
├── public/             # Frontend — plain HTML/CSS/JS (no build step needed)
│   ├── index.html
│   ├── app.js
│   ├── styles.css
│   ├── sw.js            # Service worker (background push notifications)
│   ├── favicon.svg
│   └── robots.txt
└── .gitignore
```

**Major components and how they interact:**

- **`app.py`** is a monolithic Flask app — it owns the HTTP routes, the WebSocket endpoint, the SQLite connection, the relevance-matching logic, and the Web Push dispatch. There is no separate microservice or API gateway.
- **`public/`** is a static, build-free frontend. `index.html` is the shell; `app.js` handles all client-side logic (auth calls, rendering the feed, opening the WebSocket, registering the service worker); `styles.css` handles presentation.
- **`sw.js`** runs independently of the main page in the browser's background thread, so push notifications can be received even when CampusPulse isn't open in a tab.
- **`campuspulse.sqlite`** is the single source of truth, created and seeded automatically on first run — no separate database server to provision.

---

## 🚀 Setup Instructions

```bash
# Clone the repository
git clone https://github.com/<your-org-or-user>/CampusPulse.git
cd CampusPulse

# Install dependencies
pip install -r requirements.txt

# Configure environment variables (see below), then run the app
python app.py
```


---

## 🔑 Environment Variables

CampusPulse needs the following environment variables to run in production (Web Push requires its own key pair). No real secret values are committed to this repository.

```
FLASK_SECRET_KEY=       # Signs the session cookie used for authentication
VAPID_PUBLIC_KEY=       # Public key for Web Push (browser subscribes with this)
VAPID_PRIVATE_KEY=      # Private key for Web Push (server signs push payloads with this)
VAPID_CLAIM_EMAIL=      # Contact email required by the Web Push protocol (mailto:you@example.com)
DATABASE_PATH=          # Optional override for the SQLite file location (defaults to ./campuspulse.sqlite)
```

> For local development, sensible defaults are used automatically if these are unset, so `python app.py` works out of the box. VAPID keys are required only for Web Push notifications to function.

---

## 📡 API Documentation

| Endpoint | Method | Purpose |
| --- | --- | --- |
| `/api/auth/signup` | POST | Registers a new user (name, email, password, role, department, batch, section, hall, clubs, courses); hashes the password with Werkzeug. |
| `/api/auth/login` | POST | Authenticates an existing user by email + password and starts a session. |
| `/api/auth/demo-login` | POST | Logs in as a pre-seeded demo persona, no password required. |
| `/api/auth/me` | GET | Returns the current session's user profile, or 401 if not logged in. |
| `/api/auth/logout` | POST | Clears the session cookie. |
| `/api/announcements` | GET | Returns announcements relevant to the current user, filtered and relevance-scored (department/batch/section/hall/club, category, urgency, noise filter, search text, tab). |
| `/api/announcements` | POST | Creates a new announcement (CR/faculty/club roles only); triggers WebSocket broadcast and Web Push. |
| `/api/announcements/<id>/acknowledge` | POST | Records that the current user has acknowledged a notice; updates the live acknowledgment counter. |
| `/api/announcements/<id>/bookmark` | POST | Bookmarks/unbookmarks a notice for the current user. |
| `/api/digest` | GET | Returns the personalized Morning Digest for the current user. |
| `/api/export-ics/<id>` | GET | Generates and returns a downloadable `.ics` calendar file for a notice's deadline. |
| `/api/ws` | WebSocket | Realtime channel; the server pushes `NEW_ANNOUNCEMENT` (and related) events to every connected, matching client. |

All endpoints (other than static file routes) return JSON and rely on the Flask session cookie for authentication.

---

## 🗄️ Database Structure

CampusPulse uses a single SQLite file (`campuspulse.sqlite`), created and seeded automatically on first run. Key tables:

| Table | Purpose | Key fields |
| --- | --- | --- |
| `users` | One row per registered account. | `id`, `name`, `email`, `password_hash`, `role` (student/CR/faculty), `department`, `batch`, `section`, `hall`, `clubs`, `courses`, `noise_filter`, `preferred_topics` |
| `announcements` | One row per published (or scheduled) notice. | `id`, `title`, `content`, `tldr`, `category`, `urgency`, `target_department/batch/section/club/hall`, `publish_at`, `deadline`, `location_change`, `cta_label`, `cta_link`, `requires_ack`, `created_by` |
| `acknowledgments` | Join table recording which users acknowledged which announcements. | `user_id`, `announcement_id`, `acknowledged_at` |
| `bookmarks` | Join table recording which users bookmarked which announcements. | `user_id`, `announcement_id`, `bookmarked_at` |

The relevance/matching logic reads from `users` and `announcements` together at request time (in `GET /api/announcements` and in the WebSocket broadcast path) rather than pre-computing a per-user feed — this keeps the schema simple at the cost of doing the matching pass in Python on every request.

---

## 🤖 AI Usage

AI tools used:
- Claude (Anthropic)

AI was used for:
- Generating initial boilerplate for the Flask backend and static frontend
- Debugging the WebSocket broadcast and Web Push integration
- Suggesting the relevance-matching approach (audience + category + noise-filter checks) and drafting this README

Human contribution:
- Problem understanding and translating it into the department/batch/section/hall/club data model
- Architecture and feature-scope decisions (what made it into the MVP vs. future improvements)
- Integration of the WebSocket, Web Push, and SQLite pieces into one working app
- Testing, verification, and manual fixes to AI-suggested code before it was accepted

As required by the rulebook (§9), every team member is able to explain what the project does, how the system works, why this stack was chosen, how data flows through the app, how the API and database are structured, how authentication works, and which parts were AI-assisted versus personally implemented or modified.

---

## ✅ Testing / Quality Assurance

- Manual end-to-end testing of the core flows: signup → login → set preferences → publish an announcement → confirm it is/isn't received by users outside/inside the target audience → acknowledge → bookmark → export `.ics` → view digest.
- Verified the two-layer relevance check (audience match + opted-in category) using multiple demo personas with different department/batch/section/hall/club combinations.
- Verified real-time delivery by keeping two browser sessions open (different demo users) and confirming the WebSocket push and flash banner/chime fire correctly for a `critical` urgency notice.
- Basic input validation on signup/login forms and the announcement composer (required fields, valid urgency/category values).
- Manual check that no API keys, VAPID private keys, or database credentials are committed to the repository.

---

## ⚠️ Limitations

- No automated test suite (unit/integration tests) yet — testing so far has been manual, as noted above.
- The relevance-matching pass runs in Python on every `GET /api/announcements` call rather than being pre-computed or cached, which may not scale to a very large number of users/announcements.
- SQLite is a single file with no built-in concurrent-write scaling — fine for a hackathon MVP and a single campus deployment, not for a multi-server production setup.
- Web Push requires the user to accept browser notification permissions; there is no SMS/email fallback channel yet.
- Role verification (student vs. CR vs. faculty) is self-declared at signup rather than verified against an official university identity system.

---

## 🔮 Future Improvements

- Move to a proper relational database (PostgreSQL) with a connection pool for multi-instance deployment.
- Add automated tests (unit tests for the matching logic, integration tests for the API endpoints).
- Verify CR/faculty roles against an official university system instead of self-declaration at signup.
- Add an email/SMS fallback channel for critical alerts, alongside WebSocket and Web Push.
- Cache or pre-compute per-user feeds to reduce the cost of the relevance pass at larger scale.
- Add analytics for publishers (e.g., open rate, acknowledgment rate over time) beyond the current live counter.

---

## 🌐 Live Demo

**👉 [instant-launch-link--marufrahmancode.replit.app](https://instant-launch-link--marufrahmancode.replit.app/)**

Use the **Demo Login** option to explore CampusPulse instantly with pre-seeded personas — no signup required.

---

<p align="center">
  <i>Forkathon: Freshers Hackathon 2026 — presented by ForkedArch, powered by XtendArena</i>
</p>

