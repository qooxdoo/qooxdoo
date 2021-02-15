const test = require("tape");
const fs = require("fs");
const testUtils = require("../../bin/tools/utils");

test("test version", async assert => {
  try {
    await testUtils.deleteRecursive("test-cli/myapp");
    let result;
    result = await testUtils.runCommand("test-cli", testUtils.getCompiler(), "--version");
    assert.ok(result.exitCode === 0);
    assert.end();
  } catch (ex) {
    assert.end(ex);
  }
});

test("create app", async assert => {
  try {
    await testUtils.deleteRecursive("test-cli/myapp");
    let result;
    result = await testUtils.runCommand("test-cli", testUtils.getCompiler(), "create", "myapp", "-I", "--type=server", "-v");
    assert.ok(result.exitCode === 0);
    assert.ok(fs.existsSync("test-cli/myapp/compile.json"))
    result = await testUtils.runCompiler("test-cli/myapp");
    assert.ok(result.exitCode === 0);
    assert.ok(fs.existsSync("test-cli/myapp/compiled/source/myapp/index.js"));
    result = await testUtils.runCommand("test-cli/myapp/compiled/source/myapp", "node", "index.js");
    assert.ok(result.exitCode === 0);
    assert.end();
  } catch (ex) {
    assert.end(ex);
  }
});

test("qx package list", async assert => {
  try {
    let result;
    result = await testUtils.runCommand("test-cli/myapp", testUtils.getCompiler(), "package", "update", "-v");
    assert.ok(result.exitCode === 0);
    result = await testUtils.runCommand("test-cli/myapp", testUtils.getCompiler(), "package", "list", "-v");
    assert.ok(result.exitCode === 0);
    result = await testUtils.runCommand("test-cli/myapp", testUtils.getCompiler(), "package", "list", "--all", "--short", "--noheaders", "--match=qooxdoo/");
    assert.ok(result.exitCode === 0);
    result = await testUtils.runCommand("test-cli/myapp", testUtils.getCompiler(), "package", "list", "--json", "--installed");
    assert.ok(result.exitCode === 0);
    result = await testUtils.runCommand("test-cli/myapp", testUtils.getCompiler(), "package", "list", "--uris-only");
    assert.ok(result.exitCode === 0);
    assert.end();
  } catch (ex) {
    assert.end(ex);
  }
});

test("install packages", async assert => {
  try {
    let result;
    result = await testUtils.runCommand("test-cli/myapp", testUtils.getCompiler(), "package", "list", "-v");
    assert.ok(result.exitCode === 0);
    result = await testUtils.runCommand("test-cli/myapp", testUtils.getCompiler(), "package", "install", "-v", "oetiker/UploadWidget", " --release v1.0.1");
    assert.ok(result.exitCode === 0);
    result = await testUtils.runCommand("test-cli/myapp", testUtils.getCompiler(), "package", "install", "-v", "qooxdoo/qxl.dialog@v3.0.0");
    assert.ok(result.exitCode === 0);
    result = await testUtils.runCommand("test-cli/myapp", testUtils.getCompiler(), "package", "install", "-v", "johnspackman/UploadMgr");
    assert.ok(result.exitCode === 0);
    result = await testUtils.runCommand("test-cli/myapp", testUtils.getCompiler(), "package", "install", "-v", "ergobyte/qookery/qookeryace@0.7.0-pre");
    assert.ok(result.exitCode === 0);
    result = await testUtils.runCompiler("test-cli/myapp", "--clean");
    assert.ok(result.exitCode === 0);
    assert.ok(fs.existsSync("test-cli/myapp/compiled/source/myapp/index.js"));
    result = await testUtils.runCommand("test-cli/myapp/compiled/source/myapp", "node", "index.js");
    assert.ok(result.exitCode === 0);
    assert.end();
  } catch (ex) {
    assert.end(ex);
  }
});

