import { load } from "cheerio";
import TurndownService from "turndown";

export function extractPage(html: string, url: string) {
  const $ = load(html);
  if ($('meta[name="robots"]').attr("content")?.includes("noindex")) {
    throw new Error(`Cannot publish noindex page: ${url}`);
  }
  const title = $("title").text().trim();
  const description = $('meta[name="description"]').attr("content")?.trim();
  const main = $("main");
  if (!title || !description || main.length !== 1) {
    throw new Error(`Expected title, description and one main element: ${url}`);
  }
  main
    .find(
      "script, style, svg, canvas, iframe, nav, header, aside, [role=navigation], select, input, textarea, [hidden], [aria-hidden=true], .animate-flicker-in",
    )
    .remove();
  // Copy buttons can contain documentation. Keep their code, not the controls.
  main.find("button").each((_, element) => {
    const button = $(element);
    const code = button.find("code");
    if (code.length) {
      button.replaceWith($("<pre>").append(code));
    } else {
      button.remove();
    }
  });
  main.find("a[href]").each((_, element) => {
    const link = $(element);
    const target = new URL(link.attr("href")!, url);
    if (!["https:", "http:", "mailto:"].includes(target.protocol)) {
      link.replaceWith(link.text());
    } else {
      link.attr("href", target.href);
    }
  });
  // Keep image labels (for example, exchange names) without image payloads.
  main.find("img").each((_, element) => {
    const image = $(element);
    image.replaceWith($("<span>").text(image.attr("alt") ?? ""));
  });
  main.find("source, video, audio").remove();
  const markdown = new TurndownService({
    headingStyle: "atx",
    codeBlockStyle: "fenced",
    bulletListMarker: "-",
  })
    .turndown(main.html() ?? "")
    .replace(/[ \t]+$/gm, "");
  if (markdown.length < 100) throw new Error(`Empty page content: ${url}`);
  return { title, description, url, markdown };
}
