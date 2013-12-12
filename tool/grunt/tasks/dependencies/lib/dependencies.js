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
var js_builtins = require('../node_modules/jshint/src/vars'); // TODO: this is darn ugly, as i have to poke into internal modules of jshint
var pipeline = require('./util').pipeline;
var filter = require('./util').filter;
var _ = require('underscore');

function is_var(node) {
  return ["Identifier", "MemberExpression"].indexOf(node.type) !== -1;
}

function findVarRoot (var_node) {
  if (!is_var(var_node)) {
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
  var ident = ref.identifier;
  if (ident.type !== "Identifier")
    return true;
  // check in various js_builtins maps
  if ([
      'reservedVars', 
      'ecmaIdentifiers', 
      'browser', 
      'devel', 
      'worker', 
      'nonstandard'
    ].some(function(el){
        return ident.name in js_builtins[el];
      })
    )
      return false;
  return true;
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
  var result = pipeline(scope_globals
    , _.partial(filter, not_builtin) // filter built-ins
    // filter jsdoc @ignore
    // add environment feature checks
    // check library classes
    );

  return result;
}

module.exports = {
  analyze : analyze,
  assemble : assemble
};
