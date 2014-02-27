/*
 * grunt-qx-source
 */
'use strict';

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

// native
var crypto = require("crypto");
var path = require("path");

// qx
var qxRes = require("qx-resources");
var qxLoc = require("qx-locales");
var qxDep = require("qx-dependencies");

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

function createHashOver(content) {
  return crypto.createHash('sha1').update(content).digest("hex");
}

// templating

// Lo-Dash:
// _.templateSettings = {
//   'interpolate': /%{([^}]+)}/g
// };
// _.template('hello %{name}!', { 'name': 'jimbo' });

// grunt.template.addDelimiters("python", "%{", "}");
// var content = grunt.file.read(filepath);
// content = content.replace(/%\{/g, "%{=");
// var contentInterpolated = grunt.template.process(content, {data: ctx, delimiters: "python"});

function renderLoaderTmpl(tmpl, ctx) {
  var tmplVar = "";
  var regex = "";

  for (tmplVar in ctx) {
    regex = new RegExp("%\{"+tmplVar+"\}","g");
    if (ctx[tmplVar] === "") {
      tmpl = tmpl.replace(regex, "");
    } else {
      tmpl = tmpl.replace(regex, JSON.stringify(ctx[tmplVar]));
    }
  }

  return tmpl;
}

//------------------------------------------------------------------------------
// Public Interface
//------------------------------------------------------------------------------

function runGruntTask(grunt) {

  grunt.registerMultiTask('source', 'create source version of current application', function() {
    // Merge task-specific and/or target-specific options with these defaults.
    // TODO: merge proper options
    var options = this.options({
      punctuation: '.',
      separator: ', '
    });

    // TODO: get from Gruntfile or query somewhere
    var filepath = "../../../data/generator/loader.tmpl.js";
    var buildpath = "./tmp/source/script";
    var appName = "deptest";

    if (!grunt.file.exists(filepath)) {
      grunt.log.warn('Source file "' + filepath + '" not found.');
    }

    var locales = {"C":{},"en":{}};

    grunt.log.writeln('Collect classes ...');
    // TODO: get from Gruntfile or query somewhere
    var classesDeps = qxDep.collectDepsRecursive(
      ['/Users/rsternagel/workspace/depTest/source/class/',
       '../../../../framework/source/class/'],
      ['depTest/Application.js',
       'depTest/theme/Theme.js'],
      { "deptest": "depTest" }
    );
    grunt.log.ok('Done ...');

    grunt.log.writeln('Sort classes ...');
    var classListLoadOrder = qxDep.sortDepsTopologically(classesDeps, "load");
    var classListPaths = qxDep.translateClassIdsToPaths(classListLoadOrder);
    var atHintIndex = qxDep.createAtHintsIndex(classesDeps);
    grunt.log.ok('Done ...');

    // TODO: get from Gruntfile or query somewhere
    var absQxPath = "/Users/rsternagel/workspace/qooxdoo.git/";
    var absAppPath = "/Users/rsternagel/workspace/deptest/";
    var relQxResourcePath = "framework/source/resource";
    var relAppResourcePath = "source/resource";
    var resBasePathMap = {
      "qx": path.join(absQxPath, relQxResourcePath),
      "deptest": path.join(absAppPath, relAppResourcePath)
    };

    grunt.log.writeln('Get cldr ...');
    var cldrData = qxLoc.getTailoredCldrData("en");
    grunt.log.ok('Done ...');
    grunt.log.writeln('Get resources ...');
    var resData = qxRes.collectImageInfoMaps(atHintIndex.asset, resBasePathMap, {metaFiles:true});
    grunt.log.ok('Done ...');
    var translation = locales;

    var locResTrans = {
      "locales": {
        "C": cldrData,
        "en": cldrData
      },
      "resources": resData,
      "translations": translation
    };
    var locResTransContent = "qx.$$packageData['0']=" + JSON.stringify(locResTrans) + ";";

    var locResTransHash = createHashOver(locResTransContent).substr(0,12);
    var locResTransFileName = appName + "." + locResTransHash + ".js";

    var packagesUris = {
      "uris": ["__out__:"+locResTransFileName].concat(classListPaths)
    };

    // TODO: get from Gruntfile or query somewhere
    var libinfo = {"__out__":{"sourceUri":"script"},"deptest":{"resourceUri":"../source/resource","sourceUri":"../source/class"},"qx":{"resourceUri":"../../qooxdoo.git/framework/source/resource","sourceUri":"../../qooxdoo.git/framework/source/class","sourceViewUri":"https://github.com/qooxdoo/qooxdoo/blob/%{qxGitBranch}/framework/source/class/%{classFilePath}#L%{lineNumber}"}};
    // var packages = {"0":{"uris":["__out__:deptest.e2c18d74cbbe.js","qx:qx/Bootstrap.js"]}};

    // TODO: get from Gruntfile or query somewhere
    var ctx = {
      EnvSettings: {"qx.application":"deptest.Application","qx.revision":"","qx.theme":"deptest.theme.Theme","qx.version":"3.6"},
      Libinfo: libinfo,
      Resources: {},
      Translations: locales,
      Locales: locales,
      Parts: {"boot":[0]},
      Packages: {"0": packagesUris},
      UrisBefore: [],
      CssBefore: [],
      Boot: 'boot',
      ClosureParts: {},
      BootIsInline: false,
      NoCacheParam: false,
      DecodeUrisPlug: '',
      BootPart: '',
    };

    grunt.log.writeln('Generate loader script ...');
    var tmpl = grunt.file.read(filepath);
    // console.log(renderLoaderTmpl(tmpl, ctx));
    var renderedTmpl = renderLoaderTmpl(tmpl, ctx);
    // console.log(locResTransContent);
    grunt.log.ok('Done');

    var appFileName = appName + ".js";

    // Write the destination file.
    grunt.file.write(path.join(buildpath, appFileName), renderedTmpl);
    grunt.file.write(path.join(buildpath, locResTransFileName), locResTransContent);
  });

}

//------------------------------------------------------------------------------
// Exports
//------------------------------------------------------------------------------

module.exports = runGruntTask;
