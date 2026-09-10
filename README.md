<img src="https://i.ibb.co.com/7NrtB6Vv/image.png" />

# Forkathon 2026: [Your Project Name] by Team-CODE_and_CAFFEINE

> Built for ForkedArch Freshers Hackathon 2026

## 👥 Teama

| Name | Roll | Department | GitHub |
| --- | --- | --- | --- |
| Md. Maksudur Rahman | 2K2507068 | CSE | @maksudurr173 |
| Zawad Ibrahim | 2K2507081 | CSE | @Zawad-2007 |
| Maruf Rahman | 2K2507088 | CSE | @maruf-codes33 |
| Sheikh Rahatul Islam | 2K2507068 | CSE | @RISami29 |

---

## ❔ Problem

### Problem Statement

Campus communication is fragmented across too many channels, causing students to miss crucial updates (class changes, club registrations, events) through lost messages, word-of-mouth reliance, or information overload.

### 🤔 's Understanding

Explain the problem in your own words. You may say a story mentioning your team member names!

What is the actual problem?
Who experiences it?
Why does it matter?

---

## 💡 Our Solution
1. Account Access — Sign Up, Log In, Log Out

Every user's journey with CampusPulse begins with establishing an identity, because everything the platform does afterward filtering, targeting, notifying  depends on knowing who the person is and what they belong to.

Sign Up: A new user registers with their full name, university email, a password, and their role (student, CR, or faculty). They also provide their department, batch, section, hall of residence, the clubs they're part of, and the courses they're enrolled in. This isn't just profile decoration every one of these fields becomes a filter the system uses later to decide which announcements are relevant to them. A CSE Batch 21 Section A student, for instance, will never see a notice meant only for EEE Batch 23 Section B, because their profile simply doesn't match that target.
Log In: Returning users authenticate with their email and password. For demo/testing purposes, the platform also supports one-click "Demo Login" using pre-seeded personas, so new visitors can explore the app instantly without creating an account.
Log Out: Users can end their session at any time, which clears their authentication state securely and returns them to the login screen. This matters for shared or public computers (like hall common rooms or library terminals), where leaving a session open could expose someone else's personalized notices.
Preference Setup: Right after signing up (or anytime after, from settings), users choose two important things: a noise filter ; how much they want to see (strict, balanced, or all)  and their preferred topics, which we explain next.
2. Topic-Based Notification Preferences

One of the biggest problems CampusPulse solves is notification fatigue  the tendency for people to tune out or mute group chats because they're flooded with irrelevant updates. To fix this, the platform lets each user explicitly opt into the categories of information they actually care about: academics, clubs, admin, hall, or community.

For example, a final-year student focused on their thesis might only want academic and admin notices, while a club executive wants academics, clubs, and community updates so they don't miss event coordination. A CR juggling class responsibilities might select academics, admin, and hall notices because those directly affect their duties. This isn't a one-time choice users can revisit and adjust their preferred topics at any point as their priorities shift throughout the semester (e.g. turning on "hall" notices during exam season when hall facility changes matter more).

These preferences work together with department/batch/section targeting — so an announcement has to pass through two layers of relevance before it reaches someone: (1) is this person even in the intended audience, and (2) did they say they care about this kind of update.

3. Publishing an Announcement  including Scheduled Notices

Publishers — CRs, faculty members, or club organizers  use a structured "Broadcast Announcement" form rather than free-form messaging, which keeps every notice consistent and machine-filterable. When composing a notice, they specify:

Urgency level: critical, high, medium, or low ; this determines how aggressively the notice is surfaced (a critical alert gets a flashing banner and audio chime; a low-priority one sits quietly in the feed).
Category: academics, clubs, admin, hall, or community  this is what gets matched against users' preferred topics.
Title, full content, and a short TL;DR summary  the summary exists so that even a glance at the feed communicates the essential point, without requiring the reader to open the full notice.
Target audience: specific department, batch, section, club, and/or hall  or ALL if it's meant for everyone.
Scheduled publish time  this is a key addition. Instead of a notice going live the instant it's written, a publisher can set a future date and time for it to appear. This solves a real, practical problem: many announcements are prepared in advance (exam schedules, event reminders, deadline nudges) but shouldn't be shown too early, where they'd be forgotten, or too late, where they'd be useless. A teacher can write next week's class reschedule notice today and have it appear the morning it becomes relevant. A club can schedule a "registration closes in 24 hours" reminder to fire automatically at exactly the right moment, without anyone needing to be online to trigger it manually.
Optional extras: a specific deadline (used for calendar export), a room/location change (shown prominently for relocations), and a call-to-action button with a label and link (e.g. "Register Squad" linking to an external form).
4. Targeted Routing & Notification Matching

This is the core intelligence of the platform. Whether an announcement is published immediately or unlocked later by its scheduled time, the system runs it through a matching process against every user's profile before deciding who sees it and who gets actively notified:

Does the announcement's target department, batch, section, club, or hall match this specific user (or was it marked ALL)?
Does the announcement's category fall within the topics this user opted into?
Does the user's chosen noise filter allow this urgency level through, or would it be filtered out under a stricter setting?

Only users who pass all of these checks receive the notice in their feed and get actively notified. This is what prevents the classic problem of group-chat spam: a robotics workshop announcement won't reach someone who never opted into "clubs," and a batch-specific lab reschedule won't clutter the feed of students from a different batch  even though everyone is technically part of the same "campus."

5. Real-Time Delivery

Once an announcement clears the targeting checks  either immediately at publish time or automatically once its scheduled time arrives  it's pushed live to every matching, connected user over a WebSocket connection. There's no need to refresh the page; the notice simply appears. For critical, time-sensitive alerts (like an emergency room relocation happening within the hour), the interface goes further, showing a sticky flash banner accompanied by an audio chime, ensuring the message can't be casually scrolled past or missed.

6. Acknowledgment & Proof of Reach

For notices that matter  an urgent class relocation, a mandatory policy change — publishers can require acknowledgment. Students see a clear "Acknowledge" action, and each tap is recorded and instantly reflected back to the publisher as a live, ticking counter. This gives CRs and faculty something group chats never could: verifiable confirmation that their message was actually seen and understood by their audience, not just sent into the void.

7. Bookmarking & Calendar Export

Students can bookmark any announcement to revisit it later  useful for notices with information they'll need again but don't want to act on immediately. For any announcement with an attached deadline, they can also export it directly as a .ics calendar file, which drops straight into Google Calendar, Apple Calendar, or Outlook. This closes the loop between "seeing" an announcement and actually acting on it, without relying on memory or manual note-taking.

8. Morning Digest

Finally, each day, the platform compiles a personalized digest for every user; summarizing any critical alerts, deadlines coming up within the next 72 hours, and highlights from their preferred topics and department. This acts as a safety net: even if someone missed a live notification or wasn't online when something was scheduled to go live, their morning digest ensures they still get a complete, condensed picture of everything relevant to them.
### Overview

Describe your proposed solution.

### How It Works

Explain the complete flow of your system.

1.
2.
3.

---

## 🏗️ Architecture

campus-hub/
│
├── app.py          # Flask backend
├── announcements.db # SQLite database (auto-created)
├── templates/
│   └── index.html  # Frontend UI
└── static/
    └── style.css   # Basic styling


Add your architecture diagram here.
Demo diagram added down below

```text
User
  │
  ▼
Frontend
  │
  ▼
Backend / API
  │
  ├── Database
  │
  └── External Services
```

<b>Forkathon: Freshers Hackathon 2026 presented by ForkedArch powered by XtendArena</b>
