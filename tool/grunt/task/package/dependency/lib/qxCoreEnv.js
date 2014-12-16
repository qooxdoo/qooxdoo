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
 * @module qxCoreEnv
 *
 * @desc
 * Find and extract feature classes from <code>qx.core.Environment.*</code> calls.
 */

// native
var fs = require('fs');
var path = require('path');

// third party
var esprima = require('esprima');
var estraverse = require('estraverse');
var escodegen = require('escodegen');
var _ = require('underscore');
var glob = require('glob');
var U2 = require('uglify-js');

// local (modules may be injected by test env)
var util = (util || require('./util'));


//------------------------------------------------------------------------------
// Privates
//------------------------------------------------------------------------------

// privates may be injected by test env

/**
 * Global qx.core.Environment class code;
 */
var globalEnvClassCode = "";
/**
 * Global qx.bom.client.* class code map;
 */
var globalEnvKeyProvider = null;

/**
 * Extracts env keys (first argument) from
 * <code>qx.core.Environment.add('engine.name', function(){ ... })</code> calls and
 * stores them with their providing class (e.g. {'engine.name': 'qx.bom.client.Engine', 'engine.version': ...}).
 *
 * @param {Object} classCodeMap - js code of environment key provider classes e.g. {'qx.bom.client.Engine': 'long js code string'}
 * @returns {Object} envKeys and envProviderClasses.
 */
function getFeatureTable(classCodeMap) {

  function isQxCoreEnvAddCall (node) {
    return (node.type === 'CallExpression'
            && util.get(node, 'callee.object.object.object.name') === 'qx'
            && util.get(node, 'callee.object.object.property.name') === 'core'
            && util.get(node, 'callee.object.property.name') === 'Environment'
            && util.get(node, 'callee.property.name') === 'add');
  }

  var featureMap = {};
  for (var className in classCodeMap) {
    var tree = esprima.parse(classCodeMap[className]);

    var controller = new estraverse.Controller();
    controller.traverse(tree, {
      enter : function (node, parent) {
        if (isQxCoreEnvAddCall(node)) {
          featureMap[getKeyFromEnvCall(node)] = className;
        }
      }
    });
  }

  return featureMap;
}

/**
 * Extracts values from <code>qx.Bootstrap.define().statics._defaults</code>.
 *
 * @param {string} classCode - js code of Environment class.
 * @returns {Object} envKeys and envValues.
 */
function extractEnvDefaults(classCode) {
  function isDefaultsMap (node) {
    return (node.type === 'Property'
      && node.key.type === 'Identifier'
      && node.key.name === '_defaults'
      && node.value.type === 'ObjectExpression'
    );
  }

  var defaultsMap = {};
  var tree = esprima.parse(classCode);

  var controller = new estraverse.Controller();
  controller.traverse(tree, {
    enter : function (node, parent) {
      if (isDefaultsMap(node)) {
        defaultsMap = node.value;
      }
    }
  });

  return eval('(' + escodegen.generate(defaultsMap) + ')');
}

/**
 * Finds variant nodes (<code>qx.core.Environment.(select(Async)?|get(Async)?|filter)</code> calls)
 * within an esprima AST.
 *
 * @param {Object} tree - esprima AST
 * @returns {Object[]} node - esprima node
 * @see {@link http://esprima.org/doc/#ast|esprima AST}
 */
function findVariantNodes(tree) {
  var result = [];

  var controller = new estraverse.Controller();
  controller.traverse(tree, {
    enter : function (node, parent) {
      if (isQxCoreEnvironmentCall(node)) {
        result.push(node);
      }
    }
  });
  return result;
}

/**
 * Figures out if node is call of qx.core.Environment.get|select|filter.
 *
 * @param {Object} node - esprima node
 * @param {String[]} methodNames - method names to check for
 * @returns {boolean}
 * @see {@link http://esprima.org/doc/#ast|esprima AST}
 */
function isQxCoreEnvironmentCall(node, methodNames) {
    var interestingEnvMethods = ['select', 'selectAsync', 'get', 'getAsync', 'filter'];
    var envMethods = methodNames || interestingEnvMethods;

    return (node.type === 'CallExpression'
            && util.get(node, 'callee.object.object.object.name') === 'qx'
            && util.get(node, 'callee.object.object.property.name') === 'core'
            && util.get(node, 'callee.object.property.name') === 'Environment'
            && envMethods.indexOf(util.get(node, 'callee.property.name')) !== -1) ||
           (node.type === 'CallExpression'
            && util.get(node, 'callee.object.object.name') === 'qxWeb'
            && util.get(node, 'callee.object.property.name') === 'env'
            && envMethods.indexOf(util.get(node, 'callee.property.name')) !== -1);
}

