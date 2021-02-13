var test = require("tape");
var fs = require("fs");
const testUtils = require("../../bin/tools/utils");
require("../index");

test("Checks rotateUnique", async assert => {
  await testUtils.deleteRecursive("test-rotate-unique");
  await testUtils.fsPromises.mkdir("test-rotate-unique");
  
  for (var i = 1; i < 6; i++) {
   await qx.tool.utils.files.Utils.safeUnlink("test-rotate-unique/log.txt." + i); 
  }
  for (var i = 1; i < 10; i++) {
    await qx.tool.utils.files.Utils.rotateUnique("test-rotate-unique/log.txt", 5);
    fs.writeFileSync("test-rotate-unique/log.txt", "This is version " + i, "utf8");
  }
  assert.ok(Boolean(await qx.tool.utils.files.Utils.safeStat("test-rotate-unique/log.txt")));
  assert.ok(Boolean(await qx.tool.utils.files.Utils.safeStat("test-rotate-unique/log.txt.1")));
  assert.ok(Boolean(await qx.tool.utils.files.Utils.safeStat("test-rotate-unique/log.txt.2")));
  assert.ok(Boolean(await qx.tool.utils.files.Utils.safeStat("test-rotate-unique/log.txt.3")));
  assert.ok(Boolean(await qx.tool.utils.files.Utils.safeStat("test-rotate-unique/log.txt.4")));
  assert.ok(Boolean(await qx.tool.utils.files.Utils.safeStat("test-rotate-unique/log.txt.5")));
  assert.ok(!await qx.tool.utils.files.Utils.safeStat("test-rotate-unique/log.txt.6"));
  assert.ok(!await qx.tool.utils.files.Utils.safeStat("test-rotate-unique/log.txt.7"));
  assert.ok(!await qx.tool.utils.files.Utils.safeStat("test-rotate-unique/log.txt.8"));
  assert.end();
});

