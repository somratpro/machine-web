import { extractMCPFromHTML } from "../extract/html"
import { loadConfig, mergeConfig, DEFAULT_CONFIG } from "../config"
import type { MCPConfig } from "../types"

type NextApiRequest = {
  method?: string
  query: Record<string, string | string[] | undefined>
  headers: Record<string, string | string[] | undefined>
}

type NextApiResponse = {
  status: (code: number) => NextApiResponse
  json: (body: any) => void
  setHeader: (name: string, value: string) => void
}

export interface MCPNextOptions {
  config?: MCPConfig
  exposePath?: string
  getHTML?: (urlPath: string, req: NextApiRequest) => Promise<string>
}

export function createMCPHandlerNext(options: MCPNextOptions = {}) {
  const fileConfig = loadConfig()
  const mergedConfig = mergeConfig(mergeConfig(DEFAULT_CONFIG, fileConfig), options.config)
  const exposePath = options.exposePath || mergedConfig.exposePath || "/.mcp"

  return async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") {
      res.status(405).json({ error: "Method not allowed" })
      return
    }

    const urlPath = Array.isArray(req.query.url) ? req.query.url[0] : req.query.url
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
        framework: "next",
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

function buildAbsoluteUrl(req: NextApiRequest, path: string): string {
  const protoHeader = req.headers["x-forwarded-proto"]
  const proto = Array.isArray(protoHeader) ? protoHeader[0] : protoHeader
  const host = req.headers.host || "localhost"
  const scheme = proto || "http"
  return `${scheme}://${host}${path}`
}

async function fetchHTML(url: string): Promise<string> {
  const res = await fetch(url, { headers: { accept: "text/html" } })
  if (!res.ok) throw new Error(`Failed to fetch ${url}`)
  return await res.text()
}
