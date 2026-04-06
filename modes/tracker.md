# Mode: Tracker

Browse, filter, and manage the deal feed.

## Trigger
- User says "show deals", "deal history", "what have we found"
- User asks "how many deals this week", "show tech deals"
- User wants to update a deal status (mark as bought, expired, etc.)

## Procedure

### 1. Load Data
- Read `data/deals.md`
- Read `config/profile.yml` (for category preferences)

### 2. Apply Filters
Based on user request:
- **Category:** "show tech deals" → filter category = tech
- **Score range:** "show deals above 3.5" → filter score ≥ 3.5
- **Date range:** "deals this week" → filter to last 7 days
- **Source:** "deals from Star Tech" → filter by source
- **Status:** "show active deals" → filter status = Active
- **Price range:** "deals under 5000" → filter sale price ≤ 5000

Default (no filter): show last 7 days, sorted by score descending.

### 3. Present

```
## Deal Feed — {filter description}

| # | Date | Category | Product | Sale (৳) | Discount | Source | Score | Status | Link |
|---|------|----------|---------|----------|----------|--------|-------|--------|------|
| {entries} |

Showing {N} deals. Total in database: {total}.
```

### 4. Stats (if requested)
```
## Deal Stats

| Metric | Value |
|--------|-------|
| Total deals tracked | {N} |
| Active deals | {N} |
| Top deals (≥ 4.0) | {N} |
| Deals this week | {N} |
| Most active category | {category} ({N} deals) |
| Most common source | {source} ({N} deals) |
| Average score | {avg}/5 |
| Deals bought | {N} |
```

### 5. Status Updates
User can update deal status:
- "mark deal #{N} as bought" → update status to `Bought`
- "deal #{N} expired" → update status to `Expired`
- Edit directly in `data/deals.md` for status changes only.
