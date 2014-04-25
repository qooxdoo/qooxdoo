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

'use strict';

/**
 * @module annotator.className
 *
 * @desc
 * Annotator for esprima AST.
 *
 * <dl>
 *   <dt>What?</dt>
 *   <dd>class id</dd>
 *   <dt>Where?</dt>
 *   <dd>tree root node</dd>
 * </dl>
 */

// local
var util = require('../util');

/**
 * Augmentation key for tree.
 */
var annotateKey = "qxClassName";

module.exports = {
  /**
   * Annotate tree with class id.
   *
   * @param {Object} tree - esprima AST
   * @param {string} classId - e.g. qx.foo.Bar
   * @see {@link http://esprima.org/doc/#ast|esprima AST}
   */
  annotate: function(tree, classId) {
    tree[annotateKey] = classId;
  }
};

