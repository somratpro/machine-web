"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMCPHandlerNext = createMCPHandlerNext;
const html_1 = require("../extract/html");
const config_1 = require("../config");
function createMCPHandlerNext(options = {}) {
    const fileConfig = (0, config_1.loadConfig)();
    const mergedConfig = (0, config_1.mergeConfig)((0, config_1.mergeConfig)(config_1.DEFAULT_CONFIG, fileConfig), options.config);
    const exposePath = options.exposePath || mergedConfig.exposePath || "/.mcp";
    return async function handler(req, res) {
        if (req.method !== "GET") {
            res.status(405).json({ error: "Method not allowed" });
            return;
        }
        const urlPath = Array.isArray(req.query.url) ? req.query.url[0] : req.query.url;
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
                framework: "next",
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
    const protoHeader = req.headers["x-forwarded-proto"];
    const proto = Array.isArray(protoHeader) ? protoHeader[0] : protoHeader;
    const host = req.headers.host || "localhost";
    const scheme = proto || "http";
    return `${scheme}://${host}${path}`;
}
async function fetchHTML(url) {
    const res = await fetch(url, { headers: { accept: "text/html" } });
    if (!res.ok)
        throw new Error(`Failed to fetch ${url}`);
    return await res.text();
}
