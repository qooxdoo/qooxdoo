const test = require("tape");
const colorize = require('tap-colorize');
const fs = require("fs");
const fsp = require("fs").promises;
const path = require("path");
const testUtils = require("../../../bin/tools/utils");
const qxCmdPath = testUtils.getCompiler("source");

// Colorize TAP output
test.createStream().pipe(colorize()).pipe(process.stdout);

// Test 1: Help command
test("migrate --help", async assert => {
  try {
    let result = await testUtils.runCommand(__dirname, qxCmdPath, "migrate", "--help");
    assert.ok(result.exitCode === 0, testUtils.reportError(result));
    assert.ok(result.output.includes("migrate"), "Help should mention migrate command");
    assert.ok(result.output.includes("help"), "Help should mention help option");
    assert.end();
  } catch (ex) {
    assert.end(ex);
  }
});

// Test 2: Manifest.json dependency update
test("M8_0_0: Manifest.json dependency update", async assert => {
  try {
    const baseDir = path.join(__dirname, "test-migrations", "v8.0.0");
    const unmigratedDir = path.join(baseDir, "unmigrated");
    const migratedDir = path.join(baseDir, "migrated");

    // Setup: Copy fixture to migrated directory
    await testUtils.deleteRecursive(migratedDir);
    await fsp.cp(unmigratedDir, migratedDir, { recursive: true });

    // Read original Manifest
    const originalManifest = JSON.parse(
      await fsp.readFile(path.join(migratedDir, "Manifest.json"), "utf8")
    );
    assert.ok(
      originalManifest.requires["@qooxdoo/framework"] === "^7.0.0",
      "Original manifest should have v7 dependency"
    );

    // Dry-run migration
    let result = await testUtils.runCommand(migratedDir, qxCmdPath,
      "migrate", "--dry-run", "--verbose");
    assert.ok(result.exitCode === 0, testUtils.reportError(result));

    // Verify file unchanged in dry-run
    const afterDryRunManifest = JSON.parse(
      await fsp.readFile(path.join(migratedDir, "Manifest.json"), "utf8")
    );
    assert.ok(
      afterDryRunManifest.requires["@qooxdoo/framework"] === "^7.0.0",
      "Manifest should be unchanged after dry-run"
    );

    // Actual migration
    result = await testUtils.runCommand(migratedDir, qxCmdPath, "migrate", "--verbose");
    assert.ok(result.exitCode === 0, testUtils.reportError(result));

    // Verify Manifest updated
    const migratedManifest = JSON.parse(
      await fsp.readFile(path.join(migratedDir, "Manifest.json"), "utf8")
    );
    assert.ok(
      migratedManifest.requires["@qooxdoo/framework"].includes("8.") ||
      migratedManifest.requires["@qooxdoo/framework"] === "^8.0.0",
      "Manifest should have v8 dependency after migration"
    );

    // Verify other fields unchanged
    assert.equal(
      migratedManifest.info.name,
      originalManifest.info.name,
      "Manifest name should be unchanged"
    );
    assert.equal(
      migratedManifest.provides.namespace,
      originalManifest.provides.namespace,
      "Manifest namespace should be unchanged"
    );

    // Cleanup
    await testUtils.deleteRecursive(migratedDir);
    assert.end();
  } catch (ex) {
    assert.end(ex);
  }
});

// Test 3: compile.js class name replacements
test("M8_0_0: compile.js class name replacements", async assert => {
  try {
    const baseDir = path.join(__dirname, "test-migrations", "v8.0.0");
    const unmigratedDir = path.join(baseDir, "unmigrated");
    const migratedDir = path.join(baseDir, "migrated");

    // Setup
    await testUtils.deleteRecursive(migratedDir);
    await fsp.cp(unmigratedDir, migratedDir, { recursive: true });

    const compileJsPath = path.join(migratedDir, "compile.js");

    // Read original compile.js
    const originalContent = await fsp.readFile(compileJsPath, "utf8");
    assert.ok(
      originalContent.includes("qx.tool.cli.commands.Package"),
      "Original compile.js should have old class names"
    );
    assert.ok(
      originalContent.includes("qx.tool.cli.ConfigDb"),
      "Original compile.js should have old ConfigDb reference"
    );

    // Run migration
    let result = await testUtils.runCommand(migratedDir, qxCmdPath, "migrate", "--verbose");
    assert.ok(result.exitCode === 0, testUtils.reportError(result));

    // Verify compile.js updated
    const migratedContent = await fsp.readFile(compileJsPath, "utf8");
    assert.ok(
      migratedContent.includes("qx.tool.compiler.cli.commands.Package"),
      "Migrated compile.js should have new Package class name"
    );
    assert.ok(
      migratedContent.includes("qx.tool.compiler.cli.ConfigDb"),
      "Migrated compile.js should have new ConfigDb class name"
    );
    assert.ok(
      migratedContent.includes("qx.tool.compiler.cli.commands.Test"),
      "Migrated compile.js should have new Test class name"
    );
    assert.notOk(
      migratedContent.includes("qx.tool.cli.commands."),
      "Migrated compile.js should NOT have old qx.tool.cli.commands references"
    );

    // Cleanup
    await testUtils.deleteRecursive(migratedDir);
    assert.end();
  } catch (ex) {
    assert.end(ex);
  }
});

