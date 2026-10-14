const { test } = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const kill = require("tree-kill");
const child_process = require("child_process");
const testUtils = require("../../../bin/tools/utils");
const fsPromises = require("fs").promises;
process.chdir(__dirname);


test("Multi-app compile generates per-app boot (#553)", async () => {
  try {
    await testUtils.deleteRecursive("test-issues/issue553/compiled");
    await testUtils.runCompiler("test-issues/issue553");
    assert.ok(fs.existsSync("test-issues/issue553/compiled/source/index.html"));
    let indexHtml = await fsPromises.readFile("test-issues/issue553/compiled/source/index.html", "utf8");
    assert.ok(!!indexHtml.match(/issue553one\/index.js/m));
  } catch(ex) {
    throw ex;
  }
});

test("--app-name compiles only the selected app (#553)", async () => {
  try {
    await testUtils.deleteRecursive("test-issues/issue553/compiled");
    await testUtils.runCompiler("test-issues/issue553", "--app-name=issue553two");
    assert.ok(!fs.existsSync("test-issues/issue553/compiled/source/index.html"));
    assert.ok(fs.existsSync("test-issues/issue553/compiled/source/issue553two/index.html"));
  }catch(ex) {
    throw ex;
  }
});

test("runCompiler collects machine-readable messages", async () => {
  await testUtils.deleteRecursive("test-issues/issue553/compiled");
  let result = await testUtils.runCompiler("test-issues/issue553", "--app-name=issue553two");
  let ids = result.messages.map(msg => msg.id);
  assert.ok(ids.includes("qx.tool.compiler.cli.compile.makeBegins"), "Missing makeBegins: " + result.output);
  assert.ok(ids.includes("qx.tool.compiler.cli.compile.makeEnds"), "Missing makeEnds: " + result.output);
  assert.ok(ids.includes("qx.tool.compiler.cli.compile.allDone"), "Missing allDone: " + result.output);
  let writing = result.messages.find(msg => msg.id == "qx.tool.compiler.cli.compile.writingApplication");
  assert.deepEqual(writing && writing.args, ["issue553two"], "Wrong writingApplication: " + result.output);
});

