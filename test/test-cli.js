const test = require("tape");
const fs = require("fs");
const qx = require("@qooxdoo/framework");
const testUtils = require("./utils");
const fsPromises = testUtils.fsPromises;

test("Issue553", async assert => {
  try {
    await testUtils.deleteRecursive("issue553/compiled");
    await testUtils.runCompiler("issue553");
    assert.ok(fs.existsSync("issue553/compiled/source/index.html"));
    let indexHtml = await fsPromises.readFile("issue553/compiled/source/index.html", "utf8");
    assert.ok(!!indexHtml.match(/issue553one\/boot.js/m));

    assert.end();
  }catch(ex) {
    assert.end(ex);
  }
});

test("Dynamic commands", async assert => {
  try {
    await testUtils.deleteRecursive("testapp/compiled");
    let result = await testUtils.runCommand("testapp", "qx", "testlib", "hello", "-t=4");
    assert.ok(result.output.match(/The commmand testlib; message=hello, type=4/));

    assert.end();
  }catch(ex) {
    assert.end(ex);
  }
});

test("Issue440", async assert => {
  try {
    await testUtils.deleteRecursive("issue440/compiled");
    let code = await fsPromises.readFile("issue440/source/class/issue440/Application.js", "utf8");
    code = code.split("\n");
    let errorLine = -1;
    code.forEach((line, index) => {
      if (line.match(/This is an error/i))
        errorLine = index;
    });

    let result;

    code[errorLine] = "This is an error";
    await fsPromises.writeFile("issue440/source/class/issue440/Application.js", code.join("\n"), "utf8");
    result = await testUtils.runCompiler("issue440");
    assert.ok(result.exitCode === 1);

    code[errorLine] = "new abc.ClassNoDef(); //This is an error";
    await fsPromises.writeFile("issue440/source/class/issue440/Application.js", code.join("\n"), "utf8");
    result = await testUtils.runCompiler("issue440", "--warnAsError");
    assert.ok(result.exitCode === 1);

    code[errorLine] = "new abc.ClassNoDef(); //This is an error";
    await fsPromises.writeFile("issue440/source/class/issue440/Application.js", code.join("\n"), "utf8");
    result = await testUtils.runCompiler("issue440");
    assert.ok(result.exitCode === 0);

    code[errorLine] = "//This is an error";
    await fsPromises.writeFile("issue440/source/class/issue440/Application.js", code.join("\n"), "utf8");
    result = await testUtils.runCompiler("issue440");
    assert.ok(result.exitCode === 0);
    assert.end();
  }catch(ex) {
    assert.end(ex);
  }
});

test("testLegalSCSS", async assert => {
  try {
    await testUtils.deleteRecursive("testLegalSCSS/compiled");
    let result = await testUtils.runCompiler("testLegalSCSS");
    assert.ok(fs.existsSync("testLegalSCSS/compiled/source/resource/testLegalSCSS/css/test_css.css"));
    assert.ok(fs.existsSync("testLegalSCSS/compiled/source/resource/testLegalSCSS/css/test_scss.css"));
    assert.ok(fs.existsSync("testLegalSCSS/compiled/source/resource/testLegalSCSS/css/test_theme_scss.css"));
    assert.ok(fs.existsSync("testLegalSCSS/compiled/source/resource/testLegalSCSS/scss/_styles.scss"));
    assert.ok(fs.existsSync("testLegalSCSS/compiled/source/resource/testLegalSCSS/scss/test_scss.scss"));
    assert.ok(fs.existsSync("testLegalSCSS/compiled/source/testLegalSCSS/boot.js"));
    let bootJS = await fsPromises.readFile("testLegalSCSS/compiled/source/testLegalSCSS/boot.js", "utf8");
    let pos1 = bootJS.indexOf("cssBefore");
    let pos2 = bootJS.indexOf("]", pos1 + 1);
    let test = bootJS.substring(pos1, pos2 + 1);
    assert.ok(test.indexOf("testLegalSCSS/css/test_css.css") > 0);
    assert.ok(test.indexOf("testLegalSCSS/css/test_scss.css") > 0);
    assert.ok(test.indexOf("testLegalSCSS/css/test_theme_scss.css") > 0);
    assert.end();
  }catch(ex) {
    assert.end(ex);
  }
});

