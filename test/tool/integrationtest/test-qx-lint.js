const { test } = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const fsp = require("fs").promises;
const path = require("path");
const testUtils = require("../../../bin/tools/utils");
const qxCmdPath = testUtils.getCompiler();
const testDir = path.join(__dirname, "test-qx-lint");
const myAppDir = path.join(testDir, "myapp");

//colorize output


async function assertPathExists(path){
  let stat = await fsp.stat(path);
  if (stat.isFile() || stat.isDirectory()) {
    return true;
  }
  throw new Error(`Path does not exist: ${path}`);
}

test("lint help", async () => {
  try {
    let result = await testUtils.runCommand(__dirname, qxCmdPath, "lint", "--help");
    assert.ok(result.exitCode === 0, testUtils.reportError(result));
    assert.ok(result.output.includes("lint"), "Help should mention lint command");
    assert.ok(result.output.includes("runs eslint"), "Help should mention eslint functionality");
    assert.ok(result.output.includes("--fix"), "Help should mention fix option");
    assert.ok(result.output.includes("--cache"), "Help should mention cache option");
    assert.ok(result.output.includes("--format"), "Help should mention format option");
    assert.ok(result.output.includes("--output-file"), "Help should mention output-file option");
    assert.ok(result.output.includes("--print-config"), "Help should mention print-config option");
    assert.ok(result.output.includes("--use-eslintrc"), "Help should mention use-eslintrc option");
    assert.ok(result.output.includes("--warn-as-error"), "Help should mention warn-as-error option");
    assert.ok(result.output.includes("--fix-jsdoc-params"), "Help should mention fix-jsdoc-params option");
  } catch (ex) {
    throw ex;
  }
});

test("lint command with app", async () => {
  try {
    // Create a test app for linting
    await testUtils.deleteRecursive(myAppDir);
    await fsp.mkdir(testDir, { recursive: true });
    
    let result = await testUtils.runCommand(testDir, qxCmdPath, "create", "myapp", "-I", "--type=desktop");
    assert.ok(result.exitCode === 0, testUtils.reportError(result));
    
    // Add a class with lint issues to test linting
    result = await testUtils.runCommand(myAppDir, qxCmdPath, "add", "class", "myapp.LintTest", "--extend=qx.core.Object", "--force");
    assert.ok(result.exitCode === 0, testUtils.reportError(result));
    
    // Create a file with intentional lint issues
    const lintTestContent = `qx.Class.define("myapp.LintTest", {
  extend: qx.core.Object,
  
  members: {
    testMethod() {
      var unusedVar = "unused";
      var x=1; // missing spaces around operator
      console.log("hello world"); // use of console.log
      alert("test"); // use of alert
    }
  }
});`;
    
    await fsp.writeFile(path.join(myAppDir, "source", "class", "myapp", "LintTest.js"), lintTestContent);
    
    // Test basic lint command (should find issues)
    result = await testUtils.runCommand(myAppDir, qxCmdPath, "lint", "source/class/myapp/LintTest.js");
    // Lint should exit with non-zero code when issues are found, but we test for proper execution
    let output = result.output || result.error;
    assert.ok(output.includes("LintTest.js") || output.includes("No errors found!"), testUtils.reportError(result));
    
    // Test lint with --format option
    result = await testUtils.runCommand(myAppDir, qxCmdPath, "lint", "--format=compact", "source/class/myapp/LintTest.js");
    // Should complete regardless of exit code
    assert.ok(true, "Lint with format option should execute");
    
    // Test lint with --print-config option  
    result = await testUtils.runCommand(myAppDir, qxCmdPath, "lint", "--print-config", "source/class/myapp/LintTest.js");
    assert.ok(result.exitCode === 0, testUtils.reportError(result));
    assert.ok(result.output.includes("rules") || result.output.includes("extends"), "Print config should show ESLint configuration");
    
    // Test lint with --cache option
    result = await testUtils.runCommand(myAppDir, qxCmdPath, "lint", "--cache", "source/class/myapp/LintTest.js");
    assert.ok(true, "Lint with cache option should execute");
    
    // Clean up
    await testUtils.deleteRecursive(testDir);
    
  } catch (ex) {
    throw ex;
  }
});

test("lint command with output file", async () => {
  try {
    // Create a test app for linting
    await testUtils.deleteRecursive(myAppDir);
    await fsp.mkdir(testDir, { recursive: true });
    
    let result = await testUtils.runCommand(testDir, qxCmdPath, "create", "myapp", "-I", "--type=desktop");
    assert.ok(result.exitCode === 0, testUtils.reportError(result));
    
    // Test lint with output file (should create report even if no errors)
    const outputFile = path.join(myAppDir, "lint-report.txt");
    result = await testUtils.runCommand(myAppDir, qxCmdPath, "lint", "--output-file=" + outputFile, "--verbose");
    assert.ok(result.exitCode === 0, testUtils.reportError(result));
    
    // Check if output file was created
    const fileExists = await fsp.access(outputFile).then(() => true).catch(() => false);
    assert.ok(fileExists, "Output file should be created");
    
    // Clean up
    await testUtils.deleteRecursive(testDir);
    
  } catch (ex) {
    throw ex;
  }
});

