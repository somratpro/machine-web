"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractSections = extractSections;
const PRICE_RE = /(?:\$|€|£|¥)\s?\d{1,3}(?:[\d,]*(?:\.\d{2})?)?/;
function textOf($, el) {
    return $(el).text().replace(/\s+/g, " ").trim();
}
function htmlOf($, el) {
    return $(el).html() || "";
}
function tagNameOf(el) {
    return typeof el.tagName === "string" ? el.tagName.toLowerCase() : "";
}
function slugify(value) {
    return value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 64);
}
function hashString(value) {
    let hash = 5381;
    for (let i = 0; i < value.length; i += 1) {
        hash = (hash * 33) ^ value.charCodeAt(i);
    }
    return (hash >>> 0).toString(36);
}
function buildId(base, seen) {
    const count = seen.get(base) || 0;
    seen.set(base, count + 1);
    return count === 0 ? base : `${base}-${count}`;
}
function elementRole(tag) {
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
function extractList($, el) {
    const items = $(el)
        .find("li")
        .map((_, li) => textOf($, li))
        .get()
        .filter(Boolean);
    return { items };
}
function extractTable($, el) {
    const headers = $(el)
        .find("thead th")
        .map((_, th) => textOf($, th))
        .get();
    const rows = $(el)
        .find("tbody tr")
        .map((_, tr) => $(tr)
        .find("td")
        .map((__, td) => textOf($, td))
        .get())
        .get();
    if (headers.length === 0) {
        const directRows = $(el)
            .find("tr")
            .map((_, tr) => $(tr)
            .find("th, td")
            .map((__, td) => textOf($, td))
            .get())
            .get();
        if (directRows.length) {
            rows.push(...directRows);
        }
    }
    const keyValue = {};
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
function extractCode($, el) {
    if (tagNameOf(el) === "pre") {
        const code = $(el).find("code").first();
        if (code.length)
            return { code: code.text() };
    }
    return { code: textOf($, el) };
}
function extractImage($, el) {
    return {
        src: $(el).attr("src") || undefined,
        alt: $(el).attr("alt") || undefined
    };
}
function isHeading(tag) {
    return /^h[1-4]$/.test(tag);
}
function shouldCapture(tag) {
    return (isHeading(tag) ||
        ["p", "ul", "ol", "table", "img", "pre", "code", "blockquote", "nav", "footer"].includes(tag));
}
function walkNodes(root, $) {
    const results = [];
    const stack = root.children().toArray();
    while (stack.length) {
        const el = stack.shift();
        const tag = tagNameOf(el);
        if (tag && shouldCapture(tag)) {
            results.push(el);
            continue;
        }
        const children = el.children;
        if (Array.isArray(children) && children.length) {
            for (const child of children) {
                stack.push(child);
            }
        }
    }
    return results;
}
function extractSections(root, $, options = {}) {
    const sections = [];
    const nodes = walkNodes(root, $);
    const seenIds = new Map();
    let currentHeading = null;
    const pendingBeforeHeading = [];
    let sectionIndex = 0;
    const pushSection = (section) => {
        sections.push(section);
    };
    for (const el of nodes) {
        const tag = tagNameOf(el);
        if (!tag)
            continue;
        if (isHeading(tag)) {
            const headingText = textOf($, el);
            const level = Number(tag.replace("h", ""));
            const baseId = `heading-${slugify(headingText)}-${hashString(headingText)}`;
            currentHeading = {
                id: buildId(baseId, seenIds),
                role: "heading",
                heading: headingText,
                level: Number.isNaN(level) ? undefined : level,
                html: options.includeHtml ? htmlOf($, el) : undefined
            };
            if (pendingBeforeHeading.length) {
                currentHeading.children = pendingBeforeHeading.splice(0);
            }
            pushSection(currentHeading);
            sectionIndex += 1;
            continue;
        }
        const role = elementRole(tag);
        const text = textOf($, el);
        const imageStructured = role === "image" ? extractImage($, el) : undefined;
        const contentForId = role === "image" ? JSON.stringify(imageStructured) : text || htmlOf($, el);
        const baseId = `${role}-${hashString(contentForId || `${role}-${sectionIndex}`)}`;
        const section = {
            id: buildId(baseId, seenIds),
            role,
            text: text || undefined,
            html: options.includeHtml ? htmlOf($, el) || undefined : undefined
        };
        if (role === "list") {
            section.structured = extractList($, el);
        }
        else if (role === "table") {
            section.structured = extractTable($, el);
        }
        else if (role === "code") {
            section.structured = extractCode($, el);
        }
        else if (role === "image") {
            section.structured = imageStructured;
        }
        else if (role === "paragraph" && text && PRICE_RE.test(text)) {
            section.role = "price";
        }
        if (currentHeading) {
            currentHeading.children = currentHeading.children || [];
            currentHeading.children.push(section);
        }
        else {
            pendingBeforeHeading.push(section);
        }
        sectionIndex += 1;
    }
    if (!currentHeading && pendingBeforeHeading.length) {
        sections.push(...pendingBeforeHeading);
    }
    return sections;
}
