#!/usr/bin/env node
import fs from "fs"
import path from "path"
import { Command } from "commander"
import { extractMCPFromHTML } from "../extract/html"
import { loadConfig } from "../config"
import { validateMCP } from "../schema/validate"

const program = new Command()

program
  .name("mcp")
  .description("Generate and validate MCP documents")
  .version("0.1.0")

program
  .command("init")
  .description("Create a default mcp.config.js file")
  .action(() => {
    const target = path.join(process.cwd(), "mcp.config.js")
    if (fs.existsSync(target)) {
      console.log("mcp.config.js already exists.")
      return
    }

    const content = `module.exports = {\n  exposePath: "/.mcp",\n  selectors: {\n    main: "main, article",\n    ignore: [".ads", ".cookie"]\n  },\n  actions: []\n}\n`
    fs.writeFileSync(target, content, "utf8")
    console.log("Created mcp.config.js")
  })

program
  .command("inspect")
  .argument("<path>", "Local HTML file path or URL")
  .description("Extract MCP JSON from an HTML source")
  .action(async (input) => {
    const config = loadConfig()
    const isUrl = input.startsWith("http://") || input.startsWith("https://")

    const html = isUrl ? await fetchHTML(input) : fs.readFileSync(path.resolve(input), "utf8")
    const url = isUrl ? input : `file://${path.resolve(input)}`

    const doc = extractMCPFromHTML(html, {
      url,
      framework: "cli",
      source: isUrl ? "fetch" : "static",
      config
    })

    process.stdout.write(JSON.stringify(doc, null, 2))
  })

program
  .command("validate")
  .argument("<url>", "URL to an MCP JSON document")
  .description("Validate an MCP JSON document against the schema")
  .action(async (url) => {
    const res = await fetch(url, { headers: { accept: "application/json" } })
    if (!res.ok) {
      console.error(`Failed to fetch ${url}: ${res.status}`)
      process.exitCode = 1
      return
    }

    const data = await res.json()
    const result = validateMCP(data)

    if (!result.valid) {
      console.error("Invalid MCP document:")
      for (const err of result.errors || []) {
        console.error(`- ${err}`)
      }
      process.exitCode = 1
      return
    }

    console.log("Valid MCP document.")
  })

program.parseAsync(process.argv).catch((err) => {
  console.error(err)
  process.exitCode = 1
})

async function fetchHTML(url: string): Promise<string> {
  const res = await fetch(url, { headers: { accept: "text/html" } })
  if (!res.ok) throw new Error(`Failed to fetch ${url}`)
  return await res.text()
}