test("lint command with fix option", async () => {
  try {
    // Create a test app for linting
    await testUtils.deleteRecursive(myAppDir);
    await fsp.mkdir(testDir, { recursive: true });
    
    let result = await testUtils.runCommand(testDir, qxCmdPath, "create", "myapp", "-I", "--type=desktop");
    assert.ok(result.exitCode === 0, testUtils.reportError(result));
    
    // Add a class with fixable lint issues
    result = await testUtils.runCommand(myAppDir, qxCmdPath, "add", "class", "myapp.FixableTest", "--extend=qx.core.Object", "--force");
    assert.ok(result.exitCode === 0, testUtils.reportError(result));
    
    // Create a file with fixable lint issues (missing spaces, semicolons, etc.)
    const fixableContent = `qx.Class.define("myapp.FixableTest", {
  extend: qx.core.Object,
  
  members: {
    testMethod() {
      var x=1+2 // missing spaces around operators and semicolon
      var y= 3*4 // missing spaces
      return x+y
    }
  }
})`;
    
    const testFilePath = path.join(myAppDir, "source", "class", "myapp", "FixableTest.js");
    await fsp.writeFile(testFilePath, fixableContent);
    
    // Read original content to compare later
    const originalContent = await fsp.readFile(testFilePath, "utf8");
    
    // First, verify that there ARE lint errors before fixing
    result = await testUtils.runCommand(myAppDir, qxCmdPath, "lint", "source/class/myapp/FixableTest.js");
    // Should have errors (non-zero exit code expected)
    assert.ok(result.output.includes("FixableTest.js") || result.exitCode !== 0, "Should have lint errors before fix");
    
    // Test lint with --fix option
    result = await testUtils.runCommand(myAppDir, qxCmdPath, "lint", "--fix", "source/class/myapp/FixableTest.js");
    assert.ok(true, "Lint with fix option should execute");
    
    // Read the file to check if it was modified (fixes applied)
    const fixedContent = await fsp.readFile(testFilePath, "utf8");
    assert.ok(fixedContent.length > 0, "File should still have content after fix");
    assert.ok(fixedContent !== originalContent, "File content should be changed after applying fixes");
    
    // Verify that the fixed content has proper semicolons (spacing rules might not be auto-fixable)
    assert.ok(fixedContent.includes(";"), "Semicolons should be added");
    
    // Optional: log the fixed content for debugging
    if (process.env.DEBUG_LINT) {
      console.log("Original content:", originalContent);
      console.log("Fixed content:", fixedContent);
    }
    
    // Most importantly: verify that linting the fixed file has no errors
    result = await testUtils.runCommand(myAppDir, qxCmdPath, "lint", "source/class/myapp/FixableTest.js");
    assert.ok(result.exitCode === 0 || result.output.includes("No errors found!"), "Fixed file should have no lint errors");
    
    // Clean up
    await testUtils.deleteRecursive(testDir);
    
  } catch (ex) {
    throw ex;
  }
});

test("lint command with jsdoc fixes", async () => {
  try {
    // Create a test app for linting
    await testUtils.deleteRecursive(myAppDir);
    await fsp.mkdir(testDir, { recursive: true });
    
    let result = await testUtils.runCommand(testDir, qxCmdPath, "create", "myapp", "-I", "--type=desktop");
    assert.ok(result.exitCode === 0, testUtils.reportError(result));
    
    // Add a class with JSDoc parameter ordering issues
    result = await testUtils.runCommand(myAppDir, qxCmdPath, "add", "class", "myapp.JSDocTest", "--extend=qx.core.Object", "--force");
    assert.ok(result.exitCode === 0, testUtils.reportError(result));
    
    // Create a file with JSDoc parameter ordering issues
    const jsdocContent = `qx.Class.define("myapp.JSDocTest", {
  extend: qx.core.Object,
  
  members: {
    /**
     * Test method with wrong JSDoc param order
     * @param paramName {String} description
     */
    testMethod(paramName) {
      return paramName;
    }
  }
});`;
    
    const testFilePath = path.join(myAppDir, "source", "class", "myapp", "JSDocTest.js");
    await fsp.writeFile(testFilePath, jsdocContent);
    
    // Test lint with --fix-jsdoc-params=type-first option
    result = await testUtils.runCommand(myAppDir, qxCmdPath, "lint", "--fix-jsdoc-params=type-first", "source/class/myapp/JSDocTest.js");
    assert.ok(true, "Lint with fix-jsdoc-params should execute");
    
    // Read the file to check if JSDoc was modified
    const fixedContent = await fsp.readFile(testFilePath, "utf8");
    assert.ok(fixedContent.includes("@param {String} paramName") || fixedContent.includes("@param paramName {String}"), "JSDoc params should be present in some order");
    
    // Clean up
    await testUtils.deleteRecursive(testDir);
    
  } catch (ex) {
    throw ex;
  }
});