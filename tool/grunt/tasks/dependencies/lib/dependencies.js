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
 * Calculate external dependencies of an Esprima AST.
 *
 */

// Requirements

var escope = require('escope');
var esparent = require('./esparent');
var escodegen = require('escodegen');

function findVarRoot (var_node) {
  if (!{Identifier:1,MemberExpression:1}[var_node.type]) {
    return undefined;
  } else {
    while (var_node.parent 
      && var_node.parent.type === 'MemberExpression'
      && var_node.parent.computed == false) {
        var_node = var_node.parent;
      }
    return var_node;
  }
}

/**
 * Takes a variable AST node and returns the longest possible variable name.
 */
function assemble(var_node) {
  var var_root = findVarRoot(var_node);
  var assembled = escodegen.generate(var_root);
  return assembled;
}

function dependencies_from_ast(scope, optObj) {

  var dependencies = [];

  scope.through.forEach( function (ref) {
    if (!ref.resolved) {
      dependencies.push(ref);
    }
  });
  return dependencies;
}

function dependencies_from_envcalls(scope, optObj) {
  
}

function not_builtin(ref) {
  
}

function not_jsignored(ref) {
  
}

function not_jsignore_envcall(ref) {
  
}

/**
 * Analyze an Esprima tree for unresolved references.
 * @returns {escope.Reference[]}
 */
function analyze(etree, optObj) {
  var result = [];
  var scope_manager = escope.analyze(etree);

  esparent.annotate(etree);
  var scope_globals = dependencies_from_ast(scope_manager.scopes[0], optObj);
  // filter built-ins
  // filter jsdoc @ignore
  // add environment feature checks
  // check library classes

  result = scope_globals;
  return result;
}

module.exports = {
  analyze : analyze,
  assemble : assemble
};
