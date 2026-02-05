import type { Request, Response, NextFunction } from "express";
import type { MCPConfig } from "../types";
export interface MCPMiddlewareOptions {
    config?: MCPConfig;
    exposePath?: string;
    getHTML?: (urlPath: string, req: Request) => Promise<string>;
}
export declare function createMCPMiddleware(options?: MCPMiddlewareOptions): (req: Request, res: Response, next: NextFunction) => Promise<void>;
