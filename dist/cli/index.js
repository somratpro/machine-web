#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const commander_1 = require("commander");
const html_1 = require("../extract/html");
const config_1 = require("../config");
const validate_1 = require("../schema/validate");
const program = new commander_1.Command();
program
    .name("mcp")
    .description("Generate and validate MCP documents")
    .version("0.1.0");
program
    .command("init")
    .description("Create a default mcp.config.js file")
    .action(() => {
    const target = path_1.default.join(process.cwd(), "mcp.config.js");
    if (fs_1.default.existsSync(target)) {
        console.log("mcp.config.js already exists.");
        return;
    }
    const content = `module.exports = {\n  exposePath: "/.mcp",\n  selectors: {\n    main: "main, article",\n    ignore: [".ads", ".cookie"]\n  },\n  actions: []\n}\n`;
    fs_1.default.writeFileSync(target, content, "utf8");
    console.log("Created mcp.config.js");
});
program
    .command("inspect")
    .argument("<path>", "Local HTML file path or URL")
    .description("Extract MCP JSON from an HTML source")
    .action(async (input) => {
    const config = (0, config_1.loadConfig)();
    const isUrl = input.startsWith("http://") || input.startsWith("https://");
    const html = isUrl ? await fetchHTML(input) : fs_1.default.readFileSync(path_1.default.resolve(input), "utf8");
    const url = isUrl ? input : `file://${path_1.default.resolve(input)}`;
    const doc = (0, html_1.extractMCPFromHTML)(html, {
        url,
        framework: "cli",
        source: isUrl ? "fetch" : "static",
        config
    });
    process.stdout.write(JSON.stringify(doc, null, 2));
});
program
    .command("validate")
    .argument("<url>", "URL to an MCP JSON document")
    .description("Validate an MCP JSON document against the schema")
    .action(async (url) => {
    const res = await fetch(url, { headers: { accept: "application/json" } });
    if (!res.ok) {
        console.error(`Failed to fetch ${url}: ${res.status}`);
        process.exitCode = 1;
        return;
    }
    const data = await res.json();
    const result = (0, validate_1.validateMCP)(data);
    if (!result.valid) {
        console.error("Invalid MCP document:");
        for (const err of result.errors || []) {
            console.error(`- ${err}`);
        }
        process.exitCode = 1;
        return;
    }
    console.log("Valid MCP document.");
});
program.parseAsync(process.argv).catch((err) => {
    console.error(err);
    process.exitCode = 1;
});
async function fetchHTML(url) {
    const res = await fetch(url, { headers: { accept: "text/html" } });
    if (!res.ok)
        throw new Error(`Failed to fetch ${url}`);
    return await res.text();
}
