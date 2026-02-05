import type { MCPConfig } from "./types";
declare const DEFAULT_CONFIG: MCPConfig;
export declare function loadConfig(cwd?: string): MCPConfig;
export declare function mergeConfig(base: MCPConfig, next?: MCPConfig): MCPConfig;
export { DEFAULT_CONFIG };
