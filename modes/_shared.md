# Shared Context — Deal Finder BD

## Sources of Truth (ALWAYS read before any operation)

| File | Path | When |
|------|------|------|
| profile.yml | `config/profile.yml` | ALWAYS — user budgets, preferences, scan settings |
| sources.yml | `config/sources.yml` | ALWAYS — master source registry |
| Category files | `categories/*.yml` | When evaluating deals — keywords, budgets, brand tiers |
| deals.md | `data/deals.md` | When adding/updating deals |
| top-deals.md | `data/top-deals.md` | When surfacing top deals |
| watchlist.md | `data/watchlist.md` | During scans — priority matching |
| scan-history.tsv | `data/scan-history.tsv` | Dedup check before adding deals |

**RULE: NEVER fabricate prices.** All prices must come from actual page scraping.
**RULE: NEVER hallucinate deals.** If a source can't be scraped, skip and log failure.

---

## Scoring System — 4-Axis Weighted (5-point scale)

### Axes & Weights

| Axis | Weight | Source |
|------|--------|--------|
| Discount depth | 35% | Calculated from original vs sale price |
| Budget fit | 25% | Compared against category budget in profile.yml |
| Source trust | 25% | Trust tier from sources.yml (A=5.0, B=3.5, C=2.0) |
| Brand quality | 15% | Brand tier from category/*.yml (tier_1=5.0, tier_2=3.5, unknown=2.0) |

### Discount Depth Scoring

| Discount % | Score |
|-----------|-------|
| < 5% | 1.0 |
| 5–15% | 2.0 |
| 15–30% | 3.0 |
| 30–50% | 4.0 |
| > 50% | 5.0 |
| > 70% | 5.0 + SUSPICIOUS flag |

### Budget Fit Scoring

| Fit | Score |
|-----|-------|
| ≤ 50% of budget | 5.0 |
| 50–75% of budget | 4.0 |
| 75–100% of budget | 3.0 |
| 100–125% of budget | 2.0 |
| > 125% of budget | 1.0 |

### Final Score Formula

```
score = (discount × 0.35) + (budget_fit × 0.25) + (source_trust × 0.25) + (brand × 0.15)
```

### Thresholds

| Score | Action |
|-------|--------|
| ≥ 4.0 | **Top Deal** — auto-add to `top-deals.md` |
| 3.0–3.9 | Good deal — shown in feed |
| 2.0–2.9 | Low priority — shown with note |
| < 2.0 | Noise — do not add to feed |

---

## Deal Statuses

| Status | Meaning |
|--------|---------|
| `Active` | Deal confirmed live |
| `Expired` | No longer available |
| `Bought` | User purchased it |
| `Watching` | On watchlist, monitoring |
| `Suspicious` | Discount > 70%, needs verification |
| `Possibly expired` | > 7 days old, not re-verified |

---

## Source Trust Tiers

| Tier | Score | Criteria |
|------|-------|----------|
| **A** | 5.0 | Established, verified, reliable returns/support |
| **B** | 3.5 | Generally good, occasional issues |
| **C** | 2.0 | Use with caution — verify before buying |

---

## Category Detection

When a product is found, determine its category by:
1. Check which source categories it belongs to (from sources.yml)
2. Match product name against keywords in category/*.yml
3. If ambiguous, prefer the more specific category (e.g., "laptop" → tech, not electronics)

---

## Output Formatting

### Deal Entry (for deals.md)
```
| {num} | {date} | {category} | {product} | {original}৳ | {sale}৳ | {discount}% | {source} | {score}/5 | {status} | [link]({url}) |
```

### Summary After Scan
```
Found {N} new deals. {T} top deals.
- Tech: {n} deals
- Fashion: {n} deals
- Lifestyle: {n} deals
- Electronics: {n} deals
- Home Appliances: {n} deals
Top: {list top 3 with names and scores}
```
