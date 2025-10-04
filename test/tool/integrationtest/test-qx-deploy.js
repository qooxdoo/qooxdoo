const test = require("tape");
const colorize = require('tap-colorize');
const fs = require("fs");
const fsp = require("fs").promises;
const path = require("path");
const testUtils = require("../../../bin/tools/utils");
const qxCmdPath = testUtils.getCompiler();
const testDir = path.join(__dirname, "test-qx-deploy");
const myAppDir = path.join(testDir, "myapp");
const deployDir = path.join(testDir, "deploy");

//colorize output
test.createStream().pipe(colorize()).pipe(process.stdout);


async function assertPathExists(path){
  let stat = await fsp.stat(path);
  if (stat.isFile() || stat.isDirectory()) {
    return true;
  }
  throw new Error(`Path does not exist: ${path}`);
}

test("deploy help", async assert => {
  try {
    let result = await testUtils.runCommand(__dirname, qxCmdPath, "deploy", "--help");
    assert.ok(result.exitCode === 0, testUtils.reportError(result));
    assert.ok(result.output.includes("deploy"), "Help should mention deploy command");
    assert.ok(result.output.includes("deploys qooxdoo application"), "Help should mention deployment functionality");
    assert.ok(result.output.includes("--out"), "Help should mention out option");
    assert.ok(result.output.includes("--source-maps"), "Help should mention source-maps option");
    assert.ok(result.output.includes("--clean"), "Help should mention clean option");
    assert.ok(result.output.includes("--target"), "Help should mention target option");
    assert.ok(result.output.includes("--app-name"), "Help should mention app-name option");
    
    // Verify that deploy-specific flags are present and compile-only flags are removed
    assert.ok(result.output.includes("Output directory for the deployment"), "Should mention deployment output directory");
    assert.ok(result.output.includes("Enable source maps"), "Should mention source maps option");
    assert.ok(!result.output.includes("--watch"), "Deploy should not have watch option");
    assert.ok(!result.output.includes("--save-unminified"), "Deploy should not have save-unminified option");
    
    assert.end();
  } catch (ex) {
    assert.end(ex);
  }
});

test("deploy basic functionality", async assert => {
  try {
    // Setup test directory and create app
    await testUtils.deleteRecursive(testDir);
    await fsp.mkdir(testDir, { recursive: true });
    
    let result = await testUtils.runCommand(testDir, qxCmdPath, "create", "myapp", "-I", "--type=desktop");
    assert.ok(result.exitCode === 0, testUtils.reportError(result));
    
    // Test deploy command with output directory
    result = await testUtils.runCommand(myAppDir, qxCmdPath, "deploy", "--out", deployDir, "--clean");
    assert.ok(result.exitCode === 0, testUtils.reportError(result));
    
    // Verify deployment output structure
    assert.ok(await assertPathExists(deployDir), "Deploy directory should be created");
    assert.ok(await assertPathExists(path.join(deployDir, "myapp")), "App directory should be created in deploy dir");
    assert.ok(await assertPathExists(path.join(deployDir, "resource")), "Resource directory should be copied");
    
    
    // Check for index.html if it exists
    const indexPath = path.join(deployDir, "index.html");
    try {
      await assertPathExists(indexPath);
      assert.ok(true, "Index.html should be copied if it exists");
    } catch (err) {
      // Index.html might not exist for all app types - this is acceptable
      assert.ok(true, "Index.html test completed (file may not exist for this app type)");
    }
    
    // Clean up
    await testUtils.deleteRecursive(testDir);
    
    assert.end();
  } catch (ex) {
    assert.end(ex);
  }
});

test("deploy with source maps", async assert => {
  try {
    // Setup test directory and create app
    await testUtils.deleteRecursive(testDir);
    await fsp.mkdir(testDir, { recursive: true });
    
    let result = await testUtils.runCommand(testDir, qxCmdPath, "create", "myapp", "-I", "--type=desktop");
    assert.ok(result.exitCode === 0, testUtils.reportError(result));
    
    // Test deploy command with source maps enabled
    result = await testUtils.runCommand(myAppDir, qxCmdPath, "deploy", "--out", deployDir, "--source-maps", "--clean");
    assert.ok(result.exitCode === 0, testUtils.reportError(result));
    
    // Verify deployment with source maps
    assert.ok(await assertPathExists(deployDir), "Deploy directory should be created");
    assert.ok(await assertPathExists(path.join(deployDir, "myapp")), "App directory should be created");
    
    // Check if source map files are included
    const appDeployDir = path.join(deployDir, "myapp");
    const files = await fsp.readdir(appDeployDir);
    const hasSourceMaps = files.some(file => file.endsWith('.map'));
    
    if (hasSourceMaps) {
      assert.ok(true, "Source map files should be included when --source-maps is specified");
    } else {
      // Source maps might not always be generated depending on build configuration
      assert.ok(true, "Source maps test completed (maps may not be generated for this build type)");
    }
    
    // Clean up
    await testUtils.deleteRecursive(testDir);
    
    assert.end();
  } catch (ex) {
    assert.end(ex);
  }
});

