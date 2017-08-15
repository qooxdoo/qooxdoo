var test = require('tape');
var fs = require("fs");
const {promisify, promisifyThis} = require("../lib/util");
const readFile = promisify(fs.readFile);
require("../lib/qxcompiler");

async function createMaker() {

  var STARTTIME = new Date();

  var QOOXDOO_PATH = "../../qooxdoo";

  // Makers use an Analyser to figure out what the Target should write
  var maker = new qxcompiler.makers.AppMaker().set({
    // Targets know how to output an application
    target: new qxcompiler.targets.SelfTestTarget("source-output"),
    locales: [ "en"  ],
    writeAllTranslations: true,
    environment: {
      envVar1: "one",
      envVar2: "two"
    }
  });
  maker.addApplication(new qxcompiler.app.Application("testapp.Application").set({
    theme: "testapp.theme.Theme",
    name: "appone",
    environment: {
      envVar2: "222",
      envVar3: "333"
    }
  }));

  return new Promise((resolve, reject) => {
    maker.addLibrary("testapp", function(err) {
      if (err)
        return reject(err);
      maker.addLibrary(QOOXDOO_PATH + "/framework", function(err) {
        if (err)
          reject(err);
        else
          resolve(maker);
      });
    });
  });
}

test('Checks dependencies and environment settings', (assert) => {

  function readJson(filename) {
    return readFile(filename, { encoding: "utf8" })
      .then((str) => JSON.parse(str));
  }
  function readCompileInfo() {
    return readJson("source-output/appone/compile-info.json");
  }

  var maker;
  var app;
  var compileInfo;
  var expected;
  createMaker()
    .then((_maker) => {
      maker = _maker;
      app = maker.getApplications()[0];
      return promisifyThis(maker.make, maker);
    })
    .then(() => readCompileInfo().then((tmp) => compileInfo = tmp))
    .then(() => readJson("test-deps-01-expected.json").then((tmp) => expected = tmp))
    .then(() => {
      assert.deepEqual(compileInfo.Uris, expected.Uris);
      assert.deepEqual(compileInfo.EnvSettings, expected.EnvSettings)
    })
    
    .then(() => {
      app.setExclude([ "qx.ui.layout.*" ]);
      app.setInclude([ "qx.util.format.DateFormat" ]);
      return promisifyThis(maker.make, maker);
    })
    .then(() => readCompileInfo().then((tmp) => compileInfo = tmp))
    .then(() => readJson("test-deps-02-expected.json").then((tmp) => expected = tmp))
    .then(() => {
      assert.deepEqual(compileInfo.Uris, expected.Uris);
      assert.deepEqual(compileInfo.EnvSettings, expected.EnvSettings)
    })
    
    .then(() => assert.end())
    .catch((err) => assert.end(err));
});

