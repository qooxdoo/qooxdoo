const test = require("tape");
const fs = require("fs");
const kill = require("tree-kill");
const child_process = require("child_process");
const testUtils = require("../../../bin/tools/utils");
const fsPromises = testUtils.fsPromises;
process.chdir(__dirname);


test("Issue553", async assert => {
  try {
    await testUtils.deleteRecursive("test-issues/issue553/compiled");
    await testUtils.runCompiler("test-issues/issue553");
    assert.ok(fs.existsSync("test-issues/issue553/compiled/source/index.html"));
    let indexHtml = await fsPromises.readFile("test-issues/issue553/compiled/source/index.html", "utf8");
    assert.ok(!!indexHtml.match(/issue553one\/index.js/m));
    assert.end();
  } catch(ex) {
    assert.end(ex);
  }
});

test("Issue553 single app", async assert => {
  try {
    await testUtils.deleteRecursive("test-issues/issue553/compiled");
    await testUtils.runCompiler("test-issues/issue553", "--app-name=issue553two");
    assert.ok(!fs.existsSync("test-issues/issue553/compiled/source/index.html"));
    assert.ok(fs.existsSync("test-issues/issue553/compiled/source/issue553two/index.html"));
    assert.end();
  }catch(ex) {
    assert.end(ex);
  }
});

test("Issue553 Node", async assert => {
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
    assert.end();
  }catch(ex) {
    assert.end(ex);
  }
});

test("Dynamic commands", async assert => {
  try {
    await testUtils.deleteRecursive("test-issues/testdynamic/compiled");
    let result = await testUtils.runCommand("test-issues/testdynamic", testUtils.getCompiler(), "testlib", "hello", "-t=4");
    assert.ok(result.output.match(/The commmand testlib; message=hello, type=4/));
    assert.end();
  }catch(ex) {
    assert.end(ex);
  }
});

test("Dynamic parameter", async assert => {
  try {
    // Test a simple dynamic command with just one parameter
    let result = await testUtils.runCommand("test-issues/testdynamicparameter", testUtils.getCompiler(), "compile", "--help");
    assert.ok(result.exitCode === 0, "Simple command should execute successfully");
    assert.ok(result.output.match(/A simple compiler flag/), "Should show correct output with parameter value");
    result = await testUtils.runCommand("test-issues/testdynamicparameter", testUtils.getCompiler(), "compile", "--simple", "--verbose");
    assert.ok(result.exitCode === 0, "Simple command should execute successfully");
    assert.end();
  }catch(ex) {
    assert.end(ex);
  }
});

test("Issue440", async assert => {
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
    assert.end();
  }catch(ex) {
    assert.end(ex);
  }
});

test("testLegalSCSS", async assert => {
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
    assert.end();
  }catch(ex) {
    assert.end(ex);
  }
});

test("Issue715", async assert => {
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
    assert.end();
  }catch(ex) {
    assert.end(ex);
  }
});

test("Issue10407 - Compiler should warn about nonexistent classes", async assert => {
  try {
    await testUtils.deleteRecursive("test-issues/issue10407/compiled");

    // Test 1: Compile without --warnAsError should succeed but produce warnings
    let result = await testUtils.runCompiler("test-issues/issue10407");
    assert.ok(result.exitCode === 0, "Compilation without --warnAsError should succeed");

    // Check for warnings about nonexistent classes
    // The compiler should warn about: qx.dddd.eeekeje, qx.ui.NonExistentWidget,
    // qx.core.ThisClassDoesNotExist, qx.util.NonExistentUtil
    assert.ok(
      result.error.match(/qx\.dddd\.eeekeje|qx\.dddd/i) ||
      result.error.match(/unresolved/i) ||
      result.error.match(/cannot find/i) ||
      result.error.match(/not found/i),
      "Should warn about nonexistent class qx.dddd.eeekeje"
    );

    assert.end();
  }catch(ex) {
    assert.end(ex);
  }
});

test("Issue10407 - Compiler should fail with --warnAsError", async assert => {
  try {
    await testUtils.deleteRecursive("test-issues/issue10407/compiled");

    // Test 2: Compile with --warnAsError should fail
    let result = await testUtils.runCompiler("test-issues/issue10407", "--warnAsError");
    assert.ok(result.exitCode !== 0, "Compilation with --warnAsError should fail when there are unresolved symbols");

    assert.end();
  }catch(ex) {
    assert.end(ex);
  }
});

