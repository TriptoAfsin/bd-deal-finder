# Mode: Top Deals

Surface the best current deals from the curated feed.

## Trigger
- User says "top deals", "what's hot", "best deals", "show me the good stuff"
- User asks "any good deals in [category]?"

## Procedure

### 1. Load Data
- Read `data/top-deals.md`
- Read `data/deals.md` (for supplementary data)
- Read `config/profile.yml` (for user's category preferences)

### 2. Filter
Apply filters based on user request:
- **Category:** if specified (e.g., "top tech deals"), filter to that category
- **Recency:** default to last 7 days, adjustable ("top deals this month")
- **Minimum score:** default 4.0 (from profile.yml `top_threshold`)
- **Budget:** optionally filter to within-budget only

### 3. Staleness Check
For each deal in top-deals.md:
- If `date_found` > 7 days ago AND not re-verified → mark `Possibly expired`
- If `date_found` > 14 days ago → move to "Previous Weeks" or remove

### 4. Present

```
## Top Deals — {date range}

### Tech
| Product | Price (৳) | Discount | Source | Score | Link |
|---------|-----------|----------|--------|-------|------|
| {name}  | {price}   | {disc}%  | {src}  | {sc}  | [→]({url}) |

### Fashion
| ... |

### Home Appliances
| ... |

(empty categories omitted)

---
{N} top deals across {C} categories.
Oldest deal: {date} — consider re-verifying.
```

### 5. Offer Actions
- "Want me to verify if these are still active?"
- "Want me to compare any of these?"
- "Want me to run a fresh scan?"

### 6. If No Top Deals
```
No top deals (≥ 4.0) found in the last 7 days.
Last scan: {date}

Want me to run a fresh scan? Or lower the threshold to 3.5?
```
