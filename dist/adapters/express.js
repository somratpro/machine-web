"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMCPMiddleware = createMCPMiddleware;
const html_1 = require("../extract/html");
const config_1 = require("../config");
function createMCPMiddleware(options = {}) {
    const fileConfig = (0, config_1.loadConfig)();
    const mergedConfig = (0, config_1.mergeConfig)((0, config_1.mergeConfig)(config_1.DEFAULT_CONFIG, fileConfig), options.config);
    const exposePath = options.exposePath || mergedConfig.exposePath || "/.mcp";
    return async function mcpMiddleware(req, res, next) {
        if (req.path !== exposePath)
            return next();
        const urlParam = req.query.url;
        const urlPath = Array.isArray(urlParam) ? urlParam[0] : urlParam;
        const targetPath = typeof urlPath === "string" ? urlPath : "/";
        if (!isSameOriginPath(targetPath)) {
            res.status(400).json({ error: "Only same-origin paths are allowed." });
            return;
        }
        try {
            const html = options.getHTML
                ? await options.getHTML(targetPath, req)
                : await fetchHTML(buildAbsoluteUrl(req, targetPath));
            const doc = (0, html_1.extractMCPFromHTML)(html, {
                url: buildAbsoluteUrl(req, targetPath),
                framework: "express",
                source: "fetch",
                config: mergedConfig
            });
            res.setHeader("content-type", "application/json");
            res.status(200).json(doc);
        }
        catch (err) {
            res.status(500).json({ error: "Failed to generate MCP document." });
        }
    };
}
function isSameOriginPath(path) {
    return path.startsWith("/") && !path.startsWith("//") && !path.includes("://");
}
function buildAbsoluteUrl(req, path) {
    const proto = req.protocol || "http";
    const host = req.get("host") || "localhost";
    return `${proto}://${host}${path}`;
}
async function fetchHTML(url) {
    const res = await fetch(url, { headers: { accept: "text/html" } });
    if (!res.ok)
        throw new Error(`Failed to fetch ${url}`);
    return await res.text();
}
