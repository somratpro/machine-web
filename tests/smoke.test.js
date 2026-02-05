const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const { extractMCPFromHTML } = require("../dist/extract/html");
const { validateMCP } = require("../dist/schema/validate");
const { createMCPMiddleware } = require("../dist/adapters/express");

async function testExtractAndValidate() {
  const html = `
    <main>
      <h1>Hello MCP</h1>
      <p>Price is $29.99</p>
      <ul><li>A</li><li>B</li></ul>
    </main>
  `;

  const doc = extractMCPFromHTML(html, {
    url: "http://localhost/",
    framework: "test",
    source: "static",
    config: { exposePath: "/.mcp", actions: [] }
  });

  const validation = validateMCP(doc);
  assert.strictEqual(validation.valid, true, validation.errors?.join("\n"));
  assert.ok(doc.content.length >= 1);
  const top = doc.content[0];
  const childCount = Array.isArray(top.children) ? top.children.length : 0;
  assert.ok(doc.content.length + childCount >= 2);
}

async function testCLIInspect() {
  const tmpFile = path.join(__dirname, "mcp-test.html");
  fs.writeFileSync(
    tmpFile,
    "<main><h1>CLI</h1><p>Works</p></main>",
    "utf8"
  );

  const result = spawnSync(
    process.execPath,
    [path.join(__dirname, "..", "dist", "cli", "index.js"), "inspect", tmpFile],
    { encoding: "utf8" }
  );

  assert.strictEqual(result.status, 0, result.stderr);
  const json = JSON.parse(result.stdout);
  assert.strictEqual(json.title, undefined);
  assert.strictEqual(json.meta.source, "static");
}

async function testExpressEndpoint() {
  const express = require("express");
  const app = express();

  app.use(createMCPMiddleware());
  app.get("/", (req, res) => {
    res.send("<main><h1>Express</h1><p>OK</p></main>");
  });

  const server = await new Promise((resolve) => {
    const s = app.listen(0, () => resolve(s));
  });

  const port = server.address().port;
  const res = await fetch(`http://127.0.0.1:${port}/.mcp?url=/`);
  const data = await res.json();

  assert.strictEqual(res.status, 200);
  assert.strictEqual(data.meta.framework, "express");
  assert.ok(Array.isArray(data.content));

  await new Promise((resolve) => server.close(resolve));
}

(async () => {
  try {
    await testExtractAndValidate();
    await testCLIInspect();
    await testExpressEndpoint();
    console.log("ok");
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
