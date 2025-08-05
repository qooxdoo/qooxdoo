const test = require("tape");
const colorize = require('tap-colorize');
const fs = require("fs");
const fsp = require("fs").promises;
const path = require("path");
const testUtils = require("../../../bin/tools/utils");
const qxCmdPath = testUtils.getCompiler("source");
const testDir = path.join(__dirname, "test-lint");
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

async function createTestApp() {
  await testUtils.deleteRecursive(myAppDir);
  
  // Create test directory if it doesn't exist
  if (!fs.existsSync(testDir)) {
    await fsp.mkdir(testDir, { recursive: true });
  }
  
  let result = await testUtils.runCommand(testDir, qxCmdPath, "create", "myapp", "-I", "--type=server", "-v");
  if (result.exitCode !== 0) {
    throw new Error(`Failed to create test app: ${result.error || result.output}`);
  }
  return result;
}

async function createCompileJsonWithConfig(eslintConfig) {
  const compileJsonPath = path.join(myAppDir, "compile.json");
  const compileJson = JSON.parse(await fsp.readFile(compileJsonPath, "utf8"));
  compileJson.eslintConfig = eslintConfig;
  await fsp.writeFile(compileJsonPath, JSON.stringify(compileJson, null, 2));
}

async function createTestFileWithError() {
  const testFilePath = path.join(myAppDir, "source", "class", "myapp", "TestFile.js");
  const testFileContent = `/* Test file with intentional ESLint errors */
qx.Class.define("myapp.TestFile", {
  extend: qx.core.Object,
  members: {
    testMethod() {
      // Intentional ESLint error: curly rule violation
      if (true) console.log("test");
      
      // Another error: no-unused-vars
      var unusedVar = "unused";
      
      return "test";
    }
  }
});`;
  await fsp.writeFile(testFilePath, testFileContent);
  return testFilePath;
}

test("setup test app", async assert => {
  try {
    await createTestApp();
    assert.ok(await assertPathExists(path.join(myAppDir, "compile.json")));
    assert.end();
  } catch (ex) {
    assert.end(ex);
  }
});

test("lint with legacy config format", async assert => {
  try {
    // Create legacy format eslint config
    const legacyConfig = {
      "extends": ["@qooxdoo/qx/browser"],
      "ignorePatterns": ["compiled/**", "node_modules/**"],
      "rules": {
        "curly": "error",
        "no-unused-vars": "error"
      }
    };
    
    await createCompileJsonWithConfig(legacyConfig);
    await createTestFileWithError();
    
    // Run lint command
    let result = await testUtils.runCommand(myAppDir, qxCmdPath, "lint", "--quiet", "source/class/myapp/TestFile.js");
    
    // Should fail because of ESLint errors
    assert.ok(result.exitCode !== 0, "Lint should fail with errors");
    assert.ok(result.output.includes("curly") || result.error.includes("curly"), "Should report curly rule violation");
    
    assert.end();
  } catch (ex) {
    assert.end(ex);
  }
});

test("lint with flat config format", async assert => {
  try {
    // Create flat format eslint config - properly structured for flat config
    const flatConfig = [
      {
        "ignores": ["compiled/**", "node_modules/**"]
      },
      {
        "requires": ["@qooxdoo/eslint-config-qx/browser"],
        "languageOptions": {
          "ecmaVersion": 2020
        },
        "rules": {
          "curly": "error",
          "no-unused-vars": "error"
        }
      }
    ];
    
    await createCompileJsonWithConfig(flatConfig);
    
    // Run lint command on the same test file
    let result = await testUtils.runCommand(myAppDir, qxCmdPath, "lint", "--quiet", "source/class/myapp/TestFile.js");
    
    // Should fail because of ESLint errors
    assert.ok(result.exitCode !== 0, "Lint should fail with errors");
    assert.ok(result.output.includes("curly") || result.error.includes("curly"), "Should report curly rule violation");
    
    assert.end();
  } catch (ex) {
    assert.end(ex);
  }
});

