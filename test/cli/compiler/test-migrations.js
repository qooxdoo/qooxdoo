const test = require("tape");
const path = require("path");
const process = require("process");
const testUtils = require("../../../bin/tools/utils");
const fsp = require("fs").promises;
const qx = path.resolve(__dirname, "..", "..", "..", "bin", "source", "qx");
const digest = require("util").promisify(require("dirsum").digest);

test("Test migrations", async assert => {
  try {
    const baseDir = path.join(__dirname, "test-migrations", "v6.0.0");
    const unmigratedDir = path.join(baseDir, "unmigrated");
    const migratedDir = path.join(baseDir, "migrated");
    await testUtils.deleteRecursive(migratedDir);
    await testUtils.sync(unmigratedDir, migratedDir);
    console.log("\n# upgrade alert\n");
    await testUtils.runCommand(migratedDir, qx, "clean");
    console.log("\n# dry run\n");
    await testUtils.runCommand(migratedDir, qx, "migrate", "--verbose", "--dry-run");
    console.log("\n\n# migration\n");
    await testUtils.runCommand(migratedDir, qx, "migrate", "--verbose");
    let checksum = (await digest(migratedDir,'sha1')).hash;
    console.log(`Checksum of migrated app: ${checksum}`);
    assert.ok(checksum === "8c1c8dc402ae7eb3f72941284b79bf4cf34c90fd");
    assert.end();
  } catch(ex) {
    assert.end(ex);
  }
});
