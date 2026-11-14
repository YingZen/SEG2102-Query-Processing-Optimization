# SEG2102 Query Processing and Optimization — MongoDB Benchmark

This repository contains the MongoDB experiment code, raw measurements, summary table, and performance graphs for the SEG2102 Database Management Systems research project, **Performance Evaluation of Query Processing and Optimization Techniques in MongoDB**.

The experiments were conducted on a local MongoDB installation. The study investigates how collection size and different indexing strategies affect query execution performance using synthetic student datasets containing 10,000, 50,000, and 100,000 documents.

## 1. Research Objectives

The objectives of this research are:

1. To investigate the impact of query processing and optimization techniques on MongoDB performance.
2. To compare unindexed, single-field indexed, and compound-indexed query execution.
3. To evaluate query performance across different database sizes.
4. To analyze execution time, documents examined, keys examined, and indexing overhead.
5. To identify situations where indexing improves or reduces query performance.

## 2. Tools and Technologies

| Component | Technology |
|---|---|
| Database | MongoDB Community Server 9.0.8 |
| Database Shell | MongoDB Shell 2.14.2 |
| Programming Languages | JavaScript and Python |
| Visualization | Matplotlib |
| Operating System | Windows |
| Version Control | GitHub |

## 3. Experimental Design

The study evaluates MongoDB query execution across three dataset sizes.

| Dataset | Records |
|---|---:|
| Small | 10,000 |
| Medium | 50,000 |
| Large | 100,000 |

Three configurations were evaluated:

- **Unindexed:** Collection scans without additional query indexes.
- **Single-field:** Queries using indexes on individual fields.
- **Compound:** Queries using an additional compound index on multiple fields.

The experiment includes four query workloads:

| Query | Description |
|---|---|
| Q1 | Selective point lookup using student ID |
| Q2 | Equality and range filtering |
| Q3 | Equality filtering, sorting, and top-20 retrieval |
| Q4 | Low-selectivity query returning many documents |

Each configuration uses five warm-up executions followed by 20 recorded executions.

The experiments cover 3 dataset sizes × 3 indexing configurations × 4 query workloads, producing **36 experimental result combinations**.

The benchmark records execution time, examined documents, examined index keys, returned documents, and index storage size.

**Methodological note:** The benchmark uses MongoDB's `hint()` method to force specific access paths. Thus, the results compare selected execution strategies rather than MongoDB's automatic query-plan selection. Indexes are created cumulatively during each dataset test.

## 4. Repository Structure

The repository contains:

