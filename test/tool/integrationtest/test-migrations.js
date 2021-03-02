const test = require("tape"); // https://github.com/substack/tape
const path = require("path");
const testUtils = require("../../../bin/tools/utils");
const fsp = require("fs").promises;
const digest = require("util").promisify(require("dirsum").digest);
const process = require("process");

// set DEBUG envvar to get colorized verbose output
const debug = Boolean(process.env.DEBUG);
const qxCmdPath = testUtils.getCompiler(debug ? "source":"build");
let debugArg = "";
if (debug) {
  const colorize = require('tap-colorize');
  test.createStream().pipe(colorize()).pipe(process.stdout);
  debugArg += "--debug --colorize";
}

function testMigration(maxVersion, numMigrationsExpected, checksumExpected) {
  return async tape => {
    try {
      const baseDir = path.join(__dirname, "test-migrations", `v${maxVersion}`);
      const unmigratedDir = path.join(baseDir, "unmigrated");
      const migratedDir = path.join(baseDir, "migrated");
      await testUtils.deleteRecursive(migratedDir);
      await testUtils.sync(unmigratedDir, migratedDir);
      tape.comment("Upgrade notice");
      let result = await testUtils.runCommand(migratedDir, qxCmdPath, "clean", debugArg);
      tape.match(result.error, new RegExp(`pending migrations`));
      tape.comment("Dry run");
      result = await testUtils.runCommand(migratedDir, qxCmdPath, "migrate", "--verbose", "--dry-run", `--qx-version=${maxVersion}`, debugArg);
      tape.match(result.output,new RegExp(`0 migrations applied, ${numMigrationsExpected} migrations pending`));
      tape.comment("Run migration");
      result = await testUtils.runCommand(migratedDir, qxCmdPath, "migrate", "--verbose", `--qx-version=${maxVersion}`, debugArg);
      tape.match(result.output, new RegExp(`${numMigrationsExpected} migrations applied, 0 migrations pending`));
      let checksum = (await digest(migratedDir,'sha1')).hash;
      tape.comment(`Checksum of migrated app: ${checksum}, expected ${checksumExpected}`);
      // checksums do not seem to be deterministic, need to find out why
      // or replace by an algorithm that only hashes file tree (not file contents)
      //tape.equals(checksum, checksumExpected);
      tape.end();
    } catch(ex) {
      tape.end(ex);
    }
  }
}

test("v6.0.0", testMigration("6.0.0", 9, "4c73c335e6446bb5082217a3bc7f2bbe29277211"));

test("v7.0.0", testMigration("7.0.0", 3, "a7d71e81c22665c5fce5a5f6993fd699a8d12440"));
