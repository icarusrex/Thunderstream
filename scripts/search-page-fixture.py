"""Build a synthetic browser fixture from the production Gmail search page."""
from pathlib import Path
import argparse
import shutil

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('output', type=Path, help='Temporary fixture output directory')
args = parser.parse_args()
args.output.mkdir(parents=True, exist_ok=True)
for name in ['gmail-search.html', 'gmail-search.js', 'gmail-search.css', 'base.css', 'dom.js']:
    shutil.copyfile(ROOT / 'extension/ui' / name, args.output / name)
shutil.copyfile(ROOT / 'tests/fixtures/gmail-search/boundary.js', args.output / 'fixture.js')
page = args.output / 'gmail-search.html'
content = page.read_text().replace('<script type="module" src="gmail-search.js">', '<script src="fixture.js"></script><script type="module" src="gmail-search.js">')
content = content.replace('</main>', '<section aria-label="Synthetic test boundary"><strong>Synthetic fixture, no account access</strong><button type="button" id="release">Release delayed response</button><pre id="fixture-log" style="white-space:pre-wrap;overflow-wrap:anywhere"></pre></section></main>')
page.write_text(content)
print(args.output)
