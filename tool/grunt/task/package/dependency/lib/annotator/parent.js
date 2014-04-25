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
 * @module annotator.parent
 *
 * @desc
 * Annotator for esprima AST.
 *
 * <dl>
 *  <dt>What?</dt>
 *  <dd>parent node</dd>
 *  <dt>Where?</dt>
 *  <dd>every node</dd>
 * </dl>
 */

// third party
var estraverse = require('estraverse');

/**
 * Augmentation key for tree.
 */
var annotateKey = "parent";

module.exports = {
  /**
   * Annotate tree with parent information.
   *
   * @param {Object} tree - esprima AST
   * @see {@link http://esprima.org/doc/#ast|esprima AST}
   */
  annotate: function(tree) {
    var controller = new estraverse.Controller();
    controller.traverse(tree, {
      enter : function (node, parent) {
        node[annotateKey] = parent;
      }
    });
  }
};
