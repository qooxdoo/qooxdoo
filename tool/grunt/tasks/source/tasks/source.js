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

// qx
var qxRes = require("qx-resources");
var qxLoc = require("qx-locales");
var qxDep = require("qx-dependencies");
var qxLib = require("qx-libraries");

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

//------------------------------------------------------------------------------
// Public Interface
//------------------------------------------------------------------------------

function runGruntTask(grunt) {

  grunt.registerMultiTask('source', 'create source version of current application', function() {
    var opts = this.options();

    // TODO: better way of getting this path? user may also want to override
    var loaderTemplatePath = "../../../data/generator/loader.tmpl.js";

    if (!grunt.file.exists(loaderTemplatePath)) {
      grunt.log.warn('Source file "' + loaderTemplatePath + '" not found.');
    }

    var locales = {"C":{}};
    opts.locales.forEach(function(locale){
      locales[locale] = {};
    });

    grunt.log.writeln('Scanning libraries ...');
    // -----------------------------------------
    var classPaths = qxLib.getPathsFor("class", opts.libraries);
    var resBasePathMap = qxLib.getPathsFor("resource", opts.libraries, {withKeys: true});
    grunt.log.ok('Done.');

    grunt.log.writeln('Collecting classes ...');
    // -----------------------------------------
    var classesDeps = qxDep.collectDepsRecursive(classPaths, opts.includes);
    grunt.log.ok('Done.');

    grunt.log.writeln('Sorting ' + Object.keys(classesDeps).length + ' classes ...');
    // -------------------------------------------------------------
    var classListLoadOrder = qxDep.sortDepsTopologically(classesDeps, "load");
    var classListPaths = qxDep.translateClassIdsToPaths(classListLoadOrder);
    var atHintIndex = qxDep.createAtHintsIndex(classesDeps);
    grunt.log.ok('Done.');

    grunt.log.writeln('Get cldr ...');
    // -------------------------------
    var cldrData = qxLoc.getTailoredCldrData("en");
    grunt.log.ok('Done.');

    grunt.log.writeln('Get resources ...');
    // ------------------------------------
    var resData = qxRes.collectImageInfoMaps(atHintIndex.asset, resBasePathMap, {metaFiles: true});
    grunt.log.ok('Done.');
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
    var locResTransFileName = opts.appName + "." + locResTransHash + ".js";

    // {"uris":["__out__:myapp.e2c18d74cbbe.js","qx:qx/Bootstrap.js", ...]}};
    var packagesUris = {
      "uris": ["__out__:"+locResTransFileName].concat(classListPaths)
    };

    // TODO: get from Gruntfile or query somewhere (e.g. sourceUri & resourceUri et al.)
    var libinfo = {"__out__":{"sourceUri":"script"},"myapp":{"resourceUri":"../source/resource","sourceUri":"../source/class"},"qx":{"resourceUri":"../../../../../../../../framework/source/resource","sourceUri":"../../../../../../../../framework/source/class","sourceViewUri":"https://github.com/qooxdoo/qooxdoo/blob/%{qxGitBranch}/framework/source/class/%{classFilePath}#L%{lineNumber}"}};

    // TODO: get from Gruntfile or query somewhere
    var ctx = {
      EnvSettings: {"qx.application":"myapp.Application","qx.revision":"","qx.theme":"myapp.theme.Theme","qx.version":"3.6"},
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
    // ---------------------------------------------
    var tmpl = grunt.file.read(loaderTemplatePath);
    // console.log(renderLoaderTmpl(tmpl, ctx));
    var renderedTmpl = renderLoaderTmpl(tmpl, ctx);
    // console.log(locResTransContent);

    var appFileName = opts.appName + ".js";

    // Write the destination file.
    grunt.file.write(path.join(opts.sourcePath, appFileName), renderedTmpl);
    grunt.file.write(path.join(opts.sourcePath, locResTransFileName), locResTransContent);
    grunt.log.ok('Done.');
  });

}

//------------------------------------------------------------------------------
// Exports
//------------------------------------------------------------------------------

module.exports = runGruntTask;
