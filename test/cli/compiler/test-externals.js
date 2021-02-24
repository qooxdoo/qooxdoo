const test = require("tape");
const testUtils = require("../../../bin/tools/utils");
const fsPromises = testUtils.fsPromises;
require("process").cwd(__dirname);

test("test externals", async t => {
  try {

    await testUtils.deleteRecursive("test-externals/myapp/compiled");
    await testUtils.runCompiler("test-externals/myapp", "--target=build", "--write-compile-info");

    let data = await fsPromises.readFile("test-externals/myapp/compiled/build/myapp/index.js", "utf8");
    t.ok(!!data.match(/THIS_IS_A_JS/));
    t.ok(!!data.match(/THIS_IS_B_JS/));
    t.ok(!!data.match(/THIS_IS_C_JS/));
    t.ok(!!data.match(/urisBefore: \[ "__external__:http:\/\/cdn.example.com\/my\/d.js" \]/));

    await testUtils.runCompiler("test-externals/myapp", "--write-compile-info");

    data = await fsPromises.readFile("test-externals/myapp/compiled/source/myapp/index.js", "utf8");
    t.ok(!data.match(/THIS_IS_A_JS/));
    t.ok(!data.match(/THIS_IS_B_JS/));
    t.ok(!data.match(/THIS_IS_C_JS/));
    t.ok(!data.match(/urisBefore: \[ "__external__:http:\/\/cdn.example.com\/my\/d.js" \]/));

    t.end();
  } catch(ex) {
    t.end(ex);
  }
});

