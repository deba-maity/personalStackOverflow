(function () {
  "use strict";

  const pageSize = 36;
  const severityWeight = { critical: 3, high: 2, medium: 1 };

  const contexts = [
    {
      area: "login flow",
      noun: "user",
      plural: "users",
      component: "UserPanel",
      endpoint: "/api/users",
      table: "users",
      column: "email",
      id: "userId",
      env: "USER_API_URL",
      branch: "feature/login-flow",
      action: "authenticate"
    },
    {
      area: "checkout page",
      noun: "order",
      plural: "orders",
      component: "CheckoutPanel",
      endpoint: "/api/orders",
      table: "orders",
      column: "status",
      id: "orderId",
      env: "ORDER_API_URL",
      branch: "feature/checkout-page",
      action: "submitOrder"
    },
    {
      area: "admin dashboard",
      noun: "report",
      plural: "reports",
      component: "ReportGrid",
      endpoint: "/api/reports",
      table: "reports",
      column: "created_at",
      id: "reportId",
      env: "REPORT_API_URL",
      branch: "feature/admin-dashboard",
      action: "loadReports"
    },
    {
      area: "notification worker",
      noun: "message",
      plural: "messages",
      component: "NotificationCenter",
      endpoint: "/api/messages",
      table: "messages",
      column: "read_at",
      id: "messageId",
      env: "MESSAGE_API_URL",
      branch: "feature/notification-worker",
      action: "sendMessage"
    },
    {
      area: "billing integration",
      noun: "invoice",
      plural: "invoices",
      component: "InvoicePanel",
      endpoint: "/api/invoices",
      table: "invoices",
      column: "amount",
      id: "invoiceId",
      env: "BILLING_API_URL",
      branch: "feature/billing-integration",
      action: "syncInvoice"
    },
    {
      area: "search experience",
      noun: "query",
      plural: "queries",
      component: "SearchBox",
      endpoint: "/api/search",
      table: "search_events",
      column: "term",
      id: "queryId",
      env: "SEARCH_API_URL",
      branch: "feature/search-experience",
      action: "runSearch"
    },
    {
      area: "profile settings",
      noun: "profile",
      plural: "profiles",
      component: "ProfileEditor",
      endpoint: "/api/profiles",
      table: "profiles",
      column: "display_name",
      id: "profileId",
      env: "PROFILE_API_URL",
      branch: "feature/profile-settings",
      action: "saveProfile"
    },
    {
      area: "inventory sync",
      noun: "product",
      plural: "products",
      component: "ProductList",
      endpoint: "/api/products",
      table: "products",
      column: "sku",
      id: "productId",
      env: "PRODUCT_API_URL",
      branch: "feature/inventory-sync",
      action: "syncProducts"
    },
    {
      area: "analytics export",
      noun: "event",
      plural: "events",
      component: "EventExport",
      endpoint: "/api/events",
      table: "events",
      column: "occurred_at",
      id: "eventId",
      env: "EVENT_API_URL",
      branch: "feature/analytics-export",
      action: "exportEvents"
    },
    {
      area: "file upload",
      noun: "asset",
      plural: "assets",
      component: "AssetUploader",
      endpoint: "/api/assets",
      table: "assets",
      column: "path",
      id: "assetId",
      env: "ASSET_API_URL",
      branch: "feature/file-upload",
      action: "uploadAsset"
    },
    {
      area: "team permissions",
      noun: "member",
      plural: "members",
      component: "MemberAccess",
      endpoint: "/api/members",
      table: "members",
      column: "role",
      id: "memberId",
      env: "MEMBER_API_URL",
      branch: "feature/team-permissions",
      action: "updateRole"
    },
    {
      area: "scheduler job",
      noun: "task",
      plural: "tasks",
      component: "TaskScheduler",
      endpoint: "/api/tasks",
      table: "tasks",
      column: "run_at",
      id: "taskId",
      env: "TASK_API_URL",
      branch: "feature/scheduler-job",
      action: "scheduleTask"
    }
  ];

  const stacks = [
    { key: "angular", label: "Angular", family: "angular", file: "src/app/user.component.ts", lang: "typescript", tags: ["angular", "rxjs", "forms", "frontend"] },
    { key: "react", label: "React", family: "react", file: "src/UserPanel.jsx", lang: "jsx", tags: ["react", "hooks", "state", "frontend"] },
    { key: "java", label: "Java / Spring", family: "java", file: "UserService.java", lang: "java", tags: ["java", "spring", "jpa", "backend"] },
    { key: "node", label: "Node.js / Express", family: "node", file: "routes/users.js", lang: "javascript", tags: ["node", "express", "async", "backend"] },
    { key: "git", label: "Git", family: "git", file: "terminal", lang: "bash", tags: ["git", "version-control", "branching"] },
    { key: "sql", label: "SQL", family: "sql", file: "queries.sql", lang: "sql", tags: ["sql", "postgres", "mysql", "data"] },
    { key: "typescript", label: "TypeScript / JavaScript", family: "typescript", file: "src/client.ts", lang: "typescript", tags: ["typescript", "javascript", "types"] },
    { key: "css", label: "HTML / CSS", family: "css", file: "styles.css", lang: "css", tags: ["css", "html", "layout", "frontend"] },
    { key: "api", label: "REST / HTTP APIs", family: "api", file: "api-client.js", lang: "javascript", tags: ["rest", "http", "api", "json"] },
    { key: "testing", label: "Testing", family: "testing", file: "user-flow.test.ts", lang: "typescript", tags: ["jest", "junit", "cypress", "testing"] },
    { key: "docker", label: "Docker", family: "docker", file: "Dockerfile", lang: "dockerfile", tags: ["docker", "containers", "images"] },
    { key: "ci", label: "CI / CD", family: "ci", file: ".github/workflows/build.yml", lang: "yaml", tags: ["ci", "github-actions", "pipeline"] },
    { key: "security", label: "Security / Auth", family: "security", file: "auth.js", lang: "javascript", tags: ["security", "auth", "authorization"] },
    { key: "performance", label: "Performance", family: "performance", file: "perf.js", lang: "javascript", tags: ["performance", "profiling", "latency"] },
    { key: "build", label: "Build Tools", family: "build", file: "vite.config.js", lang: "javascript", tags: ["vite", "webpack", "maven", "gradle", "npm"] },
    { key: "cloud", label: "Cloud / Deployment", family: "cloud", file: "deploy.yml", lang: "yaml", tags: ["cloud", "deployment", "runtime"] },
    { key: "orm", label: "ORM / Data Access", family: "orm", file: "repository.ts", lang: "typescript", tags: ["orm", "prisma", "hibernate", "sequelize"] },
    { key: "shell", label: "Linux / Shell", family: "shell", file: "scripts/deploy.sh", lang: "bash", tags: ["shell", "linux", "scripts"] }
  ];

  const patterns = [
    {
      key: "async-race",
      category: "Async and concurrency",
      severity: "high",
      title: (stack, ctx) => `${stack.label} ${ctx.area}: request race overwrites the latest ${ctx.noun}`,
      summary: (stack, ctx) => `Older async work can finish after newer work and replace the ${ctx.area} with stale ${ctx.noun} data.`,
      symptoms: (stack, ctx) => [
        `The ${ctx.noun} briefly looks correct and then changes back.`,
        "Adding logs makes the bug appear or disappear.",
        `Fast repeated ${ctx.action} actions produce inconsistent UI or persistence.`
      ],
      cause: (stack, ctx) => `The code starts more than one operation for ${ctx.endpoint} but does not cancel, sequence, or ignore stale responses.`,
      tags: ["race-condition", "async", "stale-response"],
      solutionLabel: "Gate or cancel stale work"
    },
    {
      key: "null-guard",
      category: "Null, undefined, and optional data",
      severity: "medium",
      title: (stack, ctx) => `${stack.label} ${ctx.area}: missing ${ctx.noun} crashes on first render`,
      summary: (stack, ctx) => `The ${ctx.area} assumes ${ctx.noun} data exists before the API, database, or config layer has provided it.`,
      symptoms: (stack, ctx) => [
        "The first load fails but a refresh sometimes works.",
        "The error mentions undefined, null, Optional, or missing property access.",
        `Only ${ctx.plural} with incomplete data trigger the issue.`
      ],
      cause: (stack, ctx) => `The code reads ${ctx.noun}.${ctx.column} without checking the loading, empty, or error state.`,
      tags: ["null", "undefined", "optional-data"],
      solutionLabel: "Model loading and empty states"
    },
    {
      key: "mutation-side-effect",
      category: "State and mutation",
      severity: "high",
      title: (stack, ctx) => `${stack.label} ${ctx.area}: shared ${ctx.plural} mutate outside the owner`,
      summary: (stack, ctx) => `A shared object or collection is edited in place, so unrelated code sees the mutation before it is safe.`,
      symptoms: (stack, ctx) => [
        "Undo, cancel, or retry still leaves modified data behind.",
        `Two screens disagree about the current ${ctx.noun}.`,
        "Change detection, memoization, or dirty checking misses the update."
      ],
      cause: (stack, ctx) => `The code mutates the existing ${ctx.plural} reference instead of creating a new value or transaction boundary.`,
      tags: ["mutation", "state", "immutability"],
      solutionLabel: "Copy before changing"
    },
    {
      key: "config-env",
      category: "Configuration and environments",
      severity: "high",
      title: (stack, ctx) => `${stack.label} ${ctx.area}: wrong ${ctx.env} leaks across environments`,
      summary: (stack, ctx) => `A local, staging, or production endpoint/config value is hard-coded or read from the wrong place.`,
      symptoms: (stack, ctx) => [
        "It works locally but fails after deployment.",
        "Requests hit staging from production or production from staging.",
        "A secret or URL appears directly in committed code."
      ],
      cause: (stack, ctx) => `The implementation embeds ${ctx.endpoint} or ${ctx.env} instead of validating environment-specific configuration at startup.`,
      tags: ["environment", "configuration", "deployment"],
      solutionLabel: "Read validated configuration"
    },
    {
      key: "swallowed-error",
      category: "Errors and observability",
      severity: "high",
      title: (stack, ctx) => `${stack.label} ${ctx.area}: error is swallowed and the failure looks successful`,
      summary: (stack, ctx) => `The code catches an error but returns fallback success data without logging, surfacing, or retrying correctly.`,
      symptoms: (stack, ctx) => [
        "Users see an empty result instead of a useful failure.",
        "Monitoring shows fewer errors than customer reports suggest.",
        `The failed ${ctx.action} path continues as if it succeeded.`
      ],
      cause: (stack, ctx) => `The catch path hides the ${ctx.noun} failure, making recovery and diagnosis harder.`,
      tags: ["error-handling", "logging", "observability"],
      solutionLabel: "Handle failure explicitly"
    },
    {
      key: "resource-leak",
      category: "Lifecycle and resources",
      severity: "medium",
      title: (stack, ctx) => `${stack.label} ${ctx.area}: subscriptions, handles, or connections are never released`,
      summary: (stack, ctx) => `The feature creates timers, listeners, sockets, cursors, or subscriptions and forgets to close them.`,
      symptoms: (stack, ctx) => [
        "CPU or memory grows after repeated navigation or job runs.",
        "Duplicate handlers fire for one user action.",
        "Tests hang after assertions finish."
      ],
      cause: (stack, ctx) => `The lifecycle that starts ${ctx.action} does not include matching cleanup for the resource it opens.`,
      tags: ["memory-leak", "cleanup", "lifecycle"],
      solutionLabel: "Pair setup with cleanup"
    },
    {
      key: "stale-cache",
      category: "Caching and invalidation",
      severity: "medium",
      title: (stack, ctx) => `${stack.label} ${ctx.area}: stale cache hides the latest ${ctx.noun}`,
      summary: (stack, ctx) => `Cached data is reused after a write, deploy, or dependency change without a clear invalidation rule.`,
      symptoms: (stack, ctx) => [
        "Refresh, restart, or cache clear fixes the issue temporarily.",
        `One user sees old ${ctx.plural} while another sees new ones.`,
        "The bug appears only after an update or deploy."
      ],
      cause: (stack, ctx) => `The cache key for ${ctx.plural} is too broad or the write path does not invalidate it.`,
      tags: ["cache", "invalidation", "stale-data"],
      solutionLabel: "Use precise keys and invalidation"
    },
    {
      key: "injection",
      category: "Injection and unsafe input",
      severity: "critical",
      title: (stack, ctx) => `${stack.label} ${ctx.area}: untrusted ${ctx.column} is executed or rendered unsafely`,
      summary: (stack, ctx) => `User-controlled input is concatenated into SQL, shell, HTML, headers, or queries without escaping or binding.`,
      symptoms: (stack, ctx) => [
        "Special characters break the page or query.",
        "Security scanners flag injection or XSS.",
        `A crafted ${ctx.column} changes behavior outside the intended ${ctx.action} path.`
      ],
      cause: (stack, ctx) => `The code treats external ${ctx.noun} input as trusted program text.`,
      tags: ["security", "injection", "input-validation"],
      solutionLabel: "Bind, encode, and validate input"
    },
    {
      key: "partial-write",
      category: "Transactions and consistency",
      severity: "high",
      title: (stack, ctx) => `${stack.label} ${ctx.area}: partial write leaves ${ctx.plural} inconsistent`,
      summary: (stack, ctx) => `A multi-step update commits one part and fails another, leaving data in a state no user intended.`,
      symptoms: (stack, ctx) => [
        "Retrying creates duplicates or mismatched totals.",
        "A background job has to repair data later.",
        `The ${ctx.noun} exists but related records, files, or events are missing.`
      ],
      cause: (stack, ctx) => `The ${ctx.action} workflow lacks a transaction, idempotency key, or compensating action.`,
      tags: ["transaction", "consistency", "idempotency"],
      solutionLabel: "Make the workflow atomic"
    },
    {
      key: "date-time",
      category: "Dates, timezones, and locale",
      severity: "medium",
      title: (stack, ctx) => `${stack.label} ${ctx.area}: timezone conversion moves ${ctx.column}`,
      summary: (stack, ctx) => `Date parsing or formatting depends on the runtime locale/timezone instead of an explicit contract.`,
      symptoms: (stack, ctx) => [
        "The value is off by one day or several hours.",
        "Only users in some timezones reproduce it.",
        "Tests pass on one machine and fail in CI."
      ],
      cause: (stack, ctx) => `The code parses ${ctx.column} as a local date/time even though the system needs UTC or a named timezone.`,
      tags: ["timezone", "date", "locale"],
      solutionLabel: "Use explicit temporal contracts"
    },
    {
      key: "contract-drift",
      category: "Contracts and serialization",
      severity: "high",
      title: (stack, ctx) => `${stack.label} ${ctx.area}: response contract drift breaks ${ctx.noun} parsing`,
      summary: (stack, ctx) => `Producer and consumer disagree about field names, nullability, encoding, or payload shape.`,
      symptoms: (stack, ctx) => [
        "The network call is 200 OK but the screen or service fails.",
        `One deployment version sends ${ctx.id} while another expects id.`,
        "Type assertions or casts hide the mismatch until runtime."
      ],
      cause: (stack, ctx) => `The ${ctx.noun} contract changed without schema validation, generated types, or backward compatibility.`,
      tags: ["serialization", "schema", "api-contract"],
      solutionLabel: "Validate the boundary"
    },
    {
      key: "path-case",
      category: "Build, imports, and file paths",
      severity: "medium",
      title: (stack, ctx) => `${stack.label} ${ctx.area}: path or import case works locally but fails elsewhere`,
      summary: (stack, ctx) => `The code relies on a case-insensitive filesystem, implicit extension, or local module resolution behavior.`,
      symptoms: (stack, ctx) => [
        "Windows or macOS works but Linux CI fails.",
        "A file exists, yet the build says module not found.",
        "Docker builds fail even though local dev server runs."
      ],
      cause: (stack, ctx) => `The import or path for ${ctx.component} does not exactly match the real file, package export, or runtime working directory.`,
      tags: ["imports", "build", "case-sensitive"],
      solutionLabel: "Use exact paths and portable resolution"
    },
    {
      key: "authorization",
      category: "Authentication and authorization",
      severity: "critical",
      title: (stack, ctx) => `${stack.label} ${ctx.area}: client-side check protects ${ctx.noun} access`,
      summary: (stack, ctx) => `The UI or caller hides an action, but the server, database, or job still accepts unauthorized requests.`,
      symptoms: (stack, ctx) => [
        "Changing a URL, id, or request body accesses another user's data.",
        "QA can reproduce by calling the API directly.",
        "Logs show successful actions from users without the required role."
      ],
      cause: (stack, ctx) => `The trusted authorization decision is missing from the boundary that actually reads or writes ${ctx.plural}.`,
      tags: ["auth", "rbac", "broken-access-control"],
      solutionLabel: "Enforce authorization at the boundary"
    },
    {
      key: "performance-loop",
      category: "Performance and scaling",
      severity: "high",
      title: (stack, ctx) => `${stack.label} ${ctx.area}: repeated work scales badly for ${ctx.plural}`,
      summary: (stack, ctx) => `A loop, render, query, or job repeats expensive work for each item instead of batching or memoizing it.`,
      symptoms: (stack, ctx) => [
        "Small datasets are fine; production data is slow.",
        "Profiling shows repeated calls with the same inputs.",
        `The ${ctx.area} times out when ${ctx.plural} grow.`
      ],
      cause: (stack, ctx) => `The implementation performs per-${ctx.noun} work that should be batched, indexed, memoized, or moved out of the hot path.`,
      tags: ["performance", "n-plus-one", "profiling"],
      solutionLabel: "Move repeated work out of the hot path"
    }
  ];

  const highUseStackKeys = new Set([
    "angular",
    "react",
    "java",
    "node",
    "sql",
    "typescript",
    "css",
    "api",
    "testing",
    "security",
    "performance",
    "build",
    "orm"
  ]);

  const commonDefectCatalog = [
    d("type-mismatch", "Types and compile errors", "medium", "basic type mismatch casts API value incorrectly", "type-conversion", ["type-fixing", "compile-error"]),
    d("boolean-string", "Types and compile errors", "medium", "boolean flag arrives as a string and passes the wrong branch", "type-conversion", ["boolean", "api-shape"]),
    d("nullable-display", "Null, undefined, and optional data", "medium", "nullable display field is treated as a required string", "null-default", ["null", "empty-state"]),
    d("missing-union-case", "Types and compile errors", "high", "missing discriminated union case falls into an unsafe default", "type-boundary", ["union", "exhaustiveness"]),
    d("implicit-any-payload", "Types and compile errors", "medium", "implicit any hides a broken payload shape", "type-boundary", ["any", "payload"]),
    d("enum-drift", "Contracts and serialization", "medium", "server enum value drifts from the client mapping", "enum-map", ["enum", "contract"]),
    d("numeric-locale", "Types and compile errors", "medium", "numeric input with a comma is saved as the wrong number", "type-conversion", ["number", "locale"]),
    d("unknown-properties", "Contracts and serialization", "medium", "array item accepts unknown properties and leaks them forward", "type-boundary", ["schema", "validation"]),
    d("readonly-mutation", "State and mutation", "medium", "readonly collection is mutated during an update handler", "mutation", ["immutability", "readonly"]),
    d("generic-wrapper-cast", "Contracts and serialization", "high", "generic response wrapper is cast before validation", "serializer", ["generic", "runtime"]),
    d("blank-required", "Forms and validation", "medium", "whitespace-only required field passes validation", "validation", ["forms", "required"]),
    d("async-unique-validator", "Forms and validation", "high", "async uniqueness validator never cancels old checks", "async-validation", ["async-validator", "race-condition"]),
    d("server-field-errors", "Forms and validation", "medium", "server validation errors are not mapped back to fields", "validation", ["forms", "server-errors"]),
    d("reset-stale-dirty", "Forms and validation", "medium", "form reset keeps stale dirty and touched state", "validation", ["forms", "state"]),
    d("dynamic-row-removal", "Forms and validation", "medium", "dynamic form array removes the wrong row", "list-key", ["dynamic-form", "row-state"]),
    d("file-input-clear", "Files and uploads", "medium", "custom file input never clears the previous file", "file-upload", ["file-upload", "reset"]),
    d("duplicate-submit", "Async and concurrency", "high", "double click submits the same mutation twice", "duplicate-submit", ["double-submit", "idempotency"]),
    d("pagination-duplicate", "Pagination and lists", "medium", "pagination appends the same page twice", "pagination", ["pagination", "duplicates"]),
    d("eager-search", "Async and concurrency", "medium", "filter search fires on every keypress without debounce", "debounce", ["search", "debounce"]),
    d("missing-timeout", "REST and HTTP APIs", "high", "remote call has no timeout and hangs the request", "timeout", ["timeout", "http"]),
    d("retry-storm", "REST and HTTP APIs", "high", "retry loop hammers a failing dependency", "retry", ["retry", "backoff"]),
    d("no-content-json", "REST and HTTP APIs", "medium", "204 response is parsed as JSON", "serializer", ["204", "json"]),
    d("wrong-content-type", "REST and HTTP APIs", "medium", "missing Content-Type breaks the body parser", "contract", ["headers", "content-type"]),
    d("renamed-id-field", "Contracts and serialization", "high", "response id field is renamed without compatibility", "contract", ["schema", "compatibility"]),
    d("date-only-shift", "Dates, timezones, and locale", "medium", "date-only value shifts one day across timezones", "date", ["timezone", "date-only"]),
    d("dst-boundary", "Dates, timezones, and locale", "medium", "DST boundary schedules the wrong hour", "date", ["dst", "scheduler"]),
    d("optimistic-no-rollback", "State and mutation", "high", "optimistic update has no rollback path", "optimistic", ["optimistic-ui", "rollback"]),
    d("localstorage-parse", "State and mutation", "medium", "localStorage parse failure crashes startup", "state-sync", ["localstorage", "json"]),
    d("stale-closure-filter", "State and mutation", "medium", "stale closure uses an old filter value", "stale-closure", ["closure", "state"]),
    d("derived-state-copy", "State and mutation", "medium", "derived state is copied and then goes stale", "state-sync", ["derived-state", "sync"]),
    d("selector-recompute", "Performance and scaling", "medium", "selector recomputes an expensive map on every render", "memoization", ["memoization", "selector"]),
    d("index-key-state", "Pagination and lists", "medium", "array index key corrupts row state after sorting", "list-key", ["keys", "sorting"]),
    d("large-list-all-rows", "Performance and scaling", "high", "large list renders every row at once", "performance", ["virtualization", "large-list"]),
    d("deep-clone-dates", "Contracts and serialization", "medium", "deep clone strips dates, files, and methods", "serializer", ["clone", "date"]),
    d("modal-focus-return", "Accessibility and keyboard UX", "medium", "modal does not return focus after close", "modal-focus", ["focus", "modal"]),
    d("dropdown-keyboard", "Accessibility and keyboard UX", "medium", "dropdown skips keyboard navigation", "dropdown", ["dropdown", "keyboard"]),
    d("custom-multiselect-identity", "Complex UI components", "high", "custom multiselect dropdown compares whole objects instead of stable ids", "multiselect", ["multiselect", "identity"]),
    d("select-all-disabled", "Complex UI components", "medium", "select all ignores disabled options", "multiselect", ["select-all", "disabled"]),
    d("outside-click-early", "Complex UI components", "medium", "outside click listener closes the menu before option selection", "dropdown", ["outside-click", "events"]),
    d("overlay-hidden", "HTML and CSS layout", "medium", "z-index overlay is hidden behind a transformed parent", "css-layout", ["z-index", "overlay"]),
    d("missing-accessible-name", "Accessibility and keyboard UX", "medium", "interactive control has no accessible name", "accessibility", ["a11y", "label"]),
    d("broken-activedescendant", "Accessibility and keyboard UX", "medium", "aria-activedescendant points to a removed option", "accessibility", ["aria", "combobox"]),
    d("focus-trap-escape", "Accessibility and keyboard UX", "medium", "focus trap blocks Escape and Tab recovery", "modal-focus", ["focus-trap", "keyboard"]),
    d("route-param-early", "Routing and navigation", "medium", "route parameter is read before navigation data is ready", "routing", ["routing", "params"]),
    d("query-param-loop", "Routing and navigation", "high", "query parameter sync causes a navigation loop", "routing", ["query-params", "loop"]),
    d("protected-flash", "Authentication and authorization", "critical", "protected page flashes private data before redirect", "permissions", ["auth", "privacy"]),
    d("breadcrumb-hardcode", "Routing and navigation", "medium", "breadcrumb hardcodes a previous route and breaks deep links", "routing", ["routing", "deep-link"]),
    d("upload-mime", "Files and uploads", "high", "file upload trusts extension instead of MIME and signature", "file-upload", ["upload", "validation"]),
    d("upload-abort", "Files and uploads", "medium", "upload progress never handles abort or retry", "file-upload", ["abort", "progress"]),
    d("object-url-leak", "Lifecycle and resources", "medium", "image preview leaks object URLs", "resource-leak", ["object-url", "memory-leak"]),
    d("csrf-missing", "Authentication and authorization", "critical", "state-changing request omits CSRF protection", "security", ["csrf", "security"]),
    d("parallel-token-refresh", "Authentication and authorization", "high", "access token refresh creates parallel refresh calls", "security", ["token-refresh", "race-condition"]),
    d("ui-only-permissions", "Authentication and authorization", "critical", "permission check exists only in the UI", "permissions", ["authorization", "rbac"]),
    d("trusted-user-id", "Authentication and authorization", "critical", "request body user id is trusted for ownership", "permissions", ["idor", "ownership"]),
    d("unique-not-handled", "Database and persistence", "medium", "unique constraint error is not translated for the user", "unique", ["unique", "database"]),
    d("upsert-overwrite", "Database and persistence", "high", "upsert overwrites unrelated columns", "unique", ["upsert", "data-loss"]),
    d("non-null-migration", "Database and persistence", "high", "migration adds a non-null column without a safe default", "migration", ["migration", "rollback"]),
    d("drop-before-rollout", "Database and persistence", "critical", "migration drops a column before all app versions stop reading it", "migration", ["migration", "deployment"]),
    d("transaction-http", "Transactions and consistency", "high", "transaction stays open during an external HTTP call", "transaction", ["transaction", "http"]),
    d("outbox-idempotency", "Transactions and consistency", "high", "outbox message misses an idempotency key", "idempotency", ["outbox", "events"]),
    d("hydration-n-plus-one", "Performance and scaling", "high", "per-row hydration creates an N+1 query pattern", "n-plus-one", ["n-plus-one", "hydration"]),
    d("pool-exhaustion", "Performance and scaling", "high", "connection pool is exhausted under concurrent load", "connection-pool", ["connection-pool", "load"]),
    d("tenant-cache-key", "Caching and invalidation", "critical", "cache key ignores tenant or account scope", "stale-cache", ["tenant", "cache"]),
    d("related-cache-miss", "Caching and invalidation", "medium", "cache invalidation misses a related list", "stale-cache", ["cache", "invalidation"]),
    d("secret-log", "Errors and observability", "critical", "log statement leaks a token, password, or personal data", "logging", ["logging", "secrets"]),
    d("missing-correlation-id", "Errors and observability", "medium", "logs lack a correlation id for failed requests", "logging", ["correlation-id", "observability"]),
    d("flag-default-drift", "Configuration and environments", "high", "feature flag default differs between environments", "env", ["feature-flag", "environment"]),
    d("browser-env-prefix", "Configuration and environments", "medium", "browser build cannot read an env var because the required prefix is missing", "env", ["environment", "frontend"]),
    d("path-alias-ide-only", "Build, imports, and file paths", "medium", "path alias works in the IDE but not in the bundler", "build", ["path-alias", "build"]),
    d("circular-import", "Build, imports, and file paths", "high", "circular import initializes a module as undefined", "build", ["circular-import", "module"]),
    d("loose-peer-dep", "Build, imports, and file paths", "medium", "peer dependency range accepts an incompatible version", "build", ["dependencies", "peer-deps"]),
    d("production-sourcemap", "Build, imports, and file paths", "high", "production sourcemap exposes internal source", "build", ["sourcemap", "production"]),
    d("missing-await-test", "Testing and quality gates", "medium", "test forgets to await the async assertion", "test-async", ["testing", "async"]),
    d("sleepy-test", "Testing and quality gates", "medium", "test waits for a fixed timeout instead of a condition", "test-async", ["flaky-test", "wait"]),
    d("global-mock-leak", "Testing and quality gates", "medium", "global mock leaks into the next test", "mock-leak", ["mock", "test-isolation"]),
    d("snapshot-regression", "Testing and quality gates", "medium", "snapshot update hides a behavior regression", "mock-leak", ["snapshot", "regression"]),
    d("partial-lockfile", "Build, imports, and file paths", "medium", "dependency update changes source without updating the lockfile", "build", ["lockfile", "dependencies"]),
    d("shell-argument-injection", "Injection and unsafe input", "critical", "shell argument is built from untrusted input", "security", ["command-injection", "shell"])
  ];

  const angularDefectCatalog = [
    d("angular-standalone-import", "Angular framework defects", "medium", "standalone component import is missing from the route", "build", ["standalone", "imports"]),
    d("angular-onpush-mark", "Angular framework defects", "medium", "OnPush component does not mark for check after manual subscription", "state-sync", ["onpush", "change-detection"]),
    d("angular-expression-changed", "Angular framework defects", "medium", "ExpressionChangedAfterItHasBeenCheckedError appears after mutating in ngAfterViewInit", "state-sync", ["change-detection", "lifecycle"]),
    d("angular-async-pipe-duplicate", "Angular framework defects", "medium", "async pipe creates duplicate HTTP calls in the template", "stale-cache", ["async-pipe", "http"]),
    d("angular-nested-subscribe", "Angular framework defects", "high", "nested subscriptions create hidden race conditions", "async-validation", ["rxjs", "nested-subscribe"]),
    d("angular-cva-onchange", "Angular forms", "high", "ControlValueAccessor never calls onChange", "validation", ["cva", "forms"]),
    d("angular-cva-multiselect", "Angular forms", "high", "custom multiselect ControlValueAccessor returns mutable option objects", "multiselect", ["cva", "multiselect"]),
    d("angular-compare-with", "Angular forms", "medium", "select control loses selected option because compareWith is missing", "multiselect", ["comparewith", "select"]),
    d("angular-panel-checkbox", "Angular complex UI", "medium", "checkbox click inside select panel closes the dropdown", "dropdown", ["dropdown", "checkbox"]),
    d("angular-ngfor-trackby", "Angular performance", "medium", "ngFor has no trackBy on editable rows", "list-key", ["trackby", "ngfor"]),
    d("angular-impure-pipe", "Angular performance", "high", "impure pipe performs expensive filtering every change detection pass", "performance", ["pipe", "change-detection"]),
    d("angular-formarray-patch", "Angular forms", "medium", "FormArray patchValue silently misses rows with a different length", "validation", ["formarray", "patchvalue"]),
    d("angular-disabled-value", "Angular forms", "medium", "disabled control is missing from submitted form value", "validation", ["forms", "getrawvalue"]),
    d("angular-validator-complete", "Angular forms", "high", "async validator never completes and keeps the field pending", "async-validation", ["async-validator", "pending"]),
    d("angular-resolver-complete", "Angular routing", "high", "router resolver never completes because the observable stays open", "routing", ["resolver", "router"]),
    d("angular-guard-urltree", "Angular routing", "medium", "route guard navigates imperatively instead of returning UrlTree", "routing", ["guard", "urltree"]),
    d("angular-interceptor-401", "Angular HTTP", "critical", "HTTP interceptor swallows 401 and hides auth failure", "security", ["interceptor", "401"]),
    d("angular-http-params", "Angular HTTP", "medium", "HttpParams mutation is ignored because the object is immutable", "contract", ["httpparams", "immutable"]),
    d("angular-viewchild-static", "Angular lifecycle", "medium", "ViewChild is read before it exists", "state-sync", ["viewchild", "lifecycle"]),
    d("angular-ngonchanges-input", "Angular lifecycle", "medium", "ngOnChanges mutates the input object from the parent", "mutation", ["inputs", "mutation"]),
    d("angular-component-provider", "Angular dependency injection", "high", "service is provided at component level and duplicates shared state", "state-sync", ["providers", "di"]),
    d("angular-zone-outside", "Angular framework defects", "medium", "callback runs outside Angular zone and the UI does not update", "state-sync", ["zone", "change-detection"]),
    d("angular-ssr-window", "Angular SSR", "high", "server rendering crashes because window is used directly", "build", ["ssr", "window"]),
    d("angular-random-hydration", "Angular SSR", "medium", "random id creates a hydration mismatch", "state-sync", ["hydration", "id"]),
    d("angular-nested-safe-nav", "Angular templates", "medium", "nested template binding omits safe navigation", "null-default", ["template", "safe-navigation"]),
    d("angular-module-provider", "Angular dependency injection", "high", "module import registers the same provider twice", "build", ["module", "provider"]),
    d("angular-signal-loop", "Angular signals", "high", "signal effect writes to the same signal and loops", "state-sync", ["signals", "effect"]),
    d("angular-tosignal-initial", "Angular signals", "medium", "toSignal is used without an initial value", "null-default", ["signals", "rxjs"]),
    d("angular-valuechanges-debounce", "Angular forms", "medium", "valueChanges search has no debounce or distinct check", "debounce", ["valuechanges", "search"]),
    d("angular-combobox-keyboard", "Angular complex UI", "medium", "custom dropdown ignores arrow keys and active descendant state", "accessibility", ["combobox", "keyboard"]),
    d("angular-nonnullable-default", "Angular typed forms", "medium", "nonNullable form control starts with a null default", "type-boundary", ["typed-forms", "nonnull"]),
    d("angular-overlay-style", "Angular complex UI", "medium", "component-scoped styles do not reach overlay panel", "css-layout", ["overlay", "encapsulation"])
  ];

  const reactDefectCatalog = [
    d("react-effect-dependency", "React framework defects", "medium", "useEffect omits a dependency and reads stale data", "stale-closure", ["useeffect", "deps"]),
    d("react-effect-object-loop", "React framework defects", "high", "useEffect depends on a new object and loops forever", "state-sync", ["useeffect", "loop"]),
    d("react-unmounted-setstate", "React framework defects", "medium", "async callback updates state after unmount", "resource-leak", ["unmount", "async"]),
    d("react-controlled-uncontrolled", "React forms", "medium", "input flips between controlled and uncontrolled", "validation", ["controlled", "forms"]),
    d("react-index-key", "React lists", "medium", "list uses index as key and moves field state to the wrong row", "list-key", ["key", "list"]),
    d("react-callback-stale", "React framework defects", "medium", "memoized callback closes over stale state", "stale-closure", ["usecallback", "closure"]),
    d("react-derived-props", "React state", "medium", "props are copied into state and stop syncing", "state-sync", ["derived-state", "props"]),
    d("react-context-rerender", "React performance", "medium", "context provider recreates value and rerenders the whole tree", "memoization", ["context", "rerender"]),
    d("react-reducer-mutation", "React state", "high", "reducer mutates state and returns the same reference", "mutation", ["reducer", "immutability"]),
    d("react-suspense-error", "React framework defects", "high", "Suspense boundary has no error boundary for failed lazy loads", "build", ["suspense", "error-boundary"]),
    d("react-random-hydration", "React SSR", "medium", "random id causes hydration mismatch", "state-sync", ["hydration", "id"]),
    d("react-server-browser-api", "React SSR", "high", "server-rendered component reads browser-only API", "build", ["ssr", "window"]),
    d("react-multiselect-refetch", "React complex UI", "high", "custom multiselect loses selections after options refetch", "multiselect", ["multiselect", "identity"]),
    d("react-dropdown-ref", "React complex UI", "medium", "outside-click handler uses a stale ref", "dropdown", ["outside-click", "ref"]),
    d("react-portal-focus", "React accessibility", "medium", "portal modal closes without restoring focus", "modal-focus", ["portal", "focus"]),
    d("react-transition-order", "React framework defects", "medium", "transition update displays old results after a fast search", "async-validation", ["transition", "race-condition"]),
    d("react-memo-side-effect", "React framework defects", "medium", "useMemo is used for a side effect", "state-sync", ["usememo", "side-effect"]),
    d("react-layout-effect-ssr", "React SSR", "medium", "useLayoutEffect warning appears during server render", "build", ["ssr", "uselayout-effect"]),
    d("react-form-submit", "React forms", "medium", "form submit reloads the page before async save finishes", "duplicate-submit", ["forms", "submit"]),
    d("react-checkbox-group", "React forms", "medium", "checkbox group uses value instead of checked", "validation", ["checkbox", "forms"]),
    d("react-file-controlled", "React forms", "medium", "file input is treated as a controlled text input", "file-upload", ["file-input", "forms"]),
    d("react-query-key", "React data fetching", "medium", "query key omits the active filter", "stale-cache", ["react-query", "cache"]),
    d("react-navigate-render", "React routing", "high", "navigation is triggered during render", "routing", ["router", "render"]),
    d("react-lazy-default", "React build defects", "medium", "lazy import points at a named export instead of default export", "build", ["lazy", "import"]),
    d("react-listener-cleanup", "React lifecycle", "medium", "event listener cleanup uses a different function reference", "resource-leak", ["cleanup", "event-listener"]),
    d("react-debounce-recreated", "React performance", "medium", "debounced handler is recreated on every render", "debounce", ["debounce", "render"]),
    d("react-virtual-row-height", "React performance", "medium", "virtualized row height changes after render and breaks scroll math", "performance", ["virtualization", "scroll"]),
    d("react-optimistic-rollback", "React data fetching", "high", "optimistic cache update does not rollback on error", "optimistic", ["optimistic-ui", "cache"]),
    d("react-widget-boundary", "React framework defects", "medium", "widget crash brings down the whole page without an error boundary", "build", ["error-boundary", "widget"]),
    d("react-i18n-plural", "React internationalization", "medium", "plural text is hardcoded and fails other locales", "localization", ["i18n", "plural"]),
    d("react-combobox-aria", "React accessibility", "medium", "custom combobox omits aria-expanded and active option state", "accessibility", ["combobox", "aria"]),
    d("react-css-module", "React build defects", "medium", "CSS module class name is referenced as a literal string", "css-layout", ["css-modules", "class-name"])
  ];

  const javaDefectCatalog = [
    d("java-optional-get", "Java language defects", "medium", "Optional.get is called without checking presence", "null-default", ["optional", "null"]),
    d("java-bigdecimal-double", "Java language defects", "medium", "BigDecimal is constructed from a double", "type-conversion", ["bigdecimal", "money"]),
    d("java-string-equals", "Java language defects", "medium", "String values are compared with ==", "type-boundary", ["string", "equals"]),
    d("java-entity-equals", "Java persistence", "high", "entity equals and hashCode break after persistence assigns an id", "mutation", ["entity", "equals"]),
    d("java-lazy-outside-tx", "Java persistence", "high", "lazy collection is read outside a transaction", "transaction", ["hibernate", "lazy-loading"]),
    d("java-self-transaction", "Java Spring", "high", "@Transactional self-invocation bypasses the proxy", "transaction", ["transactional", "spring"]),
    d("java-readonly-write", "Java Spring", "medium", "write happens inside a readOnly transaction", "transaction", ["readonly", "transaction"]),
    d("java-n-plus-one", "Java persistence", "high", "lazy association creates N+1 selects", "n-plus-one", ["jpa", "n-plus-one"]),
    d("java-jackson-recursion", "Java serialization", "high", "Jackson serializes a bidirectional relationship forever", "serializer", ["jackson", "recursion"]),
    d("java-lombok-data-entity", "Java persistence", "medium", "Lombok @Data on an entity triggers lazy loads and unstable equality", "serializer", ["lombok", "entity"]),
    d("java-mapstruct-unmapped", "Java serialization", "medium", "mapper silently drops a new response field", "contract", ["mapstruct", "mapping"]),
    d("java-missing-valid", "Java validation", "medium", "nested request object is not validated because @Valid is missing", "validation", ["bean-validation", "valid"]),
    d("java-enum-ordinal", "Java persistence", "high", "enum is persisted by ordinal and changes meaning after reorder", "enum-map", ["enum", "jpa"]),
    d("java-localdatetime", "Dates, timezones, and locale", "medium", "LocalDateTime is used for an instant in time", "date", ["time", "timezone"]),
    d("java-future-exception", "Async and concurrency", "high", "CompletableFuture exception is never observed", "async-validation", ["completablefuture", "async"]),
    d("java-parallel-entitymanager", "Async and concurrency", "critical", "parallel stream shares an EntityManager across threads", "connection-pool", ["parallel-stream", "jpa"]),
    d("java-long-transaction", "Performance and scaling", "high", "long transaction holds a connection during slow work", "connection-pool", ["connection-pool", "transaction"]),
    d("java-jpql-concat", "Injection and unsafe input", "critical", "JPQL query is built with string concatenation", "security", ["jpql", "injection"]),
    d("java-null-collection", "Java language defects", "medium", "repository returns null instead of an empty collection", "null-default", ["collections", "null"]),
    d("java-error-200", "REST and HTTP APIs", "medium", "controller returns 200 OK for validation errors", "contract", ["http-status", "api"]),
    d("java-cors-credentials", "Authentication and authorization", "critical", "CORS wildcard is combined with credentials", "security", ["cors", "credentials"]),
    d("java-filter-order", "Authentication and authorization", "high", "Spring Security filter runs after the endpoint is already matched", "permissions", ["spring-security", "filter"]),
    d("java-jwt-clock", "Authentication and authorization", "medium", "JWT validation rejects valid tokens because clock skew is not allowed", "security", ["jwt", "clock-skew"]),
    d("java-flyway-checksum", "Database and persistence", "medium", "migration checksum changes after it has run", "migration", ["flyway", "migration"]),
    d("java-unique-race", "Database and persistence", "high", "pre-check for uniqueness races under concurrent requests", "unique", ["unique", "race-condition"]),
    d("java-post-idempotency", "Transactions and consistency", "high", "POST endpoint has no idempotency key", "idempotency", ["post", "idempotency"]),
    d("java-unknown-json", "Contracts and serialization", "medium", "unknown JSON fields are silently ignored in a strict workflow", "contract", ["jackson", "schema"]),
    d("java-objectmapper-date", "Dates, timezones, and locale", "medium", "ObjectMapper date format differs from the API contract", "date", ["jackson", "date"]),
    d("java-security-threadlocal", "Authentication and authorization", "critical", "security context leaks between async tasks", "security", ["threadlocal", "security"]),
    d("java-cache-tenant", "Caching and invalidation", "critical", "@Cacheable key omits tenant scope", "stale-cache", ["cache", "tenant"]),
    d("java-validator-state", "Java validation", "high", "custom validator stores request state in a singleton bean", "validation", ["validator", "thread-safety"]),
    d("java-multipart-limit", "Files and uploads", "medium", "multipart upload limit is not configured", "file-upload", ["multipart", "limits"])
  ];

  const stackSpecificDefectCatalog = {
    angular: angularDefectCatalog,
    react: reactDefectCatalog,
    java: javaDefectCatalog
  };

  const patternCache = new Map();

  function d(key, category, severity, subject, kind, tags) {
    return { key, category, severity, subject, kind, tags };
  }

  function getPatternsForStack(stack) {
    if (patternCache.has(stack.key)) return patternCache.get(stack.key);
    const defects = [];
    if (highUseStackKeys.has(stack.key)) defects.push(...commonDefectCatalog);
    defects.push(...(stackSpecificDefectCatalog[stack.key] || []));
    const generatedPatterns = defects.map(defectToPattern);
    const stackPatterns = [...patterns, ...generatedPatterns];
    patternCache.set(stack.key, stackPatterns);
    return stackPatterns;
  }

  function getAllPatterns() {
    const all = [];
    stacks.forEach((stack) => all.push(...getPatternsForStack(stack)));
    return all;
  }

  function defectToPattern(defect) {
    return {
      key: `focused-${defect.key}`,
      category: defect.category,
      severity: defect.severity,
      kind: defect.kind,
      subject: defect.subject,
      tags: defect.tags,
      title: (stack, ctx) => `${stack.label} ${ctx.area}: ${defect.subject}`,
      summary: (stack, ctx) => `A realistic ${stack.label} defect where ${defect.subject} while working on ${ctx.area}.`,
      symptoms: (stack, ctx) => [
        `The ${ctx.area} fails around ${defect.subject}.`,
        `The issue appears during ${ctx.action} or when ${ctx.plural} contain edge-case data.`,
        `Debugging points to ${defect.category.toLowerCase()} rather than a simple typo.`
      ],
      cause: (stack, ctx) => `The ${stack.label} implementation does not make an explicit contract for ${defect.subject}, so ${ctx.noun} data reaches code that was written for a narrower happy path.`,
      solutionLabel: solutionLabelForKind(defect.kind)
    };
  }

  function solutionLabelForKind(kind) {
    const labels = {
      "type-conversion": "Parse and narrow the type at the boundary",
      "type-boundary": "Replace casts with a validated contract",
      "null-default": "Represent loading, missing, and empty data separately",
      "enum-map": "Map external enum values deliberately",
      mutation: "Update immutable state or use a transaction boundary",
      serializer: "Validate serialized data before using it",
      validation: "Put validation in the form and server boundary",
      "async-validation": "Cancel stale async work and surface pending state",
      "list-key": "Use stable ids for list identity",
      "file-upload": "Validate, clear, abort, and clean up files",
      "duplicate-submit": "Disable repeat submits and use idempotency",
      pagination: "Track page cursors and merge by stable id",
      debounce: "Debounce input and cancel stale requests",
      timeout: "Set explicit timeouts and failure states",
      retry: "Use bounded retries with backoff",
      contract: "Version and verify the contract",
      date: "Use explicit UTC and timezone rules",
      optimistic: "Pair optimistic writes with rollback",
      "state-sync": "Keep one source of truth",
      "stale-closure": "Read the latest value where the callback runs",
      memoization: "Memoize only stable expensive work",
      performance: "Batch, virtualize, or move work off the hot path",
      "modal-focus": "Manage focus as part of the component state",
      dropdown: "Handle pointer, keyboard, and outside-click order",
      multiselect: "Use stable option ids and controlled selection",
      "css-layout": "Create a predictable layout and stacking context",
      accessibility: "Wire labels, roles, focus, and active state",
      routing: "Synchronize navigation state explicitly",
      permissions: "Enforce permissions on the trusted boundary",
      security: "Treat external input as hostile",
      unique: "Let the database enforce uniqueness and handle conflicts",
      migration: "Ship migrations in backward-compatible phases",
      transaction: "Keep the unit of work short and atomic",
      idempotency: "Use request ids for repeat-safe writes",
      "n-plus-one": "Batch related data access",
      "connection-pool": "Release connections and shorten blocking work",
      "stale-cache": "Scope cache keys and invalidate related data",
      logging: "Log useful context without leaking secrets",
      env: "Validate environment configuration at startup",
      build: "Make build inputs explicit and reproducible",
      "test-async": "Wait for behavior, not time",
      "mock-leak": "Reset mocks and assert behavior",
      "resource-leak": "Clean up resources in the matching lifecycle"
    };
    return labels[kind] || "Apply the focused repair";
  }

  function code(lines) {
    return lines.join("\n");
  }

  function commonBad(stack, pattern, ctx) {
    if (pattern.kind) return focusedSnippet(stack, pattern, ctx).bad;
    const family = stack.family;
    if (family === "angular") return angularSnippet(pattern.key, ctx).bad;
    if (family === "react") return reactSnippet(pattern.key, ctx).bad;
    if (family === "java") return javaSnippet(pattern.key, ctx).bad;
    if (family === "node") return nodeSnippet(pattern.key, ctx).bad;
    if (family === "git") return gitSnippet(pattern.key, ctx).bad;
    if (family === "sql") return sqlSnippet(pattern.key, ctx).bad;
    if (family === "css") return cssSnippet(pattern.key, ctx).bad;
    if (family === "docker") return dockerSnippet(pattern.key, ctx).bad;
    if (family === "ci") return ciSnippet(pattern.key, ctx).bad;
    if (family === "shell") return shellSnippet(pattern.key, ctx).bad;
    return genericSnippet(pattern.key, ctx, stack).bad;
  }

  function commonGood(stack, pattern, ctx) {
    if (pattern.kind) return focusedSnippet(stack, pattern, ctx).good;
    const family = stack.family;
    if (family === "angular") return angularSnippet(pattern.key, ctx).good;
    if (family === "react") return reactSnippet(pattern.key, ctx).good;
    if (family === "java") return javaSnippet(pattern.key, ctx).good;
    if (family === "node") return nodeSnippet(pattern.key, ctx).good;
    if (family === "git") return gitSnippet(pattern.key, ctx).good;
    if (family === "sql") return sqlSnippet(pattern.key, ctx).good;
    if (family === "css") return cssSnippet(pattern.key, ctx).good;
    if (family === "docker") return dockerSnippet(pattern.key, ctx).good;
    if (family === "ci") return ciSnippet(pattern.key, ctx).good;
    if (family === "shell") return shellSnippet(pattern.key, ctx).good;
    return genericSnippet(pattern.key, ctx, stack).good;
  }

  function focusedSnippet(stack, pattern, ctx) {
    const factory = {
      angular: focusedAngularSnippet,
      react: focusedReactSnippet,
      java: focusedJavaSnippet,
      node: focusedGenericSnippet,
      typescript: focusedTypeScriptSnippet,
      sql: focusedSqlSnippet,
      css: focusedCssSnippet,
      api: focusedGenericSnippet,
      testing: focusedTestingSnippet,
      security: focusedGenericSnippet,
      performance: focusedGenericSnippet,
      build: focusedBuildSnippet,
      orm: focusedGenericSnippet
    }[stack.family] || focusedGenericSnippet;
    return factory(pattern, ctx, stack);
  }

  function focusedAngularSnippet(pattern, ctx) {
    const kind = pattern.kind;
    const note = `// ${pattern.subject}`;
    if (kindIn(kind, ["type-conversion", "type-boundary", "null-default", "enum-map", "contract", "serializer"])) {
      return {
        bad: code([
          note,
          `load(raw: any) {`,
          `  this.${ctx.noun} = raw as ${cap(ctx.noun)};`,
          `  this.form.patchValue({ ${ctx.column}: this.${ctx.noun}.${ctx.column}.toUpperCase() });`,
          `}`
        ]),
        good: code([
          note,
          `const parsed = ${ctx.noun}Schema.safeParse(raw);`,
          `if (!parsed.success) {`,
          `  this.form.setErrors({ contract: true });`,
          `  return;`,
          `}`,
          `this.${ctx.noun} = parsed.data;`,
          `this.form.patchValue({ ${ctx.column}: parsed.data.${ctx.column} ?? "" });`
        ])
      };
    }
    if (kindIn(kind, ["validation", "async-validation", "duplicate-submit", "debounce"])) {
      return {
        bad: code([
          note,
          `this.form = new FormGroup({ ${ctx.column}: new FormControl("") });`,
          `this.form.valueChanges.subscribe(value => {`,
          `  this.http.post("${ctx.endpoint}", value).subscribe();`,
          `});`
        ]),
        good: code([
          note,
          `this.form = new FormGroup({`,
          `  ${ctx.column}: new FormControl("", { validators: [Validators.required], nonNullable: true })`,
          `});`,
          `this.form.valueChanges.pipe(`,
          `  debounceTime(250),`,
          `  distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),`,
          `  switchMap(value => this.http.post("${ctx.endpoint}", value))`,
          `).subscribe();`
        ])
      };
    }
    if (kindIn(kind, ["dropdown", "multiselect", "accessibility", "modal-focus"])) {
      return {
        bad: code([
          note,
          `toggle(option: ${cap(ctx.noun)}) {`,
          `  if (this.selected.includes(option)) this.selected = this.selected.filter(item => item !== option);`,
          `  else this.selected.push(option);`,
          `}`
        ]),
        good: code([
          note,
          `toggle(option: ${cap(ctx.noun)}) {`,
          `  const ids = new Set(this.selectedIds);`,
          `  ids.has(option.${ctx.id}) ? ids.delete(option.${ctx.id}) : ids.add(option.${ctx.id});`,
          `  this.selectedIds = ids;`,
          `  this.onChange([...ids]);`,
          `}`,
          `trackById = (_: number, option: ${cap(ctx.noun)}) => option.${ctx.id};`
        ])
      };
    }
    if (kindIn(kind, ["routing", "permissions", "security"])) {
      return {
        bad: code([
          note,
          `const id = this.route.snapshot.params["id"];`,
          `if (this.currentUser.role === "admin") {`,
          `  this.http.delete(\`${ctx.endpoint}/\${id}\`).subscribe();`,
          `}`
        ]),
        good: code([
          note,
          `this.route.paramMap.pipe(`,
          `  map(params => params.get("id")),`,
          `  filter(Boolean),`,
          `  switchMap(id => this.http.delete(\`${ctx.endpoint}/\${id}\`))`,
          `).subscribe();`,
          `// The API validates role and ownership before deleting.`
        ])
      };
    }
    if (kindIn(kind, ["performance", "memoization", "list-key", "state-sync", "stale-closure", "mutation", "optimistic", "stale-cache"])) {
      return {
        bad: code([
          note,
          `update(next: ${cap(ctx.noun)}) {`,
          `  this.${ctx.plural}.push(next);`,
          `  this.visible = this.${ctx.plural}.filter(item => item.${ctx.column}.includes(this.query));`,
          `}`
        ]),
        good: code([
          note,
          `readonly visible$ = combineLatest([this.${ctx.plural}$, this.query$]).pipe(`,
          `  map(([items, query]) => items.filter(item => item.${ctx.column}?.includes(query))),`,
          `  shareReplay({ bufferSize: 1, refCount: true })`,
          `);`,
          `trackById = (_: number, item: ${cap(ctx.noun)}) => item.${ctx.id};`
        ])
      };
    }
    if (kindIn(kind, ["file-upload", "resource-leak"])) {
      return {
        bad: code([
          note,
          `preview(file: File) {`,
          `  this.previewUrl = URL.createObjectURL(file);`,
          `  this.http.post("${ctx.endpoint}", file).subscribe();`,
          `}`
        ]),
        good: code([
          note,
          `preview(file: File) {`,
          `  if (!allowedTypes.has(file.type)) throw new Error("Unsupported file type");`,
          `  URL.revokeObjectURL(this.previewUrl);`,
          `  this.previewUrl = URL.createObjectURL(file);`,
          `}`,
          `ngOnDestroy() { URL.revokeObjectURL(this.previewUrl); }`
        ])
      };
    }
    if (kind === "date") {
      return {
        bad: code([note, `payload.${ctx.column} = new Date(this.form.value.${ctx.column}).toString();`]),
        good: code([note, `payload.${ctx.column} = DateTime.fromISO(this.form.value.${ctx.column}, { zone: "utc" }).toISO();`])
      };
    }
    return focusedGenericSnippet(pattern, ctx, { family: "typescript" });
  }

  function focusedReactSnippet(pattern, ctx) {
    const kind = pattern.kind;
    const note = `// ${pattern.subject}`;
    if (kindIn(kind, ["type-conversion", "type-boundary", "null-default", "enum-map", "contract", "serializer"])) {
      return {
        bad: code([
          note,
          `const ${ctx.component} = ({ data }) => {`,
          `  const ${ctx.noun} = data;`,
          `  return <strong>{${ctx.noun}.${ctx.column}.toUpperCase()}</strong>;`,
          `};`
        ]),
        good: code([
          note,
          `const parsed = ${ctx.noun}Schema.safeParse(data);`,
          `if (!parsed.success) return <InlineError />;`,
          `return <strong>{parsed.data.${ctx.column} ?? "Unknown"}</strong>;`
        ])
      };
    }
    if (kindIn(kind, ["validation", "duplicate-submit", "file-upload"])) {
      return {
        bad: code([
          note,
          `function submit(event) {`,
          `  fetch("${ctx.endpoint}", { method: "POST", body: JSON.stringify(form) });`,
          `}`
        ]),
        good: code([
          note,
          `async function submit(event) {`,
          `  event.preventDefault();`,
          `  if (isSaving || !schema.safeParse(form).success) return;`,
          `  setIsSaving(true);`,
          `  try { await save${cap(ctx.noun)}(form); } finally { setIsSaving(false); }`,
          `}`
        ])
      };
    }
    if (kindIn(kind, ["dropdown", "multiselect", "accessibility", "modal-focus"])) {
      return {
        bad: code([
          note,
          `function toggle(option) {`,
          `  setSelected(selected.includes(option) ? selected.filter(item => item !== option) : [...selected, option]);`,
          `}`
        ]),
        good: code([
          note,
          `function toggle(option) {`,
          `  setSelectedIds(current => {`,
          `    const next = new Set(current);`,
          `    next.has(option.${ctx.id}) ? next.delete(option.${ctx.id}) : next.add(option.${ctx.id});`,
          `    return next;`,
          `  });`,
          `}`
        ])
      };
    }
    if (kindIn(kind, ["stale-closure", "state-sync", "mutation", "memoization", "list-key", "performance", "optimistic", "stale-cache", "debounce", "async-validation"])) {
      return {
        bad: code([
          note,
          `useEffect(() => {`,
          `  const filtered = ${ctx.plural}.filter(item => item.${ctx.column}.includes(query));`,
          `  setRows(filtered);`,
          `}, []);`
        ]),
        good: code([
          note,
          `const rows = useMemo(() => {`,
          `  return ${ctx.plural}.filter(item => item.${ctx.column}?.includes(query));`,
          `}, [${ctx.plural}, query]);`,
          ``,
          `return rows.map(row => <Row key={row.${ctx.id}} row={row} />);`
        ])
      };
    }
    if (kindIn(kind, ["routing", "permissions", "security"])) {
      return {
        bad: code([
          note,
          `if (currentUser.role === "admin") {`,
          `  fetch(\`${ctx.endpoint}/\${params.id}\`, { method: "DELETE" });`,
          `}`
        ]),
        good: code([
          note,
          `await api.delete(\`${ctx.endpoint}/\${params.id}\`);`,
          `// Server checks token, role, tenant, and ${ctx.noun} ownership.`
        ])
      };
    }
    if (kind === "date") {
      return {
        bad: code([note, `const label = new Date(value).toLocaleDateString();`]),
        good: code([note, `const label = Temporal.Instant.from(value).toZonedDateTimeISO(userTimeZone).toLocaleString();`])
      };
    }
    return focusedGenericSnippet(pattern, ctx, { family: "typescript" });
  }

  function focusedJavaSnippet(pattern, ctx) {
    const kind = pattern.kind;
    const note = `// ${pattern.subject}`;
    if (kindIn(kind, ["type-conversion", "type-boundary", "null-default", "enum-map"])) {
      return {
        bad: code([
          note,
          `String value = repository.findById(${ctx.id}).get().get${cap(camel(ctx.column))}();`,
          `return value.toUpperCase();`
        ]),
        good: code([
          note,
          `return repository.findById(${ctx.id})`,
          `  .map(${cap(ctx.noun)}::get${cap(camel(ctx.column))})`,
          `  .filter(value -> !value.isBlank())`,
          `  .orElseThrow(() -> new NotFoundException("${ctx.noun} not found"));`
        ])
      };
    }
    if (kindIn(kind, ["validation", "contract", "serializer"])) {
      return {
        bad: code([
          note,
          `@PostMapping("${ctx.endpoint}")`,
          `public ${cap(ctx.noun)} save(@RequestBody ${cap(ctx.noun)}Request request) {`,
          `  return service.save(mapper.toEntity(request));`,
          `}`
        ]),
        good: code([
          note,
          `@PostMapping("${ctx.endpoint}")`,
          `public ResponseEntity<${cap(ctx.noun)}Response> save(@Valid @RequestBody ${cap(ctx.noun)}Request request) {`,
          `  return ResponseEntity.status(201).body(mapper.toResponse(service.save(request)));`,
          `}`
        ])
      };
    }
    if (kindIn(kind, ["transaction", "unique", "idempotency", "migration", "n-plus-one", "connection-pool", "stale-cache"])) {
      return {
        bad: code([
          note,
          `public void ${ctx.action}(${cap(ctx.noun)}Request request) {`,
          `  if (!repo.existsBy${cap(camel(ctx.column))}(request.${camel(ctx.column)}())) {`,
          `    repo.save(mapper.toEntity(request));`,
          `  }`,
          `  externalClient.notify(request);`,
          `}`
        ]),
        good: code([
          note,
          `@Transactional`,
          `public ${cap(ctx.noun)} ${ctx.action}(${cap(ctx.noun)}Request request, String idempotencyKey) {`,
          `  ${cap(ctx.noun)} saved = repo.saveAndFlush(mapper.toEntity(request));`,
          `  outbox.enqueue("${ctx.noun}.changed", saved.getId(), idempotencyKey);`,
          `  return saved;`,
          `}`
        ])
      };
    }
    if (kindIn(kind, ["async-validation", "retry", "timeout", "resource-leak"])) {
      return {
        bad: code([
          note,
          `CompletableFuture.supplyAsync(() -> client.${ctx.action}())`,
          `  .thenAccept(cache::put);`
        ]),
        good: code([
          note,
          `client.${ctx.action}()`,
          `  .orTimeout(3, TimeUnit.SECONDS)`,
          `  .whenComplete((value, error) -> {`,
          `    if (error != null) log.warn("${ctx.action} failed", error);`,
          `    else cache.put(value);`,
          `  });`
        ])
      };
    }
    if (kindIn(kind, ["permissions", "security"])) {
      return {
        bad: code([
          note,
          `@GetMapping("${ctx.endpoint}/{id}")`,
          `public ${cap(ctx.noun)} get(@PathVariable String id) {`,
          `  return repo.findById(id).orElseThrow();`,
          `}`
        ]),
        good: code([
          note,
          `@PreAuthorize("@authz.canRead(authentication, #id)")`,
          `@GetMapping("${ctx.endpoint}/{id}")`,
          `public ${cap(ctx.noun)} get(@PathVariable String id) {`,
          `  return repo.findVisibleById(id).orElseThrow();`,
          `}`
        ])
      };
    }
    if (kind === "date") {
      return {
        bad: code([note, `LocalDateTime value = LocalDateTime.parse(request.${camel(ctx.column)}());`]),
        good: code([note, `Instant value = OffsetDateTime.parse(request.${camel(ctx.column)}()).toInstant();`])
      };
    }
    return focusedGenericSnippet(pattern, ctx, { family: "java" });
  }

  function focusedTypeScriptSnippet(pattern, ctx) {
    const note = `// ${pattern.subject}`;
    return {
      bad: code([
        note,
        `const payload: any = await response.json();`,
        `const label: string = payload.${ctx.column};`,
        `return label.toUpperCase();`
      ]),
      good: code([
        note,
        `const payload = ${ctx.noun}Schema.parse(await response.json());`,
        `const label = payload.${ctx.column} ?? "Unknown";`,
        `return label.toUpperCase();`
      ])
    };
  }

  function focusedSqlSnippet(pattern, ctx) {
    const kind = pattern.kind;
    if (kindIn(kind, ["security", "permissions", "unique", "transaction", "idempotency", "n-plus-one", "connection-pool", "stale-cache", "performance", "migration"])) {
      return {
        bad: code([
          `-- ${pattern.subject}`,
          `select * from ${ctx.table} where ${ctx.column} = '` + "${input}" + `';`,
          `update ${ctx.table} set ${ctx.column} = 'done';`
        ]),
        good: code([
          `-- ${pattern.subject}`,
          `begin;`,
          `select * from ${ctx.table} where ${ctx.column} = $1 and tenant_id = current_setting('app.tenant_id')::uuid;`,
          `update ${ctx.table} set ${ctx.column} = $2 where id = $3;`,
          `commit;`
        ])
      };
    }
    return {
      bad: code([`-- ${pattern.subject}`, `select upper(${ctx.column}) from ${ctx.table};`]),
      good: code([`-- ${pattern.subject}`, `select upper(coalesce(${ctx.column}, 'unknown')) from ${ctx.table};`])
    };
  }

  function focusedCssSnippet(pattern, ctx) {
    const className = dash(ctx.component);
    if (kindIn(pattern.kind, ["dropdown", "multiselect", "css-layout", "modal-focus", "accessibility"])) {
      return {
        bad: code([
          `/* ${pattern.subject} */`,
          `.${className}__menu {`,
          `  position: absolute;`,
          `  z-index: 1;`,
          `  height: auto;`,
          `}`
        ]),
        good: code([
          `/* ${pattern.subject} */`,
          `.${className} { position: relative; }`,
          `.${className}__menu {`,
          `  position: fixed;`,
          `  z-index: 1000;`,
          `  max-height: min(320px, 60vh);`,
          `  overflow: auto;`,
          `}`
        ])
      };
    }
    return focusedGenericSnippet(pattern, ctx, { family: "css" });
  }

  function focusedTestingSnippet(pattern, ctx) {
    return {
      bad: code([
        `// ${pattern.subject}`,
        `it("saves ${ctx.area}", () => {`,
        `  fireEvent.click(screen.getByText("Save"));`,
        `  expect(api.${ctx.action}).toHaveBeenCalled();`,
        `});`
      ]),
      good: code([
        `// ${pattern.subject}`,
        `it("saves ${ctx.area}", async () => {`,
        `  await user.click(screen.getByRole("button", { name: /save/i }));`,
        `  await waitFor(() => expect(api.${ctx.action}).toHaveBeenCalledTimes(1));`,
        `});`,
        `afterEach(() => vi.restoreAllMocks());`
      ])
    };
  }

  function focusedBuildSnippet(pattern, ctx) {
    return {
      bad: code([
        `// ${pattern.subject}`,
        `export default {`,
        `  resolve: { alias: { "@": "./src" } },`,
        `  define: { ${ctx.env}: process.env.${ctx.env} }`,
        `};`
      ]),
      good: code([
        `// ${pattern.subject}`,
        `export default defineConfig({`,
        `  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },`,
        `  define: { "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV) }`,
        `});`
      ])
    };
  }

  function focusedGenericSnippet(pattern, ctx, stack) {
    const kind = pattern.kind;
    const note = `// ${pattern.subject}`;
    if (kindIn(kind, ["security", "permissions"])) {
      return {
        bad: code([
          note,
          `app.get("${ctx.endpoint}/:${ctx.id}", async (req, res) => {`,
          `  const row = await repo.find(req.params.${ctx.id});`,
          `  res.json(row);`,
          `});`
        ]),
        good: code([
          note,
          `app.get("${ctx.endpoint}/:${ctx.id}", requireAuth, async (req, res) => {`,
          `  const row = await repo.findVisibleTo(req.params.${ctx.id}, req.user);`,
          `  if (!row) return res.sendStatus(404);`,
          `  res.json(row);`,
          `});`
        ])
      };
    }
    if (kindIn(kind, ["validation", "type-conversion", "type-boundary", "null-default", "enum-map", "contract", "serializer"])) {
      return {
        bad: code([
          note,
          `const payload = await response.json();`,
          `await save${cap(ctx.noun)}({ ${ctx.column}: payload.${ctx.column}.trim() });`
        ]),
        good: code([
          note,
          `const payload = ${ctx.noun}Schema.parse(await response.json());`,
          `await save${cap(ctx.noun)}({ ${ctx.column}: payload.${ctx.column}?.trim() ?? null });`
        ])
      };
    }
    if (kindIn(kind, ["async-validation", "debounce", "timeout", "retry", "duplicate-submit", "pagination"])) {
      return {
        bad: code([
          note,
          `button.addEventListener("click", async () => {`,
          `  const result = await fetch("${ctx.endpoint}").then(r => r.json());`,
          `  render(result);`,
          `});`
        ]),
        good: code([
          note,
          `const controller = new AbortController();`,
          `const result = await fetch("${ctx.endpoint}", { signal: controller.signal })`,
          `  .then(assertOk)`,
          `  .then(r => r.json());`,
          `render(mergeById(currentRows, result, "${ctx.id}"));`
        ])
      };
    }
    if (kindIn(kind, ["transaction", "unique", "migration", "idempotency", "n-plus-one", "connection-pool", "stale-cache", "optimistic"])) {
      return {
        bad: code([
          note,
          `await db.${ctx.table}.create({ data: payload });`,
          `await publish("${ctx.noun}.created", payload);`
        ]),
        good: code([
          note,
          `await db.transaction(async tx => {`,
          `  const saved = await tx.${ctx.table}.create({ data: payload });`,
          `  await tx.outbox.create({ data: { topic: "${ctx.noun}.created", payload: saved, idempotencyKey } });`,
          `});`
        ])
      };
    }
    if (kindIn(kind, ["state-sync", "stale-closure", "mutation", "memoization", "list-key", "performance"])) {
      return {
        bad: code([
          note,
          `${ctx.plural}.sort((a, b) => a.${ctx.column}.localeCompare(b.${ctx.column}));`,
          `const rows = ${ctx.plural}.map(item => expensiveFormat(item));`
        ]),
        good: code([
          note,
          `const sorted = [...${ctx.plural}].sort((a, b) => a.${ctx.column}.localeCompare(b.${ctx.column}));`,
          `const rows = memoizeByIds(sorted, item => item.${ctx.id}, expensiveFormat);`
        ])
      };
    }
    if (kindIn(kind, ["dropdown", "multiselect", "accessibility", "modal-focus", "css-layout"])) {
      return {
        bad: code([
          note,
          `selected.push(option);`,
          `menu.hidden = !menu.hidden;`
        ]),
        good: code([
          note,
          `selectedIds = toggleStableId(selectedIds, option.${ctx.id});`,
          `menu.setAttribute("aria-expanded", String(isOpen));`,
          `activeOptionId = option.${ctx.id};`
        ])
      };
    }
    if (kind === "date") {
      return {
        bad: code([note, `const value = new Date(input.${ctx.column});`]),
        good: code([note, `const value = DateTime.fromISO(input.${ctx.column}, { zone: "utc" });`])
      };
    }
    if (kind === "file-upload" || kind === "resource-leak") {
      return {
        bad: code([note, `const url = URL.createObjectURL(file);`, `await upload(file);`]),
        good: code([note, `if (!allowedTypes.has(file.type)) throw new Error("Unsupported file");`, `try { await upload(file); } finally { URL.revokeObjectURL(url); }`])
      };
    }
    if (kindIn(kind, ["logging", "env", "build", "test-async", "mock-leak"])) {
      return {
        bad: code([note, `console.log("debug", request);`, `process.env.${ctx.env} || "https://staging.example.com${ctx.endpoint}";`]),
        good: code([note, `logger.info({ requestId, feature: "${ctx.area}" }, "${ctx.action}");`, `const url = requiredEnv("${ctx.env}");`])
      };
    }
    return {
      bad: code([note, `const value = unsafeRead(input);`, `await ${ctx.action}(value);`]),
      good: code([note, `const value = validate(input);`, `await ${ctx.action}(value);`])
    };
  }

  function kindIn(kind, values) {
    return values.includes(kind);
  }

  function angularSnippet(issue, ctx) {
    const snippets = {
      "async-race": {
        bad: code([
          `search(term: string) {`,
          `  this.http.get<${cap(ctx.noun)}[]>(\`${ctx.endpoint}?q=\${term}\`)`,
          `    .subscribe(${ctx.plural} => this.${ctx.plural} = ${ctx.plural});`,
          `}`
        ]),
        good: code([
          `readonly term$ = new Subject<string>();`,
          `readonly ${ctx.plural}$ = this.term$.pipe(`,
          `  debounceTime(250),`,
          `  distinctUntilChanged(),`,
          `  switchMap(term => this.http.get<${cap(ctx.noun)}[]>(\`${ctx.endpoint}?q=\${encodeURIComponent(term)}\`))`,
          `);`
        ])
      },
      "null-guard": {
        bad: code([`<h2>{{ ${ctx.noun}.profile.${ctx.column}.toUpperCase() }}</h2>`]),
        good: code([
          `<ng-container *ngIf="${ctx.noun}$ | async as ${ctx.noun}; else loading">`,
          `  <h2>{{ ${ctx.noun}.profile?.${ctx.column} || "Unknown" }}</h2>`,
          `</ng-container>`,
          `<ng-template #loading>Loading...</ng-template>`
        ])
      },
      "mutation-side-effect": {
        bad: code([
          `markSelected(${ctx.noun}: ${cap(ctx.noun)}) {`,
          `  ${ctx.noun}.selected = true;`,
          `  this.${ctx.plural}.push(${ctx.noun});`,
          `}`
        ]),
        good: code([
          `markSelected(${ctx.noun}: ${cap(ctx.noun)}) {`,
          `  const selected = { ...${ctx.noun}, selected: true };`,
          `  this.${ctx.plural} = [...this.${ctx.plural}, selected];`,
          `}`
        ])
      },
      "config-env": {
        bad: code([`const apiUrl = "https://staging.example.com${ctx.endpoint}";`]),
        good: code([
          `export const environment = {`,
          `  ${camel(ctx.env)}: window.__APP_CONFIG__.${ctx.env}`,
          `};`,
          `assertConfigured(environment.${camel(ctx.env)}, "${ctx.env}");`
        ])
      },
      "swallowed-error": {
        bad: code([
          `load() {`,
          `  return this.http.get<${cap(ctx.noun)}[]>("${ctx.endpoint}").pipe(`,
          `    catchError(() => of([]))`,
          `  );`,
          `}`
        ]),
        good: code([
          `load() {`,
          `  return this.http.get<${cap(ctx.noun)}[]>("${ctx.endpoint}").pipe(`,
          `    catchError(error => {`,
          `      this.logger.error("${ctx.action} failed", error);`,
          `      return throwError(() => new Error("Unable to load ${ctx.plural}"));`,
          `    })`,
          `  );`,
          `}`
        ])
      },
      "resource-leak": {
        bad: code([
          `ngOnInit() {`,
          `  interval(1000).subscribe(() => this.refresh());`,
          `}`
        ]),
        good: code([
          `private readonly destroyRef = inject(DestroyRef);`,
          ``,
          `ngOnInit() {`,
          `  interval(1000)`,
          `    .pipe(takeUntilDestroyed(this.destroyRef))`,
          `    .subscribe(() => this.refresh());`,
          `}`
        ])
      },
      "stale-cache": {
        bad: code([
          `${ctx.plural}$ = this.http.get<${cap(ctx.noun)}[]>("${ctx.endpoint}").pipe(`,
          `  shareReplay(1)`,
          `);`
        ]),
        good: code([
          `private readonly reload$ = new BehaviorSubject<void>(undefined);`,
          `${ctx.plural}$ = this.reload$.pipe(`,
          `  switchMap(() => this.http.get<${cap(ctx.noun)}[]>("${ctx.endpoint}")),`,
          `  shareReplay({ bufferSize: 1, refCount: true })`,
          `);`,
          `invalidate() { this.reload$.next(); }`
        ])
      },
      "injection": {
        bad: code([`<div [innerHTML]="profile.${ctx.column}"></div>`]),
        good: code([`<div>{{ profile.${ctx.column} }}</div>`])
      },
      "partial-write": {
        bad: code([
          `save(${ctx.noun}: ${cap(ctx.noun)}) {`,
          `  this.http.post("${ctx.endpoint}", ${ctx.noun}).subscribe();`,
          `  this.http.post("/api/audit", { action: "${ctx.action}" }).subscribe();`,
          `}`
        ]),
        good: code([
          `save(${ctx.noun}: ${cap(ctx.noun)}) {`,
          `  return this.http.post("${ctx.endpoint}/commands/${ctx.action}", { ${ctx.noun} });`,
          `}`
        ])
      },
      "date-time": {
        bad: code([`const date = new Date(form.value.${ctx.column});`]),
        good: code([
          `const date = DateTime.fromISO(form.value.${ctx.column}, { zone: "utc" });`,
          `payload.${ctx.column} = date.toISO();`
        ])
      },
      "contract-drift": {
        bad: code([`this.http.get<any>("${ctx.endpoint}").subscribe(res => this.${ctx.id} = res.id);`]),
        good: code([
          `const ${ctx.noun}Schema = z.object({ ${ctx.id}: z.string(), ${ctx.column}: z.string().nullable() });`,
          `this.http.get<unknown>("${ctx.endpoint}").pipe(`,
          `  map(res => ${ctx.noun}Schema.parse(res))`,
          `);`
        ])
      },
      "path-case": {
        bad: code([`import { ${ctx.component} } from "./${ctx.component.toLowerCase()}";`]),
        good: code([`import { ${ctx.component} } from "./${ctx.component}";`])
      },
      "authorization": {
        bad: code([
          `<button *ngIf="currentUser.role === 'admin'" (click)="delete(${ctx.id})">Delete</button>`,
          `// API still accepts DELETE ${ctx.endpoint}/:id without checking the role.`
        ]),
        good: code([
          `@Delete(":id")`,
          `@Roles("admin")`,
          `delete(@Param("id") id: string, @CurrentUser() user: User) {`,
          `  return this.service.deleteForAuthorizedUser(id, user);`,
          `}`
        ])
      },
      "performance-loop": {
        bad: code([
          `<li *ngFor="let ${ctx.noun} of ${ctx.plural}">`,
          `  {{ expensiveLabel(${ctx.noun}) }}`,
          `</li>`
        ]),
        good: code([
          `<li *ngFor="let ${ctx.noun} of ${ctx.plural}; trackBy: trackById">`,
          `  {{ ${ctx.noun}.cachedLabel }}`,
          `</li>`
        ])
      }
    };
    return snippets[issue] || genericSnippet(issue, ctx, stacks[0]);
  }

  function reactSnippet(issue, ctx) {
    const snippets = {
      "async-race": {
        bad: code([
          `useEffect(() => {`,
          `  fetch(\`${ctx.endpoint}?q=\${query}\`)`,
          `    .then(r => r.json())`,
          `    .then(set${cap(ctx.plural)});`,
          `}, [query]);`
        ]),
        good: code([
          `useEffect(() => {`,
          `  const controller = new AbortController();`,
          `  fetch(\`${ctx.endpoint}?q=\${encodeURIComponent(query)}\`, { signal: controller.signal })`,
          `    .then(r => r.json())`,
          `    .then(set${cap(ctx.plural)})`,
          `    .catch(error => { if (error.name !== "AbortError") throw error; });`,
          `  return () => controller.abort();`,
          `}, [query]);`
        ])
      },
      "null-guard": {
        bad: code([`return <h2>{${ctx.noun}.profile.${ctx.column}.toUpperCase()}</h2>;`]),
        good: code([
          `if (isLoading) return <Spinner />;`,
          `if (!${ctx.noun}) return <EmptyState />;`,
          `return <h2>{${ctx.noun}.profile?.${ctx.column} ?? "Unknown"}</h2>;`
        ])
      },
      "mutation-side-effect": {
        bad: code([
          `${ctx.plural}.push(next${cap(ctx.noun)});`,
          `set${cap(ctx.plural)}(${ctx.plural});`
        ]),
        good: code([`set${cap(ctx.plural)}(current => [...current, next${cap(ctx.noun)}]);`])
      },
      "config-env": {
        bad: code([`const url = "https://staging.example.com${ctx.endpoint}";`]),
        good: code([
          `const url = import.meta.env.VITE_${ctx.env};`,
          `if (!url) throw new Error("Missing VITE_${ctx.env}");`
        ])
      },
      "swallowed-error": {
        bad: code([
          `try {`,
          `  await ${ctx.action}();`,
          `} catch (error) {`,
          `  set${cap(ctx.plural)}([]);`,
          `}`
        ]),
        good: code([
          `try {`,
          `  await ${ctx.action}();`,
          `} catch (error) {`,
          `  reportError(error, { feature: "${ctx.area}" });`,
          `  setError("Could not ${space(ctx.action)}.");`,
          `}`
        ])
      },
      "resource-leak": {
        bad: code([
          `useEffect(() => {`,
          `  window.addEventListener("resize", recalculate);`,
          `}, []);`
        ]),
        good: code([
          `useEffect(() => {`,
          `  window.addEventListener("resize", recalculate);`,
          `  return () => window.removeEventListener("resize", recalculate);`,
          `}, []);`
        ])
      },
      "stale-cache": {
        bad: code([`const { data } = useQuery(["${ctx.plural}"], () => fetch${cap(ctx.plural)}());`]),
        good: code([
          `const query = useQuery(["${ctx.plural}", filters], fetch${cap(ctx.plural)});`,
          `const mutation = useMutation(save${cap(ctx.noun)}, {`,
          `  onSuccess: () => queryClient.invalidateQueries(["${ctx.plural}"])`,
          `});`
        ])
      },
      "injection": {
        bad: code([`return <div dangerouslySetInnerHTML={{ __html: ${ctx.noun}.${ctx.column} }} />;`]),
        good: code([`return <div>{${ctx.noun}.${ctx.column}}</div>;`])
      },
      "partial-write": {
        bad: code([
          `await fetch("${ctx.endpoint}", { method: "POST", body: JSON.stringify(${ctx.noun}) });`,
          `await fetch("/api/audit", { method: "POST", body: JSON.stringify({ action: "${ctx.action}" }) });`
        ]),
        good: code([
          `await fetch("${ctx.endpoint}/commands/${ctx.action}", {`,
          `  method: "POST",`,
          `  headers: { "Idempotency-Key": requestId },`,
          `  body: JSON.stringify({ ${ctx.noun} })`,
          `});`
        ])
      },
      "date-time": {
        bad: code([`const date = new Date(inputValue).toLocaleDateString();`]),
        good: code([
          `const instant = Temporal.Instant.from(inputValue);`,
          `const date = instant.toZonedDateTimeISO(userTimeZone).toLocaleString();`
        ])
      },
      "contract-drift": {
        bad: code([`const data = await response.json(); set${cap(ctx.id)}(data.id);`]),
        good: code([
          `const payload = ${ctx.noun}Schema.parse(await response.json());`,
          `set${cap(ctx.id)}(payload.${ctx.id});`
        ])
      },
      "path-case": {
        bad: code([`import ${ctx.component} from "./${ctx.component.toLowerCase()}";`]),
        good: code([`import ${ctx.component} from "./${ctx.component}";`])
      },
      "authorization": {
        bad: code([`{isAdmin && <button onClick={() => delete${cap(ctx.noun)}(${ctx.id})}>Delete</button>}`]),
        good: code([
          `await api.delete(\`${ctx.endpoint}/\${${ctx.id}}\`, {`,
          `  headers: { Authorization: \`Bearer \${token}\` }`,
          `});`,
          `// Server verifies the token, role, and record ownership before deleting.`
        ])
      },
      "performance-loop": {
        bad: code([`return ${ctx.plural}.map(${ctx.noun} => <Row label={expensiveLabel(${ctx.noun})} />);`]),
        good: code([
          `const rows = useMemo(() => ${ctx.plural}.map(${ctx.noun} => ({`,
          `  ...${ctx.noun},`,
          `  label: expensiveLabel(${ctx.noun})`,
          `})), [${ctx.plural}]);`
        ])
      }
    };
    return snippets[issue] || genericSnippet(issue, ctx, stacks[1]);
  }

  function javaSnippet(issue, ctx) {
    const snippets = {
      "async-race": {
        bad: code([
          `CompletableFuture<${cap(ctx.noun)}> a = client.load(${ctx.id});`,
          `CompletableFuture<${cap(ctx.noun)}> b = client.load(${ctx.id});`,
          `a.thenAccept(cache::put);`,
          `b.thenAccept(cache::put);`
        ]),
        good: code([
          `long requestVersion = version.incrementAndGet();`,
          `client.load(${ctx.id}).thenAccept(result -> {`,
          `  if (requestVersion == version.get()) cache.put(result);`,
          `});`
        ])
      },
      "null-guard": {
        bad: code([`return repository.findById(${ctx.id}).get().get${cap(camel(ctx.column))}().trim();`]),
        good: code([
          `return repository.findById(${ctx.id})`,
          `  .map(${cap(ctx.noun)}::get${cap(camel(ctx.column))})`,
          `  .filter(value -> !value.isBlank())`,
          `  .orElseThrow(() -> new NotFoundException("${ctx.noun} not found"));`
        ])
      },
      "mutation-side-effect": {
        bad: code([
          `List<${cap(ctx.noun)}> cached = cache.get("${ctx.plural}");`,
          `cached.add(next${cap(ctx.noun)});`,
          `return cached;`
        ]),
        good: code([
          `List<${cap(ctx.noun)}> cached = cache.get("${ctx.plural}");`,
          `List<${cap(ctx.noun)}> copy = new ArrayList<>(cached);`,
          `copy.add(next${cap(ctx.noun)});`,
          `return List.copyOf(copy);`
        ])
      },
      "config-env": {
        bad: code([`String url = "https://staging.example.com${ctx.endpoint}";`]),
        good: code([
          `@ConfigurationProperties(prefix = "app.${dash(ctx.noun)}")`,
          `record ${cap(ctx.noun)}Properties(URI apiUrl) {`,
          `  ${cap(ctx.noun)}Properties { Objects.requireNonNull(apiUrl); }`,
          `}`
        ])
      },
      "swallowed-error": {
        bad: code([
          `try {`,
          `  return client.${ctx.action}();`,
          `} catch (Exception ex) {`,
          `  return Collections.emptyList();`,
          `}`
        ]),
        good: code([
          `try {`,
          `  return client.${ctx.action}();`,
          `} catch (RemoteServiceException ex) {`,
          `  log.warn("${ctx.action} failed", ex);`,
          `  throw new ${cap(ctx.noun)}UnavailableException(ex);`,
          `}`
        ])
      },
      "resource-leak": {
        bad: code([
          `Connection connection = dataSource.getConnection();`,
          `PreparedStatement stmt = connection.prepareStatement(sql);`,
          `return stmt.executeQuery();`
        ]),
        good: code([
          `try (Connection connection = dataSource.getConnection();`,
          `     PreparedStatement stmt = connection.prepareStatement(sql);`,
          `     ResultSet rs = stmt.executeQuery()) {`,
          `  return mapper.map(rs);`,
          `}`
        ])
      },
      "stale-cache": {
        bad: code([`@Cacheable("${ctx.plural}") public List<${cap(ctx.noun)}> findAll() { return repo.findAll(); }`]),
        good: code([
          `@Cacheable(value = "${ctx.plural}", key = "#filter.cacheKey()")`,
          `public List<${cap(ctx.noun)}> findAll(Filter filter) { return repo.findAll(filter); }`,
          ``,
          `@CacheEvict(value = "${ctx.plural}", allEntries = true)`,
          `public ${cap(ctx.noun)} save(${cap(ctx.noun)} input) { return repo.save(input); }`
        ])
      },
      "injection": {
        bad: code([`jdbc.query("select * from ${ctx.table} where ${ctx.column} = '" + value + "'", mapper);`]),
        good: code([`jdbc.query("select * from ${ctx.table} where ${ctx.column} = ?", mapper, value);`])
      },
      "partial-write": {
        bad: code([
          `repo.save(${ctx.noun});`,
          `auditRepo.save(new Audit("${ctx.action}"));`
        ]),
        good: code([
          `@Transactional`,
          `public ${cap(ctx.noun)} ${ctx.action}(${cap(ctx.noun)} ${ctx.noun}) {`,
          `  ${cap(ctx.noun)} saved = repo.save(${ctx.noun});`,
          `  auditRepo.save(new Audit("${ctx.action}", saved.getId()));`,
          `  return saved;`,
          `}`
        ])
      },
      "date-time": {
        bad: code([`LocalDateTime value = LocalDateTime.parse(request.${camel(ctx.column)}());`]),
        good: code([`Instant value = OffsetDateTime.parse(request.${camel(ctx.column)}()).toInstant();`])
      },
      "contract-drift": {
        bad: code([`${cap(ctx.noun)} dto = objectMapper.readValue(body, ${cap(ctx.noun)}.class);`]),
        good: code([
          `${cap(ctx.noun)}Request dto = objectMapper.readValue(body, ${cap(ctx.noun)}Request.class);`,
          `validator.validate(dto).throwIfInvalid();`
        ])
      },
      "path-case": {
        bad: code([`import com.acme.${ctx.component.toLowerCase()};`]),
        good: code([`import com.acme.${ctx.component};`])
      },
      "authorization": {
        bad: code([`return repository.findById(${ctx.id}).orElseThrow();`]),
        good: code([
          `@PreAuthorize("@authz.canRead(authentication, #${ctx.id})")`,
          `public ${cap(ctx.noun)} get(String ${ctx.id}) {`,
          `  return repository.findById(${ctx.id}).orElseThrow();`,
          `}`
        ])
      },
      "performance-loop": {
        bad: code([
          `for (${cap(ctx.noun)} ${ctx.noun} : ${ctx.plural}) {`,
          `  ${ctx.noun}.setOwner(userRepo.findById(${ctx.noun}.getOwnerId()).orElseThrow());`,
          `}`
        ]),
        good: code([
          `Map<String, User> owners = userRepo.findAllById(ownerIds).stream()`,
          `  .collect(Collectors.toMap(User::getId, Function.identity()));`,
          `${ctx.plural}.forEach(${ctx.noun} -> ${ctx.noun}.setOwner(owners.get(${ctx.noun}.getOwnerId())));`
        ])
      }
    };
    return snippets[issue] || genericSnippet(issue, ctx, stacks[2]);
  }

  function nodeSnippet(issue, ctx) {
    const snippets = {
      "async-race": {
        bad: code([
          `let current${cap(ctx.noun)};`,
          `app.get("${ctx.endpoint}/:id", async (req, res) => {`,
          `  current${cap(ctx.noun)} = await load${cap(ctx.noun)}(req.params.id);`,
          `  res.json(current${cap(ctx.noun)});`,
          `});`
        ]),
        good: code([
          `app.get("${ctx.endpoint}/:id", async (req, res, next) => {`,
          `  try {`,
          `    const ${ctx.noun} = await load${cap(ctx.noun)}(req.params.id);`,
          `    res.json(${ctx.noun});`,
          `  } catch (error) { next(error); }`,
          `});`
        ])
      },
      "null-guard": {
        bad: code([`res.json({ ${ctx.column}: ${ctx.noun}.${ctx.column}.trim() });`]),
        good: code([
          `if (!${ctx.noun}) return res.status(404).json({ error: "${ctx.noun} not found" });`,
          `res.json({ ${ctx.column}: ${ctx.noun}.${ctx.column}?.trim() ?? null });`
        ])
      },
      "mutation-side-effect": {
        bad: code([
          `const cached = cache.get("${ctx.plural}") || [];`,
          `cached.push(req.body);`,
          `cache.set("${ctx.plural}", cached);`
        ]),
        good: code([
          `const cached = cache.get("${ctx.plural}") || [];`,
          `cache.set("${ctx.plural}", [...cached, sanitize(req.body)]);`
        ])
      },
      "config-env": {
        bad: code([`const apiUrl = "https://staging.example.com${ctx.endpoint}";`]),
        good: code([
          `const apiUrl = mustGetEnv("${ctx.env}");`,
          `const client = createClient({ baseURL: apiUrl });`
        ])
      },
      "swallowed-error": {
        bad: code([
          `app.post("${ctx.endpoint}", async (req, res) => {`,
          `  try { await ${ctx.action}(req.body); } catch (e) {}`,
          `  res.status(200).json({ ok: true });`,
          `});`
        ]),
        good: code([
          `app.post("${ctx.endpoint}", async (req, res, next) => {`,
          `  try {`,
          `    res.status(201).json(await ${ctx.action}(req.body));`,
          `  } catch (error) { next(error); }`,
          `});`
        ])
      },
      "resource-leak": {
        bad: code([
          `app.get("${ctx.endpoint}", async (req, res) => {`,
          `  const client = await pool.connect();`,
          `  const result = await client.query("select * from ${ctx.table}");`,
          `  res.json(result.rows);`,
          `});`
        ]),
        good: code([
          `app.get("${ctx.endpoint}", async (req, res, next) => {`,
          `  const client = await pool.connect();`,
          `  try {`,
          `    const result = await client.query("select * from ${ctx.table}");`,
          `    res.json(result.rows);`,
          `  } catch (error) { next(error); }`,
          `  finally { client.release(); }`,
          `});`
        ])
      },
      "stale-cache": {
        bad: code([`const key = "${ctx.plural}"; cache.set(key, await load${cap(ctx.plural)}());`]),
        good: code([
          `const key = \`${ctx.plural}:\${tenantId}:\${hash(filters)}\`;`,
          `cache.set(key, await load${cap(ctx.plural)}(tenantId, filters), { ttl: 60 });`,
          `eventBus.on("${ctx.noun}:changed", () => cache.delPrefix("${ctx.plural}:"));`
        ])
      },
      "injection": {
        bad: code([`await db.query("select * from ${ctx.table} where ${ctx.column} = '" + req.query.${ctx.column} + "'");`]),
        good: code([`await db.query("select * from ${ctx.table} where ${ctx.column} = $1", [req.query.${ctx.column}]);`])
      },
      "partial-write": {
        bad: code([
          `await db.query("insert into ${ctx.table} (${ctx.column}) values ($1)", [value]);`,
          `await publish("${ctx.noun}.created", value);`
        ]),
        good: code([
          `await db.transaction(async tx => {`,
          `  const row = await tx.insert("${ctx.table}", payload);`,
          `  await tx.insert("outbox", { topic: "${ctx.noun}.created", payload: row });`,
          `});`
        ])
      },
      "date-time": {
        bad: code([`const runAt = new Date(req.body.${ctx.column});`]),
        good: code([
          `const runAt = DateTime.fromISO(req.body.${ctx.column}, { zone: "utc" });`,
          `if (!runAt.isValid) throw new BadRequest("Invalid ${ctx.column}");`
        ])
      },
      "contract-drift": {
        bad: code([`const ${ctx.id} = req.body.id; await save({ ${ctx.id} });`]),
        good: code([
          `const body = ${ctx.noun}Schema.parse(req.body);`,
          `await save({ ${ctx.id}: body.${ctx.id}, ${ctx.column}: body.${ctx.column} });`
        ])
      },
      "path-case": {
        bad: code([`const service = require("./${ctx.component.toLowerCase()}Service");`]),
        good: code([`const service = require("./${ctx.component}Service");`])
      },
      "authorization": {
        bad: code([`app.get("${ctx.endpoint}/:id", (req, res) => res.json(repo.find(req.params.id)));`]),
        good: code([
          `app.get("${ctx.endpoint}/:id", requireAuth, async (req, res) => {`,
          `  const record = await repo.findVisibleTo(req.params.id, req.user);`,
          `  if (!record) return res.sendStatus(404);`,
          `  res.json(record);`,
          `});`
        ])
      },
      "performance-loop": {
        bad: code([
          `const rows = [];`,
          `for (const ${ctx.noun} of ${ctx.plural}) {`,
          `  rows.push(await hydrate${cap(ctx.noun)}(${ctx.noun}));`,
          `}`
        ]),
        good: code([
          `const rows = await hydrate${cap(ctx.plural)}Batch(${ctx.plural}.map(item => item.id));`
        ])
      }
    };
    return snippets[issue] || genericSnippet(issue, ctx, stacks[3]);
  }

  function gitSnippet(issue, ctx) {
    const snippets = {
      "async-race": {
        bad: code([`git push origin ${ctx.branch}`, `git push origin ${ctx.branch} --force`]),
        good: code([`git fetch origin`, `git rebase origin/main`, `git push --force-with-lease origin ${ctx.branch}`])
      },
      "null-guard": {
        bad: code([`git add .`, `git commit -m "fix ${ctx.area}"`]),
        good: code([`git status --short`, `git add src/${dash(ctx.component)}.*`, `git commit -m "Fix ${ctx.area} null state"`])
      },
      "mutation-side-effect": {
        bad: code([`git rebase main`, `git push --force origin main`]),
        good: code([`git switch ${ctx.branch}`, `git rebase origin/main`, `git push --force-with-lease origin ${ctx.branch}`])
      },
      "config-env": {
        bad: code([`git add .env`, `git commit -m "add ${ctx.env}"`]),
        good: code([`git restore --staged .env`, `printf ".env\\n.env.*\\n" >> .gitignore`, `git add .gitignore .env.example`])
      },
      "swallowed-error": {
        bad: code([`git merge main || true`, `git push`]),
        good: code([`git merge main`, `git status`, `# Resolve conflicts, run tests, then commit the merge intentionally.`])
      },
      "resource-leak": {
        bad: code([`git worktree add ../${dash(ctx.area)} ${ctx.branch}`, `# Worktree is abandoned after the fix.`]),
        good: code([`git worktree list`, `git worktree remove ../${dash(ctx.area)}`, `git worktree prune`])
      },
      "stale-cache": {
        bad: code([`git pull`, `npm test`]),
        good: code([`git fetch --prune origin`, `git branch --merged`, `npm ci`, `npm test`])
      },
      "injection": {
        bad: code([`git commit -m "fix ${ctx.column}: $(cat secret.txt)"`]),
        good: code([`git commit -m "Fix ${ctx.area} validation"`, `git log --format=%s -n 3`])
      },
      "partial-write": {
        bad: code([`git add src`, `git commit -m "wip"`, `git push`, `# Generated files and source changes are split across later commits.`]),
        good: code([`git add src tests package-lock.json`, `git commit -m "Fix ${ctx.area} consistency"`, `git push origin ${ctx.branch}`])
      },
      "date-time": {
        bad: code([`git commit --date="yesterday" -m "fix ${ctx.area}"`]),
        good: code([`git commit -m "Fix ${ctx.area} timezone handling"`, `git log --show-signature -1`])
      },
      "contract-drift": {
        bad: code([`git push origin HEAD:main`, `# API and client changes bypass review.`]),
        good: code([`git switch -c ${ctx.branch}`, `git push -u origin ${ctx.branch}`, `# Open review with migration notes and contract tests.`])
      },
      "path-case": {
        bad: code([`git mv ${ctx.component}.tsx ${ctx.component.toLowerCase()}.tsx`]),
        good: code([`git mv ${ctx.component}.tsx tmp-name.tsx`, `git mv tmp-name.tsx ${ctx.component}.tsx`])
      },
      "authorization": {
        bad: code([`git add src/auth.js`, `git commit -m "hide admin button"`]),
        good: code([`git add src/auth.js src/routes/${dash(ctx.noun)}.js tests/auth.test.js`, `git commit -m "Enforce ${ctx.area} authorization server-side"`])
      },
      "performance-loop": {
        bad: code([`git bisect start`, `git bisect bad`, `git bisect good main`]),
        good: code([`git bisect start`, `git bisect bad HEAD`, `git bisect good v1.8.0`, `git bisect run npm test -- --runInBand`])
      }
    };
    return snippets[issue] || genericSnippet(issue, ctx, stacks[4]);
  }

  function sqlSnippet(issue, ctx) {
    const snippets = {
      "async-race": {
        bad: code([`select nextval('${ctx.table}_seq');`, `insert into ${ctx.table} (id, ${ctx.column}) values (currval('${ctx.table}_seq'), 'draft');`]),
        good: code([`insert into ${ctx.table} (${ctx.column}) values ('draft') returning id, ${ctx.column};`])
      },
      "null-guard": {
        bad: code([`select upper(${ctx.column}) from ${ctx.table};`]),
        good: code([`select upper(coalesce(${ctx.column}, 'unknown')) as ${ctx.column} from ${ctx.table};`])
      },
      "mutation-side-effect": {
        bad: code([`update ${ctx.table} set ${ctx.column} = 'archived';`]),
        good: code([`update ${ctx.table} set ${ctx.column} = 'archived' where id = $1 and tenant_id = $2;`])
      },
      "config-env": {
        bad: code([`\\connect production`, `delete from ${ctx.table};`]),
        good: code([`select current_database(), current_user;`, `begin;`, `delete from ${ctx.table} where id = $1;`, `commit;`])
      },
      "swallowed-error": {
        bad: code([`do $$ begin`, `  insert into ${ctx.table} (${ctx.column}) values ('x');`, `exception when others then null;`, `end $$;`]),
        good: code([`do $$ begin`, `  insert into ${ctx.table} (${ctx.column}) values ('x');`, `exception when unique_violation then raise notice 'duplicate ${ctx.noun}';`, `end $$;`])
      },
      "resource-leak": {
        bad: code([`begin;`, `select * from ${ctx.table} where ${ctx.column} = 'open';`, `-- session exits without commit or rollback`]),
        good: code([`begin;`, `select * from ${ctx.table} where ${ctx.column} = 'open';`, `commit;`])
      },
      "stale-cache": {
        bad: code([`create materialized view ${ctx.table}_summary as select ${ctx.column}, count(*) from ${ctx.table} group by ${ctx.column};`]),
        good: code([`refresh materialized view concurrently ${ctx.table}_summary;`])
      },
      "injection": {
        bad: code([`execute 'select * from ${ctx.table} where ${ctx.column} = ''' || input || '''';`]),
        good: code([`execute 'select * from ${ctx.table} where ${ctx.column} = $1' using input;`])
      },
      "partial-write": {
        bad: code([`insert into ${ctx.table} (${ctx.column}) values ('pending');`, `insert into audit_log(action) values ('${ctx.action}');`]),
        good: code([`begin;`, `insert into ${ctx.table} (${ctx.column}) values ('pending');`, `insert into audit_log(action) values ('${ctx.action}');`, `commit;`])
      },
      "date-time": {
        bad: code([`insert into ${ctx.table} (${ctx.column}) values ('07/08/2026 09:00');`]),
        good: code([`insert into ${ctx.table} (${ctx.column}) values (timestamptz '2026-07-08T09:00:00Z');`])
      },
      "contract-drift": {
        bad: code([`select id, ${ctx.column} from ${ctx.table};`]),
        good: code([`select id as "${ctx.id}", ${ctx.column} from ${ctx.table};`])
      },
      "path-case": {
        bad: code([`copy ${ctx.table} from './Data/${ctx.table}.csv' csv header;`]),
        good: code([`copy ${ctx.table} from '/app/data/${ctx.table}.csv' with (format csv, header true);`])
      },
      "authorization": {
        bad: code([`select * from ${ctx.table} where id = $1;`]),
        good: code([`select * from ${ctx.table} where id = $1 and tenant_id = current_setting('app.tenant_id')::uuid;`])
      },
      "performance-loop": {
        bad: code([`select * from ${ctx.table} where lower(${ctx.column}) = lower($1);`]),
        good: code([`create index ${ctx.table}_${ctx.column}_lower_idx on ${ctx.table} (lower(${ctx.column}));`, `select * from ${ctx.table} where lower(${ctx.column}) = lower($1);`])
      }
    };
    return snippets[issue] || genericSnippet(issue, ctx, stacks[5]);
  }

  function cssSnippet(issue, ctx) {
    const snippets = {
      "async-race": {
        bad: code([`.${dash(ctx.component)} { transition: height 200ms; height: auto; }`]),
        good: code([`.${dash(ctx.component)} { display: grid; grid-template-rows: 0fr; transition: grid-template-rows 200ms; }`, `.${dash(ctx.component)}[data-open="true"] { grid-template-rows: 1fr; }`])
      },
      "null-guard": {
        bad: code([`.${dash(ctx.component)}__title { width: 180px; }`]),
        good: code([`.${dash(ctx.component)}__title { max-width: 100%; overflow-wrap: anywhere; }`])
      },
      "mutation-side-effect": {
        bad: code([`button, a, input { all: unset; }`]),
        good: code([`.unstyled-button { appearance: none; border: 0; background: transparent; }`, `.unstyled-button:focus-visible { outline: 3px solid #0f766e; }`])
      },
      "config-env": {
        bad: code([`.api-status::after { content: "https://staging.example.com${ctx.endpoint}"; }`]),
        good: code([`.api-status::after { content: attr(data-environment); }`])
      },
      "swallowed-error": {
        bad: code([`.error { display: none; }`]),
        good: code([`.error[role="alert"] { display: block; color: #8b1f34; }`])
      },
      "resource-leak": {
        bad: code([`.modal { position: fixed; } body { overflow: hidden; }`]),
        good: code([`body:has(.modal[open]) { overflow: hidden; }`, `.modal::backdrop { background: rgba(23, 32, 38, .42); }`])
      },
      "stale-cache": {
        bad: code([`@import url("/assets/${dash(ctx.area)}.css");`]),
        good: code([`<link rel="stylesheet" href="/assets/${dash(ctx.area)}.css?v=20260728">`])
      },
      "injection": {
        bad: code([`<style>.profile::after { content: "${ctx.column}: " attr(data-raw); }</style>`]),
        good: code([`<span class="${dash(ctx.noun)}-${dash(ctx.column)}"></span>`])
      },
      "partial-write": {
        bad: code([`.card { display: grid; grid-template-columns: 1fr 1fr; } .card > * { margin: 12px; }`]),
        good: code([`.card { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }`])
      },
      "date-time": {
        bad: code([`.date::before { content: "Today"; }`]),
        good: code([`<time datetime="2026-07-28T09:00:00Z">Jul 28, 2026</time>`])
      },
      "contract-drift": {
        bad: code([`.status-success { color: green; } .state-success { background: #eaf7ee; }`]),
        good: code([`[data-status="success"] { color: #1d7a45; background: #eaf7ee; }`])
      },
      "path-case": {
        bad: code([`background-image: url("./Images/${ctx.component}.png");`]),
        good: code([`background-image: url("./images/${ctx.component}.png");`])
      },
      "authorization": {
        bad: code([`.admin-button { display: none; }`]),
        good: code([`<!-- Do not rely on CSS for authorization. Server removes unavailable actions from the response. -->`])
      },
      "performance-loop": {
        bad: code([`.row { box-shadow: 0 18px 60px rgba(0,0,0,.35); filter: blur(.1px); }`]),
        good: code([`.row { border: 1px solid #d9e1e7; box-shadow: 0 2px 8px rgba(0,0,0,.08); }`])
      }
    };
    return snippets[issue] || genericSnippet(issue, ctx, stacks[7]);
  }

  function dockerSnippet(issue, ctx) {
    const snippets = {
      "async-race": {
        bad: code([`CMD npm run migrate & npm start`]),
        good: code([`COPY docker-entrypoint.sh /usr/local/bin/`, `ENTRYPOINT ["docker-entrypoint.sh"]`, `CMD ["npm", "start"]`])
      },
      "null-guard": {
        bad: code([`RUN echo $${ctx.env}`, `CMD node server.js`]),
        good: code([`ENV NODE_ENV=production`, `CMD ["node", "server.js"]`])
      },
      "mutation-side-effect": {
        bad: code([`FROM node:latest`, `RUN npm install`, `COPY . .`]),
        good: code([`FROM node:22-bookworm-slim`, `COPY package*.json ./`, `RUN npm ci --omit=dev`, `COPY . .`])
      },
      "config-env": {
        bad: code([`ENV ${ctx.env}=https://staging.example.com${ctx.endpoint}`]),
        good: code([`ARG BUILD_SHA`, `ENV BUILD_SHA=$BUILD_SHA`, `# ${ctx.env} is supplied at runtime by the deployment environment.`])
      },
      "swallowed-error": {
        bad: code([`RUN npm test || true`]),
        good: code([`RUN npm test`])
      },
      "resource-leak": {
        bad: code([`FROM node:22`, `CMD node server.js`]),
        good: code([`FROM node:22-bookworm-slim`, `STOPSIGNAL SIGTERM`, `CMD ["node", "server.js"]`])
      },
      "stale-cache": {
        bad: code([`COPY . .`, `RUN npm ci`]),
        good: code([`COPY package*.json ./`, `RUN npm ci`, `COPY . .`])
      },
      "injection": {
        bad: code([`RUN sh -c "curl $DOWNLOAD_URL | sh"`]),
        good: code([`RUN curl -fsSLO "$DOWNLOAD_URL" && echo "$CHECKSUM  package.tgz" | sha256sum -c -`])
      },
      "partial-write": {
        bad: code([`RUN npm run build`, `RUN npm run migrate`]),
        good: code([`RUN npm run build`, `# Run migrations as a release job with rollback and observability, not during image build.`])
      },
      "date-time": {
        bad: code([`ENV TZ=America/New_York`]),
        good: code([`ENV TZ=UTC`])
      },
      "contract-drift": {
        bad: code([`COPY api-schema.json /app/schema.json`, `RUN npm run build`]),
        good: code([`COPY api-schema.json /app/schema.json`, `RUN npm run validate-contract && npm run build`])
      },
      "path-case": {
        bad: code([`COPY Src ./src`]),
        good: code([`COPY src ./src`])
      },
      "authorization": {
        bad: code([`USER root`, `CMD ["node", "server.js"]`]),
        good: code([`RUN useradd --system --create-home appuser`, `USER appuser`, `CMD ["node", "server.js"]`])
      },
      "performance-loop": {
        bad: code([`FROM node:22`, `RUN npm install`, `RUN npm run build`]),
        good: code([`FROM node:22-bookworm-slim AS deps`, `COPY package*.json ./`, `RUN npm ci`, `FROM deps AS build`, `COPY . .`, `RUN npm run build`])
      }
    };
    return snippets[issue] || genericSnippet(issue, ctx, stacks[10]);
  }

  function ciSnippet(issue, ctx) {
    const snippets = {
      "async-race": {
        bad: code([`jobs:`, `  deploy:`, `    steps:`, `      - run: npm run migrate & npm run deploy`]),
        good: code([`jobs:`, `  migrate: { runs-on: ubuntu-latest, steps: [{ run: npm run migrate }] }`, `  deploy:`, `    needs: migrate`, `    runs-on: ubuntu-latest`])
      },
      "null-guard": {
        bad: code([`- run: echo "$${ctx.env}"`, `- run: npm test`]),
        good: code([`- run: test -n "$${ctx.env}"`, `- run: npm test`])
      },
      "mutation-side-effect": {
        bad: code([`- uses: actions/cache@v4`, `  with:`, `    path: node_modules`, `    key: deps`]),
        good: code([`- uses: actions/cache@v4`, `  with:`, `    path: ~/.npm`, `    key: npm-\${{ hashFiles('package-lock.json') }}`])
      },
      "config-env": {
        bad: code([`env:`, `  ${ctx.env}: https://staging.example.com${ctx.endpoint}`]),
        good: code([`env:`, `  ${ctx.env}: \${{ secrets.${ctx.env} }}`])
      },
      "swallowed-error": {
        bad: code([`- run: npm test || true`]),
        good: code([`- run: npm test`])
      },
      "resource-leak": {
        bad: code([`- run: npm start &`, `- run: npm run e2e`]),
        good: code([`- run: npm start & echo $! > server.pid`, `- run: npm run e2e`, `- if: always()`, `  run: kill $(cat server.pid)`])
      },
      "stale-cache": {
        bad: code([`key: build-cache`]),
        good: code([`key: build-\${{ runner.os }}-\${{ hashFiles('package-lock.json', 'src/**') }}`])
      },
      "injection": {
        bad: code([`- run: deploy "$${ctx.column}"`]),
        good: code([`- run: ./scripts/deploy.sh`, `  env:`, `    ${ctx.column.toUpperCase()}: \${{ github.event.inputs.${ctx.column} }}`])
      },
      "partial-write": {
        bad: code([`- run: npm publish`, `- run: git push --tags`]),
        good: code([`- run: npm version --no-git-tag-version "$VERSION"`, `- run: npm publish --provenance`, `- run: git tag "v$VERSION" && git push origin "v$VERSION"`])
      },
      "date-time": {
        bad: code([`- run: date > build.txt`]),
        good: code([`- run: TZ=UTC date -Iseconds > build.txt`])
      },
      "contract-drift": {
        bad: code([`- run: npm run build`]),
        good: code([`- run: npm run contract:test`, `- run: npm run build`])
      },
      "path-case": {
        bad: code([`- run: npm run Build`]),
        good: code([`- run: npm run build`])
      },
      "authorization": {
        bad: code([`permissions: write-all`]),
        good: code([`permissions:`, `  contents: read`, `  id-token: write`])
      },
      "performance-loop": {
        bad: code([`strategy:`, `  matrix: { node: [18, 20, 22] }`, `steps:`, `  - run: npm ci`]),
        good: code([`- uses: actions/setup-node@v4`, `  with: { node-version: 22, cache: npm }`, `- run: npm ci`])
      }
    };
    return snippets[issue] || genericSnippet(issue, ctx, stacks[11]);
  }

  function shellSnippet(issue, ctx) {
    const snippets = {
      "async-race": {
        bad: code([`npm run migrate &`, `npm run ${dash(ctx.action)}`]),
        good: code([`npm run migrate`, `npm run ${dash(ctx.action)}`])
      },
      "null-guard": {
        bad: code([`curl "${"$"}${ctx.env}${ctx.endpoint}"`]),
        good: code([`: "${"$"}{${ctx.env}:?Missing ${ctx.env}}"`, `curl "${"$"}${ctx.env}${ctx.endpoint}"`])
      },
      "mutation-side-effect": {
        bad: code([`for f in *.json; do mv $f archive/$f; done`]),
        good: code([`for f in ./*.json; do mv -- "$f" "archive/$(basename "$f")"; done`])
      },
      "config-env": {
        bad: code([`export ${ctx.env}=https://staging.example.com${ctx.endpoint}`]),
        good: code([`: "${"$"}{${ctx.env}:?Set ${ctx.env} before running}"`])
      },
      "swallowed-error": {
        bad: code([`npm test || true`, `npm run deploy`]),
        good: code([`set -euo pipefail`, `npm test`, `npm run deploy`])
      },
      "resource-leak": {
        bad: code([`npm start &`, `npm run e2e`]),
        good: code([`npm start &`, `pid=$!`, `trap 'kill "$pid"' EXIT`, `npm run e2e`])
      },
      "stale-cache": {
        bad: code([`tar -czf build.tar.gz dist`]),
        good: code([`rm -rf dist`, `npm run build`, `tar -czf "build-$BUILD_SHA.tar.gz" dist`])
      },
      "injection": {
        bad: code([`sh -c "grep $${ctx.column} ${ctx.table}.txt"`]),
        good: code([`grep -- "$${ctx.column}" "${ctx.table}.txt"`])
      },
      "partial-write": {
        bad: code([`cp app.jar /srv/app.jar`, `systemctl restart app`]),
        good: code([`cp app.jar /srv/app.jar.tmp`, `mv /srv/app.jar.tmp /srv/app.jar`, `systemctl restart app`])
      },
      "date-time": {
        bad: code([`date +"%m/%d/%Y" > release-date.txt`]),
        good: code([`TZ=UTC date -Iseconds > release-date.txt`])
      },
      "contract-drift": {
        bad: code([`curl ${ctx.endpoint} | jq .id`]),
        good: code([`curl -fsS "$API_URL${ctx.endpoint}" | jq -e ".${ctx.id}"`])
      },
      "path-case": {
        bad: code([`cd Scripts`, `./Deploy.sh`]),
        good: code([`cd scripts`, `./deploy.sh`])
      },
      "authorization": {
        bad: code([`chmod 777 upload.sh`]),
        good: code([`chmod 750 upload.sh`, `chown app:deploy upload.sh`])
      },
      "performance-loop": {
        bad: code([`for id in $(cat ids.txt); do curl "$API${ctx.endpoint}/$id"; done`]),
        good: code([`jq -Rs 'split("\\n")[:-1]' ids.txt | curl -X POST "$API${ctx.endpoint}/batch" -d @-`])
      }
    };
    return snippets[issue] || genericSnippet(issue, ctx, stacks[17]);
  }

  function genericSnippet(issue, ctx, stack) {
    const language = stack.family === "cloud" || stack.family === "build" ? "config" : "code";
    const snippets = {
      "async-race": {
        bad: code([`let current${cap(ctx.noun)} = null;`, `${ctx.action}(${ctx.id}).then(value => current${cap(ctx.noun)} = value);`, `${ctx.action}(nextId).then(value => current${cap(ctx.noun)} = value);`]),
        good: code([`const requestId = createRequestId();`, `latestRequestId = requestId;`, `${ctx.action}(${ctx.id}).then(value => {`, `  if (latestRequestId === requestId) current${cap(ctx.noun)} = value;`, `});`])
      },
      "null-guard": {
        bad: code([`const label = ${ctx.noun}.${ctx.column}.trim().toUpperCase();`]),
        good: code([`const label = ${ctx.noun}?.${ctx.column}?.trim()?.toUpperCase() ?? "UNKNOWN";`])
      },
      "mutation-side-effect": {
        bad: code([`const list = cache.${ctx.plural};`, `list.push(next${cap(ctx.noun)});`]),
        good: code([`const list = [...cache.${ctx.plural}, next${cap(ctx.noun)}];`, `cache = { ...cache, ${ctx.plural}: list };`])
      },
      "config-env": {
        bad: code([`const ${camel(ctx.env)} = "https://staging.example.com${ctx.endpoint}";`]),
        good: code([`const ${camel(ctx.env)} = requiredEnv("${ctx.env}");`])
      },
      "swallowed-error": {
        bad: code([`try { await ${ctx.action}(); } catch (error) {}`, `return { ok: true };`]),
        good: code([`try { await ${ctx.action}(); } catch (error) {`, `  logger.error({ error }, "${ctx.action} failed");`, `  throw error;`, `}`])
      },
      "resource-leak": {
        bad: code([`const handle = open${cap(ctx.noun)}Stream();`, `handle.on("data", consume);`]),
        good: code([`const handle = open${cap(ctx.noun)}Stream();`, `try { await consume(handle); } finally { await handle.close(); }`])
      },
      "stale-cache": {
        bad: code([`cache.set("${ctx.plural}", await load${cap(ctx.plural)}());`]),
        good: code([`cache.set(\`${ctx.plural}:${ctx.id}:\${hash(filters)}\`, await load${cap(ctx.plural)}(filters), { ttl: 60 });`])
      },
      "injection": {
        bad: code([`const statement = "find ${ctx.table} where ${ctx.column} = " + input;`]),
        good: code([`const statement = buildSafeQuery("${ctx.table}", { ${ctx.column}: input });`])
      },
      "partial-write": {
        bad: code([`await save${cap(ctx.noun)}(payload);`, `await publishEvent("${ctx.noun}.updated", payload);`]),
        good: code([`await unitOfWork(async tx => {`, `  const saved = await tx.save${cap(ctx.noun)}(payload);`, `  await tx.enqueue("${ctx.noun}.updated", saved);`, `});`])
      },
      "date-time": {
        bad: code([`const value = new Date(input.${ctx.column});`]),
        good: code([`const value = parseIsoInstant(input.${ctx.column});`])
      },
      "contract-drift": {
        bad: code([`const ${ctx.id} = response.id;`]),
        good: code([`const payload = schema.parse(response);`, `const ${ctx.id} = payload.${ctx.id};`])
      },
      "path-case": {
        bad: code([`import helper from "./${ctx.component.toLowerCase()}";`]),
        good: code([`import helper from "./${ctx.component}";`])
      },
      "authorization": {
        bad: code([`if (uiState.isAdmin) show${cap(ctx.action)}();`]),
        good: code([`const allowed = await policy.can(user, "${ctx.action}", ${ctx.noun});`, `if (!allowed) throw new ForbiddenError();`])
      },
      "performance-loop": {
        bad: code([`for (const ${ctx.noun} of ${ctx.plural}) await enrich(${ctx.noun});`]),
        good: code([`const enriched = await enrichBatch(${ctx.plural});`])
      }
    };
    const result = snippets[issue] || snippets["null-guard"];
    return {
      bad: `${language === "config" ? "# defective config" : "// defective code"}\n${result.bad}`,
      good: `${language === "config" ? "# safer config" : "// safer code"}\n${result.good}`
    };
  }

  function buildScenarios() {
    const scenarios = [];
    stacks.forEach((stack) => {
      getPatternsForStack(stack).forEach((pattern) => {
        contexts.forEach((ctx, index) => {
          const id = `${stack.key}-${pattern.key}-${index + 1}`;
          const badCode = commonBad(stack, pattern, ctx);
          const goodCode = commonGood(stack, pattern, ctx);
          const tags = unique([...stack.tags, ...pattern.tags, dash(ctx.area)]);
          scenarios.push({
            id,
            stack: stack.label,
            stackKey: stack.key,
            family: stack.family,
            title: pattern.title(stack, ctx),
            summary: pattern.summary(stack, ctx),
            category: pattern.category,
            severity: varySeverity(pattern.severity, index),
            tags,
            symptoms: pattern.symptoms(stack, ctx),
            cause: pattern.cause(stack, ctx),
            badCode: {
              file: stack.file,
              language: stack.lang,
              code: badCode
            },
            fixes: buildFixes(pattern, stack, ctx, goodCode),
            prevention: [
              `Add a regression test that exercises ${ctx.area} with realistic ${ctx.plural}.`,
              `Log the boundary inputs for ${ctx.action} without exposing secrets or personal data.`,
              `Document the expected contract for ${ctx.column}, ownership, and failure behavior.`
            ],
            searchText: ""
          });
        });
      });
    });
    scenarios.forEach(refreshSearchText);
    return scenarios;
  }

  function refreshSearchText(scenario) {
    scenario.searchText = [
      scenario.title,
      scenario.summary,
      scenario.stack,
      scenario.category,
      scenario.severity,
      scenario.tags.join(" "),
      scenario.symptoms.join(" "),
      scenario.cause,
      scenario.badCode.code,
      scenario.fixes.map((fix) => `${fix.title} ${fix.steps.join(" ")} ${fix.code}`).join(" ")
    ].join(" ").toLowerCase();
    return scenario;
  }

  function buildFixes(pattern, stack, ctx, goodCode) {
    return [
      {
        title: pattern.solutionLabel,
        steps: [
          `Replace the defective ${stack.label} implementation with a boundary that explicitly handles ${pattern.category.toLowerCase()}.`,
          `Keep the fix close to ${ctx.area} first; only extract a shared helper after another feature needs the same rule.`,
          "Run the smallest relevant test or reproduction before broad refactoring."
        ],
        code: goodCode
      },
      {
        title: "Add a focused guardrail",
        steps: [
          `Write a test that fails with the broken ${ctx.action} example and passes with the fixed path.`,
          `Use a fixture containing missing, delayed, malformed, or unauthorized ${ctx.noun} data depending on this scenario.`,
          "Make the assertion verify behavior, not just implementation details."
        ],
        code: guardrailCode(pattern.key, stack, ctx)
      },
      {
        title: "Harden operations and review",
        steps: [
          `Add logs or metrics around ${ctx.action} so the next failure has a timestamp, request id, and stack label.`,
          `Review related ${ctx.plural} flows for the same pattern: ${pattern.tags.slice(0, 2).join(", ")}.`,
          "Document the decision in the code review or runbook so the fix survives handoff."
        ],
        code: opsCode(pattern.key, stack, ctx)
      }
    ];
  }

  function guardrailCode(issue, stack, ctx) {
    if (stack.family === "sql") {
      return code([
        `-- Regression check for ${ctx.area}`,
        `begin;`,
        `select count(*) from ${ctx.table} where ${ctx.column} is null;`,
        `rollback;`
      ]);
    }
    if (stack.family === "git") {
      return code([
        `git status --short`,
        `git diff --check`,
        `npm test -- --runInBand`
      ]);
    }
    if (stack.family === "docker" || stack.family === "ci" || stack.family === "cloud") {
      return code([
        `# Pipeline guardrail`,
        `npm ci`,
        `npm test`,
        `npm run build`
      ]);
    }
    if (stack.family === "shell") {
      return code([
        `set -euo pipefail`,
        `shellcheck scripts/*.sh`,
        `./scripts/smoke-test.sh`
      ]);
    }
    return code([
      `it("handles ${ctx.area} ${dash(issue)} safely", async () => {`,
      `  const result = await exercise${cap(ctx.action)}({ ${ctx.id}: "fixture-id" });`,
      `  expect(result).toMatchObject({ ok: true });`,
      `});`
    ]);
  }

  function opsCode(issue, stack, ctx) {
    if (stack.family === "git") {
      return code([
        `git log --oneline --decorate -5`,
        `git show --stat --check HEAD`
      ]);
    }
    if (stack.family === "sql") {
      return code([
        `explain analyze select * from ${ctx.table} where ${ctx.column} = $1;`,
        `select now() at time zone 'utc' as checked_at_utc;`
      ]);
    }
    if (stack.family === "docker" || stack.family === "ci" || stack.family === "cloud") {
      return code([
        `docker build --pull -t patch-atlas/${dash(ctx.area)} .`,
        `docker run --rm patch-atlas/${dash(ctx.area)} npm test`
      ]);
    }
    return code([
      `logger.info({`,
      `  requestId,`,
      `  feature: "${ctx.area}",`,
      `  action: "${ctx.action}",`,
      `  issue: "${issue}"`,
      `}, "debugging guardrail");`
    ]);
  }

  function varySeverity(base, index) {
    if (base === "critical") return "critical";
    if (base === "high" && index % 5 === 0) return "critical";
    if (base === "medium" && index % 4 === 0) return "high";
    return base;
  }

  function cap(value) {
    return String(value)
      .replace(/[_-]+/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase())
      .replace(/\s+/g, "");
  }

  function camel(value) {
    return String(value)
      .toLowerCase()
      .replace(/[_-]+([a-z0-9])/g, (_, char) => char.toUpperCase());
  }

  function dash(value) {
    return String(value)
      .trim()
      .replace(/([a-z])([A-Z])/g, "$1-$2")
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .toLowerCase();
  }

  function space(value) {
    return String(value)
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .toLowerCase();
  }

  function hash(value) {
    return String(value || "all")
      .split("")
      .reduce((sum, char) => (sum * 31 + char.charCodeAt(0)) % 100000, 7);
  }

  function unique(values) {
    return [...new Set(values.filter(Boolean))];
  }

  function readStorage(key, fallback) {
    try {
      if (typeof localStorage === "undefined") return fallback;
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch (error) {
      return fallback;
    }
  }

  function writeStorage(key, value) {
    try {
      if (typeof localStorage !== "undefined") {
        localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (error) {
      // Local edits are best-effort in static file mode.
    }
  }

  function loadScenarios() {
    const generated = buildScenarios();
    const edits = readStorage(storageKeys.descriptionEdits, {});
    generated.forEach((scenario) => {
      if (edits[scenario.id]) scenario.summary = edits[scenario.id];
      refreshSearchText(scenario);
    });
    return [...loadCustomScenarios(), ...generated];
  }

  function loadCustomScenarios() {
    return readStorage(storageKeys.custom, []).map(normalizeCustomScenario).filter(Boolean);
  }

  function normalizeCustomScenario(raw) {
    if (!raw || !raw.title) return null;
    const stack = stacks.find((item) => item.key === raw.stackKey) || stacks[0];
    const scenario = {
      id: raw.id || `custom-${Date.now()}`,
      custom: true,
      stack: stack.label,
      stackKey: stack.key,
      family: stack.family,
      title: raw.title,
      summary: raw.summary || "Custom defect description.",
      category: raw.category || "Custom defects",
      severity: raw.severity || "medium",
      tags: unique([...(raw.tags || []), ...stack.tags, "custom"]),
      symptoms: listOrDefault(raw.symptoms, ["The defect reproduces in the selected workflow."]),
      cause: raw.cause || "The root cause has not been documented yet.",
      badCode: {
        file: raw.badCode?.file || stack.file,
        language: raw.badCode?.language || stack.lang,
        code: raw.badCode?.code || "// Add the defective example here."
      },
      fixes: listOrDefault(raw.fixes, defaultCustomFixes(raw.goodCode || "// Add the fixed example here.")),
      prevention: listOrDefault(raw.prevention, [
        "Add a regression test before changing related code.",
        "Record the reproduction steps and affected environment.",
        "Update this entry after the permanent fix is verified."
      ])
    };
    return refreshSearchText(scenario);
  }

  function listOrDefault(value, fallback) {
    return Array.isArray(value) && value.length ? value : fallback;
  }

  const storageKeys = {
    saved: "patchAtlasSaved",
    custom: "patchAtlasCustomScenarios",
    descriptionEdits: "patchAtlasDescriptionEdits"
  };

  let scenarios = loadScenarios();
  let activeDescriptionId = null;

  const elements = {
    savedCount: document.getElementById("savedCount"),
    searchInput: document.getElementById("searchInput"),
    stackFilters: document.getElementById("stackFilters"),
    scenarioList: document.getElementById("scenarioList"),
    scenarioDetail: document.getElementById("scenarioDetail"),
    resultMeta: document.getElementById("resultMeta"),
    sortSelect: document.getElementById("sortSelect"),
    prevPage: document.getElementById("prevPage"),
    nextPage: document.getElementById("nextPage"),
    pageInfo: document.getElementById("pageInfo"),
    createButton: document.getElementById("createButton"),
    savedButton: document.getElementById("savedButton"),
    cardTemplate: document.getElementById("scenarioCardTemplate"),
    defectDialog: document.getElementById("defectDialog"),
    defectForm: document.getElementById("defectForm"),
    defectTitle: document.getElementById("defectTitle"),
    defectStack: document.getElementById("defectStack"),
    defectCategory: document.getElementById("defectCategory"),
    defectSeverity: document.getElementById("defectSeverity"),
    defectSummary: document.getElementById("defectSummary"),
    defectSymptoms: document.getElementById("defectSymptoms"),
    defectCause: document.getElementById("defectCause"),
    defectBadCode: document.getElementById("defectBadCode"),
    defectGoodCode: document.getElementById("defectGoodCode"),
    defectSolutions: document.getElementById("defectSolutions"),
    descriptionDialog: document.getElementById("descriptionDialog"),
    descriptionForm: document.getElementById("descriptionForm"),
    descriptionText: document.getElementById("descriptionText")
  };

  const state = {
    query: "",
    stack: "all",
    sort: "relevance",
    page: 1,
    selectedId: null,
    savedOnly: false,
    saved: new Set(readStorage(storageKeys.saved, []))
  };

  init();

  function init() {
    renderStackFilters();
    renderCreateStackOptions();
    renderEmptyDetail();
    bindEvents();
    render();
  }

  function bindEvents() {
    elements.searchInput.addEventListener("input", () => {
      state.query = elements.searchInput.value.trim().toLowerCase();
      state.page = 1;
      render();
    });

    elements.sortSelect.addEventListener("change", () => {
      state.sort = elements.sortSelect.value;
      state.page = 1;
      render();
    });

    elements.prevPage.addEventListener("click", () => {
      state.page = Math.max(1, state.page - 1);
      render();
    });

    elements.nextPage.addEventListener("click", () => {
      state.page += 1;
      render();
    });

    elements.createButton.addEventListener("click", openCreateDialog);

    elements.savedButton.addEventListener("click", () => {
      state.savedOnly = !state.savedOnly;
      elements.savedButton.classList.toggle("active", state.savedOnly);
      state.page = 1;
      render();
    });

    elements.scenarioDetail.addEventListener("click", (event) => {
      const copyButton = event.target.closest("[data-copy]");
      if (copyButton) {
        const codeElement = document.getElementById(copyButton.dataset.copy);
        if (codeElement) copyText(codeElement.innerText, copyButton);
      }
      const saveButton = event.target.closest("[data-save-id]");
      if (saveButton) {
        toggleSaved(saveButton.dataset.saveId);
      }
      if (event.target.closest("[data-focus-search]")) {
        elements.searchInput.focus();
      }
      const editButton = event.target.closest("[data-edit-description]");
      if (editButton) {
        openDescriptionEditor(editButton.dataset.editDescription);
      }
    });

    elements.defectForm.addEventListener("submit", (event) => {
      event.preventDefault();
      createCustomScenario();
    });

    elements.defectDialog.addEventListener("click", (event) => {
      if (event.target === elements.defectDialog || event.target.closest("[data-close-dialog]")) {
        closeDialog(elements.defectDialog);
      }
    });

    elements.descriptionForm.addEventListener("submit", (event) => {
      event.preventDefault();
      saveDescriptionEdit();
    });

    elements.descriptionDialog.addEventListener("click", (event) => {
      if (event.target === elements.descriptionDialog || event.target.closest("[data-close-description]")) {
        closeDialog(elements.descriptionDialog);
      }
    });
  }

  function renderStackFilters() {
    const allButton = document.createElement("button");
    allButton.type = "button";
    allButton.textContent = "All";
    allButton.className = "active";
    allButton.dataset.stack = "all";
    elements.stackFilters.appendChild(allButton);
    stacks.forEach((stack) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = stack.label;
      button.dataset.stack = stack.key;
      elements.stackFilters.appendChild(button);
    });
    elements.stackFilters.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-stack]");
      if (!button) return;
      state.stack = button.dataset.stack;
      state.page = 1;
      elements.stackFilters.querySelectorAll("button").forEach((item) => {
        item.classList.toggle("active", item === button);
      });
      render();
    });
  }

  function renderCreateStackOptions() {
    elements.defectStack.replaceChildren();
    stacks.forEach((stack) => {
      const option = document.createElement("option");
      option.value = stack.key;
      option.textContent = stack.label;
      elements.defectStack.appendChild(option);
    });
  }

  function openCreateDialog() {
    elements.defectForm.reset();
    elements.defectCategory.value = "Custom defects";
    elements.defectSeverity.value = "medium";
    elements.defectStack.value = state.stack === "all" ? "react" : state.stack;
    openDialog(elements.defectDialog);
    elements.defectTitle.focus();
  }

  function createCustomScenario() {
    const stack = stacks.find((item) => item.key === elements.defectStack.value) || stacks[0];
    const solutions = splitLines(elements.defectSolutions.value);
    const fixedCode = elements.defectGoodCode.value.trim() || "// Add the fixed example here.";
    const scenario = normalizeCustomScenario({
      id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title: elements.defectTitle.value.trim(),
      stackKey: stack.key,
      summary: elements.defectSummary.value.trim(),
      category: elements.defectCategory.value.trim() || "Custom defects",
      severity: elements.defectSeverity.value,
      tags: titleTags(elements.defectTitle.value),
      symptoms: splitLines(elements.defectSymptoms.value),
      cause: elements.defectCause.value.trim(),
      badCode: {
        file: stack.file,
        language: stack.lang,
        code: elements.defectBadCode.value.trim() || "// Add the defective example here."
      },
      goodCode: fixedCode,
      fixes: [
        {
          title: "Primary repair",
          steps: solutions.length ? solutions : ["Apply the smallest code change that removes the defect."],
          code: fixedCode
        },
        {
          title: "Regression guardrail",
          steps: ["Add a focused test that fails with the defective example and passes with the fix."],
          code: guardrailCode("custom", stack, contexts[0])
        },
        {
          title: "Review and hardening",
          steps: ["Check neighboring code for the same pattern and update this defect entry after verification."],
          code: opsCode("custom", stack, contexts[0])
        }
      ]
    });
    if (!scenario) return;
    scenarios = [scenario, ...scenarios];
    saveCustomScenarios();
    closeDialog(elements.defectDialog);
    state.selectedId = scenario.id;
    state.savedOnly = false;
    elements.savedButton.classList.remove("active");
    state.page = 1;
    render();
    renderDetail(scenario);
  }

  function defaultCustomFixes(fixedCode) {
    return [
      {
        title: "Primary repair",
        steps: ["Replace the defective behavior with the documented fix."],
        code: fixedCode
      },
      {
        title: "Regression guardrail",
        steps: ["Add a focused test that reproduces the defect."],
        code: "// Add a regression test here."
      },
      {
        title: "Review and hardening",
        steps: ["Check related code paths and document any follow-up work."],
        code: "// Add review notes or operational checks here."
      }
    ];
  }

  function saveCustomScenarios() {
    writeStorage(storageKeys.custom, scenarios.filter((scenario) => scenario.custom));
  }

  function openDescriptionEditor(id) {
    const scenario = scenarios.find((item) => item.id === id);
    if (!scenario) return;
    activeDescriptionId = id;
    elements.descriptionText.value = scenario.summary;
    openDialog(elements.descriptionDialog);
    elements.descriptionText.focus();
  }

  function saveDescriptionEdit() {
    const scenario = scenarios.find((item) => item.id === activeDescriptionId);
    if (!scenario) return;
    scenario.summary = elements.descriptionText.value.trim();
    refreshSearchText(scenario);
    if (scenario.custom) {
      saveCustomScenarios();
    } else {
      const edits = readStorage(storageKeys.descriptionEdits, {});
      edits[scenario.id] = scenario.summary;
      writeStorage(storageKeys.descriptionEdits, edits);
    }
    closeDialog(elements.descriptionDialog);
    render();
    renderDetail(scenario);
  }

  function openDialog(dialog) {
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
  }

  function closeDialog(dialog) {
    if (typeof dialog.close === "function") dialog.close();
    else dialog.removeAttribute("open");
  }

  function splitLines(value) {
    return String(value || "")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
  }

  function titleTags(value) {
    return unique(
      String(value)
        .toLowerCase()
        .split(/[^a-z0-9]+/)
        .filter((word) => word.length > 2)
        .slice(0, 8)
    );
  }

  function render() {
    const filtered = getFilteredScenarios();
    const sorted = sortScenarios(filtered);
    const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
    if (state.selectedId && !sorted.some((scenario) => scenario.id === state.selectedId)) {
      state.selectedId = null;
      renderEmptyDetail();
    }
    state.page = Math.min(state.page, pageCount);
    const start = (state.page - 1) * pageSize;
    const pageItems = sorted.slice(start, start + pageSize);
    elements.resultMeta.textContent = metaText(sorted.length);
    renderCards(pageItems);
    elements.prevPage.disabled = state.page <= 1;
    elements.nextPage.disabled = state.page >= pageCount;
    elements.pageInfo.textContent = `Page ${state.page} of ${pageCount}`;
    elements.savedCount.textContent = state.saved.size;
  }

  function getFilteredScenarios() {
    return scenarios.filter((scenario) => {
      if (state.savedOnly && !state.saved.has(scenario.id)) return false;
      if (state.stack !== "all" && scenario.stackKey !== state.stack) return false;
      if (state.query && !scenario.searchText.includes(state.query)) return false;
      return true;
    });
  }

  function sortScenarios(items) {
    const sorted = [...items];
    if (state.sort === "severity") {
      sorted.sort((a, b) => severityWeight[b.severity] - severityWeight[a.severity] || a.title.localeCompare(b.title));
    } else if (state.sort === "stack") {
      sorted.sort((a, b) => a.stack.localeCompare(b.stack) || a.title.localeCompare(b.title));
    } else if (state.sort === "title") {
      sorted.sort((a, b) => a.title.localeCompare(b.title));
    } else if (state.query) {
      sorted.sort((a, b) => score(b) - score(a));
    }
    return sorted;
  }

  function score(scenario) {
    const query = state.query;
    if (!query) return 0;
    let value = 0;
    if (scenario.title.toLowerCase().includes(query)) value += 8;
    if (scenario.tags.some((tag) => tag.includes(query))) value += 4;
    if (scenario.badCode.code.toLowerCase().includes(query)) value += 2;
    return value + severityWeight[scenario.severity];
  }

  function renderCards(items) {
    elements.scenarioList.replaceChildren();
    if (!items.length) {
      const empty = document.createElement("div");
      empty.className = "no-results";
      empty.textContent = state.savedOnly ? "No saved issues match the current filters." : "No issues match this search. Try fewer words or a broader stack filter.";
      elements.scenarioList.appendChild(empty);
      return;
    }

    items.forEach((scenario) => {
      const node = elements.cardTemplate.content.firstElementChild.cloneNode(true);
      node.classList.toggle("active", scenario.id === state.selectedId);
      node.querySelector(".stack-pill").textContent = scenario.stack;
      const severity = node.querySelector(".severity-pill");
      severity.textContent = scenario.severity;
      severity.classList.add(scenario.severity);
      node.querySelector("strong").innerHTML = highlight(scenario.title);
      node.querySelector(".card-summary").innerHTML = highlight(scenario.summary);
      const tagRow = node.querySelector(".tag-row");
      scenario.tags.slice(0, 5).forEach((tag) => {
        const item = document.createElement("span");
        item.className = "tag";
        item.textContent = tag;
        tagRow.appendChild(item);
      });
      node.querySelector("button").addEventListener("click", () => {
        state.selectedId = scenario.id;
        renderCards(items);
        renderDetail(scenario);
      });
      elements.scenarioList.appendChild(node);
    });
  }

  function renderEmptyDetail() {
    elements.scenarioDetail.className = "detail-empty";
    elements.scenarioDetail.innerHTML = `
      <div class="empty-visual" aria-hidden="true">
        <span></span>
        <span></span>
        <span></span>
        <span></span>
      </div>
      <h2>No issue selected</h2>
      <p>Select an issue when you want to inspect the details.</p>
    `;
  }

  function renderDetail(scenario) {
    const saved = state.saved.has(scenario.id);
    elements.scenarioDetail.className = "detail-content";
    elements.scenarioDetail.innerHTML = `
      <div class="detail-header">
        <div class="detail-meta">
          <span class="stack-pill">${escapeHtml(scenario.stack)}</span>
          <span class="severity-pill ${scenario.severity}">${escapeHtml(scenario.severity)}</span>
          <span>${escapeHtml(scenario.category)}</span>
        </div>
        <h2>${escapeHtml(scenario.title)}</h2>
        <p class="detail-summary">${escapeHtml(scenario.summary)}</p>
        <div class="detail-actions">
          <button class="save-button" type="button" data-save-id="${scenario.id}">${saved ? "Saved" : "Save"}</button>
          <button class="ghost-button" type="button" data-edit-description="${scenario.id}">Edit Description</button>
          <button class="ghost-button" type="button" data-focus-search>Search More</button>
        </div>
      </div>
      <section class="detail-section">
        <h3>Symptoms</h3>
        <ul class="symptoms">${scenario.symptoms.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
      </section>
      <section class="detail-section">
        <h3>Root Cause</h3>
        <p class="cause">${escapeHtml(scenario.cause)}</p>
      </section>
      <section class="detail-section">
        <h3>Defective Example</h3>
        ${renderCodeBlock(scenario.badCode.code, scenario.badCode.language, scenario.badCode.file, `${scenario.id}-bad`)}
      </section>
      <section class="detail-section">
        <h3>Solutions</h3>
        <div class="fix-list">
          ${scenario.fixes.map((fix, index) => renderFix(fix, scenario, index)).join("")}
        </div>
      </section>
      <section class="detail-section">
        <h3>Prevention Checklist</h3>
        <ul class="symptoms">${scenario.prevention.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
      </section>
    `;
    elements.savedCount.textContent = state.saved.size;
  }

  function renderFix(fix, scenario, index) {
    return `
      <article class="fix-card">
        <h4>${index + 1}. ${escapeHtml(fix.title)}</h4>
        <ol>${fix.steps.map((step) => `<li>${escapeHtml(step)}</li>`).join("")}</ol>
        ${renderCodeBlock(fix.code, scenario.badCode.language, index === 0 ? "fixed example" : "guardrail", `${scenario.id}-fix-${index}`)}
      </article>
    `;
  }

  function renderCodeBlock(source, language, label, id) {
    return `
      <div class="code-block">
        <div class="code-top">
          <span>${escapeHtml(label)} - ${escapeHtml(language)}</span>
          <button class="copy-button" type="button" data-copy="${id}">Copy</button>
        </div>
        <pre><code id="${id}">${escapeHtml(source)}</code></pre>
      </div>
    `;
  }

  function toggleSaved(id) {
    if (state.saved.has(id)) state.saved.delete(id);
    else state.saved.add(id);
    writeStorage(storageKeys.saved, [...state.saved]);
    elements.savedCount.textContent = state.saved.size;
    const scenario = scenarios.find((item) => item.id === id);
    if (scenario) renderDetail(scenario);
    render();
  }

  async function copyText(text, button) {
    try {
      await navigator.clipboard.writeText(text);
      const original = button.textContent;
      button.textContent = "Copied";
      setTimeout(() => {
        button.textContent = original;
      }, 1200);
    } catch (error) {
      button.textContent = "Select code";
    }
  }

  function metaText(count) {
    if (state.savedOnly) return `${count.toLocaleString()} saved scenario${count === 1 ? "" : "s"} in view.`;
    if (state.query) return `${count.toLocaleString()} scenario${count === 1 ? "" : "s"} match "${state.query}".`;
    return "Generated from common failure patterns across daily engineering work.";
  }

  function highlight(value) {
    const text = escapeHtml(value);
    if (!state.query) return text;
    const escaped = state.query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return text.replace(new RegExp(`(${escaped})`, "ig"), "<mark>$1</mark>");
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
})();
