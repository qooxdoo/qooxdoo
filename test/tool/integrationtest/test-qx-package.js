const test = require("tape");
const fs = require("fs");
const testUtils = require("../../../bin/tools/utils");
const path = require("path");
const testDir = path.join(__dirname, "test-qx-package");
if (!fs.existsSync(testDir)) {
  fs.mkdirSync(testDir, { recursive: true });
}
const appDir = path.join(testDir, "myapp");

// set DEBUG envvar to get colorized verbose output
const debug = Boolean(process.env.DEBUG);
//const qxCmdPath = testUtils.getCompiler(debug ? "source":"build");
const qxCmdPath = testUtils.getCompiler("source");
let debugArg = "";
if (debug) {
  const colorize = require('tap-colorize');
  test.createStream().pipe(colorize()).pipe(process.stdout);
  debugArg += "--debug --colorize";
}

test("Test qx package command with help", async assert => {
  try {
    let result;
    result = await testUtils.runCommand(testDir, qxCmdPath, "package", "--help");
    assert.ok(result.exitCode === 0, testUtils.reportError(result));
    result.output = result.output.toLowerCase();
    assert.ok(result.output.includes("usage:") || result.output.includes("commands:"), "Output should contain help information");
    assert.ok(result.output.includes("package"), "Output should mention package commands");
    assert.end();
  } catch (ex) {
    assert.end(ex);
  }
});

test("Create app", async assert => {
  try {
    await testUtils.deleteRecursive(appDir);
    let result;
    result = await testUtils.runCommand(testDir, qxCmdPath, "create", "myapp", "-I");
    assert.ok(result.exitCode === 0, testUtils.reportError(result));
    assert.ok(fs.existsSync(path.join(appDir, "compile.json")));
    result = await testUtils.runCommand(appDir, qxCmdPath, "package", "list", "--all", "--verbose");
    assert.ok(result.exitCode === 0);
    assert.end();
  } catch (ex) {
    assert.end(ex);
  }
});


test("Install qxl.test1, latest version", async assert => {
  try {
    let result;
    result = await testUtils.runCommand(appDir, qxCmdPath, "package", "install", "qooxdoo/qxl.test1@latest");
    assert.ok(result.exitCode === 0, testUtils.reportError(result));
    result = await testUtils.runCommand(appDir, qxCmdPath, "package", "list", "--short", "--noheaders", "--installed", "--all");
    assert.ok(result.exitCode === 0, testUtils.reportError(result));
    assert.equal(result.output.split("\n").length, 3, "Output should be 3 lines");
    result = await testUtils.runCompiler(appDir);
    assert.ok(result.exitCode === 0, testUtils.reportError(result));
    result = await testUtils.runCommand(appDir, qxCmdPath, "package", "remove", "qooxdoo/qxl.test1");
    assert.ok(result.exitCode === 0, testUtils.reportError(result));
    assert.end();
  } catch (ex) {
    assert.end(ex);
  }
});

test("Install qxl.test2/qxl.test2A, latest version", async assert => {
  try {
    let result;
    result = await testUtils.runCommand(appDir, qxCmdPath, "package", "install", "qooxdoo/qxl.test2/qxl.test2A@2.0.2");
    assert.ok(result.exitCode === 0, testUtils.reportError(result));
    result = await testUtils.runCommand(appDir, qxCmdPath, "package", "list", "--short", "--noheaders", "--installed", "--all");
    assert.ok(result.exitCode === 0, testUtils.reportError(result));
    assert.equal(result.output.split("\n").length, 4, "Output should be 4 lines");
    result = await testUtils.runCompiler(appDir);
    assert.ok(result.exitCode === 0, testUtils.reportError(result));
    result = await testUtils.runCommand(appDir, qxCmdPath, "package", "remove", "qooxdoo/qxl.test2/qxl.test2A");
    assert.ok(result.exitCode === 0, testUtils.reportError(result));
    assert.end();
  } catch (ex) {
    assert.end(ex);
  }
});

test("Install qxl.test1@release then migrate and upgrade", async assert => {
  try {
    let result;
    result = await testUtils.runCommand(appDir, qxCmdPath, "package", "install", "qooxdoo/qxl.test1@v1.2.1");
    assert.ok(result.exitCode === 0, testUtils.reportError(result));
    result = await testUtils.runCommand(appDir, qxCmdPath, "package", "list", "--short", "--noheaders", "--installed", "--all");
    assert.ok(result.exitCode === 0, testUtils.reportError(result));
    assert.equal(result.output.split("\n").length, 4, "Output should be 4 lines");
    result = await testUtils.runCommand(path.join(appDir, "qx_packages/qooxdoo_qxl_test1_v1_2_1"), qxCmdPath, "migrate");
    assert.ok(result.exitCode === 0, testUtils.reportError(result));
    result = await testUtils.runCompiler(appDir);
    assert.ok(result.exitCode === 0, testUtils.reportError(result));
    result = await testUtils.runCommand(appDir, qxCmdPath, "package", "upgrade");
    assert.ok(result.exitCode === 0, testUtils.reportError(result));
    result = await testUtils.runCompiler(appDir);
    assert.ok(result.exitCode === 0, testUtils.reportError(result));
    result = await testUtils.runCommand(appDir, qxCmdPath, "package", "remove", "qooxdoo/qxl.test1");
    assert.ok(result.exitCode === 0, testUtils.reportError(result));
    assert.end();
  } catch (ex) {
    assert.end(ex);
  }
});

