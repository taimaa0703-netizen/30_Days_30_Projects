# CLASSVERSE — DAY 15 / 30

A real-time, multilingual (English / Hebrew / Arabic) interactive classroom adventure. No camera needed.

## Features
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

## Notes for a real school launch

This is a prototype, not a production school platform. Room state lives in server memory and is lost on restart. Rooms are not automatically cleaned up. Student connections and points reset if their browser disconnects. The teacher token is stored in sessionStorage, so treat teacher links/browser sessions as private. For production add teacher authentication, persistent database, moderation and abuse prevention, rate limiting, privacy/consent review, and accessibility testing. Do not collect student personal data.

## Demo

1. Start server, choose Teacher, create a classroom.
2. Open another tab (or device using the deployed URL), choose Student, enter room code and nickname.
3. Teacher launches question; student answers; teacher reveals answer.
4. Student submits a new challenge; teacher approves and launches it.
5. Teacher activates a surprise, opens story vote, then ends the mission.
