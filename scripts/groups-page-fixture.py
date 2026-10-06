"""Copy production pages/background with a synthetic native API and local storage boundary."""
from pathlib import Path
import argparse
import shutil
ROOT=Path(__file__).resolve().parents[1]
parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('output',type=Path)
args=parser.parse_args()
shutil.copytree(ROOT/'extension',args.output,dirs_exist_ok=True)
shutil.copyfile(ROOT/'tests/fixtures/groups/boundary.js',args.output/'ui/fixture.js')
for name in ['account-groups','palette']:
 page=args.output/'ui'/f'{name}.html'
 content=page.read_text().replace(f'<script type="module" src="{name}.js">',f'<script type="module" src="{name}-entry.js">')
 marker='<section aria-label="Synthetic test boundary"><strong>Synthetic fixture, no mail or account access</strong><pre id="fixture-log" style="white-space:pre-wrap;overflow-wrap:anywhere;font-size:10px"></pre><a href="account-groups.html">Fixture manager</a> · <a href="palette.html">Fixture palette</a></section>'
 page.write_text(content.replace('</body>',marker+'</body>'))
 (args.output/'ui'/f'{name}-entry.js').write_text(f"await import('./fixture.js');\nawait import('./{name}.js');\n")
print(args.output)
