# Benchmark Results

This directory contains benchmark measurement output from `npm run benchmark`.

## Files

- `results.jsonl` — One JSON object per benchmark run (appended chronologically)

## Format

Each line in `results.jsonl` is a JSON object:

```json
{
  "timestamp": "2026-09-02T05:21:00.000Z",
  "label": "BEFORE indexes",
  "runs": 10,
  "dataset": {
    "totalOrders": 1019,
    "benchOrders": 1000,
    "realOrders": 19,
    "totalProducts": 61,
    "totalSellers": 7
  },
  "sellerAnalytics": { "runs": 10, "avg": 0, "median": 0, "min": 0, "max": 0, "p95": 0 },
  "ownerAnalytics":  { "runs": 10, "avg": 0, "median": 0, "min": 0, "max": 0, "p95": 0 }
}
```

## How to Reproduce

```bash
# 1. Seed benchmark data
npm run seed:benchmark -- --size 1000

# 2. Run baseline benchmark (BEFORE optimization)
npm run benchmark -- --label "BEFORE_indexes_1000_orders"

# 3. Apply indexes (Phase 6)

# 4. Run post-optimization benchmark
npm run benchmark -- --label "AFTER_indexes_1000_orders"

# 5. Compare results
node scripts/compare-benchmarks.js
```

## Notes

- Results in this file are from REAL benchmark runs on this machine.
- Numbers are NOT fabricated or estimated.
- Dataset size is shown in each record for context.
