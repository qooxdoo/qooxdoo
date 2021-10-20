const test = require("tape");
const fs = require("fs");
const testUtils = require("../../../bin/tools/utils");
const path = require("path");
const testDir = path.join(__dirname, "test-qx-package");
const appDir = path.join(testDir, "myapp");

// set DEBUG envvar to get colorized verbose output
const debug = Boolean(process.env.DEBUG);
const qxCmdPath = testUtils.getCompiler(debug ? "source":"build");
let debugArg = "";
if (debug) {
  const colorize = require('tap-colorize');
  test.createStream().pipe(colorize()).pipe(process.stdout);
  debugArg += "--debug --colorize";
}

test("Create app", async assert => {
  try {
    await testUtils.deleteRecursive(appDir);
    let result;
    result = await testUtils.runCommand(testDir, qxCmdPath, "create", "myapp", "-I");
    assert.ok(result.exitCode === 0);
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
    assert.ok(result.exitCode === 0);
    result = await testUtils.runCommand(appDir, qxCmdPath, "package", "list", "--short", "--noheaders", "--installed", "--all");
    assert.ok(result.exitCode === 0);
    assert.equal(result.output.split("\n").length, 3, "Output should be 3 lines");
    result = await testUtils.runCompiler(appDir);
    assert.ok(result.exitCode === 0);
    result = await testUtils.runCommand(appDir, qxCmdPath, "package", "remove", "qooxdoo/qxl.test1");
    assert.ok(result.exitCode === 0);
    assert.end();
  } catch (ex) {
    assert.end(ex);
  }
});

test("Install qxl.test2/qxl.test2A, latest version", async assert => {
  try {
    let result;
    result = await testUtils.runCommand(appDir, qxCmdPath, "package", "install", "qooxdoo/qxl.test2/qxl.test2A@2.0.2");
    assert.ok(result.exitCode === 0);
    result = await testUtils.runCommand(appDir, qxCmdPath, "package", "list", "--short", "--noheaders", "--installed", "--all");
    assert.ok(result.exitCode === 0);
    assert.equal(result.output.split("\n").length, 4, "Output should be 4 lines");
    result = await testUtils.runCompiler(appDir);
    assert.ok(result.exitCode === 0);
    result = await testUtils.runCommand(appDir, qxCmdPath, "package", "remove", "qooxdoo/qxl.test2/qxl.test2A");
    assert.ok(result.exitCode === 0);
    assert.end();
  } catch (ex) {
    assert.end(ex);
  }
});

test("Install qxl.test1@release then migrate and upgrade", async assert => {
  try {
    let result;
    result = await testUtils.runCommand(appDir, qxCmdPath, "package", "install", "qooxdoo/qxl.test1@v1.2.1");
    assert.ok(result.exitCode === 0);
    result = await testUtils.runCommand(appDir, qxCmdPath, "package", "list", "--short", "--noheaders", "--installed", "--all");
    assert.ok(result.exitCode === 0);
    assert.equal(result.output.split("\n").length, 4, "Output should be 4 lines");
    result = await testUtils.runCommand(path.join(appDir, "qx_packages/qooxdoo_qxl_test1_v1_2_1"), qxCmdPath, "migrate");
    assert.ok(result.exitCode === 0);
    result = await testUtils.runCompiler(appDir);
    assert.ok(result.exitCode === 0);
    result = await testUtils.runCommand(appDir, qxCmdPath, "package", "upgrade");
    assert.ok(result.exitCode === 0);
    result = await testUtils.runCompiler(appDir);
    assert.ok(result.exitCode === 0);
    result = await testUtils.runCommand(appDir, qxCmdPath, "package", "remove", "qooxdoo/qxl.test1");
    assert.ok(result.exitCode === 0);
    assert.end();
  } catch (ex) {
    assert.end(ex);
  }
});

test("Install qxl.test1@commit", async assert => {
  try {
    let result;
    result = await testUtils.runCommand(appDir, qxCmdPath, "package", "install", "qooxdoo/qxl.test1@b1125235c1002aadf84134c0fa52f5f037f466cd");
    assert.ok(result.exitCode === 0);
    result = await testUtils.runCommand(appDir, qxCmdPath, "package", "list", "--short", "--noheaders", "--installed", "--all");
    assert.ok(result.exitCode === 0);
    assert.ok(result.output.split("\n").length === 4);
    result = await testUtils.runCompiler(appDir);
    assert.ok(result.exitCode === 0);
    assert.end();
  } catch (ex) {
    assert.end(ex);
  }
});

