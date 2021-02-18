const test = require("tape");
const testUtils = require("../../../bin/tools/utils");
const testDir = "test-migration";

test("migrate v5 -> v6", async assert => {
  try {
    await testUtils.deleteRecursive(`${testDir}/v5`);
    await testUtils.runCommand(testDir, "npm ", "compile", "--machine-readable", ...cmd);
    await testUtils.runCompiler("issue553");
    assert.ok(fs.existsSync("issue553/compiled/source/index.html"));
    let indexHtml = await fsPromises.readFile("issue553/compiled/source/index.html", "utf8");
    assert.ok(!!indexHtml.match(/issue553one\/boot.js/m));

    assert.end();
  } catch(ex) {
    assert.end(ex);
  }
});
