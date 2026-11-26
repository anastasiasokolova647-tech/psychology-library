const fs=require('fs'),vm=require('vm'),assert=require('assert'),cp=require('child_process');
const m=JSON.parse(fs.readFileSync('study/_work/november-integration/manifest.json'));
const read=p=>fs.readFileSync(p,'utf8'),base=p=>cp.execFileSync('git',['show',m.baseline_commit+':'+p],{encoding:'utf8',maxBuffer:8000000});
const parse=s=>JSON.parse(s.match(/const docs=(.*?);\nconst topics=/s)[1]);
const page=read('index.html'),docs=parse(page),old=parse(base('index.html'));
assert.equal(old.length,382);assert.deepStrictEqual(docs.slice(0,382),old);assert.equal(docs.length,407);assert.equal(new Set(docs.map(x=>x.id)).size,407);
assert.equal(new Set(docs.map(x=>x.topic)).size,25);
const ctx=vm.createContext({});vm.runInContext(read('editorial.js')+'\n'+read('client-requests.js')+'\n'+read('search.js')+';this.ed=editorialRecords;this.meta=clientRequests;this.score=requestSearchScore;',ctx);
const prev=vm.createContext({});vm.runInContext(base('editorial.js')+';this.ed=editorialRecords;',prev);
const updated=new Set(m.updated.map(x=>x.id));
for(const [id,e] of Object.entries(prev.ed)){
 if(updated.has(id))assert(ctx.ed[id].content.includes(e.content),id);
 else assert.equal(JSON.stringify(ctx.ed[id]),JSON.stringify(e),id);
}
for(const e of m.updated){assert(ctx.ed[e.id].content.includes(e.title));assert(ctx.ed[e.id].content.includes(prev.ed[e.id]?.content||old.find(d=>d.id===e.id).content));}
for(const f of m.sources){assert.equal(read(f.path),base(f.path));assert.equal(require('crypto').createHash('sha256').update(fs.readFileSync(f.path)).digest('hex'),f.sha256);}
const score=(d,q)=>ctx.score({...d,search:d.search+' '+(ctx.ed[d.id]?.search||'')},q,ctx.meta[d.id]);
for(const [alias,id] of Object.entries(m.aliases)){assert(docs.some(d=>d.id===id));assert(score(docs.find(d=>d.id===id),alias)>0,alias);}
for(const q of ['Горе','Втрата близької людини','Самотність','Втрата дому','Туга','Виснаження','Втрата сенсу','Труднощі концентрації','Проблеми з пам’яттю','Прокрастинація','Труднощі із завершенням справ']){
 assert(docs.some(d=>(m.added.some(x=>x.id===d.id)||updated.has(d.id))&&score(d,q)>0),q);
}
const strip=s=>s.replace(/const docs=.*?;\nconst topics=/s,'const docs=DATA;\nconst topics=').replace('407 матеріалів:','382 матеріали:');
assert.equal(strip(page),strip(base('index.html')),'Unrelated design or application change');
for(const f of ['app.js','data.js','search.js','style.css'])assert.equal(read(f),base(f));
for(const x of [...m.added,...m.updated]){const md=read(x.path);assert(md.includes('## Межі застосування'));assert(md.includes('## Практичне значення та інсайт'));assert(!/Діана:|Андрій Судак:/.test(md));}
console.log('PASS: 382 original records identical; 25 new entries (20 knowledge/technique cards + 5 full notes); 7 supplements; all 11 state queries; alias coverage; no application/design changes.');
