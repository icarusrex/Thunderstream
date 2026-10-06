"""Build production reference page/service with synthetic native headers and reader opening."""
from pathlib import Path
import argparse
import shutil
ROOT=Path(__file__).resolve().parents[1]
parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('output',type=Path)
args=parser.parse_args()
shutil.copytree(ROOT/'extension',args.output,dirs_exist_ok=True)
shutil.copyfile(ROOT/'tests/fixtures/references/boundary.js',args.output/'ui/fixture.js')
page=args.output/'ui/references.html'
content=page.read_text().replace('<script type="module" src="references.js">','<script type="module" src="references-entry.js">')
marker='<section aria-label="Synthetic test boundary"><strong>Synthetic fixture, no real mail or reader access</strong><pre id="fixture-log" style="white-space:pre-wrap;overflow-wrap:anywhere;font-size:10px"></pre><div class="row"><a href="references.html?mode=retry">Retry fixture</a><a href="references.html?mode=duplicates">Duplicate fixture</a><a href="references.html?mode=empty">Empty fixture</a><a href="references.html?mode=offline">Offline fixture</a></div></section>'
page.write_text(content.replace('</body>',marker+'</body>'))
(args.output/'ui/references-entry.js').write_text("await import('./fixture.js');\nawait import('./references.js');\n")
print(args.output)
