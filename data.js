/* Authored guides, not a Cartesian product of interchangeable templates.
 * Examples are deliberately small; read their diagnosis and verification notes. */
(function () {
  "use strict";
  const stacks = [
    ["react", "React", "Re", "#5096a9", "#eaf4f5", "frontend", "jsx"],
    ["angular", "Angular", "A", "#bc6971", "#faecee", "frontend", "typescript"],
    ["java", "Java / Spring", "Jv", "#b88b55", "#f8f0e5", "backend", "java"],
    [
      "node",
      "Node.js / Express",
      "N",
      "#7c9d5e",
      "#eff4e7",
      "backend",
      "javascript",
    ],
    [
      "typescript",
      "TypeScript / JavaScript",
      "TS",
      "#638eae",
      "#eaf1f8",
      "frontend",
      "typescript",
    ],
    ["sql", "SQL / PostgreSQL", "Pg", "#728ab0", "#edf0f9", "data", "sql"],
    ["git", "Git", "Gt", "#c17d61", "#f8eee8", "devops", "bash"],
    ["docker", "Docker", "Dk", "#6a9fbc", "#edf5fa", "devops", "dockerfile"],
    ["css", "HTML / CSS", "#", "#a08bba", "#f3eef8", "frontend", "css"],
    [
      "api",
      "REST / HTTP APIs",
      "↔",
      "#6f9b87",
      "#edf4ef",
      "backend",
      "javascript",
    ],
    ["testing", "Testing", "✓", "#8c9d61", "#f1f4e7", "frontend", "javascript"],
    ["ci", "CI / CD", "CI", "#9186b5", "#f1eef8", "devops", "yaml"],
    [
      "security",
      "Security / Auth",
      "⌁",
      "#b58b53",
      "#f7f1e5",
      "security",
      "javascript",
    ],
    [
      "performance",
      "Performance",
      "↗",
      "#a69151",
      "#f7f4e5",
      "backend",
      "javascript",
    ],
    [
      "build",
      "Build Tools",
      "{}",
      "#96976b",
      "#f4f3e9",
      "devops",
      "javascript",
    ],
    [
      "cloud",
      "Cloud / Deployment",
      "☁",
      "#7b99ac",
      "#edf3f7",
      "devops",
      "yaml",
    ],
    [
      "orm",
      "ORM / Data Access",
      "Db",
      "#9d83a6",
      "#f3edf5",
      "data",
      "typescript",
    ],
    ["shell", "Linux / Shell", ">_", "#859581", "#eff2ec", "devops", "bash"],
  ].map(([key, label, mark, color, bg, category, language]) => ({
    key,
    label,
    mark,
    color,
    bg,
    category,
    language,
  }));
  const guides = [
    {
      id: "react-stale-closure",
      stack: "react",
      severity: "high",
      title: "Why your interval keeps reading yesterday’s state",
      summary:
        "The counter stops at one. The log never changes. A stale closure is holding on to the first render.",
      tags: ["hooks", "stale-closure", "useEffect"],
      symptoms: [
        "A setInterval callback always sees count as 0.",
        "The UI updates once, then appears frozen.",
      ],
      cause:
        "An effect with an empty dependency array installs one callback. That callback closes over the state from the render that created it; later renders do not change that captured value.",
      diagnose:
        "Log count both inside the callback and during rendering. If rendering advances while the callback reports the initial value, you have isolated the captured state. This example only needs the previous count, so a functional update is sufficient.",
      bad: "useEffect(() => {\n  const id = setInterval(() => setCount(count + 1), 1000);\n  return () => clearInterval(id);\n}, []);",
      good: "useEffect(() => {\n  const id = setInterval(() => {\n    setCount(current => current + 1);\n  }, 1000);\n  return () => clearInterval(id);\n}, []);",
      steps: [
        "Use the functional state updater when the next value depends only on the previous value.",
        "Keep cleanup paired with setup. If the callback also reads props, explicitly handle those dependencies rather than assuming the updater solves every stale closure.",
      ],
      verify: [
        "Advance the clock three seconds and assert the count is 3.",
        "Unmount the component and verify the interval stops.",
        "Change any other reactive inputs and check that the callback observes the intended values.",
      ],
      source: "https://react.dev/reference/react/useEffect",
    },
    {
      id: "api-cors-preflight",
      stack: "api",
      severity: "high",
      title: "It works in curl. So why is the browser blocking it?",
      summary:
        "Trace a failed CORS preflight without disabling browser security or hiding the response behind no-cors.",
      tags: ["cors", "preflight", "http"],
      symptoms: [
        "The console reports a CORS error while curl gets a successful response.",
        "An OPTIONS request fails before the actual POST is sent.",
      ],
      cause:
        "Browsers enforce cross-origin response access. A JSON POST or custom header can trigger a preflight, and the server must permit the requesting origin, method, and headers. Command-line clients do not enforce this browser policy.",
      diagnose:
        "Inspect OPTIONS in the Network panel. Check its status and Access-Control-Allow-* headers, then inspect the actual response too. Credentialed requests need an explicit allowed origin and Access-Control-Allow-Credentials; a wildcard origin cannot be used with credentials.",
      bad: "fetch('https://api.example.com/orders', {\n  method: 'POST',\n  mode: 'no-cors', // response becomes opaque\n  body: JSON.stringify(order)\n});",
      good: "// Express server; install the cors package.\napp.use(cors({\n  origin: 'https://app.example.com',\n  credentials: true,\n  methods: ['GET', 'POST', 'OPTIONS'],\n  allowedHeaders: ['Content-Type', 'Authorization']\n}));\n// Register routes AFTER the CORS middleware.",
      steps: [
        "Allow only the intended application origins and put CORS middleware before routes and authentication that would reject OPTIONS.",
        "Keep authorization on the actual request. CORS is a browser access policy, not an API authentication mechanism.",
      ],
      verify: [
        "Send the real browser request and confirm both preflight and actual response succeed.",
        "Try an unapproved origin and confirm it is not granted access.",
        "Check that error responses also include the intended CORS headers.",
      ],
      source: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS",
    },
    {
      id: "docker-layer-cache",
      stack: "docker",
      severity: "medium",
      title: "Your Docker build reinstalls the entire internet",
      summary:
        "A tiny source change invalidates dependency installation. Reorder your layers so rebuilds stay small.",
      tags: ["build-cache", "dockerfile", "dependencies"],
      symptoms: [
        "Changing a single source file reruns npm ci.",
        "Local rebuilds take nearly as long as the first build.",
      ],
      cause:
        "COPY . . changes whenever any included file changes. If dependency installation comes after that layer, Docker invalidates it along with every subsequent layer.",
      diagnose:
        "Compare the build log after a source-only edit. The dependency layer should say CACHED. Inspect .dockerignore too: local node_modules and build outputs should not enter the context.",
      bad: "FROM node:22-alpine\nWORKDIR /app\nCOPY . .\nRUN npm ci\nRUN npm run build",
      good: "FROM node:22-alpine\nWORKDIR /app\nCOPY package.json package-lock.json ./\nRUN npm ci\nCOPY . .\nRUN npm run build\n\n# .dockerignore\n# node_modules\n# .git\n# dist",
      steps: [
        "Copy dependency manifests first, install with the lockfile, then copy the application.",
        "Add a .dockerignore. Use a supported Node image appropriate to your application and pin its digest when reproducibility requires it.",
      ],
      verify: [
        "Rebuild after editing source; dependency installation stays cached.",
        "Edit the lockfile; dependency installation runs again.",
        "Confirm host node_modules is excluded from the context.",
      ],
      source: "https://docs.docker.com/build/cache/optimize/",
    },
    {
      id: "sql-lost-update",
      stack: "sql",
      severity: "critical",
      title: "Two successful requests. One missing inventory update.",
      summary:
        "Read-modify-write can silently lose changes under concurrency. Move the invariant into an atomic statement.",
      tags: ["concurrency", "transactions", "lost-update"],
      symptoms: [
        "Inventory is wrong only during overlapping purchases.",
        "Application logs show success for both requests.",
      ],
      cause:
        "Two transactions read the same quantity and each writes a value computed from that old snapshot. A transaction wrapper alone does not make an application-level read-modify-write safe at Read Committed.",
      diagnose:
        "Run two sessions against the same row and pause both after SELECT. If both calculate from the same original quantity, reproduce the interleaving before changing isolation levels.",
      bad: "SELECT quantity FROM inventory WHERE sku = $1;\n-- Both clients read 5, then each writes 4.\nUPDATE inventory SET quantity = $2 WHERE sku = $1;",
      good: "UPDATE inventory\nSET quantity = quantity - $2\nWHERE sku = $1 AND quantity >= $2\nRETURNING quantity;\n-- Validate that $2 is positive before running.\n-- No returned row means insufficient stock or unknown SKU.",
      steps: [
        "Use a conditional atomic update and check the affected row count. Validate the requested quantity.",
        "For a multi-row invariant, use consistent locking or serializable transactions with bounded retries of the entire transaction.",
      ],
      verify: [
        "Run two concurrent decrements and assert both are reflected.",
        "Attempt to buy more than available; assert no row changes.",
        "Verify a failed order rolls back its inventory change in the same transaction.",
      ],
      source: "https://www.postgresql.org/docs/current/transaction-iso.html",
    },
    {
      id: "git-reflog-rescue",
      stack: "git",
      severity: "high",
      title: "You reset the branch. Your commit might still be there.",
      summary:
        "Use the reflog to recover a local commit, and create a rescue branch before changing anything else.",
      tags: ["reflog", "recovery", "commits"],
      symptoms: [
        "A local commit disappeared after reset or a rebase.",
        "The working branch no longer points to the expected history.",
      ],
      cause:
        "Reset moves a branch reference; it does not immediately delete the old commit object. A local reflog often records where HEAD or the branch pointed before the operation.",
      diagnose:
        "Inspect git status first and preserve current uncommitted work separately. Read the reflog, identify the candidate commit, and inspect it with git show. Recovery depends on objects still being present; uncommitted files are a different case.",
      bad: "git reset --hard HEAD~1\n# Repeating resets while guessing can lose more work.",
      good: "git status\ngit reflog --date=iso\ngit show <candidate-sha>\ngit branch rescue/lost-work <candidate-sha>\n# Inspect the rescue branch before deciding how to integrate it.\ngit log --oneline rescue/lost-work -5",
      steps: [
        "Create a named rescue branch at the recovered commit. This preserves it without modifying your working tree.",
        "Once inspected, integrate it using the normal review process. Avoid garbage collection while you are recovering missing objects.",
      ],
      verify: [
        "Confirm the rescue branch includes the expected files and diff.",
        "Verify current uncommitted work is still present.",
        "Check the rescued commit against its parent before integrating it.",
      ],
      source: "https://git-scm.com/docs/git-reflog",
    },
    {
      id: "react-request-race",
      stack: "react",
      severity: "high",
      title: "Search results jump back to an older query",
      summary:
        "The slowest response wins unless you prevent stale requests from updating state.",
      tags: ["async", "race-condition", "fetch"],
      symptoms: [
        "Typing quickly shows results for a previous query.",
        "The issue is easier to reproduce on a throttled connection.",
      ],
      cause:
        "Requests complete in a different order from the user input that started them. An old response is still allowed to commit state after a newer query has rendered.",
      diagnose:
        "Throttle the first query so it finishes after the second. Compare the query attached to each response with the latest input. A cleanup flag prevents obsolete work from committing; aborting also avoids unnecessary transport work.",
      bad: "useEffect(() => {\n  fetch(`/api/search?q=${encodeURIComponent(query)}`)\n    .then(r => r.json()).then(setResults);\n}, [query]);",
      good: 'useEffect(() => {\n  let stale = false;\n  const controller = new AbortController();\n  async function search() {\n    try {\n      const r = await fetch(`/api/search?q=${encodeURIComponent(query)}`,\n        { signal: controller.signal });\n      if (!r.ok) throw new Error(`HTTP ${r.status}`);\n      const data = await r.json();\n      if (!stale) setResults(data);\n    } catch (error) {\n      if (!stale && error.name !== "AbortError") setError(error);\n    }\n  }\n  search();\n  return () => { stale = true; controller.abort(); };\n}, [query]);',
      steps: [
        "Tie each effect execution to its own cleanup and abort signal.",
        "Check HTTP status before parsing and keep real failures visible. Avoid treating every caught error as cancellation.",
      ],
      verify: [
        "Resolve two mocked requests in reverse order; only the newest results appear.",
        "Unmount while loading; no completion updates the removed component.",
        "Return HTTP 500 and confirm the error state is shown.",
      ],
      source: "https://react.dev/learn/synchronizing-with-effects",
    },
    {
      id: "react-list-keys",
      stack: "react",
      severity: "medium",
      title: "Editing one list item changes a completely different row",
      summary:
        "Index keys preserve component state by position instead of by the identity of your data.",
      tags: ["keys", "reconciliation", "forms"],
      symptoms: [
        "An input keeps another row’s text after sorting.",
        "Deleting the first row shifts checkbox states to other items.",
      ],
      cause:
        "React uses keys to match children between renders. An array index identifies a position. When rows move, React can reuse that position’s component state for a different record.",
      diagnose:
        "Enter different text into two rows, then reverse the list. Inspect the keys in the render code. If keys are indices or are generated during rendering, they do not provide stable record identity.",
      bad: "items.map((item, index) => (\n  <EditableRow key={index} item={item} />\n));",
      good: "items.map(item => (\n  <EditableRow key={item.id} item={item} />\n));\n// Assign IDs when records are created, not while rendering.",
      steps: [
        "Use a unique, stable ID from the data model for each sibling.",
        "If local records have no ID, assign one once when creating them. Do not use Math.random() as a render-time key.",
      ],
      verify: [
        "Edit rows, sort the list, and confirm edits follow the correct records.",
        "Insert and delete a row without losing neighboring local state.",
        "Check that there are no duplicate-key warnings.",
      ],
      source: "https://react.dev/learn/rendering-lists",
    },
    {
      id: "react-strict-cleanup",
      stack: "react",
      severity: "medium",
      title: "Strict Mode runs your effect twice. Listen to it.",
      summary:
        "A duplicate subscription in development reveals missing cleanup that can also hurt real remounts.",
      tags: ["strict-mode", "cleanup", "subscriptions"],
      symptoms: [
        "Messages are handled twice during development.",
        "Navigating away and back adds another event listener.",
      ],
      cause:
        "Development Strict Mode exercises an extra setup-cleanup-setup cycle. A subscription without cleanup survives the first setup, so remounting creates duplicates.",
      diagnose:
        "Count subscription registrations and disposals. After a setup-cleanup-setup sequence exactly one subscription should remain. This is different from making a non-idempotent purchase in an effect; user actions belong in event handlers.",
      bad: 'useEffect(() => {\n  socket.on("message", handleMessage);\n}, []);',
      good: 'useEffect(() => {\n  function onMessage(message) {\n    setMessages(previous => [...previous, message]);\n  }\n  socket.on("message", onMessage);\n  return () => socket.off("message", onMessage);\n}, [socket]);',
      steps: [
        "Make cleanup undo exactly the listener installed by that setup.",
        "Move user-triggered mutations into event handlers and make necessary server operations idempotent.",
      ],
      verify: [
        "Mount under Strict Mode and deliver one message; only one item appears.",
        "Unmount and confirm the listener count returns to baseline.",
        "Remount and repeat without accumulating subscriptions.",
      ],
      source: "https://react.dev/reference/react/StrictMode",
    },
    {
      id: "angular-switchmap",
      stack: "angular",
      severity: "high",
      title: "Angular typeahead shows stale results after fast typing",
      summary:
        "Nested subscriptions keep old HTTP requests alive. Let switchMap own the latest query.",
      tags: ["rxjs", "switchMap", "httpclient"],
      symptoms: [
        "An older HTTP response replaces newer suggestions.",
        "Each input change creates another independent subscription.",
      ],
      cause:
        "Subscribing inside another subscription does not cancel the previous inner request. The outer stream has no ownership over which result is still relevant.",
      diagnose:
        "Delay the first search response and trigger a second. For HttpClient request streams, switching unsubscribes the old request; errors must be handled inside switchMap if subsequent input should keep working.",
      bad: 'queryChanges.subscribe(q => {\n  http.get("/api/search", { params: { q } })\n    .subscribe(results => this.results = results);\n});',
      good: 'results$ = this.query.valueChanges.pipe(\n  debounceTime(250),\n  distinctUntilChanged(),\n  switchMap(q => this.http.get<Result[]>("/api/search", {\n    params: { q: q ?? "" }\n  }).pipe(catchError(() => of([]))))\n);\n// Template: @for (item of results$ | async; track item.id) { ... }',
      steps: [
        "Compose one stream with debounceTime, distinctUntilChanged, and switchMap. Import these operators and the AsyncPipe.",
        "Use the async pipe for lifecycle cleanup. Expose an explicit error state in a production UI instead of silently relying on an empty list.",
      ],
      verify: [
        "Complete the first request last; its data never renders.",
        "Fail one request and confirm the next input still searches.",
        "Destroy the view and confirm subscriptions are disposed.",
      ],
      source: "https://rxjs.dev/api/operators/switchMap",
    },
    {
      id: "angular-onpush",
      stack: "angular",
      severity: "medium",
      title: "The object changed. Your OnPush child did not.",
      summary:
        "An in-place mutation preserves the input reference and can leave an OnPush subtree stale.",
      tags: ["onpush", "change-detection", "immutability"],
      symptoms: [
        "A child updates after a click but not after a parent mutation.",
        "Logging shows changed data while the rendered label stays old.",
      ],
      cause:
        "Changing a property on the same input object does not create a new input reference. Depending on the triggering event and view boundaries, Angular can skip an OnPush child that has not been marked for checking.",
      diagnose:
        "Compare the input reference before and after the parent update. Replace it with a new object as an experiment. Do not use detectChanges everywhere to compensate for unclear state ownership.",
      bad: 'this.user.name = "Ada";\n// <profile-card [user]="user" />',
      good: 'this.user = { ...this.user, name: "Ada" };\n// With a signal:\nthis.userState.update(user => ({ ...user, name: "Ada" }));',
      steps: [
        "Replace changed input objects rather than mutating them in place.",
        "For manual async integration, use signals, the async pipe, or deliberate markForCheck where the notification actually belongs.",
      ],
      verify: [
        "Update from an async callback and confirm the child refreshes.",
        "Assert unrelated inputs retain their references.",
        "Exercise the view without an extra click masking the issue.",
      ],
      source: "https://angular.dev/best-practices/skipping-subtrees",
    },
    {
      id: "angular-disabled-form",
      stack: "angular",
      severity: "medium",
      title: "Your disabled form field vanished from the payload",
      summary:
        "Reactive forms omit disabled controls from value. Decide whether the submission needs their raw values.",
      tags: ["reactive-forms", "disabled", "payload"],
      symptoms: [
        "An account ID is visible but absent from the request body.",
        "Enabling the field makes it reappear in form.value.",
      ],
      cause:
        "Disabled controls are excluded from the aggregate value of an enabled FormGroup and from validation. Disabling a field is not the same as showing a read-only field.",
      diagnose:
        "Compare form.value and form.getRawValue(). Check which fields the API expects, and make sure the server derives or validates security-sensitive identifiers independently.",
      bad: "const payload = this.form.value;\n// Disabled accountId is missing.",
      good: "const raw = this.form.getRawValue();\nconst payload = {\n  accountId: raw.accountId,\n  displayName: raw.displayName\n};\n// Server still checks ownership of accountId.",
      steps: [
        "Use getRawValue when intentionally submitting disabled controls, then construct the expected payload explicitly.",
        "Use read-only presentation if the intent is merely to prevent editing while preserving validation.",
      ],
      verify: [
        "Submit with the control disabled and inspect the payload.",
        "Test validation behavior for required editable fields.",
        "Attempt to submit another account ID; the server rejects unauthorized ownership.",
      ],
      source: "https://angular.dev/api/forms/FormGroup",
    },
    {
      id: "java-transaction-self",
      stack: "java",
      severity: "critical",
      title: "@Transactional is there, but the rollback never happens",
      summary:
        "A method call inside the same Spring bean can bypass the transaction proxy entirely.",
      tags: ["transactions", "spring", "proxy"],
      symptoms: [
        "A failed operation leaves partially written records.",
        "The annotation works when another bean calls the method.",
      ],
      cause:
        "In Spring’s default proxy-based transaction mode, self-invocation does not pass through the proxy. Also, default rollback rules differ for checked and unchecked exceptions.",
      diagnose:
        "Enable transaction logging in a test environment and check whether a transaction is active inside the method. Force a runtime exception after the first write and inspect the database.",
      bad: "public void checkout(Order order) {\n  this.persist(order); // bypasses the proxy\n}\n@Transactional\npublic void persist(Order order) { /* writes */ }",
      good: "@Service\nclass CheckoutService {\n  private final OrderWriter writer;\n  CheckoutService(OrderWriter writer) { this.writer = writer; }\n  public void checkout(Order order) { writer.persist(order); }\n}\n@Service\nclass OrderWriter {\n  @Transactional\n  public void persist(Order order) { /* atomic database writes */ }\n}",
      steps: [
        "Move the transaction boundary to a public operation called through another managed bean, or use TransactionTemplate deliberately.",
        "Review exception handling and explicit rollback rules. A database transaction does not roll back a remote payment request.",
      ],
      verify: [
        "Trigger an exception after the first write; no partial records remain.",
        "Exercise the actual external bean call path in the integration test.",
        "Test any checked-exception behavior required by the business operation.",
      ],
      source:
        "https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/annotations.html",
    },
    {
      id: "java-lazy-session",
      stack: "java",
      severity: "high",
      title: "LazyInitializationException after the service returns",
      summary:
        "Serialization is walking a lazy relationship after its persistence context has closed.",
      tags: ["hibernate", "lazy-loading", "dto"],
      symptoms: [
        "The database query succeeds but JSON serialization fails.",
        "Accessing a relationship outside the service throws LazyInitializationException.",
      ],
      cause:
        "A lazy association needs an open persistence context to load data. Returning entities across the transaction boundary lets the web layer accidentally trigger database access later.",
      diagnose:
        "Identify the exact relationship accessed by the serializer. Inspect SQL while the service runs. Avoid solving a read-model problem by making every association eager.",
      bad: "public Order getOrder(long id) {\n  return repository.findById(id).orElseThrow();\n}\n// JSON serializer later walks order.lines.",
      good: "@Transactional(readOnly = true)\npublic OrderDto getOrder(long id) {\n  Order order = repository.findWithLinesById(id).orElseThrow();\n  return new OrderDto(order.getId(),\n    order.getLines().stream().map(LineDto::from).toList());\n}\n// Repository query fetches the lines needed for this read model.",
      steps: [
        "Fetch the relationships needed for the response using an explicit fetch plan or projection.",
        "Map to a DTO while the transaction is open and return the detached read model.",
      ],
      verify: [
        "Disable open-session-in-view in the integration test and serialize the DTO.",
        "Assert the query count stays bounded as the number of lines grows.",
        "Check that unrelated relationships are not loaded or serialized.",
      ],
      source:
        "https://docs.jboss.org/hibernate/orm/current/userguide/html_single/Hibernate_User_Guide.html",
    },
    {
      id: "java-hashset-mutation",
      stack: "java",
      severity: "medium",
      title: "HashSet contains an object, but contains() says false",
      summary:
        "Changing a field used by hashCode can strand an object in the wrong bucket.",
      tags: ["collections", "equals", "hashcode"],
      symptoms: [
        "Iteration finds the object but contains or remove fails.",
        "The behavior starts after modifying a field on the stored object.",
      ],
      cause:
        "Hash-based collections choose a bucket using the hash at insertion. If fields used by equals or hashCode change, later lookups can search a different bucket.",
      diagnose:
        "Record the hash before and after mutation. Inspect equality implementation, including generated Lombok methods. ORM entities with generated IDs need special care because persistence can change their identity fields.",
      bad: 'Set<User> users = new HashSet<>();\nusers.add(user);\nuser.setEmail("new@example.com");\n// equals/hashCode uses mutable email.',
      good: "record UserKey(UUID id) {}\nSet<UserKey> users = new HashSet<>();\nUserKey key = new UserKey(UUID.randomUUID());\nusers.add(key);\n// Keep mutable profile fields outside the immutable key.",
      steps: [
        "Choose stable identity fields for collection keys and make those keys immutable.",
        "If mutation is unavoidable, remove the object before mutation and reinsert afterward; prefer redesigning the key.",
      ],
      verify: [
        "Change the profile and confirm membership by stable ID still works.",
        "Assert equal keys have equal hash codes.",
        "Check duplicates and removal using separately constructed equivalent keys.",
      ],
      source:
        "https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/Set.html",
    },
    {
      id: "node-event-loop",
      stack: "node",
      severity: "critical",
      title: "One expensive request freezes every other request",
      summary:
        "Declaring a handler async does not move CPU work off Node’s event loop.",
      tags: ["event-loop", "cpu", "worker-threads"],
      symptoms: [
        "A health endpoint stalls while an unrelated request computes.",
        "CPU rises while overall request throughput collapses.",
      ],
      cause:
        "Synchronous CPU work monopolizes the JavaScript thread. async changes promise behavior; it does not automatically parallelize hashing, parsing, compression, or computation.",
      diagnose:
        "Measure event-loop delay and capture a CPU profile under a representative load. Distinguish CPU time from a slow downstream dependency before introducing workers.",
      bad: 'app.post("/derive-key", async (req, res) => {\n  const key = pbkdf2Sync(req.body.password, salt, 100000, 64, "sha512");\n  res.json({ key: key.toString("hex") });\n});',
      good: 'import { pbkdf2 } from "node:crypto";\nimport { promisify } from "node:util";\nconst derive = promisify(pbkdf2);\n// Within an async handler, with validated and size-limited input:\nconst key = await derive(password, salt, 100000, 64, "sha512");\n// Use a bounded worker pool for CPU work without an async API.',
      steps: [
        "Use the asynchronous platform API where available; use a bounded worker pool for custom CPU-heavy tasks.",
        "Limit input size and concurrency. Async crypto uses a shared thread pool that can also saturate. Choose security parameters independently of this scheduling example.",
      ],
      verify: [
        "Run the expensive workload alongside a health request and measure tail latency.",
        "Verify concurrency limits prevent unbounded queue growth.",
        "Profile again to confirm the blocking call disappeared.",
      ],
      source:
        "https://nodejs.org/en/learn/asynchronous-work/dont-block-the-event-loop",
    },
    {
      id: "node-express-errors",
      stack: "node",
      severity: "high",
      title: "An async Express 4 handler rejects and the request hangs",
      summary:
        "Express 4 needs rejected promises forwarded to error middleware. Express 5 handles returned rejections.",
      tags: ["express", "async", "error-handling"],
      symptoms: [
        "A rejected database call never reaches the error handler.",
        "The client waits until a timeout instead of receiving an error.",
      ],
      cause:
        "Express 4 does not automatically forward promise rejections from async route handlers. A thrown async error becomes a rejected promise instead of a synchronous throw into the router.",
      diagnose:
        "Confirm the installed Express major version from the lockfile. Reject the repository promise in a route test and check whether the centralized error middleware runs.",
      bad: '// Express 4\napp.get("/users", async (req, res) => {\n  res.json(await repository.list());\n});',
      good: '// Express 4: return the promise and forward rejection.\nconst wrap = fn => (req, res, next) =>\n  Promise.resolve().then(() => fn(req, res, next)).catch(next);\napp.get("/users", wrap(async (req, res) => {\n  res.json(await repository.list());\n}));\napp.use((err, req, res, next) => {\n  if (res.headersSent) return next(err);\n  res.status(500).json({ error: "Internal server error" });\n});',
      steps: [
        "In Express 4, use a consistent wrapper or try/catch with next(error). In Express 5, return or await the promise so the router can observe it.",
        "Register error middleware after routes and avoid sending internal stack traces to clients.",
      ],
      verify: [
        "Reject the repository call and assert one 500 response.",
        "Confirm errors after headers are sent delegate to the default handler.",
        "Verify the happy path still responds once.",
      ],
      source: "https://expressjs.com/en/guide/error-handling.html",
    },
    {
      id: "node-pool-leak",
      stack: "node",
      severity: "critical",
      title: "The database is idle, but every request waits for a connection",
      summary:
        "A client checked out from the pool was never returned after an exception.",
      tags: ["postgres", "connection-pool", "resource-leak"],
      symptoms: [
        "A few requests succeed after restart, then all database calls stall.",
        "The pool has no idle clients and its waiting count keeps growing.",
      ],
      cause:
        "Each pool.connect reserves a client. If any path skips release, the available pool shrinks until no request can acquire a connection.",
      diagnose:
        "Log total, idle, and waiting pool counts without credentials. Trace acquisition and release through thrown errors, early returns, and transaction rollback paths.",
      bad: "const client = await pool.connect();\nconst result = await client.query(sql, params);\nclient.release(); // skipped when query throws",
      good: "const client = await pool.connect();\ntry {\n  return await client.query(sql, params);\n} finally {\n  client.release();\n}\n// For a single query, pool.query(sql, params) owns release.",
      steps: [
        "Release checked-out clients in finally. Keep every statement of a transaction on the same client.",
        "Add acquisition timeouts and pool metrics; raising the pool limit only delays a leak.",
      ],
      verify: [
        "Force repeated query errors and check idle clients return to baseline.",
        "Exercise early-return paths without exhausting the pool.",
        "Load-test with a small pool to expose ownership errors quickly.",
      ],
      source: "https://node-postgres.com/features/pooling",
    },
    {
      id: "ts-runtime-boundary",
      stack: "typescript",
      severity: "high",
      title: "Your TypeScript type disappears at the API boundary",
      summary:
        "An assertion tells the compiler to trust a value. It does not validate the JSON you received.",
      tags: ["validation", "unknown", "runtime"],
      symptoms: [
        "A typed API response still crashes on an undefined property.",
        "An API change reaches production without a compile error.",
      ],
      cause:
        "TypeScript types are erased during compilation. Casting response.json() to a type bypasses checking without inspecting the runtime payload.",
      diagnose:
        "Capture an anonymized failing payload and compare each field against the assumed contract. Start external values as unknown and narrow them before using them.",
      bad: "const user = await response.json() as User;\nconsole.log(user.name.toUpperCase());",
      good: 'type User = { id: string; name: string };\nfunction isUser(value: unknown): value is User {\n  if (typeof value !== "object" || value === null) return false;\n  const u = value as Record<string, unknown>;\n  return typeof u.id === "string" && typeof u.name === "string";\n}\nconst value: unknown = await response.json();\nif (!isUser(value)) throw new Error("Invalid user payload");\nconsole.log(value.name.toUpperCase());',
      steps: [
        "Validate untrusted data at the boundary with a schema or a well-tested type guard.",
        "Report a contract error with safe context, rather than letting malformed data fail far downstream.",
      ],
      verify: [
        "Pass null, arrays, and missing fields to the validator.",
        "Verify valid payloads narrow correctly.",
        "Change a fixture’s field type and confirm the boundary rejects it.",
      ],
      source: "https://www.typescriptlang.org/docs/handbook/2/narrowing.html",
    },
    {
      id: "ts-exhaustive-union",
      stack: "typescript",
      severity: "medium",
      title: "A new status silently falls through your switch",
      summary:
        "Make unhandled union variants a compile error instead of an invisible default state.",
      tags: ["discriminated-union", "never", "exhaustiveness"],
      symptoms: [
        "A newly added status renders a blank panel.",
        "The type changed but the compiler never flagged the renderer.",
      ],
      cause:
        "A permissive default branch absorbs future union members. The compiler cannot know that returning an empty string violates your intended exhaustiveness.",
      diagnose:
        "Add a temporary member to the status union and run the type checker. If no renderer fails, the default branch is hiding missing behavior.",
      bad: 'function label(status: "loading" | "ready" | "error") {\n  switch (status) {\n    case "ready": return "Ready";\n    default: return "";\n  }\n}',
      good: 'function assertNever(value: never): never {\n  throw new Error(`Unhandled status: ${value}`);\n}\nfunction label(status: "loading" | "ready" | "error") {\n  switch (status) {\n    case "loading": return "Loading";\n    case "ready": return "Ready";\n    case "error": return "Failed";\n    default: return assertNever(status);\n  }\n}',
      steps: [
        "Model mutually exclusive states as a discriminated union.",
        "Pass the remaining value to a never assertion after handling every expected variant. Validate external statuses before they reach this typed function.",
      ],
      verify: [
        "Add a union member and confirm type checking fails at the assertion.",
        "Handle that member and confirm the compile succeeds.",
        "Test every known variant’s visible output.",
      ],
      source: "https://www.typescriptlang.org/docs/handbook/2/narrowing.html",
    },
    {
      id: "js-async-foreach",
      stack: "typescript",
      severity: "high",
      title: "await forEach finishes before any work is done",
      summary:
        "forEach ignores the promises returned by its callback. Choose sequential or bounded concurrent work explicitly.",
      tags: ["promises", "async", "iteration"],
      symptoms: [
        "The completion message appears before saves finish.",
        "Errors from async callbacks escape the surrounding try/catch.",
      ],
      cause:
        "forEach returns undefined. It calls the callback synchronously and does not await returned promises, so awaiting forEach cannot wait for its asynchronous work.",
      diagnose:
        "Make save reject in a controlled test. Observe whether the enclosing function rejects. Decide whether ordering and rate limits require sequential work rather than blindly switching to unbounded Promise.all.",
      bad: 'await items.forEach(async item => {\n  await save(item);\n});\nconsole.log("All saved");',
      good: "// Sequential: predictable order and one operation at a time.\nfor (const item of items) {\n  await save(item);\n}\n// For a small, independent set:\nawait Promise.all(items.map(item => save(item)));\n// Use a concurrency limiter for large or rate-limited sets.",
      steps: [
        "Use for...of with await for sequential work. Use Promise.all only when bounded input and independent operations justify concurrency.",
        "Handle partial success deliberately: Promise.all rejects early but does not cancel work already started.",
      ],
      verify: [
        "Assert the outer promise resolves only after all required work.",
        "Reject one save and assert the error reaches the caller.",
        "Measure the maximum in-flight count for large inputs.",
      ],
      source:
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach",
    },
    {
      id: "css-flex-overflow",
      stack: "css",
      severity: "medium",
      title: "One long filename breaks your entire flex layout",
      summary:
        "The missing min-width: 0 is often more important than another overflow rule.",
      tags: ["flexbox", "overflow", "min-width"],
      symptoms: [
        "A flex row grows wider than the viewport.",
        "Text-overflow: ellipsis has no effect on the intended label.",
      ],
      cause:
        "A flex item’s automatic minimum width can be based on its content. The item refuses to shrink below the long unbroken word even though flex-shrink is enabled.",
      diagnose:
        "Use DevTools to identify the flex child that exceeds the available width. Temporarily set min-width: 0 on that child, rather than clipping overflow on the entire page.",
      bad: ".row { display: flex; }\n.label {\n  flex: 1;\n  text-overflow: ellipsis;\n}",
      good: ".row { display: flex; gap: 12px; }\n.label {\n  flex: 1;\n  min-width: 0;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\n.actions { flex-shrink: 0; }",
      steps: [
        "Allow the actual flex child to shrink with min-width: 0. For a vertical flex layout, investigate min-height: 0.",
        "Apply overflow and text truncation only to the content that should truncate. For grid tracks, consider minmax(0, 1fr).",
      ],
      verify: [
        "Test a long URL, filename, and unbroken token at mobile width.",
        "Confirm actions remain reachable and text truncates.",
        "Zoom to 200% and check keyboard focus is visible.",
      ],
      source: "https://developer.mozilla.org/en-US/docs/Web/CSS/min-width",
    },
    {
      id: "css-sticky-scroll",
      stack: "css",
      severity: "medium",
      title: "position: sticky is ignoring the page scroll",
      summary:
        "Find the ancestor that changed the sticky element’s scroll container.",
      tags: ["sticky", "overflow", "scroll-container"],
      symptoms: [
        "A header scrolls away even with position: sticky.",
        "Removing overflow from a wrapper suddenly makes it work.",
      ],
      cause:
        "A sticky element relates to its nearest ancestor with a scrolling mechanism, not necessarily the viewport. It also needs an inset and enough room to move within its containing block.",
      diagnose:
        "Walk ancestors in DevTools and inspect computed overflow. overflow-x: hidden can affect the computed overflow-y value. Also check top, container height, and stretching in grid or flex.",
      bad: ".wrapper { overflow: hidden; }\n.heading { position: sticky; top: 0; }",
      good: "/* If the wrapper only needs horizontal clipping: */\n.wrapper { overflow-x: clip; }\n.heading {\n  position: sticky;\n  top: 0;\n  align-self: start;\n}\n/* Otherwise, make the intended scroll container explicit. */",
      steps: [
        "Remove accidental scroll containers or put the sticky element inside the actual scroll region.",
        "Keep an explicit inset and confirm the containing block is taller than the sticky content. Test overflow: clip against your supported browsers.",
      ],
      verify: [
        "Scroll the intended region and observe the sticky boundary.",
        "Check short and long content, including zoomed layouts.",
        "Verify the sticky header does not cover focused controls.",
      ],
      source: "https://developer.mozilla.org/en-US/docs/Web/CSS/position",
    },
    {
      id: "css-stacking-context",
      stack: "css",
      severity: "medium",
      title: "z-index: 999999 still puts your modal behind the header",
      summary:
        "A child cannot escape its parent’s stacking context. Inspect the context, not just the number.",
      tags: ["z-index", "stacking-context", "dialog"],
      symptoms: [
        "Increasing z-index never changes the overlap.",
        "Removing a parent transform makes the modal visible.",
      ],
      cause:
        "Properties such as transform, opacity, and isolation create stacking contexts. Descendant z-index values are compared inside that context, which can sit below a sibling context.",
      diagnose:
        "Inspect ancestors for transforms, opacity less than one, positioned z-index, and isolation. Identify which sibling contexts are actually being compared.",
      bad: ".app { transform: translateZ(0); z-index: 1; position: relative; }\n.modal { position: fixed; z-index: 999999; }\n.header { position: relative; z-index: 2; }",
      good: '<!-- A modal dialog opened with showModal enters the top layer. -->\n<dialog id="details" aria-labelledby="title">\n  <h2 id="title">Details</h2>\n  <button type="button" id="closeDetails">Close</button>\n</dialog>\n<script>\n  const dialog = document.getElementById("details");\n  dialog.showModal();\n  document.getElementById("closeDetails")\n    .addEventListener("click", () => dialog.close());\n</script>',
      steps: [
        "Remove unnecessary context-creating properties, or render an overlay outside the trapped subtree.",
        "For modal UI, consider a native dialog with showModal and a proper accessible name, close action, and focus behavior.",
      ],
      verify: [
        "Open over every header and sidebar, including transformed ancestors.",
        "Use keyboard navigation and Escape to test modal behavior.",
        "Close and confirm focus returns to the triggering control.",
      ],
      source:
        "https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_positioned_layout/Stacking_context",
    },
    {
      id: "api-retry-idempotency",
      stack: "api",
      severity: "critical",
      title: "The retry worked. Now the customer has two orders.",
      summary:
        "A network timeout is an unknown outcome. Safe retries need a server-enforced idempotency contract.",
      tags: ["idempotency", "retries", "payments"],
      symptoms: [
        "A timed-out request creates a record even though the client saw failure.",
        "Retrying the same action creates duplicate side effects.",
      ],
      cause:
        "The server may commit before the response is lost. Retrying a non-idempotent operation without a stable operation key asks the server to perform the operation again.",
      diagnose:
        "Correlate client attempt IDs with server transaction logs. Reproduce by dropping the response after commit. The server must atomically reserve a key, associate it with the payload, and retain the operation result.",
      bad: "// A timeout does not prove the order failed.\nawait postOrder(order).catch(() => postOrder(order));",
      good: '// Generate ONCE per logical operation and persist for retries.\nconst operationId = crypto.randomUUID();\nasync function submitAttempt() {\n  return fetch("/orders", {\n    method: "POST",\n    headers: { "Content-Type": "application/json",\n      "Idempotency-Key": operationId },\n    body: JSON.stringify(order)\n  });\n}\n// Server must implement atomic deduplication for this key.',
      steps: [
        "Define the server-side key lifetime, payload fingerprint, in-flight handling, and replayed result semantics.",
        "Reuse the same key for retries of one operation. Apply bounded exponential backoff with jitter only to retryable failures.",
      ],
      verify: [
        "Drop a response after commit and retry; exactly one order exists.",
        "Send the same key concurrently; only one operation commits.",
        "Reuse the key with a different payload; the server rejects the conflict.",
      ],
      source: "https://developer.mozilla.org/en-US/docs/Glossary/Idempotent",
    },
    {
      id: "api-private-cache",
      stack: "api",
      severity: "critical",
      title: "A cached account response belongs to someone else",
      summary:
        "User-specific responses must not be reused as public cache entries.",
      tags: ["cache-control", "privacy", "cdn"],
      symptoms: [
        "One user intermittently sees another user’s profile.",
        "The wrong response appears only behind the CDN or reverse proxy.",
      ],
      cause:
        "A shared cache can reuse an authenticated response if the effective caching policy and cache key allow it. Application headers alone may not protect you when a CDN rule overrides them.",
      diagnose:
        "Inspect Cache-Control, Age, and CDN cache-hit headers for a personalized endpoint. Compare requests from two separate authenticated sessions. Treat existing cached exposure as an incident and invalidate affected entries.",
      bad: '// Personalized response marked cacheable by everyone.\nres.set("Cache-Control", "public, max-age=3600");\nres.json(profile);',
      good: '// Sensitive personalized response:\nres.set("Cache-Control", "private, no-store");\nres.json(profile);\n// Also configure the CDN to bypass this authenticated route.',
      steps: [
        "Set an explicit policy appropriate to sensitive personalized data and audit proxy rules for overrides.",
        "Purge previously cached responses and inspect access logs through your incident process. A new header does not remove old cached copies.",
      ],
      verify: [
        "Fetch from two authenticated sessions and confirm each receives its own data.",
        "Confirm the CDN reports bypass rather than shared hits.",
        "Check that login, error, and redirect responses follow the intended policy.",
      ],
      source:
        "https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cache-Control",
    },
    {
      id: "sql-null-not-in",
      stack: "sql",
      severity: "high",
      title: "NOT IN returns no rows, and one NULL is the reason",
      summary:
        "SQL’s third truth value turns an apparently obvious exclusion query into an empty result.",
      tags: ["null", "not-in", "three-valued-logic"],
      symptoms: [
        "An exclusion query unexpectedly returns zero rows.",
        "Removing a NULL from the subquery restores results.",
      ],
      cause:
        "Comparisons with NULL yield unknown. When NOT IN must compare against a NULL and no equality decides the result, the predicate becomes unknown; WHERE keeps only true.",
      diagnose:
        "Inspect the subquery result and schema nullability. Reproduce with a tiny set containing one ID and one NULL. Decide explicitly whether a NULL outer ID should be included.",
      bad: "SELECT * FROM users\nWHERE id NOT IN (SELECT user_id FROM blocked_users);\n-- blocked_users.user_id may contain NULL.",
      good: "SELECT u.*\nFROM users AS u\nWHERE NOT EXISTS (\n  SELECT 1 FROM blocked_users AS b\n  WHERE b.user_id = u.id\n);\n-- users.id is a non-null primary key in this example.",
      steps: [
        "Use a correlated NOT EXISTS for anti-join semantics when that matches the intended logic.",
        "Fix unintended NULLs and add a NOT NULL constraint where the data model requires one.",
      ],
      verify: [
        "Test an empty exclusion set, a matching ID, and a set containing NULL.",
        "Confirm non-blocked users remain in the output.",
        "Document the intended behavior if an outer key is nullable.",
      ],
      source: "https://www.postgresql.org/docs/current/functions-subquery.html",
    },
    {
      id: "sql-index-function",
      stack: "sql",
      severity: "high",
      title: "You added an index, but the query still scans everything",
      summary:
        "Wrapping an indexed timestamp in a function can make the ordinary index unusable for the predicate.",
      tags: ["indexes", "explain", "query-planning"],
      symptoms: [
        "A date-filtered query scans millions of rows.",
        "An index on created_at exists but is absent from the plan.",
      ],
      cause:
        "A plain index orders the original column, not arbitrary expressions applied to it. The planner may need a matching expression index or a predicate expressed as a range over the indexed column.",
      diagnose:
        "Run EXPLAIN first. Use EXPLAIN ANALYZE only when executing the query is appropriate, since it actually runs the statement. Inspect row estimates, actual rows, and table size before concluding every sequential scan is bad.",
      bad: "SELECT * FROM events\nWHERE DATE(created_at) = DATE '2026-10-17';",
      good: "SELECT * FROM events\nWHERE created_at >= $1\n  AND created_at < $2;\n-- Bind explicit start/end instants for the desired local day.\n-- Use the correct timezone; daylight-saving days may not be 24h.",
      steps: [
        "Express the date interval as a half-open range with timezone-aware boundaries.",
        "Compare plans and latency with realistic data. Update statistics and consider selectivity before adding more indexes.",
      ],
      verify: [
        "Compare before and after execution plans on a representative dataset.",
        "Test timestamps exactly at both boundaries.",
        "Test a daylight-saving transition if the filter represents a local day.",
      ],
      source:
        "https://www.postgresql.org/docs/current/indexes-expressional.html",
    },
    {
      id: "git-diverged-branch",
      stack: "git",
      severity: "high",
      title: "Your branch diverged. Don’t force your way out.",
      summary:
        "Inspect both sides of the history before choosing a merge or a rebase.",
      tags: ["rebase", "merge", "divergence"],
      symptoms: [
        "Git reports that local and remote branches have diverged.",
        "A push is rejected as non-fast-forward.",
      ],
      cause:
        "Both branches contain commits the other does not. Replacing the remote history without inspecting it can discard someone else’s work.",
      diagnose:
        "Fetch, then view the symmetric difference. Confirm the upstream branch and whether your local commits have already been shared. Preserve uncommitted work before changing history.",
      bad: "git push --force\n# This can replace remote work you have not inspected.",
      good: "git status\ngit fetch origin\ngit log --graph --oneline --left-right HEAD...origin/main\n# For a shared branch, merge the inspected remote history:\ngit merge origin/main\n# For your own unpublished commits, rebase may be appropriate instead.",
      steps: [
        "Choose merge for shared history unless your team’s workflow requires otherwise. Rebase only commits whose rewriting is understood.",
        "Resolve conflicts, run the relevant checks, and inspect the resulting history before pushing. If a permitted rewrite is necessary, use an inspected expected ref with a lease.",
      ],
      verify: [
        "Confirm both intended sets of changes are present.",
        "Check git status is clean and tests pass.",
        "Review the diff against the target branch before pushing.",
      ],
      source: "https://git-scm.com/docs/git-merge",
    },
    {
      id: "git-tracked-ignore",
      stack: "git",
      severity: "medium",
      title: ".gitignore is not ignoring the file you already committed",
      summary:
        "Ignore rules affect untracked files. Remove tracked generated files from the index deliberately.",
      tags: ["gitignore", "index", "generated-files"],
      symptoms: [
        "A file keeps appearing in git status after you add an ignore rule.",
        "Generated output is still included in commits.",
      ],
      cause:
        "The index already tracks the file. .gitignore does not remove tracked paths or erase their earlier content from repository history.",
      diagnose:
        "Use git ls-files on the exact path, and git check-ignore --no-index -v to inspect matching rules. If the file contains a secret, removing it from the index does not revoke the secret.",
      bad: "# .gitignore\ndist/\n# Already tracked files under dist still remain tracked.",
      good: "git ls-files -- dist/\ngit check-ignore --no-index -v dist/app.js\n# After inspecting the exact generated directory:\ngit rm -r --cached -- dist/\ngit diff --cached --stat\n# Local files stay; the next commit removes them from tracking.",
      steps: [
        "Apply --cached to the specific generated paths you reviewed, then commit the ignore rule and index removal together.",
        "If sensitive values were committed, rotate them and follow a separate repository-history cleanup process.",
      ],
      verify: [
        "Confirm generated files still exist locally.",
        "Rebuild and check that generated output no longer enters git status.",
        "Review staged changes for unrelated deletions.",
      ],
      source: "https://git-scm.com/docs/gitignore",
    },
    {
      id: "docker-localhost",
      stack: "docker",
      severity: "high",
      title: "localhost works on your laptop, not inside the container",
      summary:
        "Inside a container, localhost means that container. Use service discovery between Compose services.",
      tags: ["networking", "compose", "localhost"],
      symptoms: [
        "The app reports ECONNREFUSED to localhost:5432.",
        "The database is reachable from the host but not the app container.",
      ],
      cause:
        "Each container has its own network namespace. A published host port and a Compose service’s internal port are different routes to the service.",
      diagnose:
        "Inspect the connection hostname from inside the app container, then check the database service name and internal listening port. Verify database readiness separately from DNS resolution.",
      bad: "DATABASE_URL=postgres://app:password@localhost:5432/app",
      good: '# Compose services share a default network.\nservices:\n  app:\n    environment:\n      DB_HOST: db\n      DB_PORT: "5432"\n  db:\n    image: postgres:17\n# Supply credentials through your environment or secrets mechanism.\n# Configure app connection retry and database health checks.',
      language: "yaml",
      steps: [
        "Use the Compose service name and internal port for container-to-container traffic.",
        "Bind servers to the intended interface and handle startup readiness. depends_on alone does not guarantee application readiness.",
      ],
      verify: [
        "Resolve db from inside the app container.",
        "Connect to the internal database port without relying on a host mapping.",
        "Restart the database and check the application reconnects.",
      ],
      source: "https://docs.docker.com/compose/how-tos/networking/",
    },
    {
      id: "docker-pid-one",
      stack: "docker",
      severity: "high",
      title: "Your container ignores shutdown until it gets killed",
      summary:
        "A shell wrapper can swallow signals. Let the application receive them and drain work within a deadline.",
      tags: ["signals", "pid-1", "shutdown"],
      symptoms: [
        "docker stop waits for the grace period, then kills the container.",
        "In-flight requests are cut off during deployments.",
      ],
      cause:
        "Shell-form commands can introduce a process that does not forward signals as expected. Even with correct delivery, the application needs explicit shutdown behavior for open sockets and other resources.",
      diagnose:
        "Inspect the process tree and test a TERM signal in a staging container. Confirm which process owns PID 1 and whether the application’s shutdown handler runs.",
      bad: "CMD node server.js\n# Shell form starts through a shell.",
      good: 'CMD ["node", "server.js"]\n\n# If you need an entrypoint script, end it with:\n# exec "$@"\n# The application must handle SIGTERM, stop accepting new\n# work, drain requests, close resources, and enforce a deadline.',
      steps: [
        "Use exec-form CMD or exec the application from the wrapper. Consider an init process if child reaping is needed.",
        "Implement bounded graceful shutdown in the application; make its deadline shorter than the platform termination grace period.",
      ],
      verify: [
        "Stop a staging container and confirm TERM reaches the app.",
        "Verify in-flight requests finish within the grace period.",
        "Leave a deliberately stuck connection and confirm the deadline still exits.",
      ],
      source: "https://docs.docker.com/reference/dockerfile/#cmd",
    },
    {
      id: "ci-token-permissions",
      stack: "ci",
      severity: "high",
      title: "The workflow can read the repo but cannot publish a package",
      summary:
        "Give the specific GitHub Actions job the token permissions it needs, and keep untrusted PRs out of publishing.",
      tags: ["github-actions", "permissions", "packages"],
      symptoms: [
        "A publish step fails with Resource not accessible by integration.",
        "The same command works using a local developer token.",
      ],
      cause:
        "GITHUB_TOKEN permissions depend on repository settings, workflow declarations, event type, and package access. Fork pull requests generally do not receive write tokens or repository secrets.",
      diagnose:
        "Inspect the workflow event and token permission summary in the job log. Check package-level access before substituting a broad personal access token.",
      bad: "permissions: read-all\n# A later job attempts to publish with GITHUB_TOKEN.",
      good: "permissions:\n  contents: read\njobs:\n  publish:\n    if: github.event_name == 'push' && github.ref == 'refs/heads/main'\n    permissions:\n      contents: read\n      packages: write\n    # Add the reviewed build and publish steps here.",
      steps: [
        "Grant packages: write only to the trusted publishing job and verify package access grants.",
        "Keep execution of untrusted PR code separate from privileged workflows. Do not switch to pull_request_target merely to obtain secrets.",
      ],
      verify: [
        "Run a trusted main-branch publication with the limited token.",
        "Confirm a fork PR cannot enter the publishing path.",
        "Review job logs to ensure no token values are printed.",
      ],
      source:
        "https://docs.github.com/en/actions/security-for-github-actions/security-guides/automatic-token-authentication",
    },
    {
      id: "ci-lockfile",
      stack: "ci",
      severity: "medium",
      title: "npm install passes locally. npm ci fails in CI.",
      summary:
        "A stale lockfile or inconsistent install flags can make the clean build disagree with your machine.",
      tags: ["lockfile", "npm-ci", "reproducibility"],
      symptoms: [
        "CI reports package.json and package-lock.json are out of sync.",
        "A dependency appears locally but is missing in a clean checkout.",
      ],
      cause:
        "npm ci installs from the lockfile and refuses to update it. Local node_modules can hide stale dependency declarations or flags that were used when the lockfile was created.",
      diagnose:
        "Compare Node and npm versions and inspect the first lockfile error. Check committed .npmrc flags and workspace manifests before deleting the lockfile.",
      bad: "# package.json changed, but the lockfile was not committed.\nnpm ci",
      language: "bash",
      good: "# Use the project’s agreed Node/npm versions.\nnpm install\ngit diff -- package.json package-lock.json\n# Review and commit the intended dependency changes.\n# Then verify in a clean checkout:\nnpm ci\nnpm test",
      steps: [
        "Regenerate the lockfile using the intended toolchain and installation settings, then review its diff.",
        "Commit configuration needed to reproduce those settings. Avoid replacing npm ci with a permissive install that hides drift.",
      ],
      verify: [
        "A clean checkout completes npm ci without manifest changes.",
        "Node and npm versions match the CI configuration.",
        "The actual build and tests pass with the clean dependency tree.",
      ],
      source: "https://docs.npmjs.com/cli/commands/npm-ci",
    },
    {
      id: "security-jwt-verify",
      stack: "security",
      severity: "critical",
      title: "Decoding a JWT does not make it trustworthy",
      summary:
        "A readable payload is not proof of authenticity. Verify signature and claims before authorizing anything.",
      tags: ["jwt", "authentication", "verification"],
      symptoms: [
        "Changing a token payload changes the server’s perceived role.",
        "Expired or wrong-audience tokens are accepted.",
      ],
      cause:
        "A decode operation parses base64url content without establishing trust. Authorization based on decoded claims lets an attacker supply identity or role values.",
      diagnose:
        "In a local security test, modify one payload byte and keep the original signature. The request must fail. Check algorithm restrictions, expected issuer, audience, and expiration handling.",
      bad: 'const claims = jwt.decode(token);\nif (claims.role === "admin") allowAdmin();',
      good: 'import { jwtVerify } from "jose";\nconst { payload } = await jwtVerify(token, trustedPublicKey, {\n  algorithms: ["RS256"],\n  issuer: "https://identity.example.com",\n  audience: "orders-api"\n});\n// Only now map validated claims to server-side permissions.',
      steps: [
        "Use a maintained verification library and a trusted key source. Allow only the intended algorithms and validate required claims.",
        "Treat authorization as a separate server-side decision. Do not fetch arbitrary key URLs supplied by an untrusted token.",
      ],
      verify: [
        "Reject a modified payload, wrong signature, and unsupported algorithm.",
        "Reject expired tokens and incorrect issuer or audience.",
        "Confirm authenticated users still cannot access resources they do not own.",
      ],
      source: "https://github.com/panva/jose",
    },
    {
      id: "security-sql-parameters",
      stack: "security",
      severity: "critical",
      title: "The search box can rewrite your SQL query",
      summary:
        "Keep user data out of query structure with parameters, and allow-list dynamic identifiers separately.",
      tags: ["sql-injection", "parameters", "input"],
      symptoms: [
        "Quotes in a search term cause SQL syntax errors.",
        "User-controlled text is concatenated into a database statement.",
      ],
      cause:
        "Concatenation lets input alter SQL syntax. Escaping by hand is fragile, and value placeholders do not parameterize identifiers such as column names or sort directions.",
      diagnose:
        "Trace data flow from request input into the final query. Review raw queries as well as ORM escape hatches. Use a safe local fixture to confirm strings containing quotes remain literal values.",
      bad: "const sql = `SELECT * FROM users WHERE email = '${email}'`;",
      good: 'const result = await pool.query(\n  "SELECT id, email FROM users WHERE email = $1", [email]\n);\n// Identifiers need a fixed mapping, not a value placeholder:\nconst sortColumns = { name: "name", created: "created_at" };\nconst column = sortColumns[sort] ?? "created_at";\n// Only this allow-listed identifier may enter query structure.',
      steps: [
        "Use driver parameters for every untrusted value.",
        "Map requested identifiers to known SQL fragments, limit database privileges, and review all raw-query entry points.",
      ],
      verify: [
        "A search containing quotes is treated as data.",
        "Unknown sort keys fall back or are rejected.",
        "The application database role cannot perform unrelated schema changes.",
      ],
      source:
        "https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html",
    },
    {
      id: "security-csrf-cookie",
      stack: "security",
      severity: "critical",
      title:
        "Your cookie-authenticated POST accepts requests from another site",
      summary:
        "The browser attaches cookies automatically. State-changing actions need a CSRF defense.",
      tags: ["csrf", "cookies", "origin"],
      symptoms: [
        "A cross-site form submission can trigger an authenticated action.",
        "The server checks the session but not the request’s intent or origin.",
      ],
      cause:
        "Session cookies prove the browser has a session, not that the user intended this request. CORS alone does not prevent simple cross-site forms from sending requests.",
      diagnose:
        "Review all state-changing routes, cookie attributes, and accepted content types. In a controlled test, attempt a cross-site form POST without an anti-CSRF token.",
      bad: 'app.post("/account/email", requireSession, async (req, res) => {\n  await changeEmail(req.user.id, req.body.email);\n  res.sendStatus(204);\n});',
      good: '// Use your framework’s maintained CSRF middleware.\napp.post("/account/email",\n  requireSession,\n  verifyCsrfToken, // bound to session; reject missing/invalid tokens\n  verifyTrustedOrigin,\n  changeEmailHandler\n);\n// Set session cookies Secure, HttpOnly, and an appropriate SameSite policy.',
      steps: [
        "Use a framework-supported synchronizer-token or signed double-submit design appropriate to your architecture.",
        "Validate origin where appropriate and set deliberate cookie attributes. Keep GET requests free of state-changing actions.",
      ],
      verify: [
        "A valid same-site request with the token succeeds.",
        "Missing, incorrect, and another session’s tokens fail.",
        "A cross-site simple form cannot change state.",
      ],
      source:
        "https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html",
    },
    {
      id: "performance-waterfall",
      stack: "performance",
      severity: "high",
      title: "Independent API calls are waiting in a single-file line",
      summary:
        "An accidental request waterfall adds latencies that could overlap.",
      tags: ["latency", "waterfall", "promises"],
      symptoms: [
        "The Network panel shows requests starting one after another.",
        "Page load time approximates the sum of several unrelated requests.",
      ],
      cause:
        "Awaiting independent operations sequentially delays each start until the previous operation completes. Parallelism helps only when there is no data dependency and the downstream service can handle it.",
      diagnose:
        "Draw the actual dependency graph, then compare request start times. Do not parallelize calls that require a previous result, share a transaction client, or would exceed rate limits.",
      bad: "const profile = await loadProfile();\nconst settings = await loadSettings();\nconst notices = await loadNotices();",
      good: "const [profile, settings, notices] = await Promise.all([\n  loadProfile(), loadSettings(), loadNotices()\n]);\n// For optional panels, consider independent error handling\n// or Promise.allSettled with explicit partial-success UI.",
      steps: [
        "Start independent, bounded operations together.",
        "Choose whether one failure should fail the whole screen. Add cancellation or request budgets where unnecessary work is costly.",
      ],
      verify: [
        "Request start times overlap under network throttling.",
        "One failed optional panel does not hide unrelated data if partial results are intended.",
        "Concurrency stays within downstream limits.",
      ],
      source:
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all",
    },
    {
      id: "performance-listener-leak",
      stack: "performance",
      severity: "high",
      title: "The page gets slower every time you navigate back",
      summary:
        "A global listener can keep detached UI and its data alive long after the view disappears.",
      tags: ["memory-leak", "listeners", "profiling"],
      symptoms: [
        "Heap usage grows across repeated navigation cycles.",
        "One resize triggers a handler many times.",
      ],
      cause:
        "A long-lived event target retains its listener, and the listener can retain the removed view through its closure. Removing the DOM node does not remove a listener attached to window.",
      diagnose:
        "Take heap snapshots before and after repeated mount/unmount cycles, allowing garbage collection in the profiler. Inspect retained detached nodes and the listener paths that keep them reachable.",
      bad: 'function mount(view) {\n  window.addEventListener("resize", () => view.relayout());\n}\n// No cleanup when the view is removed.',
      good: 'function mount(view) {\n  const controller = new AbortController();\n  window.addEventListener("resize", () => view.relayout(), {\n    signal: controller.signal\n  });\n  return () => controller.abort();\n}\n// Call the returned cleanup during unmount.',
      steps: [
        "Pair each lifecycle-owned listener with cleanup using an AbortSignal or the exact callback reference.",
        "Audit timers, observers, and subscriptions too. Avoid concluding a leak from one transient heap spike.",
      ],
      verify: [
        "Repeat navigation twenty times and compare retained object counts after collection.",
        "Dispatch resize once; the active view runs one handler.",
        "Unmount and confirm the detached view is no longer retained by window.",
      ],
      source:
        "https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener",
    },
    {
      id: "build-client-env",
      stack: "build",
      severity: "critical",
      title: "That “private” environment variable shipped to every browser",
      summary:
        "Build-time client environment variables become public bundle contents. Move secrets behind a server boundary.",
      tags: ["environment", "vite", "secrets"],
      symptoms: [
        "A service credential can be found in the compiled JavaScript.",
        "A VITE_* variable is assumed to be hidden because it came from .env.",
      ],
      cause:
        "Client build tools substitute exposed variables into browser assets. Prefix-based exposure is a convenience boundary, not encryption or access control.",
      diagnose:
        "Inspect the generated assets and the tool’s environment-variable exposure settings. If a real secret shipped, rotate it; removing it from the next build cannot make already downloaded copies disappear.",
      bad: "// Included in the browser bundle:\nconst secret = import.meta.env.VITE_PRIVATE_API_KEY;",
      good: '// Browser sends a request to your authenticated server.\nconst response = await fetch("/api/report", { credentials: "same-origin" });\n// Server validates authorization and calls the external service\n// using a runtime secret that is never returned to the browser.',
      steps: [
        "Move privileged service calls into a server endpoint with authentication, authorization, input limits, and a runtime secret.",
        "Rotate exposed credentials and audit their use. Keep intentionally public configuration separate from privileged values.",
      ],
      verify: [
        "Search built assets and source maps for the old credential.",
        "Verify unauthorized requests to the new endpoint fail.",
        "Confirm browser requests and responses contain no service secret.",
      ],
      source: "https://vite.dev/guide/env-and-mode",
    },
    {
      id: "build-esm-commonjs",
      stack: "build",
      severity: "medium",
      title: "require is not defined after the project switched to ESM",
      summary:
        "Node’s module mode is determined by file extension and package configuration, not by personal preference.",
      tags: ["esm", "commonjs", "node"],
      symptoms: [
        "A configuration file fails with require is not defined.",
        "A .js file behaves differently after adding type: module.",
      ],
      cause:
        "Within a package marked type: module, .js files are treated as ES modules. CommonJS globals such as require, module.exports, and __dirname are not automatically available there.",
      diagnose:
        "Check the closest package.json and the failing file’s extension. Distinguish a Node-executed config from code that a bundler transforms for the browser.",
      bad: '// package.json contains "type": "module"\nconst path = require("node:path");\nmodule.exports = { output: "dist" };',
      good: '// ES module configuration:\nimport path from "node:path";\nimport { fileURLToPath } from "node:url";\nconst directory = path.dirname(fileURLToPath(import.meta.url));\nexport default { output: path.join(directory, "dist") };\n// Or keep a tool-supported CommonJS configuration in a .cjs file.',
      steps: [
        "Use ESM syntax consistently for ESM files or explicitly retain a supported .cjs boundary.",
        "Verify the consuming tool expects the export format you choose. Avoid mixing module systems through ad hoc globals.",
      ],
      verify: [
        "Run the configuration through the actual tool, not only an editor checker.",
        "Check both development and production commands.",
        "Confirm relative paths resolve from the intended directory.",
      ],
      source: "https://nodejs.org/api/esm.html",
    },
    {
      id: "cloud-readiness",
      stack: "cloud",
      severity: "critical",
      title: "A failing dependency turns a health check into a restart storm",
      summary:
        "Separate “this process is stuck” from “this instance is ready to receive traffic.”",
      tags: ["kubernetes", "health-check", "readiness"],
      symptoms: [
        "A database outage restarts every otherwise healthy application pod.",
        "A slow startup repeatedly hits the liveness threshold.",
      ],
      cause:
        "A liveness probe tied to a dependency can restart a healthy process during an external outage. A startup probe can protect slow initialization, while readiness controls traffic eligibility.",
      diagnose:
        "Compare restart timestamps with probe failures and dependency incidents. Read the pod events and previous container logs before increasing all thresholds.",
      bad: "livenessProbe:\n  httpGet:\n    path: /health-including-database\n    port: 3000",
      good: "startupProbe:\n  httpGet: { path: /live, port: 3000 }\n  failureThreshold: 30\n  periodSeconds: 5\nlivenessProbe:\n  httpGet: { path: /live, port: 3000 }\nreadinessProbe:\n  httpGet: { path: /ready, port: 3000 }\n# Implement each endpoint with its intended semantics.",
      steps: [
        "Keep liveness focused on unrecoverable process health; use startup probes for expected initialization time.",
        "Make readiness reflect the ability to serve traffic. Decide dependency behavior carefully so one shared outage does not cause an unnecessary complete traffic blackout.",
      ],
      verify: [
        "Simulate slow startup; the application is not prematurely restarted.",
        "Simulate a dependency outage and inspect readiness and restart behavior.",
        "Restore the dependency and confirm recovery without manual intervention.",
      ],
      source:
        "https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/",
    },
    {
      id: "cloud-proxy-trust",
      stack: "cloud",
      severity: "high",
      title: "HTTPS redirects loop behind your reverse proxy",
      summary:
        "The app sees the proxy’s HTTP hop unless you configure the trusted forwarding boundary correctly.",
      tags: ["reverse-proxy", "https", "forwarded-headers"],
      symptoms: [
        "The browser receives repeated redirects to the same HTTPS URL.",
        "Secure session cookies disappear only behind the load balancer.",
      ],
      cause:
        "TLS terminates at the proxy, so the app’s direct socket can be HTTP. Blindly trusting arbitrary forwarding headers is unsafe, but ignoring trusted proxy headers breaks protocol detection.",
      diagnose:
        "Trace the browser-to-proxy and proxy-to-app hops. Inspect sanitized X-Forwarded-Proto values and confirm direct access to the app cannot bypass the trusted proxy boundary.",
      bad: 'if (!req.secure) res.redirect("https://" + req.headers.host + req.url);',
      language: "javascript",
      good: '// Example only: use the actual trusted proxy subnet.\napp.set("trust proxy", ["loopback", "10.20.0.0/16"]);\n// The edge must overwrite forwarding headers and restrict direct access.\napp.use((req, res, next) => {\n  if (req.secure) return next();\n  // Fixed canonical host; do not trust an arbitrary Host header.\n  res.redirect(308, "https://app.example.com" + req.originalUrl);\n});',
      steps: [
        "Configure trust proxy to match the real deployment topology and restrict app ingress. Do not copy the example subnet blindly.",
        "Ensure the proxy overwrites client-supplied forwarding headers and use a canonical redirect host.",
      ],
      verify: [
        "HTTPS requests complete without a redirect loop.",
        "Spoofed forwarding headers from an untrusted peer are ignored.",
        "Secure cookies work on the canonical HTTPS origin.",
      ],
      source: "https://expressjs.com/en/guide/behind-proxies.html",
    },
    {
      id: "orm-n-plus-one",
      stack: "orm",
      severity: "high",
      title: "One page. Fifty rows. Fifty-one database queries.",
      summary:
        "A relationship lookup inside a loop turns a modest list into an N+1 query storm.",
      tags: ["n-plus-one", "prisma", "query-count"],
      symptoms: [
        "A list endpoint slows linearly as its page size grows.",
        "Query logs repeat the same statement with different IDs.",
      ],
      cause:
        "Fetching a parent list and then loading each relationship separately creates one initial query plus one query per row. A fast individual query can still produce expensive total latency.",
      diagnose:
        "Count queries for page sizes 1, 10, and 50. Inspect which nested fields the response needs, including fields reached implicitly by serializers.",
      bad: "const posts = await prisma.post.findMany({ take: 50 });\nfor (const post of posts) {\n  post.author = await prisma.user.findUnique({\n    where: { id: post.authorId }\n  });\n}",
      good: 'const posts = await prisma.post.findMany({\n  take: 50,\n  orderBy: { id: "asc" },\n  select: {\n    id: true, title: true,\n    author: { select: { id: true, name: true } }\n  }\n});\n// Inspect generated SQL; relation loading strategy affects query shape.',
      steps: [
        "Use a relation-aware query, projection, or explicit batch lookup for the required relationships.",
        "Keep pagination and response size bounded. Loading every nested collection eagerly can replace N+1 with a different data explosion.",
      ],
      verify: [
        "Query count stays bounded when the page grows.",
        "The returned fields match the endpoint contract.",
        "Measure total rows transferred and response latency, not query count alone.",
      ],
      source:
        "https://www.prisma.io/docs/orm/prisma-client/queries/query-optimization-performance",
    },
    {
      id: "orm-expand-contract",
      stack: "orm",
      severity: "critical",
      title: "The migration passed. The old app version is now broken.",
      summary:
        "Rolling deploys briefly run two schema expectations at once. Use an expand-and-contract migration.",
      tags: ["migrations", "rolling-deploy", "compatibility"],
      symptoms: [
        "Requests fail only during a deployment window.",
        "Renaming a column breaks pods still running the previous release.",
      ],
      cause:
        "A migration can be valid SQL yet incompatible with code that is still serving traffic. Renaming or dropping a column removes the contract the old version needs.",
      diagnose:
        "List which app and worker versions can access the database during rollout and rollback. Check lock duration and data-backfill cost separately from schema compatibility.",
      bad: "ALTER TABLE users RENAME COLUMN name TO display_name;\n-- Old instances still SELECT name.",
      language: "sql",
      good: "-- Phase 1: expand, preserving the old contract.\nALTER TABLE users ADD COLUMN display_name text;\n-- Deploy code that reads a compatible fallback and dual-writes.\n-- Backfill in bounded batches; verify completeness.\n-- Deploy code using only display_name.\n-- Phase 2, after old clients and rollback windows expire:\n-- remove the old column in a separately reviewed migration.",
      steps: [
        "Introduce additive schema changes before deploying readers and writers that depend on them.",
        "Plan dual-write consistency, bounded backfill, verification, and a later cleanup. Test the rollback path before contracting.",
      ],
      verify: [
        "Run old and new application versions against the expanded schema.",
        "Verify the backfill and concurrent writes agree.",
        "Confirm no old worker, report, or rollback version still needs the removed field.",
      ],
      source: "https://www.prisma.io/docs/guides/data-migration",
    },
    {
      id: "shell-pipeline-failure",
      stack: "shell",
      severity: "high",
      title: "The backup failed, but the shell script exited successfully",
      summary:
        "A pipeline normally reports the final command’s status. Make failure propagation an explicit contract.",
      tags: ["bash", "pipefail", "exit-status"],
      symptoms: [
        "A failed export leaves an empty archive while monitoring reports success.",
        "The last pipeline command exits zero after an earlier command fails.",
      ],
      cause:
        "Without pipefail, a pipeline’s exit status is normally that of its final command. set -e also has contextual exceptions, so it is not a substitute for checking critical operations.",
      diagnose:
        "Run each pipeline stage against a controlled failure. Inspect PIPESTATUS immediately in Bash if diagnosing individual stages; subsequent commands overwrite it.",
      bad: 'pg_dump "$DATABASE_URL" | gzip > backup.sql.gz\necho "Backup complete"',
      good: '#!/usr/bin/env bash\nset -uo pipefail\nif ! pg_dump "$DATABASE_URL" | gzip > backup.sql.gz; then\n  printf "%s\\n" "Backup failed; do not treat the output as valid." >&2\n  exit 1\nfi\nprintf "%s\\n" "Export command succeeded; validate restore separately."',
      steps: [
        "Use Bash explicitly when relying on pipefail and check critical pipelines.",
        "Write to a temporary artifact in a real backup job and publish it only after validation. A successful dump is not proof of a restorable backup.",
      ],
      verify: [
        "Force the first command to fail and assert a nonzero script exit.",
        "Verify a failed output is not marked as a valid backup.",
        "Restore a successful backup into an isolated test database.",
      ],
      source:
        "https://www.gnu.org/software/bash/manual/html_node/Pipelines.html",
    },
    {
      id: "shell-filename-boundaries",
      stack: "shell",
      severity: "high",
      title: "The script works until a filename contains a space",
      summary:
        "Word splitting is not a file iterator. Preserve filename boundaries with arrays, globs, or null delimiters.",
      tags: ["bash", "quoting", "filenames"],
      symptoms: [
        "One filename is interpreted as several arguments.",
        "Files with spaces or newlines are skipped or mishandled.",
      ],
      cause:
        "Unquoted expansion and parsing ls output confuse formatted text with structured filenames. Quoting must preserve each path as one argument, including names beginning with a dash.",
      diagnose:
        "Test in a temporary fixture containing spaces, a newline, and a leading dash. Print arguments with printf rather than running a destructive command while debugging.",
      bad: "for file in $(ls ./reports); do\n  process $file\ndone",
      good: '#!/usr/bin/env bash\nshopt -s nullglob\nfiles=(./reports/*)\nfor file in "${files[@]}"; do\n  [[ -f "$file" ]] || continue\n  printf "Processing: %q\\n" "$file"\n  process "$file"\ndone\n# For recursive traversal, use find -print0 and a null-aware reader.',
      steps: [
        "Use quoted array expansion or direct glob iteration instead of parsing ls.",
        "Keep paths quoted, handle no-match behavior, and respect option boundaries for commands that support --.",
      ],
      verify: [
        "Test spaces, newlines, wildcard characters, and leading dashes.",
        "Confirm an empty directory causes no accidental iteration.",
        "Use a harmless argument-recording fixture before real processing.",
      ],
      source:
        "https://www.gnu.org/software/bash/manual/html_node/Word-Splitting.html",
    },
    {
      id: "testing-fake-timers",
      stack: "testing",
      severity: "medium",
      title: "Your timer test advances time but the assertion still races",
      summary:
        "A timeout can schedule promise work. Advancing only synchronous timers does not await that continuation.",
      tags: ["jest", "fake-timers", "async"],
      symptoms: [
        "A debounced async operation fails an immediate assertion.",
        "Adding a real sleep makes the test pass intermittently.",
      ],
      cause:
        "Timer callbacks and promise continuations use different scheduling mechanisms. A synchronous timer advance can fire the timer without waiting for the async work it starts.",
      diagnose:
        "Identify the actual completion signal: a resolved promise or visible UI state. Check whether your Jest version supports async timer advancement rather than adding arbitrary delays.",
      bad: "jest.useFakeTimers();\ntriggerDebouncedSave();\njest.advanceTimersByTime(300);\nexpect(saved).toBe(true);",
      good: "jest.useFakeTimers();\ntry {\n  triggerDebouncedSave();\n  await jest.advanceTimersByTimeAsync(300);\n  expect(saved).toBe(true);\n} finally {\n  jest.useRealTimers();\n}\n// In a UI test, also use the renderer’s act/wait helpers as required.",
      steps: [
        "Use async timer advancement when timer callbacks start promises, and assert the behavior’s actual completion.",
        "Restore real timers after the test. Avoid mixing fake timers with helpers that expect real timers without explicit integration.",
      ],
      verify: [
        "The test fails when the save operation is removed.",
        "Run the test repeatedly without real sleeps.",
        "Run the neighboring suite to detect leaked fake-timer state.",
      ],
      source: "https://jestjs.io/docs/jest-object#fake-timers",
    },
    {
      id: "testing-shared-state",
      stack: "testing",
      severity: "high",
      title: "Every test passes alone. The suite fails together.",
      summary:
        "Shared mutable fixtures, mocks, and storage make test order part of your hidden input.",
      tags: ["isolation", "fixtures", "flaky-tests"],
      symptoms: [
        "Running a failing test alone passes.",
        "Changing test order changes the failure.",
      ],
      cause:
        "One test mutates state another test assumes is pristine. Module singletons, mock implementations, browser storage, and reused fixture objects are common hidden dependencies.",
      diagnose:
        "Run the smallest pair of tests that reproduces the failure, then reverse their order. Compare setup and teardown ownership for globals, mocks, and external records.",
      bad: 'const user = { roles: [] };\ntest("admin", () => { user.roles.push("admin"); });\ntest("guest", () => { expect(user.roles).toEqual([]); });',
      good: "let user;\nbeforeEach(() => {\n  user = { roles: [] };\n});\nafterEach(() => {\n  jest.restoreAllMocks();\n});\n// Reset owned storage and external fixtures explicitly too.\n// restoreAllMocks does not reset every standalone mock implementation.",
      steps: [
        "Create fresh mutable fixtures per test and reset the state each test owns.",
        "Use distinct database records or isolated transactions where supported. Do not serialize a suite merely to hide shared-state dependencies.",
      ],
      verify: [
        "Run the original failing pair in both orders.",
        "Run in parallel where the test environment supports isolation.",
        "Verify each test still fails when its intended behavior is broken.",
      ],
      source: "https://jestjs.io/docs/setup-teardown",
    },
  ];
  stacks.push(
    {
      key: "python",
      label: "Python",
      mark: "Py",
      color: "#657f9d",
      bg: "#edf2f8",
      category: "backend",
      language: "python",
    },
    {
      key: "csharp",
      label: "C# / .NET",
      mark: "C#",
      color: "#8872a4",
      bg: "#f2eef8",
      category: "backend",
      language: "csharp",
    },
  );
  window.PatchAtlasData = { stacks, guides };
})();
