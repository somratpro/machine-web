"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateMCP = validateMCP;
const ajv_1 = __importDefault(require("ajv"));
const mcp_schema_json_1 = __importDefault(require("./mcp.schema.json"));
const ajv = new ajv_1.default({ allErrors: true, strict: false });
const validate = ajv.compile(mcp_schema_json_1.default);
function validateMCP(doc) {
    const valid = validate(doc);
    if (valid)
        return { valid: true };
    const errors = validate.errors?.map((err) => `${err.instancePath || ""} ${err.message || "invalid"}`.trim());
    return { valid: false, errors };
}
