# CLASSVERSE — DAY 15 / 30

A real-time, multilingual (English / Hebrew / Arabic) interactive classroom adventure. No camera needed.

## Features
- Responsive multilingual home, teacher, student, and Explore Games experiences.
- Ready-to-play subject packs for space, science, math, language arts, and history.
- Teacher creates a live classroom and shares a six-character room code or invitation URL.
- Students join from separate phones/computers with nicknames and avatars, no student accounts.
- Four themed worlds, live multiple-choice challenges, points and answer reveals.
- Students propose their own challenges; teacher approves before publishing.
- Live story choice voting, surprise events, and end-of-lesson celebration.
- RTL-aware Hebrew and Arabic UI, responsive mobile design.

## Run on Windows PowerShell (VS Code)

```powershell
cd C:\Users\salsa\OneDrive\Desktop\30_Days_30_Projects\projects\CLASSVERSE
npm.cmd install
npm.cmd start
```

Open **http://localhost:3000** in your browser. For local two-device testing, both devices must reach the same server (for example, via a deployed public URL).

## Deploy

This is a **Node.js + Socket.IO server**, not a static website. **Do not** publish the `public/` folder alone to Netlify or GitHub Pages: the live classroom will not work.

### Deploy to Render

The repository includes a Render Blueprint at its root. Use the button below to connect this GitHub repository and create the free `classverse-day15` web service:

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https%3A%2F%2Fgithub.com%2Ftaimaa0703-netizen%2F30_Days_30_Projects)

Render builds from `projects/CLASSVERSE`, runs `npm ci --omit=dev` and `npm start`, and checks `/health`. Once the first deployment succeeds, open the service's `onrender.com` URL and share that URL with teachers and students. Both roles need to connect to the same service.

The free Render instance may sleep when idle, so the first connection after inactivity can take a little time. Classroom rooms are held in memory and are cleared if the service restarts; this prototype is not intended for sensitive student information.

Render is the service that hosts the app; its name in `render.yaml` and this deployment guide is configuration, not part of the classroom game. The JavaScript `render()` function only redraws the page and is unrelated to Render hosting.

## Configuration

Copy `.env.example` to `.env` (never commit it) and run with `node --env-file=.env server.js`.

| Variable | Purpose |
|---|---|
| `PORT` | HTTP port (hosts like Render set it automatically). |
| `TRUST_PROXY` | Set to `1` behind a hosting proxy so rate limiting sees real client IPs. |
| `ROOM_TTL_HOURS` | Hours before an idle classroom is deleted (default 6). |
| `ALLOWED_ORIGINS` | Optional comma-separated origins allowed for Socket.IO cross-origin use. |

| `CLERK_PUBLISHABLE_KEY` / `CLERK_SECRET_KEY` | Clerk dashboard → API Keys. Enable **Email** and **Google** under User & Authentication. |
| `DATABASE_URL` | Neon connection string (`sslmode=require`). Tables are created automatically on start. |
| `ALLOW_ANONYMOUS_TEACHER` | Dev only: lets teachers host without Clerk. Never in production. |

Without Clerk/Neon the Teacher Studio shows a setup guide listing the missing variables; nothing is faked. Teacher Studio, My Games, drafts, published games, favorites and profile require sign-in; games have an owner and a visibility (private / unlisted via `?game=ID` link / public in the community library); only the owner can edit or delete. The automated tests use a fake token verifier and `pg-mem`, so real Clerk and Neon are **not** exercised until you supply credentials.

## Tests

```powershell
npm.cmd test
```

Runs real Socket.IO and HTTP tests against the server: a full game (join, answer, reveal, results, badges), moderation, kick, reconnect via token, no answer/upcoming-question leaks to students or the projector, security headers, QR validation, JSON 404s, and the adventure grading engine.

## Results, privacy and moderation

- Teacher results: participants, per-question accuracy, difficult questions (< 60 %), class progress, team performance, a topic to review, and a downloadable CSV.
- Student results: personal score, rank, accuracy, encouraging feedback, achievements and a celebration screen.
- Minors: students use only a nickname and avatar; no accounts, no personal data, nothing written to disk, rooms auto-expire, no third-party requests (no external fonts or analytics). A notice is shown on the join form. Teachers can remove any student.
- Student-submitted questions are visible only to the teacher until approved. There is no profanity filter, so the teacher must review them.

