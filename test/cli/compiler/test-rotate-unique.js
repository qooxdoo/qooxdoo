const qx = require("../qx");
const test = require("tape");
const fs = require("fs");
const testUtils = require("../../../bin/tools/utils");

test("Checks rotateUnique", async t => {
  await testUtils.deleteRecursive("test-rotate-unique");
  await testUtils.fsPromises.mkdir("test-rotate-unique");

  for (var i = 1; i < 6; i++) {
   await qx.tool.utils.files.Utils.safeUnlink("test-rotate-unique/log.txt." + i);
  }
  for (var i = 1; i < 10; i++) {
    await qx.tool.utils.files.Utils.rotateUnique("test-rotate-unique/log.txt", 5);
    fs.writeFileSync("test-rotate-unique/log.txt", "This is version " + i, "utf8");
  }
  t.ok(Boolean(await qx.tool.utils.files.Utils.safeStat("test-rotate-unique/log.txt")));
  t.ok(Boolean(await qx.tool.utils.files.Utils.safeStat("test-rotate-unique/log.txt.1")));
  t.ok(Boolean(await qx.tool.utils.files.Utils.safeStat("test-rotate-unique/log.txt.2")));
  t.ok(Boolean(await qx.tool.utils.files.Utils.safeStat("test-rotate-unique/log.txt.3")));
  t.ok(Boolean(await qx.tool.utils.files.Utils.safeStat("test-rotate-unique/log.txt.4")));
  t.ok(Boolean(await qx.tool.utils.files.Utils.safeStat("test-rotate-unique/log.txt.5")));
  t.ok(!await qx.tool.utils.files.Utils.safeStat("test-rotate-unique/log.txt.6"));
  t.ok(!await qx.tool.utils.files.Utils.safeStat("test-rotate-unique/log.txt.7"));
  t.ok(!await qx.tool.utils.files.Utils.safeStat("test-rotate-unique/log.txt.8"));
  t.end();
});

