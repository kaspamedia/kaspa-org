import { expect, test } from "@playwright/test";

test("mobile section nav opens after scrolling and navigates to a section", async ({
  page,
}, testInfo) => {
  test.skip(
    !testInfo.project.name.includes("mobile"),
    "Mobile-only section-nav smoke",
  );

  await page.goto("/build");
  await page.locator("#paths").scrollIntoViewIfNeeded();

  const sectionNavToggle = page.getByRole("button", {
    name: /open page sections, current section/i,
  });

  await expect(sectionNavToggle).toBeVisible();
  await sectionNavToggle.click();

  const sectionSheet = page.getByRole("dialog", { name: /page sections/i });
  await expect(sectionSheet).toBeVisible();

  await sectionSheet.locator('a[href="#help"]').click();

  await expect(page).toHaveURL(/\/build#help$/);
  await expect(page.locator("#help")).toBeInViewport();
});

test("mobile navigation only exposes links when the menu is open", async ({
  page,
}, testInfo) => {
  test.skip(
    !testInfo.project.name.includes("mobile"),
    "Mobile-only navigation smoke",
  );

  await page.goto("/");

  const mobileMenu = page.locator("#mobile-nav-links");
  const mobileLinks = mobileMenu.locator("a");
  const menuToggle = page.getByRole("button", { name: /toggle menu/i });

  await expect(menuToggle).toHaveAttribute("aria-expanded", "false");
  await expect(mobileMenu).toHaveAttribute("inert", "");

  for (let index = 0; index < (await mobileLinks.count()); index += 1) {
    await expect(mobileLinks.nth(index)).toHaveAttribute("tabindex", "-1");
  }

  await expect(menuToggle).toBeVisible();
  await menuToggle.focus();
  await expect(menuToggle).toBeFocused();
  await page.keyboard.press("Enter");

  await expect(menuToggle).toHaveAttribute("aria-expanded", "true");
  await expect(mobileMenu).not.toHaveAttribute("inert", "");
  await expect(mobileLinks.first()).toBeVisible();

  for (let index = 0; index < (await mobileLinks.count()); index += 1) {
    await expect(mobileLinks.nth(index)).toHaveAttribute("tabindex", "0");
  }
});
