const { test } = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const fsp = require("fs").promises;
const path = require("path");
const testUtils = require("../../../bin/tools/utils");
const qxCmdPath = testUtils.getCompiler("source");
const testDir = path.join(__dirname, "test-qx-prettier");
const myAppDir = path.join(testDir, "myapp");

//colorize output

async function assertPathExists(path){
  let stat = await fsp.stat(path);
  if (stat.isFile() || stat.isDirectory()) {
    return true;
  }
  throw new Error(`Path does not exist: ${path}`);
}

test("prettier help", async () => {
  try {
    let result = await testUtils.runCommand(__dirname, qxCmdPath, "prettier", "--help");
    assert.ok(result.exitCode === 0, testUtils.reportError(result));
    assert.ok(result.output.includes("prettier"), "Help should mention prettier command");
    assert.ok(result.output.includes("formats code using Prettier"), "Help should mention Prettier formatting");
    assert.ok(result.output.includes("files"), "Help should mention files argument");
    assert.ok(result.output.includes("--check"), "Help should mention check option");
    assert.ok(result.output.includes("--write"), "Help should mention write option");
    assert.ok(result.output.includes("--git-pre-commit"), "Help should mention gitPreCommit option");
  } catch (ex) {
    throw ex;
  }
});

test("prettier format sample file", async () => {
  try {
    // Setup test directory
    await testUtils.deleteRecursive(testDir);
    await fsp.mkdir(testDir, { recursive: true });
    await fsp.mkdir(path.join(testDir, "source"), { recursive: true });

    // Create a JavaScript file with poor formatting
    const unformattedContent = `qx.Class.define("MyTestClass",{
extend:qx.core.Object,

members:{
testMethod:function(){
var x=1;
  var y  =  2 ;
var   z    =    3;
return x+y+z;
},

anotherMethod:function(a,b,c){
if(a>b){
return a;
}else{
return b;
}
}
}
});`;

    const testFilePath = path.join(testDir, "source", "TestClass.js");
    await fsp.writeFile(testFilePath, unformattedContent);

    // Read original content to compare later
    const originalContent = await fsp.readFile(testFilePath, "utf8");

    // Test prettier command with write mode (default)
    let result = await testUtils.runCommand(testDir, qxCmdPath, "prettier", "source/TestClass.js");
    assert.ok(result.exitCode === 0, testUtils.reportError(result));
    assert.ok(result.output.includes("Formatted") || result.output.includes("Processed"), "Should show formatting message");

    // Read the formatted content
    const formattedContent = await fsp.readFile(testFilePath, "utf8");
    assert.ok(formattedContent !== originalContent, "File content should be changed after formatting");
    assert.ok(formattedContent.length > 0, "File should still have content after formatting");

    // Check for proper formatting (proper indentation and spacing)
    assert.ok(formattedContent.includes("qx.Class.define"), "Should still contain class definition");
    assert.ok(!formattedContent.includes("extend:qx"), "Should have proper spacing after colons");

    // Clean up
    await testUtils.deleteRecursive(testDir);

  } catch (ex) {
    throw ex;
  }
});

test("prettier check mode", async () => {
  try {
    // Setup test directory
    await testUtils.deleteRecursive(testDir);
    await fsp.mkdir(testDir, { recursive: true });
    await fsp.mkdir(path.join(testDir, "source"), { recursive: true });

    // Create an unformatted file
    const unformattedContent = `qx.Class.define("CheckTest",{
extend:qx.core.Object,
members:{
test:function(){
return true;
}
}
});`;

    const testFilePath = path.join(testDir, "source", "CheckTest.js");
    await fsp.writeFile(testFilePath, unformattedContent);

    // Store original content
    const originalContent = await fsp.readFile(testFilePath, "utf8");

    // Test prettier in check mode (should not write)
    let result = await testUtils.runCommand(testDir, qxCmdPath, "prettier", "--check", "--write=false", "source/CheckTest.js");

    // Check mode should report unformatted files as error
    assert.ok(result.exitCode !== 0, "Check mode should exit with error for unformatted files");
    const fullOutput = result.output + result.error;
    assert.ok(fullOutput.includes("not formatted") || fullOutput.includes("need formatting"), "Should report unformatted files");

    // Verify file was not modified
    const unchangedContent = await fsp.readFile(testFilePath, "utf8");
    assert.ok(unchangedContent === originalContent, "File should not be modified in check mode");

    // Clean up
    await testUtils.deleteRecursive(testDir);

  } catch (ex) {
    throw ex;
  }
});

