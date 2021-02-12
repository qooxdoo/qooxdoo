const test = require("tape");
const testUtils = require("../../bin/tools/utils");
const fsPromises = testUtils.fsPromises;

async function simpleParsePo(filename) {
  let data = await fsPromises.readFile(filename, "utf8");
  let msgId = null;
  let po = {};
  data.split(/\n/).forEach(line => {
    if (line.startsWith("msgid")) {
      msgId = line.substring(6).replace(/\"/g, '');
    } else if (line.startsWith("msgstr")) {
      po[msgId] = line.substring(7).replace(/\"/g, '');
    }
  });
  return po;
}

test("test translation file update", async assert => {
  try {
    await testUtils.deleteRecursive("test-translation/tranapp/compiled");
    await testUtils.safeDelete("test-translation/tranapp/source/translation/en.po");
    await fsPromises.writeFile("test-translation/tranapp/source/translation/en.po",
`
msgid "Lib Override"
msgstr "lib-override-replaced-value"
`, "utf8");
    await testUtils.runCompiler("test-translation/tranapp", "-u");
    let po = await simpleParsePo("test-translation/tranapp/source/translation/en.po");
    assert.ok(po["App Alpha"] !== undefined);
    assert.ok(po["App Beta"] !== undefined);
    assert.ok(po["App Charlie"] !== undefined);
    assert.ok(po["Lib Alpha"] === undefined);
    assert.ok(po["Lib Beta"] === undefined);
    assert.ok(po["Lib Charlie"] === undefined);

    await testUtils.runCompiler("test-translation/tranapp", "-u", "--library-po=untranslated");
    po = await simpleParsePo("test-translation/tranapp/source/translation/en.po");
    assert.ok(po["Lib Alpha"] === undefined);
    assert.ok(po["Lib Beta"] !== undefined);
    assert.ok(po["Lib Charlie"] !== undefined);

    await testUtils.runCompiler("test-translation/tranapp", "-u", "--library-po=all");
    po = await simpleParsePo("test-translation/tranapp/source/translation/en.po");
    assert.ok(po["Lib Alpha"] === "lib-alpha-value");
    assert.ok(po["Lib Beta"] !== undefined);
    assert.ok(po["Lib Charlie"] !== undefined);
    assert.ok(po["Lib Charlie"] !== undefined);

    let data = await fsPromises.readFile("test-translation/tranapp/compiled/source/tranapp/package-0.js", "utf8");
    assert.ok(!!data.match(/lib-override-replaced-value/));

    assert.end();
  }catch(ex) {
    assert.end(ex);
  }
});

