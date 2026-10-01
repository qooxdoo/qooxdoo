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

/**
 * Finds the 1-based line and column of a literal snippet inside a file.
 *
 * @param {string} filePath path to the file to inspect
 * @param {string} snippet literal text to locate in the file
 * @returns {{ line: number, column: number }} the snippet start position
 */
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

/**
 * Finds the 1-based line and column of the first regex match inside a file.
 *
 * @param {string} filePath path to the file to inspect
 * @param {RegExp} pattern pattern to match against the file contents
 * @returns {{ line: number, column: number, match: string }} the match position and matched text
 */
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

/**
 * Verifies that a generated bundle and its source map point back to the expected source line.
 *
 * @param {{ label: string, js: string, map: string }} output generated artifact paths and label
 * @param {number} sourceLine expected source line in the original application file
 * @returns {Promise<void>} resolves when the assertions pass
 */
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

/**
 * Lists the `sourceMappingURL` references in the JavaScript files of an application
 * directory whose map file does not exist.
 *
 * @param {string} appOutputDir directory of the compiled application
 * @returns {Promise<string[]>} "file.js -> map" for every missing map
 */
async function findMissingSourceMaps(appOutputDir) {
  const missing = [];
  for (const name of await fsPromises.readdir(appOutputDir)) {
    if (!name.endsWith(".js")) {
      continue;
    }
    const text = await fsPromises.readFile(path.join(appOutputDir, name), "utf8");
    for (const match of text.matchAll(/^\/\/#\s*sourceMappingURL=([^?\s]+)/gm)) {
      if (!fs.existsSync(path.join(appOutputDir, match[1]))) {
        missing.push(`${name} -> ${match[1]}`);
      }
    }
  }
  return missing;
}

for (const target of ["source", "build"]) {
  test(`every sourceMappingURL in the ${target} target points to a map that exists`, async () => {
    await testUtils.deleteRecursive(path.join(APP_DIR, "compiled"));
    const result = await testUtils.runCompiler(APP_DIR, `--target=${target}`);
    assert.equal(result.exitCode, 0, testUtils.reportError(result));

    const appOutputDir = path.join(APP_DIR, "compiled", target, "testsourcemap");
    if (target == "source") {
      // The build target embeds the polyfills in index.js
      assert.ok(fs.existsSync(path.join(appOutputDir, "polyfill.js")), "polyfill.js should be written");
    }
    const missing = await findMissingSourceMaps(appOutputDir);
    assert.deepEqual(missing, [], `Missing source maps: ${missing.join(", ")}`);
  });
}

test("polyfill.js in the source target maps back to the core-js sources", async () => {
  await testUtils.deleteRecursive(path.join(APP_DIR, "compiled"));
  const result = await testUtils.runCompiler(APP_DIR, "--target=source");
  assert.equal(result.exitCode, 0, testUtils.reportError(result));

  const appOutputDir = path.join(APP_DIR, "compiled", "source", "testsourcemap");
  const jsLines = (await fsPromises.readFile(path.join(appOutputDir, "polyfill.js"), "utf8")).split("\n");
  assert.ok(
    jsLines.includes("//# sourceMappingURL=polyfill.js.map"),
    "polyfill.js should refer to polyfill.js.map"
  );
  const rawMap = JSON.parse(await fsPromises.readFile(path.join(appOutputDir, "polyfill.js.map"), "utf8"));
  assert.equal(rawMap.file, "polyfill.js");
  const consumer = await new SourceMapConsumer(rawMap);

  // A property name is not mangled by the minifier, so it must be at the mapped
  //  position in polyfill.js and in the original source
  const NAME = "getOwnPropertyDescriptor";
  let checked = 0;
  consumer.eachMapping(mapping => {
    if (mapping.name !== NAME) {
      return;
    }
    const generatedLine = jsLines[mapping.generatedLine - 1];
    if (generatedLine.substr(mapping.generatedColumn, NAME.length) !== NAME) {
      return;
    }
    assert.ok(mapping.source.endsWith("core-js-bundle/index.js"), `unexpected source ${mapping.source}`);
    const content = consumer.sourceContentFor(mapping.source, true);
    assert.ok(content, "the map should contain the core-js source");
    const originalLine = content.split("\n")[mapping.originalLine - 1];
    assert.equal(originalLine.substr(mapping.originalColumn, NAME.length), NAME);
    checked++;
  });
  assert.ok(checked > 0, `no mapping of ${NAME} found in polyfill.js.map`);
});
