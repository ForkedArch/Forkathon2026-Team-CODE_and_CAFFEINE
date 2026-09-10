<<<<<<< HEAD
# CampusPulse

A real-time campus announcement and notification dashboard for students — sign-in, personalized feeds, acknowledgements, bookmarks, morning digests, and calendar (.ics) export.

## Project structure
=======
<p align="center">
  <img src="https://i.ibb.co.com/7NrtB6Vv/image.png" alt="CampusPulse banner" width="100%" />
</p>

<h1 align="center">CampusPulse</h1>
<p align="center"><b>One inbox for everything that matters on campus.</b></p>

<p align="center">
  Built for <b>ForkedArch Freshers Hackathon 2026</b> by <b>Team CODE_and_CAFFEINE</b>
</p>
>>>>>>> 9131afa (Final change for readme file)

<p align="center">
  <a href="https://instant-launch-link--marufrahmancode.replit.app/"><b>🔗 Live Demo</b></a>
</p>

---

## 👥 Team — CODE_and_CAFFEINE

| Name | Roll | Department | GitHub |
| --- | --- | --- | --- |
| Md. Maksudur Rahman | 2K2507068 | CSE | [@maksudurr173](https://github.com/maksudurr173) |
| Zawad Ibrahim | 2K2507081 | CSE | [@Zawad-2007](https://github.com/Zawad-2007) |
| Maruf Rahman | 2K2507088 | CSE | [@maruf-codes33](https://github.com/maruf-codes33) |
| Sheikh Rahatul Islam | 2K2507068 | CSE | [@RISami29](https://github.com/RISami29) |

---

## 📑 Table of Contents

- [The Problem](#-the-problem)
- [Our Understanding](#-our-understanding)
- [Our Solution](#-our-solution)
- [Core Features](#-core-features)
- [How It Works — System Flow](#-how-it-works--system-flow)
- [Architecture](#️-architecture)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Live Demo](#-live-demo)

---

## ❔ The Problem

Campus communication today is scattered across too many channels — group chats, notice boards, emails, word-of-mouth — which means students routinely miss the updates that matter most: class changes, club registrations, exam schedules, and campus-wide alerts. Important information gets buried under noise, or lost entirely.

## 🤔 Our Understanding

Every student on campus is, in some way, part of overlapping communities — a department, a batch, a section, a hall, a club. Right now, each of these communities broadcasts through its own group chat, and every student ends up muting most of them just to survive the noise. The cost is real: a CR reposts a room change five times because half the section never saw it the first time; a club's registration deadline passes unnoticed by students who would have joined; a hall's water-outage notice gets buried under fifty unrelated messages.

CampusPulse exists because the problem isn't a lack of communication — it's a lack of *relevance*. Nobody needs every message sent on campus; they need the ones meant for them, delivered in a way they can't miss and can't lose. That's the gap our team set out to close.

## 💡 Our Solution

**CampusPulse** is a targeted, role-aware campus announcement platform. Instead of broadcasting every message to everyone, it matches each announcement against a user's department, batch, section, hall, club memberships, and self-selected topic preferences — so people only ever see what's actually relevant to them, delivered in real time, with proof that it was seen.

---

## ✨ Core Features

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

## 🔄 How It Works — System Flow

1. **Serving the app** — The browser hits the Flask server on port `8000`. Catch-all routes (`/` and `/<path:filename>`) serve static files from `public/`, starting with `index.html`, which loads `styles.css` and `app.js`. There's no build step — `app.js` runs directly in the browser.

2. **Auth gate** — On load, `app.js` calls `GET /api/auth/me`. Flask checks the session cookie for a `user_id`; if valid, it returns that user's row and the dashboard loads. Otherwise, the login/signup screen appears (or the demo persona list from `POST /api/auth/demo-login`, which logs you in as a pre-seeded user with no password needed).

3. **Signup / Login** — `POST /api/auth/signup` hashes the password with Werkzeug and inserts a new row into `users`. `POST /api/auth/login` looks up the user by email and verifies the hash. Either way, Flask sets `session["user_id"]` in a signed cookie — the entire auth mechanism, with no JWTs or separate auth service.

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

---

## 🛠️ Tech Stack

| Layer | Technology |
| --- | --- |
| Backend | Python, Flask |
| Realtime | WebSockets (`flask-sock`) |
| Push Notifications | Web Push (VAPID keys + `pywebpush`), Service Worker |
| Database | SQLite |
| Frontend | Plain HTML, CSS, JavaScript (no build step) |
| Auth | Session cookies + Werkzeug password hashing |

---

## 🚀 Getting Started

```bash
# Clone the repository
git clone https://github.com/<your-org-or-user>/CampusPulse.git
cd CampusPulse

# Install dependencies
pip install -r requirements.txt

# Run the app
python app.py
```

The app will be available at **http://localhost:8000** — the SQLite database is created and seeded automatically on first run.

---

## 🌐 Live Demo

**👉 [instant-launch-link--marufrahmancode.replit.app](https://instant-launch-link--marufrahmancode.replit.app/)**

Use the **Demo Login** option to explore CampusPulse instantly with pre-seeded personas — no signup required.

---

<p align="center">
  <i>Forkathon: Freshers Hackathon 2026 — presented by ForkedArch, powered by XtendArena</i>
</p>
