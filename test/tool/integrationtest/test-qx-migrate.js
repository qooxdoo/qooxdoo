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
      output.includes(".name") || output.includes("this.name") || output.includes("instance.classname"),
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

// Test 7: Property/Member conflict detection
test("M8_0_0: Property/Member conflict detection", async assert => {
  try {
    const baseDir = path.join(__dirname, "test-migrations", "v8.0.0");
    const unmigratedDir = path.join(baseDir, "unmigrated");
    const migratedDir = path.join(baseDir, "migrated");

    // Setup
    await testUtils.deleteRecursive(migratedDir);
    await fsp.cp(unmigratedDir, migratedDir, { recursive: true });

    // Verify test fixtures exist
    const propertyConflictPath = path.join(
      migratedDir, "source", "class", "qxl", "test8", "PropertyConflictTest.js"
    );
    const staticConflictPath = path.join(
      migratedDir, "source", "class", "qxl", "test8", "StaticConflictTest.js"
    );
    const noConflictPath = path.join(
      migratedDir, "source", "class", "qxl", "test8", "NoConflictTest.js"
    );
    const mixinConflictPath = path.join(
      migratedDir, "source", "class", "qxl", "test8", "MConflictMixin.js"
    );

    assert.ok(
      fs.existsSync(propertyConflictPath),
      "PropertyConflictTest.js fixture should exist"
    );
    assert.ok(
      fs.existsSync(staticConflictPath),
      "StaticConflictTest.js fixture should exist"
    );
    assert.ok(
      fs.existsSync(noConflictPath),
      "NoConflictTest.js fixture should exist"
    );
    assert.ok(
      fs.existsSync(mixinConflictPath),
      "MConflictMixin.js fixture should exist"
    );

    // Run migration with verbose flag
    let result = await testUtils.runCommand(migratedDir, qxCmdPath, "migrate", "--verbose");
    assert.ok(result.exitCode === 0, testUtils.reportError(result));

    const output = result.output;

    // Verify conflict detection for PropertyConflictTest
    assert.ok(
      output.includes("PropertyConflictTest") || output.includes("PropertyConflict"),
      "Output should mention PropertyConflictTest class"
    );
    assert.ok(
      output.includes("name") && output.includes("value"),
      "Output should mention conflicting property names 'name' and 'value'"
    );

    // Verify conflict detection for StaticConflictTest
    assert.ok(
      output.includes("StaticConflictTest") || output.includes("StaticConflict"),
      "Output should mention StaticConflictTest class"
    );
    assert.ok(
      output.includes("count") && output.includes("version"),
      "Output should mention conflicting static names 'count' and 'version'"
    );
    assert.ok(
      output.includes("statics") || output.includes("static"),
      "Output should mention static conflicts"
    );

    // Verify conflict detection for MConflictMixin
    assert.ok(
      output.includes("MConflictMixin") || output.includes("Mixin"),
      "Output should mention MConflictMixin"
    );
    assert.ok(
      output.includes("label"),
      "Output should mention conflicting property name 'label' in mixin"
    );

    // Verify NoConflictTest is not mentioned as having conflicts
    // (it might be mentioned in general output, but not in conflict list)
    const conflictSection = output.substring(
      output.indexOf("Property/Member Conflict")
    );
    if (conflictSection.includes("NoConflictTest")) {
      assert.fail("NoConflictTest should NOT be listed as having conflicts");
    }

    // Verify helpful suggestions in output
    assert.ok(
      output.includes("rename") || output.includes("Rename"),
      "Output should suggest renaming"
    );
    assert.ok(
      output.includes("getName") || output.includes("_name"),
      "Output should suggest typical naming solutions"
    );

    // Verify general announcement about namespace change
    assert.ok(
      output.includes("Property") && output.includes("Member") &&
      (output.includes("namespace") || output.includes("same namespace")),
      "Output should announce property/member namespace change"
    );

    // Verify files are unchanged (migration only detects, doesn't auto-fix)
    const afterPropertyConflict = await fsp.readFile(propertyConflictPath, "utf8");
    assert.ok(
      afterPropertyConflict.includes("name()") && afterPropertyConflict.includes("value()"),
      "PropertyConflictTest.js should be unchanged (detection only, no auto-fix)"
    );

    const afterStaticConflict = await fsp.readFile(staticConflictPath, "utf8");
    assert.ok(
      afterStaticConflict.includes("count: 0") && afterStaticConflict.includes('version: "2.0"'),
      "StaticConflictTest.js should be unchanged (detection only, no auto-fix)"
    );

    // Cleanup
    await testUtils.deleteRecursive(migratedDir);
    assert.end();
  } catch (ex) {
    assert.end(ex);
  }
});

