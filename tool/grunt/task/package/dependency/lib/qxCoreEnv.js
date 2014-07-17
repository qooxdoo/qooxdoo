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
var U2 = require('uglify-js');

// local (modules may be injected by test env)
var util = (util || require('./util'));

/**
 * Extracts values from <code>qx.Bootstrap.define().statics._checksMap</code>.
 *
 * @param {string} classCode - js code of Environment class.
 * @returns {Object} envKeys and envMethodNames
 */
function getFeatureTable(classCode) {

  function isFeatureMap (node) {
    return (node.type === 'Property'
      && node.key.type === 'Identifier'
      && node.key.name === '_checksMap'
      && node.value.type ===  'ObjectExpression'
    );
  }

  var featureMap = {};
  // parse classCode
  var tree = esprima.parse(classCode);

  // search feature map
  var controller = new estraverse.Controller();
  controller.traverse(tree, {
    enter : function (node, parent) {
      if (isFeatureMap(node)) {
        featureMap = node.value;
      }
    }
  });
  return eval('(' + escodegen.generate(featureMap) + ')');
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
 * Picks calls to qx.core.Environment.get|select|filter
 */
function isQxCoreEnvironmentCall(node, methodNames) {
    var interestingEnvMethods = ['select', 'selectAsync', 'get', 'getAsync', 'filter'];
    var envMethods = methodNames || interestingEnvMethods;

    return (node.type === 'CallExpression'
            && util.get(node, 'callee.object.object.object.name') === 'qx'
            && util.get(node, 'callee.object.object.property.name') === 'core'
            && util.get(node, 'callee.object.property.name') === 'Environment'
            && envMethods.indexOf(util.get(node, 'callee.property.name')) !== -1);
}

/**
 *
 */
function replaceEnvCallGet(tree, envMap) {
  var controller = new estraverse.Controller();
  var resultTree = controller.replace(tree, {
    enter : function (node, parent) {
      if (isQxCoreEnvironmentCall(node, ["get"])) {
        var envKey = getEnvKey(node);
        if (envMap && envKey in envMap) {
          return {
            "type": "Literal",
            "value": envMap[envKey],
            "raw": envMap[envKey]
          };
        }
      }
    }
  });

  return resultTree;
}

function replaceEnvCallSelect(tree, envMap) {
  var controller = new estraverse.Controller();
  var resultTree = controller.replace(tree, {
    enter : function (node, parent) {
      if (isQxCoreEnvironmentCall(node, ["select"])) {
        var envKey = getEnvKey(node);
        try {
          var val = getEnvSelectValueByKey(node, envKey, envMap[envKey]);
          return val;
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
function getEnvMethod(callNode) {
  // brute force, expecting 'CallExpression'
  return util.get(callNode, 'callee.property.name');

}

/**
 * Gets the 'foo' (i.e. env key) from a <code>qx.core.Environment.*('foo')</code> call.
 *
 * @param {Object} callNode - esprima AST call node
 * @returns {String} env key
 */
function getEnvKey(callNode) {
  return util.get(callNode, 'arguments.0.value');
}

function getEnvSelectValueByKey(callNode, key, value) {
  var properties = util.get(callNode, 'arguments.1.properties');
  var selectedValue = "initial";
  var defaultValue = "initial";

  var i = 0;
  var l = properties.length;
  while (l--) {
    if (properties[l].key.value === value.toString()) {
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
  return fs.readFileSync(fs.realpathSync(
    path.join(__dirname, '../../../../../../framework/source/class/qx/core/Environment.js')),
    {encoding: 'utf-8'});
}

//------------------------------------------------------------------------------
// Public Interface
//------------------------------------------------------------------------------

module.exports = {

  optimizeEnvCall: function(tree, envMap) {
    // TODO: fake it 'till you make it
    var envMap = {
      "true" : true,
      // "qx.allowUrlSettings": false,
      "qx.allowUrlVariants": false,
      "qx.debug.property.level": 0,
      "qx.debug": false,
      "qx.debug.ui.queue": true,
      "qx.aspects": false,
      "qx.dynlocale": true,
      "qx.dyntheme": true,
      // "qx.mobile.emulatetouch": false,
      "qx.emulatemouse": false,
      "qx.blankpage": "qx/static/blank.html",
      "qx.debug.databinding": false,
      "qx.debug.dispose": false,
      "qx.optimization.basecalls": false,
      "qx.optimization.comments": false,
      "qx.optimization.privates": false,
      "qx.optimization.strings": false,
      "qx.optimization.variables": false,
      "qx.optimization.variants": false,
      "module.databinding": true,
      "module.logger": true,
      "module.property": true,
      "module.events": true,
      // "qx.nativeScrollBars": false,

      "qx.application":"myapp.Application",
      "qx.revision":"",
      "qx.theme":"myapp.theme.Theme",
      "qx.version":"4.1",
      // "qx.debug":true,
      // "qx.debug.databinding":false,
      // "qx.debug.dispose":false,
      // "qx.debug.ui.queue":true,
      "qx.debug.io":false,
      "qx.nativeScrollBars":true,
      "qx.allowUrlSettings":true,
      "qx.mobile.emulatetouch":true
    };

    var resultTree = tree;
    var resultTree = replaceEnvCallGet(resultTree, envMap);
    var resultTree = replaceEnvCallSelect(resultTree, envMap);
    return resultTree;
  },

  /**
   * Takes an esprima AST and returns the list of feature classes used through
   * <code>qx.core.Environment.*</code> calls
   *
   * @param {Object} tree - esprima AST
   * @param {Object[]} scopeRefs - scope references
   * @param {boolean} [withMethodName=false] - whether feature classes should be added with method name
   * @returns {Object} result
   * @returns {String[]} result.run
   * @returns {String[]} result.load
   * @see {@link http://constellation.github.io/escope/Reference.html|Reference class}
   * @see {@link http://esprima.org/doc/#ast|esprima AST}
   */
  extract: function(tree, scopeRefs, withMethodName) {
    var result = {
      'load': [],
      'run': []
    };
    var featureToClass = {};
    var envCallNodes = [];
    var qxCoreEnvCode = "";

    withMethodName = withMethodName || false;
    qxCoreEnvCode = qxCoreEnvCode || getClassCode();

    // { 'plugin.flash' : 'qx.bom.client.Flash#isAvailable', 'nextKey': ... }
    featureToClass = getFeatureTable(qxCoreEnvCode);

    envCallNodes = findVariantNodes(tree);

    if (envCallNodes.length >= 1) {
      envCallNodes = addLoadRunInformation(envCallNodes, scopeRefs);
      envCallNodes.forEach(function (node) {
        if (getEnvMethod(node) in {select:1, get:1, filter:1}) {
          // extract environment key
          var envKey = getEnvKey(node);
          // look up corresponding feature class
          var fqMethodName = featureToClass[envKey];
          if (fqMethodName) {
            // add to result
            // console.log(tree.qxClassName, envKey + ' : ' + featureToClass[envKey]);
            if (!withMethodName) {
              var posOfLastDot = fqMethodName.lastIndexOf('.');
              result = addEnvCallDependency(fqMethodName.substr(0, posOfLastDot), node, result);
            } else {
              result = addEnvCallDependency(fqMethodName, node, result);
            }
          }
        }
      });
    }

    return result;
  }
};
