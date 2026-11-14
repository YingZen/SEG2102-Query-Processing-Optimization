// SEG2102 reproducible MongoDB query-optimization benchmark
// Run: mongosh --quiet mongodb://localhost:27017 mongodb_benchmark.js > results.jsonl
// WARNING: Drops ONLY seg2102_query_optimization.students (dedicated research collection).
const researchDB = db.getSiblingDB('seg2102_query_optimization');
const c = researchDB.students;
const sizes = [10000, 50000, 100000];
const repetitions = 20;
const warmups = 5;
function median(a) { const b = [...a].sort((x,y) => x-y); return (b[Math.floor((b.length-1)/2)] + b[Math.floor(b.length/2)])/2; }
function p95(a) { const b = [...a].sort((x,y) => x-y); return b[Math.ceil(0.95*b.length)-1]; }
function emit(v) { print(JSON.stringify(v)); }
function seed(n) {
  c.drop();
  const programs = ['SWE', 'CS', 'IT', 'DA'];
  for (let start=0; start<n; start+=1000) {
    const batch=[];
    for (let i=start; i<Math.min(start+1000,n); i++) {
      batch.push({
        studentId:i+1,
        studentName:'Student '+(i+1),
        major:programs[i%4],
        gpa:Math.round((2+(i%200)/100)*100)/100,
        entryYear:2021+(i%5),
        status:i%11===0?'inactive':'active',
        email:'student'+(i+1)+'@example.edu'
      });
    }
    c.insertMany(batch, {ordered:true});
  }
}
function test(n, config, name, filter, sort, limit, hint) {
  const ms=[], keys=[], docs=[], returned=[], wall=[];
  for(let r=0;r<repetitions+warmups;r++) {
    let q=c.find(filter);
    if(sort) q=q.sort(sort);
    if(limit) q=q.limit(limit);
    q=q.hint(hint);
    const t0=Date.now();
    const plan=q.explain('executionStats');
    const elapsed=Date.now()-t0;
    const s=plan.executionStats;
    if(r>=warmups) {
      ms.push(s.executionTimeMillis);
      keys.push(s.totalKeysExamined);
      docs.push(s.totalDocsExamined);
      returned.push(s.nReturned);
      wall.push(elapsed);
    }
  }
  emit({type:'result', n:n, config:config, query:name, indexHint:hint,
    trials:repetitions, warmups:warmups, medianExecMs:median(ms), p95ExecMs:p95(ms),
    medianWallMs:median(wall), medianKeysExamined:median(keys),
    medianDocsExamined:median(docs), medianReturned:median(returned),
    indexBytes:c.totalIndexSize(), version:db.version()});
}
for(const n of sizes) {
  seed(n);
  emit({type:'dataset',n:n,collection:c.getFullName(),records:c.countDocuments({}),version:db.version()});
  for(const config of ['unindexed','single','compound']) {
    const started=Date.now();
    if(config==='single') { c.createIndex({studentId:1}); c.createIndex({major:1}); }
    if(config==='compound') { c.createIndex({major:1,gpa:-1}); }
    const buildMs=Date.now()-started;
    emit({type:'config', n:n, config:config, newIndexBuildMs:buildMs, indexBytes:c.totalIndexSize(), indexes:c.getIndexes().map(x=>x.key)});
    const ixPoint=config==='unindexed'?{$natural:1}:{studentId:1};
    const ixMajor=config==='unindexed'?{$natural:1}:{major:1};
    const ixCompound=config==='compound'?{major:1,gpa:-1}:ixMajor;
    test(n,config,'Q1_selective_point',{studentId:Math.floor(n*0.75)},null,0,ixPoint);
    test(n,config,'Q2_equality_range',{major:'SWE',gpa:{$gte:3.5}},null,0,ixCompound);
    test(n,config,'Q3_equality_sort_top20',{major:'CS'},{gpa:-1},20,ixCompound);
    test(n,config,'Q4_low_selectivity',{major:{$in:['SWE','CS','IT']}},null,0,ixMajor);
  }
}
emit({type:'complete',message:'All dataset/configuration/query trials finished. Review results.jsonl before reporting.'});
