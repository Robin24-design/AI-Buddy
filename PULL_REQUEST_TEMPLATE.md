# Enable dark theme by default

This PR forces the Tailwind CSS dark theme site-wide and updates the app entry path.

What changed
- Added `document.documentElement.classList.add('dark')` in `main.jsx` to enable the dark color theme.
- Updated `index.html` to reference `/main.jsx` as the module entry.

Why
- The project includes a full dark theme via CSS variables; forcing the dark class makes the UI use the dark color tokens by default.

Follow-up work (planned on this branch)
1. Run lint/typecheck/build locally or in CI and collect logs.
2. Apply ESLint auto-fixes and manual fixes for remaining lint/type/build errors.
3. Re-run checks and push follow-up commits to this branch until CI passes.

Testing instructions
1. Checkout this branch locally:
   - git fetch origin
   - git checkout fix/all-errors-20260825
2. Install dependencies: `npm ci`
3. Run the dev server: `npm run dev`
4. Open the app in your browser — the dark theme should be active by default.

If you prefer a theme toggle rather than forcing dark, I can implement a persisted toggle in a follow-up commit.
