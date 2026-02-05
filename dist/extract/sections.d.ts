import type { CheerioAPI } from "cheerio";
import type { MCPSection } from "../types";
export declare function extractSections(root: ReturnType<CheerioAPI>, $: CheerioAPI): MCPSection[];
