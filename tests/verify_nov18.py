"""Verify full November 18 notes, unchanged baseline and search queries."""
import hashlib,json,re,subprocess,html
from pathlib import Path
from html.parser import HTMLParser
m=json.loads(Path('study/_work/catalog-nov18.json').read_text())
def docs(s):return json.loads(re.search(r'const docs=(.*?);\nconst topics=',s,re.S)[1])
def base(p):return subprocess.check_output(['git','show',m['baseline_commit']+':'+p],text=True)
page=Path('index.html').read_text();now=docs(page);old=docs(base('index.html'))
assert len(now)==m['total_count']==382 and len(old)==m['baseline_count']==380
assert now[:380]==old and len({d['id'] for d in now})==382
assert {d['topicid']:d['topic'] for d in now}=={d['topicid']:d['topic'] for d in old}
strip=lambda s:re.sub(r'const docs=.*?;\nconst topics=','const docs=DATA;\nconst topics=',s,flags=re.S)
assert strip(page)==strip(base('index.html')).replace('380 матеріалів:','382 матеріали:').replace('client-requests-380.js','client-requests-382.js')
class Text(HTMLParser):
 def __init__(self):super().__init__();self.parts=[];self.links=[]
 def handle_data(self,s):self.parts.append(s)
 def handle_starttag(self,tag,attrs):
  if tag=='a':self.links.extend(v for k,v in attrs if k=='href')
def normalize(s):return re.sub(r'\s+','',html.unescape(s))
for c in m['added']:
 p=Path(c['path']);assert p.read_bytes()==subprocess.check_output(['git','show',m['baseline_commit']+':'+str(p)])
 assert hashlib.sha256(p.read_bytes()).hexdigest()==c['sha256']
 d=next(d for d in now if d['id']==c['id']);parsed=Text();parsed.feed(d['content']);rendered=normalize(' '.join(parsed.parts))
 assert d['topicid']==c['topicid']
 for line in p.read_text().splitlines():
  if not line.strip() or re.fullmatch(r'[|\s:\-]+',line):continue
  line=re.sub(r'^\s*(?:#{1,6} |\d+\. |- )','',line).replace('**','').replace('`','').replace('[[','').replace(']]','')
  cells=line.strip('|').split('|') if line.startswith('|') else [line]
  for cell in cells:assert normalize(cell) in rendered,(c['id'],cell)
 for link in parsed.links:
  if link.startswith('#note='):assert any(d['id']==link[6:] for d in now)
  else:assert Path(link).is_file(),link
 assert './'+str(p) in Path('sw.js').read_text()
assert Path('client-requests.js').read_bytes()==Path('client-requests-382.js').read_bytes()
js='''const fs=require('fs'),vm=require('vm'),assert=require('assert'),cp=require('child_process');
const docs=JSON.parse(fs.readFileSync('index.html','utf8').match(/const docs=(.*?);\\nconst topics=/s)[1]);
const c=vm.createContext({});vm.runInContext(fs.readFileSync('client-requests.js','utf8')+'\\n'+fs.readFileSync('search.js','utf8')+';this.meta=clientRequests;this.score=requestSearchScore',c);
const b=vm.createContext({});vm.runInContext(cp.execFileSync('git',['show',process.argv[1]+':client-requests.js']).toString()+';this.meta=clientRequests',b);
for(const id of Object.keys(b.meta))assert.equal(JSON.stringify(c.meta[id]),JSON.stringify(b.meta[id]));
for(const card of JSON.parse(fs.readFileSync('study/_work/catalog-nov18.json')).added){
 for(const q of card.queries){const ranked=docs.map(d=>({id:d.id,s:c.score(d,q,c.meta[d.id])})).sort((a,b)=>b.s-a.s);assert.equal(ranked[0].id,card.id,q)}
}
'''
subprocess.run(['node','-e',js,m['baseline_commit']],check=True)
print('PASS: 380 old cards and search entries identical; 2 full notes rendered; original Markdown unchanged; 6 queries rank first; local links and cache valid; no design changes.')
