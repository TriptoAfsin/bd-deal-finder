# Mode: Search

On-demand product search across BD sources.

## Trigger
- User says "find me [product]", "search for [product]", "best price for [product]"
- User specifies product + optional budget + optional category

## Procedure

### 1. Parse Request
Extract from user input:
- **Product:** what they're looking for (e.g., "mechanical keyboard")
- **Budget:** max price if mentioned (e.g., "under 8000")
- **Category:** if mentioned or inferrable (e.g., keyboard → tech)

If category is ambiguous, ask: "Should I search in Tech, Electronics, or all categories?"

### 2. Select Sources
- Read `config/sources.yml`
- Filter sources by detected category
- If no category specified, search all sources
- Prioritize tier A sources first, then B, then C

### 3. Search Each Source
For each relevant source:
1. Navigate to the source URL via Playwright
2. Use the site's search functionality if available
3. Alternatively, navigate to category pages and scan for matching products
4. Extract: product name, original price, sale price, discount %, URL

### 4. Score & Rank
- Score each result using the 4-axis system from `_shared.md`
- Use the user's stated budget (or category default from profile.yml) for budget fit
- Sort by score descending

### 5. Present Results
Show top 5–10 results:

```
Search: "{product}" | Budget: {budget}৳ | Category: {category}

| # | Product | Price (৳) | Discount | Source | Trust | Score | Link |
|---|---------|-----------|----------|--------|-------|-------|------|
| 1 | {name}  | {sale}    | {disc}%  | {src}  | A     | 4.5/5 | [→]({url}) |
| 2 | ...     | ...       | ...      | ...    | ...   | ...   | ...  |

Best pick: #{1} — {reason}
```

If no results found:
```
No deals found for "{product}" across {N} sources.
Suggestions:
- Try broader keywords
- Check back later — new deals appear daily
- Add to watchlist: "watch {product} under {budget}"
```

### 6. Offer Follow-up
After presenting results:
- "Want me to add any of these to your watchlist?"
- "Want me to compare the top options in detail?"
