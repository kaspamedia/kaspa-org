import { expect, test } from "@playwright/test";

test("compatibility Tab navigation stays beside the wallet", async ({
  page,
}) => {
  await page.goto("/hodl#wallet");
  await page.getByRole("button", { name: /^Skip/ }).click();
  const info = page.getByRole("button", {
    name: "Ledger: More information",
    exact: true,
  });
  const note = page.getByRole("link", {
    name: "Phone and computer compatibility varies by hardware model.",
    exact: true,
  });
  await info.click();
  await page.mouse.move(0, 0);
  await expect(note).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(info).toBeFocused();

  // Capture the browser's normal next control with the popup closed.
  await page.keyboard.press("Tab");
  const nextControl = await page.locator(":focus").elementHandle();
  expect(nextControl).not.toBeNull();
  await info.evaluate((button) => button.focus({ preventScroll: true }));
  await page.keyboard.press("Enter");
  await expect(note).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(info).toBeFocused();
  await expect(note).toHaveCount(0);

  await page.keyboard.press("Enter");
  await expect(note).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(note).toHaveCount(0);
  await expect
    .poll(() => nextControl!.evaluate((el) => el === document.activeElement))
    .toBe(true);
});

test("compatibility info opens independently by touch and keyboard", async ({
  page,
  context,
}, testInfo) => {
  await page.goto("/hodl#wallet");
  await page.getByRole("button", { name: /^Skip/ }).click();
  const note = page.getByRole("link", {
    name: "Phone and computer compatibility varies by hardware model.",
    exact: true,
  });
  const info = page.getByRole("button", {
    name: "Ledger: More information",
    exact: true,
  });
  await expect(info).toBeVisible();
  await expect(note).toHaveCount(0);
  const row = page.getByRole("row").filter({ has: info });
  if (testInfo.project.name === "mobile-chromium") await info.tap();
  else await info.click();
  await expect(note).toBeVisible();
  await expect(info).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Escape");
  await expect(info).toBeFocused();
  await expect(note).toHaveCount(0);
  await info.press("Enter");
  await expect(note).toBeFocused();
  const url = "https://shop.ledger.com/pages/hardware-wallets-comparison";
  await expect(note).toHaveAttribute("href", url);
  await expect(note).toHaveAttribute("rel", /noopener/);
  if (testInfo.project.name === "desktop-chromium") {
    await expect(row).toHaveAttribute("aria-expanded", "false");
  }
  // Isolate navigation behavior from the vendor's availability.
  await context.route(url, (route) =>
    route.fulfill({ body: "Compatibility guide" }),
  );
  const opened = context.waitForEvent("page");
  await note.focus();
  await page.keyboard.press("Enter");
  const guide = await opened;
  await guide.waitForURL(url);
  await guide.close();
  await page.keyboard.press("Escape");
  await expect(note).toHaveCount(0);
  if (testInfo.project.name === "desktop-chromium") {
    await expect(row).toHaveAttribute("aria-expanded", "false");
  }
  const summary = page.locator("p:visible").filter({
    hasText: /^Hardware wallets for Kaspa with the Ledger Wallet app\.$/,
  });
  await expect(summary).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
  ).toBe(false);
});

test("compatibility hover stays open across the gap without stealing focus", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "desktop-chromium",
    "Mouse hover interaction",
  );
  await page.goto("/hodl#wallet");
  await page.getByRole("button", { name: /^Skip/ }).click();
  const info = page.getByRole("button", {
    name: "Ledger: More information",
    exact: true,
  });
  const note = page.getByRole("link", {
    name: "Phone and computer compatibility varies by hardware model.",
    exact: true,
  });
  // Finish positioning before opening the tooltip: an in-flight smooth scroll
  // can move the trigger away from the pointer and start its close timer.
  await info.evaluate((button) =>
    button.scrollIntoView({ behavior: "instant", block: "center" }),
  );
  await info.hover();
  await expect(note).toBeVisible();
  await expect(note).not.toBeFocused();
  await note.hover();
  await expect(note).toBeVisible();
  expect(
    await note.evaluate((el) => getComputedStyle(el).textDecorationLine),
  ).toBe("none");
  await page.mouse.move(0, 0);
  await expect(note).toHaveCount(0);
  await info.hover();
  await info.click();
  await expect(note).toBeVisible();
  await page.mouse.move(0, 0);
  await expect(note).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(note).toHaveCount(0);
});
