# Mode: Watch

Add products or keywords to the watchlist for priority monitoring during scans.

## Trigger
- User says "watch [product]", "watch [product] under [price]"
- User says "add to watchlist", "alert me when [product] drops"
- User says "notify me about [product] deals"

## Procedure

### 1. Parse Request
Extract:
- **Keyword/product:** what to watch for
- **Max budget:** price ceiling (optional, defaults to category budget)
- **Category:** if specified or inferrable

### 2. Check for Duplicates
- Read `data/watchlist.md`
- If a similar keyword already exists, ask: "You're already watching '{existing}'. Update it or add a new entry?"

### 3. Add to Watchlist
Append to `data/watchlist.md`:
```
| {keyword} | {category} | {max_budget}৳ | {today's date} | Watching | -- |
```

### 4. Confirm
```
Added to watchlist:
- Watching: "{keyword}"
- Category: {category}
- Max budget: {budget}৳
- Status: Active

This will be checked during every scan. Matches with score ≥ 3.5 will be flagged prominently.
```

### 5. Manage Watchlist
User can also:
- "show watchlist" → display current watchlist
- "remove [keyword] from watchlist" → update status to removed
- "update watchlist [keyword] budget to [new price]" → edit entry
- "pause watching [keyword]" → set status to Paused

### Watchlist Statuses
| Status | Meaning |
|--------|---------|
| `Watching` | Actively monitored every scan |
| `Matched` | Found at least one deal — still watching |
| `Paused` | Temporarily not scanning |
| `Fulfilled` | User bought the item — stop watching |
| `Removed` | Deleted from watchlist |
