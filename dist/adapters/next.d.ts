import type { MCPConfig } from "../types";
type NextApiRequest = {
    method?: string;
    query: Record<string, string | string[] | undefined>;
    headers: Record<string, string | string[] | undefined>;
};
type NextApiResponse = {
    status: (code: number) => NextApiResponse;
    json: (body: any) => void;
    setHeader: (name: string, value: string) => void;
};
export interface MCPNextOptions {
    config?: MCPConfig;
    exposePath?: string;
    getHTML?: (urlPath: string, req: NextApiRequest) => Promise<string>;
}
export declare function createMCPHandlerNext(options?: MCPNextOptions): (req: NextApiRequest, res: NextApiResponse) => Promise<void>;
export {};