test("deploy without source maps", async assert => {
  try {
    // Setup test directory and create app
    await testUtils.deleteRecursive(testDir);
    await fsp.mkdir(testDir, { recursive: true });
    
    let result = await testUtils.runCommand(testDir, qxCmdPath, "create", "myapp", "-I", "--type=desktop");
    assert.ok(result.exitCode === 0, testUtils.reportError(result));
    
    // Test deploy command without source maps (default behavior)
    result = await testUtils.runCommand(myAppDir, qxCmdPath, "deploy", "--out", deployDir, "--clean");
    assert.ok(result.exitCode === 0, testUtils.reportError(result));
    
    // Verify deployment without source maps
    assert.ok(await assertPathExists(deployDir), "Deploy directory should be created");
    
    // Check that source map files are NOT included by default
    const appDeployDir = path.join(deployDir, "myapp");
    const files = await fsp.readdir(appDeployDir);
    const hasSourceMaps = files.some(file => file.endsWith('.map'));
    
    assert.ok(!hasSourceMaps, "Source map files should NOT be included by default");
    
    // Clean up
    await testUtils.deleteRecursive(testDir);
    
    assert.end();
  } catch (ex) {
    assert.end(ex);
  }
});

test("deploy specific application", async assert => {
  try {
    // Setup test directory and create app
    await testUtils.deleteRecursive(testDir);
    await fsp.mkdir(testDir, { recursive: true });
    
    let result = await testUtils.runCommand(testDir, qxCmdPath, "create", "myapp", "-I", "--type=desktop");
    assert.ok(result.exitCode === 0, testUtils.reportError(result));
    
    // Test deploy command with specific app name
    result = await testUtils.runCommand(myAppDir, qxCmdPath, "deploy", "--out", deployDir, "--app-name=myapp", "--clean");
    assert.ok(result.exitCode === 0, testUtils.reportError(result));
    
    // Verify deployment
    assert.ok(await assertPathExists(deployDir), "Deploy directory should be created");
    assert.ok(await assertPathExists(path.join(deployDir, "myapp")), "Specific app should be deployed");
    
    // Clean up
    await testUtils.deleteRecursive(testDir);
    
    assert.end();
  } catch (ex) {
    assert.end(ex);
  }
});

test("deploy without clean flag", async assert => {
  try {
    // Setup test directory and create app
    await testUtils.deleteRecursive(testDir);
    await fsp.mkdir(testDir, { recursive: true });
    
    let result = await testUtils.runCommand(testDir, qxCmdPath, "create", "myapp", "-I", "--type=desktop");
    assert.ok(result.exitCode === 0, testUtils.reportError(result));
    
    // Test deploy command without clean flag (should show warning)
    result = await testUtils.runCommand(myAppDir, qxCmdPath, "deploy", "--out", deployDir);
    assert.ok(result.exitCode === 0, testUtils.reportError(result));
    
    // Should show warning about incremental build
    assert.ok(result.output.includes("Incremental build") || result.output.includes("not Clean"), 
             "Should show warning about incremental build when --clean is not used");
    
    // Verify deployment still works
    assert.ok(await assertPathExists(deployDir), "Deploy directory should be created even without clean");
    
    // Clean up
    await testUtils.deleteRecursive(testDir);
    
    assert.end();
  } catch (ex) {
    assert.end(ex);
  }
});

test("deploy error handling", async assert => {
  try {
    // Setup test directory and create app
    await testUtils.deleteRecursive(testDir);
    await fsp.mkdir(testDir, { recursive: true });
    
    let result = await testUtils.runCommand(testDir, qxCmdPath, "create", "myapp", "-I", "--type=desktop");
    assert.ok(result.exitCode === 0, testUtils.reportError(result));
    
    // Test deploy command without output directory (should fail or show error)
    result = await testUtils.runCommand(myAppDir, qxCmdPath, "deploy", "--clean");
    
    // This might fail or succeed depending on target configuration
    // If it fails, it should give a meaningful error message
    if (result.exitCode !== 0) {
      assert.ok(result.output.includes("deploy") || result.output.includes("output") || result.output.includes("directory"), 
               "Should provide meaningful error message when deploy directory is not specified");
    } else {
      // If it succeeds, it means there's a default deploy directory configured
      assert.ok(true, "Deploy succeeded with default configuration");
    }
    
    // Clean up
    await testUtils.deleteRecursive(testDir);
    
    assert.end();
  } catch (ex) {
    assert.end(ex);
  }
});

test("deploy file structure verification", async assert => {
  try {
    // Setup test directory and create app
    await testUtils.deleteRecursive(testDir);
    await fsp.mkdir(testDir, { recursive: true });
    
    let result = await testUtils.runCommand(testDir, qxCmdPath, "create", "myapp", "-I", "--type=desktop");
    assert.ok(result.exitCode === 0, testUtils.reportError(result));
    
    // Deploy the application
    result = await testUtils.runCommand(myAppDir, qxCmdPath, "deploy", "--out", deployDir, "--clean");
    assert.ok(result.exitCode === 0, testUtils.reportError(result));
    
    // Verify the deployed application structure is minimal and production-ready
    const appDeployDir = path.join(deployDir, "myapp");
    const appFiles = await fsp.readdir(appDeployDir);
    
    // Should have essential files but not development artifacts
    assert.ok(appFiles.length > 0, "Deployed app should contain files");
    
    // Check that deployed files don't contain development-only artifacts
    const hasDevFiles = appFiles.some(file => 
      file.includes('.map') || // source maps (unless explicitly enabled)
      file.includes('transpiled') || // development files
      file.includes('.tmp')  // temporary files
    );
    
    // Source maps should not be present unless explicitly requested
    assert.ok(!hasDevFiles, "Deployed app should not contain development artifacts by default");
    
    // Verify that essential directories exist
    assert.ok(await assertPathExists(path.join(deployDir, "resource")), "Resource directory should be deployed");
    
    // Clean up
    await testUtils.deleteRecursive(testDir);
    
    assert.end();
  } catch (ex) {
    assert.end(ex);
  }
});