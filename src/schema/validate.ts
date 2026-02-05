import Ajv from "ajv"
import schema from "./mcp.schema.json"
import type { MCPDocument } from "../types"

const ajv = new Ajv({ allErrors: true, strict: false })
const validate = ajv.compile(schema)

export function validateMCP(doc: MCPDocument): { valid: boolean; errors?: string[] } {
  const valid = validate(doc)
  if (valid) return { valid: true }

  const errors = validate.errors?.map((err) => `${err.instancePath || ""} ${err.message || "invalid"}`.trim())
  return { valid: false, errors }
}
