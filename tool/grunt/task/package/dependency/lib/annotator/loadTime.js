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
 * @module annotator.loadTime
 *
 * @desc
 * Annotator for esprima AST.
 *
 * <dl>
 *  <dt>What?</dt>
 *  <dd>boolean whether loadTime or not</dd>
 *  <dt>Where?</dt>
 *  <dd>specific nodes which also define an own scope
        (e.g. the global scope or the <code>defer</code>
        FunctionExpression)</dd>
 * </dl>
 */

/**
 * Augmentation key for tree.
 */
var annotateKey = "isLoadTime";

/**
 * Check whether node is <code>defer()</code> call.
 *
 * @param {Object} node - esprima node
 * @return {boolean}
 */
function isDeferFunction(node) {
  return (
    node.type === "FunctionExpression" &&
    node.parent &&
    node.parent.type === 'Property' &&
    node.parent.key &&
    node.parent.key.type === 'Identifier' &&
    node.parent.key.name === 'defer'
  );
}

/**
 * Check whether node is immediate call (i.e. <code>(function(){})()</code> aka
 *  <abbr title="Immediately-Invoked Function Expression">IIFE</abbr>).
 *
 * @param {Object} node - esprima node
 * @return {boolean}
 */
function isImmediateCall(node) {
  // find     a(function(){}()) => CE(CE(FE))
  // but not  a(function(){})   => CE(FE)
  return (node.type === "FunctionExpression"
          && node.parent
          && node.parent.type === "CallExpression"
          && node.parent.parent.type === "CallExpression");
}

module.exports = {
  /**
   * Annotate scope with load-/run-time marks.
   *
   * @param {Scope} scope
   * @param {boolean} parentLoad
   * @see {@link http://constellation.github.io/escope/Scope.html|Scope class}
   */
  annotate: function(scope, parentLoad) {
    var node = scope.block;
    if (scope.type === 'global') {
      scope[annotateKey] = true;
    } else if (scope.type === 'function') {
      if (isDeferFunction(node)) {
        scope[annotateKey] = true;
      } else if (isImmediateCall(node)) {
        scope[annotateKey] = parentLoad; // inherit
      } else {
        scope[annotateKey] = false;
      }
    } else {
      scope[annotateKey] = parentLoad; // inherit
    }
    for (var cld in scope.childScopes) {
      // recurse
      this.annotate(scope.childScopes[cld], scope[annotateKey]);
    }
  }
};
