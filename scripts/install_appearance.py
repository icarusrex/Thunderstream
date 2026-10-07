"""Install/remove native appearance on a stopped Thunderbird profile.

Manages CSS and one appearance preference, without JavaScript or account changes.
"""
import argparse
import base64
import configparser
import hashlib
import json
from pathlib import Path
import re
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
VERSION = '157.0.1'
BUILD = '20261001134409'
BEGIN = b'/* BEGIN THUNDERSTREAM APPEARANCE */\n'
END = b'/* END THUNDERSTREAM APPEARANCE */\n'
IMPORT = BEGIN + b'@import url("thunderstream.css");\n' + END
PREF_NAME = 'toolkit.legacyUserProfileCustomizations.stylesheets'
PREF = f'user_pref("{PREF_NAME}", true);\n'
PREF_RE = re.compile(r'^user_pref\("toolkit\.legacyUserProfileCustomizations\.stylesheets", (true|false)\);[ \t]*\n?', re.M)


def stopped(profile):
    lock = profile / '.parentlock'
    if not lock.exists():
        return
    lsof = Path('/usr/sbin/lsof')
    if not lsof.exists():
        raise ValueError('Cannot verify profile is stopped on this platform')
    result = subprocess.run([str(lsof), '-t', '--', str(lock)], capture_output=True, text=True)
    if any(word in result.stderr.lower() for word in ['permission denied', 'operation not permitted']):
        raise ValueError('Cannot verify profile is stopped with current process permissions')
    if result.returncode == 0 and result.stdout.strip():
        raise ValueError('Quit Thunderbird before changing its appearance')
    if result.returncode not in (0, 1):
        raise ValueError('Cannot verify profile is stopped')


def remove_import(data):
    if data.count(BEGIN) != 1 or data.count(END) != 1:
        raise ValueError('Appearance import was edited; refusing to overwrite custom CSS')
    start = data.index(BEGIN)
    end = data.index(END, start) + len(END)
    if data[start:end] != IMPORT:
        raise ValueError('Appearance import was edited; refusing to overwrite custom CSS')
    return data[:start] + data[end:]


def atomic_write(path, data):
    temporary = path.with_name(path.name + '.thunderstream-tmp')
    try:
        temporary.write_bytes(data)
        temporary.replace(path)
    finally:
        temporary.unlink(missing_ok=True)


def write_changes(changes):
    """Restore completed writes if a later file operation fails."""
    before = {path: path.read_bytes() if path.exists() else None for path in changes}
    written = []
    try:
        for path, data in changes.items():
            if data is None:
                path.unlink(missing_ok=True)
            else:
                atomic_write(path, data)
            written.append(path)
    except OSError:
        for path in reversed(written):
            if before[path] is None:
                path.unlink(missing_ok=True)
            else:
                atomic_write(path, before[path])
        raise


def apply(mode, profile, app_info, stylesheet):
    profile = profile.resolve(strict=True)
    prefs = profile / 'prefs.js'
    if not prefs.is_file():
        raise ValueError('Target must be an existing Thunderbird profile with prefs.js')
    chrome = profile / 'chrome'
    css = chrome / 'userChrome.css'
    skin = chrome / 'thunderstream.css'
    state_file = chrome / 'thunderstream-appearance.json'
    if mode == 'status':
        print('Appearance installed' if state_file.exists() else 'Appearance not installed')
        return
    stopped(profile)
    state = json.loads(state_file.read_text()) if state_file.exists() else None
    if state and skin.exists() and hashlib.sha256(skin.read_bytes()).hexdigest() not in state.get('known_skin_hashes', [state['stylesheet_sha256']]):
        raise ValueError('Managed stylesheet has user edits; preserve them before updating or removing')
    original_prefs = prefs.read_text()
    if mode == 'remove':
        if not state:
            print('Appearance already absent')
            return
        css_now = css.read_bytes() if css.exists() else b''
        restored_css = remove_import(css_now) if BEGIN in css_now or END in css_now else css_now
        pref_now = PREF_RE.search(original_prefs)
        # Preserve any subsequent user change to the appearance preference.
        if pref_now and pref_now.group(1) == 'true':
            restored_prefs = PREF_RE.sub(lambda _: state['pref_before'] or '', original_prefs)
        else:
            restored_prefs = original_prefs
        write_changes({
            prefs: restored_prefs.encode(),
            css: restored_css if restored_css or state['userchrome_existed'] else None,
            skin: base64.b64decode(state['skin_before']) if state['skin_before'] is not None else None,
            state_file: None,
        })
        print('Appearance removed; prior styling restored')
        return
    app = configparser.ConfigParser()
    app.read(app_info)
    if (app.get('App', 'Name', fallback='') != 'Thunderbird'
            or app.get('App', 'Version', fallback='') != VERSION
            or app.get('App', 'BuildID', fallback='') != BUILD):
        raise ValueError(f'Unsupported Thunderbird build; expected {VERSION} / {BUILD}')
    payload = stylesheet.read_bytes()
    current_css = css.read_bytes() if css.exists() else b''
    if state:
        if BEGIN in current_css or END in current_css:
            remove_import(current_css)
            new_css = current_css
        else:
            new_css = IMPORT + current_css
    else:
        if BEGIN in current_css or END in current_css:
            raise ValueError('Existing appearance import has no restoration record')
        before = PREF_RE.search(original_prefs)
        state = {'version': 1, 'pref_before': before.group(0) if before else None,
                 'userchrome_existed': css.exists(),
                 'skin_before': base64.b64encode(skin.read_bytes()).decode() if skin.exists() else None}
        new_css = IMPORT + current_css
    if PREF_RE.search(original_prefs):
        new_prefs = PREF_RE.sub(PREF, original_prefs)
    else:
        new_prefs = original_prefs + PREF
    state['stylesheet_sha256'] = hashlib.sha256(payload).hexdigest()
    # A killed process may leave either side of a stylesheet replacement.
    # Recognize only the exact installed, preceding, and original bytes.
    state['known_skin_hashes'] = [state['stylesheet_sha256']]
    if skin.exists():
        state['known_skin_hashes'].append(hashlib.sha256(skin.read_bytes()).hexdigest())
    if state['skin_before'] is not None:
        state['known_skin_hashes'].append(hashlib.sha256(base64.b64decode(state['skin_before'])).hexdigest())
    chrome.mkdir(exist_ok=True)
    # Persist restoration data before modifying the files it protects.
    write_changes({state_file: (json.dumps(state, indent=2) + '\n').encode(),
                   skin: payload, css: new_css, prefs: new_prefs.encode()})
    print(f'Appearance installed for Thunderbird {VERSION}; start Thunderbird to apply')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('mode', choices=['install', 'remove', 'status'])
    parser.add_argument('--profile', type=Path, required=True)
    parser.add_argument('--app-info', type=Path, default=Path('/Applications/Thunderbird.app/Contents/Resources/application.ini'))
    parser.add_argument('--stylesheet', type=Path, default=ROOT / 'ui-compat/styles/chrome.css')
    args = parser.parse_args()
    try:
        apply(args.mode, args.profile, args.app_info, args.stylesheet)
    except (ValueError, OSError, KeyError, configparser.Error) as error:
        print(str(error), file=sys.stderr)
        return 1
    return 0


if __name__ == '__main__':
    sys.exit(main())
