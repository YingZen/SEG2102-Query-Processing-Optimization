#!/usr/bin/env python3
"""Make tables and figures from REAL mongosh benchmark output (never fabricates measurements).
Usage: python plot_benchmark.py results.jsonl --outdir results
"""
import argparse, csv, json
from pathlib import Path
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('jsonl',type=Path)
    parser.add_argument('--outdir',type=Path,default=Path('results'))
    args=parser.parse_args()
    args.outdir.mkdir(parents=True, exist_ok=True)
    records=[]
    for line in args.jsonl.read_text(encoding='utf-8').splitlines():
        line=line.strip()
        if not line: continue
        try: obj=json.loads(line)
        except ValueError: continue
        if obj.get('type')=='result': records.append(obj)
    if not records:
        raise SystemExit('No result records found. Run mongodb_benchmark.js on an actual MongoDB server first.')
    fields=['n','config','query','trials','warmups','medianExecMs','p95ExecMs','medianWallMs',
            'medianDocsExamined','medianKeysExamined','medianReturned','indexBytes','version']
    with (args.outdir/'results_summary.csv').open('w',newline='',encoding='utf-8') as f:
        writer=csv.DictWriter(f,fieldnames=fields,extrasaction='ignore');writer.writeheader();writer.writerows(records)
    sizes=sorted({r['n'] for r in records})
    configs=['unindexed','single','compound']
    for q in sorted({r['query'] for r in records}):
        fig,ax=plt.subplots(figsize=(6.3,3.3))
        for conf in configs:
            series={r['n']:r for r in records if r['query']==q and r['config']==conf}
            if series:
                xx=[n for n in sizes if n in series]
                ax.plot(xx,[series[n]['medianExecMs'] for n in xx],marker='o',label=conf)
        ax.set_title(q+' | measured MongoDB execution statistics')
        ax.set_xlabel('Collection size (documents)');ax.set_ylabel('Median explain executionTimeMillis (ms)')
        ax.legend(); ax.grid(alpha=.25);fig.tight_layout()
        fig.savefig(args.outdir/(q+'_median_latency.png'),dpi=200);plt.close(fig)
    print('Processed',len(records),'observed result cells into',args.outdir)
if __name__=='__main__': main()
