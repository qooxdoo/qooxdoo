/* *****************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2014 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Richard Sternagel (rsternagel)

***************************************************************************** */

/*
 * grunt-qx-build
 */
'use strict';

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

// native
var crypto = require("crypto");
var path = require("path");
var fs = require("fs");

// third-party
var shell = require('shelljs');

// qx
var qxRes = require("qx-resource");
var qxLoc = require("qx-locale");
var qxDep = require("qx-dependency");
var qxLib = require("qx-library");
var qxTra = require("qx-translation");
var qxCpr = require("qx-compression");

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

function createHashOver(content) {
  return crypto.createHash('sha1').update(content).digest("hex");
}

function renderLoaderTmpl(tmpl, ctx) {
  var tmplVar = "";
  var regex = "";

  for (tmplVar in ctx) {
    regex = new RegExp("%\{"+tmplVar+"\}","g");
    if (ctx[tmplVar] === "") {
      tmpl = tmpl.replace(regex, "");
    } if (ctx[tmplVar][0] === "_") {
      // get rid of '_' as first char which is used
      // to trigger preservation of dollar signs
      ctx[tmplVar] = ctx[tmplVar].substr(1).replace(/\$/g, "$$$$");
      tmpl = tmpl.replace(regex, ctx[tmplVar]);
    } else {
      tmpl = tmpl.replace(regex, JSON.stringify(ctx[tmplVar]));
    }
  }

  return tmpl;
}

//------------------------------------------------------------------------------
// Public Interface
//------------------------------------------------------------------------------

module.exports = function(grunt) {

  grunt.registerTask('build', 'create build version of current application', function() {
    var opts = this.options();
    // console.log(opts);

    if (!grunt.file.exists(opts.loaderTemplate)) {
      grunt.log.warn('Loader template file "' + opts.loaderTemplate + '" not found. Can\'t proceed.');
      throw new Error('ENOENT - Loader template file "' + opts.loaderTemplate + '" not found. Can\'t proceed.');
    }

    grunt.log.writeln('Scanning libraries ...');
    // -----------------------------------------
    var classPaths = qxLib.getPathsFor("class", opts.libraries, {withKeys: true});
    var resBasePathMap = qxLib.getPathsFor("resource", opts.libraries, {withKeys: true});
    var allNamespaces = Object.keys(classPaths);
    grunt.log.ok('Done.');


    grunt.log.writeln('Collecting classes ...');
    // -----------------------------------------
    var depsCollectingOptions = {variants: true, cachePath: opts.cachePath, buildType: "build"};
    var classesDeps = qxDep.collectDepsRecursive(classPaths, opts.includes, opts.excludes, opts.environment, depsCollectingOptions);
    grunt.log.ok('Done.');


    grunt.log.writeln('Sorting ' + Object.keys(classesDeps).length + ' classes ...');
    // ------------------------------------------------------------------------------
    var classLoadOrderList = qxDep.sortDepsTopologically(classesDeps, "load", opts.excludes);
    var classCodeList = qxDep.readFileContent(classLoadOrderList, classPaths);
    var atHintIndex = qxDep.createAtHintsIndex(classesDeps);
    grunt.log.ok('Done.');


    grunt.log.writeln('Get resources ...');
    // ------------------------------------
    var macroToExpansionMap = {
      "${qx.icontheme}": opts.qxIconTheme
    };
    var assetNsPaths = qxRes.flattenExpandAndGlobAssets(atHintIndex.asset, resBasePathMap, macroToExpansionMap);
    var resData = qxRes.collectResources(assetNsPaths, resBasePathMap, {metaFiles: true});
    grunt.log.ok('Done.');


    grunt.log.writeln('Get locale and translation data ...');
    // ------------------------------------------------------
    var locales = {"C": {}};
    var localeData = {"C": qxLoc.getTailoredCldrData("en") };
    var translationPaths = qxLib.getPathsFor("translation", opts.libraries);
    var transData = {"C": qxTra.getTranslationFor("en", translationPaths) };
    opts.locales.forEach(function(locale){
      locales[locale] = {};
      localeData[locale] = qxLoc.getTailoredCldrData(locale);
      transData[locale] = {};
      transData[locale] = qxTra.getTranslationFor(locale, translationPaths);
    });
    grunt.log.ok('Done.');


    var locResTrans = {
      "locales": localeData,
      "resources": resData,
      "translations": transData
    };
    var locResTransContent = "qx.$$packageData['0']=" + JSON.stringify(locResTrans) + ";";

    var locResTransHash = createHashOver(locResTransContent).substr(0,12);
    var locResTransFileName = opts.appName + "." + locResTransHash + ".js";

    // {"uris":["__out__:myapp.e2c18d74cbbe.js"]};
    var packagesUris = {
      "uris": ["__out__:"+locResTransFileName]
    };

    var libinfo = { "__out__":{"sourceUri":"script"} };
    var manifestPaths = qxLib.getPathsFromManifest(opts.libraries);
    var ns = "";
    for (ns in manifestPaths) {
      libinfo[ns] = {};
      libinfo[ns] = {
        "resourceUri": "resource",
        "sourceUri": "script",
      };
      if (ns === "qx") {
        libinfo.qx.sourceViewUri = "https://github.com/qooxdoo/qooxdoo/blob/%{qxGitBranch}/framework/source/class/%{classFilePath}#L%{lineNumber}";
      }
    }

    grunt.log.writeln('Compress code ...');
    // ------------------------------------------------------

    var classCodeCompressedList = [];
    var compressOpts = {privates: true, cachePath: opts.cachePath};
    var curClass = "";
    for (var i=0, l=classCodeList.length; i<l; i++) {
      // console.log(i, l, classLoadOrderList[i]);
      curClass = classLoadOrderList[i];
      classCodeCompressedList.push(qxCpr.compress(curClass, classCodeList[i], opts.environment, compressOpts));
    }
    grunt.log.ok('Done.');

    var bootPart = "_";
    bootPart += locResTransContent;
    bootPart += "\n";
    bootPart += "(function(){"+classCodeCompressedList.join("")+"})();";

    var ctx = {
      EnvSettings: opts.environment,
      Libinfo: libinfo,
      Resources: {},
      Translations: locales,
      Locales: locales,
      Parts: {"boot":[0]},             // TODO: impl missing
      Packages: {"0": packagesUris},   // ...
      UrisBefore: [],                  // ...
      CssBefore: opts.addCss || [],
      Boot: 'boot',                    // ...
      ClosureParts: {},                // ...
      BootIsInline: true,
      NoCacheParam: false,             // ...
      DecodeUrisPlug: '',              // ...
      BootPart: bootPart
    };

    grunt.log.writeln('Copy resources ...');
    // -------------------------------------
    if (!fs.existsSync(opts.buildPath)) {
      shell.mkdir(opts.buildPath);
    }
    shell.cp("-f", path.join(opts.sourcePath, 'index.html'), opts.buildPath);
    var buildResourcePath = path.join(opts.buildPath, 'resource');
    qxRes.copyResources(buildResourcePath, resBasePathMap, assetNsPaths);
    grunt.log.ok('Done.');


    grunt.log.writeln('Generate loader script ...');
    // ---------------------------------------------
    var tmpl = grunt.file.read(opts.loaderTemplate);
    var renderedTmpl = renderLoaderTmpl(tmpl, ctx);

    var appFileName = opts.appName + ".js";

    // write script files
    grunt.file.write(path.join(path.join(opts.buildPath, "script"), appFileName), renderedTmpl);
    grunt.log.ok('Done.');
  });

};
