# Deal Finder BD — AI Deal Hunting Pipeline

## What is deal-finder

AI-powered Bangladeshi deal finder built on Claude Code: scans 60+ BD e-commerce sources, scores deals on a 4-axis system, and surfaces the best finds across Tech, Electronics, Fashion, Lifestyle, Home Appliances, and more.

Currency: BDT only. Market: Bangladesh only.

### Main Files

| File | Function |
|------|----------|
| `data/deals.md` | Running deal feed (all found deals) |
| `data/top-deals.md` | Curated top deals (score ≥ 4.0) |
| `data/watchlist.md` | Keywords/products being watched |
| `data/scan-history.tsv` | Scanner dedup history |
| `config/sources.yml` | All BD sources with metadata |
| `config/profile.yml` | User preferences, budgets, interests |
| `categories/*.yml` | Per-category sources, keywords, budgets, brands |
| `scripts/merge-deals.mjs` | Merge scan results into deals.md |
| `scripts/dedup-deals.mjs` | Remove duplicate deal entries |
| `scripts/verify-sources.mjs` | Health check: are sources still live |

---

## First Run — Onboarding (IMPORTANT)

**Before doing ANYTHING else, check if the system is set up.** Run these checks silently every time a session starts:

1. Does `config/profile.yml` exist?
2. Does `config/sources.yml` exist?

**If ANY of these is missing, enter onboarding mode.** Do NOT proceed with scans, searches, or any other mode until the basics are in place.

### Step 1: Profile (required)
If `config/profile.yml` is missing, copy from `templates/profile.example.yml` and ask:
> "I need a few details to set up your deal finder:
> - Your name and location (for delivery relevance)
> - Which categories interest you most? (Tech, Electronics, Fashion, Lifestyle, Home Appliances)
> - Your budget ranges per category
>
> I'll configure everything for you."

### Step 2: Sources (required)
If `config/sources.yml` is missing, copy from `templates/sources.example.yml`:
> "I've loaded 60+ curated BD e-commerce sources. Want me to adjust anything — add/remove sources, change trust tiers?"

### Step 3: Data files
Ensure `data/deals.md`, `data/top-deals.md`, and `data/watchlist.md` exist with headers.

### Step 4: Ready
> "You're all set! You can now:
> - Say 'scan' to search all sources for deals
> - Say 'find me [product]' to search on-demand
> - Say 'watch [product] under [price]' to add to your watchlist
> - Say 'top deals' to see the best current finds
> - Say 'compare [product]' to compare prices across sites"

---

## Skill Modes

| If the user... | Mode |
|----------------|------|
| Says "scan" or wants recurring check | `scan` |
| Says "find me X" or pastes product name | `search` |
| Says "compare" or pastes multiple links | `compare` |
| Asks "top deals" or "what's hot" | `top` |
| Says "watch X under Y" | `watch` |
| Asks about deal history or tracked deals | `tracker` |

---

## Scoring System — 4-Axis Weighted (5-point scale)

| Axis | Weight | What it measures |
|------|--------|-----------------|
| Discount depth | 35% | How significant the price cut is |
| Budget fit | 25% | Within user's set budget for that category |
| Source trust | 25% | Platform reliability tier (A/B/C) |
| Brand quality | 15% | Known brand vs generic/unbranded |

**Formula:** `score = (discount × 0.35) + (budget × 0.25) + (source × 0.25) + (brand × 0.15)`

### Thresholds
- **≥ 4.0** → Top Deal → auto-add to `top-deals.md`
- **3.0–3.9** → Good deal → shown in feed
- **< 3.0** → Low priority → shown but noted as low
- **< 2.0** → Not added to feed (noise)

### Discount Scoring

| Discount % | Score |
|-----------|-------|
| < 5% | 1.0 |
| 5–15% | 2.0 |
| 15–30% | 3.0 |
| 30–50% | 4.0 |
| > 50% | 5.0 (verify — could be fake) |

> **RULE:** Discounts above 70% auto-flag as `Suspicious`. Surface with warning, don't hide.

### Source Trust Tiers

| Tier | Score | Criteria |
|------|-------|----------|
| A | 5.0 | Verified, reliable, established |
| B | 3.5 | Generally good, occasional issues |
| C | 2.0 | Use with caution, verify before buying |

---

## Critical Rules

### Price Integrity
- **NEVER fabricate or estimate prices.** All prices must come from actual scraping.
- **NEVER hallucinate deals.** If a source can't be scraped, skip it and note the failure.

### Verification
- **ALWAYS use Playwright** to verify deals — navigate to URL + snapshot the page.
- Don't trust WebSearch/WebFetch for price or availability data.
- **Exception for batch mode (`claude -p`):** Use WebFetch as fallback, mark deal with `**Verification:** unconfirmed (batch mode)`.

### Dedup
- Same URL + same source + same price seen within 24 hours = skip.
- Check `data/scan-history.tsv` before adding any deal.
- After each scan batch, run `node scripts/merge-deals.mjs`.

### Staleness
- Deals older than 7 days without re-verification → auto-mark `Possibly expired`.
- Top deals older than 7 days get moved to "Previous Weeks" section.

### Suspicious Deals
- Discount > 70% → flag as `Suspicious`, add warning note.
- Still show the deal, but prominently warn the user.

### Pipeline Integrity
1. **NEVER edit deals.md to ADD new entries directly** — Write TSV in `batch/deal-additions/` and `merge-deals.mjs` handles the merge.
2. **YES you can edit deals.md to UPDATE status of existing entries.**
3. Health check: `node scripts/verify-sources.mjs`
4. Dedup: `node scripts/dedup-deals.mjs`

### Watchlist Priority
- During scans, always check watchlist matches FIRST.
- Watchlist matches with score ≥ 3.5 get flagged prominently in results.

---

## Deal Statuses

| Status | When to use |
|--------|-------------|
| `Active` | Deal confirmed live |
| `Expired` | No longer available |
| `Bought` | User purchased it |
| `Watching` | On watchlist, monitoring |
| `Suspicious` | Discount too deep, needs verification |
| `Possibly expired` | > 7 days old, not re-verified |

---

## Stack and Conventions

- Node.js (mjs modules), Playwright (scraping + verification), YAML (config), Markdown (data)
- Scripts in `scripts/*.mjs`
- Configuration in YAML (`config/`, `categories/`)
- Output in `output/` (gitignored)
- Batch artifacts in `batch/` (gitignored except scripts)
- Deal numbering: sequential 3-digit zero-padded, max existing + 1

### TSV Format for Deal Additions

Write one TSV file per source per scan to `batch/deal-additions/{timestamp}-{source-slug}.tsv`. Tab-separated, 10 columns:

```
{num}\t{date}\t{category}\t{product}\t{original_price}\t{sale_price}\t{discount%}\t{source}\t{score}/5\t{url}
```
