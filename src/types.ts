export interface MCPDocument {
  url: string
  canonical?: string
  title?: string
  description?: string
  language?: string
  content: MCPSection[]
  accessibility?: MCPAccessibilityNode[]
  actions?: MCPAction[]
  meta: {
    version: number
    generatedAt: string
    framework?: string
    source: "ssr" | "static" | "fetch"
  }
}

export interface MCPSection {
  id: string
  role:
    | "heading"
    | "paragraph"
    | "list"
    | "table"
    | "image"
    | "code"
    | "quote"
    | "price"
    | "navigation"
    | "footer"
    | "unknown"
  heading?: string
  text?: string
  html?: string
  structured?: Record<string, any>
  children?: MCPSection[]
}

export interface MCPAccessibilityNode {
  role: string
  label?: string
  level?: number
  selector?: string
}

export interface MCPAction {
  name: string
  description?: string
  method: "GET" | "POST" | "PUT" | "DELETE"
  endpoint: string
  authRequired: boolean
  inputSchema?: Record<string, any>
}

export interface MCPConfig {
  exposePath?: string
  selectors?: {
    main?: string
    ignore?: string[]
  }
  actions?: MCPAction[]
}

export interface ExtractOptions {
  url: string
  html: string
  framework?: string
  source: "ssr" | "static" | "fetch"
  config?: MCPConfig
}
