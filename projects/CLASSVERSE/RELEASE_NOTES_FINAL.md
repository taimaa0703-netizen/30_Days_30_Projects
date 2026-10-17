# CLASSVERSE — Integrated Pilot Build

## Included
- ARENA: existing real-time PIN quiz system.
- QUEST: existing Neon-backed, Clerk-authenticated teacher Quest Studio.
- ESCAPE and LAB: existing interactive multilingual demos on worlds.html.
- ACADEMY: new Arabic/Hebrew/English interactive learning journeys across three subjects, 15 activities including decisions, puzzles, final challenges and reflections.
- Responsive dark-teal/gold UI, browser-local student progress, and per-world completion summary.

## Important limitations before selling to schools
This is a **pilot build, not a production-ready school SaaS**. Academy progress is browser-local and **not linked to student identities, Neon, teacher analytics or classes**. The new Academy is separate from teacher-authored Quest Studio. Real school tenancy, roles, privacy assessment, accessibility audit, backup/restore tests, end-to-end security tests, and live multiplayer testing remain necessary. Do not collect student personal data in the pilot.

## Install safely
Back up your existing CLASSVERSE directory. Extract and merge this folder into your existing project. Never overwrite your local .env. No .env is included. No Clerk or Neon keys or apps need recreating. From CLASSVERSE: npm install, then node --env-file=.env server.js. Open http://localhost:3000/worlds.html and /academy.html.

## Notes
Database schema in db.js uses CREATE TABLE IF NOT EXISTS and does not drop tables. Always back up the database before changing a live deployment.
