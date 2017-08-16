var test = require('tape');
var fs = require("fs");
var async = require("async");
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
  deleteRecursive("source-output")
    .then(() => createMaker())
    .then((_maker) => {
      maker = _maker;
      app = maker.getApplications()[0];
      return promisifyThis(maker.make, maker);
    })
    .then(() => readCompileInfo().then((tmp) => compileInfo = tmp))
    .then(() => readJson("test-deps-01-expected.json").then((tmp) => expected = tmp))
    .then(() => {
      assert.deepEqual(compileInfo.Uris, expected.Uris, "checking list of generated uris");
      assert.deepEqual(compileInfo.EnvSettings, expected.EnvSettings, "checking generated environment settings")
    })
    
    .then(() => {
      app.setExclude([ "qx.ui.layout.*" ]);
      app.setInclude([ "qx.util.format.DateFormat" ]);
      return promisifyThis(maker.make, maker);
    })
    .then(() => readCompileInfo().then((tmp) => compileInfo = tmp))
    .then(() => {
      compileInfo.Uris.forEach((uri) => {
        if (uri.indexOf("qx/ui/layout") > -1)
          assert.ok(false, "qx.ui.layout is not excluded, found " + uri);
      });
      assert.ok(compileInfo.Uris.indexOf("qx:qx/util/format/DateFormat.js") > -1, "qx.util.format.DateFormat is not included");
    })
    
    .then(() => {
      return readJson("source-output/transpiled/testapp/Application.json")
        .then((meta) => {
          function deleteLocation(obj) {
            if (typeof obj == "object") {
              delete obj.location;
              for (var name in obj)
                deleteLocation(obj[name]);
            }
          }
          deleteLocation(meta);
          return readJson("test-deps-03-expected.json").then((expected) => {
            assert.deepEqual(meta, expected, "comparing meta data");
          })
        });
    })
    
    .then(() => assert.end())
    .catch((err) => assert.end(err));
});

async function deleteRecursive(name) {
  return new Promise((resolve, reject) => {
    fs.exists(name, function(exists) {
      if (!exists)
        return resolve();
      deleteRecursiveImpl(name, (err) => {
        if (err)
          reject(err);
        else
          resolve(err);
      });
    });

    function deleteRecursiveImpl(name, cb) {
      fs.stat(name, function(err, stat) {
        if (err)
          return cb && cb(err);

        if (stat.isDirectory()) {
          fs.readdir(name, function(err, files) {
            if (err)
              return cb && cb(err);
            async.each(files,
                function(file, cb) {
                  deleteRecursiveImpl(name + "/" + file, cb);
                },
                function(err) {
                  if (err)
                    return cb && cb(err);
                  fs.rmdir(name, cb);
                });
          });
        } else {
          fs.unlink(name, cb);
        }
      });
    }
  });
}