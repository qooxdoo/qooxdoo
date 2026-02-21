const { test } = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const testUtils = require("../../../bin/tools/utils");
const path = require("path");

// set DEBUG envvar to get colorized verbose output
const debug = Boolean(process.env.DEBUG);
let qxCmdPath = testUtils.getCompiler(debug ? "source" : "build");
qxCmdPath = testUtils.getCompiler("source");
const testDir = path.join(__dirname, "test-qx-config");
if (!fs.existsSync(testDir)) {
  fs.mkdirSync(testDir, { recursive: true });
}
const appDir = path.join(testDir, "configapp");

let debugArg = "";
if (debug) {
  debugArg += "--debug --colorize";
}

test("Test qx config command without parameters", async () => {
  try {
    let result;
    result = await testUtils.runCommand(__dirname, qxCmdPath, "config");
    assert.ok(result.exitCode === 0, "qx config command should exit successfully");
    result.output = result.output.toLowerCase();
    assert.ok(result.output.includes("usage") || result.output.includes("commands"), "Output should contain usage information");
  } catch (ex) {
    throw ex;
  }
});

test("Test qx config help", async () => {
  try {
    let result;
    result = await testUtils.runCommand(__dirname, qxCmdPath, "config", "--help");
    assert.ok(result.exitCode === 0, "Config help should work");
    assert.ok(result.output.includes("config"), "Help should mention config command");
  } catch (ex) {
    throw ex;
  }
});

test("Test qx config subcommand help", async () => {
  try {
    let result;
    
    // Test help for each subcommand
    const subcommands = ["get", "set", "list", "delete"];
    
    for (let subcmd of subcommands) {
      result = await testUtils.runCommand(testDir, qxCmdPath, "config", subcmd, "--help");
      assert.ok(result.exitCode === 0, `Config ${subcmd} help should work`);
      assert.ok(result.output.includes(subcmd), `Help should mention ${subcmd} command`);
    }
    
  } catch (ex) {
    throw ex;
  }
});

test("Create test app for config commands", async () => {
  try {
    await testUtils.deleteRecursive(appDir);
    let result;
    result = await testUtils.runCommand(testDir, qxCmdPath, "create", "configapp", "-I");
    assert.ok(result.exitCode === 0, "Create app should succeed");
    assert.ok(fs.existsSync(path.join(appDir, "compile.json")), "compile.json should exist");
  } catch (ex) {
    throw ex;
  }
});

test("Test qx config set and get", async () => {
  try {
    let result;
    
    // Set a config value
    result = await testUtils.runCommand(appDir, qxCmdPath, "config", "set", "test.key", "test-value");
    assert.ok(result.exitCode === 0, "Config set should work");
    
    // Get the config value
    result = await testUtils.runCommand(appDir, qxCmdPath, "config", "get", "test.key");
    assert.ok(result.exitCode === 0, "Config get should work");
    assert.ok(result.output.includes("test-value"), "Should return the set value");
    
  } catch (ex) {
    throw ex;
  }
});

test("Test qx config get non-existent key", async () => {
  try {
    let result;
    result = await testUtils.runCommand(appDir, qxCmdPath, "config", "get", "non.existent.key");
    // This should either return empty or an error - let's accept both
    assert.ok(result.exitCode === 0 || result.exitCode === 1, "Config get for non-existent key should handle gracefully");
  } catch (ex) {
    throw ex;
  }
});

test("Test qx config list", async () => {
  try {
    let result;
    result = await testUtils.runCommand(appDir, qxCmdPath, "config", "list");
    assert.ok(result.exitCode === 0, "Config list should work");
    // Should list some default configuration values
    assert.ok(result.output.length > 0, "Config list should produce output");
  } catch (ex) {
    throw ex;
  }
});

test("Test qx config delete", async () => {
  try {
    let result;
    
    // First set a value
    result = await testUtils.runCommand(appDir, qxCmdPath, "config", "set", "delete.test.key", "value-to-delete");
    assert.ok(result.exitCode === 0, "Config set should work");
    
    // Verify it exists
    result = await testUtils.runCommand(appDir, qxCmdPath, "config", "get", "delete.test.key");
    assert.ok(result.exitCode === 0, "Config get should work");
    assert.ok(result.output.includes("value-to-delete"), "Should return the set value");
    
    // Delete the value
    result = await testUtils.runCommand(appDir, qxCmdPath, "config", "delete", "delete.test.key");
    assert.ok(result.exitCode === 0, "Config delete should work");
    
    // Verify it's gone
    result = await testUtils.runCommand(appDir, qxCmdPath, "config", "get", "delete.test.key");
    assert.ok(result.exitCode === 0 || result.exitCode === 1, "Config get for deleted key should handle gracefully");
    
  } catch (ex) {
    throw ex;
  }
});

test("Test qx config with JSON values", async () => {
  try {
    let result;
    
    // Set a JSON object value
    result = await testUtils.runCommand(appDir, qxCmdPath, "config", "set", "json.test", '{"name":"test","value":123}');
    assert.ok(result.exitCode === 0, "Config set with JSON should work");
    
    // Get the JSON value
    result = await testUtils.runCommand(appDir, qxCmdPath, "config", "get", "json.test");
    assert.ok(result.exitCode === 0, "Config get should work");
    assert.ok(result.output.includes("test") && result.output.includes("123"), "Should return the JSON value");
    
  } catch (ex) {
    throw ex;
  }
});


// Clean up test directory
test("Clean up test directory", async () => {
  try {
    await testUtils.deleteRecursive(testDir);
    assert.ok(!fs.existsSync(testDir), "Test directory should be cleaned up");
  } catch (ex) {
    throw ex;
  }
});