test("Issue10407 - Watch mode should detect new unresolved classes in new files", async assert => {
  const newClassPath = "test-issues/issue10407-watch/source/class/issue10407watch/WatchTestClass.js";

  try {
    await testUtils.deleteRecursive("test-issues/issue10407-watch/compiled");

    // Start watch mode in background
    let watchProcess = child_process.spawn(testUtils.getCompiler(),
      ["compile", "--watch", "--machine-readable"],
      {
        cwd: "test-issues/issue10407-watch",
        shell: true
      }
    );

    let output = "";
    let errorOutput = "";

    watchProcess.stdout.on('data', (data) => {
      data = data.toString().trim();
      console.log(data);
      output += data;
    });

    watchProcess.stderr.on('data', (data) => {
      data = data.toString().trim();
      console.error(data);
      errorOutput += data;
    });

    // Wait for initial compilation to complete
    await new Promise(resolve => setTimeout(resolve, 16000));

    // Create a new file with nonexistent class reference
    const newClassContent = `/* Test class for watch mode */
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
`;

    await fsPromises.writeFile(newClassPath, newClassContent, "utf8");

    // Wait for watch to detect change and recompile
    await new Promise(resolve => setTimeout(resolve, 8000));

    // Kill watch process
    kill(watchProcess.pid, 'SIGKILL');

    // Give it time to cleanup
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check output for warning about the new unresolved class
    const combinedOutput = output + errorOutput;
    assert.ok(
      combinedOutput.match(/unresolved.*qx\.nonexistent\.WatchModeTestClass/i) ||
      combinedOutput.match(/qx\.nonexistent\.WatchModeTestClass/i),
      "Watch mode should warn about newly added unresolved class in new file"
    );

    // Cleanup: remove the test file
    if (fs.existsSync(newClassPath)) {
      await fsPromises.unlink(newClassPath);
    }

    assert.end();
  } catch(ex) {
    // Cleanup on error
    if (fs.existsSync(newClassPath)) {
      try {
        await fsPromises.unlink(newClassPath);
      } catch(cleanupEx) {
        // Ignore cleanup errors
      }
    }
    assert.end(ex);
  }
});

test("Issue10407 - Watch mode should detect unresolved classes in modified files", async assert => {
  const appFilePath = "test-issues/issue10407-watch/source/class/issue10407watch/Application.js";
  let originalContent = "";

  try {
    await testUtils.deleteRecursive("test-issues/issue10407-watch/compiled");

    // Read original file content
    originalContent = await fsPromises.readFile(appFilePath, "utf8");

    // Start watch mode in background
    let watchProcess = child_process.spawn(testUtils.getCompiler(),
      ["compile", "--watch", "--machine-readable"],
      {
        cwd: "test-issues/issue10407-watch",
        shell: true
      }
    );

    let output = "";
    let errorOutput = "";

    watchProcess.stdout.on('data', (data) => {
      data = data.toString().trim();
      console.log(data);
      output += data;
    });

    watchProcess.stderr.on('data', (data) => {
      data = data.toString().trim();
      console.error(data);
      errorOutput += data;
    });

    // Wait for initial compilation to complete
    await new Promise(resolve => setTimeout(resolve, 16000));

    // Modify existing file to add a new unresolved class reference
    const modifiedContent = originalContent.replace(
      '// This application starts clean without errors.',
      '// This application starts clean without errors.\n      var watchObj = new qx.watch.ModifiedFileTestClass();'
    );

    await fsPromises.writeFile(appFilePath, modifiedContent, "utf8");

    // Wait for watch to detect change and recompile
    await new Promise(resolve => setTimeout(resolve, 8000));

    // Kill watch process
    kill(watchProcess.pid, 'SIGKILL');

    // Give it time to cleanup
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Restore original file
    await fsPromises.writeFile(appFilePath, originalContent, "utf8");

    // Check output for warning about the new unresolved class
    const combinedOutput = output + errorOutput;
    assert.ok(
      combinedOutput.match(/unresolved.*qx\.watch\.ModifiedFileTestClass/i) ||
      combinedOutput.match(/qx\.watch\.ModifiedFileTestClass/i),
      "Watch mode should warn about unresolved class in modified file"
    );

    assert.end();
  } catch(ex) {
    // Restore original file on error
    if (originalContent) {
      try {
        await fsPromises.writeFile(appFilePath, originalContent, "utf8");
      } catch(cleanupEx) {
        // Ignore cleanup errors
      }
    }
    assert.end(ex);
  }
});


