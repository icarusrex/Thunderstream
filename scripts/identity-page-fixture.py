"""Build the production sender chooser with a synthetic runtime boundary."""
from pathlib import Path
import argparse
import shutil

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('output', type=Path, help='Temporary fixture directory')
args = parser.parse_args()
args.output.mkdir(parents=True, exist_ok=True)
for name in ['identities.html', 'identities.js', 'identities.css', 'base.css', 'dom.js']:
    shutil.copyfile(ROOT / 'extension/ui' / name, args.output / name)
shutil.copyfile(ROOT / 'tests/fixtures/identities/boundary.js', args.output / 'fixture.js')
page = args.output / 'identities.html'
content = page.read_text().replace('<script type="module" src="identities.js">', '<script src="fixture.js"></script><script type="module" src="identities.js">')
content = content.replace('</main>', '<section aria-label="Synthetic test boundary"><strong>Synthetic fixture, no compose or mail access</strong><pre id="fixture-log" style="white-space:pre-wrap;overflow-wrap:anywhere"></pre></section></main>')
page.write_text(content)
print(args.output)
