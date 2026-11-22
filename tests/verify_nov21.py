"""Preserve the full pre-Nov21 catalog and validate the four additions."""
import hashlib, json, re, subprocess
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import unquote
root = Path('materials/lectures/2026-11-21')
m = json.loads((root/'manifest.json').read_text())
def catalog(page):
    return json.loads(re.search(r'const docs=(.*?);\nconst topics=',page,re.S)[1])
def baseline(path):
    return subprocess.check_output(['git','show',m['baseline_commit']+':'+path],text=True)
page = Path('index.html').read_text()
docs, old = catalog(page), catalog(baseline('index.html'))
assert len(old)==m['baseline_count']==376
assert m['total_count']==380 and len(docs)==382
assert docs[:376]==old, 'Old card changed or removed'
assert len({d['id'] for d in docs})==382
assert len({d['topicid'] for d in docs})==25
assert len({d['title'].casefold() for d in docs[376:380]})==4
assert not ({d['title'].casefold() for d in docs[376:380]} & {d['title'].casefold() for d in old})
assert {d['topicid']:d['topic'] for d in docs}=={d['topicid']:d['topic'] for d in old}
# Outside embedded data, only header count/date and versioned metadata may change.
strip=lambda s: re.sub(r'const docs=.*?;\nconst topics=', 'const docs=DATA;\nconst topics=',s,flags=re.S)
expected=strip(baseline('index.html')).replace('376 матеріалів:','382 матеріали:').replace('04–07.11.2026.','04–07 та 21.11.2026.').replace('client-requests-376.js','client-requests-382.js')
assert strip(page)==expected, 'Unrelated app or design change'
source=str(root/'psychological-rehabilitation.md')
assert Path(source).read_text().startswith(baseline(source)), 'Original lecture rewritten'
class Text(HTMLParser):
    def __init__(self): super().__init__(); self.parts=[]
    def handle_data(self,s): self.parts.append(s)
for c in m['added']:
    md=Path(c['path']).read_text()
    assert hashlib.sha256(Path(c['path']).read_bytes()).hexdigest()==c['sha256']
    d=next(d for d in docs if d['id']==c['id'])
    assert d['topicid']==c['topicid'] and c['path'] in d['content']
    t=Text();t.feed(d['content']);rendered=''.join(t.parts)
    for line in md.splitlines():
        line=re.sub(r'^\s*(?:#{1,6} |\d+\. |- )','',line)
        line=re.sub(r'\[([^\]]+)\]\([^)]+\)',r'\1',line).replace('**','').strip()
        if line: assert re.sub(r'\s+','',line) in re.sub(r'\s+','',rendered), (d['id'],line)
    for href in re.findall(r'href="([^"]+)"',d['content']):
        if not href.startswith(('https://','#')): assert Path(unquote(href)).is_file(),href
    assert './'+c['path'] in Path('sw.js').read_text()
assert Path('client-requests.js').read_bytes()==Path('client-requests-382.js').read_bytes()
# Existing search entries are equal as objects, not merely still present.
js="""const fs=require('fs'),vm=require('vm'),assert=require('assert'),cp=require('child_process');
function read(s){const c=vm.createContext({});vm.runInContext(s+';this.data=clientRequests;',c);return JSON.parse(JSON.stringify(c.data))}
const old=read(cp.execFileSync('git',['show',process.argv[1]+':client-requests.js']).toString());
const now=read(fs.readFileSync('client-requests.js','utf8'));for(const id of Object.keys(old))assert.deepStrictEqual(now[id],old[id]);"""
subprocess.run(['node','-e',js,m['baseline_commit']],check=True)
print('PASS: all 376 old cards and search entries unchanged; 4 full-text additions; 382 unique IDs; 25 topics; original lecture preserved; no design/app changes; downloads/cache valid.')
