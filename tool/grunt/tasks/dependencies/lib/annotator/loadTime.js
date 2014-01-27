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

/**
 * Annotator for esprima AST.
 *
 * What?
 *  boolean whether loadTime or not
 *
 * Where?
 *  some nodes
 */

/**
 * Augmentation key for tree.
 */
var annotateKey = "isLoadTime";

function isDeferFunction(node) {
  return (
    node.type === "FunctionExpression" &&
    node.parent.type === 'Property' &&
    node.parent.key.type === 'Identifier' &&
    node.parent.key.name === 'defer'
  );
}

function isImmediateCall(node) {
  return (node.type === "FunctionExpression"
          && node.parent.type === "CallExpression");
}

/**
 * Annotate escopes with load-/run-time marks.
 */
function annotate(scope, parent_load) {
    var node = scope.block;
    if (scope.type === 'global') {
      scope[annotateKey] = true;
    } else if (scope.type === 'function') {
      if (isDeferFunction(node)) {
        scope[annotateKey] = true;
      } else if (isImmediateCall(node)) {
        scope[annotateKey] = parent_load; // inherit
      } else {
        scope[annotateKey] = false;
      }
    } else {
      scope[annotateKey] = parent_load; // inherit
    }
    for (var cld in scope.childScopes) {
      annotate(scope.childScopes[cld], scope[annotateKey]);
    }
}

module.exports = {
  annotate : annotate,
};