test("reinstall package", async assert => {
  try {
    let result;
    result = await testUtils.runCommand("test-cli/myapp", testUtils.getCompiler(), "clean", "-v");
    assert.ok(result.exitCode === 0);
    result = await testUtils.runCommand("test-cli/myapp", testUtils.getCompiler(), "package", "install", "-v");
    assert.ok(result.exitCode === 0);
    result = await testUtils.runCompiler("test-cli/myapp", "--clean");
    assert.ok(result.exitCode === 0);
    assert.ok(fs.existsSync("test-cli/myapp/compiled/source/myapp/index.js"));
    result = await testUtils.runCommand("test-cli/myapp/compiled/source/myapp", "node", "index.js");
    assert.ok(result.exitCode === 0);
    result = await testUtils.runCommand("test-cli/myapp", testUtils.getCompiler(), "package", "list", "-isH");
    assert.ok(result.exitCode === 0);
    assert.end();
  } catch (ex) {
    assert.end(ex);
  }
});

test("remove packages", async assert => {
  try {
    let result;
    result = await testUtils.runCommand("test-cli/myapp", testUtils.getCompiler(), "package", "remove", "oetiker/UploadWidget", "-v");
    assert.ok(result.exitCode === 0);
    result = await testUtils.runCommand("test-cli/myapp", testUtils.getCompiler(), "package", "remove", "ergobyte/qookery/qookeryace", "-v");
    assert.ok(result.exitCode === 0);
    result = await testUtils.runCommand("test-cli/myapp", testUtils.getCompiler(), "package", "install", "ergobyte/qookery/qookerymaps", "-v");
    assert.ok(result.exitCode === 0);
    result = await testUtils.runCompiler("test-cli/myapp", "--clean");
    assert.ok(result.exitCode === 0);
    assert.ok(fs.existsSync("test-cli/myapp/compiled/source/myapp/index.js"));
    result = await testUtils.runCommand("test-cli/myapp/compiled/source/myapp", "node", "index.js");
    assert.ok(result.exitCode === 0);
    result = await testUtils.runCommand("test-cli/myapp", testUtils.getCompiler(), "package", "list", "--installed", "--short", "--noheaders");
    assert.ok(result.exitCode === 0);
    assert.end();
  } catch (ex) {
    assert.end(ex);
  }
});

test("install without manifest", async assert => {
  try {
    result = await testUtils.runCommand("test-cli/myapp", testUtils.getCompiler(), "clean", "-v");
    assert.ok(result.exitCode === 0);
    result = await testUtils.runCommand("test-cli/myapp", testUtils.getCompiler(), "package", "install", "ergobyte/qookery", "-v");
    assert.ok(result.exitCode === 0);
    result = await testUtils.runCompiler("test-cli/myapp", "--clean");
    assert.ok(result.exitCode === 0);
    assert.ok(fs.existsSync("test-cli/myapp/compiled/source/myapp/index.js"));
    result = await testUtils.runCommand("test-cli/myapp/compiled/source/myapp", "node", "index.js");
    assert.ok(result.exitCode === 0);
    result = await testUtils.runCommand("test-cli/myapp", testUtils.getCompiler(), "package", "list", "--installed", "--short", "--noheaders");
    assert.ok(result.exitCode === 0);
    assert.end();
  } catch (ex) {
    assert.end(ex);
  }
});

test("add class and add script", async assert => {
  try {
    result = await testUtils.runCommand("test-cli/myapp", testUtils.getCompiler(), "add", "class", "myapp.Window", "--extend=qx.core.Object");
    assert.ok(result.exitCode === 0);
    result = await testUtils.runCommand("test-cli/myapp", testUtils.getCompiler(), "add", "script", "../jszip.js", "--rename=zip.js");
    assert.ok(result.exitCode === 0);
    fs.copyFileSync("test-cli/Application.js", "test-cli/myapp/source/class/myapp/Application.js");
    result = await testUtils.runCompiler("test-cli/myapp", "--clean");
    assert.ok(result.exitCode === 0);
    assert.ok(fs.existsSync("test-cli/myapp/compiled/source/myapp/index.js"));
    result = await testUtils.runCommand("test-cli/myapp/compiled/source/myapp", "node", "index.js");
    assert.ok(result.exitCode === 0);
    assert.end();
  } catch (ex) {
    assert.end(ex);
  }
});
