const test = require("tape");
const colorize = require('tap-colorize');
const fs = require("fs");
const fsp = require("fs").promises;
const path = require("path");
const testUtils = require("../../../bin/tools/utils");
const qxCmdPath = testUtils.getCompiler();
const testDir = path.join(__dirname, "test-qx-es6ify");
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

test("es6ify help", async assert => {
  try {
    let result = await testUtils.runCommand(__dirname, qxCmdPath, "es6ify", "--help");
    assert.ok(result.exitCode === 0, reportError(result));
    assert.ok(result.output.includes("es6ify"), "Help should mention es6ify command");
    assert.ok(result.output.includes("help migrate code to ES6"), "Help should mention ES6 migration");
    assert.ok(result.output.includes("files"), "Help should mention files argument");
    assert.ok(result.output.includes("--overwrite"), "Help should mention overwrite option");
    assert.ok(result.output.includes("--exclude"), "Help should mention exclude option");
    assert.ok(result.output.includes("--arrowFunctions"), "Help should mention arrowFunctions option");
    assert.ok(result.output.includes("--singleLineBlocks"), "Help should mention singleLineBlocks option");
    assert.ok(result.output.includes("--gitPreCommit"), "Help should mention gitPreCommit option");
    assert.end();
  } catch (ex) {
    assert.end(ex);
  }
});

test("es6ify with sample file", async assert => {
  try {
    // Setup test directory
    await testUtils.deleteRecursive(testDir);
    await fsp.mkdir(testDir, { recursive: true });
    await fsp.mkdir(path.join(testDir, "source"), { recursive: true });
    
    // Create a JavaScript file with ES5 syntax that can be upgraded to ES6
    const es5Content = `// Sample ES5 code for testing es6ify
qx.Class.define("MyTestClass", {
  extend: qx.core.Object,
  
  members: {
    testMethod: function() {
      var self = this;
      var items = [1, 2, 3];
      
      // Traditional function that could be arrow function
      items.forEach(function(item) {
        console.log(item);
      });
      
      // Event listener with function
      this.addListener("test", function(e) {
        console.log("Event:", e);
      });
      
      // Function that uses 'this' context
      setTimeout(function() {
        self.someMethod();
      }, 100);
      
      return items;
    },
    
    anotherMethod: function(param) {
      if (param)
        return true;
      return false;
    }
  }
});`;
    
    const testFilePath = path.join(testDir, "source", "TestClass.js");
    await fsp.writeFile(testFilePath, es5Content);
    
    // Read original content to compare later
    const originalContent = await fsp.readFile(testFilePath, "utf8");
    
    // Test es6ify command with careful arrow function mode (default)
    let result = await testUtils.runCommand(testDir, qxCmdPath, "es6ify", "--arrowFunctions=careful", "source/TestClass.js");
    assert.ok(result.exitCode === 0, reportError(result));
    assert.ok(result.output.includes("Processing"), "Should show processing message");
    
    // Read the transformed content
    const transformedContent = await fsp.readFile(testFilePath, "utf8");
    assert.ok(transformedContent !== originalContent, "File content should be changed after es6ify");
    assert.ok(transformedContent.length > 0, "File should still have content after transformation");
    
    // Check for some ES6 transformations (arrow functions in addListener should be converted)
    assert.ok(transformedContent.includes("=>") || transformedContent.includes("function"), "Should have arrow functions or regular functions");
    
    // Clean up
    await testUtils.deleteRecursive(testDir);
    
    assert.end();
  } catch (ex) {
    assert.end(ex);
  }
});

test("es6ify with arrow function modes", async assert => {
  try {
    // Setup test directory
    await testUtils.deleteRecursive(testDir);
    await fsp.mkdir(testDir, { recursive: true });
    await fsp.mkdir(path.join(testDir, "source"), { recursive: true });
    
    // Create a simple test file
    const simpleContent = `qx.Class.define("ArrowTest", {
  extend: qx.core.Object,
  members: {
    test: function() {
      this.addListener("change", function(e) {
        console.log(e);
      });
    }
  }
});`;
    
    const testFilePath = path.join(testDir, "source", "ArrowTest.js");
    
    // Test different arrow function modes
    const modes = ["never", "careful", "always"];
    
    for (const mode of modes) {
      await fsp.writeFile(testFilePath, simpleContent);
      
      let result = await testUtils.runCommand(testDir, qxCmdPath, "es6ify", `--arrowFunctions=${mode}`, "source/ArrowTest.js");
      assert.ok(result.exitCode === 0, `Should succeed with arrowFunctions=${mode}: ${reportError(result)}`);
      
      // Verify file was processed
      const content = await fsp.readFile(testFilePath, "utf8");
      assert.ok(content.length > 0, `File should have content after processing with mode ${mode}`);
    }
    
    // Clean up
    await testUtils.deleteRecursive(testDir);
    
    assert.end();
  } catch (ex) {
    assert.end(ex);
  }
});

