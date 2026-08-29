# HER Blueprint — Raffle Draw

A polished, browser-only raffle draw interface for the HER Blueprint exclusive training event. The app is designed for a live room: operators can add participants, draw one or more winners, undo the last draw, reset the winner register, and export the final list as CSV.

## Included

- Manual participant entry, bulk paste, and CSV/TXT/PDF import.
- Browser-only PDF text extraction through pdf.js.
- Case-insensitive de-duplication and filtering of common CSV header or row-number lines.
- Optional repeat-winner mode.
- Animated slot-style winner reveal with restrained celebration effects.
- Local storage persistence for entries and winners across refreshes.
- Keyboard-visible focus states, accessible labels, responsive mobile layout, and reduced-motion support.

## Local development

```bash
pnpm install
pnpm dev
```

The development server runs at `http://localhost:3000` by default.

## Production build

```bash
pnpm run check
pnpm run build
```

The static browser bundle is written to `dist/public` by the template build. The repository includes `vercel.json` with the matching build and output settings.

## Vercel

Import the GitHub repository into [Vercel](https://vercel.com/new). The included configuration uses the Vite build command and publishes `dist/public`; no environment variables or backend service are required for the raffle logic.

## Design direction

The interface follows the **Velvet Ledger** system: contemporary editorial luxury, espresso-black atmosphere, champagne action color, ivory display type, and an asymmetric setup rail beside the draw stage. `ideas.md` records the design decisions that should guide future changes.