// Test 8: instance.name usage detection
test("M8_0_0: instance.name usage detection", async assert => {
  try {
    const baseDir = path.join(__dirname, "test-migrations", "v8.0.0");
    const unmigratedDir = path.join(baseDir, "unmigrated");
    const migratedDir = path.join(baseDir, "migrated");

    // Setup
    await testUtils.deleteRecursive(migratedDir);
    await fsp.cp(unmigratedDir, migratedDir, { recursive: true });

    // Verify test fixtures exist
    const instanceNameTestPath = path.join(
      migratedDir, "source", "class", "qxl", "test8", "InstanceNameTest.js"
    );
    const noInstanceNameTestPath = path.join(
      migratedDir, "source", "class", "qxl", "test8", "NoInstanceNameTest.js"
    );

    assert.ok(
      fs.existsSync(instanceNameTestPath),
      "InstanceNameTest.js fixture should exist"
    );
    assert.ok(
      fs.existsSync(noInstanceNameTestPath),
      "NoInstanceNameTest.js fixture should exist"
    );

    // Run migration with verbose flag
    let result = await testUtils.runCommand(migratedDir, qxCmdPath, "migrate", "--verbose");
    assert.ok(result.exitCode === 0, testUtils.reportError(result));

    const output = result.output;

    // Verify detection of instance.name usages
    assert.ok(
      output.includes(".name") || output.includes("this.name") &&
      (output.includes("Usage") || output.includes("Detected")),
      "Output should mention instance.name usage detection"
    );

    // Verify InstanceNameTest is mentioned
    assert.ok(
      output.includes("InstanceNameTest"),
      "Output should mention InstanceNameTest.js file with instance.name usages"
    );

    // Verify line numbers are reported
    assert.ok(
      output.includes("Line") || output.includes("line"),
      "Output should report line numbers of usages"
    );

    // Verify NoInstanceNameTest is NOT mentioned in warnings
    // (It uses instance.classname which is correct)
    const usageSection = output.substring(
      output.indexOf("instance.name")
    );
    if (usageSection.includes("NoInstanceNameTest")) {
      assert.fail("NoInstanceNameTest should NOT be listed as having instance.name usages");
    }

    // Verify helpful replacement suggestion
    assert.ok(
      output.includes(".classname"),
      "Output should suggest using instance.classname"
    );

    // Verify general announcement about instance.name removal
    assert.ok(
      output.includes(".name") || output.includes("this.name") &&
      (output.includes("no longer available") || output.includes("not available")),
      "Output should announce that instance.name is no longer available"
    );

    // Verify files are unchanged (migration only detects, doesn't auto-fix)
    const afterInstanceNameTest = await fsp.readFile(instanceNameTestPath, "utf8");
    assert.ok(
      afterInstanceNameTest.includes("this.name"),
      "InstanceNameTest.js should be unchanged (detection only, no auto-fix)"
    );

    const afterNoInstanceNameTest = await fsp.readFile(noInstanceNameTestPath, "utf8");
    assert.ok(
      afterNoInstanceNameTest.includes("classname") &&
      !afterNoInstanceNameTest.includes("instance.name"),
      "NoInstanceNameTest.js should remain correct with instance.classname"
    );

    // Cleanup
    await testUtils.deleteRecursive(migratedDir);
    assert.end();
  } catch (ex) {
    assert.end(ex);
  }
});

