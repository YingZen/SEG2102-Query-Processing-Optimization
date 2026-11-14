# SEG2102 Query Processing and Optimization — reproducibility package

This package accompanies the IEEE-style report. The report uses 20 genuine research papers, an explicitly labeled analytical data-access model, and attributed external empirical results. **No first-hand MongoDB benchmark has been run in the report-building environment.** These files let the group perform the missing actual measurements.

## Setup
1. Install MongoDB Community Server and MongoDB Shell (`mongosh`) on a machine you control.
2. Start MongoDB on the local default port (27017).
3. Use a test environment. The benchmark **deletes and recreates** the `seg2102_query_optimization.students` collection.
4. From the directory containing `mongodb_benchmark.js`, run:

```bash
mongosh --quiet mongodb://localhost:27017 mongodb_benchmark.js > results.jsonl
```

On Windows PowerShell, run the same command after placing `mongosh` in PATH. The script outputs 36 result cells: 3 collection sizes × 3 index configurations × 4 query templates. Each cell comprises 5 warm-ups and 20 execution-statistics observations.

## Make tables and charts
Install Python, matplotlib, and run:

```bash
python plot_benchmark.py results.jsonl --outdir results
```

A CSV table plus one performance chart per query appears in `results/`. These reflect the **actual** results in the JSONL log; none are generated without measured data.

## Before the report is submitted
- Verify MongoDB version, processor, RAM, storage and OS, and state them in the Methodology.
- Validate query match counts: for N = 10,000 / 50,000 / 100,000, Q1 matches 1, Q2 matches 600 / 3,000 / 6,000, and Q4 matches 7,500 / 37,500 / 75,000.
- Replace Section V's analytical results with, or augment it by, your actual experimental tables and charts. Explain any deviations from predicted scan counts.
- Update the Abstract and Conclusion based on *actual* observations. Distinguish client latency from server-side `explain` latency.
- Publish code, datasets/data generation rules, raw JSONL and generated figures to a public GitHub repository and insert that URL into the report.
- Fill in all 3 student names/IDs, real contribution percentages and the required academic honesty form.
- The current assignment brief requests **one IEEE-template Microsoft Word file via Turnitin**, not only the requested PDF.
