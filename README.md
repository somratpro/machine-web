# machine-web-mcp

Expose a `/.mcp` endpoint that returns a machine-consumable JSON description of a web page. This endpoint is optimized for AI agents, not browsers.

## Install

```bash
npm install machine-web-mcp
```

## Express Example

```ts
import express from "express"
import { createMCPMiddleware } from "machine-web-mcp"

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
import { createMCPHandlerNext } from "machine-web-mcp"

const handler = createMCPHandlerNext()

export default function mcp(req: NextApiRequest, res: NextApiResponse) {
  return handler(req, res)
}
```

Request:

```
GET /api/.mcp?url=/
```

## Framework Integrations

### Next.js

Pages Router:

```ts
// pages/api/mcp.ts
import type { NextApiRequest, NextApiResponse } from "next"
import { createMCPHandlerNext } from "machine-web-mcp"

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  return createMCPHandlerNext()(req, res)
}
```

App Router:

```ts
// app/api/mcp/route.ts
import { createMCPHandlerNext } from "machine-web-mcp"

const handler = createMCPHandlerNext()

export async function GET(req: Request) {
  const url = new URL(req.url)
  const query = Object.fromEntries(url.searchParams.entries())

  const res: any = {
    status(code: number) {
      this.statusCode = code
      return this
    },
    json(body: any) {
      this.body = body
      return this
    },
    setHeader() {}
  }

  const fakeReq: any = {
    method: "GET",
    query,
    headers: Object.fromEntries(req.headers.entries())
  }

  await handler(fakeReq, res)

  return new Response(JSON.stringify(res.body), {
    status: res.statusCode || 200,
    headers: { "content-type": "application/json; charset=utf-8" }
  })
}
```

### Astro

```ts
// src/pages/api/mcp.ts
import type { APIRoute } from "astro"
import { createMCPHandlerNext } from "machine-web-mcp"

const handler = createMCPHandlerNext()

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url)
  const query = Object.fromEntries(url.searchParams.entries())

  const res: any = {
    status(code: number) {
      this.statusCode = code
      return this
    },
    json(body: any) {
      this.body = body
      return this
    },
    setHeader() {}
  }

  const fakeReq: any = {
    method: "GET",
    query,
    headers: Object.fromEntries(request.headers.entries())
  }

  await handler(fakeReq, res)

  return new Response(JSON.stringify(res.body), {
    status: res.statusCode || 200,
    headers: { "content-type": "application/json; charset=utf-8" }
  })
}
```

### Hugo

Hugo is static. Serve its output with a tiny Node wrapper that adds `/.mcp`.

```js
// server.js
const express = require("express")
const path = require("path")
const { createMCPMiddleware } = require("machine-web-mcp")

const app = express()
app.use(express.static(path.join(__dirname, "public")))
app.use(createMCPMiddleware())
app.listen(3000, () => console.log("http://localhost:3000"))
```

Then:

```
GET http://localhost:3000/.mcp?url=/your-page/
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
      "id": "heading-welcome-k3m9",
      "role": "heading",
      "level": 1,
      "heading": "Welcome"
    },
    {
      "id": "paragraph-9az2",
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
  includeHtml: false,
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
