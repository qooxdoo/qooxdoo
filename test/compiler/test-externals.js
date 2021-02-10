const test = require("tape");
const testUtils = require("../../bin/tools/utils");
const fsPromises = testUtils.fsPromises;

test("test externals", async assert => {
  try {
    await testUtils.deleteRecursive("test-externals/myapp/compiled");
    await testUtils.runCompiler("test-externals/myapp", "--target=build", "--write-compile-info");
    
    let data = await fsPromises.readFile("test-externals/myapp/compiled/build/myapp/index.js", "utf8");
    assert.ok(!!data.match(/THIS_IS_A_JS/)); 
    assert.ok(!!data.match(/THIS_IS_B_JS/)); 
    assert.ok(!!data.match(/THIS_IS_C_JS/));
    assert.ok(!!data.match(/urisBefore: \[ "__external__:http:\/\/cdn.example.com\/my\/d.js" \]/)); 

    await testUtils.runCompiler("test-externals/myapp", "--write-compile-info");
    
    data = await fsPromises.readFile("test-externals/myapp/compiled/source/myapp/index.js", "utf8");
    assert.ok(!data.match(/THIS_IS_A_JS/)); 
    assert.ok(!data.match(/THIS_IS_B_JS/)); 
    assert.ok(!data.match(/THIS_IS_C_JS/)); 
    assert.ok(!data.match(/urisBefore: \[ "__external__:http:\/\/cdn.example.com\/my\/d.js" \]/)); 

    assert.end();
  }catch(ex) {
    assert.end(ex);
  }
});

