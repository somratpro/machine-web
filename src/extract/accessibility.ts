import type { CheerioAPI } from "cheerio";
import type { MCPAccessibilityNode } from "../types";

function selectorFor($: CheerioAPI, el: any): string | undefined {
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
  if (!id && !classes) return undefined;
  return sel || undefined;
}

export function extractAccessibility($: CheerioAPI): MCPAccessibilityNode[] {
  const nodes: MCPAccessibilityNode[] = [];
  const seen = new Set<string>();

  const scopeFor = (el: any): "content" | "navigation" => {
    const isNav = $(el).closest("nav,[role='navigation']").length > 0;
    return isNav ? "navigation" : "content";
  };

  const pushNode = (node: MCPAccessibilityNode) => {
    if (!node.selector) return;
    const key = `${node.role}|${node.label || ""}|${node.level || ""}|${node.selector || ""}`;
    if (seen.has(key)) return;
    seen.add(key);
    nodes.push(node);
  };

  $("[role]").each((_: number, el: any) => {
    pushNode({
      role: $(el).attr("role") || "",
      label: $(el).attr("aria-label") || undefined,
      selector: selectorFor($, el),
      scope: scopeFor(el)
    });
  });

  $("[aria-label]").each((_: number, el: any) => {
    pushNode({
      role: $(el).attr("role") || el.tagName || "",
      label: $(el).attr("aria-label") || undefined,
      selector: selectorFor($, el),
      scope: scopeFor(el)
    });
  });

  $("h1, h2, h3, h4, h5, h6").each((_: number, el: any) => {
    const tag = (el.tagName || "").toLowerCase();
    const level = Number(tag.replace("h", ""));
    pushNode({
      role: "heading",
      label: $(el).text().trim() || undefined,
      level,
      selector: selectorFor($, el),
      scope: scopeFor(el)
    });
  });

  $("button, a").each((_: number, el: any) => {
    const tag = (el.tagName || "").toLowerCase();
    pushNode({
      role: tag === "a" ? "link" : "button",
      label: $(el).text().trim() || $(el).attr("aria-label") || undefined,
      selector: selectorFor($, el),
      scope: scopeFor(el)
    });
  });

  return nodes;
}
