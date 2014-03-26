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

/**
 * Wrapper for Manifest.json files. Reads them and provides their contents.
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

// native
var fs = require("fs");
var path = require("path");


//------------------------------------------------------------------------------
// Public Interface
//------------------------------------------------------------------------------

/**
 *  Extracts data from given Manifest.json paths:
 *
 *  * /provides/namespace
 *  * /provides/class
 *  * /provides/resource
 *  * /provides/translation
 *
 * @param filePaths {String{}}
 * @returns {Object[]}
 */
function getPathsFromManifest(filePaths) {
  var i = 0;
  var l = filePaths.length;
  var manifPath = "";
  var contents = "";
  var manif = "";
  var manifests = {};

  for (; i<l; i++) {
    manifPath = filePaths[i];
    if (!fs.existsSync(manifPath)) {
      throw Error("Can't read Manifest file at: " + manifPath);
    }
    contents = fs.readFileSync(manifPath, {encoding: 'utf8'});
    manif = JSON.parse(contents);
    manifests[manif.provides.namespace] = {
      base: {
        rel: path.dirname(manifPath),
        abs: path.resolve(path.dirname(manifPath))
      },
      class: manif.provides.class,
      resource: manif.provides.resource,
      translation: manif.provides.translation
    };
  }

  return manifests;
}

/**
 * Extracts data by kind ("class", "resource", "translation") from given
 * Manifest.json paths optionally with namespace key.
 *
 * @param filePaths {String[]}
 * @returns {Object[]}
 */
function getPathsFor(kind, filePaths, options) {
  var libPaths = getPathsFromManifest(filePaths);
  var validKinds = ["class", "resource", "translation"];
  var specificPathsWithKeys = {};
  var specificPaths = [];
  var lib = "";

  var opts = {};

  if (!options) {
    options = {};
  }

  // merge options and default values
  opts = {
    withKeys: options.withKeys === true ? true : false,
  };

  if (validKinds.indexOf(kind) === -1) {
    throw Error("Invalid kind ("+kind+"). Supported: "+validKinds);
  }

  for (lib in libPaths) {
    if (opts.withKeys) {
      specificPathsWithKeys[lib] = path.join(libPaths[lib].base.rel, libPaths[lib][kind]);
    } else {
      specificPaths.push(path.join(libPaths[lib].base.rel, libPaths[lib][kind]));
    }
  }

  return opts.withKeys ? specificPathsWithKeys : specificPaths;
}

//------------------------------------------------------------------------------
// Exports
//------------------------------------------------------------------------------

module.exports = {
  getPathsFromManifest : getPathsFromManifest,
  getPathsFor : getPathsFor
};

