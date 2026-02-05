"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractMCPFromHTML = extractMCPFromHTML;
const cheerio_1 = require("cheerio");
const sections_1 = require("./sections");
const accessibility_1 = require("./accessibility");
const config_1 = require("../config");
function extractMCPFromHTML(html, options) {
    const config = (0, config_1.mergeConfig)(config_1.DEFAULT_CONFIG, options.config);
    const $ = (0, cheerio_1.load)(html);
    const ignore = config.selectors?.ignore || [];
    for (const selector of ignore) {
        $(selector).remove();
    }
    const mainSelector = config.selectors?.main || "main, article, [role='main']";
    const mainEl = $(mainSelector).first();
    const root = mainEl.length ? mainEl.get(0) : $("body").first().get(0);
    const title = cleanText($("title").first().text()) || undefined;
    const description = $("meta[name='description']").attr("content") || undefined;
    const canonical = $("link[rel='canonical']").attr("href") || undefined;
    const language = $("html").attr("lang") || undefined;
    const content = root ? (0, sections_1.extractSections)($(root), $) : [];
    const accessibility = (0, accessibility_1.extractAccessibility)($);
    return {
        url: options.url,
        canonical,
        title,
        description,
        language,
        content,
        accessibility,
        actions: config.actions,
        meta: {
            version: 1,
            generatedAt: new Date().toISOString(),
            framework: options.framework,
            source: options.source
        }
    };
}
function cleanText(text) {
    return text.replace(/\s+/g, " ").trim();
}
