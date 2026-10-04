"""Explicit per-user installation; --dry-run prepares files inside a chosen folder."""
import argparse
import json
import os
from pathlib import Path
import shlex
import shutil
import sys


def install(destination, manifest_dir, credentials=None):
    destination.mkdir(parents=True, exist_ok=True, mode=0o700)
    source = Path(__file__).resolve().parent
    for name in ['gmail_host.py', 'google_auth.py', 'keychain.py']:
        shutil.copyfile(source / name, destination / name)
        (destination / name).chmod(0o600)
    launcher = destination / 'launch'
    launcher.write_text('#!/bin/sh\nexec ' + shlex.quote(sys.executable) + ' -u ' + shlex.quote(str(destination / 'gmail_host.py')) + ' "$@"\n')
    launcher.chmod(0o700)
    if credentials:
        value = json.loads(credentials.read_text())
        if not value.get('installed', {}).get('client_id'): raise ValueError('Use a Desktop OAuth client JSON.')
        (destination / 'google-client.json').write_text(json.dumps(value))
        (destination / 'google-client.json').chmod(0o600)
    manifest_dir.mkdir(parents=True, exist_ok=True)
    manifest = {'name': 'eu.thunderstream.gmail_search', 'description': 'Thunderstream read-only Gmail search', 'path': str(launcher), 'type': 'stdio', 'allowed_extensions': ['thunderstream@local.invalid']}
    (manifest_dir / 'eu.thunderstream.gmail_search.json').write_text(json.dumps(manifest, indent=2))
    return manifest


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--credentials', type=Path)
    parser.add_argument('--dry-run', type=Path)
    args = parser.parse_args()
    if sys.platform != 'darwin' and not args.dry_run: parser.error('This helper supports macOS only.')
    base = args.dry_run.resolve() if args.dry_run else Path.home() / 'Library' / 'Application Support' / 'Thunderstream' / 'gmail-search'
    manifests = base / 'NativeMessagingHosts' if args.dry_run else Path.home() / 'Library' / 'Mozilla' / 'NativeMessagingHosts'
    install(base, manifests, args.credentials)
    print('Prepared helper files.' if args.dry_run else 'Installed helper for the current user.')
