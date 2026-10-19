"""Build an attributed, offline Stack Overflow snapshot using the public API.

python scripts/import_stackoverflow.py --per-year 20 --through 2026-10-19
Repeat with --offline to rebuild/deduplicate cached responses without network calls.
Increase --pages to expand beyond the first page for every year/tag query.
Only accepted answers are selected; this is a bounded sample, not a full mirror.
"""
import argparse
import collections
import datetime as dt
import hashlib
import html
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import subprocess
import time
import urllib.parse
import urllib.request

ROOT = Path(__file__).resolve().parent.parent
CACHE = ROOT / '.artifacts' / 'stackoverflow-api'
TAGS = {
    'react': 'reactjs', 'angular': 'angular', 'java': 'java',
    'node': 'node.js', 'typescript': 'typescript', 'sql': 'postgresql',
    'git': 'git', 'docker': 'docker', 'css': 'css', 'api': 'rest',
    'testing': 'jestjs', 'ci': 'github-actions', 'security': 'oauth-2.0',
    'performance': 'performance', 'build': 'webpack', 'cloud': 'kubernetes',
    'orm': 'entity-framework-core', 'shell': 'bash', 'python': 'python',
    'csharp': 'c#',
}
STOP = set('a an the how why what is are does do i my to in of with for and or on from can when not it this that using get'.split())
EBAY_CREDENTIAL = re.compile(r'\b[A-Za-z0-9_-]*\b(?:SBX|PRD)-[A-Za-z0-9_-]+\b')


def redact_credentials(source):
    return EBAY_CREDENTIAL.sub('[credential removed]', source)


class Body(HTMLParser):
    """Keep text/code and link destinations, never execute source HTML or load images."""
    def __init__(self, source):
        super().__init__(convert_charrefs=True)
        self.blocks, self.parts, self.pre, self.href = [], [], False, []
        self.feed(source)
        self.flush()

    def flush(self):
        value = ''.join(self.parts)
        if not self.pre:
            value = re.sub(r'[ \t]+', ' ', value)
            value = re.sub(r'\n[ \t]+', '\n', value)
        value = value.strip('\n') if self.pre else value.strip()
        if value:
            self.blocks.append({'type': 'code' if self.pre else 'text', 'text': value})
        self.parts = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'pre':
            self.flush()
            self.pre = True
        elif tag == 'a':
            self.href.append(attrs.get('href', ''))
        elif tag == 'img':
            self.parts.append('[Image: ' + attrs.get('alt', 'image') + ' — ' + attrs.get('src', '') + ']')
        elif not self.pre and tag in {'p', 'div', 'h1', 'h2', 'h3', 'h4', 'blockquote', 'ul', 'ol', 'table'}:
            self.flush()
        elif tag == 'br':
            self.parts.append('\n')
        elif tag == 'li':
            self.parts.append('\n• ')
        elif tag == 'tr':
            self.parts.append('\n')
        elif tag in {'td', 'th'}:
            self.parts.append(' | ')

    def handle_endtag(self, tag):
        if tag == 'pre':
            self.flush()
            self.pre = False
        elif tag == 'a' and self.href:
            href = self.href.pop()
            if href.startswith(('https://', 'http://', '/')):
                if href.startswith('/'):
                    href = 'https://stackoverflow.com' + href
                self.parts.append(' (' + href + ')')
        elif not self.pre and tag in {'p', 'div', 'h1', 'h2', 'h3', 'h4', 'blockquote', 'ul', 'ol', 'table'}:
            self.flush()

    def handle_data(self, data):
        self.parts.append(data if self.pre else re.sub(r'\s+', ' ', data))


def body_text(blocks):
    return '\n\n'.join(b['text'] for b in blocks)


def normalize(value):
    return re.sub(r'\s+', ' ', re.sub(r'[^\w+#]+', ' ', html.unescape(value).lower())).strip()


def terms(value):
    return set(normalize(value).split()) - STOP


def similarity(a, b):
    return len(a & b) / max(1, len(a | b))


class API:
    def __init__(self, offline):
        self.offline, self.next_call, self.quota = offline, 0, None
        CACHE.mkdir(parents=True, exist_ok=True)

    def get(self, route, **params):
        params = {'site': 'stackoverflow', 'filter': 'withbody', **params}
        url = 'https://api.stackexchange.com/2.3/' + route + '?' + urllib.parse.urlencode(sorted(params.items()))
        file = CACHE / (hashlib.sha256(url.encode()).hexdigest() + '.json')
        if file.exists():
            return json.loads(file.read_text(encoding='utf-8'))
        if self.offline:
            raise RuntimeError('Missing cached response for ' + route + ': rerun without --offline')
        if self.quota is not None and self.quota < 2:
            raise RuntimeError('API quota exhausted; cached responses retained. Retry after quota reset.')
        time.sleep(max(0, self.next_call - time.monotonic()))
        request = urllib.request.Request(url, headers={'User-Agent': 'PatchAtlas-OfflineLibrary/2.1'})
        with urllib.request.urlopen(request, timeout=45) as response:
            data = json.load(response)
        if 'error_id' in data:
            raise RuntimeError(str(data))
        self.quota = data.get('quota_remaining')
        self.next_call = time.monotonic() + max(0.25, data.get('backoff', 0))
        file.write_text(json.dumps(data, ensure_ascii=False), encoding='utf-8')
        return data