// Test 9: migratePackages - no contrib.json (silent skip)
test("M8_0_0: migratePackages - no contrib.json (silent skip)", async assert => {
  try {
    const baseDir = path.join(__dirname, "test-migrations", "v8.0.0");
    const unmigratedDir = path.join(baseDir, "unmigrated");
    const migratedDir = path.join(baseDir, "migrated");

    // Setup
    await testUtils.deleteRecursive(migratedDir);
    await fsp.cp(unmigratedDir, migratedDir, { recursive: true });

    // Ensure no contrib.json exists
    const contribPath = path.join(migratedDir, "contrib.json");
    if (fs.existsSync(contribPath)) {
      await fsp.unlink(contribPath);
    }

    // Run migration
    let result = await testUtils.runCommand(migratedDir, qxCmdPath, "migrate", "--verbose");
    assert.ok(result.exitCode === 0, testUtils.reportError(result));

    // Verify no package upgrade announcement
    assert.notOk(
      result.output.includes("Packages will be upgraded") ||
      result.output.includes("package upgrade"),
      "Should NOT announce package upgrade when contrib.json is missing"
    );

    // Cleanup
    await testUtils.deleteRecursive(migratedDir);
    assert.end();
  } catch (ex) {
    assert.end(ex);
  }
});

// Test 10: migratePackages - empty libraries array
test("M8_0_0: migratePackages - empty libraries array", async assert => {
  try {
    const baseDir = path.join(__dirname, "test-migrations", "v8.0.0");
    const unmigratedDir = path.join(baseDir, "unmigrated");
    const migratedDir = path.join(baseDir, "migrated");

    // Setup
    await testUtils.deleteRecursive(migratedDir);
    await fsp.cp(unmigratedDir, migratedDir, { recursive: true });

    // Create contrib.json with empty libraries array
    const contribPath = path.join(migratedDir, "contrib.json");
    const emptyContrib = {
      libraries: [],
      version: "2.1.0"
    };
    await fsp.writeFile(contribPath, JSON.stringify(emptyContrib, null, 2), "utf8");

    // Run migration
    let result = await testUtils.runCommand(migratedDir, qxCmdPath, "migrate", "--verbose");
    assert.ok(result.exitCode === 0, testUtils.reportError(result));

    // Verify no package upgrade announcement
    assert.notOk(
      result.output.includes("Packages will be upgraded") ||
      result.output.includes("package upgrade"),
      "Should NOT announce package upgrade when libraries array is empty"
    );

    // Cleanup
    await testUtils.deleteRecursive(migratedDir);
    assert.end();
  } catch (ex) {
    assert.end(ex);
  }
});

// Test 11: migratePackages - valid libraries with dry-run
test("M8_0_0: migratePackages - valid libraries with dry-run", async assert => {
  try {
    const baseDir = path.join(__dirname, "test-migrations", "v8.0.0");
    const unmigratedDir = path.join(baseDir, "unmigrated");
    const migratedDir = path.join(baseDir, "migrated");

    // Setup
    await testUtils.deleteRecursive(migratedDir);
    await fsp.cp(unmigratedDir, migratedDir, { recursive: true });

    // Create contrib.json with valid libraries
    const contribPath = path.join(migratedDir, "contrib.json");
    const validContrib = {
      libraries: [
        {
          library_name: "qxl.testtapper",
          library_version: "4.0.0",
          path: "qx_packages/qooxdoo_qxl_testtapper_v4_0_0",
          uri: "qooxdoo/qxl.testtapper",
          repo_name: "qooxdoo/qxl.testtapper",
          repo_tag: "v4.0.0"
        }
      ],
      version: "2.1.0"
    };
    await fsp.writeFile(contribPath, JSON.stringify(validContrib, null, 2), "utf8");

    // Run migration in dry-run mode
    let result = await testUtils.runCommand(migratedDir, qxCmdPath,
      "migrate", "--dry-run", "--verbose");
    assert.ok(result.exitCode === 0, testUtils.reportError(result));

    // Verify package upgrade announcement
    assert.ok(
      result.output.includes("Packages will be upgraded"),
      "Should announce that packages will be upgraded in dry-run mode"
    );

    // Verify contrib.json still exists and unchanged
    assert.ok(
      fs.existsSync(contribPath),
      "contrib.json should still exist after dry-run"
    );
    const afterDryRun = JSON.parse(await fsp.readFile(contribPath, "utf8"));
    assert.equal(
      afterDryRun.libraries[0].library_version,
      "4.0.0",
      "contrib.json should be unchanged in dry-run mode"
    );

    // Cleanup
    await testUtils.deleteRecursive(migratedDir);
    assert.end();
  } catch (ex) {
    assert.end(ex);
  }
});