- **README.md** — Project overview, experiment instructions, and findings.
- **mongodb_benchmark.js** — Generates datasets, creates indexes, executes queries, and collects performance measurements.
- **plot_benchmark.py** — Processes experimental results and generates charts.
- **results.jsonl** — Raw MongoDB experimental measurements.
- **results/** — Directory containing the performance summary and four graphs.

The `results` directory includes:

- `results_summary.csv`
- `Q1_selective_point_median_latency.png`
- `Q2_equality_range_median_latency.png`
- `Q3_equality_sort_top20_median_latency.png`
- `Q4_low_selectivity_median_latency.png`

The datasets are generated automatically by the benchmark script, so separate dataset files are not required.

## 5. How to Run the Experiment

### Step 1: Install MongoDB

Install MongoDB Community Server and MongoDB Shell.

Ensure the local MongoDB server is running at:

`mongodb://localhost:27017`

### Step 2: Open the Project Folder

Open Command Prompt in the folder containing `mongodb_benchmark.js`.

### Step 3: Execute the Benchmark

Run:

`mongosh --quiet "mongodb://localhost:27017" mongodb_benchmark.js > results.jsonl`

**Warning:** The benchmark drops and recreates the `students` collection inside the `seg2102_query_optimization` database. Run it only in a test environment.

### Step 4: Verify Completion

Run:

`findstr complete results.jsonl`

A successful experiment produces a completion message confirming that all dataset, configuration, and query trials have finished.

### Step 5: Generate Performance Graphs

Install Matplotlib:

`python -m pip install matplotlib`

Generate the graphs:

`python plot_benchmark.py results.jsonl --outdir results`

The script generates `results_summary.csv` and four PNG performance graphs.

A complete run should display:

`Processed 36 observed result cells into results`

## 6. Experimental Results

The following table presents the median MongoDB server-reported execution times for the 100,000-document dataset.

| Query | Unindexed (ms) | Single-field (ms) | Compound stage (ms) |
|---|---:|---:|---:|
| Q1: Selective Point | 65 | 0 | 0 |
| Q2: Equality and Range | 70 | 47 | 13 |
| Q3: Equality, Sort, Top 20 | 84 | 52 | 0 |
| Q4: Low Selectivity | 69.5 | 125 | 126.5 |

**Note:** A reported execution time of 0 ms does not indicate instantaneous execution. MongoDB's `executionTimeMillis` metric has millisecond-level precision.

### 6.1 Selective Point Lookup

Indexing significantly improved selective lookup performance.

For the 100,000-document dataset, the unindexed query examined 100,000 documents, whereas the indexed query examined only one document.

This demonstrates the effectiveness of indexes for highly selective queries.

### 6.2 Equality and Range Query

The compound-indexed configuration achieved the lowest reported execution time.

For the 100,000-document dataset, execution time decreased from 70 ms without indexing to 13 ms using the compound index.

This demonstrates the benefits of matching index field order to query predicates.

### 6.3 Equality, Sorting, and Top-20 Query

The compound index provided substantial improvements for queries combining filtering and sorting.

It enabled MongoDB to retrieve matching documents in the required order more efficiently, avoiding the expensive execution path associated with an unindexed scan and sort.

### 6.4 Low-Selectivity Query

Indexing did not improve every query.

For the 100,000-document dataset, the unindexed execution time was 69.5 ms, compared with 125 ms and 126.5 ms for the indexed configurations.

Because this query returns a large proportion of the collection, the forced indexed execution path incurs additional index traversal and document retrieval overhead.

This finding demonstrates why query optimization should consider selectivity and workload characteristics rather than assuming indexing is always beneficial.

## 7. Key Findings

The experiments produced the following findings:

1. Indexing substantially improves highly selective queries.
2. Compound indexing is effective for queries involving multiple conditions, sorting, and limiting.
3. Query execution time generally increases with dataset size, particularly for collection scans.
4. Indexing introduces storage and maintenance overhead.
5. Low-selectivity queries can perform better using collection scans.
6. Selecting an appropriate query execution strategy is essential for effective database optimization.

These findings highlight the importance of workload-aware database optimization.

## 8. Limitations

Several limitations should be considered when interpreting the results.

- The experiments use synthetic datasets rather than real-world application data.
- Testing was performed on a single local MongoDB server.
- The results depend on the computer's hardware, database configuration, and caching behavior.
- MongoDB's `explain("executionStats")` measurements do not represent complete end-to-end application latency.
- The experiments use `hint()` to force specific index access paths.
- The indexing configurations are cumulative, so the compound stage retains previously created single-field indexes.
- Concurrent workloads and distributed database environments were not evaluated.

Future research could investigate automatic query planning, larger real-world datasets, distributed MongoDB deployments, and workloads with concurrent read/write operations.

## 9. Research Reproducibility

The repository provides the scripts and experimental outputs needed to reproduce the research.

The raw measurements are preserved in `results.jsonl`, while summarized performance statistics and graphs are available in the `results` directory.

Execution times may vary across computers. Researchers should record their processor, RAM, storage type, operating system, and MongoDB configuration when reproducing the experiments.

## 10. Academic Information

**Course:** SEG2102 Database Management Systems

**Research Topic:** Query Processing and Optimization

**Research Title:** Performance Evaluation of Query Processing and Optimization Techniques in MongoDB

**Institution:** Sunway University

**Academic Session:** September 2026

This repository supports the research methodology, system implementation, and results and discussion sections of the accompanying IEEE-style research report.
