import { load } from "cheerio"
import type { MCPDocument, ExtractOptions } from "../types"
import { extractSections } from "./sections"
import { extractAccessibility } from "./accessibility"
import { mergeConfig, DEFAULT_CONFIG } from "../config"

export function extractMCPFromHTML(html: string, options: Omit<ExtractOptions, "html">): MCPDocument {
  const config = mergeConfig(DEFAULT_CONFIG, options.config)
  const $ = load(html)

  const ignore = config.selectors?.ignore || []
  for (const selector of ignore) {
    $(selector).remove()
  }

  const mainSelector = config.selectors?.main || "main, article, [role='main']"
  const mainEl = $(mainSelector).first()
  const root = mainEl.length ? mainEl.get(0) : $("body").first().get(0)

  const title = cleanText($("title").first().text()) || undefined
  const description = cleanText($("meta[name='description']").attr("content") || "") || undefined
  const canonical = $("link[rel='canonical']").attr("href") || undefined
  const language = $("html").attr("lang") || undefined

  const content = root ? extractSections($(root), $, { includeHtml: config.includeHtml }) : []
  const accessibility = extractAccessibility($)

  return {
    url: options.url,
    canonical,
    title,
    description,
    language,
    content,
    accessibility,
    actions: config.actions,
    meta: {
      version: 1,
      generatedAt: new Date().toISOString(),
      framework: options.framework,
      source: options.source
    }
  }
}

function cleanText(text: string): string {
  return text.replace(/\s+/g, " ").trim()
}
