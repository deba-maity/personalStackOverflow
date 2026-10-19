const { test, expect } = require("@playwright/test");
const path = require("node:path");
const AxeBuilder = require("@axe-core/playwright").default;
const vm = require("node:vm");
const catalog = { window: {} };
vm.runInNewContext(
  require("node:fs").readFileSync("stackoverflow-data.js", "utf8"),
  catalog,
);
const total = String(48 + catalog.window.PatchAtlasStackOverflow.guides.length);
test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#allCount")).toHaveText(total);
});

test("search supports word order, phrases, tags, filters and literal markup", async ({
  page,
}) => {
  await page.locator("#sourceSelect").selectOption("field");
  await page.locator("#searchInput").fill("state interval");
  await expect(page.locator(".card-title").first()).toContainText("interval");
  await page.locator("#sourceSelect").selectOption("field");
  await page.locator("#searchInput").fill('stack:react "stale closure"');
  await expect(page.locator(".scenario-card")).toHaveCount(1);
  await page.locator("#searchInput").fill("tag:async");
  await expect(page.locator("#resultCount")).not.toHaveText("0");
  await page.locator("#searchInput").fill("<img src=x onerror=alert(1)>");
  await expect(page.locator(".no-results")).toBeVisible();
  await expect(page.locator("#scenarioList img")).toHaveCount(0);
  await page
    .getByRole("button", { name: "Clear filters", exact: true })
    .last()
    .click();
  await page.getByRole("button", { name: "Frontend", exact: true }).click();
  await expect(
    page.locator(".card-topline .separator + span").first(),
  ).toHaveText("frontend");
  await page.locator("#severitySelect").selectOption("critical");
  await expect(page.locator(".no-results")).toBeVisible();
});

test("bookmarks, notes, resolution and checklists survive a reload", async ({
  page,
}) => {
  await page.locator('[data-save="react-stale-closure"]').click();
  await expect(page.locator("#savedCount")).toHaveText("1");
  await page.locator('[data-open="react-stale-closure"]').click();
  await expect(page.locator("#readerDialog")).toBeVisible();
  await page.locator("[data-resolve]").click();
  await page.getByRole("tab", { name: "The fix", exact: true }).click();
  await page.locator('[data-check="0"]').check();
  await page.getByRole("tab", { name: "Your notes" }).click();
  await page
    .locator("#personalNotes")
    .fill("Reproduced with fake timers. Fixed in the polling view.");
  await page.reload();
  await expect(page.locator("#readerTitle")).toContainText("interval");
  await page.getByRole("tab", { name: "Your notes" }).click();
  await expect(page.locator("#personalNotes")).toHaveValue(
    "Reproduced with fake timers. Fixed in the polling view.",
  );
  await page.getByRole("tab", { name: "The fix", exact: true }).click();
  await expect(page.locator('[data-check="0"]')).toBeChecked();
  await expect(page.locator("[data-resolve]")).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await page.keyboard.press("Escape");
  await page.locator('[data-view="saved"]').click();
  await expect(page.locator(".scenario-card")).toHaveCount(1);
});

