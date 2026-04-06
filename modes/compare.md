# Mode: Compare

Side-by-side price and feature comparison across sources.

## Trigger
- User says "compare [product]", "compare prices for [product]"
- User pastes 2–5 product URLs
- User asks "which is better, X or Y?"

## Procedure

### 1. Determine What to Compare

**If user provides URLs:**
- Scrape each URL via Playwright
- Extract: product name, price, specs, availability, delivery info, seller rating

**If user provides product name:**
- Run a search (like search mode) across relevant sources
- Pick top 3–5 results from different sources
- Scrape detailed info from each

### 2. Extract Comparison Data
For each product/listing, get:
- Full product name & variant
- Original price (৳)
- Sale/current price (৳)
- Discount %
- Source name & trust tier
- Availability (in stock / out of stock / pre-order)
- Delivery info (free delivery, estimated time, Dhaka vs outside)
- Warranty info (if visible)
- Key specs (vary by category)
- Seller rating (if marketplace)

### 3. Build Comparison Table

```
## Price Comparison: {product}

| | Option 1 | Option 2 | Option 3 |
|---|----------|----------|----------|
| **Source** | {src1} (Tier {t}) | {src2} (Tier {t}) | {src3} (Tier {t}) |
| **Price** | {price1}৳ | {price2}৳ | {price3}৳ |
| **Original** | {orig1}৳ | {orig2}৳ | {orig3}৳ |
| **Discount** | {disc1}% | {disc2}% | {disc3}% |
| **Score** | {score1}/5 | {score2}/5 | {score3}/5 |
| **In Stock** | {yes/no} | {yes/no} | {yes/no} |
| **Delivery** | {info} | {info} | {info} |
| **Warranty** | {info} | {info} | {info} |

### Verdict
**Best price:** Option {N} at {source} — {price}৳
**Best overall (score):** Option {N} — {score}/5 ({reason})
**Best trust:** Option {N} at {source} (Tier A)
```

### 4. Recommendation
Provide a clear recommendation with reasoning:
- Best value = highest score
- Cheapest = lowest price (note if source trust is lower)
- Safest = highest trust tier source
- If prices are within 5% of each other, recommend the higher trust source
