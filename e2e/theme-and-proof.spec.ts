import { expect, test } from "@playwright/test";

test("theme toggle flips the active theme", async ({ page }) => {
  await page.goto("/");

  const html = page.locator("html");
  const toggle = page.getByRole("button", {
    name: /switch to (dark|light) mode/i,
  });
  await expect(toggle).toBeVisible();
  const initialLabel = await toggle.getAttribute("aria-label");
  const initialClassName = await html.getAttribute("class");

  await toggle.click();

  await expect
    .poll(async () => toggle.getAttribute("aria-label"))
    .not.toBe(initialLabel);
  await expect
    .poll(async () => html.getAttribute("class"))
    .not.toBe(initialClassName);
});

test("dark mode footer glyph swaps the header mark after eleven clicks", async ({
  page,
}) => {
  await page.addInitScript(() => {
    window.localStorage.setItem("theme", "dark");
  });
  await page.goto("/");

  await expect(page.locator("html")).toHaveClass(/dark/);

  const glyph = page.getByRole("button", { name: "Kaspa glyph" });
  await glyph.scrollIntoViewIfNeeded();

  for (let clickCount = 0; clickCount < 11; clickCount += 1) {
    await glyph.dispatchEvent("click", {
      clientX: 36,
      clientY: 755,
    });
  }

  await expect(page.locator("nav text").filter({ hasText: "𐤊" })).toBeVisible();
});

test("proof query param opens the genesis overlay and close clears it", async ({
  page,
}) => {
  await page.goto("/?proof=1");

  const backButton = page.getByRole("button", { name: /^back$/i });

  await expect(backButton).toBeVisible();
  await expect(page).toHaveURL(/\/\?proof=1$/);

  await backButton.click();

  await expect(backButton).toHaveCount(0);
  await expect.poll(() => page.url()).not.toMatch(/[?&]proof=1/);
});
