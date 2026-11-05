"""Verify preservation, source coverage and full-text imports for Oct28/Nov4."""
import json,re,subprocess
from pathlib import Path
from html.parser import HTMLParser
parse=lambda s:json.loads(re.search(r'const docs=(.*?);\nconst topics=',s,re.S)[1])
docs=parse(Path('index.html').read_text());old=parse(subprocess.check_output(['git','show','c1640c4:index.html'],text=True))
assert docs[:320]==old and len(docs)==365
class Reader(HTMLParser):
 def __init__(self):super().__init__();self.text=[];self.headers=[];self.heading=False
 def handle_starttag(self,t,a):
  if t=='h2':self.heading=True
 def handle_endtag(self,t):
  if t=='h2':self.heading=False
 def handle_data(self,s):
  self.text.append(s)
  if self.heading:self.headers.append(s)
for d in docs[320:]:
 date={'20261028':'2026-10-28','20261031':'2026-10-31','20261104':'2026-11-04','20261105':'2026-11-05'}[d['id'].split('-')[1]]
 md=Path('materials/lectures')/date/(d['id']+'.md')
 body=md.read_text().split('\n\n',1)[1].split('\n\n---')[0]
 p=Reader();p.feed(d['content']);text=' '.join(' '.join(p.text).split())
 for line in body.splitlines():
  line=re.sub(r'^(## |- )','',line).strip()
  if line:assert ' '.join(line.split()) in text,(d['id'],line)
 assert len(text)>900 and all(len(h)<150 for h in p.headers),d['id']
 for href in re.findall(r'href="(materials/[^"]+)"',d['content']):assert Path(href).exists(),href
manifest=json.loads(Path('materials/lectures/2026-11-04/manifest.json').read_text())
assert len(manifest['sources'])==6
assert sum('duplicate_of' in s for s in manifest['sources'])==1
for s in manifest['sources']:
 assert s['cards']
 for id in s['cards']:assert any(d['id']==id for d in docs)
sw=Path('sw.js').read_text()
for path in re.findall(r'[\'\"](\./[^\'\"]+)[\'\"]',sw):
 if path not in ('./',):assert Path(path).exists(),path
assert "new URL('./index.html', BASE)" in sw
print('PASS: original 320 records unchanged; 45 full-text cards; source coverage; duplicate detected; headings, downloads and cache assets valid.')
