from pathlib import Path
from urllib.parse import urlsplit
import json
import re

ROOT = Path(__file__).resolve().parents[1]


def local_resource(root, parent, value):
    assert not urlsplit(value).scheme, f'External executable import/resource: {value}'
    path = (parent / urlsplit(value).path).resolve()
    assert path.is_relative_to(root.resolve()), f'Resource leaves package: {value}'
    assert path.is_file(), f'Missing resource: {value}'


def validate_package(root, *, allow_experiments=False):
    root = Path(root)
    manifest = json.loads((root / 'manifest.json').read_text())
    assert manifest['manifest_version'] == 2, 'Unsupported manifest format'
    allowed = {'storage', 'accountsRead', 'messagesRead', 'messagesUpdate', 'messagesTagsList', 'messagesMove', 'compose', 'compose.send'}
    assert set(manifest.get('permissions', []) + manifest.get('optional_permissions', [])) <= allowed, 'Unexpected permission'
    assert allow_experiments or 'experiment_apis' not in manifest, 'Experiments require explicit companion opt-in'
    if 'theme' in manifest:
        assert not any(k in manifest for k in ['background', 'browser_action', 'compose_action', 'message_display_action', 'experiment_apis', 'permissions', 'optional_permissions']), 'Theme must not contain extension logic'
        assert all(p.suffix in ['.json', '.png', '.svg', '.jpg'] for p in root.rglob('*') if p.is_file()), 'Executable theme content'
    paths = []
    if 'background' in manifest:
        paths.append(manifest['background']['page'])
    for key in ['browser_action', 'compose_action', 'message_display_action']:
        if 'default_popup' in manifest.get(key, {}):
            paths.append(manifest[key]['default_popup'])
    if 'options_ui' in manifest:
        paths.append(manifest['options_ui']['page'])
    for experiment in manifest.get('experiment_apis', {}).values():
        paths.append(experiment['schema'])
        for scope in ['parent', 'child']:
            if 'script' in experiment.get(scope, {}):
                paths.append(experiment[scope]['script'])
    for path in paths:
        local_resource(root, root, path)
    imports = re.compile(r'''(?:\bfrom\s*|\bimport\s*(?:\(\s*)?)["']([^"']+)["']''')
    for path in root.rglob('*'):
        if path.suffix not in ['.html', '.js']:
            continue
        content = path.read_text()
        assert not re.search(r'''<script[^>]+src=["']https?://''', content), f'Remote script: {path}'
        if path.suffix == '.html':
            for target in re.findall(r'''(?:src|href)=["']([^"'#]+)["']''', content):
                if not target.startswith(('http:', 'https:')):
                    local_resource(root, path.parent, target)
        else:
            for target in imports.findall(content):
                assert target.startswith('.'), f'Non-local JS import: {target}'
                local_resource(root, path.parent, target)
    return manifest


if __name__ == '__main__':
    for name in ['extension', 'themes/light', 'themes/dark', 'ui-compat']:
        validate_package(ROOT / name, allow_experiments=name == 'ui-compat')
    print('Package validation passed')
