import fs from "fs"
import path from "path"
import type { MCPConfig } from "./types"

const DEFAULT_CONFIG: MCPConfig = {
  exposePath: "/.mcp",
  selectors: {
    main: "main, article, [role='main']",
    ignore: ["script", "style", "noscript"]
  },
  actions: [],
  includeHtml: false
}

export function loadConfig(cwd: string = process.cwd()): MCPConfig {
  const configPath = path.join(cwd, "mcp.config.js")
  if (!fs.existsSync(configPath)) {
    return { ...DEFAULT_CONFIG }
  }

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const raw = require(configPath) as MCPConfig
  return mergeConfig(DEFAULT_CONFIG, raw || {})
}

export function mergeConfig(base: MCPConfig, next?: MCPConfig): MCPConfig {
  if (!next) return { ...base }
  return {
    exposePath: next.exposePath ?? base.exposePath,
    selectors: {
      main: next.selectors?.main ?? base.selectors?.main,
      ignore: next.selectors?.ignore ?? base.selectors?.ignore
    },
    actions: next.actions ?? base.actions,
    includeHtml: next.includeHtml ?? base.includeHtml
  }
}

export { DEFAULT_CONFIG }
