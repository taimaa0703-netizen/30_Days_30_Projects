# CLASSVERSE Quest Studio — upgrade notes

This is an **upgrade to the existing CLASSVERSE project**, not a new project. The ZIP intentionally excludes `.env`, secrets, and `node_modules`. Keep the existing `.env` and database. Never copy `.env.example` over `.env`.

## Installation on Windows

1. Back up the entire `projects/CLASSVERSE` folder first.
2. Extract the `CLASSVERSE` folder from this ZIP **into** `30_Days_30_Projects/projects/`, merging files with the existing `CLASSVERSE` folder. Do not delete the existing folder first.
3. In VS Code, open the existing `projects/CLASSVERSE` directory.
4. Run `npm.cmd test` (10 tests passed in the development environment).
5. Stop any old server using port 3000, then run `node --env-file=.env server.js`.
6. Open `http://localhost:3000`, sign in with the **existing** Clerk account, then click the `Quest Studio` link or open `http://localhost:3000/quest-studio.html`.

On server startup, `DB.init()` automatically creates `learning_quests` in the **existing** Neon database using `CREATE TABLE IF NOT EXISTS`; existing tables are not dropped.

## Included

- Teacher-owned quest creation/editing/listing/deletion stored in Neon.
- Mission objectives, minimum pass percentage, four-option multiple-choice challenges, answer explanations.
- Language switching: Hebrew, Arabic, English; RTL/LTR layout.
- Preview map, draft/published status; authentication and owner checks enforced by the API.
- Existing games, rooms, Adventure engine, Clerk integration, Neon connection preserved.

## Not included yet

- Publishing a quest as a playable live room, student progress tracking, and gradebook reports. `published` currently means *ready in the teacher's private studio*, not public/student-accessible.
- Production security, load, accessibility and child privacy audits. These are required before selling to schools.

The ZIP contains no `.env` file and no Clerk or Neon credentials.
