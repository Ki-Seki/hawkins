# Hawkins

An interactive spatio-temporal map of Hawkins, Indiana from _Stranger Things_ — explore key moments from Season 1 on an animated SVG map.

**[View Live Demo →](https://ki-seki.github.io/hawkins/)**

## Features

- **21 Key Moments** from Season 1 (The Vanishing of Will Byers → The Upside Down)
- **Interactive SVG Map** with location and character markers
- **Timeline Scrubber** with episode navigation and auto-play
- **Character & Location Details** with side-panel cards
- **Upside Down Intro Animation** with iris reveal effect
- **Atmospheric Effects** — film grain, vignette, scanlines, themed overlays
- **Responsive Markers** with emphasis animations based on narrative importance
- **Zero Runtime Requests** — all data statically imported from JSON

## Tech Stack

- **React 18** + **TypeScript 5** + **Vite 5**
- **Framer Motion 11** for animations
- **Zustand 5** for state management
- **Tailwind CSS 3** for styling
- **Zod 3** for data validation (dev-time)
- **ITC Benguiat Std** display font + **IBM Plex Mono**

## Quick Start

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:5173/hawkins/)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── data/
│   ├── characters.json       # Character profiles
│   ├── locations.json        # Map locations with coordinates
│   ├── episodes.json         # Season 1 episode index
│   ├── events.json           # Major story events
│   ├── moments.json          # Timeline nodes (story facts)
│   ├── moment-states.json    # Visual states per moment
│   ├── map-layout.json       # Map metadata
│   └── catalog.ts            # TypeScript types + Zod schemas + data index
├── components/
│   ├── Map.tsx               # Main SVG map + markers + overlays
│   ├── Timeline.tsx          # Bottom timeline scrubber
│   └── InfoCard.tsx          # Right-side detail panel
├── store.ts                  # Zustand store + timeline hooks
├── App.tsx                   # Main app + intro animation
└── index.css                 # Atmospheric CSS effects

public/
├── map.svg                   # Hawkins base map (1200×800)
├── images/
│   ├── characters/           # Character avatars (8 files)
│   └── locations/            # Location images (placeholder)
└── fonts/                    # ITC Benguiat OTF files
```

## Architecture

> **Data (JSON) → Types (TypeScript/Zod) → State (Zustand) → UI (React + SVG + Framer Motion)**

### Key Design Decisions

1. **Story vs. Visuals Separation**: `moments.json` describes _what happened_, `moment-states.json` describes _how the map looks_
2. **ID-based References**: All entities reference each other by kebab-case IDs (never nested)
3. **Percentage Coordinates**: Map locations use 0–100 coordinates (not pixels)
4. **Static-Only**: No backend, no runtime fetch — just build-time imports

## Data Guidelines

- **IDs**: kebab-case (e.g., `"eleven"`, `"hawkins-lab"`, `"s01e01"`)
- **Moments**: ID format `s{SS}e{EE}-{slug}`, sortKey format `SSEEII`
- **All UI text in English** (per project design spec)
- See `.github/copilot-instructions.md` for full data conventions

## Development

```bash
# Type checking
npm run typecheck

# Linting
npm run lint
npm run lint:fix
```

## Deployment

Automatically deploys to GitHub Pages on push to `main` via `.github/workflows/deploy.yml`.

## References

- [Stranger Things Wiki (Fandom)](https://strangerthings.fandom.com/wiki/Stranger_Things_Wiki)
- [IMDB](https://www.imdb.com/title/tt4574334/)
- [Wikipedia](https://en.wikipedia.org/wiki/Stranger_Things)

## License

[MIT](./LICENSE) — Code is open source. _Stranger Things_ content is © Netflix and original creators. This is a non-commercial fan project.
