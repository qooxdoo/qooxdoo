const { test } = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const fsp = require("fs").promises;
const path = require("path");
const testUtils = require("../../../bin/tools/utils");
//const qx = require("../../../compiled/node/build/compilerLibrary"); todo
const qxCmdPath = testUtils.getCompiler();
const testDir = path.join(__dirname, "test-cli")
const myAppDir = path.join(testDir, "myapp");

//colorize output


async function assertPathExists(path){
  let stat = await fsp.stat(path);
  if (stat.isFile() || stat.isDirectory()) {
    return true;
  }
  throw new Error(`Path does not exist: ${path}`);
}

test("test version", async () => {
  try {
    await testUtils.deleteRecursive(myAppDir);
    let result = await testUtils.runCommand(testDir, qxCmdPath, "--version");
    assert.ok(result.exitCode === 0, testUtils.reportError(result));
  } catch (ex) {
    throw ex;
  }
});

test("create app", async () => {
  try {
    await testUtils.deleteRecursive(myAppDir);
    let result;
    result = await testUtils.runCommand(testDir, qxCmdPath, "create", "myapp", "-I", "--type=server", "-v");
    assert.ok(result.exitCode === 0, testUtils.reportError(result));
    assert.ok(await assertPathExists(path.join(myAppDir, "compile.json")));
    result = await testUtils.runCompiler(myAppDir);
    assert.ok(result.exitCode === 0, testUtils.reportError(result));
    assert.ok(await assertPathExists(path.join(myAppDir, "compiled", "source", "myapp", "index.js")));
    result = await testUtils.runCommand(path.join(myAppDir, "compiled", "source", "myapp"), "node", "index.js");
    assert.ok(result.exitCode === 0, testUtils.reportError(result));
    assert.match(result.output, /Hello World!/);
  } catch (ex) {
    throw ex;
  }
});


test("qx package list", async () => {
  try {
    let result;
    result = await testUtils.runCommand(myAppDir, qxCmdPath, "package", "update", "-v");
    assert.ok(result.exitCode === 0, testUtils.reportError(result));
    result = await testUtils.runCommand(myAppDir, qxCmdPath, "package", "list", "-v");
    assert.ok(result.exitCode === 0, testUtils.reportError(result));
    result = await testUtils.runCommand(myAppDir, qxCmdPath, "package", "list", "--all", "--short", "--noheaders", "--match=qooxdoo/");
    assert.ok(result.exitCode === 0, testUtils.reportError(result));
    result = await testUtils.runCommand(myAppDir, qxCmdPath, "package", "list", "--json", "--installed");
    assert.ok(result.exitCode === 0, testUtils.reportError(result));
    result = await testUtils.runCommand(myAppDir, qxCmdPath, "package", "list", "--uris-only");
    assert.ok(result.exitCode === 0, testUtils.reportError(result));
  } catch (ex) {
    throw ex;
  }
});


test("install packages", async () => {
  try {
    let result;
    result = await testUtils.runCommand(myAppDir, qxCmdPath, "package", "list", "-v");
    assert.ok(result.exitCode === 0, testUtils.reportError(result));
    result = await testUtils.runCommand(myAppDir, qxCmdPath, "package", "install", "-v", "oetiker/UploadWidget", " --release v1.0.1");
    assert.ok(result.exitCode === 0, testUtils.reportError(result));
    result = await testUtils.runCommand(myAppDir, qxCmdPath, "package", "install", "-v", "qooxdoo/qxl.dialog@v3.0.0");
    assert.ok(result.exitCode === 0, testUtils.reportError(result));
    result = await testUtils.runCommand(myAppDir, qxCmdPath, "package", "install", "-v", "johnspackman/UploadMgr@v1.0.5");
    assert.ok(result.exitCode === 0, testUtils.reportError(result));
    result = await testUtils.runCommand(myAppDir, qxCmdPath, "package", "install", "-v", "ergobyte/qookery/qookeryace@0.7.0-pre");
    assert.ok(result.exitCode === 0, testUtils.reportError(result));
    result = await testUtils.runCompiler(myAppDir, "--clean");
    assert.ok(result.exitCode === 0, testUtils.reportError(result));
    assert.ok(await assertPathExists(path.join(myAppDir, "compiled", "source", "myapp", "index.js")));
    result = await testUtils.runCommand(path.join(myAppDir, "compiled", "source", "myapp"), "node", "index.js");
    assert.ok(result.exitCode === 0, testUtils.reportError(result));
    assert.match(result.output, /Hello World!/);
  } catch (ex) {
    throw ex;
  }
});

