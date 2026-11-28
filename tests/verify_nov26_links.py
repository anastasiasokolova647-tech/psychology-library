import json,re,html,hashlib,subprocess
from pathlib import Path
from urllib.parse import unquote
from html.parser import HTMLParser
m=json.loads(Path('study/_work/november-integration/manifest.json').read_text())
docs=json.loads(re.search(r'const docs=(.*?);\nconst topics=',Path('index.html').read_text(),re.S)[1]);byid={d['id']:d for d in docs}
e=json.loads(Path('editorial.js').read_text().split('=',1)[1].strip().rstrip(';'))
class Parser(HTMLParser):
 def __init__(self):super().__init__();self.text=[];self.links=[]
 def handle_data(self,x):self.text.append(x)
 def handle_starttag(self,tag,attrs):
  self.links.extend(v for k,v in attrs if k=='href')
def norm(x):return re.sub(r'\s+','',html.unescape(x))
for f in m['sources']+m['added']+m['updated']:
 p=Path(f['path']);md=p.read_text();content=e[f['id']]['content'] if f in m['updated'] or f['id']=='nov26-knowledge-3' else byid[f['id']]['content'];parser=Parser();parser.feed(content);text=norm(' '.join(parser.text))
 for line in md.splitlines():
  line=re.sub(r'^#+\s*','',line).replace('[[','').replace(']]','').replace('**','')
  line=re.sub(r'\[([^\]]+)\]\([^)]+\)',r'\1',line).strip()
  if line:assert norm(line) in text,(f['path'],line)
 for href in parser.links:
  if href.startswith(('https://','http://')):continue
  if href.startswith('#note='):assert href[6:] in byid
  else:assert Path(unquote(href.split('#')[0])).is_file(),href
 for label,url in re.findall(r'\[([^\]]+)\]\(([^)]+)\)',md):
  if url.startswith('https://'):continue
  assert (p.parent/unquote(url.split('#')[0])).is_file(),(p,url)
 assert './'+str(p) in Path('sw.js').read_text()
for file in ['study/november-2026.md','materials/techniques/november-2026.md','study/_work/november-integration/legal-check.md']:
 p=Path(file)
 for label,url in re.findall(r'\[([^\]]+)\]\(([^)]+)\)',p.read_text()):
  if url.startswith('https://'):continue
  assert (p.parent/unquote(url.split('#')[0])).is_file(),(p,url)
  if '#note=' in url:assert url.split('#note=')[1] in byid
print('PASS: complete text of all 5 notes and 27 new/supplemental Markdown cards rendered; all new local links, canonical note targets and cache assets exist.')
