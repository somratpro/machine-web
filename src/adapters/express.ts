import type { Request, Response, NextFunction } from "express"
import { extractMCPFromHTML } from "../extract/html"
import { loadConfig, mergeConfig, DEFAULT_CONFIG } from "../config"
import type { MCPConfig } from "../types"

export interface MCPMiddlewareOptions {
  config?: MCPConfig
  exposePath?: string
  getHTML?: (urlPath: string, req: Request) => Promise<string>
}

export function createMCPMiddleware(options: MCPMiddlewareOptions = {}) {
  const fileConfig = loadConfig()
  const mergedConfig = mergeConfig(mergeConfig(DEFAULT_CONFIG, fileConfig), options.config)
  const exposePath = options.exposePath || mergedConfig.exposePath || "/.mcp"

  return async function mcpMiddleware(req: Request, res: Response, next: NextFunction) {
    if (req.path !== exposePath) return next()

    const urlParam = req.query.url
    const urlPath = Array.isArray(urlParam) ? urlParam[0] : urlParam
    const targetPath = typeof urlPath === "string" ? urlPath : "/"

    if (!isSameOriginPath(targetPath)) {
      res.status(400).json({ error: "Only same-origin paths are allowed." })
      return
    }

    try {
      const html = options.getHTML
        ? await options.getHTML(targetPath, req)
        : await fetchHTML(buildAbsoluteUrl(req, targetPath))

      const doc = extractMCPFromHTML(html, {
        url: buildAbsoluteUrl(req, targetPath),
        framework: "express",
        source: "fetch",
        config: mergedConfig
      })

      res.setHeader("content-type", "application/json")
      res.status(200).json(doc)
    } catch (err) {
      res.status(500).json({ error: "Failed to generate MCP document." })
    }
  }
}

function isSameOriginPath(path: string): boolean {
  return path.startsWith("/") && !path.startsWith("//") && !path.includes("://")
}

function buildAbsoluteUrl(req: Request, path: string): string {
  const proto = req.protocol || "http"
  const host = req.get("host") || "localhost"
  return `${proto}://${host}${path}`
}

async function fetchHTML(url: string): Promise<string> {
  const res = await fetch(url, { headers: { accept: "text/html" } })
  if (!res.ok) throw new Error(`Failed to fetch ${url}`)
  return await res.text()
}
