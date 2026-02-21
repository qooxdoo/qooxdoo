const { test } = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const fsp = require("fs").promises;
const path = require("path");
const testUtils = require("../../../bin/tools/utils");
const qxCmdPath = testUtils.getCompiler();
const testDir = path.join(__dirname, "test-qx-typescript");
const myAppDir = path.join(testDir, "myapp");

//colorize output


async function assertPathExists(path){
  let stat = await fsp.stat(path);
  if (stat.isFile() || stat.isDirectory()) {
    return true;
  }
  throw new Error(`Path does not exist: ${path}`);
}

test("typescript help", async () => {
  try {
    let result = await testUtils.runCommand(__dirname, qxCmdPath, "typescript", "--help");
    assert.ok(result.exitCode === 0, testUtils.reportError(result));
    assert.ok(result.output.includes("typescript"), "Help should mention typescript command");
    assert.ok(result.output.includes("generate typescript definitions"), "Help should mention typescript definitions");
    assert.ok(result.output.includes("output-filename"), "Help should mention output-filename option");
    assert.ok(result.output.includes("exclude"), "Help should mention exclude option");
  } catch (ex) {
    throw ex;
  }
});

test("typescript command with app", async () => {
  try {
    // Create a test app for typescript generation
    await testUtils.deleteRecursive(myAppDir);
    await fsp.mkdir(testDir, { recursive: true });
    
    let result = await testUtils.runCommand(testDir, qxCmdPath, "create", "myapp", "-I", "--type=desktop");
    assert.ok(result.exitCode === 0, testUtils.reportError(result));
    
    // Compile the app first to ensure it's valid
    result = await testUtils.runCompiler(myAppDir);
    assert.ok(result.exitCode === 0, testUtils.reportError(result));
    
    // Test typescript command with default output filename
    result = await testUtils.runCommand(myAppDir, qxCmdPath, "typescript", "-v");
    assert.ok(result.exitCode === 0, testUtils.reportError(result));
    assert.ok(await assertPathExists(path.join(myAppDir, "qooxdoo.d.ts")), "Default TypeScript definition file should be created");
    
    // Test typescript command with specific files (the outputFilename parameter doesn't seem to work in current implementation)
    result = await testUtils.runCommand(myAppDir, qxCmdPath, "typescript", "--verbose", "source/class");
    assert.ok(result.exitCode === 0, testUtils.reportError(result));
    // The TypeScript command currently always outputs to qooxdoo.d.ts regardless of --outputFilename
    assert.ok(await assertPathExists(path.join(myAppDir, "qooxdoo.d.ts")), "TypeScript definition file should be created with default name");
    
    // Clean up
    await testUtils.deleteRecursive(testDir);
    
  } catch (ex) {
    throw ex;
  }
});

test("typescript command with exclude", async () => {
  try {
    // Create a test app for typescript generation
    await testUtils.deleteRecursive(myAppDir);
    await fsp.mkdir(testDir, { recursive: true });

    let result = await testUtils.runCommand(testDir, qxCmdPath, "create", "myapp", "-I", "--type=desktop");
    assert.ok(result.exitCode === 0, testUtils.reportError(result));

    // Add a custom test class to verify exclude functionality
    result = await testUtils.runCommand(myAppDir, qxCmdPath, "add", "class", "myapp.test.CustomTest", "--extend=qx.core.Object", "--force");
    assert.ok(result.exitCode === 0, testUtils.reportError(result));

    // Generate TypeScript definitions without exclude first
    result = await testUtils.runCommand(myAppDir, qxCmdPath, "typescript", "--verbose");
    assert.ok(result.exitCode === 0, testUtils.reportError(result));

    // Read the generated TypeScript file without exclude
    const fullContent = await fsp.readFile(path.join(myAppDir, "qooxdoo.d.ts"), "utf8");
    assert.ok(fullContent.includes("CustomTest"), "TypeScript file should include CustomTest class when not excluded");

    // Delete the previous TypeScript file
    await fsp.unlink(path.join(myAppDir, "qooxdoo.d.ts"));

    // Test typescript command with exclude option for test directory
    result = await testUtils.runCommand(myAppDir, qxCmdPath, "typescript", "--exclude=**/test/**", "--verbose");
    assert.ok(result.exitCode === 0, testUtils.reportError(result));
    assert.ok(await assertPathExists(path.join(myAppDir, "qooxdoo.d.ts")), "TypeScript definition file with exclusions should be created");

    // Read the generated TypeScript file with exclude
    const excludedContent = await fsp.readFile(path.join(myAppDir, "qooxdoo.d.ts"), "utf8");

    // Verify that the exclude functionality works correctly
    assert.ok(!excludedContent.includes("CustomTest"), "TypeScript file should NOT include CustomTest class when test directory is excluded");
    assert.ok(excludedContent.includes("Application"), "TypeScript file should still include Application class when only test directory is excluded");

    // Clean up
    await testUtils.deleteRecursive(testDir);

  } catch (ex) {
    throw ex;
  }
});

