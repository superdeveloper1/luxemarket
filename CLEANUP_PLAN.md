# LuxeMarket Cleanup Plan

## Current Structure Issues
1. **Triple duplication**: Root, `/luxemarket/`, and `/luxemarket/luxemarket-vite/`
2. **Active app**: Only `/luxemarket/luxemarket-vite/` is the working Vite React app
3. **Lots of test/debug files** scattered everywhere

## Files to DELETE (Safe to Remove)

### Root Directory - Delete ALL except:
- Keep: `README.md`, `.nojekyll` (for GitHub Pages)
- Delete: All HTML files, JS files, test files (40+ files)

### /luxemarket/ Directory - Delete duplicates:
- Delete: All HTML files (admin, checkout, index variants, debug files)
- Delete: All test files (test_*.js, verify_data.js)
- Delete: Duplicate folders: `/components/`, `/utils/`, `/pages/`, `/hooks/`, `/core/`
- Delete: `/portfolio-assets/` (duplicate)
- Delete: `/trickle/` (duplicate)
- Keep: `/luxemarket-vite/` (THE ACTUAL APP)

### Root level duplicates to DELETE:
- `/components/` - duplicate of Vite components
- `/utils/` - duplicate of Vite utils
- `/trickle/` - duplicate
- `/portfolio-assets/` - duplicate

## What to KEEP

### Essential Files:
```
/
├── .nojekyll (GitHub Pages)
├── README.md (documentation)
└── luxemarket/
    └── luxemarket-vite/  (THE ACTUAL APP - KEEP EVERYTHING)
        ├── src/
        ├── public/
        ├── package.json
        ├── vite.config.js
        └── ... (all Vite app files)
```

## Cleanup Actions

### Phase 1: Delete root duplicates (40+ files)
- All HTML files in root
- All JS test files in root
- /components/, /utils/, /trickle/, /portfolio-assets/ folders

### Phase 2: Clean /luxemarket/ directory
- All HTML files
- All test JS files
- Duplicate folders

### Phase 3: Clean /luxemarket/luxemarket-vite/
- Delete test HTML files (debug-*.html, test-*.html)
- Keep only: index.html, package.json, vite.config.js, src/, public/

## Result
- From ~100+ files → ~30 essential files
- Single source of truth: `/luxemarket/luxemarket-vite/`
- Much cleaner, easier to maintain
