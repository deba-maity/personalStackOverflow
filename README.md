# Patch Atlas

A developer’s field manual for when the internet is down, the AI is unavailable, or you want to understand the fix yourself.

Patch Atlas includes **48 authored debugging guides and 2,147 Stack Overflow questions with accepted answers across 20 stacks**, including Python and C#. The Stack Overflow snapshot covers question creation years **2021–2026, through October 19, 2026**. It samples up to 20 highest-voted open questions with accepted answers per year and selected technology tag; it is not a complete Stack Overflow mirror.

Authored guides include symptoms, diagnosis, before/after code, repairs, and verification checks. Imported questions retain their original question and accepted-answer text, code, author attribution, vote counts, dates, source links, and CC BY-SA 4.0 license. Imported answers are community contributions, not newly verified fixes. Check their original version context before applying them.

## Open it

Open **index.html** directly in a modern browser. There are no runtime dependencies, CDN requests, accounts, API keys, or build steps.

For a stable local origin and offline browser reopening, use Node 22+:

```sh
npm run dev
```

Then visit **http://127.0.0.1:4173**. No npm install is needed just to run the server. The service worker caches the complete application after the first successful load. The header says **Offline ready** when installation completes. Direct-file mode uses the project files instead of a service worker.

## Find and keep knowledge

- **Ranked search:** words in any order, quoted phrases, pasted errors, `stack:react`, and `tag:async`. All ordinary terms must match; titles, tags, and summaries rank ahead of code matches.
- **Filters:** technology, category, severity, bookmarks, resolved guides, and personal field notes. Three curated trails provide starting points for production incidents, frontend bugs, and data issues.
- **Stack Overflow archive:** filter by source, search full question/answer text offline, and sort by question votes or newest questions. The reader separates the question, accepted answer, and your own notes. Code blocks have copy controls. Downloaded guides and the complete Markdown manual retain source and license attribution.
- **Guide reader:** diagnosis, repair, syntax-colored code with copy controls, persistent verification checklists, related guides, and private annotations.
- **Personal field notes:** create, edit, and delete your own entries with original code, fixed code, tags, and checks. Deletion requires an explicit second action.
- **Bookmarks and resolution:** keep useful fixes nearby and record the problems you worked through.
- **Portable knowledge:** download one guide or the complete field manual as standalone Markdown, including your annotations and checklist progress.
- **Backup and restore:** export the personal workspace to JSON and restore it in another browser. Restore merges entries by ID, retains existing versions and annotation text on conflicts, and never removes current entries. A backup supports up to 1,000 personal entries and 10 MB per import.
- **Light/dark themes**, responsive navigation, keyboard shortcuts, a focus-managed reader, print support, and recent history.

Keyboard shortcuts: `/` or `Ctrl/⌘ K` for search, `N` for a field note, `?` for help, and `Esc` to close. Arrow keys navigate reader tabs. Shortcuts do not interrupt typing.

## Your data

Everything is stored locally in this browser under `patchAtlasWorkspaceV2`. Different origins, ports, browsers, and direct-file contexts have separate storage. There is no server sync. Browser storage can be cleared or evicted; keep JSON backups for editable recovery and a Markdown field manual for independently readable knowledge.

Existing v1 custom entries, bookmarks, and edited generated entries migrate into **My field notes** on the same browser origin. Only the old generated entries you saved or edited are recovered, labeled `[Legacy]`. The original v1 storage keys are retained. `legacy.js` is only executed when old bookmarks or edits need recovery, so the repeated catalog is not rebuilt during ordinary use. An unreadable v2 workspace is preserved under `patchAtlasWorkspaceV2.recovery` before a replacement can be saved. Storage failures are shown, and session changes remain exportable.

Official references open online. The guide content, examples, search, and personal workspace work offline. The service worker caches this version as a coherent set of assets; bump its cache version whenever releasing changed runtime files.

## Project layout

| File                               | Responsibility                                                               |
| ---------------------------------- | ---------------------------------------------------------------------------- |
| `index.html`                       | Accessible shell, sidebar, filters, and dialogs                              |
| `styles.css`                       | Forest/paper design, responsive layouts, themes, and print styling           |
| `data.js`                          | Stack metadata and the 48 individually authored guides                       |
| `stackoverflow-data.js`            | Offline Q&A snapshot with per-question and per-answer attribution            |
| `stackoverflow-import-report.json` | Exact selection scope, yearly/stack counts, exclusions, and duplicate review |
| `scripts/import_stackoverflow.py`  | Standard-library Python importer with API caching and backoff handling       |
| `app.js`                           | Search, reader, local persistence, editing, import/export, and migration     |
| `sw.js`                            | Versioned offline application cache                                          |
| `legacy.js`                        | On-demand recovery of saved or edited v1 scenarios                           |
| `manifest.webmanifest`, `icon.svg` | Application metadata and local identity assets                               |
| `scripts/serve.mjs`                | Dependency-free local static server                                          |
| `tests/`                           | Catalog integrity and browser workflow/accessibility checks                  |