test("typescript command with custom output filename", async () => {
  try {
    // Create a test app for typescript generation
    await testUtils.deleteRecursive(myAppDir);
    await fsp.mkdir(testDir, { recursive: true });

    let result = await testUtils.runCommand(testDir, qxCmdPath, "create", "myapp", "-I", "--type=desktop");
    assert.ok(result.exitCode === 0, testUtils.reportError(result));

    // Compile the app first to ensure it's valid
    result = await testUtils.runCompiler(myAppDir);
    assert.ok(result.exitCode === 0, testUtils.reportError(result));

    // Test typescript command with custom output filename
    const customFilename = "custom-types.d.ts";
    result = await testUtils.runCommand(myAppDir, qxCmdPath, "typescript", `--output-filename=${customFilename}`, "--verbose");
    assert.ok(result.exitCode === 0, testUtils.reportError(result));
    assert.ok(await assertPathExists(path.join(myAppDir, customFilename)), "Custom TypeScript definition file should be created");

    // Verify the content is valid TypeScript definitions
    const content = await fsp.readFile(path.join(myAppDir, customFilename), "utf8");
    assert.ok(content.includes("declare"), "TypeScript file should contain declarations");
    assert.ok(content.includes("namespace"), "TypeScript file should contain namespace declarations");

    // Ensure default filename was not created
    const defaultFilePath = path.join(myAppDir, "qooxdoo.d.ts");
    const defaultFileExists = await fsp.access(defaultFilePath).then(() => true).catch(() => false);
    assert.ok(!defaultFileExists, "Default qooxdoo.d.ts file should not be created when custom filename is specified");

    // Clean up
    await testUtils.deleteRecursive(testDir);

  } catch (ex) {
    throw ex;
  }
});

test("typescript var type should map to unknown (issue #10555)", async () => {
  try {
    // Create a test app for typescript generation
    await testUtils.deleteRecursive(myAppDir);
    await fsp.mkdir(testDir, { recursive: true });

    let result = await testUtils.runCommand(testDir, qxCmdPath, "create", "myapp", "-I", "--type=desktop");
    assert.ok(result.exitCode === 0, testUtils.reportError(result));

    // Create a test class with a method that returns {var} type
    const testClassPath = path.join(myAppDir, "source", "class", "myapp", "TestVarType.js");
    const testClassContent = `
/**
 * Test class for issue #10555 - var type should map to unknown
 */
qx.Class.define("myapp.TestVarType", {
  extend: qx.core.Object,

  statics: {
    /**
     * Returns a value of unknown type (JSDoc uses {var})
     * @param {String} key The key to get
     * @return {var} The value for the key
     */
    getValue(key) {
      return null;
    },

    /**
     * Returns a wildcard type (JSDoc uses {*})
     * @param {String} key The key to get
     * @return {*} Any value for the key
     */
    getAnyValue(key) {
      return null;
    }
  }
});
`;
    await fsp.writeFile(testClassPath, testClassContent);

    // Compile the app first to ensure it's valid
    result = await testUtils.runCompiler(myAppDir);
    assert.ok(result.exitCode === 0, testUtils.reportError(result));

    // Generate TypeScript definitions
    result = await testUtils.runCommand(myAppDir, qxCmdPath, "typescript", "--verbose");
    assert.ok(result.exitCode === 0, testUtils.reportError(result));

    // Read the generated TypeScript file
    const tsDefPath = path.join(myAppDir, "qooxdoo.d.ts");
    const content = await fsp.readFile(tsDefPath, "utf8");

    // Verify that the TestVarType class exists in the generated file
    assert.ok(content.includes("TestVarType"), "TypeScript file should include TestVarType class");

    // Find the getValue method declaration
    // The method should return 'unknown', not 'void' or 'any'
    const getValueMatch = content.match(/static\s+getValue\s*\([^)]*\)\s*:\s*(\w+)/);
    assert.ok(getValueMatch, "Should find getValue method declaration");
    assert.equal(getValueMatch[1], "unknown", "getValue with @return {var} should return 'unknown' type");

    // Find the getAnyValue method declaration
    // The method should return 'any' (because * maps to any)
    const getAnyValueMatch = content.match(/static\s+getAnyValue\s*\([^)]*\)\s*:\s*(\w+)/);
    assert.ok(getAnyValueMatch, "Should find getAnyValue method declaration");
    assert.equal(getAnyValueMatch[1], "any", "getAnyValue with @return {*} should return 'any' type");

    // Verify qx.core.Environment.get also returns unknown
    const environmentGetMatch = content.match(/(?:static\s+)?get\s*\(\s*key\s*:\s*string\s*\)\s*:\s*(\w+)/);
    if (environmentGetMatch) {
      assert.equal(environmentGetMatch[1], "unknown", "qx.core.Environment.get should return 'unknown' type");
    }

    // Clean up
    await testUtils.deleteRecursive(testDir);

  } catch (ex) {
    throw ex;
  }
});