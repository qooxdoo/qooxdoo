const test = require("tape");
const fs = require("fs");
const testUtils = require("../../bin/tools/utils");
const fsPromises = testUtils.fsPromises;

test("Create app", async assert => {
  try {
    await testUtils.deleteRecursive("test-qx-package/myapp");
    let result;
    result = await testUtils.runCommand("test-qx-package", testUtils.getCompiler(), "create", "myapp", "-I");
    assert.ok(result.exitCode === 0);
    assert.ok(fs.existsSync("test-qx-package/myapp/compile.json"))
    result = await testUtils.runCommand("test-qx-package/myapp", testUtils.getCompiler(), "package", "list", "--all",);
    assert.ok(result.exitCode === 0);
    assert.end();
  } catch (ex) {
    assert.end(ex);
  }
});

test("Install qxl.test1, latest version", async assert => {
  try {
    let result;
    result = await testUtils.runCommand("test-qx-package/myapp", testUtils.getCompiler(), "package", "install", "qooxdoo/qxl.test1");
    assert.ok(result.exitCode === 0);
    result = await testUtils.runCommand("test-qx-package/myapp", testUtils.getCompiler(), "package", "list", "--short", "--noheaders", "--installed", "--all");
    assert.ok(result.exitCode === 0);
    assert.ok(result.output.split("\n").length === 3)
    result = await testUtils.runCompiler("test-qx-package/myapp");
    assert.ok(result.exitCode === 0);
    result = await testUtils.runCommand("test-qx-package/myapp", testUtils.getCompiler(), "package", "remove", "qooxdoo/qxl.test1");
    assert.ok(result.exitCode === 0);
    assert.end();
  } catch (ex) {
    assert.end(ex);
  }
});

test("Install qxl.test2/qxl.test2A, latest version", async assert => {
  try {
    let result;
    result = await testUtils.runCommand("test-qx-package/myapp", testUtils.getCompiler(), "package", "install", "qooxdoo/qxl.test2/qxl.test2A");
    assert.ok(result.exitCode === 0);
    result = await testUtils.runCommand("test-qx-package/myapp", testUtils.getCompiler(), "package", "list", "--short", "--noheaders", "--installed", "--all");
    assert.ok(result.exitCode === 0);
    assert.ok(result.output.split("\n").length === 4);
    result = await testUtils.runCompiler("test-qx-package/myapp");
    assert.ok(result.exitCode === 0);
    result = await testUtils.runCommand("test-qx-package/myapp", testUtils.getCompiler(), "package", "remove", "qooxdoo/qxl.test2/qxl.test2A");
    assert.ok(result.exitCode === 0);
    assert.end();
  } catch (ex) {
    assert.end(ex);
  }
});

test("Install qxl.test1@release then migrate and upgrade", async assert => {
  try {
    let result;
    result = await testUtils.runCommand("test-qx-package/myapp", testUtils.getCompiler(), "package", "install", "qooxdoo/qxl.test1@v1.0.2");
    assert.ok(result.exitCode === 0);
    result = await testUtils.runCommand("test-qx-package/myapp", testUtils.getCompiler(), "package", "list", "--short", "--noheaders", "--installed", "--all");
    assert.ok(result.exitCode === 0);
    assert.ok(result.output.split("\n").length === 4);
    result = await testUtils.runCommand("test-qx-package/myapp/qx_packages/qooxdoo_qxl_test1_v1_0_2", testUtils.getCompiler(), "package", "migrate");
    assert.ok(result.exitCode === 0);
    result = await testUtils.runCompiler("test-qx-package/myapp");
    assert.ok(result.exitCode === 0);
    result = await testUtils.runCommand("test-qx-package/myapp", testUtils.getCompiler(), "package", "upgrade");
    assert.ok(result.exitCode === 0);
    result = await testUtils.runCompiler("test-qx-package/myapp");
    assert.ok(result.exitCode === 0);
    result = await testUtils.runCommand("test-qx-package/myapp", testUtils.getCompiler(), "package", "remove", "qooxdoo/qxl.test1");
    assert.ok(result.exitCode === 0);
    assert.end();
  } catch (ex) {
    assert.end(ex);
  }
});

test("Install qxl.test1@commit", async assert => {
  try {
    let result;
    result = await testUtils.runCommand("test-qx-package/myapp", testUtils.getCompiler(), "package", "install", "qooxdoo/qxl.test1@b1125235c1002aadf84134c0fa52f5f037f466cd");
    assert.ok(result.exitCode === 0);
    result = await testUtils.runCommand("test-qx-package/myapp", testUtils.getCompiler(), "package", "list", "--short", "--noheaders", "--installed", "--all");
    assert.ok(result.exitCode === 0);
    assert.ok(result.output.split("\n").length === 4);
    result = await testUtils.runCompiler("test-qx-package/myapp");
    assert.ok(result.exitCode === 0);
    assert.end();
  } catch (ex) {
    assert.end(ex);
  }
});

