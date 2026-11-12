import json,re,hashlib,html
from html.parser import HTMLParser
from pathlib import Path
class Text(HTMLParser):
 def __init__(self):super().__init__();self.parts=[]
 def handle_data(self,s):self.parts.append(s)
page=Path('index.html').read_text();docs=json.loads(re.search(r'const docs=(.*?);\nconst topics=',page,re.S)[1]);m=json.loads(Path('materials/lectures/2026-11-07/manifest.json').read_text())
assert len(docs)==376 and len({d['topicid'] for d in docs})==25
assert hashlib.sha256(json.dumps(docs[:374],ensure_ascii=False,sort_keys=True).encode()).hexdigest()==m['baseline_sha256']
for c in m['cards']:
 source=Path(c['path']);assert hashlib.sha256(source.read_bytes()).hexdigest()==c['sha256']
 d=next(d for d in docs if d['id']==c['id']);p=Text();p.feed(d['content']);text=' '.join(' '.join(p.parts).split())
 for line in source.read_text().splitlines():
  if not line.strip() or re.fullmatch(r'[|\s:\-]+',line):continue
  line=re.sub(r'^#{1,6} ','',line);line=re.sub(r'\[([^\]]+)\]\(https://[^)]+\)',r'\1',line);line=line.replace('**','').replace('`','')
  for cell in (line.strip('|').split('|') if line.startswith('|') else [line]):assert re.sub(r'\s+', '', cell) in re.sub(r'\s+', '', text),(c['id'],cell)
 assert c['path'] in d['content'] and './'+c['path'] in Path('sw.js').read_text()
assert Path('client-requests.js').read_bytes()==Path('client-requests-376.js').read_bytes()
print('PASS: 374 old cards unchanged; both complete sources preserved; all source text rendered; 376 cards, 25 topics; cache and downloads valid.')
