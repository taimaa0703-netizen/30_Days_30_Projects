# SCHOOL SIGNAL — Connected School Life

Day 29 · 30 Days / 30 Projects

A responsive, trilingual, browser-only EdTech demonstration with three connected experiences: Student, Parent, and Teacher.

## Start

1. Unzip the archive.
2. Open the `school-signal` folder in VS Code.
3. Launch `index.html` using the **Live Server** extension or `python -m http.server 8000` from this folder, then open `http://localhost:8000`.
4. To publish: push this folder's contents to a GitHub repository, then enable GitHub Pages from the root of the deployment branch. Relative file paths work from project subdirectories.

An ES-module-capable browser and local HTTP server are recommended. No build command, account, API key, or database is required. Google Fonts are optional; system-font fallbacks work offline.

## Demo workflow

- Start as Teacher **Maya Haddad**. She teaches mathematics in 4A, 4B, and 5A. Publish homework to 4A, select a due date and optional supplies.
- Use **Switch role** and choose Student **Adam** (4A). The newly published assignment will be visible; check it as completed. Tick off bag supplies.
- Switch to Parent **Dana**, who has Adam (4A) and Lina (2A). See Adam's changes, then switch to Lina to observe independent data.
- In Parent mode, open **Shared family progress** on the home page or the **My progress** navigation item to see each linked child's homework completion and school-bag packing progress. Student activity updates the same browser-stored progress the parent sees.
- In Teacher mode, edit/delete a published update or change a class lesson. Related views and timetable-derived packing recommendations will update.
- Use Arabic, Hebrew, or English at any time. The layout stays in the same physical order while text uses appropriate RTL/LTR direction.
- Use Settings → Reset sample data to return to the initial dataset.
- Use Settings → Remove demo data to clear the sample school and start with your own school name, classes, teachers, students, and parents. This replaces the data saved in this browser; it cannot be undone. The setup page also lets you restore the sample demo.

## Architecture

- `index.html`: semantic app host.
- `css/style.css`: responsive design, accessible states and motion preferences.
- `js/data.js`: generated sample school, classes, teachers, lessons, updates; browser persistence.
- `css/setup.css`: custom-school setup layout and no-demo display state.
- `js/i18n.js`: Arabic (local colloquial), Hebrew and English translations.
- `js/app.js`: shared data selectors, role-specific views, navigation, editing and interaction handlers.
- `assets/`: reserved for future locally hosted assets.

State is stored in `localStorage` under `school-signal-v1`, and role/view selection is saved for the current browser tab. This demonstrates connected screens only **in the same browser and origin**. There is no cross-device sync, authentication, private user accounts, file upload or secure server.

## Safety and production limitations

**This is a functional prototype, not a production-ready student information system.** The local demo role selector is expressly *not authentication*. Anyone with access to the same browser storage can view/edit demo records. Never enter real student names, personal records or private class communications.

Before real use, add a server-backed datastore, verified parent/student/teacher identity, row-level authorization, private storage, audit logs, deletion and retention rules, privacy-compliant parental consent and appropriate security assessments. Server-enforced membership is required to prevent unauthorized access; client-side class guards are only for demo consistency. Additional production work includes accessibility audit, real-device testing, attachment storage, notifications delivery, and multi-user concurrency rules.

## Notes

- No 3D objects, emojis, stock photography, third-party accounts or external data services.
- Today/tomorrow is based on the device's local date. Friday/Saturday can show fewer lessons, consistent with demo schedule.
- A teacher can edit only updates with their assigned teacher ID and a class/subject in their assignments; these checks are **not a security boundary**.
- Teacher form records can be independently published to multiple assigned classes, with a shared `groupId` for traceability.
- Assignments use a single update per class; completion is keyed by student + update ID.
- Packing recommendations are derived from timetable subjects and upcoming update supplies. Personal bag items and checkmarks persist per date and student.
- User-created update titles and supply names remain in the language entered; they are not automatically translated. The UI itself has complete dictionaries.