test("lint with --fix option (legacy config)", async assert => {
  try {
    // Create legacy config with fixable rules
    const legacyConfig = {
      "extends": ["@qooxdoo/qx/browser"],
      "ignorePatterns": ["compiled/**", "node_modules/**"],
      "rules": {
        "semi": "error",
        "quotes": ["error", "double"]
      }
    };
    
    await createCompileJsonWithConfig(legacyConfig);
    
    // Create file with fixable errors
    const testFilePath = path.join(myAppDir, "source", "class", "myapp", "FixableTest.js");
    const testFileContent = `qx.Class.define('myapp.FixableTest', {
  extend: qx.core.Object,
  members: {
    testMethod() {
      var test = 'single quotes'
      return test
    }
  }
})`;
    await fsp.writeFile(testFilePath, testFileContent);
    
    // Run lint with --fix
    let result = await testUtils.runCommand(myAppDir, qxCmdPath, "lint", "--fix", "--quiet", "source/class/myapp/FixableTest.js");
    
    // Should succeed after fixing
    assert.ok(result.exitCode === 0, "Lint with --fix should succeed");
    
    // Check that file was modified
    const fixedContent = await fsp.readFile(testFilePath, "utf8");
    assert.ok(fixedContent.includes('"myapp.FixableTest"'), "Should fix single quotes to double quotes");
    assert.ok(fixedContent.includes('var test = "single quotes";'), "Should add semicolons and fix quotes");
    
    assert.end();
  } catch (ex) {
    assert.end(ex);
  }
});

test("lint with --fix option (flat config)", async assert => {
  try {
    // Create flat config with fixable rules
    const flatConfig = [
      {
        "ignores": ["compiled/**", "node_modules/**"]
      },
      {
        "requires": ["@qooxdoo/eslint-config-qx/browser"],
        "languageOptions": {
          "ecmaVersion": 2020
        },
        "rules": {
          "semi": "error",
          "quotes": ["error", "double"]
        }
      }
    ];
    
    await createCompileJsonWithConfig(flatConfig);
    
    // Create file with fixable errors
    const testFilePath = path.join(myAppDir, "source", "class", "myapp", "FixableTestFlat.js");
    const testFileContent = `qx.Class.define('myapp.FixableTestFlat', {
  extend: qx.core.Object,
  members: {
    testMethod() {
      var test = 'single quotes'
      return test
    }
  }
})`;
    await fsp.writeFile(testFilePath, testFileContent);
    
    // Run lint with --fix
    let result = await testUtils.runCommand(myAppDir, qxCmdPath, "lint", "--fix", "--quiet", "source/class/myapp/FixableTestFlat.js");
    
    // Should succeed after fixing
    assert.ok(result.exitCode === 0, "Lint with --fix should succeed");
    
    // Check that file was modified
    const fixedContent = await fsp.readFile(testFilePath, "utf8");
    assert.ok(fixedContent.includes('"myapp.FixableTestFlat"'), "Should fix single quotes to double quotes");
    assert.ok(fixedContent.includes('var test = "single quotes";'), "Should add semicolons and fix quotes");
    
    assert.end();
  } catch (ex) {
    assert.end(ex);
  }
});

test("lint with --print-config option", async assert => {
  try {
    const legacyConfig = {
      "extends": ["@qooxdoo/qx/browser"],
      "rules": {
        "curly": "error"
      }
    };
    
    await createCompileJsonWithConfig(legacyConfig);
    
    // Run lint with --print-config
    let result = await testUtils.runCommand(myAppDir, qxCmdPath, "lint", "--print-config", "source/class/myapp/Application.js");
    
    assert.ok(result.exitCode === 0, "Print config should succeed");
    assert.ok(result.output.includes("curly"), "Should include curly rule in config output");
    assert.ok(result.output.includes("parser"), "Should include parser configuration");
    
    assert.end();
  } catch (ex) {
    assert.end(ex);
  }
});

