# Patch Atlas

Patch Atlas is a personal developer issue library. It is not a Stack Overflow clone or branded copy; it is a standalone static site that generates a large searchable atlas of debugging scenarios.

## What It Contains

- 16,344 generated developer scenarios
- 18 stack areas: Angular, React, Java/Spring, Node/Express, Git, SQL, TypeScript/JavaScript, HTML/CSS, REST/HTTP APIs, Testing, Docker, CI/CD, Security/Auth, Performance, Build Tools, Cloud/Deployment, ORM/Data Access, and Linux/Shell
- 55 issue categories, including async races, null data, type fixing, forms, custom multiselect dropdowns, routing, validation, uploads, database consistency, caching, auth, performance, build defects, and test flakiness
- Angular, React, and Java/Spring each contain 1,488 scenarios. Other high-use application sections contain 1,104 scenarios each. Git and Linux/Shell intentionally stay lighter.
- Every scenario has symptoms, root cause, defective code, three solution paths, and a prevention checklist
- Custom defects can be created from the `New Defect` button and are saved in browser local storage
- Existing item descriptions can be edited from the detail view; edits are also saved in browser local storage

## Open It

Open `index.html` directly in a browser. No package install, build step, or server is required.

The first screen intentionally does not auto-select an issue. Select an item from the list to open its details.

## Extend It

Most content is generated in `app.js` from catalogs:

- `contexts`: product areas and realistic variables
- `stacks`: technologies and file/language metadata
- `patterns`: issue families, symptoms, causes, and tags
- `commonDefectCatalog`: extra defects for high-use sections
- `angularDefectCatalog`, `reactDefectCatalog`, and `javaDefectCatalog`: deeper framework-specific packs

Adding one context creates 1,362 more scenarios with the current stack mix. Adding one base pattern creates 216 scenarios. Adding one common high-use defect creates 156 scenarios. Adding one Angular, React, or Java-specific defect creates 12 scenarios.
