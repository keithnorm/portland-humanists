#!/usr/bin/env python3
"""Extract Drupal user login credentials (username, email, password hash)
for the lazy-migration auth bridge.

Usage:
    python3 scripts/extract-auth-from-dump.py <dump.sql>

Writes .data/auth-bridge.json (gitignored): active accounts only, keyed for
lookup by username or email. Prints only aggregate counts. In production
this file is loaded into Netlify Blobs, never committed — the repo is public.
"""
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from importlib import import_module
extract = import_module('extract-members-from-dump')


def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    dump = Path(sys.argv[1]).read_text(encoding='utf8', errors='replace')

    # users: uid, name, pass, mail, theme, signature, signature_format,
    #        created, access, login, status, ...
    accounts = []
    skipped = {'blocked': 0, 'no_hash': 0}
    for row in extract.inserts_for(dump, 'users'):
        uid, name, pw_hash, mail = row[0], row[1], row[2], row[3]
        status = row[10]
        if uid == '0' or not name:
            continue
        if status != '1':
            skipped['blocked'] += 1
            continue
        if not pw_hash or not (pw_hash.startswith('$S$') or pw_hash.startswith('U$S$')):
            skipped['no_hash'] += 1
            continue
        accounts.append({
            'username': name,
            'email': (mail or '').lower(),
            'hash': pw_hash,
        })

    out = Path('.data/auth-bridge.json')
    out.parent.mkdir(exist_ok=True)
    out.write_text(json.dumps(accounts, indent=2))
    with_email = sum(1 for a in accounts if a['email'])
    print(f"Active accounts with usable hashes: {len(accounts)} ({with_email} with email)")
    print(f"Skipped: {skipped['blocked']} blocked, {skipped['no_hash']} without a Drupal hash")
    print(f"Wrote {out} (gitignored).")


if __name__ == '__main__':
    main()
