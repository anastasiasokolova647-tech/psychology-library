"""Verify the complete 369-card baseline and Nov6 source coverage."""
import json,re,hashlib,html
from pathlib import Path
root=Path('materials/lectures/2026-11-06')
m=json.loads((root/'manifest.json').read_text())
docs=json.loads(re.search(r'const docs=(.*?);\nconst topics=',Path('index.html').read_text(),re.S)[1])
assert len(docs)==376 and len({d['topicid'] for d in docs})==25
assert hashlib.sha256(json.dumps(docs[:369],ensure_ascii=False,sort_keys=True).encode()).hexdigest()==m['baseline_sha256']
byid={d['id']:d for d in docs};notes=(root/'notes.md').read_text()
for item in m['added']:
 d=byid[item['id']];body=notes.split('## '+item['section']+'\n')[1].split('\n\n**Запити:**')[0]
 assert body in html.unescape(d['content']) and body in (root/(d['id']+'.md')).read_text()
 assert d['topicid']==item['topicid']
for id in m['duplicate']['existing']:assert id in byid
assert not any(d['title']==m['duplicate']['section'] for d in docs[369:])
assert Path('client-requests.js').read_bytes()==Path('client-requests-376.js').read_bytes()
print('PASS: all 369 previous records identical; 5 complete source topics; existing psychosis coverage retained; versioned search index matches.')
