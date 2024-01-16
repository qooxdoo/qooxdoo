const qx = require("../qx");
const test = require("tape");
const fs = require("fs");
const async = require("async");
const {promisify} = require("util");
const readFile = promisify(fs.readFile);
const process = require("process");
const path = require("path");

process.chdir(__dirname);

async function createMaker() {
  const qxPath = path.resolve(__dirname + "/../../..");
  const templatePath = path.resolve(qxPath + "/source/resource/qx/tool/cli/templates");
  qx.tool.compiler.ClassFile.JSX_OPTIONS = {
    "pragma": "jsx.dom",
    "pragmaFrag": "jsx.Fragment"
  };
  // Makers use an Analyser to figure out what the Target should write
  var maker = new qx.tool.compiler.makers.AppMaker().set({
    // Targets know how to output an application
    target: new qx.tool.compiler.targets.SourceTarget("test-deps").set({
      writeCompileInfo: true,
      updatePoFiles: true,
      environment: {
        envVar1: "ONE",
        envVar2: "TWO",
        runtimeVar: "RUNTIMEVAR",
        "test.overridden4": "target",
        "test.overridden5": "target"
      },
      preserveEnvironment: [ "runtimeVar" ]
    }),
    locales: ["en"],
    writeAllTranslations: true,
    environment: {
      envVar1: "one",
      envVar2: "two",
      envVar3: "three",
      envVar4: "four",
      "test.isFalse": false,
      "test.isTrue": true,
      "test.someValue": "some",
      "test.appValue": false,
      "test.overridden1": false,
      "test.overridden2": true,
      "test.overridden3": "global",
      "test.overridden4": "global",
      "test.overridden5": "global"
    }
  });
  maker.addApplication(new qx.tool.compiler.app.Application("testapp.Application").set({
    theme: "qx.theme.Indigo",
    name: "appone",
    environment: {
      envVar2: "222",
      envVar3: "333",
      "test.appValue": true,
      "qx.promise": false,
      "test.overridden1": true,
      "test.overridden2": false,
      "test.overridden5": "application"
    },
    templatePath,
    writeIndexHtmlToRoot: true
  }));

  maker.addApplication(new qx.tool.compiler.app.Application("testapp.Application").set({
    theme: "qx.theme.Indigo",
    name: "apptwo",
    environment: {
      envVar2: "222",
      envVar3: "apptwo-envVar3",
      "test.appValue": true,
      "qx.promise": true,
      "test.overridden1": true,
      "test.overridden2": false,
      "test.overridden5": "application"
    },
    templatePath
  }));

  let analyser = maker.getAnalyser();
  analyser.addLibrary(await qx.tool.compiler.app.Library.createLibrary(path.join(__dirname, "testapp")));
  analyser.addLibrary(await qx.tool.compiler.app.Library.createLibrary(qxPath));
  analyser.setBabelConfig({
    plugins: {
    }
  });

  return maker;
}