/**
 * Replaces get env calls with the computed value.
 *
 * @param {Object} tree - esprima AST
 * @param {Object} envMap - environment settings
 * @returns {Object} resultTree - manipulated (desctructive) esprima AST
 * @see {@link http://esprima.org/doc/#ast|esprima AST}
 */
function replaceEnvCallGet(tree, envMap) {
  var controller = new estraverse.Controller();
  var resultTree = controller.replace(tree, {
    enter : function (node, parent) {
      if (isQxCoreEnvironmentCall(node, ["get"])) {
        var envKey = getKeyFromEnvCall(node);
        if (envMap && envKey in envMap) {
          return {
            "type": "Literal",
            "value": envMap[envKey],
            "raw": ((typeof(envMap[envKey]) === "string")
                   ? "\""+envMap[envKey]+"\""
                   : envMap[envKey].toString())
          };
        }
      }
    }
  });

  return resultTree;
}

/**
 * Replaces select env calls with the computed value.
 *
 * @param {Object} tree - esprima AST
 * @param {Object} envMap - environment settings
 * @returns {Object} resultTree - manipulated (desctructive) esprima AST
 * @see {@link http://esprima.org/doc/#ast|esprima AST}
 */
function replaceEnvCallSelect(tree, envMap) {
  var controller = new estraverse.Controller();
  var resultTree = controller.replace(tree, {
    enter : function (node, parent) {
      if (isQxCoreEnvironmentCall(node, ["select"])) {
        var envKey = getKeyFromEnvCall(node);
        try {
          return getEnvSelectValueByKey(node, envMap[envKey]);
        } catch (error) {
          // intentionally empty
          // => no return means no replacement
          // possible reasons:
          //   * envMap has no envKey because the envKey is runtime based (os.version)
          //     and cannot be configured upfront.
        }
      }
    }
  });

  return resultTree;
}

/**
 * Augments esprima nodes with the information whether they are load
 * or run dependencies. Note: This method depends on location augmented
 * esprima nodes - see <code>esprima.parse()</code> options.
 *
 * @param {Object[]} nodes - esprima nodes
 * @param {Object[]} scopeRefs - scope references
 * @return {Object[]} nodes - esprima nodes (isLoadTime augmented)
 * @see {@link http://constellation.github.io/escope/Reference.html|Reference class}
 */
function addLoadRunInformation(nodes, scopeRefs) {
  nodes.forEach(function (node) {
    var envCallLine = node.loc.start.line;
    for (var i=0; i<scopeRefs.length; i++) {
      var curScope = scopeRefs[i].from;
      if (curScope.isLoadTime === false) {
        continue;
      }

      var scopeStartLine = curScope.block.loc.start.line;
      var scopeEndLine = curScope.block.loc.end.line;

      // TODO: add column information (at the moment not needed)
      if (envCallLine > scopeStartLine && envCallLine < scopeEndLine) {
        node.isLoadTime = true;
        // if node is a load dep in any scope the job is done
        // - so prevent overriding with the following scopeRefs
        // where the node might be only a run dep.
        break;
      } else {
        node.isLoadTime = false;
      }
    }
  });

  return nodes;
}

/**
 * Adds an env call dependency to the 'load/run' sub-property of the result object.
 *
 * @param {String} fqMethodName
 * @param {Object} node - esprima node
 * @param {Object} result
 * @param {String[]} result.run
 * @param {String[]} result.load
 * @returns {Object} result
 * @returns {String[]} result.run
 * @returns {String[]} result.load
 */
function addEnvCallDependency(fqMethodName, node, result) {
  if (node.isLoadTime === true) {
    result.load.push(fqMethodName);
  } else {
    result.run.push(fqMethodName);
  }

  return result;
}

/**
 * Gets the 'get' (i.e. method name) from a <code>qx.core.Environment.get</code> call.
 *
 * @param {Object} callNode - esprima AST call node
 * @returns {String} method name
 */
function getMethodFromEnvCall(callNode) {
  // brute force, expecting 'CallExpression'
  return util.get(callNode, 'callee.property.name');

}

/**
 * Gets the 'foo' (i.e. env key) from a <code>qx.core.Environment.*('foo')</code> call.
 *
 * @param {Object} callNode - esprima AST call node
 * @returns {String} env key
 */
function getKeyFromEnvCall(callNode) {
  return util.get(callNode, 'arguments.0.value');
}

/**
 * Gets the select 'body' from a <code>qx.core.Environment.select('foo', {...})</code> call.
 *
 * @param {Object} callNode - esprima AST call node
 * @param {String} key - key which will be used for value extraction of select 'body'
 * @throws {Error} ENOENT
 */
