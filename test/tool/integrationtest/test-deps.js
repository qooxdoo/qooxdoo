const qx = require("../qx");
const { test } = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
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
  var maker = new qx.tool.compiler.Maker().set({
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

  let analyzer = maker.getAnalyzer();
  analyzer.addLibrary(await qx.tool.compiler.app.Library.createLibrary(path.join(__dirname, "testapp")));
  analyzer.addLibrary(await qx.tool.compiler.app.Library.createLibrary(qxPath));
  analyzer.setBabelConfig({
    plugins: {
    }
  });

  return maker;
}

/**
 * Runs the maker through the Compiler API (required for full compilation).
 * Creates a Compiler, adds the maker, starts it, and waits for completion.
 */
async function runMaker(maker) {
  const compiler = new qx.tool.compiler.Compiler().set({
    metaDir: "test-deps-meta",
    maxWorkers: 1
  });
  await maker.init();
  compiler.addMaker(maker);
  const done = new Promise(resolve => compiler.addListenerOnce("allDone", resolve));
  await compiler.start();
  await done;
  await compiler.stop();
}

test("Dependencies and environment settings", async t => {
  function readJson(filename) {
    return readFile(filename, {encoding: "utf8"})
        .then(str => JSON.parse(str));
  }

  function readCompileInfo() {
    return readJson("test-deps/appone/compile-info.json");
  }

  function readClassInfo(classname) {
    return readJson("test-deps/transpiled/" + classname.replace(/\./g, "/") + ".json");
  }

  function hasClassDependency(compileInfo, classname) {
    return compileInfo.parts.some(part => part.classes.indexOf(classname) > -1);
  }

  function hasPackageDependency(compileInfo, packageName) {
    return compileInfo.parts.some(part => part.classes.some(classname => classname.indexOf(packageName) == 0));
  }

  // ─── Phase 1: Initial compilation ────────────────────────────────────────────
  await deleteRecursive("test-deps");
  await deleteRecursive("test-deps-meta");
  let maker = await createMaker();
  let app = maker.getApplications()[0];
  await runMaker(maker);
  if (app.getFatalCompileErrors()) {
    app.getFatalCompileErrors().forEach(classname => {
      console.log("Fatal errors in class " + classname);
    });
    throw new Error("Fatal errors in application");
  }
  let compileInfo = await readCompileInfo();

  await t.test("no auto-include of qx.util.format.NumberFormat", () => {
    assert.ok(!hasClassDependency(compileInfo, "qx.util.format.NumberFormat"), "qx.util.format.NumberFormat is automatically included");
  });

  // ─── Phase 2: Include / Exclude ──────────────────────────────────────────────
  await deleteRecursive("test-deps");
  await deleteRecursive("test-deps-meta");
  maker = await createMaker();
  app = maker.getApplications()[0];
  app.setExclude(["qx.ui.layout.*"]);
  app.setInclude(["qx.util.format.NumberFormat"]);
  await runMaker(maker);
  compileInfo = await readCompileInfo();

  await t.test("exclude qx.ui.layout.*", () => {
    assert.ok(!hasPackageDependency(compileInfo, "qx.ui.layout"), "qx.ui.layout.* was not excluded");
  });
  await t.test("include qx.util.format.NumberFormat", () => {
    assert.ok(hasClassDependency(compileInfo, "qx.util.format.NumberFormat"), "qx.util.format.NumberFormat is not included");
  });

  // ─── Phase 3: Full verification compilation ───────────────────────────────────
  await deleteRecursive("test-deps");
  await deleteRecursive("test-deps-meta");
  maker = await createMaker();
  app = maker.getApplications()[0];
  app.setExclude([]);
  app.setInclude(["testapp.MMyMixin"]);
  await runMaker(maker);
  compileInfo = await readCompileInfo();

  try {
    await fs.promises.mkdir("meta");
  } catch(ex) {}
  // MetaDatabase parses classes via a JobQueue, so it needs a started one; the default
  // (maxConcurrentJobs = 1) uses an in-process loopback worker.
  const jobQueue = new qx.tool.worker.JobQueue();
  await jobQueue.start();
  const metaDb = new qx.tool.compiler.meta.MetaDatabase(jobQueue).set({
    rootDir: "meta"
  });
  // MetaDatabase uses upath internally (forward slashes), so normalise the path accordingly
  metaDb.getDatabase().libraries = {
    testapp: { sourceDir: path.resolve("testapp/source/class").replace(/\\/g, "/") }
  };
  await metaDb.addFile("testapp/source/class/testapp/Application.js");
  await metaDb.reparseAll();
  await jobQueue.stop();
  const meta = await readJson("meta/testapp/Application.json");

  await t.test("translations", async () => {
    var ci = await readClassInfo("testapp.Application");
    let map = {};
    ci.translations.forEach(t => map[t.msgid] = t);
    assert.ok(!!map["translatedString"]);
    assert.ok(!!map["Call \"me\""]);
    assert.ok(!!map["This has\nsome\nnewlines"]);
  });

  await t.test("class reference in property annotation (testapp.anno.MyAnno)", async () => {
    var ci = await readClassInfo("testapp.Application");
    assert.ok(Boolean(ci.dependsOn["testapp.anno.MyAnno"]), "missing dependency on testapp.anno.MyAnno");
    assert.ok(Boolean(ci.dependsOn["testapp.anno.MyAnno"].load), "dependency on testapp.anno.MyAnno is not a load dependency");
  });

  await t.test("meta generation", () => {
    assert.equal(meta.className, "testapp.Application");
    assert.equal(meta.superClass, "qx.application.Standalone");
  });

  await t.test("Issue488 - unresolved symbols", async () => {
    var ci = await readClassInfo("testapp.Issue488");
    var arr = ci.unresolved.map(entry => entry.name);
    var map = {};
    arr.forEach(name => map[name] = 1);
    assert.ok(Boolean(map["request"]), "missing unresolved request in testapp.Issue488");
    assert.ok(Boolean(map["ro"]), "missing unresolved ro in testapp.Issue488");
    assert.ok(Boolean(map["dontKnow"]), "missing unresolved dontKnow in testapp.Issue488");
    assert.ok(Boolean(map["c"]), "missing unresolved c in testapp.Issue488");
    assert.ok(arr.length === 4, "unexpected unresolved " + JSON.stringify(arr) + " in testapp.Issue488");
  });

  await t.test("Issue494 - no unresolved symbols", async () => {
    var ci = await readClassInfo("testapp.Issue494");
    var arr = ci.unresolved || [];
    assert.ok(arr.length === 0, "unexpected unresolved " + JSON.stringify(arr) + " in testapp.Issue494");
  });

  await t.test("Issue495 - no unresolved symbols", async () => {
    var ci = await readClassInfo("testapp.Issue495");
    var arr = ci.unresolved || [];
    assert.ok(arr.length === 0, "unexpected unresolved " + JSON.stringify(arr) + " in testapp.Issue495");
  });

  await t.test("Issue500 - template literals", async () => {
    const src = await readFile("test-deps/transpiled/testapp/Issue500.js", "utf8");
    assert.ok(src.match(/Unable to launch monitor/), "Template Literals");
    assert.ok(src.match(/abcdef/), "Template Literals", "Ordinary Literals");
  });

  await t.test("Issue503 - no unresolved symbols", async () => {
    var ci = await readClassInfo("testapp.Issue503");
    var arr = ci.unresolved || [];
    assert.ok(arr.length === 0, "unexpected unresolved " + JSON.stringify(arr) + " in testapp.Issue503");
  });

  await t.test("Warnings1 - no unresolved symbols", async () => {
    var ci = await readClassInfo("testapp.Warnings1");
    var arr = ci.unresolved || [];
    assert.ok(arr.length === 0, "unexpected unresolved " + JSON.stringify(arr) + " in testapp.Warnings1");
  });

  await t.test("JSX transpilation", async () => {
    const src = await readFile("test-deps/transpiled/testapp/Application.js", "utf8");
    assert.ok(!!src.match(/jsx.dom\("div", null, "Hello World"\)/), "JSX");
  });

  await t.test("environment settings", async () => {
    const src = await readFile("test-deps/transpiled/testapp/Application.js", "utf8");
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
  });

  await t.test("conditional mixins", async () => {
    const src = await readFile("test-deps/transpiled/testapp/MMyMixin.js", "utf8");
    assert.ok(src.match(/mixedInIsTrue/), "Conditional Mixin part 1");
    assert.ok(!src.match(/mixedInIsFalse/), "Conditional Mixin part 2");
  });

  await t.test("aliased this - TestThat1", async () => {
    const src = await readFile("test-deps/transpiled/testapp/TestThat1.js", "utf8");
    assert.ok(src.match(/testapp\.TestThat1\.superclass\.prototype\.toHashCode\.call\(other\)/), "Aliased this");
  });

  await t.test("aliased this - TestThat2", async () => {
    const src = await readFile("test-deps/transpiled/testapp/TestThat2.js", "utf8");
    assert.ok(src.match(/testapp\.TestThat2\.superclass\.prototype\.toHashCode\.call\(other\)/), "Aliased this");
  });

  await t.test("index.html generation", async () => {
    const src = await readFile("test-deps/index.html", "utf8");
    assert.ok(src.match(/src="appone\/index\.js.*"/), "Default application");
  });

  await t.test("SCSS generation", async () => {
    const src = await readFile("test-deps/resource/testapp/scss/root.css", "utf8");
    assert.ok(src.match(/url\(\"sub5\/image.png\"\)/), "Resource SCSS");
  });
});

async function deleteRecursive(name) {
  await fs.promises.rm(name, { recursive: true, force: true });
}
