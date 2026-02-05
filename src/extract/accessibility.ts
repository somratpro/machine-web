import type { CheerioAPI } from "cheerio";
import type { MCPAccessibilityNode } from "../types";

function selectorFor($: CheerioAPI, el: any): string {
  const tag = (el.tagName || "").toLowerCase();
  const id = $(el).attr("id");
  const classes = ($(el).attr("class") || "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 3)
    .join(".");
  let sel = tag;
  if (id) sel += `#${id}`;
  if (classes) sel += `.${classes}`;
  return sel;
}

export function extractAccessibility($: CheerioAPI): MCPAccessibilityNode[] {
  const nodes: MCPAccessibilityNode[] = [];

  $("[role]").each((_: number, el: any) => {
    nodes.push({
      role: $(el).attr("role") || "",
      label: $(el).attr("aria-label") || undefined,
      selector: selectorFor($, el)
    });
  });

  $("[aria-label]").each((_: number, el: any) => {
    nodes.push({
      role: $(el).attr("role") || el.tagName || "",
      label: $(el).attr("aria-label") || undefined,
      selector: selectorFor($, el)
    });
  });

  $("h1, h2, h3, h4, h5, h6").each((_: number, el: any) => {
    const tag = (el.tagName || "").toLowerCase();
    const level = Number(tag.replace("h", ""));
    nodes.push({
      role: "heading",
      label: $(el).text().trim() || undefined,
      level,
      selector: selectorFor($, el)
    });
  });

  $("button, a").each((_: number, el: any) => {
    const tag = (el.tagName || "").toLowerCase();
    nodes.push({
      role: tag === "a" ? "link" : "button",
      label: $(el).text().trim() || $(el).attr("aria-label") || undefined,
      selector: selectorFor($, el)
    });
  });

  return nodes;
}
