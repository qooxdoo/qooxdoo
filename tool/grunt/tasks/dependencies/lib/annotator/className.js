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
 * Annotator for esprima AST.
 *
 * What?
 *  fqClassName from file path.
 *
 * Where?
 *  tree root node
 */

var util = require('../util');

/**
 * Augmentation key for tree.
 */
var annotateKey = "qxClassName";

/**
 * Annotate tree with full quallified class name.
 *
 *  "foo/bar/qx/Foo/Bar.js" => "qx.Foo.Bar"
 */
function annotate (tree, filePath) {
  tree[annotateKey] = util.classNameFrom(filePath);
}

module.exports = {
  annotate : annotate
};

