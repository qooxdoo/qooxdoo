const test = require("tape");
const colorize = require('tap-colorize');
const fs = require("fs");
const fsp = require("fs").promises;
const path = require("path");
const testUtils = require("../../../bin/tools/utils");
//const qx = require("../../../compiled/node/build/compilerLibrary"); todo
const qxCmdPath = testUtils.getCompiler();
const testDir = path.join(__dirname, "test-cli")
const myAppDir = path.join(testDir, "myapp");

//colorize output
test.createStream().pipe(colorize()).pipe(process.stdout);

function reportError(result) {
  if (result.error) {
    return new Error(`The command exited with an error: ${result.error}. Output was: ${result.output}`);
  }
  return "";
}

async function assertPathExists(path){
  let stat = await fsp.stat(path);
  if (stat.isFile() || stat.isDirectory()) {
    return true;
  }
  throw new Error(`Path does not exist: ${path}`);
}

test("test version", async assert => {
  try {
    await testUtils.deleteRecursive(myAppDir);
    let result = await testUtils.runCommand(testDir, qxCmdPath, "--version");
    assert.ok(result.exitCode === 0, reportError(result));
    assert.end();
  } catch (ex) {
    assert.end(ex);
  }
});

test("create app", async assert => {
  try {
    await testUtils.deleteRecursive(myAppDir);
    let result;
    result = await testUtils.runCommand(testDir, qxCmdPath, "create", "myapp", "-I", "--type=server", "-v");
    assert.ok(result.exitCode === 0, reportError(result));
    assert.ok(await assertPathExists(path.join(myAppDir, "compile.json")));
    result = await testUtils.runCompiler(myAppDir);
    assert.ok(result.exitCode === 0, reportError(result));
    assert.ok(await assertPathExists(path.join(myAppDir, "compiled", "source", "myapp", "index.js")));
    result = await testUtils.runCommand(path.join(myAppDir, "compiled", "source", "myapp"), "node", "index.js");
    assert.ok(result.exitCode === 0, reportError(result));
    assert.match(result.output, /Hello World!/);
    assert.end();
  } catch (ex) {
    assert.end(ex);
  }
});


test("qx package list", async assert => {
  try {
    let result;
    result = await testUtils.runCommand(myAppDir, qxCmdPath, "package", "update", "-v");
    assert.ok(result.exitCode === 0, reportError(result));
    result = await testUtils.runCommand(myAppDir, qxCmdPath, "package", "list", "-v");
    assert.ok(result.exitCode === 0, reportError(result));
    result = await testUtils.runCommand(myAppDir, qxCmdPath, "package", "list", "--all", "--short", "--noheaders", "--match=qooxdoo/");
    assert.ok(result.exitCode === 0, reportError(result));
    result = await testUtils.runCommand(myAppDir, qxCmdPath, "package", "list", "--json", "--installed");
    assert.ok(result.exitCode === 0, reportError(result));
    result = await testUtils.runCommand(myAppDir, qxCmdPath, "package", "list", "--uris-only");
    assert.ok(result.exitCode === 0, reportError(result));
    assert.end();
  } catch (ex) {
    assert.end(ex);
  }
});


test("install packages", async assert => {
  try {
    let result;
    result = await testUtils.runCommand(myAppDir, qxCmdPath, "package", "list", "-v");
    assert.ok(result.exitCode === 0, reportError(result));
    result = await testUtils.runCommand(myAppDir, qxCmdPath, "package", "install", "-v", "oetiker/UploadWidget", " --release v1.0.1");
    assert.ok(result.exitCode === 0, reportError(result));
    result = await testUtils.runCommand(myAppDir, qxCmdPath, "package", "install", "-v", "qooxdoo/qxl.dialog@v3.0.0");
    assert.ok(result.exitCode === 0, reportError(result));
    result = await testUtils.runCommand(myAppDir, qxCmdPath, "package", "install", "-v", "johnspackman/UploadMgr@v1.0.5");
    assert.ok(result.exitCode === 0, reportError(result));
    result = await testUtils.runCommand(myAppDir, qxCmdPath, "package", "install", "-v", "ergobyte/qookery/qookeryace@0.7.0-pre");
    assert.ok(result.exitCode === 0, reportError(result));
    result = await testUtils.runCompiler(myAppDir, "--clean");
    assert.ok(result.exitCode === 0, reportError(result));
    assert.ok(await assertPathExists(path.join(myAppDir, "compiled", "source", "myapp", "index.js")));
    result = await testUtils.runCommand(path.join(myAppDir, "compiled", "source", "myapp"), "node", "index.js");
    assert.ok(result.exitCode === 0, reportError(result));
    assert.match(result.output, /Hello World!/);
    assert.end();
  } catch (ex) {
    assert.end(ex);
  }
});