test("Install qxl.test1@commit", async assert => {
  try {
    let result;
    result = await testUtils.runCommand(appDir, qxCmdPath, "package", "install", "qooxdoo/qxl.test1@b1125235c1002aadf84134c0fa52f5f037f466cd");
    assert.ok(result.exitCode === 0, testUtils.reportError(result));
    result = await testUtils.runCommand(appDir, qxCmdPath, "package", "list", "--short", "--noheaders", "--installed", "--all");
    assert.ok(result.exitCode === 0, testUtils.reportError(result));
    assert.ok(result.output.split("\n").length === 4);
    result = await testUtils.runCompiler(appDir);
    assert.ok(result.exitCode === 0, testUtils.reportError(result));
    assert.end();
  } catch (ex) {
    assert.end(ex);
  }
});

/**
 * Tests for Issue #10194: Adding a package requires "clean" for `npx qx serve` to notice it
 *
 * These tests verify that the compiler automatically detects newly added/removed packages
 * without requiring the --clean flag.
 */

test("Issue #10194: Setup - Initial compile for baseline", async assert => {
  try {
    // Clean up from previous tests
    let result = await testUtils.runCommand(appDir, qxCmdPath, "package", "remove", "qooxdoo/qxl.test1");
    // Ignore exit code - package may not be installed

    // Initial compile to establish baseline
    result = await testUtils.runCompiler(appDir);
    assert.ok(result.exitCode === 0, testUtils.reportError(result));

    // Verify db.json exists
    const dbPath = path.join(appDir, "compiled/source/db.json");
    assert.ok(fs.existsSync(dbPath), "db.json should exist after initial compile");

    assert.end();
  } catch (ex) {
    assert.end(ex);
  }
});

test("Issue #10194: Add package and compile WITHOUT --clean", async assert => {
  try {
    let result;

    // Install package
    result = await testUtils.runCommand(appDir, qxCmdPath, "package", "install", "qooxdoo/qxl.test1@latest");
    assert.ok(result.exitCode === 0, testUtils.reportError(result));

    // Compile WITHOUT --clean flag - should auto-detect the new package
    result = await testUtils.runCompiler(appDir);
    assert.ok(result.exitCode === 0, testUtils.reportError(result));

    // Verify the package is in db.json
    const dbPath = path.join(appDir, "compiled/source/db.json");
    assert.ok(fs.existsSync(dbPath), "db.json should exist");

    const dbContent = JSON.parse(fs.readFileSync(dbPath, "utf8"));
    assert.ok(dbContent.libraries, "Database should contain libraries");
    assert.ok(dbContent.libraries["qxl.test1"], "qxl.test1 should be in the libraries list (auto-detected without --clean)");

    assert.end();
  } catch (ex) {
    assert.end(ex);
  }
});

test("Issue #10194: Add second package and compile WITHOUT --clean", async assert => {
  try {
    let result;

    // Install second package
    result = await testUtils.runCommand(appDir, qxCmdPath, "package", "install", "qooxdoo/qxl.test2/qxl.test2A@2.0.2");
    assert.ok(result.exitCode === 0, testUtils.reportError(result));

    // Compile WITHOUT --clean flag - should auto-detect the second package
    result = await testUtils.runCompiler(appDir);
    assert.ok(result.exitCode === 0, testUtils.reportError(result));

    // Verify both packages are in db.json
    const dbPath = path.join(appDir, "compiled/source/db.json");
    const dbContent = JSON.parse(fs.readFileSync(dbPath, "utf8"));

    assert.ok(dbContent.libraries["qxl.test1"], "qxl.test1 should still be in the libraries list");
    assert.ok(dbContent.libraries["qxl.test2A"], "qxl.test2A should be in the libraries list (auto-detected without --clean)");

    assert.end();
  } catch (ex) {
    assert.end(ex);
  }
});

test("Issue #10194: Remove package and compile WITHOUT --clean", async assert => {
  try {
    let result;

    // Remove first package
    result = await testUtils.runCommand(appDir, qxCmdPath, "package", "remove", "qooxdoo/qxl.test1");
    assert.ok(result.exitCode === 0, testUtils.reportError(result));

    // Compile WITHOUT --clean flag - should auto-detect the removal
    result = await testUtils.runCompiler(appDir);
    assert.ok(result.exitCode === 0, testUtils.reportError(result));

    // Verify the package is no longer in db.json
    const dbPath = path.join(appDir, "compiled/source/db.json");
    const dbContent = JSON.parse(fs.readFileSync(dbPath, "utf8"));

    assert.notOk(dbContent.libraries["qxl.test1"], "qxl.test1 should NOT be in the libraries list (removal auto-detected without --clean)");
    assert.ok(dbContent.libraries["qxl.test2A"], "qxl.test2A should still be in the libraries list");

    assert.end();
  } catch (ex) {
    assert.end(ex);
  }
});

test("Issue #10194: Cleanup - Remove remaining test packages", async assert => {
  try {
    let result = await testUtils.runCommand(appDir, qxCmdPath, "package", "remove", "qooxdoo/qxl.test2/qxl.test2A");
    assert.ok(result.exitCode === 0, testUtils.reportError(result));
    assert.end();
  } catch (ex) {
    assert.end(ex);
  }
});

