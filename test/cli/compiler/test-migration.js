const test = require("tape");
const path = require("path");
const process = require("process");
const testUtils = require("../../../bin/tools/utils");
const fsp = require("fs").promises;
const qx = path.resolve(__dirname, "..", "..", "..", "bin", "source", "qx");

test("v6.0.0", async assert => {
  try {
    const testDir = path.join(__dirname, "test-migrations", "v6.0.0");
    await testUtils.deleteRecursive(path.join(testDir, "migrated"));
    await testUtils.sync(path.join(testDir, "unmigrated"), path.join(testDir, "migrated"));
    await testUtils.runCommand(path.join(testDir, "migrated"), qx, "migrate", "--verbose", "--debug");
    assert.end();
  } catch(ex) {
    assert.end(ex);
  }
});
