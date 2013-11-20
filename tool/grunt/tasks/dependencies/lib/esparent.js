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

/**
 * Annotate an Esprima AST with parent information.
 *
 */

var estraverse = require('estraverse');

function annotate (etree) {
  var controller = new estraverse.Controller();
  controller.traverse(etree, {
    enter : function (node, parent) {
      node.parent = parent;
    }
  });
}

module.exports = {
  annotate : annotate
};
