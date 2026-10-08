"""Prepare a separate Meet helper. Credentials never enter the extension package."""
import argparse
import json
import re
from pathlib import Path
import shlex
import shutil
import sys


def install(destination, manifests, credentials, account):
    if not re.fullmatch(r"[^\s@]+@[^\s@]+\.[^\s@]+", account): raise ValueError("Choose a valid Google account address")
    value = json.loads(credentials.read_text())
    if not value.get('installed', {}).get('client_id'): raise ValueError('Use a Desktop OAuth client JSON')
    destination.mkdir(parents=True, exist_ok=True, mode=0o700)
    source = Path(__file__).resolve().parent
    for name in ['meet_host.py', 'google_auth.py', 'gmail_host.py', 'keychain.py']:
        shutil.copyfile(source / name, destination / name); (destination / name).chmod(0o600)
    launcher = destination / 'launch'
    launcher.write_text('#!/bin/sh\nexec ' + shlex.quote(sys.executable) + ' -u ' + shlex.quote(str(destination / 'meet_host.py')) + ' "$@"\n')
    launcher.chmod(0o700)
    (destination / 'google-client.json').write_text(json.dumps(value)); (destination / 'google-client.json').chmod(0o600)
    (destination / 'meet-account.json').write_text(json.dumps({'email':account.lower()})); (destination / 'meet-account.json').chmod(0o600)
    manifests.mkdir(parents=True, exist_ok=True)
    payload = {'name': 'eu.thunderstream.meet', 'description': 'Thunderstream Google Meet links', 'path': str(launcher),
        'type': 'stdio', 'allowed_extensions': ['thunderstream-meet@local.invalid']}
    (manifests / 'eu.thunderstream.meet.json').write_text(json.dumps(payload, indent=2))


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--account', required=True, help='Google account that hosts the meetings; stored only locally')
    parser.add_argument('--credentials', required=True, type=Path)
    parser.add_argument('--prepare', type=Path, help='Prepare in a chosen directory without registering in Thunderbird')
    args = parser.parse_args()
    if sys.platform != 'darwin' and not args.prepare: parser.error('Mac only')
    base = args.prepare.resolve() if args.prepare else Path.home() / 'Library/Application Support/Thunderstream/meet'
    manifests = base / 'NativeMessagingHosts' if args.prepare else Path.home() / 'Library/Mozilla/NativeMessagingHosts'
    install(base, manifests, args.credentials, args.account)
    print('Meet helper prepared' if args.prepare else 'Meet helper installed')
