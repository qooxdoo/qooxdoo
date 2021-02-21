const test = require("tape"); // https://github.com/substack/tape
const path = require("path");
const process = require("process");
const testUtils = require("../../../bin/tools/utils");
const fsp = require("fs").promises;
const digest = require("util").promisify(require("dirsum").digest);
//const qx = path.resolve(__dirname, "..", "..", "..", "bin", "source", "qx");
const qx = testUtils.getCompiler();
const debug = false;

const debugArg = debug ? "--debug" : "";
test("Test migrations", async t => {
  try {
    const baseDir = path.join(__dirname, "test-migrations", "v6.0.0");
    const unmigratedDir = path.join(baseDir, "unmigrated");
    const migratedDir = path.join(baseDir, "migrated");
    await testUtils.deleteRecursive(migratedDir);
    await testUtils.sync(unmigratedDir, migratedDir);
    t.comment("Upgrade alert");
    let result = await testUtils.runCommand(migratedDir, qx, "clean", debugArg);
    t.match(result.error, /There are 6 new migrations/);
    t.comment("Dry run");
    result = await testUtils.runCommand(migratedDir, qx, "migrate", "--verbose", "--dry-run", "--max-version=6.0.0", debugArg);
    t.match(result.output, /0 migrations applied, 7 migrations pending/);
    t.comment("Run migration");
    result = await testUtils.runCommand(migratedDir, qx, "migrate", "--verbose", "--max-version=6.0.0", debugArg);
    t.match(result.output, /11 migrations applied, 0 migrations pending/);
    let checksum = (await digest(migratedDir,'sha1')).hash;
    t.comment(`Checksum of migrated app: ${checksum}`);
    t.equals(checksum, "8c1c8dc402ae7eb3f72941284b79bf4cf34c90fd");
    t.end();
  } catch(ex) {
    t.end(ex);
  }
});
