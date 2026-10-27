# TENANT DESK — Property Care Platform

Open index.html through VS Code Live Server. Supports English/Hebrew/Arabic with layout-safe RTL.
Features: edit/create/delete maintenance requests, assign properties and vendors, statuses, priorities, deadlines, estimated costs, images before/after, property-specific history, CSV import/export, demo reset, demo property and vendor creation, filters, local persistence.
Import a CSV exported by Tenant Desk (`ID,Title,Property,Unit,Tenant,Category,Priority,Status,Vendor,Due,Cost,Created,Updated,Notes`). Existing request IDs are updated and new IDs are added. Properties and vendors must already exist in the demo data. Use **Reset demo** to restore the original sample data; this replaces the saved properties, vendors, and requests.
Images: local browser storage only; stay below 1 MB per file (storage limit depends on browser). No accounts or multi-device synchronization; role switch is visual only, NOT secure tenant/landlord access control. Do not enter real tenant personal information unless a secure backend and access controls are added.
