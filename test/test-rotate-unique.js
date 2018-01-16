var test = require('tape');
var fs = require("fs");
var async = require("async");
const {promisify, promisifyThis} = require("../lib/qx/tool/compiler/util");
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
require("../lib");

test('Checks rotateUnique', (assert) => {

  var p = Promise.resolve();
  for (var i = 1; i < 6; i++)
    p = p.then(qx.tool.compiler.files.Utils.safeUnlink("test-rotate-unique.txt." + i));
  p.then(async () => {
    for (var i = 1; i < 10; i++) {
      await qx.tool.compiler.files.Utils.rotateUnique("test-rotate-unique.txt", 5);
      fs.writeFileSync("test-rotate-unique.txt", "This is version " + i, "utf8");
    }
    assert.ok(!!await qx.tool.compiler.files.Utils.safeStat("test-rotate-unique.txt"));
    assert.ok(!!await qx.tool.compiler.files.Utils.safeStat("test-rotate-unique.txt.1"));
    assert.ok(!!await qx.tool.compiler.files.Utils.safeStat("test-rotate-unique.txt.2"));
    assert.ok(!!await qx.tool.compiler.files.Utils.safeStat("test-rotate-unique.txt.3"));
    assert.ok(!!await qx.tool.compiler.files.Utils.safeStat("test-rotate-unique.txt.4"));
    assert.ok(!!await qx.tool.compiler.files.Utils.safeStat("test-rotate-unique.txt.5"));
    assert.ok(!await qx.tool.compiler.files.Utils.safeStat("test-rotate-unique.txt.6"));
    assert.ok(!await qx.tool.compiler.files.Utils.safeStat("test-rotate-unique.txt.7"));
    assert.ok(!await qx.tool.compiler.files.Utils.safeStat("test-rotate-unique.txt.8"));
    assert.end();
  });
});

