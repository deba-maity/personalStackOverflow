const { test, expect } = require("@playwright/test");
const { readFileSync } = require("node:fs");
const vm = require("node:vm");
const AxeBuilder = require("@axe-core/playwright").default;
const source = readFileSync("stackoverflow-data.js", "utf8");
const context = { window: {} };
vm.runInNewContext(source, context);
const snapshot = context.window.PatchAtlasStackOverflow;

test("source filters cover Python and C# without year controls", async ({
  page,
}) => {
  await page.goto("/");
  await page.locator("#sourceSelect").selectOption("stackoverflow");
  await expect(page.locator("#resultCount")).toHaveText(
    String(snapshot.guides.length),
  );
  await expect(page.locator("#yearSelect")).toHaveCount(0);
  await expect(page.locator("#archiveSummary")).toHaveCount(0);
  for (const stack of ["python", "csharp"]) {
    await page.locator("#searchInput").fill(`stack:${stack}`);
    await expect(page.locator("#resultCount")).toHaveText(
      String(snapshot.meta.byStack[stack]),
    );
  }
  await page.locator("#clearFilters").click();
  await expect(page.locator("#sourceSelect")).toHaveValue("all");
  await expect(page.locator("#resultCount")).toHaveText(
    String(48 + snapshot.guides.length),
  );
});

test("question, accepted answer, attribution, code and Markdown survive offline", async ({
  page,
  context,
}) => {
  const g = snapshot.guides.find(
    (g) =>
      g.stack === "python" && g.answer.blocks.some((b) => b.type === "code"),
  );
  await page.goto(`/#guide/${g.id}`);
  await expect(page.locator("#readerTitle")).toHaveText(g.title);
  await expect(page.locator(".source-credits")).not.toHaveAttribute("open");
  await expect(page.locator("#scenarioDetail .source-credits")).toContainText(
    g.question.author.name,
  );
  await page.getByRole("tab", { name: "Accepted answer", exact: true }).click();
  await expect(page.locator("#scenarioDetail .source-credits")).toContainText(
    g.answer.author.name,
  );
  await expect(page.locator("#scenarioDetail a[rel*=license]")).toHaveAttribute(
    "href",
    g.license.url,
  );
  await expect(page.locator("#panel-fix .code-block").first()).toBeVisible();
  const scan = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(scan.violations).toEqual([]);
  const pending = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Download guide as Markdown" })
    .click();
  const md = readFileSync(await (await pending).path(), "utf8");
  for (const value of [
    g.title,
    g.question.url,
    g.answer.url,
    g.question.author.name,
    g.answer.author.name,
    g.license.url,
  ])
    expect(md).toContain(value);
  await page.waitForFunction(() => navigator.serviceWorker.controller);
  await context.setOffline(true);
  await page.reload();
  await expect(page.locator("#readerTitle")).toHaveText(g.title);
  await page.getByRole("tab", { name: "Accepted answer", exact: true }).click();
  await expect(page.locator("#scenarioDetail .source-credits")).toContainText(
    g.answer.author.name,
  );
  await context.setOffline(false);
});

test("post HTML and code are displayed as inert text, and votes sort numerically", async ({
  page,
}) => {
  await page.route("**/stackoverflow-data.js", (route) =>
    route.fulfill({
      contentType: "text/javascript",
      body:
        source +
        `\nwindow.PatchAtlasStackOverflow.guides[0].question.blocks.unshift({type: 'text', text: '<img src=x onerror="window.postInjected=true">'});\nwindow.PatchAtlasStackOverflow.guides[0].answer.blocks.unshift({type: 'code', text: '</code><script>window.postInjected=true</script>'});`,
    }),
  );
  await page.goto(`/#guide/${snapshot.guides[0].id}`);
  await expect(
    page.locator("#panel-overview .post-text").first(),
  ).toContainText("<img");
  await expect(page.locator("#scenarioDetail img")).toHaveCount(0);
  await page.getByRole("tab", { name: "Accepted answer", exact: true }).click();
  await expect(page.locator("#panel-fix code").first()).toContainText(
    "</code><script>",
  );
  expect(await page.evaluate(() => window.postInjected)).toBeUndefined();
  await page.keyboard.press("Escape");
  await page.locator("#sourceSelect").selectOption("stackoverflow");
  await page.locator("#sortSelect").selectOption("votes");
  await expect(page.locator(".card-title").first()).toHaveText(
    snapshot.guides[0].title,
  );
});