// Test 4: form.add() uppercase name detection
test("M8_0_0: form.add() uppercase name detection", async assert => {
  try {
    const baseDir = path.join(__dirname, "test-migrations", "v8.0.0");
    const unmigratedDir = path.join(baseDir, "unmigrated");
    const migratedDir = path.join(baseDir, "migrated");

    // Setup
    await testUtils.deleteRecursive(migratedDir);
    await fsp.cp(unmigratedDir, migratedDir, { recursive: true });

    const formTestPath = path.join(migratedDir, "source", "class", "qxl", "test8", "FormTest.js");

    // Verify test file exists
    assert.ok(
      fs.existsSync(formTestPath),
      "FormTest.js fixture should exist"
    );

    // Read original file
    const originalContent = await fsp.readFile(formTestPath, "utf8");

    // Run migration
    let result = await testUtils.runCommand(migratedDir, qxCmdPath, "migrate", "--verbose");
    assert.ok(result.exitCode === 0, testUtils.reportError(result));

    // Verify console output contains form.add() warnings
    assert.ok(
      result.output.includes("form.add()") || result.output.includes("Form.add()"),
      "Output should mention form.add() issues"
    );
    assert.ok(
      result.output.includes("Username") || result.output.includes("username"),
      "Output should mention Username field"
    );
    assert.ok(
      result.output.includes("Password") || result.output.includes("password"),
      "Output should mention Password field"
    );

    // Verify file unchanged (this is an informational warning only)
    const afterMigrationContent = await fsp.readFile(formTestPath, "utf8");
    assert.equal(
      afterMigrationContent,
      originalContent,
      "FormTest.js should be unchanged (migration doesn't auto-fix this)"
    );

    // Cleanup
    await testUtils.deleteRecursive(migratedDir);
    assert.end();
  } catch (ex) {
    assert.end(ex);
  }
});

// Test 5: Breaking change announcements
test("M8_0_0: Breaking change announcements", async assert => {
  try {
    const baseDir = path.join(__dirname, "test-migrations", "v8.0.0");
    const unmigratedDir = path.join(baseDir, "unmigrated");
    const migratedDir = path.join(baseDir, "migrated");

    // Setup
    await testUtils.deleteRecursive(migratedDir);
    await fsp.cp(unmigratedDir, migratedDir, { recursive: true });

    // Run migration with verbose flag
    let result = await testUtils.runCommand(migratedDir, qxCmdPath, "migrate", "--verbose");
    assert.ok(result.exitCode === 0, testUtils.reportError(result));

    // Check for key announcements
    const output = result.output;

    // Table model breaking change
    assert.ok(
      output.includes("table") && output.includes("Table") ||
      output.includes("model data"),
      "Should announce table model breaking change"
    );

    // instance.name removal
    assert.ok(
      output.includes("instance.name") || output.includes("instance.classname"),
      "Should announce instance.name removal"
    );

    // Property/member namespace
    assert.ok(
      output.includes("Property") && output.includes("Member") ||
      output.includes("namespace") && output.includes("conflict"),
      "Should announce property/member namespace change"
    );

    // Node.js version requirement
    assert.ok(
      output.includes("Node") && output.includes("20") ||
      output.includes("Node.js") && output.includes("version"),
      "Should announce Node.js version requirement"
    );

    // Locale API change
    assert.ok(
      output.includes("locale") && (output.includes("Intl") || output.includes("CLDR")),
      "Should announce locale API change"
    );

    // Cleanup
    await testUtils.deleteRecursive(migratedDir);
    assert.end();
  } catch (ex) {
    assert.end(ex);
  }
});

// Test 6: Complete migration workflow
test("M8_0_0: Complete migration workflow", async assert => {
  try {
    const baseDir = path.join(__dirname, "test-migrations", "v8.0.0");
    const unmigratedDir = path.join(baseDir, "unmigrated");
    const migratedDir = path.join(baseDir, "migrated");

    // Setup
    await testUtils.deleteRecursive(migratedDir);
    await fsp.cp(unmigratedDir, migratedDir, { recursive: true });

    // Step 1: Dry-run migration
    let result = await testUtils.runCommand(migratedDir, qxCmdPath,
      "migrate", "--dry-run", "--verbose");
    assert.ok(result.exitCode === 0, testUtils.reportError(result));
    assert.ok(
      result.output.includes("migration") || result.output.includes("pending"),
      "Dry-run should show pending migrations"
    );

    // Step 2: Actual migration
    result = await testUtils.runCommand(migratedDir, qxCmdPath, "migrate", "--verbose");
    assert.ok(result.exitCode === 0, testUtils.reportError(result));

    // Step 3: Verify all migrations applied
    const output = result.output;

    // Should show migration summary
    assert.ok(
      output.includes("migration") || output.includes("applied"),
      "Should show migration summary"
    );

    // Verify Manifest was updated
    const manifest = JSON.parse(
      await fsp.readFile(path.join(migratedDir, "Manifest.json"), "utf8")
    );
    assert.ok(
      manifest.requires["@qooxdoo/framework"].includes("8."),
      "Manifest should be updated in complete workflow"
    );

    // Verify compile.js was updated
    const compileJs = await fsp.readFile(path.join(migratedDir, "compile.js"), "utf8");
    assert.ok(
      compileJs.includes("qx.tool.compiler.cli."),
      "compile.js should be updated in complete workflow"
    );

    // Verify announcements were shown
    assert.ok(
      output.includes("IMPORTANT") || output.includes("INFO"),
      "Should show important announcements"
    );

    // Step 4: Run migration again (should be idempotent)
    result = await testUtils.runCommand(migratedDir, qxCmdPath, "migrate", "--verbose");
    assert.ok(result.exitCode === 0, testUtils.reportError(result));

    // Cleanup
    await testUtils.deleteRecursive(migratedDir);
    assert.end();
  } catch (ex) {
    assert.end(ex);
  }
});