test("reinstall package", async assert => {
  try {
    let result;
    result = await testUtils.runCommand(myAppDir, qxCmdPath, "clean", "-v");
    assert.ok(result.exitCode === 0, reportError(result));assert.ok(result.exitCode === 0, reportError(result));
    result = await testUtils.runCommand(myAppDir, qxCmdPath, "package", "install", "-v");
    assert.ok(result.exitCode === 0, reportError(result));
    result = await testUtils.runCompiler(myAppDir, "--clean");
    assert.ok(result.exitCode === 0, reportError(result));
    assert.ok(await assertPathExists(path.join(myAppDir, "compiled", "source", "myapp", "index.js")));
    result = await testUtils.runCommand(path.join(myAppDir, "compiled", "source", "myapp"), "node", "index.js");
    assert.ok(result.exitCode === 0, reportError(result));
    result = await testUtils.runCommand(myAppDir, qxCmdPath, "package", "list", "-isH");
    assert.ok(result.exitCode === 0, reportError(result));
    // todo: check output
    assert.end();
  } catch (ex) {
    assert.end(ex);
  }
});

test("remove packages", async assert => {
  try {
    let result;
    result = await testUtils.runCommand(myAppDir, qxCmdPath, "package", "remove", "oetiker/UploadWidget", "-v");
    assert.ok(result.exitCode === 0, reportError(result));
    result = await testUtils.runCommand(myAppDir, qxCmdPath, "package", "remove", "ergobyte/qookery/qookeryace", "-v");
    assert.ok(result.exitCode === 0, reportError(result));
    result = await testUtils.runCompiler(myAppDir, "--clean");
    assert.ok(result.exitCode === 0, reportError(result));
    assert.ok(await assertPathExists(path.join(myAppDir, "compiled", "source", "myapp", "index.js")));
    result = await testUtils.runCommand(path.join(myAppDir, "compiled", "source", "myapp"), "node", "index.js");
    assert.ok(result.exitCode === 0, reportError(result));
    result = await testUtils.runCommand(myAppDir, qxCmdPath, "package", "list", "--installed", "--short", "--noheaders");
    assert.ok(result.exitCode === 0, reportError(result));
    // todo check output: list should be empty
    assert.end();
  } catch (ex) {
    assert.end(ex);
  }
});

test("install without manifest", async assert => {
  try {
    result = await testUtils.runCommand(myAppDir, qxCmdPath, "clean", "-v");
    assert.ok(result.exitCode === 0, reportError(result));
    result = await testUtils.runCommand(myAppDir, qxCmdPath, "package", "install", "ergobyte/qookery@0.7.0-pre", "-v");
    assert.ok(result.exitCode === 0, reportError(result));
    result = await testUtils.runCompiler(myAppDir, "--clean");
    assert.ok(result.exitCode === 0, reportError(result));
    assert.ok(await assertPathExists(path.join(myAppDir, "compiled", "source", "myapp", "index.js")));
    result = await testUtils.runCommand(path.join(myAppDir, "compiled", "source", "myapp"), "node", "index.js");
    assert.ok(result.exitCode === 0, reportError(result));
    assert.match(result.output, /Hello World!/);
    result = await testUtils.runCommand(myAppDir, qxCmdPath, "package", "list", "--installed", "--short", "--noheaders");
    assert.ok(result.exitCode === 0, reportError(result));
    // todo: check output
    assert.end();
  } catch (ex) {
    assert.end(ex);
  }
});

test("add class and add script", async assert => {
  try {
    result = await testUtils.runCommand(myAppDir, qxCmdPath, "add", "class", "myapp.Window", "--extend=qx.core.Object", "--force");
    assert.ok(result.exitCode === 0, reportError(result));
    result = await testUtils.runCommand(myAppDir, qxCmdPath, "add", "script", "../jszip.js", "--rename=zip.js", "--noninteractive");
    assert.ok(result.exitCode === 0, reportError(result));
    fs.copyFileSync(path.join(testDir, "Application.js"), path.join(myAppDir, "source" , "class" , "myapp" , "Application.js"));
    result = await testUtils.runCompiler(myAppDir, "--clean");
    assert.ok(result.exitCode === 0, reportError(result));
    assert.ok(await assertPathExists(path.join(myAppDir, "compiled", "source", "myapp", "index.js")));
    result = await testUtils.runCommand(path.join(myAppDir, "compiled", "source", "myapp"), "node", "index.js");
    assert.ok(result.exitCode === 0, reportError(result));
    assert.end();
  } catch (ex) {
    assert.end(ex);
  }
});