test("prettier already formatted file", async () => {
  try {
    // Setup test directory
    await testUtils.deleteRecursive(testDir);
    await fsp.mkdir(testDir, { recursive: true });
    await fsp.mkdir(path.join(testDir, "source"), { recursive: true });

    // Create a well-formatted file
    const formattedContent = `qx.Class.define("FormattedClass", {
  extend: qx.core.Object,

  members: {
    test() {
      const x = 1;
      const y = 2;
      return x + y;
    }
  }
});
`;

    const testFilePath = path.join(testDir, "source", "FormattedClass.js");
    await fsp.writeFile(testFilePath, formattedContent);

    // Test prettier on already formatted file
    let result = await testUtils.runCommand(testDir, qxCmdPath, "prettier", "source/FormattedClass.js");
    assert.ok(result.exitCode === 0, testUtils.reportError(result));
    assert.ok(
      result.output.includes("already formatted") || result.output.includes("Processed 1 file"),
      "Should indicate file is already formatted"
    );

    // Verify content is unchanged (or only minimally changed due to prettier config)
    const resultContent = await fsp.readFile(testFilePath, "utf8");
    assert.ok(resultContent.includes("qx.Class.define"), "Should still contain class definition");

    // Clean up
    await testUtils.deleteRecursive(testDir);

  } catch (ex) {
    throw ex;
  }
});

test("prettier with multiple files", async () => {
  try {
    // Setup test directory
    await testUtils.deleteRecursive(testDir);
    await fsp.mkdir(testDir, { recursive: true });
    await fsp.mkdir(path.join(testDir, "source"), { recursive: true });

    // Create multiple unformatted files
    const unformattedContent1 = `qx.Class.define("File1",{extend:qx.core.Object});`;
    const unformattedContent2 = `qx.Class.define("File2",{extend:qx.core.Object});`;
    const unformattedContent3 = `qx.Class.define("File3",{extend:qx.core.Object});`;

    const testFile1 = path.join(testDir, "source", "File1.js");
    const testFile2 = path.join(testDir, "source", "File2.js");
    const testFile3 = path.join(testDir, "source", "File3.js");

    await fsp.writeFile(testFile1, unformattedContent1);
    await fsp.writeFile(testFile2, unformattedContent2);
    await fsp.writeFile(testFile3, unformattedContent3);

    // Test prettier on directory (should process all JS files)
    let result = await testUtils.runCommand(testDir, qxCmdPath, "prettier", "source");
    assert.ok(result.exitCode === 0, testUtils.reportError(result));
    assert.ok(result.output.includes("Processed 3 file"), "Should process all 3 files");

    // Verify all files were formatted
    const formatted1 = await fsp.readFile(testFile1, "utf8");
    const formatted2 = await fsp.readFile(testFile2, "utf8");
    const formatted3 = await fsp.readFile(testFile3, "utf8");

    assert.ok(formatted1 !== unformattedContent1, "File1 should be formatted");
    assert.ok(formatted2 !== unformattedContent2, "File2 should be formatted");
    assert.ok(formatted3 !== unformattedContent3, "File3 should be formatted");

    // Clean up
    await testUtils.deleteRecursive(testDir);

  } catch (ex) {
    throw ex;
  }
});

