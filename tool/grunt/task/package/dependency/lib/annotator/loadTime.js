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
 * Annotate deps of static method calls within <code>defer()</code>
 * as load time (cause defer is load time too).
 *
 * @param {Scope} scope
 */
function recurseAndAnnotateDeferDeps(scope) {
  // statics arg should be first arg of defer func
  var staticsArgName = (scope.variables && scope.variables[1] && scope.variables[1].name)
                       ? scope.variables[1].name
                       : 'statics';

  // store all scopes by name to be able to easily annotate them
  var otherScopes = scope.upper.childScopes;
  var otherScopesByName = {};
  for (var i in otherScopes) {
    if (otherScopes[i].block
        && otherScopes[i].block.parent
        && otherScopes[i].block.parent.parent
        && otherScopes[i].block.parent.parent.parent
        && otherScopes[i].block.parent.parent.parent.key
        && otherScopes[i].block.parent.parent.parent.key.name
        && otherScopes[i].block.parent.parent.parent.key.name === "statics") {
      var methodName = otherScopes[i].block.parent.key.name;
      otherScopesByName[methodName] = otherScopes[i];
    }
  }

  var body = scope.variableScope.block.body.body;
  if (body) {
    for (var line in body) {
      if (body[line].type && body[line].type === "ExpressionStatement") {
        // is there a call which looks like statics.xyz()?
        if (body[line].expression
            && body[line].expression.callee
            && body[line].expression.callee.object
            && body[line].expression.callee.object.name
            && body[line].expression.callee.object.name === staticsArgName) {
          // this is xyz
          var staticMethod = body[line].expression.callee.property.name;
          // now find the matching scope and annotate it
          if (otherScopesByName[staticMethod]) {
            otherScopesByName[staticMethod][annotateKey] = true;
          }
        }
      }
    }
  }
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
        recurseAndAnnotateDeferDeps(scope);
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
