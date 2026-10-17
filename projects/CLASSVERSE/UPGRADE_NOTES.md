# CLASSVERSE — Universe UI update

- New homepage `/` with interactive floating islands; existing Arena moved to `/arena.html` (same scripts, Clerk and Neon integrations).
- Three playable prebuilt learning journeys in `/academy.html?world=science|math|language` (5 missions each).
- `/quest-studio.html` unchanged, including its existing API and Neon persistence.
- Existing server, database, auth and `.env` settings unchanged. No `.env` is included.
- Progress for Academy games remains local browser storage; not yet a school-grade analytics system.
- Live Arena remains existing implementation; multiplayer and login require running server.
- **Installation:** backup current CLASSVERSE, copy these files over it without deleting `.env`; run `npm.cmd install` and `node --env-file=.env server.js`.
- Browser cache: Ctrl+Shift+R if the previous homepage persists.
