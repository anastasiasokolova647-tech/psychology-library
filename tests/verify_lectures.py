"""Verify additive import of the 24 October lecture notes."""
import json,re,subprocess,hashlib
from pathlib import Path
root=Path('materials/lectures/2026-10-24')
page=Path('index.html').read_text()
def docs(s):return json.loads(re.search(r'const docs=(.*?);\nconst topics=',s,re.S)[1])
current=docs(page); by_id={d['id']:d for d in current}
before=docs(subprocess.check_output(['git','show','7f8a6722ecdd7735af4bf6bceebe7ab8c698f036:index.html'],text=True))
assert len(current)==320 and len(before)==304
for d in before:assert by_id[d['id']]==d,d['id']
manifest=json.loads((root/'manifest.json').read_text())
assert len(manifest['ids'])==16
for prefix,source in [('lecture','source-notes.md'),('supplement','supplement-notes.md')]:
 sections=re.findall(r'^## (.+)\n([\s\S]*?)(?=^## |\Z)',(root/source).read_text(),re.M)
 for i,(title,body) in enumerate(sections,1):
  id=f'{prefix}-20261024-{i}'
  assert body.strip() in (root/(id+'.md')).read_text(),id
  assert by_id[id]['content'] and by_id[id]['search']
  for href in re.findall(r'href="(\./[^\"]+)"',by_id[id]['content']):assert Path(href).exists(),href
assert hashlib.sha256((root/'source-notes.md').read_bytes()).hexdigest()=='697b0cce2fe00f3f04fdf517769f7406ba74c287b89ed340913d0a6ad68e251e'
assert 'обидві версії збережено' in by_id['supplement-20261024-4']['content']
assert 'обов’язкового лінійного шляху' in by_id['supplement-20261024-2']['content']
print('PASS: all 304 preceding records unchanged; all 12 source sections and 4 supplemental fragments preserved; source SHA256; downloads; editorial distinctions. Total 320.')
