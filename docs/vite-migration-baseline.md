# Vite Migration Baseline

## Current Entry Files

- `index.html`
- `style-explore.css?v=117`
- `motion.js?v=4`
- `intro.js?v=133`

## Preserved Behaviour

- Existing DOM structure is the baseline.
- Existing `assets/...` paths in HTML and JavaScript are the baseline.
- Existing localStorage keys are preserved.
- Existing debug hooks on `window` are preserved.

## How To Open The Migrated Version

- Do not double-click `index.html` after the Vite migration.
- Open the game through the Vite server instead.
- Non-technical option: double-click `開啟遊戲.command`.
- Terminal option: run `npm run dev`, then open `http://localhost:5173/`.

## Migration Risk Notes

- `intro.js` is large and should be moved before it is modularised.
- The first Vite pass should focus on build/deploy success, not code splitting.
- CSS asset URLs need root-based `/assets/...` paths after the stylesheet is imported from `src/main.js`.
- Research logging should be added behind one small helper rather than scattered through the game.