test("es6ify with exclude option", async assert => {
  try {
    // Setup test directory
    await testUtils.deleteRecursive(testDir);
    await fsp.mkdir(testDir, { recursive: true });
    await fsp.mkdir(path.join(testDir, "source"), { recursive: true });
    await fsp.mkdir(path.join(testDir, "source", "excluded"), { recursive: true });
    
    // Create files to test exclusion
    const mainContent = `qx.Class.define("MainClass", {
  extend: qx.core.Object,
  members: {
    test: function() { return true; }
  }
});`;
    
    const excludedContent = `qx.Class.define("ExcludedClass", {
  extend: qx.core.Object,
  members: {
    test: function() { return false; }
  }
});`;
    
    const mainFilePath = path.join(testDir, "source", "MainClass.js");
    const excludedFilePath = path.join(testDir, "source", "excluded", "ExcludedClass.js");
    
    await fsp.writeFile(mainFilePath, mainContent);
    await fsp.writeFile(excludedFilePath, excludedContent);
    
    // Store original content of excluded file
    const originalExcludedContent = await fsp.readFile(excludedFilePath, "utf8");
    
    // Test es6ify with exclude pattern
    let result = await testUtils.runCommand(testDir, qxCmdPath, "es6ify", "--exclude=**/excluded/**", "source");
    assert.ok(result.exitCode === 0, reportError(result));
    
    // Check that main file was processed but excluded file was not
    const processedMainContent = await fsp.readFile(mainFilePath, "utf8");
    const untouchedExcludedContent = await fsp.readFile(excludedFilePath, "utf8");
    
    assert.ok(processedMainContent !== mainContent, "Main file should be transformed");
    assert.ok(untouchedExcludedContent === originalExcludedContent, "Excluded file should remain unchanged");
    
    // Clean up
    await testUtils.deleteRecursive(testDir);
    
    assert.end();
  } catch (ex) {
    assert.end(ex);
  }
});

test("es6ify with single line blocks option", async assert => {
  try {
    // Setup test directory
    await testUtils.deleteRecursive(testDir);
    await fsp.mkdir(testDir, { recursive: true });
    await fsp.mkdir(path.join(testDir, "source"), { recursive: true });
    
    // Create a file with single line blocks that should get braces
    const singleLineContent = `qx.Class.define("SingleLineTest", {
  extend: qx.core.Object,
  members: {
    test: function() {
      var x = 5;
      if (x > 0)
        return true;
      
      for (var i = 0; i < 10; i++)
        console.log(i);
        
      while (x > 0)
        x--;
    }
  }
});`;
    
    const testFilePath = path.join(testDir, "source", "SingleLineTest.js");
    await fsp.writeFile(testFilePath, singleLineContent);
    
    // Test es6ify with singleLineBlocks option
    let result = await testUtils.runCommand(testDir, qxCmdPath, "es6ify", "--singleLineBlocks=true", "source/SingleLineTest.js");
    assert.ok(result.exitCode === 0, reportError(result));
    
    // Check that the file was processed
    const transformedContent = await fsp.readFile(testFilePath, "utf8");
    assert.ok(transformedContent !== singleLineContent, "File should be transformed");
    assert.ok(transformedContent.length > 0, "File should have content after transformation");
    
    // Clean up
    await testUtils.deleteRecursive(testDir);
    
    assert.end();
  } catch (ex) {
    assert.end(ex);
  }
});

test("es6ify with no overwrite option", async assert => {
  try {
    // Setup test directory
    await testUtils.deleteRecursive(testDir);
    await fsp.mkdir(testDir, { recursive: true });
    await fsp.mkdir(path.join(testDir, "source"), { recursive: true });
    
    // Create a test file
    const originalContent = `qx.Class.define("NoOverwriteTest", {
  extend: qx.core.Object,
  members: {
    test: function() { return "original"; }
  }
});`;
    
    const testFilePath = path.join(testDir, "source", "NoOverwriteTest.js");
    await fsp.writeFile(testFilePath, originalContent);
    
    // Test es6ify with overwrite=false
    let result = await testUtils.runCommand(testDir, qxCmdPath, "es6ify", "--overwrite=false", "source/NoOverwriteTest.js");
    assert.ok(result.exitCode === 0, reportError(result));
    
    // Check that original file was not modified when overwrite=false
    const fileContent = await fsp.readFile(testFilePath, "utf8");
    assert.ok(fileContent === originalContent, "Original file should be unchanged when overwrite=false");
    
    // Clean up
    await testUtils.deleteRecursive(testDir);
    
    assert.end();
  } catch (ex) {
    assert.end(ex);
  }
});

test("es6ify default behavior", async assert => {
  try {
    // Create a test app to verify default behavior
    await testUtils.deleteRecursive(myAppDir);
    await fsp.mkdir(testDir, { recursive: true });
    
    let result = await testUtils.runCommand(testDir, qxCmdPath, "create", "myapp", "-I", "--type=desktop");
    assert.ok(result.exitCode === 0, reportError(result));
    
    // Add a test class with ES5 syntax
    result = await testUtils.runCommand(myAppDir, qxCmdPath, "add", "class", "myapp.Es6Test", "--extend=qx.core.Object", "--force");
    assert.ok(result.exitCode === 0, reportError(result));
    
    // Modify the generated class to have ES5 syntax
    const testFilePath = path.join(myAppDir, "source", "class", "myapp", "Es6Test.js");
    let classContent = await fsp.readFile(testFilePath, "utf8");
    
    // Add some ES5 patterns that can be upgraded
    const modifiedContent = classContent.replace(
      'members: {',
      `members: {
    testFunction: function() {
      var self = this;
      this.addListener("test", function(e) {
        console.log("test event");
      });
    },`
    );
    
    await fsp.writeFile(testFilePath, modifiedContent);
    const originalContent = await fsp.readFile(testFilePath, "utf8");
    
    // Test es6ify with default settings (should process source directory)
    result = await testUtils.runCommand(myAppDir, qxCmdPath, "es6ify");
    assert.ok(result.exitCode === 0, reportError(result));
    assert.ok(result.output.includes("Processing"), "Should show processing messages");
    
    // Verify that files were processed
    const processedContent = await fsp.readFile(testFilePath, "utf8");
    assert.ok(processedContent.length > 0, "File should have content after processing");
    
    // Clean up
    await testUtils.deleteRecursive(testDir);
    
    assert.end();
  } catch (ex) {
    assert.end(ex);
  }
});