def author(post):
    owner = post.get('owner', {})
    return {'name': html.unescape(owner.get('display_name', 'Deleted user')),
            'url': owner.get('link', ''), 'userId': owner.get('user_id')}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--per-year', type=int, default=20, choices=range(1, 101))
    parser.add_argument('--pages', type=int, default=1)
    parser.add_argument('--through', default='2026-10-19')
    parser.add_argument('--offline', action='store_true')
    args = parser.parse_args()
    through = dt.datetime.fromisoformat(args.through).replace(tzinfo=dt.timezone.utc)
    if args.pages < 1 or through.year != 2026:
        parser.error('Use a positive page count and an end date in 2026.')
    api = API(args.offline)
    report = {'period': {'from': '2021-01-01', 'through': args.through},
              'selection': 'Highest-voted open questions with accepted answers, per tag and creation year; not exhaustive.',
              'perYearPerTag': args.per_year, 'pagesPerYearPerTag': args.pages,
              'tagMapping': TAGS, 'queries': [], 'skipped': [], 'nearDuplicates': [],
              'transformations': 'HTML converted to safe text/code blocks; link destinations retained; images represented by alt text and URL. Credential-shaped eBay identifiers removed. No answer rewriting.',
              'deduplication': 'Question ID; normalized title; identical question/answer bodies; title-token Jaccard >= 0.86 for same stack (at least four tokens). Borderline title similarities >= 0.60 reported for review, not automatically deleted.'}
    questions = {}
    for year in range(2021, 2027):
        start = int(dt.datetime(year, 1, 1, tzinfo=dt.timezone.utc).timestamp())
        end = min(int(dt.datetime(year + 1, 1, 1, tzinfo=dt.timezone.utc).timestamp()) - 1,
                  int((through + dt.timedelta(days=1)).timestamp()) - 1)
        for stack, tag in TAGS.items():
            for page in range(1, args.pages + 1):
                data = api.get('search/advanced', tagged=tag, accepted='true', closed='false',
                               sort='votes', order='desc', pagesize=args.per_year,
                               fromdate=start, todate=end, page=page)
                items = data.get('items', [])
                report['queries'].append({'year': year, 'stack': stack, 'tag': tag,
                                          'page': page, 'returned': len(items), 'hasMore': data.get('has_more', False)})
                for q in items:
                    if q['question_id'] in questions:
                        report['skipped'].append({'questionId': q['question_id'], 'reason': 'same-question-cross-tag'})
                    else:
                        questions[q['question_id']] = (q, stack)
                if not data.get('has_more'):
                    break
        print('Fetched questions for', year, 'unique so far:', len(questions), flush=True)

    answer_ids = sorted({q['accepted_answer_id'] for q, _ in questions.values()})
    answers = {}
    for start in range(0, len(answer_ids), 100):
        ids = ';'.join(map(str, answer_ids[start:start + 100]))
        data = api.get('answers/' + ids, pagesize=100)
        answers.update({a['answer_id']: a for a in data.get('items', [])})
        print('Fetched accepted answers:', len(answers), '/', len(answer_ids), flush=True)

    # Compare with the actual authored catalog, without modifying existing guides.
    js = "const vm=require('node:vm'),fs=require('node:fs');let c={window:{}};vm.runInNewContext(fs.readFileSync('data.js','utf8'),c);console.log(JSON.stringify(c.window.PatchAtlasData.guides));"
    authored = json.loads(subprocess.check_output(['node', '-e', js], cwd=ROOT, encoding='utf-8'))
    reviewed = json.loads((ROOT / 'scripts' / 'stackoverflow-duplicates.json').read_text(encoding='utf-8'))
    seen_titles = {normalize(g['title']): g['id'] for g in authored}
    seen_bodies = {}
    candidates = [(g['id'], g['stack'], terms(g['title'])) for g in authored]
    guides = []
    for q, stack in sorted(questions.values(), key=lambda pair: (-pair[0].get('score', 0), pair[0]['question_id'])):
        qid = q['question_id']
        if str(qid) in reviewed:
            decision = reviewed[str(qid)]
            report['skipped'].append({'questionId': qid, 'reason': 'reviewed-semantic-duplicate', **decision})
            # Keep the stable machine-readable reason alongside the review note.
            report['skipped'][-1]['reviewNote'] = decision['reason']
            report['skipped'][-1]['reason'] = 'reviewed-semantic-duplicate'
            continue
        a = answers.get(q['accepted_answer_id'])
        reason, duplicate_of = '', None
        if not a or not a.get('is_accepted') or a.get('question_id') != qid:
            reason = 'accepted-answer-unavailable'
        elif q.get('closed_date') or q.get('closed_reason'):
            reason = 'closed-or-duplicate'
        elif q.get('content_license') != 'CC BY-SA 4.0' or a.get('content_license') != 'CC BY-SA 4.0':
            reason = 'unsupported-license'
        if reason:
            report['skipped'].append({'questionId': qid, 'reason': reason})
            continue
        title = html.unescape(q['title'])
        qb, ab = Body(redact_credentials(q['body'])).blocks, Body(redact_credentials(a['body'])).blocks
        qt, at = body_text(qb), body_text(ab)
        norm, words = normalize(title), terms(title)
        hashes = [('question', normalize(qt)), ('answer', normalize(at))]
        if norm in seen_titles:
            reason, duplicate_of = 'normalized-title', seen_titles[norm]
        else:
            for kind, value in hashes:
                if len(value) > 80 and (kind, value) in seen_bodies:
                    reason, duplicate_of = 'identical-' + kind, seen_bodies[kind, value]
                    break
        if not reason:
            for gid, other_stack, other_words in candidates:
                if min(len(words), len(other_words)) < 4:
                    continue
                score = similarity(words, other_words)
                if score >= 0.86:
                    reason, duplicate_of = 'near-identical-title', gid
                    break
                if score >= 0.60:
                    report['nearDuplicates'].append({'questionId': qid, 'compareWith': gid, 'similarity': round(score, 3)})
        if reason:
            report['skipped'].append({'questionId': qid, 'reason': reason, 'duplicateOf': duplicate_of})
            continue
        gid = 'so-' + str(qid)
        year = dt.datetime.fromtimestamp(q['creation_date'], dt.timezone.utc).year
        guide = {'id': gid, 'kind': 'stackoverflow', 'stack': stack, 'severity': 'medium',
                 'title': title, 'summary': re.sub(r'\s+', ' ', qt)[:240],
                 'tags': q['tags'],
                 'diagnose': '', 'bad': '', 'good': '', 'steps': [], 'verify': [],
                 'source': q['link'], 'year': year,
                 'question': {'id': qid, 'url': q['link'], 'author': author(q), 'score': q.get('score', 0),
                              'created': q['creation_date'], 'edited': q.get('last_edit_date'), 'blocks': qb},
                 'answer': {'id': a['answer_id'], 'accepted': True, 'url': 'https://stackoverflow.com/a/' + str(a['answer_id']),
                            'author': author(a), 'score': a.get('score', 0), 'created': a['creation_date'],
                            'edited': a.get('last_edit_date'), 'blocks': ab},
                 'license': {'name': 'CC BY-SA 4.0', 'url': 'https://creativecommons.org/licenses/by-sa/4.0/'}}
        guides.append(guide)
        seen_titles[norm] = gid
        for kind, value in hashes:
            seen_bodies[kind, value] = gid
        candidates.append((gid, stack, words))
    kept_pairs = json.loads((ROOT / 'scripts' / 'stackoverflow-kept-pairs.json').read_text(encoding='utf-8'))
    for pair in report['nearDuplicates']:
        note = kept_pairs.get(str(pair['questionId']) + '|' + pair['compareWith'])
        pair['status'] = 'reviewed-distinct' if note else 'needs-review'
        if note:
            pair['reviewNote'] = note
    report['imported'] = len(guides)
    report['authoredGuidesCompared'] = len(authored)
    report['byYear'] = dict(sorted(collections.Counter(g['year'] for g in guides).items()))
    report['byStack'] = dict(sorted(collections.Counter(g['stack'] for g in guides).items()))
    report['skipReasons'] = dict(collections.Counter(s['reason'] for s in report['skipped']))
    output = {'meta': {k: report[k] for k in ['period', 'selection', 'imported', 'byYear', 'byStack', 'transformations']}, 'guides': guides}
    target = ROOT / 'stackoverflow-data.js'
    target.write_text('// Stack Overflow contributions: CC BY-SA 4.0. Per-post attribution below.\nwindow.PatchAtlasStackOverflow = ' + json.dumps(output, ensure_ascii=False, separators=(',', ':')) + ';\n', encoding='utf-8')
    (ROOT / 'stackoverflow-import-report.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(json.dumps({k: report[k] for k in ['imported', 'byYear', 'byStack', 'skipReasons']}, indent=2))


if __name__ == '__main__':
    main()