## Deploying (Render)

1. Commit and push (see below).
2. In Render choose **New → Blueprint** and select the repository. `render.yaml` sets `rootDir: projects/CLASSVERSE`, `npm ci --omit=dev`, `npm start` and the `/health` check.
3. Add `TRUST_PROXY=1` if it is not already present.
4. Run **one instance only**: rooms live in memory. Scaling out needs sticky sessions plus a Socket.IO adapter.
5. Open the `onrender.com` URL; the same server serves the frontend and the sockets. Netlify, Vercel and GitHub Pages cannot host the Socket.IO backend.

## Publishing changes with Git

```powershell
cd C:\Users\salsa\OneDrive\Desktop\30_Days_30_Projects
git status
git add projects/CLASSVERSE
git status            # confirm no .env or node_modules is staged
git commit -m "CLASSVERSE: results, moderation, reconnect, security and deployment prep"
git push origin HEAD
```

## Feature checklist

**Fully working:** live quiz multiplayer (teacher, student, projector in sync), 3-language UI with RTL/LTR, room code and QR join, server-controlled timer and scoring, teacher results and CSV, student results and achievements, moderation of student questions, student removal, reconnect during a game, security headers, rate limiting, room expiry, automated tests.

**Partially implemented:** Adventure Mode (server engine and grading only, no playable UI or creator); team scoring (assignment and statistics only); question content is English only; the six-character room code is not digits-only.

**Implemented (code complete, needs credentials to run live):** Clerk sign-in/sign-up/sign-out, protected Teacher Studio, profile, My Games, drafts, published, favorites, community library, ownership and visibility, Neon persistence of games, sessions and results.

**Not implemented:** subject/grade browsing UI beyond the library search, pause/resume, speed-based scoring, profanity filter.

**Requires external configuration:** Clerk, Neon PostgreSQL, and a hosting account such as Render.

**Not verified:** projector timer auto-reveal, QR image display, fullscreen, sound and reduced-motion in a real browser; tablet and real-device projector testing; screen-reader testing.

## Demo

1. The teacher creates a classroom and shares the large room code or student join link.
2. Students open the link (or the app), enter the room code and a nickname, and join the lobby.
3. The teacher sees the live student list and presses **Start game** beside the first question.
4. Students answer on their own devices. The teacher sees response counts, reveals the answer, and presses **Next question**.
5. On the final question, the teacher presses **Show final scores**. To play again, create a new classroom.

## Try the platform foundation

1. Run `npm.cmd start` and open **http://localhost:3000**.
2. Explore the homepage and choose **Explore games**.
3. Open a subject card, preview it, and choose **Host this game**.
4. Create the classroom, copy its room code, and open its student join link in a second tab or device.
5. Join as a student, then return to the teacher screen to start a question, reveal the answer, and view the scores.

## Verify interface languages

Use the language selector in the header to switch between English, Hebrew, and Arabic. The selection is saved in the browser; reload the page to confirm it persists. Hebrew and Arabic use right-to-left layout, while room codes, answer labels, scores, and question-pack language remain left-to-right where appropriate. Game-pack questions are currently in English, regardless of the interface language.

For mobile verification, open the app in the browser's responsive device mode at approximately 390 px wide and repeat the language-switching and game-joining steps.

## Projector Mode

Run (Windows PowerShell):

```powershell
cd projects\CLASSVERSE
npm.cmd install
npm.cmd start
```

1. Open http://localhost:3000, go to Teacher Studio, and create a classroom.
2. In the **Projector** card on the teacher dashboard, click **Open projector window** (or open `/projector?code=ROOMCODE`). Choose a question timer (off, 10, 20, 30, or 60 s) there too.
3. Join as a student in another window. The projector shows the PIN, QR code, student count, countdown, answers received, class progress, animated reveal, results, and final leaderboard, all driven live by Socket.IO.
4. The projector never receives the correct answer until the teacher reveals it (or the timer ends). It has its own language selector, Fullscreen, Mute, and Reduced-motion controls (saved in the browser).

**Moving the projector to a second display:** connect the screen and press `Win+P` → *Extend*. Drag the projector window onto the second display (or press `Win+Shift+→`), then click **Fullscreen** or press `F11`. Keep the teacher dashboard on your own screen.
