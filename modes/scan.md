# Mode: Scan

Crawl all configured sources for new deals.

## Trigger
- User says "scan", "check for deals", "find new deals"
- Recurring scan (if configured)

## Procedure

### 1. Load Configuration
- Read `config/profile.yml` — get scan interval, thresholds, budgets
- Read `config/sources.yml` — get all sources
- Read `data/watchlist.md` — get priority keywords
- Read `data/scan-history.tsv` — for dedup

### 2. For Each Source
1. Navigate to each `scan_path` via Playwright (`browser_navigate`)
2. Take snapshot (`browser_snapshot`) to read page content
3. Extract deal data:
   - Product name
   - Original price (৳)
   - Sale/discounted price (৳)
   - Discount percentage
   - Product URL
4. **Dedup check:** Look up URL in `scan-history.tsv`
   - If URL + same price seen within `dedup_window_hours` → skip
   - If URL exists but price changed → update and treat as new deal
5. **Watchlist check:** Match product name against `data/watchlist.md` keywords
   - If match found → flag for priority display

### 3. Score Each Deal
- Follow scoring system in `_shared.md`
- Determine category from source + keyword matching
- Calculate 4-axis score

### 4. Write Results
- Write TSV to `batch/deal-additions/{timestamp}-{source-slug}.tsv`
- Format: `{num}\t{date}\t{category}\t{product}\t{original}\t{sale}\t{discount%}\t{source}\t{score}/5\t{url}`
- Update `data/scan-history.tsv` with all URLs processed

### 5. Merge
- Run `node scripts/merge-deals.mjs`
- Any deal with score ≥ `top_threshold` (default 4.0) → also add to `data/top-deals.md`

### 6. Report
Present summary:
```
Scan complete — {date} {time}
Sources scanned: {N}/{total}
New deals found: {N}
Top deals (≥ 4.0): {N}
Watchlist matches: {N}

By category:
- Tech: {n} | Fashion: {n} | Lifestyle: {n} | Electronics: {n} | Home: {n}

Top finds:
1. {product} — {sale}৳ ({discount}% off) @ {source} — {score}/5
2. ...
3. ...

Watchlist matches:
- {product} matched "{keyword}" — {sale}৳ @ {source}

Failed sources: {list any that couldn't be scraped}
```

### Error Handling
- If a source fails to load → log failure, continue to next source
- If a source returns no deals → note "no active deals found", continue
- Never abort the entire scan for a single source failure
- At end, report which sources failed so user can investigate

### Batch Mode Exception
When running in headless pipe mode (`claude -p`), Playwright is unavailable:
- Use WebFetch as fallback
- Mark all deals with `**Verification:** unconfirmed (batch mode)`
