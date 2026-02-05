const fs = require("fs")
const path = require("path")

const src = path.join(__dirname, "..", "src", "schema", "mcp.schema.json")
const destDir = path.join(__dirname, "..", "dist", "schema")
const dest = path.join(destDir, "mcp.schema.json")

fs.mkdirSync(destDir, { recursive: true })
fs.copyFileSync(src, dest)