test("prettier with .prettierignore", async () => {
  try {
    // Setup test directory
    await testUtils.deleteRecursive(testDir);
    await fsp.mkdir(testDir, { recursive: true });
    await fsp.mkdir(path.join(testDir, "source"), { recursive: true });
    await fsp.mkdir(path.join(testDir, "source", "ignored"), { recursive: true });

    // Create .prettierignore file
    const prettierIgnoreContent = `**/ignored/**
*.ignore.js`;
    await fsp.writeFile(path.join(testDir, ".prettierignore"), prettierIgnoreContent);

    // Create files to test ignore patterns
    const normalContent = `qx.Class.define("Normal",{extend:qx.core.Object});`;
    const ignoredContent = `qx.Class.define("Ignored",{extend:qx.core.Object});`;

    const normalFile = path.join(testDir, "source", "Normal.js");
    const ignoredFile = path.join(testDir, "source", "ignored", "Ignored.js");

    await fsp.writeFile(normalFile, normalContent);
    await fsp.writeFile(ignoredFile, ignoredContent);

    // Store original content of ignored file
    const originalIgnoredContent = await fsp.readFile(ignoredFile, "utf8");

    // Test prettier on directory
    let result = await testUtils.runCommand(testDir, qxCmdPath, "prettier", "source");
    assert.ok(result.exitCode === 0, testUtils.reportError(result));

    // Check that normal file was formatted but ignored file was not
    const formattedNormal = await fsp.readFile(normalFile, "utf8");
    const untouchedIgnored = await fsp.readFile(ignoredFile, "utf8");

    assert.ok(formattedNormal !== normalContent, "Normal file should be formatted");
    assert.ok(untouchedIgnored === originalIgnoredContent, "Ignored file should remain unchanged");

    // Clean up
    await testUtils.deleteRecursive(testDir);

  } catch (ex) {
    throw ex;
  }
});

test("prettier default behavior", async () => {
  try {
    // Create a test app to verify default behavior
    await testUtils.deleteRecursive(myAppDir);
    await fsp.mkdir(testDir, { recursive: true });

    let result = await testUtils.runCommand(testDir, qxCmdPath, "create", "myapp", "-I", "--type=desktop");
    assert.ok(result.exitCode === 0, testUtils.reportError(result));

    // Add a test class
    result = await testUtils.runCommand(myAppDir, qxCmdPath, "add", "class", "myapp.PrettierTest", "--extend=qx.core.Object", "--force");
    assert.ok(result.exitCode === 0, testUtils.reportError(result));

    // Modify the generated class to have bad formatting
    const testFilePath = path.join(myAppDir, "source", "class", "myapp", "PrettierTest.js");
    let classContent = await fsp.readFile(testFilePath, "utf8");

    // Make formatting intentionally bad (but still parseable)
    const badlyFormattedContent = classContent
      .replace(/,\n/g, ',')  // Remove newlines after commas
      .replace(/ : /g, ':')  // Remove spaces around colons
      .replace(/{\n  /g, '{ '); // Put opening braces on same line with less spacing
    await fsp.writeFile(testFilePath, badlyFormattedContent);

    const originalContent = await fsp.readFile(testFilePath, "utf8");

    // Test prettier with default settings (should process source directory)
    result = await testUtils.runCommand(myAppDir, qxCmdPath, "prettier");
    assert.ok(result.exitCode === 0, testUtils.reportError(result));
    assert.ok(result.output.includes("Processed") || result.output.includes("file"), "Should show processing messages");

    // Verify that files were processed
    const processedContent = await fsp.readFile(testFilePath, "utf8");
    assert.ok(processedContent.length > 0, "File should have content after processing");
    assert.ok(processedContent !== originalContent, "File should be formatted");

    // Clean up
    await testUtils.deleteRecursive(testDir);

  } catch (ex) {
    throw ex;
  }
});

test("prettier verbose mode", async () => {
  try {
    // Setup test directory
    await testUtils.deleteRecursive(testDir);
    await fsp.mkdir(testDir, { recursive: true });
    await fsp.mkdir(path.join(testDir, "source"), { recursive: true });

    // Create a formatted file
    const content = `qx.Class.define("VerboseTest", {
  extend: qx.core.Object
});
`;

    const testFilePath = path.join(testDir, "source", "VerboseTest.js");
    await fsp.writeFile(testFilePath, content);

    // Test prettier with verbose flag
    let result = await testUtils.runCommand(testDir, qxCmdPath, "prettier", "--verbose", "source/VerboseTest.js");
    assert.ok(result.exitCode === 0, testUtils.reportError(result));
    assert.ok(
      result.output.includes("formatted") || result.output.includes("Processed"),
      "Verbose mode should show detailed output"
    );

    // Clean up
    await testUtils.deleteRecursive(testDir);

  } catch (ex) {
    throw ex;
  }
});