test("reinstall package", async () => {
  try {
    let result;
    result = await testUtils.runCommand(myAppDir, qxCmdPath, "clean", "-v");
    assert.ok(result.exitCode === 0, testUtils.reportError(result));
    result = await testUtils.runCommand(myAppDir, qxCmdPath, "package", "install", "-v");
    assert.ok(result.exitCode === 0, testUtils.reportError(result));
    result = await testUtils.runCompiler(myAppDir, "--clean");
    assert.ok(result.exitCode === 0, testUtils.reportError(result));
    assert.ok(await assertPathExists(path.join(myAppDir, "compiled", "source", "myapp", "index.js")));
    result = await testUtils.runCommand(path.join(myAppDir, "compiled", "source", "myapp"), "node", "index.js");
    assert.ok(result.exitCode === 0, testUtils.reportError(result));
    result = await testUtils.runCommand(myAppDir, qxCmdPath, "package", "list", "-isH");
    assert.ok(result.exitCode === 0, testUtils.reportError(result));
    // todo: check output
  } catch (ex) {
    throw ex;
  }
});

test("remove packages", async () => {
  try {
    let result;
    result = await testUtils.runCommand(myAppDir, qxCmdPath, "package", "remove", "oetiker/UploadWidget", "-v");
    assert.ok(result.exitCode === 0, testUtils.reportError(result));
    result = await testUtils.runCommand(myAppDir, qxCmdPath, "package", "remove", "ergobyte/qookery/qookeryace", "-v");
    assert.ok(result.exitCode === 0, testUtils.reportError(result));
    result = await testUtils.runCompiler(myAppDir, "--clean");
    assert.ok(result.exitCode === 0, testUtils.reportError(result));
    assert.ok(await assertPathExists(path.join(myAppDir, "compiled", "source", "myapp", "index.js")));
    result = await testUtils.runCommand(path.join(myAppDir, "compiled", "source", "myapp"), "node", "index.js");
    assert.ok(result.exitCode === 0, testUtils.reportError(result));
    result = await testUtils.runCommand(myAppDir, qxCmdPath, "package", "list", "--installed", "--short", "--noheaders");
    assert.ok(result.exitCode === 0, testUtils.reportError(result));
    // todo check output: list should be empty
  } catch (ex) {
    throw ex;
  }
});

test("install without manifest", async () => {
  try {
    result = await testUtils.runCommand(myAppDir, qxCmdPath, "clean", "-v");
    assert.ok(result.exitCode === 0, testUtils.reportError(result));
    result = await testUtils.runCommand(myAppDir, qxCmdPath, "package", "install", "ergobyte/qookery@0.7.0-pre", "-v");
    assert.ok(result.exitCode === 0, testUtils.reportError(result));
    result = await testUtils.runCompiler(myAppDir, "--clean");
    assert.ok(result.exitCode === 0, testUtils.reportError(result));
    assert.ok(await assertPathExists(path.join(myAppDir, "compiled", "source", "myapp", "index.js")));
    result = await testUtils.runCommand(path.join(myAppDir, "compiled", "source", "myapp"), "node", "index.js");
    assert.ok(result.exitCode === 0, testUtils.reportError(result));
    assert.match(result.output, /Hello World!/);
    result = await testUtils.runCommand(myAppDir, qxCmdPath, "package", "list", "--installed", "--short", "--noheaders");
    assert.ok(result.exitCode === 0, testUtils.reportError(result));
    // todo: check output
  } catch (ex) {
    throw ex;
  }
});

test("add class and add script", async () => {
  try {
    result = await testUtils.runCommand(myAppDir, qxCmdPath, "add", "class", "myapp.Window", "--extend=qx.core.Object", "--force");
    assert.ok(result.exitCode === 0, testUtils.reportError(result));
    result = await testUtils.runCommand(myAppDir, qxCmdPath, "add", "script", "../jszip.js", "--rename=zip.js", "--noninteractive");
    assert.ok(result.exitCode === 0, testUtils.reportError(result));
    fs.copyFileSync(path.join(testDir, "Application.js"), path.join(myAppDir, "source" , "class" , "myapp" , "Application.js"));
    result = await testUtils.runCompiler(myAppDir, "--clean");
    assert.ok(result.exitCode === 0, testUtils.reportError(result));
    assert.ok(await assertPathExists(path.join(myAppDir, "compiled", "source", "myapp", "index.js")));
    result = await testUtils.runCommand(path.join(myAppDir, "compiled", "source", "myapp"), "node", "index.js");
    assert.ok(result.exitCode === 0, testUtils.reportError(result));
  } catch (ex) {
    throw ex;
  }
});

test("pkg command (package alias)", async () => {
  try {
    // Test that qx pkg is an alias for qx package
    let result = await testUtils.runCommand(testDir, qxCmdPath, "pkg", "--help");
    assert.ok(result.exitCode === 0, testUtils.reportError(result));
    assert.ok(result.output.includes("package") || result.output.includes("pkg"), "pkg help should mention package functionality");
    
  } catch (ex) {
    throw ex;
  }
});

