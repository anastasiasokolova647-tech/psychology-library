"""Run from the repository root: python3 tests/verify_catalog.py."""
import hashlib
import html
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import subprocess
import tempfile
from urllib.parse import unquote

BASELINE = '2793e10e44f8ec23ce53efb1dead1435bde86904'
SOURCE = 'materials/techniques/Озеро та сміття.md'

def catalog(page):
    return json.loads(re.search(r'const docs=(.*?);\nconst topics=', page, re.S)[1])

page = Path('index.html').read_text()
previous = subprocess.check_output(['git', 'show', BASELINE + ':index.html']).decode()
old, current = catalog(previous), catalog(page)
assert len(old) == 303 and len(current) == 320
assert len({d['topic'] for d in current}) == 25
assert len({d['id'] for d in current}) == 320
by_id = {d['id']: d for d in current}
for doc in old:
    assert by_id[doc['id']] == doc, 'Changed or missing original: ' + doc['id']
    assert doc['content'].strip(), 'Empty original: ' + doc['id']
new = by_id['lake-and-litter']
assert new['topic'] == 'Особисті межі'
for query in ['критика', 'образа', 'румінація', 'психологічні межі', 'емоційна регуляція', 'метафоричні техніки']:
    assert query in new['search'], query
assert 'Авторська образна вправа' in new['content']
assert 'окремо не валідована' in new['content'].lower()

class Text(HTMLParser):
    def __init__(self):
        super().__init__(); self.parts = []
    def handle_data(self, data):
        self.parts.append(data)
parser = Text(); parser.feed(new['content'])
rendered = ' '.join(''.join(parser.parts).split())
source = Path(SOURCE).read_text()
body = re.sub(r'^---\n.*?\n---\n', '', source, flags=re.S)
for line in body.splitlines():
    line = re.sub(r'^(?:#{1,6} |>|- |\d+\. )', '', line).strip()
    line = line.replace('**', '').replace('[[', '').replace(']]', '')
    if line:
        assert ' '.join(line.split()) in rendered, 'Missing exercise text: ' + line
assert Path(SOURCE).read_bytes() == subprocess.check_output(['git', 'show', '91426bc:' + SOURCE])

for href in re.findall(r'href="([^"]+)"', page.split('const docs=')[0] + new['content']):
    if href.startswith('./'):
        assert Path(unquote(href[2:])).is_file(), href
scripts = re.findall(r'<script>(.*?)</script>', page, re.S)
for script in scripts:
    with tempfile.NamedTemporaryFile(suffix='.js', mode='w') as file:
        file.write(script); file.flush()
        subprocess.run(['node', '--check', file.name], check=True)
subprocess.run(['node', '--check', 'sw.js'], check=True)
print('PASS: 303 original records identical (including full HTML text, IDs and search); 25 topics; 320 unique records.')
print('PASS: every exercise line preserved; original Markdown unchanged; all 6 search terms; status; local links; JS syntax.')
print('Original content SHA256:', hashlib.sha256(''.join(d['content'] for d in old).encode()).hexdigest())
