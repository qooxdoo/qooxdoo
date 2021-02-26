const test = require("tape"); // https://github.com/substack/tape
const colorize = require('tap-colorize');
const path = require("path");
const testUtils = require("../../../bin/tools/utils");
const fsp = require("fs").promises;
const digest = require("util").promisify(require("dirsum").digest);
const qxCmdPath = testUtils.getCompiler();

// colorize output
test.createStream().pipe(colorize()).pipe(process.stdout);

// debugging
const debug = true;
const debugArg = debug ? "--debug --colorize" : "--colorize";

function testMigration(maxVersion, numMigrationsExpected, checksumExpected) {
  return async tape => {
    try {
      tape.comment(`>>>>>>>>>>>>>>>>>> TESTING v${maxVersion} migration <<<<<<<<<<<<<<<<<<<`);
      const baseDir = path.join(__dirname, "test-migrations", `v${maxVersion}`);
      const unmigratedDir = path.join(baseDir, "unmigrated");
      const migratedDir = path.join(baseDir, "migrated");
      await testUtils.deleteRecursive(migratedDir);
      await testUtils.sync(unmigratedDir, migratedDir);
      tape.comment("Upgrade notice");
      let result = await testUtils.runCommand(migratedDir, qxCmdPath, "clean", debugArg);
      tape.match(result.error, new RegExp(`pending migrations`));
      tape.comment("Dry run");
      result = await testUtils.runCommand(migratedDir, qxCmdPath, "migrate", "--verbose", "--dry-run", `--max-version=${maxVersion}`, debugArg);
      tape.match(result.output,new RegExp(`0 migrations applied, ${numMigrationsExpected} migrations pending`));
      tape.comment("Run migration");
      result = await testUtils.runCommand(migratedDir, qxCmdPath, "migrate", "--verbose", `--max-version=${maxVersion}`, debugArg);
      tape.match(result.output, new RegExp(`${numMigrationsExpected} migrations applied, 0 migrations pending`));
      let checksum = (await digest(migratedDir,'sha1')).hash;
      tape.comment(`Checksum of migrated app: ${checksum}`);
      tape.equals(checksum, checksumExpected);
      tape.end();
    } catch(ex) {
      tape.end(ex);
    }
  }
}

test("v6.0.0",
  testMigration("6.0.0", 11, "e71756bd17410f8adba4786a32be5d1686137261")
);

test("v7.0.0",
  testMigration("7.0.0", 2, "1503dc80c65000725de0f5f08d0da9fe73e1435e")
);
