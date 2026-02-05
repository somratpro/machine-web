import type { MCPDocument } from "../types";
export declare function validateMCP(doc: MCPDocument): {
    valid: boolean;
    errors?: string[];
};
