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
  const templatePath = path.resolve(qxPath + "/source/resource/qx/tool/compiler/cli/templates");
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
       * Test Issue 10693 - Property accessor metadata generation
       */
      .then(async () => {
        let metaDb = new qx.tool.compiler.MetaDatabase().set({
          rootDir: "meta"
        });
        await metaDb.addFile("testapp/source/class/testapp/Issue10693.js");
        await metaDb.reparseAll();
        return readJson("meta/testapp/Issue10693.json");
      })
      .then(issue10693Meta => {
        // Verify class metadata
        assert.equal(issue10693Meta.className, "testapp.Issue10693", "Issue10693: className");
        assert.equal(issue10693Meta.superClass, "qx.core.Object", "Issue10693: superClass");

        // Verify properties exist
        assert.ok(issue10693Meta.properties, "Issue10693: properties section exists");
        assert.ok(issue10693Meta.properties.myString, "Issue10693: myString property exists");
        assert.ok(issue10693Meta.properties.myBoolean, "Issue10693: myBoolean property exists");
        assert.ok(issue10693Meta.properties.myNumber, "Issue10693: myNumber property exists");
        assert.ok(issue10693Meta.properties.myAsync, "Issue10693: myAsync property exists");

        // Verify members section exists
        assert.ok(issue10693Meta.members, "Issue10693: members section exists");

        // Test string property accessors
        assert.ok(issue10693Meta.members.getMyString, "Issue10693: getMyString exists");
        assert.equal(issue10693Meta.members.getMyString.property, "myString", "Issue10693: getMyString has property field");
        assert.equal(issue10693Meta.members.getMyString.type, "function", "Issue10693: getMyString is a function");

        assert.ok(issue10693Meta.members.setMyString, "Issue10693: setMyString exists");
        assert.equal(issue10693Meta.members.setMyString.property, "myString", "Issue10693: setMyString has property field");

        assert.ok(issue10693Meta.members.resetMyString, "Issue10693: resetMyString exists");
        assert.equal(issue10693Meta.members.resetMyString.property, "myString", "Issue10693: resetMyString has property field");

        // Test boolean property accessors (should have both get and is)
        assert.ok(issue10693Meta.members.getMyBoolean, "Issue10693: getMyBoolean exists");
        assert.equal(issue10693Meta.members.getMyBoolean.property, "myBoolean", "Issue10693: getMyBoolean has property field");

        assert.ok(issue10693Meta.members.isMyBoolean, "Issue10693: isMyBoolean exists");
        assert.equal(issue10693Meta.members.isMyBoolean.property, "myBoolean", "Issue10693: isMyBoolean has property field");

        assert.ok(issue10693Meta.members.setMyBoolean, "Issue10693: setMyBoolean exists");
        assert.equal(issue10693Meta.members.setMyBoolean.property, "myBoolean", "Issue10693: setMyBoolean has property field");

        assert.ok(issue10693Meta.members.resetMyBoolean, "Issue10693: resetMyBoolean exists");
        assert.equal(issue10693Meta.members.resetMyBoolean.property, "myBoolean", "Issue10693: resetMyBoolean has property field");

        // Test number property accessors
        assert.ok(issue10693Meta.members.getMyNumber, "Issue10693: getMyNumber exists");
        assert.equal(issue10693Meta.members.getMyNumber.property, "myNumber", "Issue10693: getMyNumber has property field");

        assert.ok(issue10693Meta.members.setMyNumber, "Issue10693: setMyNumber exists");
        assert.equal(issue10693Meta.members.setMyNumber.property, "myNumber", "Issue10693: setMyNumber has property field");

        assert.ok(issue10693Meta.members.resetMyNumber, "Issue10693: resetMyNumber exists");
        assert.equal(issue10693Meta.members.resetMyNumber.property, "myNumber", "Issue10693: resetMyNumber has property field");

        // Test async property accessors
        assert.ok(issue10693Meta.members.getMyAsync, "Issue10693: getMyAsync exists");
        assert.equal(issue10693Meta.members.getMyAsync.property, "myAsync", "Issue10693: getMyAsync has property field");

        assert.ok(issue10693Meta.members.getMyAsyncAsync, "Issue10693: getMyAsyncAsync exists");
        assert.equal(issue10693Meta.members.getMyAsyncAsync.property, "myAsync", "Issue10693: getMyAsyncAsync has property field");

        assert.ok(issue10693Meta.members.setMyAsync, "Issue10693: setMyAsync exists");
        assert.equal(issue10693Meta.members.setMyAsync.property, "myAsync", "Issue10693: setMyAsync has property field");

        assert.ok(issue10693Meta.members.setMyAsyncAsync, "Issue10693: setMyAsyncAsync exists");
        assert.equal(issue10693Meta.members.setMyAsyncAsync.property, "myAsync", "Issue10693: setMyAsyncAsync has property field");

        assert.ok(issue10693Meta.members.resetMyAsync, "Issue10693: resetMyAsync exists");
        assert.equal(issue10693Meta.members.resetMyAsync.property, "myAsync", "Issue10693: resetMyAsync has property field");

        // Verify explicit method is not overwritten
        assert.ok(issue10693Meta.members.customMethod, "Issue10693: customMethod exists");
        assert.notOk(issue10693Meta.members.customMethod.property, "Issue10693: customMethod does not have property field");
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
        assert.ok(arr.length === 0, "unexpected unresolved " + JSON.stringify(arr) + " in testapp.Issue494");
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
    fs.access(name, fs.constants.F_OK, function (err) {
      if (err) {
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
