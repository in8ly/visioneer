# Visioneer ✨

**A sacred collection of coded vision for the Brahma Kumaris Sr Shivani tour.**  
This repository is designed to assist souls in rediscovering their own inner freedom through digital lightwork, spiritual geometry, and intentional design.

## 🌐 Purpose

This project serves as a digital mandala—a portal of remembrance, clarity, and empowerment. It is a living archive of visual, interactive, and energetic tools aligned with the teachings of Sr Shivani and the Brahma Kumaris.

## 🔮 Features

- Chakra-aligned SVG animations
- Starfield backgrounds and cosmic themes
- Bioregional mapping and figure-8 portals
- AI-generated poetic transmissions
- Responsive design for mobile and desktop

## 🛠️ Tech Stack

- HTML / CSS / JS
- VS Code
- GitHub
- Vercel (for deployment)

### Cache Busting Assets

When updating SVGs, CSS, or JS files, append a simple version query string to force browsers (and Vercel edge caches) to fetch the latest copy:

Example:
```
<object data="assets/diamond-unified.svg?v=20250813-3" type="image/svg+xml"></object>
<link rel="stylesheet" href="styles.css?v=20250812">
<script src="script.js?v=20250812"></script>
```

Increment the trailing value (date-based or a simple counter) whenever you change the file. This avoids users seeing stale cached visuals while keeping filenames stable.

Convention used here: `?v=YYYYMMDD[-optional-increment]`.

### Version Helper Script

To automate bumping all asset version query strings across HTML files, use the provided Node script:

```
node bump-version.js            # bump to today (auto-increment if already today)
node bump-version.js --dry-run  # preview changes
node bump-version.js --force    # reset today’s references to no suffix
node bump-version.js --date 20250813  # bump using a specific date
```

Add new asset paths to the `assetPatterns` array in `bump-version.js` if needed.

## 🕊️ Intention

To offer a space of stillness, beauty, and truth  
To support the Sr Shivani tour with digital infrastructure  
To remind each visitor of their own divine sovereignty

## 📜 License

This project is offered freely in the spirit of service.  
You may remix, reuse, and share with attribution.

---

*Created with love by C.D.Good (in8ly)*  
*2025 · Vancouver, BC · part of the Final Participation art series*
