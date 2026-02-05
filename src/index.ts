export { createMCPMiddleware } from "./adapters/express"
export { createMCPHandlerNext } from "./adapters/next"
export { extractMCPFromHTML } from "./extract/html"
export { validateMCP } from "./schema/validate"
export { default as mcpSchema } from "./schema/mcp.schema.json"
export type {
  MCPDocument,
  MCPSection,
  MCPAccessibilityNode,
  MCPAction,
  MCPConfig,
  ExtractOptions
} from "./types"
