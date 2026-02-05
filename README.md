# @machine-web/mcp

Expose a `/.mcp` endpoint that returns a machine-consumable JSON description of a web page. This helps AI agents and other tools read structured content without crawling, embeddings, or SaaS.

## Install

```bash
npm install @machine-web/mcp
```

## Express Example

```ts
import express from "express"
import { createMCPMiddleware } from "@machine-web/mcp"

const app = express()

app.use(createMCPMiddleware())

app.get("/", (req, res) => {
  res.send("<main><h1>Hello</h1><p>Welcome.</p></main>")
})

app.listen(3000)
```

Request:

```
GET /.mcp?url=/
```

## Next.js Example

```ts
// pages/api/.mcp.ts
import type { NextApiRequest, NextApiResponse } from "next"
import { createMCPHandlerNext } from "@machine-web/mcp"

const handler = createMCPHandlerNext()

export default function mcp(req: NextApiRequest, res: NextApiResponse) {
  return handler(req, res)
}
```

Request:

```
GET /api/.mcp?url=/
```

## CLI

```bash
mcp init
mcp inspect ./public/index.html
mcp validate https://example.com/.mcp?url=/
```

## Sample MCP JSON

```json
{
  "url": "https://example.com/",
  "title": "Example",
  "content": [
    {
      "id": "heading-1",
      "role": "heading",
      "heading": "Welcome",
      "text": "Welcome"
    },
    {
      "id": "paragraph-2",
      "role": "paragraph",
      "text": "This is a sample page."
    }
  ],
  "meta": {
    "version": 1,
    "generatedAt": "2026-02-05T12:00:00.000Z",
    "framework": "express",
    "source": "fetch"
  }
}
```

## Configuration

Create `mcp.config.js` in your project root:

```js
module.exports = {
  exposePath: "/.mcp",
  selectors: {
    main: "main, article",
    ignore: [".ads", ".cookie"]
  },
  actions: []
}
```

## API

```ts
createMCPMiddleware(options)
createMCPHandlerNext(options)
extractMCPFromHTML(html, options)
```

## Behavior Summary

- `GET /.mcp?url=/path`
- Same-origin paths only
- Returns `application/json`
- Extracts sections, tables, lists, code, images, and prices
- Emits accessibility summary
