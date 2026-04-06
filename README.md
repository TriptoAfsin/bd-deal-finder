# Deal Finder BD

AI-powered Bangladeshi deal finder built on [Claude Code](https://claude.ai/claude-code). Scans 60+ BD e-commerce sources, scores deals on a 4-axis system, and surfaces the best finds — all in BDT.

## Categories

- Tech
- Electronics
- Fashion
- Lifestyle
- Home Appliances
- Home Decor

## How It Works

1. **Scan** — crawls configured BD e-commerce sources using Playwright
2. **Score** — rates each deal on four axes: discount depth (35%), budget fit (25%), source trust (25%), brand quality (15%)
3. **Surface** — deals scoring 4.0+ land in `data/top-deals.md`; everything 2.0+ goes to `data/deals.md`

## Quick Start

```bash
npm install
```

Then open a Claude Code session in this directory. On first run it will walk you through setup (profile, sources, data files).

### Commands

| Say this | What happens |
|----------|-------------|
| `scan` | Search all sources for deals |
| `find me [product]` | On-demand product search |
| `compare [product]` | Price comparison across sites |
| `top deals` | View best current finds |
| `watch [product] under [price]` | Add to watchlist |

## Project Structure

```
config/
  profile.yml          # User preferences, budgets, interests
  sources.yml          # 60+ BD e-commerce sources with metadata
categories/
  tech.yml             # Per-category sources, keywords, budgets, brands
  electronics.yml
  fashion.yml
  lifestyle.yml
  home-appliances.yml
  home-decor.yml
  multi.yml
data/
  deals.md             # Running deal feed
  top-deals.md         # Curated top deals (score >= 4.0)
  watchlist.md         # Products being watched
  scan-history.tsv     # Scanner dedup history
scripts/
  merge-deals.mjs      # Merge scan results into deals.md
  dedup-deals.mjs      # Remove duplicate entries
  verify-sources.mjs   # Health-check sources
modes/                 # Claude Code skill mode definitions
templates/             # Example configs for onboarding
```

## Scripts

```bash
npm run merge    # Merge batch deal additions into deals.md
npm run dedup    # Deduplicate deal entries
npm run verify   # Check if sources are still live
```

## Scoring

Each deal gets a weighted score out of 5:

| Axis | Weight |
|------|--------|
| Discount depth | 35% |
| Budget fit | 25% |
| Source trust | 25% |
| Brand quality | 15% |

Deals above 70% discount are auto-flagged as **Suspicious**.

## License

MIT
