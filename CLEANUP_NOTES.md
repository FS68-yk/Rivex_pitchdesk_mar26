# Cleanup Notes

This file records what should be cleaned up next, without deleting anything prematurely.

## Keep
- `index.html` — production login page
- `index_rivex_pitchbook.html` — single source of truth for the protected deck
- `netlify.toml`
- `netlify/functions/`
- `assets/` (verify actual live usage before pruning)
- `package.json`
- `package-lock.json`
- `README.md`
- `OPERATIONS.md`

## High-risk items that caused confusion before
- `netlify/functions/_protected/deck.html`
  - historical protected deck copy
  - should be removed after confirming production no longer depends on it
- `.netlify/`
  - local state only, should stay ignored

## Root-level loose files to review before deletion
- `image_1.jpg`
- `image_2.png`
- `image_4.jpg`
- `image_5.jpg`
- `image_6.jpg`
- `image_7.jpg`

These should either:
1. be moved into `assets/` with clear naming, or
2. be deleted if no longer referenced.

## Historical / suspect files already seen in git state
- `index_optimized_v2.html`
- `image_2.jpg`
- `image_3.jpg`
- `image_8.jpg`

Review references before final deletion.
