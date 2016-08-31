var fs = require("fs");
var path = require("path");
var async = require("async");
var qx = require("qooxdoo");
var qxcompiler = require("../../../lib/qxcompiler");

var CommandLine = qxcompiler.cli.CommandLine;
var Assert = qx.core.Assert;

function testParseImpl(cb) {
  var data = CommandLine.parseImpl((
    "node mytestapp.js --target source --output-path ../../testdata/qxt/source-output " +
    "--locale en --locale es " +
    "--set alpha=one --set bravo=two " +
    "--app-class a.b.MyApplication --app-theme qx.theme.Modern --app-name appone " +
    "--app-class a.b.AnotherApplication " +
    "--library ../../../qooxdoo/framework --library ../../testdata/qxt/source").split(' '));
  Assert.assertEquals(qxcompiler.targets.SourceTarget, data.targetClass);
  Assert.assertEquals("../../testdata/qxt/source-output", data.outputPath);
  Assert.assertArrayEquals(["en", "es"], data.locales);
  Assert.assertEquals("one", data.environment.alpha);
  Assert.assertEquals("two", data.environment.bravo);
  Assert.assertEquals(2, data.applications.length);
  Assert.assertEquals("a.b.MyApplication", data.applications[0].appClass);
  Assert.assertEquals("qx.theme.Modern", data.applications[0].theme)
  Assert.assertEquals("appone", data.applications[0].name)
  Assert.assertEquals("a.b.AnotherApplication", data.applications[1].appClass);
  Assert.assertUndefined(data.applications[1].theme);
  Assert.assertUndefined(data.applications[1].name);
  Assert.assertEquals(2, data.libraries.length);
  Assert.assertEquals("../../../qooxdoo/framework", data.libraries[0]);
  Assert.assertEquals("../../testdata/qxt/source", data.libraries[1]);

  cb();
}

function assertMaker(maker) {
  var target = maker.getTarget();
  Assert.assertTrue(target instanceof qxcompiler.targets.SourceTarget);
  Assert.assertEquals("../../../testdata/qxt/source-output/", target.getOutputDir());
  Assert.assertArrayEquals(["en", "es"], target.getLocales());

  var environment = maker.getEnvironment();
  Assert.assertEquals("one", environment.alpha);
  Assert.assertEquals("two", environment.bravo);

  var applications = maker.getApplications();
  Assert.assertEquals(2, applications.length);
  Assert.assertEquals("a.b.MyApplication", applications[0].getClassName());
  Assert.assertEquals("qx.theme.Modern", applications[0].getTheme())
  Assert.assertEquals("appone", applications[0].getName())
  Assert.assertEquals("a.b.AnotherApplication", applications[1].getClassName());
  Assert.assertEquals("qx.theme.Simple", applications[1].getTheme())
  Assert.assertEquals("index", applications[1].getName())

  var analyser = maker.getAnalyser();
  Assert.assertEquals(2, analyser.getLibraries().length);
  Assert.assertEquals(path.resolve("../../../../qooxdoo/framework"), analyser.findLibrary("qx").getRootDir());
  Assert.assertEquals(path.resolve("../../../testdata/qxt"), analyser.findLibrary("qxt").getRootDir());
}

function testConfigureJson(cb) {
  CommandLine.configure("sample1.qxcompiler.js", function(err, maker) {
    if (err)
      return cb(err);

    assertMaker(maker);
    cb();
  });
}

function testConfigureJs(cb) {
  CommandLine.configure("sample2.qxcompiler.js", function(err, maker) {
    if (err)
      return cb(err);

    assertMaker(maker);
    var environment = maker.getEnvironment();
    Assert.assertEquals("three", environment.charlie);
    cb();
  });
}

async.series([ testParseImpl, testConfigureJson, testConfigureJs ], function(err) {
  if (err)
    throw err;
  console.log("Done");
});