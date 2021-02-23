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

test("test version", async t => {
  try {
    await testUtils.deleteRecursive(myAppDir);
    let result = await testUtils.runCommand(testDir, qxCmdPath, "--version");
    t.ok(result.exitCode === 0, reportError(result));
    t.end();
  } catch (ex) {
    t.end(ex);
  }
});

test("create app", async t => {
  try {
    await testUtils.deleteRecursive(myAppDir);
    let result;
    result = await testUtils.runCommand(testDir, qxCmdPath, "create", "myapp", "-I", "--type=server", "-v");
    t.ok(result.exitCode === 0, reportError(result));
    t.ok(await assertPathExists(path.join(myAppDir, "compile.json")));
    result = await testUtils.runCompiler(myAppDir);
    t.ok(result.exitCode === 0, reportError(result));
    t.ok(await assertPathExists(path.join(myAppDir, "compiled", "source", "myapp", "index.js")));
    result = await testUtils.runCommand(path.join(myAppDir, "compiled", "source", "myapp"), "node", "index.js");
    t.ok(result.exitCode === 0, reportError(result));
    t.match(result.output, /Hello World!/);
    t.end();
  } catch (ex) {
    t.end(ex);
  }
});


test("qx package list", async t => {
  try {
    let result;
    result = await testUtils.runCommand(myAppDir, qxCmdPath, "package", "update", "-v");
    t.ok(result.exitCode === 0, reportError(result));
    result = await testUtils.runCommand(myAppDir, qxCmdPath, "package", "list", "-v");
    t.ok(result.exitCode === 0, reportError(result));
    result = await testUtils.runCommand(myAppDir, qxCmdPath, "package", "list", "--all", "--short", "--noheaders", "--match=qooxdoo/");
    t.ok(result.exitCode === 0, reportError(result));
    result = await testUtils.runCommand(myAppDir, qxCmdPath, "package", "list", "--json", "--installed");
    t.ok(result.exitCode === 0, reportError(result));
    result = await testUtils.runCommand(myAppDir, qxCmdPath, "package", "list", "--uris-only");
    t.ok(result.exitCode === 0, reportError(result));
    t.end();
  } catch (ex) {
    t.end(ex);
  }
});


test("install packages", async t => {
  try {
    let result;
    result = await testUtils.runCommand(myAppDir, qxCmdPath, "package", "list", "-v");
    t.ok(result.exitCode === 0, reportError(result));
    result = await testUtils.runCommand(myAppDir, qxCmdPath, "package", "install", "-v", "oetiker/UploadWidget", " --release v1.0.1");
    t.ok(result.exitCode === 0, reportError(result));
    result = await testUtils.runCommand(myAppDir, qxCmdPath, "package", "install", "-v", "qooxdoo/qxl.dialog@v3.0.0");
    t.ok(result.exitCode === 0, reportError(result));
    result = await testUtils.runCommand(myAppDir, qxCmdPath, "package", "install", "-v", "johnspackman/UploadMgr@v1.0.5");
    t.ok(result.exitCode === 0, reportError(result));
    result = await testUtils.runCommand(myAppDir, qxCmdPath, "package", "install", "-v", "ergobyte/qookery/qookeryace@0.7.0-pre");
    t.ok(result.exitCode === 0, reportError(result));
    result = await testUtils.runCompiler(myAppDir, "--clean");
    t.ok(result.exitCode === 0, reportError(result));
    t.ok(await assertPathExists(path.join(myAppDir, "compiled", "source", "myapp", "index.js")));
    result = await testUtils.runCommand(path.join(myAppDir, "compiled", "source", "myapp"), "node", "index.js");
    t.ok(result.exitCode === 0, reportError(result));
    t.match(result.output, /Hello World!/);
    t.end();
  } catch (ex) {
    t.end(ex);
  }
});

