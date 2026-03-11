# Rivex.fund Operations Repo

This repository is the **current operational source** for the live `rivex.fund` site.

## What this repo controls

### Root login page
- File: `index.html`
- Live route: `/`

### Protected investor deck
- File: `index_rivex_pitchbook.html`
- Live route: `/deck`
- Netlify function: `netlify/functions/deck.js`
- Important: `/deck` reads `index_rivex_pitchbook.html` directly.

### Admin / access system
- Folder: `netlify/functions/`
- Includes:
  - access validation
  - session/logout
  - admin login
  - admin analytics
  - access code management

## Production mapping

- Netlify site name: `rivex-whitepaper`
- Production domain: `https://rivex.fund`
- This repo is deployed to that site via Netlify CLI / production deploy.

## Canonical editing rules

### If you want to change the investor deck
Edit:
- `index_rivex_pitchbook.html`

Do not create a second protected deck copy.

### If you want to change the login page
Edit:
- `index.html`

### If you want to change access or admin behavior
Edit:
- `netlify/functions/*`

## Repo boundaries

### Active / operational
- This repo: `Rivex_pitchdesk_mar26`

### Legacy / reference only
- `RIVEX-whitepaper`
  - historical whitepaper/content repo
  - not the current live operational source for the gated deck flow

## Notes

See `OPERATIONS.md` for the deployment logic and anti-drift rules.
