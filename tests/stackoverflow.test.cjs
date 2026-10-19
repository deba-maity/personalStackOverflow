const { test } = require("node:test");
const assert = require("node:assert/strict");
const vm = require("node:vm");
const { readFileSync } = require("node:fs");
const context = { window: {} };
for (const file of ["data.js", "stackoverflow-data.js"])
  vm.runInNewContext(readFileSync(file, "utf8"), context);
const { guides, meta } = context.window.PatchAtlasStackOverflow;
const originals = context.window.PatchAtlasData.guides;
const report = JSON.parse(
  readFileSync("stackoverflow-import-report.json", "utf8"),
);
const reviewed = JSON.parse(
  readFileSync("scripts/stackoverflow-duplicates.json", "utf8"),
);
const normalize = (s) =>
  s
    .toLowerCase()
    .replace(/[^\p{L}\p{N}+#]+/gu, " ")
    .trim();

test("snapshot spans every requested year and all 20 stacks with real, attributed accepted answers", () => {
  assert.equal(guides.length, meta.imported);
  assert.ok(guides.length > 2000);
  assert.equal(new Set(guides.map((g) => g.year)).size, 6);
  assert.equal(new Set(guides.map((g) => g.stack)).size, 20);
  const end = Date.parse(meta.period.through + "T23:59:59Z") / 1000;
  for (const g of guides) {
    assert.equal(g.id, `so-${g.question.id}`);
    assert.ok(
      context.window.PatchAtlasData.stacks.some((s) => s.key === g.stack),
    );
    assert.equal(g.answer.accepted, true);
    assert.equal(g.license.name, "CC BY-SA 4.0");
    assert.equal(
      g.license.url,
      "https://creativecommons.org/licenses/by-sa/4.0/",
    );
    assert.ok(g.question.created >= Date.UTC(2021, 0, 1) / 1000);
    assert.ok(g.question.created <= end);
    assert.equal(new Date(g.question.created * 1000).getUTCFullYear(), g.year);
    for (const post of [g.question, g.answer]) {
      assert.equal(new URL(post.url).hostname, "stackoverflow.com");
      assert.ok(post.author.name);
      if (post.author.url)
        assert.equal(new URL(post.author.url).hostname, "stackoverflow.com");
      assert.ok(post.blocks.length > 0);
      for (const b of post.blocks) {
        assert.ok(["text", "code"].includes(b.type));
        assert.ok(b.text.trim());
      }
    }
  }
});

test("catalog has unique IDs, titles and bodies; reviewed duplicates stay excluded", () => {
  const all = [...originals, ...guides];
  assert.equal(new Set(all.map((g) => g.id)).size, all.length);
  assert.equal(new Set(all.map((g) => normalize(g.title))).size, all.length);
  for (const field of ["question", "answer"]) {
    const bodies = guides
      .map((g) => normalize(g[field].blocks.map((b) => b.text).join(" ")))
      .filter((s) => s.length > 80);
    assert.equal(new Set(bodies).size, bodies.length);
  }
  const ids = new Set(all.map((g) => g.id));
  for (const [id, entry] of Object.entries(reviewed)) {
    assert.ok(!ids.has(`so-${id}`), id);
    assert.ok(ids.has(entry.duplicateOf), entry.duplicateOf);
  }
  assert.equal(report.imported, guides.length);
  assert.equal(
    Object.values(report.byYear).reduce((a, b) => a + b, 0),
    guides.length,
  );
  assert.ok(report.skipReasons["reviewed-semantic-duplicate"] >= 10);
});
