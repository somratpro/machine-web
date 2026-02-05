"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mcpSchema = exports.validateMCP = void 0;
var validate_1 = require("./validate");
Object.defineProperty(exports, "validateMCP", { enumerable: true, get: function () { return validate_1.validateMCP; } });
var mcp_schema_json_1 = require("./mcp.schema.json");
Object.defineProperty(exports, "mcpSchema", { enumerable: true, get: function () { return __importDefault(mcp_schema_json_1).default; } });
