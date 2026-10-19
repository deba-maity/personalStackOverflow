const { test } = require("node:test");
const assert = require("node:assert/strict");
const vm = require("node:vm");
const { readFileSync } = require("node:fs");
const context = { window: {} };
vm.runInNewContext(readFileSync("data.js", "utf8"), context);
const { guides, stacks } = context.window.PatchAtlasData;
test("the catalog contains distinct, complete guides for every stack", () => {
  assert.equal(guides.length, 48);
  assert.equal(new Set(guides.map((g) => g.id)).size, guides.length);
  assert.equal(new Set(guides.map((g) => g.title)).size, guides.length);
  assert.equal(new Set(guides.map((g) => g.good)).size, guides.length);
  assert.equal(new Set(guides.map((g) => g.cause)).size, guides.length);
  for (const s of stacks)
    if (!["python", "csharp"].includes(s.key))
      assert.ok(guides.filter((g) => g.stack === s.key).length >= 2, s.label);
  for (const g of guides) {
    assert.ok(
      stacks.some((s) => s.key === g.stack),
      g.id,
    );
    for (const key of ["title", "summary", "cause", "diagnose", "bad", "good"])
      assert.ok(g[key]?.trim(), `${g.id}: ${key}`);
    for (const key of ["tags", "symptoms", "steps", "verify"])
      assert.ok(g[key]?.length >= 2, `${g.id}: ${key}`);
    assert.ok(["critical", "high", "medium"].includes(g.severity));
    assert.equal(new URL(g.source).protocol, "https:");
    assert.notEqual(g.bad, g.good);
  }
});
test("offline manifest includes all runtime assets and no external dependencies", () => {
  const html = readFileSync("index.html", "utf8");
  const sw = readFileSync("sw.js", "utf8");
  const sources = [...html.matchAll(/(?:src|href)="([^"#]+)"/g)]
    .map((m) => m[1])
    .filter((s) => s !== "./");
  for (const source of sources) {
    assert.ok(!/^https?:/.test(source), source);
    assert.ok(sw.includes(`./${source.replace(/^\.\//, "")}`), source);
    assert.ok(readFileSync(source).length, source);
  }
});
