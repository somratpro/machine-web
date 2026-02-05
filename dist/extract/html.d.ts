import type { MCPDocument, ExtractOptions } from "../types";
export declare function extractMCPFromHTML(html: string, options: Omit<ExtractOptions, "html">): MCPDocument;
