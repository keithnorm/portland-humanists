#!/usr/bin/env python3
"""Extract members-only content (videos, committee minutes) from the old
Drupal site's mysqldump.

Usage:
    python3 scripts/extract-content-from-dump.py <dump.sql>

Writes .data/videos.json and .data/documents.json (gitignored). Prints only
aggregate counts.
"""
import html
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from importlib import import_module
extract = import_module('extract-members-from-dump')


def strip_html(s):
    return re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]*>', ' ', s or ''))).strip()


def field_map(dump, table, bundle):
    """entity_id -> first value column for a field table, single delta 0."""
    out = {}
    for row in extract.inserts_for(dump, f'field_data_{table}'):
        etype, b, deleted, entity_id, delta = row[0], row[1], row[2], row[3], row[6]
        if etype == 'node' and b == bundle and deleted == '0' and delta == '0':
            out[entity_id] = next((v for v in row[7:] if v), None)
    return out


def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    dump = Path(sys.argv[1]).read_text(encoding='utf8', errors='replace')

    nodes = {}  # nid -> (type, title, created)
    for row in extract.inserts_for(dump, 'node'):
        nid, ntype, title, published, created = row[0], row[2], row[4], row[6], row[7]
        if published == '1':
            nodes[nid] = (ntype, title, created)

    terms = {}  # tid -> name
    for row in extract.inserts_for(dump, 'taxonomy_term_data'):
        terms[row[0]] = row[2]

    # --- Videos (vimeo nodes) ---
    embed = field_map(dump, 'field_embed_code', 'vimeo')
    presenter = field_map(dump, 'field_presenter', 'vimeo')
    vdate = field_map(dump, 'field_date', 'vimeo')
    vbody = field_map(dump, 'body', 'vimeo')

    videos = []
    no_embed = 0
    for nid, (ntype, title, created) in nodes.items():
        if ntype != 'vimeo':
            continue
        code = embed.get(nid) or ''
        m = re.search(r'(?:player\.)?vimeo\.com/(?:video/)?(\d+)(?:\?h=([0-9a-f]+))?', code)
        yt = re.search(r'youtube(?:-nocookie)?\.com/embed/([\w-]{6,})', code)
        rec = {
            'id': f'v{nid}',
            'title': title,
            'presenter': presenter.get(nid) or None,
            'date': (vdate.get(nid) or '')[:10] or None,
            'uploadDate': __import__('datetime').datetime.utcfromtimestamp(int(created)).strftime('%Y-%m-%d'),
            'description': strip_html(vbody.get(nid))[:600] or None,
        }
        if m:
            rec['vimeoId'] = m.group(1)
            if m.group(2):
                rec['vimeoHash'] = m.group(2)
        elif yt:
            rec['youtubeId'] = yt.group(1)
        else:
            no_embed += 1
            continue
        videos.append({k: v for k, v in rec.items() if v})
    videos.sort(key=lambda v: v.get('date') or v['uploadDate'], reverse=True)

    # --- Documents (minutes nodes) ---
    committee = field_map(dump, 'field_committee', 'minutes')
    meet_date = field_map(dump, 'field_meet_date', 'minutes')
    minutes_text = field_map(dump, 'field_minutes', 'minutes')

    documents = []
    for nid, (ntype, title, created) in nodes.items():
        if ntype != 'minutes':
            continue
        tid = committee.get(nid)
        documents.append({
            'id': f'd{nid}',
            'title': title,
            'committee': terms.get(tid, 'Uncategorized') if tid else 'Uncategorized',
            'date': (meet_date.get(nid) or '')[:10] or None,
            'text': strip_html(minutes_text.get(nid)),
        })
    documents.sort(key=lambda d: d.get('date') or '', reverse=True)

    out = Path('.data')
    out.mkdir(exist_ok=True)
    (out / 'videos.json').write_text(json.dumps(videos, indent=1))
    (out / 'documents.json').write_text(json.dumps(documents, indent=1))

    from collections import Counter
    committees = Counter(d['committee'] for d in documents)
    total_text_kb = sum(len(d['text']) for d in documents) // 1024
    print(f"Videos: {len(videos)} ({sum(1 for v in videos if 'vimeoId' in v)} vimeo, "
          f"{sum(1 for v in videos if 'youtubeId' in v)} youtube, {no_embed} skipped without embed)")
    print(f"Documents: {len(documents)} minutes, {total_text_kb} KB of text, committees: {dict(committees)}")


if __name__ == '__main__':
    main()
