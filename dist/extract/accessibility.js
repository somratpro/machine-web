"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractAccessibility = extractAccessibility;
function selectorFor($, el) {
    const tag = (el.tagName || "").toLowerCase();
    const id = $(el).attr("id");
    const classes = ($(el).attr("class") || "")
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 3)
        .join(".");
    let sel = tag;
    if (id)
        sel += `#${id}`;
    if (classes)
        sel += `.${classes}`;
    return sel;
}
function extractAccessibility($) {
    const nodes = [];
    $("[role]").each((_, el) => {
        nodes.push({
            role: $(el).attr("role") || "",
            label: $(el).attr("aria-label") || undefined,
            selector: selectorFor($, el)
        });
    });
    $("[aria-label]").each((_, el) => {
        nodes.push({
            role: $(el).attr("role") || el.tagName || "",
            label: $(el).attr("aria-label") || undefined,
            selector: selectorFor($, el)
        });
    });
    $("h1, h2, h3, h4, h5, h6").each((_, el) => {
        const tag = (el.tagName || "").toLowerCase();
        const level = Number(tag.replace("h", ""));
        nodes.push({
            role: "heading",
            label: $(el).text().trim() || undefined,
            level,
            selector: selectorFor($, el)
        });
    });
    $("button, a").each((_, el) => {
        const tag = (el.tagName || "").toLowerCase();
        nodes.push({
            role: tag === "a" ? "link" : "button",
            label: $(el).text().trim() || $(el).attr("aria-label") || undefined,
            selector: selectorFor($, el)
        });
    });
    return nodes;
}
