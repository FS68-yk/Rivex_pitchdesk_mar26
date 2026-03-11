# RIVEX Deployment Operations

## Canonical repository and files

This repo is the **operational source** for the current `rivex.fund` deployment flow.

### Production site
- Netlify site: `rivex-whitepaper`
- Custom domain: `https://rivex.fund`

### Canonical files
- `index.html`
  - Root login page served at `/`
- `index_rivex_pitchbook.html`
  - **Single source of truth** for the protected deck served at `/deck`
- `netlify/functions/deck.js`
  - Reads `../../index_rivex_pitchbook.html` directly

## Important rule

Do **not** maintain a second deck source under `netlify/functions/_protected/deck.html`.
That caused version drift before: the repo had a newer pitchbook file, while production `/deck` still served an older protected copy.

## Correct editing workflow

### If you want to change the investor deck
Edit:
- `index_rivex_pitchbook.html`

Do not edit:
- `index.html` (unless you are changing the login page)
- `netlify/functions/deck.js` (unless you are changing access logic)

### If you want to change the login page
Edit:
- `index.html`

### If you want to change admin / access behavior
Edit under:
- `netlify/functions/`

## Repository map

### Active / relevant
- `Rivex_pitchdesk_mar26`
  - Current operational repo containing:
    - login page
    - protected deck source
    - Netlify functions for access/admin/deck
  - Currently used to deploy the live `rivex.fund` site via Netlify CLI

### Historical / legacy / reference only
- `RIVEX-whitepaper`
  - Legacy whitepaper/content repo
  - Matches the Netlify site name more closely, but is **not** currently the operational source used for the live protected deck flow
- `Riv.cash`
  - Separate product/site repo for RIV.Cash
- `riv.cash`
  - Beta/alternate repo for RIV.Cash

## Recommended future migration

If you want perfect naming consistency, migrate the current operational codebase into `RIVEX-whitepaper` and deploy from there.
Until that migration is done, treat `Rivex_pitchdesk_mar26` as the one real source for live edits.
