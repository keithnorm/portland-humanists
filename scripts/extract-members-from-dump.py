#!/usr/bin/env python3
"""Extract the membership directory from a Drupal 7 mysqldump into the
members-prototype data store.

Usage:
    python3 scripts/extract-members-from-dump.py <dump.sql> [--status VALUE]

Reads `member` nodes and their field tables, writes .data/directory.json
(gitignored — the repo is public, member data must never be committed).
Prints only aggregate counts, never member rows.
"""
import json
import re
import sys
from collections import defaultdict
from pathlib import Path

FIELD_TABLES = {
    'field_firstname': 'firstName',
    'field_email': 'email',
    'field_phone': 'phone',
    'field_address': 'address',
    'field_city': 'city',
    'field_state': 'state',
    'field_participation': 'interests',
    'field_status': 'status',
}


def parse_tuples(values_blob):
    """Parse the (...),(...) blob of a MySQL INSERT statement."""
    rows, row, token = [], [], []
    i, n = 0, len(values_blob)
    in_str = False
    depth = 0
    while i < n:
        c = values_blob[i]
        if in_str:
            if c == '\\' and i + 1 < n:
                token.append(values_blob[i + 1])
                i += 2
                continue
            if c == "'":
                in_str = False
            else:
                token.append(c)
        elif c == "'":
            in_str = True
            token.append('\x00str')  # mark as string (vs NULL/number)
        elif c == '(':
            depth += 1
        elif c == ')':
            depth -= 1
            if depth == 0:
                row.append(''.join(token))
                token = []
                rows.append(row)
                row = []
        elif c == ',' and depth == 1:
            row.append(''.join(token))
            token = []
        elif depth == 1:
            token.append(c)
        i += 1
    def clean(v):
        v = v.strip()
        if v.startswith('\x00str'):
            return v[4:]
        return None if v == 'NULL' else v
    return [[clean(v) for v in r] for r in rows]


def inserts_for(sql, table):
    out = []
    for m in re.finditer(rf"INSERT INTO `{table}` VALUES (.*?);\n", sql, re.S):
        out.extend(parse_tuples(m.group(1)))
    return out


def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    dump = Path(sys.argv[1]).read_text(encoding='utf8', errors='replace')
    status_filter = None
    if '--status' in sys.argv:
        status_filter = sys.argv[sys.argv.index('--status') + 1].lower()

    # node: nid, vid, type, language, title, uid, status, created, changed, ...
    members = {}
    for row in inserts_for(dump, 'node'):
        nid, _vid, ntype, _lang, title, _uid, published = row[0], row[1], row[2], row[3], row[4], row[5], row[6]
        if ntype == 'member' and published == '1':
            members[nid] = {'id': f'm{nid}', 'name': title}

    # field tables: entity_type, bundle, deleted, entity_id, revision_id, language, delta, <value...>
    for table, field in FIELD_TABLES.items():
        for row in inserts_for(dump, f'field_data_{table}'):
            etype, bundle, deleted, entity_id = row[0], row[1], row[2], row[3]
            if etype != 'node' or bundle != 'member' or deleted != '0':
                continue
            value = next((v for v in row[7:] if v), None)
            if entity_id in members and value:
                m = members[entity_id]
                m[field] = f"{m[field]}, {value}" if field in m else value

    # Prefer "First Last" when a firstname field exists and the title is bare.
    for m in members.values():
        first = m.pop('firstName', None)
        if first and first.lower() not in m['name'].lower():
            m['name'] = f"{first} {m['name']}"

    statuses = defaultdict(int)
    for m in members.values():
        statuses[(m.get('status') or 'none').lower()] += 1
    print(f"Member nodes found: {len(members)}")
    print("Status values:", dict(sorted(statuses.items(), key=lambda kv: -kv[1])))

    selected = [
        {k: v for k, v in m.items() if k != 'status'}
        for m in members.values()
        if status_filter is None or (m.get('status') or '').lower() == status_filter
    ]
    selected.sort(key=lambda m: m['name'].split()[-1].lower() if m['name'] else '')

    out = Path('.data/directory.json')
    out.parent.mkdir(exist_ok=True)
    out.write_text(json.dumps(selected, indent=2))
    print(f"Wrote {len(selected)} members to {out} (gitignored).")
    if status_filter is None and len(statuses) > 1:
        print("Tip: re-run with --status <value> to include only active members.")


if __name__ == '__main__':
    main()
