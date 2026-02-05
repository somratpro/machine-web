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
function extractSections(root, $) {
    const sections = [];
    const children = root.children().toArray();
    let currentHeading = null;
    let sectionIndex = 0;
    const pushSection = (section) => {
        sections.push(section);
    };
    for (const el of children) {
        const tag = tagNameOf(el);
        if (!tag)
            continue;
        if (isHeading(tag)) {
            const headingText = textOf($, el);
            currentHeading = {
                id: `section-${sectionIndex++}`,
                role: "heading",
                heading: headingText,
                text: headingText,
                html: htmlOf($, el)
            };
            pushSection(currentHeading);
            continue;
        }
        const role = elementRole(tag);
        const text = textOf($, el);
        const section = {
            id: `section-${sectionIndex++}`,
            role,
            text: text || undefined,
            html: htmlOf($, el) || undefined
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
            section.structured = extractImage($, el);
        }
        else if (role === "paragraph" && text && PRICE_RE.test(text)) {
            section.role = "price";
        }
        if (currentHeading) {
            currentHeading.children = currentHeading.children || [];
            currentHeading.children.push(section);
        }
        else {
            pushSection(section);
        }
    }
    return sections;
}