test("reinstall package", async t => {
  try {
    let result;
    result = await testUtils.runCommand(myAppDir, qxCmdPath, "clean", "-v");
    t.ok(result.exitCode === 0, reportError(result));t.ok(result.exitCode === 0, reportError(result));
    result = await testUtils.runCommand(myAppDir, qxCmdPath, "package", "install", "-v");
    t.ok(result.exitCode === 0, reportError(result));
    result = await testUtils.runCompiler(myAppDir, "--clean");
    t.ok(result.exitCode === 0, reportError(result));
    t.ok(await assertPathExists(path.join(myAppDir, "compiled", "source", "myapp", "index.js")));
    result = await testUtils.runCommand(path.join(myAppDir, "compiled", "source", "myapp"), "node", "index.js");
    t.ok(result.exitCode === 0, reportError(result));
    result = await testUtils.runCommand(myAppDir, qxCmdPath, "package", "list", "-isH");
    t.ok(result.exitCode === 0, reportError(result));
    // todo: check output
    t.end();
  } catch (ex) {
    t.end(ex);
  }
});

test("remove packages", async t => {
  try {
    let result;
    result = await testUtils.runCommand(myAppDir, qxCmdPath, "package", "remove", "oetiker/UploadWidget", "-v");
    t.ok(result.exitCode === 0, reportError(result));
    result = await testUtils.runCommand(myAppDir, qxCmdPath, "package", "remove", "ergobyte/qookery/qookeryace", "-v");
    t.ok(result.exitCode === 0, reportError(result));
    result = await testUtils.runCompiler(myAppDir, "--clean");
    t.ok(result.exitCode === 0, reportError(result));
    t.ok(await assertPathExists(path.join(myAppDir, "compiled", "source", "myapp", "index.js")));
    result = await testUtils.runCommand(path.join(myAppDir, "compiled", "source", "myapp"), "node", "index.js");
    t.ok(result.exitCode === 0, reportError(result));
    result = await testUtils.runCommand(myAppDir, qxCmdPath, "package", "list", "--installed", "--short", "--noheaders");
    t.ok(result.exitCode === 0, reportError(result));
    // todo check output: list should be empty
    t.end();
  } catch (ex) {
    t.end(ex);
  }
});

test("install without manifest", async t => {
  try {
    result = await testUtils.runCommand(myAppDir, qxCmdPath, "clean", "-v");
    t.ok(result.exitCode === 0, reportError(result));
    result = await testUtils.runCommand(myAppDir, qxCmdPath, "package", "install", "ergobyte/qookery@0.7.0-pre", "-v");
    t.ok(result.exitCode === 0, reportError(result));
    result = await testUtils.runCompiler(myAppDir, "--clean");
    t.ok(result.exitCode === 0, reportError(result));
    t.ok(await assertPathExists(path.join(myAppDir, "compiled", "source", "myapp", "index.js")));
    result = await testUtils.runCommand(path.join(myAppDir, "compiled", "source", "myapp"), "node", "index.js");
    t.ok(result.exitCode === 0, reportError(result));
    t.match(result.output, /Hello World!/);
    result = await testUtils.runCommand(myAppDir, qxCmdPath, "package", "list", "--installed", "--short", "--noheaders");
    t.ok(result.exitCode === 0, reportError(result));
    // todo: check output
    t.end();
  } catch (ex) {
    t.end(ex);
  }
});

test("add class and add script", async t => {
  try {
    result = await testUtils.runCommand(myAppDir, qxCmdPath, "add", "class", "myapp.Window", "--extend=qx.core.Object", "--force");
    t.ok(result.exitCode === 0, reportError(result));
    result = await testUtils.runCommand(myAppDir, qxCmdPath, "add", "script", "../jszip.js", "--rename=zip.js", "--noninteractive");
    t.ok(result.exitCode === 0, reportError(result));
    fs.copyFileSync(path.join(testDir, "Application.js"), path.join(myAppDir, "source" , "class" , "myapp" , "Application.js"));
    result = await testUtils.runCompiler(myAppDir, "--clean");
    t.ok(result.exitCode === 0, reportError(result));
    t.ok(await assertPathExists(path.join(myAppDir, "compiled", "source", "myapp", "index.js")));
    result = await testUtils.runCommand(path.join(myAppDir, "compiled", "source", "myapp"), "node", "index.js");
    t.ok(result.exitCode === 0, reportError(result));
    t.end();
  } catch (ex) {
    t.end(ex);
  }
});

