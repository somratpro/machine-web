"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_CONFIG = void 0;
exports.loadConfig = loadConfig;
exports.mergeConfig = mergeConfig;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const DEFAULT_CONFIG = {
    exposePath: "/.mcp",
    selectors: {
        main: "main, article, [role='main']",
        ignore: ["script", "style", "noscript"]
    },
    actions: [],
    includeHtml: false
};
exports.DEFAULT_CONFIG = DEFAULT_CONFIG;
function loadConfig(cwd = process.cwd()) {
    const configPath = path_1.default.join(cwd, "mcp.config.js");
    if (!fs_1.default.existsSync(configPath)) {
        return { ...DEFAULT_CONFIG };
    }
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const raw = require(configPath);
    return mergeConfig(DEFAULT_CONFIG, raw || {});
}
function mergeConfig(base, next) {
    if (!next)
        return { ...base };
    return {
        exposePath: next.exposePath ?? base.exposePath,
        selectors: {
            main: next.selectors?.main ?? base.selectors?.main,
            ignore: next.selectors?.ignore ?? base.selectors?.ignore
        },
        actions: next.actions ?? base.actions,
        includeHtml: next.includeHtml ?? base.includeHtml
    };
}
