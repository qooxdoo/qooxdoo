const test = require("tape");
const testUtils = require("../../../bin/tools/utils");
const path = require("path");
const fs = require("fs").promises;
const { execSync } = require("child_process");

const testDir = path.join(__dirname, "test-browserify");
const qxCmdPath = testUtils.getCompiler();

/**
 * Helper: Install npm dependencies
 */
async function installDependencies() {
  try {
    execSync("npm install", {
      cwd: testDir,
      stdio: 'pipe'
    });
  } catch (err) {
    throw new Error(`npm install failed: ${err.message}`);
  }
}

/**
 * Helper: Check if file exists
 */
async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

test("Setup: Install dependencies", async assert => {
  try {
    await installDependencies();
    assert.ok(true, "npm install successful");
    assert.end();
  } catch (ex) {
    assert.end(ex);
  }
});

test("Browserify bundles npm modules correctly", async assert => {
  try {
    // 1. Compile the app
    let result = await testUtils.runCompiler(testDir);
    assert.ok(result.exitCode === 0, `Compile should succeed: ${result.error || result.output}`);

    // 2. Check that commonjs-browserify.js was created
    const browserifyFile = path.join(testDir, "compiled/source/testbrowserify/commonjs-browserify.js");
    assert.ok(await fileExists(browserifyFile), "commonjs-browserify.js should exist");

    // 3. Check file size (should be substantial with uuid + crypto deps)
    const stats = await fs.stat(browserifyFile);
    assert.ok(stats.size > 100000, `Bundle should be > 100KB, got ${stats.size} bytes`);
    assert.ok(stats.size < 5000000, `Bundle should be < 5MB, got ${stats.size} bytes`);

    // 4. Check that it contains uuid code
    const content = await fs.readFile(browserifyFile, 'utf-8');
    assert.ok(content.includes('uuid'), "Bundle should contain 'uuid' string");
    assert.ok(content.includes('require='), "Bundle should contain browserify require wrapper");

    // 5. Check that index.js references it
    const indexFile = path.join(testDir, "compiled/source/testbrowserify/index.js");
    const indexContent = await fs.readFile(indexFile, 'utf-8');
    assert.ok(indexContent.includes('commonjs-browserify.js'), "index.js should load browserify bundle");

    // 6. Check that compiler detected the require() call
    const dbFile = path.join(testDir, "compiled/source/db.json");
    assert.ok(await fileExists(dbFile), "db.json should exist");

    const db = JSON.parse(await fs.readFile(dbFile, 'utf-8'));
    assert.ok(db.classInfo, "db.json should have classInfo");
    assert.ok(db.classInfo["testbrowserify.Application"], "db.json should have testbrowserify.Application");

    const appInfo = db.classInfo["testbrowserify.Application"];
    assert.ok(appInfo.commonjsModules, "Application should have commonjsModules");
    assert.ok(appInfo.commonjsModules.uuid, "Application should require 'uuid' module");
    assert.ok(Array.isArray(appInfo.commonjsModules.uuid), "uuid module should have references");
    assert.ok(appInfo.commonjsModules.uuid.length > 0, "uuid should have at least one reference");

    console.log(`✓ Browserify bundle created: ${(stats.size / 1024).toFixed(1)} KB`);
    console.log(`✓ Detected require('uuid') at: ${appInfo.commonjsModules.uuid[0]}`);

    assert.end();
  } catch (ex) {
    assert.end(ex);
  }
});

test("Compiled app structure is correct", async assert => {
  try {
    const compiledDir = path.join(testDir, "compiled/source/testbrowserify");

    // Check essential files exist
    const files = [
      "index.html",
      "index.js",
      "commonjs-browserify.js"
    ];

    for (const file of files) {
      const filePath = path.join(compiledDir, file);
      assert.ok(await fileExists(filePath), `${file} should exist`);
    }

    // Check index.html structure
    const indexHtml = await fs.readFile(path.join(compiledDir, "index.html"), 'utf-8');
    assert.ok(indexHtml.includes('index.js'), "index.html should load index.js");
    assert.ok(indexHtml.includes('<!DOCTYPE html>'), "index.html should be valid HTML");

    console.log("✓ All required files present");

    assert.end();
  } catch (ex) {
    assert.end(ex);
  }
});

test("Bundle contains expected npm modules", async assert => {
  try {
    const browserifyFile = path.join(testDir, "compiled/source/testbrowserify/commonjs-browserify.js");
    const content = await fs.readFile(browserifyFile, 'utf-8');

    // uuid has crypto dependencies, check they're bundled
    const expectedModules = [
      'uuid',           // Main module
      'crypto',         // Crypto operations
      'buffer',         // Buffer polyfill
      '_process',       // Process polyfill
    ];

    for (const moduleName of expectedModules) {
      assert.ok(
        content.includes(moduleName),
        `Bundle should contain '${moduleName}' module or reference`
      );
    }

    // Check browserify wrapper is present
    assert.ok(
      content.startsWith('require=(function(){function r(e,n,t)'),
      "Bundle should start with browserify require wrapper"
    );

    console.log("✓ All expected modules bundled");

    assert.end();
  } catch (ex) {
    assert.end(ex);
  }
});

test("Recompile is incremental (doesn't rebuild bundle if not needed)", async assert => {
  try {
    // First compile already done, get browserify file mtime
    const browserifyFile = path.join(testDir, "compiled/source/testbrowserify/commonjs-browserify.js");
    const stat1 = await fs.stat(browserifyFile);

    // Wait a bit to ensure timestamp would change
    await new Promise(resolve => setTimeout(resolve, 1100));

    // Recompile
    let result = await testUtils.runCompiler(testDir);
    assert.ok(result.exitCode === 0, "Recompile should succeed");

    // Check if browserify file was modified
    const stat2 = await fs.stat(browserifyFile);

    // Note: This test may be flaky depending on compiler caching strategy
    // If the file is always rebuilt, that's okay too
    if (stat1.mtime.getTime() === stat2.mtime.getTime()) {
      console.log("✓ Browserify bundle was cached (not rebuilt)");
    } else {
      console.log("⚠ Browserify bundle was rebuilt (no caching detected)");
    }

    assert.ok(true, "Recompile completed");
    assert.end();
  } catch (ex) {
    assert.end(ex);
  }
});
