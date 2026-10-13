# CARECODE. — Day 12 / 30
A polished, static care-label decoder with English, Hebrew and colloquial Arabic translations. No backend, no API keys, no build steps.

## Run
Open `index.html` in a browser (or with VS Code Live Server).

## Add to your 30 Days • 30 Projects site
The project is published in `projects/CARECODE_Day12/`. Its entry in the **main site's** projects array in the root `script.js` is:

```js
{
  day: 12,
  name: "CARECODE.",
  description: "Decode clothing-care symbols and save easy instructions for your favorite pieces.",
  tags: ["HTML", "CSS", "JavaScript", "Lifestyle"],
  link: "projects/CARECODE_Day12/",
  unlocked: true
},
```

Publish from the repository root:

```powershell
git add script.js projects/CARECODE_Day12/
git commit -m "Day 12 - Publish CARECODE"
git push origin main
```

## Notes
- Choosing a different language changes text and text direction inside content blocks, but does **not** flip the entire page layout.
- Select up to one symbol per category; save garments locally in `localStorage`.
- Care symbols have nuances; always defer to the garment manufacturer's label. The illustrations are simplified and aren't a replacement for standards-based symbol artwork.
- The fonts load from Google Fonts when online, with built-in fallback fonts offline.
