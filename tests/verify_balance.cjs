const fs=require('fs'),assert=require('assert'),cp=require('child_process'),vm=require('vm');
const dir='study/methods/balance_emotional_worlds/',key=JSON.parse(fs.readFileSync(dir+'key.json')),score=require('../'+dir+'scoring.js').score;
assert.equal(key.states.length,35);assert.equal(new Set(key.worlds.flatMap(w=>w.states)).size,35);key.worlds.forEach(w=>assert.equal(w.states.length,7));
for(const value of [1,7]){const a=Object.fromEntries(key.states.map(s=>[s,value]));assert(score(key,a).worlds.every(w=>w.total===7*value));}
assert(score(key,{}).worlds.every(w=>w.total===null));
for(const state of key.states){const a=Object.fromEntries(key.states.map(s=>[s,1]));a[state]=7;const r=score(key,a);r.worlds.forEach((w,i)=>assert.equal(w.total,key.worlds[i].states.includes(state)?13:7));delete a[state];assert.equal(score(key,a).worlds.filter(w=>w.total===null).length,1);for(const value of [0,8,1.5,'7',null]){a[state]=value;assert.equal(score(key,a).answered,34);}}
const base=p=>cp.execFileSync('git',['show','94b6705:'+p],{encoding:'utf8',maxBuffer:8000000}),read=p=>fs.readFileSync(p,'utf8');const parse=s=>JSON.parse(s.match(/const docs=(.*?);\nconst topics=/s)[1]);const old=parse(base('index.html')),docs=parse(read('index.html'));assert.deepStrictEqual(docs.slice(0,407),old);assert.equal(docs.length,408);
const hw='study/homework/Домашнє завдання — Баланс Емоційних Світів.md';assert.deepStrictEqual(read(hw).match(/^\| \d+ \|.*$/gm),base(hw).match(/^\| \d+ \|.*$/gm));
for(const p of cp.execFileSync('git',['-c','core.quotePath=false','ls-tree','-r','--name-only','94b6705','study/notes'],{encoding:'utf8'}).trim().split('\n'))assert.equal(read(p),base(p));
assert.equal(read(dir+'README.md'),base(dir+'README.md'));
const ctx=vm.createContext({});vm.runInContext(read('editorial.js')+';this.ed=editorialRecords;'+read('client-requests.js')+';this.meta=clientRequests;'+read('search.js')+';this.score=requestSearchScore;',ctx);
const d=docs.find(d=>d.id==='balance-emotional-worlds');for(const q of ['Баланс Емоційних Світів','Не розумію свої емоції','Емоційне виснаження','Самотність','Тривога'])assert(ctx.score(d,q,ctx.meta[d.id])>0,q);
const html=ctx.ed['nov26-note-1'].content;assert(html.includes('Таблиці Шульте')&&html.includes('Перша і друга сигнальні системи'));
for(let i=2;i<=5;i++)assert(ctx.ed['nov26-note-'+i].content.includes(old.find(d=>d.id==='nov26-note-'+i).content));
console.log('PASS: all 35 assignments, extremes, missing/invalid scores, 407 old records, all source notes, personal answers, search and supplements.');