test("Node apps output index.js not index.html (#553)", async () => {
  try {
    await testUtils.deleteRecursive("test-issues/issue553_node/compiled");
    await testUtils.runCompiler("test-issues/issue553_node");
    assert.ok(!fs.existsSync("test-issues/issue553_node/compiled/source/index.html"));
    assert.ok(!fs.existsSync("test-issues/issue553_node/compiled/source/index.js"));
    assert.ok(fs.existsSync("test-issues/issue553_node/compiled/source/issue553one/index.js"));
    let index = await fsPromises.readFile("test-issues/issue553_node/compiled/source/issue553one/index.js", "utf8");
    assert.ok(!!index.match(/require\(/m));
    assert.ok(!fs.existsSync("test-issues/issue553_node/compiled/source/issue553one/index.html"));
    assert.ok(fs.existsSync("test-issues/issue553_node/compiled/source/issue553two/index.js"));
    assert.ok(!fs.existsSync("test-issues/issue553_node/compiled/source/issue553two/index.html"));
  }catch(ex) {
    throw ex;
  }
});

test("Dynamic commands", async () => {
  try {
    await testUtils.deleteRecursive("test-issues/testdynamic/compiled");
    let result = await testUtils.runCommand("test-issues/testdynamic", testUtils.getCompiler(), "testlib", "hello", "-t=4");
    assert.ok(result.output.match(/The commmand testlib; message=hello, type=4/));
  }catch(ex) {
    throw ex;
  }
});

test("Dynamic parameter", async () => {
  try {
    // Test a simple dynamic command with just one parameter
    let result = await testUtils.runCommand("test-issues/testdynamicparameter", testUtils.getCompiler(), "compile", "--help");
    assert.ok(result.exitCode === 0, "Simple command should execute successfully");
    assert.ok(result.output.match(/A simple compiler flag/), "Should show correct output with parameter value");
    result = await testUtils.runCommand("test-issues/testdynamicparameter", testUtils.getCompiler(), "compile", "--simple", "--verbose");
    assert.ok(result.exitCode === 0, "Simple command should execute successfully");
  }catch(ex) {
    throw ex;
  }
});

test("Compile errors and --warn-as-error set the exit code (#440)", async () => {
  try {
    await testUtils.deleteRecursive("test-issues/issue440/compiled");
    let code = await fsPromises.readFile("test-issues/issue440/source/class/issue440/Application.js", "utf8");
    code = code.split("\n");
    let errorLine = -1;
    code.forEach((line, index) => {
      if (line.match(/This is an error/i))
        errorLine = index;
    });
    let result;
    code[errorLine] = "This is an error";
    await fsPromises.writeFile("test-issues/issue440/source/class/issue440/Application.js", code.join("\n"), "utf8");
    result = await testUtils.runCompiler("test-issues/issue440");
    assert.ok(result.exitCode === 1);

    code[errorLine] = "new abc.ClassNoDef(); //This is an error";    
    await fsPromises.writeFile("test-issues/issue440/source/class/issue440/Application.js", code.join("\n"), "utf8");
    result = await testUtils.runCompiler("test-issues/issue440", "--warnAsError");
    assert.ok(result.exitCode === 1);

    code[errorLine] = "new abc.ClassNoDef(); //This is an error";
    await fsPromises.writeFile("test-issues/issue440/source/class/issue440/Application.js", code.join("\n"), "utf8");
    result = await testUtils.runCompiler("test-issues/issue440");
    assert.ok(result.exitCode === 0);

    code[errorLine] = "//This is an error";
    await fsPromises.writeFile("test-issues/issue440/source/class/issue440/Application.js", code.join("\n"), "utf8");
    result = await testUtils.runCompiler("test-issues/issue440");
    assert.ok(result.exitCode === 0);
  }catch(ex) {
    throw ex;
  }
});

test("testLegalSCSS", async () => {
  try {
    let result;
    await testUtils.deleteRecursive("test-issues/testLegalSCSS/compiled");
    result = await testUtils.runCompiler("test-issues/testLegalSCSS");
    assert.ok(result.exitCode === 0);
    assert.ok(fs.existsSync("test-issues/testLegalSCSS/compiled/source/resource/testLegalSCSS/css/test_css.css"));
    assert.ok(fs.existsSync("test-issues/testLegalSCSS/compiled/source/resource/testLegalSCSS/css/test_scss.css"));
    assert.ok(fs.existsSync("test-issues/testLegalSCSS/compiled/source/resource/testLegalSCSS/css/test_theme_scss.css"));
    assert.ok(fs.existsSync("test-issues/testLegalSCSS/compiled/source/testLegalSCSS/index.js"));
    let bootJS = await fsPromises.readFile("test-issues/testLegalSCSS/compiled/source/testLegalSCSS/index.js", "utf8");
    let pos1 = bootJS.indexOf("cssBefore");
    let pos2 = bootJS.indexOf("]", pos1 + 1);
    let test = bootJS.substring(pos1, pos2 + 1);
    assert.ok(test.indexOf("testLegalSCSS/css/test_css.css") > 0);
    assert.ok(test.indexOf("testLegalSCSS/css/test_scss.css") > 0);
    assert.ok(test.indexOf("testLegalSCSS/css/test_theme_scss.css") > 0);
  }catch(ex) {
    throw ex;
  }
});

test("Private members are mangled in build output (#715)", async () => {
  try {
    await testUtils.deleteRecursive("test-issues/issue715/compiled");
    await testUtils.runCompiler("test-issues/issue715", "--target=build", "--minify=off");
    assert.ok(fs.existsSync("test-issues/issue715/compiled/build/transpiled/issue715/Application.js"));
    let str = await fsPromises.readFile("test-issues/issue715/compiled/build/transpiled/issue715/Application.js", "utf8");
    assert.ok(!str.match(/__privateOne\b/m));
    assert.ok(!!str.match(/__privateTwo/m));
    assert.ok(!str.match(/__applyMyProp\b/m));
    assert.ok(!str.match(/__privateStaticOne\b/m));
    assert.ok(!!str.match(/__privateStaticTwo/m));
  }catch(ex) {
    throw ex;
  }
});

test("Warns about nonexistent classes (#10407)", async () => {
  try {
    await testUtils.deleteRecursive("test-issues/issue10407/compiled");

    // Test 1: Compile without --warnAsError should succeed but produce warnings
    let result = await testUtils.runCompiler("test-issues/issue10407");
    assert.ok(result.exitCode === 0, "Compilation without --warnAsError should succeed");

    // Check for warnings about nonexistent classes
    // The compiler should warn about: qx.dddd.eeekeje, qx.ui.NonExistentWidget,
    // qx.core.ThisClassDoesNotExist, qx.util.NonExistentUtil, qx.ddde.eee
    assert.ok(
      result.error.match(/qx\.dddd\.eeekeje|qx\.dddd/i) ||
      result.error.match(/unresolved/i) ||
      result.error.match(/cannot find/i) ||
      result.error.match(/not found/i),
      "Should warn about nonexistent class qx.dddd.eeekeje"
    );

    // Check specifically for qx.ddde.eee (Test Case 5)
    assert.ok(
      result.error.match(/qx\.ddde\.eee/i) ||
      result.error.match(/qx\.ddde/i),
      "Should warn about nonexistent class qx.ddde.eee"
    );

  }catch(ex) {
    throw ex;
  }
});

test("--warn-as-error fails on unresolved classes (#10407)", async () => {
  try {
    await testUtils.deleteRecursive("test-issues/issue10407/compiled");

    // Test 2: Compile with --warnAsError should fail
    let result = await testUtils.runCompiler("test-issues/issue10407", "--warnAsError");
    assert.ok(result.exitCode !== 0, "Compilation with --warnAsError should fail when there are unresolved symbols");

  }catch(ex) {
    throw ex;
  }
});

const WATCH_APP_FILE = "test-issues/issue10407-watch/source/class/issue10407watch/Application.js";
const WATCH_CLEAN_MARKER = "// This application starts clean without errors.";

/**
 * Runs `qx compile --watch` in the issue10407-watch fixture, calls `modify` once the watcher
 * has started and waits until the output matches `expected`. `modify` gets a function
 * `waitFor(match, what)` to wait for output of its own between its changes.
 *
 * It waits for the expected message itself and not for "All applications ready.", because that
 * is also printed for a batch of changes which needs no compile (eg a new class file which is
 * picked up before the edit that uses it). The watcher is killed and has exited before this
 * returns, so that the next test can delete its output directory (Windows keeps files locked
 * until the process is gone).
 */
async function watchUntil(modify, expected) {
  await testUtils.deleteRecursive("test-issues/issue10407-watch/compiled");
  let watchProcess = child_process.spawn(testUtils.getCompiler(), ["compile", "--watch"], {
    cwd: "test-issues/issue10407-watch",
    shell: true
  });
  let exited = new Promise(resolve => watchProcess.on("close", resolve));
  let output = "";
  let waiting = null;
  const onData = data => {
    console.log(data.toString().trim());
    output += data.toString();
    if (waiting && waiting.match.test(output)) {
      waiting.resolve();
    }
  };
  watchProcess.stdout.on("data", onData);
  watchProcess.stderr.on("data", onData);
  const waitFor = (match, what) =>
    new Promise((resolve, reject) => {
      let timer = setTimeout(() => reject(new Error(`${what} within 120s: ${output}`)), 120000);
      exited.then(code => reject(new Error(`qx compile --watch exited with ${code}: ${output}`)));
      waiting = {
        match,
        resolve() {
          clearTimeout(timer);
          waiting = null;
          resolve();
        }
      };
      if (match.test(output)) {
        waiting.resolve();
      }
    });

  try {
    await waitFor(/Start watching/, "Watch mode did not start");
    // Give the file watchers a moment to settle
    await new Promise(resolve => setTimeout(resolve, 2000));
    await modify(waitFor);
    await waitFor(expected, "Watch mode did not report " + expected);
  } finally {
    await new Promise(resolve => kill(watchProcess.pid, "SIGKILL", resolve));
    await exited;
  }
}

test("Watch detects unresolved classes in new files (#10407)", async () => {
  const newClassPath = "test-issues/issue10407-watch/source/class/issue10407watch/WatchTestClass.js";
  let appContent = await fsPromises.readFile(WATCH_APP_FILE, "utf8");
  try {
    await watchUntil(async () => {
      // Create a new file with nonexistent class reference
      await fsPromises.writeFile(
        newClassPath,
        `/* Test class for watch mode */
qx.Class.define("issue10407watch.WatchTestClass", {
  extend: qx.core.Object,

  members: {
    testMethod: function() {
      // This should trigger a warning for unresolved symbol
      var obj = new qx.nonexistent.WatchModeTestClass();
      return obj;
    }
  }
});
`,
        "utf8"
      );

      // Also modify Application.js to reference the new class so it gets compiled
      await fsPromises.writeFile(
        WATCH_APP_FILE,
        appContent.replace(WATCH_CLEAN_MARKER, WATCH_CLEAN_MARKER + "\n      var testClass = new issue10407watch.WatchTestClass();"),
        "utf8"
      );
    }, /qx\.nonexistent\.WatchModeTestClass/);
  } finally {
    await fsPromises.writeFile(WATCH_APP_FILE, appContent, "utf8");
    await testUtils.safeDelete(newClassPath);
  }
});

test("Watch compiles a new class when the file using it is saved first (#10407)", async () => {
  const newClassPath = "test-issues/issue10407-watch/source/class/issue10407watch/WatchTestClass.js";
  let appContent = await fsPromises.readFile(WATCH_APP_FILE, "utf8");
  try {
    await watchUntil(async waitFor => {
      await fsPromises.writeFile(
        WATCH_APP_FILE,
        appContent.replace(WATCH_CLEAN_MARKER, WATCH_CLEAN_MARKER + "\n      var testClass = new issue10407watch.WatchTestClass();"),
        "utf8"
      );
      await waitFor(/Unresolved use of symbol issue10407watch\.WatchTestClass/, "Watch mode did not compile Application.js");
      await fsPromises.writeFile(
        newClassPath,
        `qx.Class.define("issue10407watch.WatchTestClass", {
  extend: qx.core.Object,

  members: {
    testMethod: function() {
      return new qx.nonexistent.WatchModeTestClass();
    }
  }
});
`,
        "utf8"
      );
    }, /qx\.nonexistent\.WatchModeTestClass/);
  } finally {
    await fsPromises.writeFile(WATCH_APP_FILE, appContent, "utf8");
    await testUtils.safeDelete(newClassPath);
  }
});

test("Watch detects unresolved classes in modified files (#10407)", async () => {
  let appContent = await fsPromises.readFile(WATCH_APP_FILE, "utf8");
  try {
    await watchUntil(async () => {
      // Modify existing file to add a new unresolved class reference
      await fsPromises.writeFile(
        WATCH_APP_FILE,
        appContent.replace(WATCH_CLEAN_MARKER, WATCH_CLEAN_MARKER + "\n      var watchObj = new qx.watch.ModifiedFileTestClass();"),
        "utf8"
      );
    }, /qx\.watch\.ModifiedFileTestClass/);
  } finally {
    await fsPromises.writeFile(WATCH_APP_FILE, appContent, "utf8");
  }
});

test("afterProcessFinished callback", async () => {
  try {
    const markerFile = "test-issues/test-afterProcessFinished/afterProcessFinished.marker";

    // Delete marker file if it exists
    if (fs.existsSync(markerFile)) {
      await fsPromises.unlink(markerFile);
    }

    await testUtils.deleteRecursive("test-issues/test-afterProcessFinished/compiled");
    await testUtils.runCompiler("test-issues/test-afterProcessFinished");

    // Check that the marker file was created
    assert.ok(fs.existsSync(markerFile), "afterProcessFinished should create marker file");

    // Check the content of the marker file
    const content = await fsPromises.readFile(markerFile, "utf8");
    assert.ok(content.includes("qx.tool.compiler.cli.commands.Compile"),
      "Marker should contain command classname");

    // Cleanup
    if (fs.existsSync(markerFile)) {
      await fsPromises.unlink(markerFile);
    }

  } catch(ex) {
    throw ex;
  }
});

test("Object.values is not polyfilled for modern node targets (#692)", async () => {
  try {
    await testUtils.deleteRecursive("test-issues/issue692/compiled");
    let result = await testUtils.runCompiler("test-issues/issue692");
    assert.ok(result.exitCode === 0, "Compilation should succeed");

    // Run the compiled node application: its main() asserts that Object.values is the
    // native implementation (not a `for (var ...)` polyfill) and prints "OK" on success.
    let run = await testUtils.runCommand("test-issues/issue692", "node", "compiled/source/issue692/index.js");
    assert.ok(run.exitCode === 0, "The compiled node app should run without an assertion error");
    assert.ok(run.output.match(/OK/), "The compiled node app should print OK (Object.values must not be polyfilled)");
  } catch(ex) {
    throw ex;
  }
});

/**
 * Runs `qx test` in the testListenerError fixture and checks that it fails and
 * reports the error of the listener selected by `failIn`
 */
async function testListenerFailure(failIn) {
  await testUtils.deleteRecursive("test-issues/testListenerError/compiled");
  let testProcess = child_process.spawn(testUtils.getCompiler(), ["test", "--listen-port=18979"], {
    cwd: "test-issues/testListenerError",
    env: { ...process.env, FAIL_IN: failIn },
    shell: true
  });
  let output = "";
  testProcess.stdout.on("data", data => (output += data.toString()));
  testProcess.stderr.on("data", data => (output += data.toString()));
  let timer;
  try {
    let exitCode = await new Promise(resolve => {
      testProcess.on("close", resolve);
      timer = setTimeout(() => resolve("timeout"), 120000);
    });
    assert.notEqual(exitCode, "timeout", "qx test did not exit within 120s: " + output);
    assert.notEqual(exitCode, 0, "qx test must fail: " + output);
    assert.ok(output.includes(`Error while running tests: Error: ${failIn} listener failed`), "Should report the error: " + output);
  } finally {
    clearTimeout(timer);
    kill(testProcess.pid, "SIGKILL");
  }
}

test("qx test exits with an error when a runTests listener fails", async () => {
  await testListenerFailure("runTests");
});

test("qx test exits with an error when an afterStart listener fails", async () => {
  await testListenerFailure("afterStart");
});

test("qx test waits for a slow afterStart listener added after its own and reports its error", async () => {
  await testListenerFailure("lateAfterStart");
});

test("qx serve reports a failing afterStart listener and keeps serving", async () => {
  await testUtils.deleteRecursive("test-issues/testListenerError/compiled");
  let serveProcess = child_process.spawn(testUtils.getCompiler(), ["serve", "--listen-port=18980"], {
    cwd: "test-issues/testListenerError",
    env: { ...process.env, FAIL_IN: "afterStart" },
    shell: true
  });
  let output = "";
  let timer;
  try {
    await new Promise((resolve, reject) => {
      let onData = data => {
        output += data.toString();
        if (output.includes("afterStart listener failed")) {
          resolve();
        }
      };
      serveProcess.stdout.on("data", onData);
      serveProcess.stderr.on("data", onData);
      serveProcess.on("close", code => reject(new Error(`qx serve exited with ${code}: ${output}`)));
      timer = setTimeout(() => reject(new Error("qx serve did not report the error within 120s: " + output)), 120000);
    });
    let response = await fetch("http://localhost:18980/");
    assert.equal(response.status, 200, "qx serve should keep serving");
  } finally {
    clearTimeout(timer);
    kill(serveProcess.pid, "SIGKILL");
  }
});
test("Unknown font does not drop the fonts after it", async () => {
  await testUtils.deleteRecursive("test-issues/unknownFont/compiled");
  let result = await testUtils.runCompiler("test-issues/unknownFont");
  let allOutput = result.output + result.error;
  assert.ok(result.exitCode === 0, "Compile should succeed: " + allOutput);
  assert.ok(allOutput.includes("Cannot find font with name NoSuchFont"), "Should report the unknown font: " + allOutput);
  let indexJs = await fsPromises.readFile("test-issues/unknownFont/compiled/source/unknownfont/index.js", "utf8");
  assert.ok(indexJs.includes("fontBootstrap['JosefinSlab']"), "Font after the unknown one is missing");
  assert.ok(!indexJs.includes("fontBootstrap['NoSuchFont']"), "Unknown font must not be added");
});