function getEnvSelectValueByKey(callNode, key) {
  var properties = util.get(callNode, 'arguments.1.properties');
  var selectedValue = "initial";
  var defaultValue = "initial";

  var i = 0;
  var l = properties.length;
  while (l--) {
    if (properties[l].key.value === key.toString()) {
      selectedValue = properties[l].value;
    }
    if (properties[l].key.value === "default") {
      defaultValue = properties[l].value;
    }
  }

  if (selectedValue !== "initial") {
    return selectedValue;
  } else if (defaultValue !== "initial") {
    return defaultValue;
  } else {
    throw new Error("ENOENT - Given value matches no key from select map and no 'default' key defined.");
  }
}

/**
 * Provides the js code of <code>qx.core.Environment</code>.
 *
 * @returns {string} js code
 */
function getClassCode() {
  if (!globalEnvClassCode) {
    globalEnvClassCode = fs.readFileSync(fs.realpathSync(
      path.join(__dirname, '../../../../../../framework/source/class/qx/core/Environment.js')),
      {encoding: 'utf-8'}
    );
  }
  return globalEnvClassCode;
}

/**
 * Provides the js code of all classes in the namespace <code>qx.bom.client</code>
 * cause they are potentially environment key(s) (e.g. 'egine.name') provider.
 *
 * @returns {Object} class name to js code mapping
 */
function getEnvKeyProviderCode() {
  if (!globalEnvKeyProvider) {
    globalEnvKeyProvider = {};
    var qxBomClient = path.join(__dirname, '../../../../../../framework/source/class/qx/bom/client/');
    var envKeyProviderClassNames = glob.sync('*', {cwd: qxBomClient});
    var l = envKeyProviderClassNames.length;
    for (var i=0; i<l; i++) {
      var cur = envKeyProviderClassNames[i];

      if (cur === '__init__.js') {
        continue;
      }

      globalEnvKeyProvider['qx.bom.client.'+cur.replace('.js', '')] = fs.readFileSync(fs.realpathSync(
        path.join(qxBomClient, cur),
        {encoding: 'utf-8'})
      );
    }
  }

  return globalEnvKeyProvider;
}

//------------------------------------------------------------------------------
// Public Interface
//------------------------------------------------------------------------------

module.exports = {

  /**
   * Optimizes env calls (i.e. replaces their call with the computed value).
   *
   * @param {Object} tree - esprima AST
   * @param {Object} envMap - environment settings
   * @returns {Object} resultTree - manipulated esprima AST
   */
  optimizeEnvCall: function(tree, envMap) {
    if (!envMap) {
      envMap = {};
    }

    var envDefaults = extractEnvDefaults(getClassCode());
    // envMap is second param because its values
    // should override the defaults from the framework
    var mergedEnvMap = _.extend(envDefaults, envMap);

    var resultTree = tree;
    resultTree = replaceEnvCallGet(resultTree, mergedEnvMap);
    resultTree = replaceEnvCallSelect(resultTree, mergedEnvMap);
    return resultTree;
  },

  /**
   * Takes an esprima AST and returns the list of feature classes used through
   * <code>qx.core.Environment.*</code> calls
   *
   * @param {Object} tree - esprima AST
   * @param {Object[]} scopeRefs - scope references
   * @returns {Object} result
   * @returns {String[]} result.run
   * @returns {String[]} result.load
   * @see {@link http://constellation.github.io/escope/Reference.html|Reference class}
   * @see {@link http://esprima.org/doc/#ast|esprima AST}
   */
  extract: function(tree, scopeRefs) {
    var result = {
      'load': [],
      'run': []
    };
    var featureToClass = {};
    var envCallNodes = [];

    // { 'plugin.flash' : 'qx.bom.client.Flash', 'foo.bar': ... }
    featureToClass = getFeatureTable(getEnvKeyProviderCode());

    envCallNodes = findVariantNodes(tree);

    if (envCallNodes.length >= 1) {
      envCallNodes = addLoadRunInformation(envCallNodes, scopeRefs);
      envCallNodes.forEach(function (node) {
        if (getMethodFromEnvCall(node) in {select:1, get:1, filter:1}) {
          // extract environment key
          var envKey = getKeyFromEnvCall(node);
          // look up corresponding feature class
          var fqMethodName = featureToClass[envKey];
          if (fqMethodName) {
            // add to result
            // console.log(tree.qxClassName, envKey, featureToClass[envKey]);
            result = addEnvCallDependency(fqMethodName, node, result);
          }
        }
      });
    }

    return result;
  }
};