To add an authored guide, add one complete object to `guides` in `data.js`. Use a stable unique `id`, a supported stack key, a genuinely different failure mechanism, specific examples, and checks that establish the fix. Avoid generating variants by swapping product nouns. The catalog integrity test checks completeness and uniqueness; update its expected count when intentionally extending the library.

## Refresh or expand Stack Overflow content

Python 3 and Node are needed for ingestion, but neither is needed to read the delivered site. The public Stack Exchange API supplies the posts; browser clients make no API requests.

```sh
python scripts/import_stackoverflow.py --per-year 20 --through 2026-10-19
# Expand to up to 100 questions per year/tag (subject to available posts and API quota):
python scripts/import_stackoverflow.py --per-year 100 --through 2026-10-19
# Additional pages can expand the selected queries further:
python scripts/import_stackoverflow.py --per-year 100 --pages 2 --through 2026-10-19
# Rebuild from the local API response cache without downloading again:
python scripts/import_stackoverflow.py --offline --per-year 20 --through 2026-10-19
```

The tag mapping is explicit in the importer and report: broad categories use representative tags (for example, `rest`, `oauth-2.0`, `kubernetes`, and `entity-framework-core`). This does not cover every tag or language in Stack Overflow. All six years have imported questions. The 2026 sample ends on the cutoff date and API availability can change.

Responses are cached under the ignored `.artifacts/stackoverflow-api/` directory. The importer respects API backoff and stops on exhausted quota, preserving previous output until fetching completes. Identical queries reuse their cached response; remove the relevant cached response if intentionally refreshing it later. `--offline` requires the local response cache, which is not shipped with the site. Generated runtime data and the report are included in the project.

Deduplication compares question IDs, normalized titles, identical question/answer bodies, and near-identical title tokens across all imported stacks and existing guide titles. Eleven reviewed semantic repeats are excluded by `scripts/stackoverflow-duplicates.json`, including three questions already covered by authored guides. The report records every exclusion and keeps reviewed similar-looking questions where the accepted answers address different causes. Future imports can produce `needs-review` pairs: review their question and answer text before excluding them. Automated matching cannot prove that every differently worded question is semantically unique.

After changing runtime data, bump the cache version in `sw.js` and run the checks. The snapshot adds about 11 MB before transfer compression. Its first offline cache installation requires enough browser storage and a successful complete load.

## Stack Overflow attribution and licensing

The imported question/answer content is licensed under **[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)**, as supplied by the API and [Stack Overflow's licensing policy](https://stackoverflow.com/help/licensing). Each post in `stackoverflow-data.js`, its collapsible reader credits, and Markdown exports identifies the author, profile when available, original post, revision history for contributors, and license. These licensing statements concern imported contributions and their formatting adaptations.

HTML is converted to inert text and code blocks. Code whitespace and entities are preserved, hyperlinks retain their destination as text, and images are represented by descriptions and URLs instead of being fetched. Image-dependent answers can therefore need the original online resources for full context. Credential-shaped eBay sandbox/production identifiers are removed during ingestion. No answer is rewritten into an invented diagnosis or verification checklist. Source content is rendered as escaped text, never inserted as executable HTML.

## Verify changes

```sh
npm ci
npm test
```

Tests use an installed Google Chrome through Playwright. The browser suite exercises search, filters, persistence, custom-entry lifecycle, injection-safe rendering, imports, exports, blocked storage, corrupted-data recovery, v1 migration, direct-file mode, offline reloads, themes, and layouts at 375, 768, 1024, and 1440 pixels. Axe checks WCAG A/AA rules in the library and guide reader. Screenshots are written to the ignored `.artifacts/` directory. These tests verify the app; they do not run the illustrative snippets for every external framework.

```sh
npm run test:content
npm run test:browser
python -m unittest discover -s tests -p '*_test.py'
```

Playwright starts and stops the local server automatically. Development tools are optional and are not needed by the delivered browser application.
