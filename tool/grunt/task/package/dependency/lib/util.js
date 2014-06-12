/* *****************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2013-2014 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Thomas Herchenroeder (thron7)
     * Richard Sternagel (rsternagel)

***************************************************************************** */

'use strict';

/**
 * @module util
 *
 * @desc
 * Utility and helper methods.
 */

// third party
var _ = require('underscore');

//------------------------------------------------------------------------------
// Public Interface
//------------------------------------------------------------------------------

module.exports = {

  /**
   * Pipeline function calls to process data in steps.
   *
   * @param {Object[]} seed - data to be processed
   * @param {...function} funcs - funcs to be applied on data (in the given order)
   * @returns {Object[]} filtered data
   */
  pipeline: function(seed /*,funcs*/) {
    var funcs = _.toArray(arguments).slice(1);
    return _.reduce(funcs, function (accu,func) {
        return func(accu);
      }, seed);
  },

  /**
   * Swaps the first two args (e.g. to satisfy <code>_.filter()</code>).
   *
   * @param {function} predicate - function which returns a boolean
   * @param {Object[]} list - list which is tested against the predicate
   * @returns {Object[]} filtered list
   */
  filter: function(predicate, list) {
    return _.filter(list, predicate);
  },

  /**
   * Access deep object members in a safe way
   * (without having to check for every subproperty).
   *
   * @param {Object} obj
   * @param {string} propertyPath (e.g. 'animals.cats.lynx')
   * @returns {Object|undefined}
   */
  get: function(obj, propertyPath) {
    propertyPath.split('.').every(function(attr) {
      if (attr in obj) {
        obj = obj[attr];
        return true;
      } else {
        obj = undefined;
        // break iteration
        return false;
      }
    });
    return obj;
  },

  /**
   * Returns namespace from class name by checking against
   * all namespaces (longest match wins).
   *
   * <ul>
   *  <li>"qx.Foo.Bar"   => "qx"      / allNa: ["qx", ...]</li>
   *  <li>"qx.Foo.Bar"   => "qx.Foo"  / allNa: ["qx", "qx.Foo", ...]</li>
   *  <li>"qxc.ui.Pane"  => "qxc.ui"  / allNa: ["qxc.ui.logpane", ...]</li>
   * </ul>
   *
   * @param {string} className
   * @param {string[]} allNamespaces
   * @returns {string|boolean} namespace
   */
  namespaceFrom: function(className, allNamespaces) {
    var exceptions = ["qxWeb", "q"];
    if (exceptions.indexOf(className) !== -1) {
      return "qx";
    }

    allNamespaces.sort(function(a, b){
      // asc -> a - b
      // desc -> b - a
      return b.length - a.length;
    });

    var i = 0;
    var l = allNamespaces.length;
    var curNs = "";
    for (; i<l; i++) {
      curNs = allNamespaces[i];
      if (className.indexOf(curNs) !== -1) {
        return curNs;
      }
    }

    return false;
  },

  /**
   * Converts a file path to a full-qualified class name.
   *
   * <code>"foo/baz/qx/foo/Bar.js" => "qx.foo.Bar"</code>
   *
   * @param {string} filePath - e.g. qx.foo.Bar
   * @param {string} [basePath] - e.g. foo/baz
   * @returns {string}
   */
  classNameFrom: function(filePath, basePath) {
    if (basePath) {
      basePath = basePath[basePath.length-1] === "/" ? basePath : basePath + "/";
      filePath = filePath.replace(basePath, "");
    }
    return filePath.replace(/\//g, ".").replace(".js", "");
  },

  /**
   * Converts a full-qualified class name to a file path.
   * basePath is not checked for existence and assumed to be appropriate!
   *
   * <code>"qx.foo.Bar" => "foo/baz/qx/foo/Bar.js"</code>
   *
   * @param {string} filePath - e.g. qx/foo/Bar.js
   * @param {string} [basePath] - e.g. foo/baz
   * @param {boolean} [withoutExt=true]
   * @returns {string}
   */
  filePathFrom: function(className, basePath, withoutExt) {
    var ext = (withoutExt === true) ? "" : ".js";
    var path = className.replace(/\./g, "/") + ext;
    basePath = (basePath)
               ? basePath[basePath.length-1] === "/" ? basePath : basePath + "/"
               : "";
    return basePath + path;
  }
};