test("custom notes can be created, edited, safely rendered, exported, restored and deleted", async ({
  page,
}) => {
  await page.locator("#createButton").click();
  await page.locator("#defectTitle").fill("My <script> discovery");
  await page
    .locator("#defectSummary")
    .fill("A unique production regression with <b>literal markup</b>.");
  await page.locator("#defectCause").fill("A missing state transition.");
  await page
    .locator("#defectGoodCode")
    .fill('const value = "</code><img src=x onerror=alert(1)>";');
  await page
    .locator("#defectVerify")
    .fill("Trigger the old failure\nConfirm the correct response");
  await page
    .getByRole("button", { name: "Save field note", exact: true })
    .click();
  await expect(page.locator("#readerTitle")).toHaveText(
    "My <script> discovery",
  );
  await expect(page.locator("#scenarioDetail img")).toHaveCount(0);
  await page.getByRole("tab", { name: "The fix", exact: true }).click();
  await expect(page.locator("#fixedCode")).toContainText("</code><img");
  const mdPromise = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Download guide as Markdown" })
    .click();
  const md = await mdPromise;
  expect(md.suggestedFilename()).toMatch(/\.md$/);
  await page.locator("[data-edit]").click();
  await page.locator("#defectTitle").fill("Edited discovery");
  await page
    .getByRole("button", { name: "Save field note", exact: true })
    .click();
  await expect(page.locator("#readerTitle")).toHaveText("Edited discovery");
  await page.keyboard.press("Escape");
  const backupPromise = page.waitForEvent("download");
  await page.locator("#backupButton").click();
  const backup = await backupPromise;
  const backupPath = await backup.path();
  await page.locator(".card-main").first().click();
  await page.getByRole("tab", { name: "Your notes" }).click();
  await page.locator("[data-delete-prompt]").click();
  await page.locator("[data-delete-confirm]").click();
  await expect(page.locator("#customCount")).toHaveText("0");
  await page.locator("#importFile").setInputFiles(backupPath);
  await expect(page.locator("#customCount")).toHaveText("1");
  await page.locator("#importFile").setInputFiles(backupPath);
  await expect(page.locator("#customCount")).toHaveText("1");
  await expect(page.locator(".card-title")).toHaveText("Edited discovery");
});

test("invalid imports do not change the workspace", async ({ page }) => {
  await page.locator("#importFile").setInputFiles({
    name: "bad.json",
    mimeType: "application/json",
    buffer: Buffer.from(
      '{"version":2,"custom":[{"id":"react-stale-closure","title":"overwrite"}],"saved":[]}',
    ),
  });
  await expect(page.locator("#toast")).toContainText("invalid or reserved");
  await expect(page.locator("#allCount")).toHaveText(total);
  await expect(page.locator("#customCount")).toHaveText("0");
});

test("a complete field manual exports independently readable content", async ({
  page,
}) => {
  const promise = page.waitForEvent("download");
  await page.locator("#exportManualButton").click();
  const download = await promise;
  const contents = require("node:fs").readFileSync(
    await download.path(),
    "utf8",
  );
  expect(contents).toContain(`${total} distinct guides`);
  expect(contents).toContain("Why your interval keeps reading");
  expect(contents).toContain("Every test passes alone");
  expect(contents).toContain("## Verification");
});

test("corrupt stored data is preserved for recovery", async ({ page }) => {
  await page.evaluate(() =>
    localStorage.setItem("patchAtlasWorkspaceV2", "{broken-workspace"),
  );
  await page.reload();
  await expect(page.locator("#allCount")).toHaveText(total);
  expect(
    await page.evaluate(() =>
      localStorage.getItem("patchAtlasWorkspaceV2.recovery"),
    ),
  ).toBe("{broken-workspace");
});

test("storage failures are visible and changes remain exportable", async ({
  page,
}) => {
  await page.evaluate(() => {
    Storage.prototype.setItem = function () {
      throw new DOMException("Full", "QuotaExceededError");
    };
  });
  await page.locator('[data-save="react-stale-closure"]').click();
  await expect(page.locator("#toast")).toContainText("storage");
  await expect(page.locator("#savedCount")).toHaveText("1");
  const promise = page.waitForEvent("download");
  await page.locator("#backupButton").click();
  const download = await promise;
  const contents = JSON.parse(
    require("node:fs").readFileSync(await download.path(), "utf8"),
  );
  expect(contents.saved).toContain("react-stale-closure");
});

test("library and reader pass automated accessibility checks", async ({
  page,
}) => {
  const scan = () =>
    new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
  expect((await scan()).violations).toEqual([]);
  await page.locator(".card-main").first().click();
  expect((await scan()).violations).toEqual([]);
  await page.getByRole("tab", { name: "The fix", exact: true }).click();
  expect((await scan()).violations).toEqual([]);
  await page.keyboard.press("Escape");
  await page.locator("#themeButton").click();
  expect((await scan()).violations).toEqual([]);
});

