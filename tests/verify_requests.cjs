const fs=require('fs'),vm=require('vm'),assert=require('assert');
const html=fs.readFileSync('index.html','utf8');
const docs=JSON.parse(html.match(/const docs=(.*?);\nconst topics=/s)[1]);
const ctx=vm.createContext({});
vm.runInContext(fs.readFileSync('client-requests.js','utf8')+'\n'+fs.readFileSync('search.js','utf8')+'\nthis.meta=clientRequests;this.score=requestSearchScore;',ctx);
assert.equal(Object.keys(ctx.meta).length,320);
for(const d of docs){const m=ctx.meta[d.id];assert(m&&m.requests.length&&m.purpose&&m.kind,d.id);for(const q of m.requests){assert(q.trim().length>0);assert.equal(ctx.score(d,q,m),1000,d.id+q)}}
const cases=[['не можу сказати ні','n24-0'],['Мене ранять чужі слова','lake-and-litter'],['постійно прокручую розмову','lake-and-litter'],['Немає сил','n11-18'],['просто хочу поплакати','n4-23'],['Людина зникла безвісти','n1-2'],['накручую себе','n5-4'],['боюся відмовляти людям','n24-0'],['Мене не чують','n8-2']];
for(const [q,id] of cases){const ranked=docs.map(d=>({id:d.id,s:ctx.score(d,q,ctx.meta[d.id])})).sort((a,b)=>b.s-a.s);assert.equal(ranked[0].id,id,q)}
for(const q of ['критика','образа','румінація','психологічні межі','емоційна регуляція','метафоричні техніки'])assert(ctx.score(docs.find(d=>d.id==='lake-and-litter'),q,ctx.meta['lake-and-litter'])>0,q);
assert.equal(ctx.score(docs[0],'космічна піца',ctx.meta[docs[0].id]),0);
for(const d of docs.filter(d=>[3,20].includes(d.topicid)))assert.equal(ctx.meta[d.id].kind,'Критичний навчальний матеріал');
assert.equal(ctx.score(docs.find(d=>d.id==='n24-0'),'  НЕ МОЖУ СКАЗАТИ НІ!!! ',ctx.meta['n24-0']),1000);
console.log('PASS: 320 request entries, every curated phrase retrievable; 9 natural queries ranked first; 6 lake keywords; critical labels; normalization and no-result case.');
