import { expect, test, type Page } from "@playwright/test";

import {
  genericAiError,
  mockedAiAnswerBody,
  mockedAiResponse,
  publicLlmsHrefPattern,
} from "./site-fixtures";

async function sendLauncherQuestion(page: Page, question: string) {
  const launcherInput = page.getByPlaceholder("Ask anything...");
  const sendButton = page.getByRole("button", { name: /send message/i });

  await expect(launcherInput).toBeVisible();
  await launcherInput.fill(question);
  await expect(launcherInput).toHaveValue(question);
  await expect(sendButton).toBeEnabled();
  await sendButton.click();
}

test("AI launcher stays collapsed until opened and returns a mock answer", async ({
  page,
}) => {
  await page.route("**/api/ask", async (route) => {
    await page.waitForTimeout(300);
    await route.fulfill({
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      body: mockedAiResponse,
    });
  });

  await page.goto("/build");

  const openLauncherButton = page.getByRole("button", {
    name: /^ask anything$/i,
  });
  const launcherInput = page.getByPlaceholder("Ask anything...");

  await expect(launcherInput).toHaveCount(0);
  await expect(page.getByRole("link", { name: /^ChatGPT$/ })).toHaveCount(0);

  await openLauncherButton.click();

  await expect(
    page.getByRole("heading", { name: /ask anything about kaspa/i }),
  ).toBeVisible();
  await expect(launcherInput).toBeVisible();
  await expect(page.getByRole("link", { name: /^ChatGPT$/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /^ChatGPT$/ })).toHaveAttribute(
    "href",
    publicLlmsHrefPattern,
  );

  await sendLauncherQuestion(page, "What is Kaspa?");

  await expect(page.getByText(mockedAiAnswerBody)).toBeVisible();
  await expect(page.getByText("Sources (2)")).toBeVisible();
  await expect(page.getByRole("link", { name: "Kaspa docs" })).toBeHidden();

  await page.getByText("Sources (2)").click();

  await expect(page.getByRole("link", { name: "Kaspa docs" })).toBeVisible();
  await expect(page.getByRole("button", { name: /^copy$/i })).toBeVisible();
});

test("AI launcher shows a fallback when the ASK request fails", async ({
  page,
}) => {
  await page.route("**/api/ask", async (route) => {
    await route.fulfill({
      status: 502,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
      body: "ASK request failed",
    });
  });

  await page.goto("/build");

  await page.getByRole("button", { name: /^ask anything$/i }).click();

  await sendLauncherQuestion(page, "What is Kaspa?");

  await expect(page.getByText(genericAiError)).toBeVisible();
});
