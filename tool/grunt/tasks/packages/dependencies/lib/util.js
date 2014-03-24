/* *****************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2006-2013 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Thomas Herchenroeder (thron7)

***************************************************************************** */

var _ = require('underscore');

function pipeline(seed /*,funcs*/) {
  var funcs = _.toArray(arguments).slice(1);
  return _.reduce(funcs, function(accu,func){return func(accu);}, seed);
}

/**
 * have to swap the first two args to _.filter)
 */
function filter(iterator, list) {
  return _.filter(list, iterator);
}

/**
 * Append sList to the end of tList.
 */
function concat(sList, tList) {
  return tList.concat(sList);
}

/**
 * Return namespace from className by checking against allNamespaces.
 *
 *  "qx.Foo.Bar"              => "qx"              allNa: ["qx", ...]
 *  "myapp.Foo.Bar"           => "myapp"           allNa: ["myapp", ...]
 *  "qxc.ui.logpane.LogPane"  => "qxc.ui.logpane"  allNa: ["qxc.ui.logpane", ...]
 */
function namespaceFrom(className, allNamespaces) {
  var exceptions = ["qxWeb", "q"];
  if (exceptions.indexOf(className) !== -1) {
    return "qx";
  }

  var namespace = "";
  var posNextDot = 0;
  var start = 0;
  do {
    start = posNextDot;
    posNextDot = (className.substr(start+1).indexOf(".")) + posNextDot+1;
    namespace = className.substr(0, posNextDot);
    // console.log(className, posNextDot, namespace, allNamespaces);
  } while (allNamespaces.indexOf(namespace) === -1);

  return namespace;
}

/**
 * File path to fqClassName conversion.
 *
 *  "foo/bar/qx/Foo/Bar.js" => "qx.Foo.Bar"
 */
function classNameFrom(filePath, basePath) {
  // bear in mind
  //  * ${APPLICATION}              => {appname}
  //  * ${APPLICATION_MAIN_CLASS}   => {appname}.Application
  //  * ${QXTHEME}                  => {appname}.theme.Theme
  if (basePath) {
    basePath = basePath[basePath.length-1] === "/" ? basePath : basePath + "/";
    filePath.replace(basePath, "");
  }
  return filePath.replace(/\//g, ".").replace(".js", "");
}

/**
 * FqClassName to file path conversion.
 * basePath is not checked and assumed to be appropriate!
 *
 *  "qx.Foo.Bar" => "foo/bar/qx/Foo/Bar.js"
 */
function filePathFrom(className, basePath, withoutExt) {
  var ext = (withoutExt === true) ? "" : ".js";
  var path = className.replace(/\./g, "/") + ext;
  basePath = (basePath)
             ? basePath[basePath.length-1] === "/" ? basePath : basePath + "/"
             : "";
  return basePath + path;
}

/** Safe access to deep object members */
function get(obj, propertyPath) {
  var o = obj;
  propertyPath.split('.').every(function(attr) {
    if (attr in o) {
      o = o[attr];
      return true;
    } else {
      o = undefined;
      // break iteration
      return false;
    }
  });
  return o;
}

module.exports = {
  pipeline: pipeline,
  filter: filter,
  concat: concat,
  namespaceFrom: namespaceFrom,
  classNameFrom: classNameFrom,
  filePathFrom: filePathFrom,
  get: get,
};
