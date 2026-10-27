# ORDER RESCUE — Exception Intelligence

Premium responsive ecommerce order exception command center.

## Run
Open `index.html` using VS Code Live Server, or deploy the three source files directly to GitHub Pages. No build, account, API, database, or server needed.

## Features
- English, Arabic and Hebrew translations with RTL handled per-language.
- Dashboard with unresolved exposure, overdue tasks and recovered/resolved order value.
- Full create/edit/delete workflow, ownership, statuses, deadline tracking and audit timeline.
- Search, filters, priority sorting, risk breakdown, owner load and highest-risk order views.
- CSV import/merge and CSV export, sample template. CSV fields: `orderId,customer,issue,amount,priority,status,owner,due,notes`.
- Persistent browser-local data (localStorage). Other devices do not share the data.

## Business metric definitions
Revenue at risk = total order amount for unresolved orders. This is **exposure**, not projected or confirmed lost profit. Recovered value = amount of orders explicitly marked resolved, not a confirmed financial recovery. Overdue = unresolved cases with due date before today's date.

## Security and privacy
This client-side project does not provide authenticated access or a shared database. Do not upload actual customer personal information or confidential order records to a publicly shared device. For real operational deployment, add a protected backend and role-based access.

## CSV imports
New orders are added; matching order IDs are overwritten. Existing orders absent in the file remain unchanged. Import only trusted datasets. Formula-like values are escaped on export to reduce spreadsheet formula injection risk.