test("theme and keyboard shortcuts work without hijacking text entry", async ({
  page,
}) => {
  await page.keyboard.press("/");
  await expect(page.locator("#searchInput")).toBeFocused();
  await page.keyboard.type("n");
  await expect(page.locator("#defectDialog")).not.toBeVisible();
  await page.locator("#themeButton").click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.locator("body").click({ position: { x: 800, y: 100 } });
  await page.keyboard.press("?");
  await expect(page.locator("#helpDialog")).toBeVisible();
});

test("full library reopens offline and search still works", async ({
  page,
  context,
}) => {
  await page.waitForFunction(() => navigator.serviceWorker.controller);
  await context.setOffline(true);
  await page.reload();
  await expect(page.locator("#allCount")).toHaveText(total);
  await page.locator("#searchInput").fill("postgres");
  await expect(page.locator("#resultCount")).not.toHaveText("0");
  await page.locator(".card-main").first().click();
  await expect(page.locator("#readerTitle")).toBeVisible();
  await context.setOffline(false);
});

test("old bookmarks and custom entries migrate once without losing edited descriptions", async ({
  page,
}) => {
  await page.evaluate(() => {
    localStorage.clear();
    localStorage.setItem(
      "patchAtlasSaved",
      JSON.stringify(["react-async-race-1"]),
    );
    localStorage.setItem(
      "patchAtlasDescriptionEdits",
      JSON.stringify({ "react-async-race-1": "My edited legacy description" }),
    );
    localStorage.setItem(
      "patchAtlasCustomScenarios",
      JSON.stringify([
        {
          id: "custom-original",
          title: "Original personal issue",
          stackKey: "git",
          summary: "Kept from v1",
        },
      ]),
    );
  });
  await page.reload();
  await expect(page.locator("#customCount")).toHaveText("2");
  await page.locator('[data-view="saved"]').click();
  await expect(page.locator(".card-summary")).toHaveText(
    "My edited legacy description",
  );
  await page.reload();
  await expect(page.locator("#customCount")).toHaveText("2");
});

test("direct file mode remains usable without a server", async ({ page }) => {
  await page.goto("file:///" + path.resolve("index.html").replace(/\\/g, "/"));
  await expect(page.locator("#allCount")).toHaveText(total);
  await page.locator("#sourceSelect").selectOption("field");
  await page.locator("#searchInput").fill("stack:docker");
  await expect(page.locator(".scenario-card")).toHaveCount(3);
});

for (const width of [375, 768, 1024, 1440]) {
  test(`layout fits at ${width}px and the reader remains usable`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await expect
      .poll(() =>
        page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      )
      .toBe(true);
    if (width < 760) {
      await page.locator("#menuButton").click();
      await expect(page.locator("#sidebar")).toHaveClass(/open/);
      await page.locator('[data-view="saved"]').click();
      await expect(page.locator("#sidebar")).not.toHaveClass(/open/);
      await page.getByRole("button", { name: "Explore all guides" }).click();
    }
    await page.locator(".card-main").first().click();
    await expect(page.locator("#readerTitle")).toBeVisible();
    await page.getByRole("tab", { name: "The fix", exact: true }).click();
    await expect(page.locator("#fixedCode")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.locator("#readerDialog")).not.toBeVisible();
  });
}

test("capture visual review artifacts and detect runtime errors", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.setViewportSize({ width: 1440, height: 1080 });
  await page.reload();
  await page.screenshot({
    path: ".artifacts/desktop.png",
    fullPage: true,
    animations: "disabled",
  });
  await page.locator(".card-main").first().click();
  await page.getByRole("tab", { name: "The fix", exact: true }).click();
  await page.screenshot({
    path: ".artifacts/reader.png",
    animations: "disabled",
  });
  await page.keyboard.press("Escape");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: ".artifacts/mobile.png",
    fullPage: true,
    animations: "disabled",
  });
  await page.locator("#themeButton").click();
  await page.screenshot({
    path: ".artifacts/mobile-dark.png",
    fullPage: true,
    animations: "disabled",
  });
  expect(errors).toEqual([]);
});