test("lint with custom ignores in legacy config", async assert => {
  try {
    const legacyConfig = {
      "extends": ["@qooxdoo/qx/browser"],
      "ignorePatterns": ["compiled/**", "node_modules/**", "source/class/myapp/Ignored.js"],
      "rules": {
        "curly": "error"
      }
    };
    
    await createCompileJsonWithConfig(legacyConfig);
    
    // Create file that should be ignored
    const ignoredFilePath = path.join(myAppDir, "source", "class", "myapp", "Ignored.js");
    const ignoredFileContent = `qx.Class.define("myapp.Ignored", {
  extend: qx.core.Object,
  members: {
    testMethod() {
      if (true) console.log("ignored error");
    }
  }
});`;
    await fsp.writeFile(ignoredFilePath, ignoredFileContent);
    
    // Run lint - should succeed because file is ignored
    let result = await testUtils.runCommand(myAppDir, qxCmdPath, "lint", "--quiet", "source/class/myapp/Ignored.js");
    
    assert.ok(result.exitCode === 0, "Lint should succeed for ignored files");
    
    assert.end();
  } catch (ex) {
    assert.end(ex);
  }
});

test("lint with custom ignores in flat config", async assert => {
  try {
    const flatConfig = [
      {
        "ignores": ["compiled/**", "node_modules/**", "source/class/myapp/IgnoredFlat.js"]
      },
      {
        "requires": ["@qooxdoo/eslint-config-qx/browser"],
        "rules": {
          "curly": "error"
        }
      }
    ];
    
    await createCompileJsonWithConfig(flatConfig);
    
    // Create file that should be ignored
    const ignoredFilePath = path.join(myAppDir, "source", "class", "myapp", "IgnoredFlat.js");
    const ignoredFileContent = `qx.Class.define("myapp.IgnoredFlat", {
  extend: qx.core.Object,
  members: {
    testMethod() {
      if (true) console.log("ignored error");
    }
  }
});`;
    await fsp.writeFile(ignoredFilePath, ignoredFileContent);
    
    // Run lint - should succeed because file is ignored
    let result = await testUtils.runCommand(myAppDir, qxCmdPath, "lint", "--quiet", "source/class/myapp/IgnoredFlat.js");
    
    assert.ok(result.exitCode === 0, "Lint should succeed for ignored files");
    
    assert.end();
  } catch (ex) {
    assert.end(ex);
  }
});

test("lint entire project with both config formats", async assert => {
  try {
    // Test with legacy config
    const legacyConfig = {
      "extends": ["@qooxdoo/qx/browser"],
      "ignorePatterns": ["compiled/**", "node_modules/**"],
      "rules": {
        "curly": "off",
        "no-unused-vars": "off",
        "linebreak-style": "off",
        "brace-style": "off",
        "keyword-spacing": "off",
        "no-constant-condition": "off",
        "no-console": "off",
        "eol-last": "off"
      }
    };
    
    await createCompileJsonWithConfig(legacyConfig);
    
    // Run lint on entire project
    let result = await testUtils.runCommand(myAppDir, qxCmdPath, "lint", "--quiet");
    assert.ok(result.exitCode === 0, "Project lint with legacy config should succeed with rules turned off");
    
    // Test with flat config
    const flatConfig = [
      {
        "ignores": ["compiled/**", "node_modules/**"]
      },
      {
        "requires": ["@qooxdoo/eslint-config-qx/browser"],
        "rules": {
          "curly": "off",
          "no-unused-vars": "off",
          "linebreak-style": "off",
          "brace-style": "off",
          "keyword-spacing": "off",
          "no-constant-condition": "off",
          "no-console": "off",
          "eol-last": "off"
        }
      }
    ];
    
    await createCompileJsonWithConfig(flatConfig);
    
    // Run lint on entire project
    result = await testUtils.runCommand(myAppDir, qxCmdPath, "lint", "--quiet");
    assert.ok(result.exitCode === 0, "Project lint with flat config should succeed with rules turned off");
    
    assert.end();
  } catch (ex) {
    assert.end(ex);
  }
});

test("cleanup", async assert => {
  try {
    await testUtils.deleteRecursive(testDir);
    assert.end();
  } catch (ex) {
    assert.end(ex);
  }
});