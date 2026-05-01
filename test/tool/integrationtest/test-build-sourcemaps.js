const { test } = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");
const { SourceMapConsumer } = require("source-map-js");
const testUtils = require("../../../bin/tools/utils");
const fsPromises = testUtils.fsPromises;

process.chdir(__dirname);

const APP_DIR = "test-sourcemaps";
const APPLICATION_JS = path.join(APP_DIR, "source", "class", "testsourcemap", "Application.js");
const THROW_SNIPPET = 'throw new Error("embedded package sourcemap test");';
const THROW_PATTERN = /throw\s+new\s+Error\((['"])embedded package sourcemap test\1\);?/;

function getTextPosition(filePath, snippet) {
  const text = fs.readFileSync(filePath, "utf8");
  const index = text.indexOf(snippet);
  if (index === -1) {
    throw new Error(`Could not find snippet in ${filePath}: ${snippet}`);
  }

  const before = text.slice(0, index);
  const line = before.split("\n").length;
  const lineStart = before.lastIndexOf("\n");
  const column = index - lineStart;
  return { line, column };
}

function getPatternPosition(filePath, pattern) {
  const text = fs.readFileSync(filePath, "utf8");
  const match = pattern.exec(text);
  if (!match) {
    throw new Error(`Could not find pattern in ${filePath}: ${pattern}`);
  }

  const before = text.slice(0, match.index);
  const line = before.split("\n").length;
  const lineStart = before.lastIndexOf("\n");
  const column = match.index - lineStart;
  return {
    line,
    column,
    match: match[0]
  };
}

async function verifyOutput(output, sourceLine) {
  const generatedPosition = getPatternPosition(output.js, THROW_PATTERN);
  const generatedColumn = generatedPosition.column + generatedPosition.match.indexOf("Error");
  const rawMap = JSON.parse(await fsPromises.readFile(output.map, "utf8"));
  const consumer = await new SourceMapConsumer(rawMap);

  try {
    const originalPosition = consumer.originalPositionFor({
      line: generatedPosition.line,
      column: generatedColumn - 1
    });

    assert.ok(
      originalPosition.source && originalPosition.source.endsWith("/source/class/testsourcemap/Application.js"),
      `${output.label}: source should map back to testsourcemap/Application.js`
    );
    assert.ok(
      Math.abs(originalPosition.line - sourceLine) <= 3,
      `${output.label}: mapped line ${originalPosition.line} should be near source line ${sourceLine}`
    );
  } finally {
    if (consumer.destroy) {
      consumer.destroy();
    }
  }
}

test("embedded package sourcemaps stay aligned in build target", async () => {
  await testUtils.deleteRecursive(path.join(APP_DIR, "compiled"));
  const result = await testUtils.runCompiler(
    APP_DIR,
    "--target=build",
    "--save-source-in-map",
    "--save-unminified"
  );
  assert.equal(result.exitCode, 0, testUtils.reportError(result));

  const sourcePosition = getTextPosition(APPLICATION_JS, THROW_SNIPPET);
  await verifyOutput({
    label: "unminified build",
    js: path.join(APP_DIR, "compiled", "build", "testsourcemap", "index.js.unminified"),
    map: path.join(APP_DIR, "compiled", "build", "testsourcemap", "index.js.unminified.map")
  }, sourcePosition.line);
  await verifyOutput({
    label: "minified build",
    js: path.join(APP_DIR, "compiled", "build", "testsourcemap", "index.js"),
    map: path.join(APP_DIR, "compiled", "build", "testsourcemap", "index.js.map")
  }, sourcePosition.line);
});
