# PACKED. — Day 18 | 30 Days • 30 Projects

A self-contained, responsive travel packing planner for GitHub Pages.

## Features
- English / Hebrew / Arabic UI, with RTL support
- Photo-led Mediterranean landing hero with translated shortcuts to trip planning and the interactive suitcase
- Trip details, weather and activities (weather is entered manually)
- Rule-based suggested packing list, with editable item quantity/weight/volume
- Visual CSS suitcase with 8 compartments; drag-and-drop items or click compartments; auto arrange
- Local item-specific SVG illustrations in a Mediterranean boutique style, matched from stable item names with category-based fallbacks
- Click a packed item's illustration to reveal + / - quantity controls for every item in that compartment (1-99 units); weight, volume, and local storage update automatically
- Weight and volume estimates, packing progress, essential-item reminders and weight rescue suggestions
- Simple outfit combinations, trip summary, return-trip checklist
- Browser localStorage, JSON backup/import, CSV export, browser Print / Save as PDF
- No accounts, API, backend, or database. Fonts use an optional Google Fonts CDN; system font fallbacks work offline.

## Install / Publish
Copy the complete `PACKED` folder into `projects/PACKED` in your GitHub Pages repository. Keep the local hero image, item-art CSS, JavaScript, and SVG sprite alongside `index.html`.

```powershell
git add projects/PACKED
git commit -m "Add PACKED travel planner"
git push origin main
```

Open `index.html` locally to test. On GitHub Pages, the URL is `/projects/PACKED/` under your site.

## Notes
- Weight and volume values are rough editable estimates, not precise packing geometry or airline allowances.
- The suitcase compartments are a visual organizational simulation, not a physical collision/fit engine.
- A browser-only app cannot automatically fetch weather, sync across devices, or share live edits.
- Data stays in the current browser unless exported as JSON.
- Generated clothing combinations are simple rule-based pairings, not style recommendations.
