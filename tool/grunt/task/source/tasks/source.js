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
 * grunt-qx-source
 */
'use strict';

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

// native
var crypto = require("crypto");
var path = require("path");
var url = require("url");

// third-party
var pathIsInside = require("path-is-inside");

// qx
var qxRes = require("qx-resource");
var qxLoc = require("qx-locale");
var qxDep = require("qx-dependency");
var qxLib = require("qx-library");
var qxTra = require("qx-translation");

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
    } else {
      tmpl = tmpl.replace(regex, JSON.stringify(ctx[tmplVar]));
    }
  }

  return tmpl;
}

function calculateRelPaths(manifestPaths, qxPath, appName, ns) {
  var resolved_qxPath = path.resolve(qxPath);
  var gruntDir = "tool/grunt";
  var rel = {
    qx: "",
    res: "",
    class: ""
  };
  // qx path depending on whether app is within qooxdoo sdk or not
  rel.qx = (pathIsInside(manifestPaths[appName].base.abs, resolved_qxPath))
           ? path.relative(manifestPaths[appName].base.abs, resolved_qxPath)
           : qxPath;

  // paths depending on whether app is within "tool/grunt" dir ('myapp' test app) or not
  if (pathIsInside(manifestPaths[appName].base.abs, path.join(resolved_qxPath, gruntDir))) {
    rel.res = url.resolve(path.join("../", manifestPaths[ns].resource), '');
    rel.class = url.resolve(path.join("../", manifestPaths[ns].class), '');
  } else {
    rel.res = url.resolve(path.join("../", manifestPaths[ns].base.rel, manifestPaths[ns].resource), '');
    rel.class = url.resolve(path.join("../", manifestPaths[ns].base.rel, manifestPaths[ns].class), '');
  }

  return rel;
}


//------------------------------------------------------------------------------
// Public Interface
//------------------------------------------------------------------------------

module.exports = function(grunt) {
// function runGruntTask(grunt) {

  grunt.registerTask('source', 'create source version of current application', function() {
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
    var depsCollectingOptions = {variants: false, cachePath: opts.cachePath, buildType: "source"};
    var classesDeps = qxDep.collectDepsRecursive(classPaths, opts.includes, opts.excludes, opts.environment, depsCollectingOptions);
    grunt.log.ok('Done.');


    grunt.log.writeln('Sorting ' + Object.keys(classesDeps).length + ' classes ...');
    // ------------------------------------------------------------------------------
    var classListLoadOrder = qxDep.sortDepsTopologically(classesDeps, "load", opts.excludes);
    classListLoadOrder = qxDep.prependNamespace(classListLoadOrder, allNamespaces);
    var classListPaths = qxDep.translateClassIdsToPaths(classListLoadOrder);
    var atHintIndex = qxDep.createAtHintsIndex(classesDeps);
    grunt.log.ok('Done.');


    grunt.log.writeln('Get resources ...');
    // ------------------------------------
    var macroToExpansionMap = {
      "${qx.icontheme}": opts.qxIconTheme
    };
    var assetNsBasesPaths = qxRes.flattenExpandAndGlobAssets(atHintIndex.asset, resBasePathMap, macroToExpansionMap);
    var resData = qxRes.collectResources(assetNsBasesPaths, resBasePathMap, {metaFiles: true});
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

    // {"uris":["__out__:myapp.e2c18d74cbbe.js","qx:qx/Bootstrap.js", ...]};
    var packagesUris = {
      "uris": ["__out__:"+locResTransFileName].concat(classListPaths)
    };

    var libinfo = { "__out__":{"sourceUri":"script"} };
    var manifestPaths = qxLib.getPathsFromManifest(opts.libraries);
    var relPaths = {};
    var ns = "";
    for (ns in manifestPaths) {
      relPaths = calculateRelPaths(manifestPaths, opts.qxPath, opts.appName, ns);
      libinfo[ns] = {};
      if (ns === "qx") {
        libinfo[ns] = {
          "resourceUri": url.resolve(path.join('../', relPaths.qx, '/framework/source/resource'), ''),
          "sourceUri": url.resolve(path.join('../', relPaths.qx, '/framework/source/class'), ''),
          "sourceViewUri":"https://github.com/qooxdoo/qooxdoo/blob/%{qxGitBranch}/framework/source/class/%{classFilePath}#L%{lineNumber}"
        };
      } else {
        libinfo[ns].resourceUri = relPaths.res;
        libinfo[ns].sourceUri = relPaths.class;
      }
    }

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
      BootIsInline: false,             // ...
      NoCacheParam: false,             // ...
      DecodeUrisPlug: '',              // ...
      BootPart: '',                    // ...
    };

    grunt.log.writeln('Generate loader script ...');
    // ---------------------------------------------
    var tmpl = grunt.file.read(opts.loaderTemplate);
    var renderedTmpl = renderLoaderTmpl(tmpl, ctx);

    var appFileName = opts.appName + ".js";

    // write script files
    grunt.file.write(path.join(opts.sourcePath, appFileName), renderedTmpl);
    grunt.file.write(path.join(opts.sourcePath, locResTransFileName), locResTransContent);
    grunt.log.ok('Done.');
  });

};

//------------------------------------------------------------------------------
// Exports
//------------------------------------------------------------------------------

// module.exports = runGruntTask;
