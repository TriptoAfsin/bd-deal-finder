# Deal Finder BD — Design Document

**Date:** 2026-04-06
**Author:** Tripto + Claude
**Status:** Approved

---

## Overview

AI-powered Bangladeshi deal finder built on Claude Code. Scans 60+ BD e-commerce sources across 6 categories, scores deals on a 4-axis system, and surfaces the best finds. Supports recurring scans and on-demand search.

## Categories

| Category | Sources | Focus |
|----------|---------|-------|
| Tech | 15 | Laptops, phones, peripherals, accessories |
| Electronics | 10 | Brand official stores, authorized retailers |
| Fashion | 14 | Local brands, marketplace fashion |
| Lifestyle | 12 | Grooming, wellness, daily essentials, books |
| Home Appliances | 12 | AC, TV, kitchen, laundry, power |
| Multi/Aggregator | 5 | Cross-category marketplaces, deal sites |

**Total: 60+ curated sources, BDT only.**

## Scoring System

4-axis weighted, 5-point scale:

| Axis | Weight | Measures |
|------|--------|----------|
| Discount depth | 35% | How significant the price cut is |
| Budget fit | 25% | Within user's set budget for category |
| Source trust | 25% | Platform reliability tier (A/B/C) |
| Brand quality | 15% | Known brand vs generic/unbranded |

**Formula:** `score = (discount × 0.35) + (budget × 0.25) + (source × 0.25) + (brand × 0.15)`

**Thresholds:**
- ≥ 4.0 → Top Deal (auto-added to top-deals.md)
- 3.0–3.9 → Good deal, shown in feed
- < 3.0 → Low priority
- < 2.0 → Not added to feed

**Suspicious flag:** Discount > 70% auto-flagged for verification.

## Modes

| Mode | Trigger | Function |
|------|---------|----------|
| `scan` | "scan" or recurring | Crawl all sources for new deals |
| `search` | "find me X" | On-demand hunt across sources |
| `compare` | "compare" or paste URLs | Side-by-side price comparison |
| `top` | "top deals" / "what's hot" | Surface top-deals.md highlights |
| `watch` | "watch X" | Add to watchlist for priority matching |
| `tracker` | "show deals" / "history" | Browse/filter deals.md |

## Architecture

```
deal-finder/
├── CLAUDE.md
├── config/
│   ├── profile.yml
│   └── sources.yml
├── modes/
│   ├── _shared.md
│   ├── scan.md
│   ├── search.md
│   ├── compare.md
│   ├── top.md
│   ├── watch.md
│   └── tracker.md
├── data/
│   ├── deals.md
│   ├── top-deals.md
│   ├── scan-history.tsv
│   └── watchlist.md
├── categories/
│   ├── tech.yml
│   ├── electronics.yml
│   ├── fashion.yml
│   ├── lifestyle.yml
│   ├── home-appliances.yml
│   └── multi.yml
├── templates/
│   ├── sources.example.yml
│   ├── profile.example.yml
│   └── statuses.yml
├── scripts/
│   ├── merge-deals.mjs
│   ├── dedup-deals.mjs
│   └── verify-sources.mjs
├── batch/
│   └── deal-additions/
├── output/
└── package.json
```

## Data Formats

### deals.md
| # | Date | Category | Product | Original (৳) | Sale (৳) | Discount | Source | Score | Status | Link |

### top-deals.md
Auto-curated from deals.md where score ≥ 4.0. Grouped by "This Week" and "Previous Weeks".

### watchlist.md
| Keyword | Category | Max Budget (৳) | Added | Status | Last Match |

### scan-history.tsv
`url \t source \t product \t price \t discount \t date_found \t date_last_seen`

### Deal Statuses
Active, Expired, Bought, Watching, Suspicious, Possibly expired

## Source Trust Tiers

- **A (verified):** Daraz, Star Tech, Ryans, Chaldal, Aarong, Samsung BD, Xiaomi BD, Walton, Singer, Transcom Digital
- **B (generally good):** Pickaboo, Gadget & Gear, Othoba, Ajkerdeal, Le Reve, Shajgoj, Techland, Best Electronics
- **C (use with caution):** Bikroy, Evaly, smaller shops, FB groups

## Key Rules

1. NEVER fabricate prices — all data from scraping
2. Verify via Playwright — navigate + snapshot
3. Discount > 70% = auto-flag suspicious
4. Same URL + same price within 24hrs = skip (dedup)
5. Deals > 7 days old = "Possibly expired"
6. Score < 2.0 = don't add to feed
7. After each scan batch, run merge-deals.mjs
8. Watchlist matches surface first in results
