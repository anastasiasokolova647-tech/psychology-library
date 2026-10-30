const fs=require('fs'),vm=require('vm'),assert=require('assert'),cp=require('child_process');
const parse=s=>JSON.parse(s.match(/const docs=(.*?);\nconst topics=/s)[1]);
const page=fs.readFileSync('index.html','utf8'),docs=parse(page),old=parse(cp.execFileSync('git',['show','6908d5ad9d95b0915967d3001e77b7f7cc475640:index.html'],{encoding:'utf8',maxBuffer:5000000}));
assert.deepStrictEqual(docs,old);
const ctx=vm.createContext({});vm.runInContext(fs.readFileSync('editorial.js','utf8')+';this.entries=editorialRecords;',ctx);
assert.equal(Object.keys(ctx.entries).length,33);
for(const [id,e] of Object.entries(ctx.entries)){assert(docs.some(d=>d.id===id));assert(e.content.length>500,id);assert(!/учасники говорили|викладач обговорює|дає пояснення до теми/i.test(e.content),id);assert(e.lead.length>40);for(const [,url] of e.sources)assert(url.startsWith('https://'));}
for(let i=1;i<=12;i++)assert(ctx.entries['lecture-20261024-'+i]);
assert(ctx.entries['n4-23'].content.includes('Можна взяти тебе за руку?'));
assert(page.includes("originalBody.innerHTML=d.content"));assert(!page.includes('body.prepend(requestContext(d))'));
console.log('PASS: all 320 originals byte-equivalent as records; 33 substantial revisions including all 12 latest lecture cards; source links and original access.');
