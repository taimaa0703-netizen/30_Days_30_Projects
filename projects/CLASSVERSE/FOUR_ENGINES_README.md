# CLASSVERSE Four Engines — Arabic-first experience

Open `/worlds.html` to explore ARENA, QUEST, ESCAPE, and LAB in Arabic, Hebrew, and English.

- ARENA links to the existing live multiplayer experience; existing server and socket implementation are unchanged.
- QUEST links to the existing Neon-backed teacher Quest Studio; the new sample journey button prepopulates five learning missions in the selected language, ready for teacher review and saving.
- ESCAPE and LAB are playable, localized **front-end demonstrations**; they are not yet persistent multiplayer engines.
- Energy Expedition is a five-stage interactive sample with answers, explanations, XP, and progress during the browser session.
- No .env, credentials, Clerk configuration, or Neon connection strings are included or changed.

## Installation
Back up your existing CLASSVERSE directory first. Merge the CLASSVERSE directory from this ZIP into the existing project, preserving your `.env`. Run `npm.cmd test`, then `node --env-file=.env server.js` from inside the CLASSVERSE directory.

## Before selling to schools
Finish multiplayer Quest/Escape/Lab server-side progression, student identity/privacy design, teacher analytics, accessibility and load/security testing. These demos are not yet a complete school-ready commercial offering.