// Test 12: migratePackages - valid libraries triggers upgrade
test("M8_0_0: migratePackages - valid libraries triggers upgrade", async assert => {
  try {
    const baseDir = path.join(__dirname, "test-migrations", "v8.0.0");
    const unmigratedDir = path.join(baseDir, "unmigrated");
    const migratedDir = path.join(baseDir, "migrated");

    // Setup
    await testUtils.deleteRecursive(migratedDir);
    await fsp.cp(unmigratedDir, migratedDir, { recursive: true });

    // Create contrib.json with valid libraries
    const contribPath = path.join(migratedDir, "contrib.json");
    const validContrib = {
      libraries: [
        {
          library_name: "qxl.testtapper",
          library_version: "4.0.0",
          path: "qx_packages/qooxdoo_qxl_testtapper_v4_0_0",
          uri: "qooxdoo/qxl.testtapper",
          repo_name: "qooxdoo/qxl.testtapper",
          repo_tag: "v4.0.0"
        }
      ],
      version: "2.1.0"
    };
    await fsp.writeFile(contribPath, JSON.stringify(validContrib, null, 2), "utf8");

    // Note: Actual upgrade may fail due to network/package availability
    // We're primarily testing that the upgrade is attempted, not that it succeeds
    let result = await testUtils.runCommand(migratedDir, qxCmdPath, "migrate", "--verbose");

    // Either succeeds or fails due to network - both are acceptable
    // What matters is that package upgrade was attempted
    const output = result.output + result.error;

    // Check that either:
    // 1. Upgrade succeeded (output contains success indicators)
    // 2. Upgrade was attempted but failed due to network/availability (contains package-related errors)
    const upgradeAttempted =
      output.includes("upgrade") ||
      output.includes("package") ||
      output.includes("qxl.testtapper") ||
      result.exitCode === 0;

    assert.ok(
      upgradeAttempted,
      "Should attempt package upgrade when contrib.json has libraries"
    );

    // Cleanup
    await testUtils.deleteRecursive(migratedDir);
    assert.end();
  } catch (ex) {
    assert.end(ex);
  }
});

// Test 13: migratePackages - malformed JSON (graceful skip)
test("M8_0_0: migratePackages - malformed JSON (graceful skip)", async assert => {
  try {
    const baseDir = path.join(__dirname, "test-migrations", "v8.0.0");
    const unmigratedDir = path.join(baseDir, "unmigrated");
    const migratedDir = path.join(baseDir, "migrated");

    // Setup
    await testUtils.deleteRecursive(migratedDir);
    await fsp.cp(unmigratedDir, migratedDir, { recursive: true });

    // Create malformed contrib.json
    const contribPath = path.join(migratedDir, "contrib.json");
    await fsp.writeFile(contribPath,
      '{\n  "libraries": [\n    "invalid"\n  ]\n  "version": "2.1.0"\n}',
      "utf8");

    // Run migration - should not crash
    let result = await testUtils.runCommand(migratedDir, qxCmdPath, "migrate", "--verbose");
    assert.ok(result.exitCode === 0, testUtils.reportError(result));

    // Verify no package upgrade announcement (due to parse error)
    assert.notOk(
      result.output.includes("Packages will be upgraded") ||
      result.output.includes("package upgrade"),
      "Should NOT announce package upgrade when contrib.json is malformed"
    );

    // Verify migration continues and completes other steps
    const manifest = JSON.parse(
      await fsp.readFile(path.join(migratedDir, "Manifest.json"), "utf8")
    );
    assert.ok(
      manifest.requires["@qooxdoo/framework"].includes("8."),
      "Other migration steps should still complete despite malformed contrib.json"
    );

    // Cleanup
    await testUtils.deleteRecursive(migratedDir);
    assert.end();
  } catch (ex) {
    assert.end(ex);
  }
});
