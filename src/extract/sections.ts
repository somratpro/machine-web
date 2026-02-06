import type { CheerioAPI } from "cheerio";
import type { AnyNode } from "domhandler";
import type { MCPSection } from "../types";

const PRICE_RE = /(?:\$|€|£|¥)\s?\d{1,3}(?:[\d,]*(?:\.\d{2})?)?/;

function textOf($: CheerioAPI, el: AnyNode): string {
  return $(el).text().replace(/\s+/g, " ").trim();
}

function htmlOf($: CheerioAPI, el: AnyNode): string {
  return $(el).html() || "";
}

function tagNameOf(el: AnyNode): string {
  return typeof (el as any).tagName === "string" ? (el as any).tagName.toLowerCase() : "";
}

function elementRole(tag: string): MCPSection["role"] {
  switch (tag) {
    case "p":
      return "paragraph";
    case "ul":
    case "ol":
      return "list";
    case "table":
      return "table";
    case "img":
      return "image";
    case "pre":
    case "code":
      return "code";
    case "blockquote":
      return "quote";
    case "nav":
      return "navigation";
    case "footer":
      return "footer";
    default:
      return "unknown";
  }
}

function extractList($: CheerioAPI, el: AnyNode) {
  const items = $(el)
    .find("li")
    .map((_: number, li: AnyNode) => textOf($, li))
    .get()
    .filter(Boolean);
  return { items };
}

function extractTable($: CheerioAPI, el: AnyNode) {
  const headers = $(el)
    .find("thead th")
    .map((_: number, th: AnyNode) => textOf($, th))
    .get();

  const rows = $(el)
    .find("tbody tr")
    .map((_: number, tr: AnyNode) =>
      $(tr)
        .find("td")
        .map((__: number, td: AnyNode) => textOf($, td))
        .get()
    )
    .get();

  if (headers.length === 0) {
    const directRows = $(el)
      .find("tr")
      .map((_: number, tr: AnyNode) =>
        $(tr)
          .find("th, td")
          .map((__: number, td: AnyNode) => textOf($, td))
          .get()
      )
      .get();
    if (directRows.length) {
      rows.push(...directRows);
    }
  }

  const keyValue: Record<string, string> = {};
  for (const row of rows) {
    if (row.length === 2) {
      keyValue[row[0]] = row[1];
    }
  }

  return {
    headers,
    rows,
    keyValue: Object.keys(keyValue).length ? keyValue : undefined
  };
}

function extractCode($: CheerioAPI, el: AnyNode) {
  if (tagNameOf(el) === "pre") {
    const code = $(el).find("code").first();
    if (code.length) return { code: code.text() };
  }
  return { code: textOf($, el) };
}

function extractImage($: CheerioAPI, el: AnyNode) {
  return {
    src: $(el).attr("src") || undefined,
    alt: $(el).attr("alt") || undefined
  };
}

function isHeading(tag: string): boolean {
  return /^h[1-4]$/.test(tag);
}

function shouldCapture(tag: string): boolean {
  return (
    isHeading(tag) ||
    ["p", "ul", "ol", "table", "img", "pre", "code", "blockquote", "nav", "footer"].includes(tag)
  );
}

function walkNodes(root: ReturnType<CheerioAPI>, $: CheerioAPI): AnyNode[] {
  const results: AnyNode[] = [];
  const stack = root.children().toArray();

  while (stack.length) {
    const el = stack.shift() as AnyNode;
    const tag = tagNameOf(el);
    if (tag && shouldCapture(tag)) {
      results.push(el);
      continue;
    }
    const children = (el as any).children;
    if (Array.isArray(children) && children.length) {
      for (const child of children) {
        stack.push(child);
      }
    }
  }

  return results;
}

export function extractSections(root: ReturnType<CheerioAPI>, $: CheerioAPI): MCPSection[] {
  const sections: MCPSection[] = [];
  const nodes = walkNodes(root, $);

  let currentHeading: MCPSection | null = null;
  const pendingBeforeHeading: MCPSection[] = [];
  let sectionIndex = 0;

  const pushSection = (section: MCPSection) => {
    sections.push(section);
  };

  for (const el of nodes) {
    const tag = tagNameOf(el);
    if (!tag) continue;

    if (isHeading(tag)) {
      const headingText = textOf($, el);
      currentHeading = {
        id: `section-${sectionIndex++}`,
        role: "heading",
        heading: headingText,
        text: headingText,
        html: htmlOf($, el)
      };
      if (pendingBeforeHeading.length) {
        currentHeading.children = pendingBeforeHeading.splice(0);
      }
      pushSection(currentHeading);
      continue;
    }

    const role = elementRole(tag);
    const text = textOf($, el);
    const section: MCPSection = {
      id: `section-${sectionIndex++}`,
      role,
      text: text || undefined,
      html: htmlOf($, el) || undefined
    };

    if (role === "list") {
      section.structured = extractList($, el);
    } else if (role === "table") {
      section.structured = extractTable($, el);
    } else if (role === "code") {
      section.structured = extractCode($, el);
    } else if (role === "image") {
      section.structured = extractImage($, el);
    } else if (role === "paragraph" && text && PRICE_RE.test(text)) {
      section.role = "price";
    }

    if (currentHeading) {
      currentHeading.children = currentHeading.children || [];
      currentHeading.children.push(section);
    } else {
      pendingBeforeHeading.push(section);
    }
  }

  if (!currentHeading && pendingBeforeHeading.length) {
    sections.push(...pendingBeforeHeading);
  }

  return sections;
}