test("Checks dependencies and environment settings", assert => {
  function readJson(filename) {
    return readFile(filename, {encoding: "utf8"})
        .then(str => JSON.parse(str));
  }

  function readCompileInfo() {
    return readJson("test-deps/appone/compile-info.json");
  }

  function readDbJson() {
    return readJson("test-deps/db.json");
  }

  function hasClassDependency(compileInfo, classname) {
    return compileInfo.parts.some(part => part.classes.indexOf(classname) > -1);
  }

  function hasPackageDependency(compileInfo, packageName) {
    return compileInfo.parts.some(part => part.classes.some(classname => classname.indexOf(packageName) == 0));
  }

  var maker;
  var app;
  var compileInfo;
  var db;
  var meta;
  deleteRecursive("test-deps")
      .then(() => createMaker())
      .then(_maker => {
        maker = _maker;
        app = maker.getApplications()[0];
        return maker.make()
          .then(() => {
            if (app.getFatalCompileErrors()) {
              app.getFatalCompileErrors().forEach(classname => {
                console.log("Fatal errors in class " + classname);
              });
              throw new Error("Fatal errors in application");
            }
          });
      })
      .then(() => readCompileInfo().then(tmp => compileInfo = tmp))
      .then(() => {
        // qx.util.format.NumberFormat is included manually later on, so this needs to be not included automatically now
        assert.ok(!hasClassDependency(compileInfo, "qx.util.format.NumberFormat"), "qx.util.format.NumberFormat is automatically included");
      })

      /*
       * Test manual include and exclude
       */
      .then(() => createMaker())
      .then(_maker => {
        maker = _maker;
        app = maker.getApplications()[0];
        app.setExclude(["qx.ui.layout.*"]);
        app.setInclude(["qx.util.format.NumberFormat"]);
        return maker.make();
      })
      .then(() => readCompileInfo().then(tmp => compileInfo = tmp))
      .then(() => {
        assert.ok(!hasPackageDependency(compileInfo, "qx.ui.layout"), "qx.ui.layout.* was not excluded");
        assert.ok(hasClassDependency(compileInfo, "qx.util.format.NumberFormat"), "qx.util.format.NumberFormat is not included");
      })
      // Undo the exclude/include
      .then(() => createMaker())
      .then(_maker => {
        maker = _maker;
        app = maker.getApplications()[0];
        app.setExclude([]);
        app.setInclude([]);
        return maker.make();
      })
      .then(() => readCompileInfo().then(tmp => compileInfo = tmp))
      .then(() => readDbJson().then(tmp => db = tmp))
      .then(async () => {
        try {
          await fs.promises.mkdir("meta");
        }catch(ex) {}
        let metaDb = new qx.tool.compiler.MetaDatabase().set({
          rootDir: "meta"
        });

        await metaDb.addFile("testapp/source/class/testapp/Application.js");
        await metaDb.reparseAll();
      })
      .then(() => readJson("meta/testapp/Application.json")
      .then(tmp => meta = tmp))

      /**
       * Text translation
       */
      .then(() => {
        var ci = db.classInfo["testapp.Application"];
        let map = {};
        ci.translations.forEach(t => map[t.msgid] = t);
        assert.ok(!!map["translatedString"]);
        assert.ok(!!map["Call \"me\""]);
        assert.ok(!!map["This has\nsome\nnewlines"]);
      })

      /*
       * Test class references in the property definition, eg annotation
       */
      .then(() => {
        var ci = db.classInfo["testapp.Application"];
        assert.ok(Boolean(ci.dependsOn["testapp.anno.MyAnno"]), "missing dependency on testapp.anno.MyAnno");
        assert.ok(Boolean(ci.dependsOn["testapp.anno.MyAnno"].load), "dependency on testapp.anno.MyAnno is not a load dependency");
      })

      /*
       * Test meta generation
       */
      .then(() => {
        assert.equal(meta.className, "testapp.Application");
        assert.equal(meta.superClass, "qx.application.Standalone");
      })

      /*
       * Test unresolved symbols
       */
      .then(() => {
        var ci = db.classInfo["testapp.Issue488"];
        var arr = ci.unresolved.map(entry => entry.name);
        var map = {};
        arr.forEach(name => map[name] = 1);
        assert.ok(Boolean(map["abc"]), "missing unresolved abc in testapp.Issue488");
        assert.ok(Boolean(map["request"]), "missing unresolved request in testapp.Issue488");
        assert.ok(Boolean(map["ro"]), "missing unresolved to in testapp.Issue488");
        assert.ok(Boolean(map["dontKnow"]), "missing unresolved dontKnow in testapp.Issue488");
        assert.ok(Boolean(map["c"]), "missing unresolved dontKnow in testapp.Issue488");
        assert.ok(arr.length === 5, "unexpected unresolved " + JSON.stringify(arr) + " in testapp.Issue488");
      })

      /*
       * Test Issue494
       */
      .then(src => {
        var ci = db.classInfo["testapp.Issue494"];
        var arr = ci.unresolved||[];
        // part of the top-level objects injection process causes these symbols to occur in the file, and appear to be unresolved.
        assert.ok(
          arr &&
          arr.length === 2 &&
          arr[0].name === "testapp.Issue494PartThree.superclass.prototype._createQxObjectImpl.call" &&
          arr[1].name === "testapp.Issue494PartTwo.superclass.prototype._createQxObjectImpl.call",
          "unexpected unresolved " + JSON.stringify(arr.slice(2)) + " in testapp.Issue494"
        );
      })

      /*
       * Test Issue495
       */
      .then(src => {
        var ci = db.classInfo["testapp.Issue495"];
        var arr = ci.unresolved||[];
        assert.ok(arr.length === 0, "unexpected unresolved " + JSON.stringify(arr) + " in testapp.Issue495");
      })

      /*
       * Test Issue500
       */
      .then(() => readFile("test-deps/transpiled/testapp/Issue500.js", "utf8"))
      .then(src => {
        assert.ok(src.match(/Unable to launch monitor/), "Template Literals");
        assert.ok(src.match(/abcdef/), "Template Literals", "Ordinary Literals");
      })

      /*
       * Test Issue503
       */
      .then(src => {
        var ci = db.classInfo["testapp.Issue503"];
        var arr = ci.unresolved||[];
        assert.ok(arr.length === 0, "unexpected unresolved " + JSON.stringify(arr) + " in testapp.Issue503");
      })

      /*
       * Test Warnings
       */
      .then(src => {
        var ci = db.classInfo["testapp.Warnings1"];
        var arr = ci.unresolved||[];
        assert.ok(arr.length === 0, "unexpected unresolved " + JSON.stringify(arr) + " in testapp.Warnings");
      })



      /*
       * Test JSX
       */
      .then(() => readFile("test-deps/transpiled/testapp/Application.js", "utf8"))
      .then(src => {
        assert.ok(!!src.match(/jsx.dom\("div", null, "Hello World"\)/), "JSX");
      })


      /*
       * Test environment settings
       */
      .then(() => readFile("test-deps/transpiled/testapp/Application.js", "utf8")
      .then(src => {
        assert.ok(!src.match(/ELIMINATION_FAILED/), "Code elimination");
        assert.ok(src.match(/TEST_OVERRIDDEN_1/), "Overridden environment vars #1");
        assert.ok(!src.match(/TEST_OVERRIDDEN_2/), "Overridden environment vars #2");
        assert.ok(src.match(/var envVar1 = "ONE"/), "environment setting for envVar1");
        assert.ok(src.match(/var envVar2 = "222"/), "environment setting for envVar2");
        assert.ok(src.match(/var envVar3 = qx.core.Environment.get\("envVar3"\)/), "environment setting for envVar3");
        assert.ok(src.match(/var envVar4 = "four"/), "environment setting for envVar4");
        assert.ok(src.match(/var runtimeVar = qx.core.Environment.get/), "environment setting for runtimeVar");
        assert.ok(src.match(/var envTestOverriden3 = "global"/), "environment setting for envTestOverriden3");
        assert.ok(src.match(/var envTestOverriden4 = "target"/), "environment setting for envTestOverriden4");
        assert.ok(src.match(/var envTestOverriden5 = "application"/), "environment setting for envTestOverriden5");
        assert.ok(src.match(/var envVarSelect3 = 0/), "environment setting for envVarSelect3");
        assert.ok(src.match(/var envVarDefault1 = "some"/), "environment setting for envVarDefault1");
        assert.ok(src.match(/var envVarDefault2 = qx.core.Environment.get("test.noValue") || "default2"/), "environment setting for envVarDefault2");
        assert.ok(src.match(/var mergeStrings = "abcdefghi";/), "merging binary expressions: mergeStrings");
        assert.ok(src.match(/var mergeStringsAndNumbers = "abc23def45ghi";/), "merging binary expressions: mergeStringsAndNumbers");
        assert.ok(src.match(/var addNumbers = 138;/), "merging binary expressions: addNumbers");
        assert.ok(src.match(/var multiplyNumbers = 2952;/), "merging binary expressions: multiplyNumbers");
        assert.ok(src.match(/qx.core.Environment.get\("qx.promise"\)/), "override default env setting");
      }))

      .then(() => readFile("test-deps/transpiled/testapp/MMyMixin.js", "utf8")
      .then(src => {
        assert.ok(src.match(/mixedInIsTrue/), "Conditional Mixin part 1");
        assert.ok(!src.match(/mixedInIsFalse/), "Conditional Mixin part 2");
      }))

      .then(() => readFile("test-deps/transpiled/testapp/TestThat1.js", "utf8")
      .then(src => {
        assert.ok(src.match(/testapp\.TestThat1\.superclass\.prototype\.toHashCode\.call\(other\)/), "Aliased this");
      }))

      .then(() => readFile("test-deps/transpiled/testapp/TestThat2.js", "utf8")
      .then(src => {
        assert.ok(src.match(/testapp\.TestThat2\.superclass\.prototype\.toHashCode\.call\(other\)/), "Aliased this");
      }))

      /*
       * Test index.html generation
       */
      .then(async () => {
        let src = await readFile("test-deps/index.html", "utf8");
        assert.ok(src.match(/src="appone\/index\.js.*"/), "Default application");
      })

      /*
       * Test SCSS generation
       */
      .then(async () => {
        src = await readFile("test-deps/resource/testapp/scss/root.css", "utf8");
        assert.ok(src.match(/url\(\"sub5\/image.png\"\)/), "Resource SCSS");
      })

      .then(() => assert.end())
      .catch(err => assert.end(err));
});

async function deleteRecursive(name) {
  return new Promise((resolve, reject) => {
    fs.exists(name, function (exists) {
      if (!exists) {
        return resolve();
      }
      deleteRecursiveImpl(name, err => {
        if (err) {
          reject(err);
        } else {
          resolve(err);
        }
      });
      return null;
    });

    function deleteRecursiveImpl(name, cb) {
      fs.stat(name, function (err, stat) {
        if (err) {
          return cb && cb(err);
        }

        if (stat.isDirectory()) {
          fs.readdir(name, function (err, files) {
            if (err) {
              return cb && cb(err);
            }
            async.each(files,
                function (file, cb) {
                  deleteRecursiveImpl(name + "/" + file, cb);
                },
                function (err) {
                  if (err) {
                    return cb && cb(err);
                  }
                  fs.rmdir(name, cb);
                  return null;
                }
            );
            return null;
          });
        } else {
          fs.unlink(name, cb);
        }
        return null;
      });
    }
  });
}
