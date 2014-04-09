/**
 * Find and extract feature classes from qx.core.Environment.* calls.
 */

var fs = require('fs');
var path = require('path');

var esprima = require('esprima');
var estraverse = require('estraverse');
var escodegen = require('escodegen');

var util = (util || require('./util'));

// cache fore file contents
var qxCoreEnvCode = "";

/**
 * extract values from qx.Bootstrap.define().statics._checksMap
 */
function getFeatureTable(classCode) {

  function isFeatureMap (node) {
    return (node.type === 'Property'
      && node.key.type === 'Identifier'
      && node.key.name === '_checksMap'
      && node.value.type ===  'ObjectExpression'
      /*
      && node.parent
      && node.parent.type == 'Property'
      && node.parent.key.type == 'Identifier'
      && node.parent.key.name == 'statics'
      */
    );
  }

  var featureMap = {};
  // parse classCode
  var etree = esprima.parse(classCode);

  // search feature map
  var controller = new estraverse.Controller();
  controller.traverse(etree, {
    enter : function (node, parent) {
      if (isFeatureMap(node)) {
        featureMap = node.value;
      }
    }
  });
  return eval('(' + escodegen.generate(featureMap) + ')');
}

function findVariantNodes(etree) {
  var result = [];
  var interestingEnvMethods = {
    'select'      : true,
    'selectAsync' : true,
    'get'         : true,
    'getAsync'    : true,
    'filter'      : true
  };

  // walk etree
  var controller = new estraverse.Controller();
  controller.traverse(etree, {
    enter : function (node, parent) {
      // pick calls to qx.core.Environment.get|select|filter
      if (node.type === 'CallExpression'
          && util.get(node, 'callee.object.object.object.name') === 'qx'
          && util.get(node, 'callee.object.object.property.name') === 'core'
          && util.get(node, 'callee.object.property.name') === 'Environment'
          && util.get(node, 'callee.property.name') in interestingEnvMethods) {
            result.push(node);
      }
    }
  });
  return result;
}

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

      // TODO: add column
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


function addEnvCallDependency(fqMethodName, node, result) {
  if (node.isLoadTime === true) {
    result.load.push(fqMethodName);
  } else {
    result.run.push(fqMethodName);
  }

  return result;
}

/**
 * Get the 'get' from a qx.core.Environment.get call.
 */
function getEnvMethod(callNode) {
  // brute force, expecting 'CallExpression'
  return util.get(callNode, 'callee.property.name');

}

/** Get the 'foo' from a qx.core.Environment.*('foo') call. */
function getEnvKey(callNode) {
  return util.get(callNode, 'arguments.0.value');
}

function getClassCode() {
  return fs.readFileSync(fs.realpathSync(
    path.join(__dirname, '../../../../../../framework/source/class/qx/core/Environment.js')),
    {encoding: 'utf-8'});
}

/**
 * Interface function
 *
 * Take a tree and return the list of feature classes used through
 * qx.core.Environment.* calls
 */
function extract(etree, scopeRefs, withMethodName) {
  var result = {
    'load': [],
    'run': []
  };
  var featureToClass = {};
  var envCallNodes = [];

  withMethodName = withMethodName || false;
  qxCoreEnvCode = qxCoreEnvCode || getClassCode();

  // { 'plugin.flash' : 'qx.bom.client.Flash#isAvailable', 'nextKey': ... }
  featureToClass = getFeatureTable(qxCoreEnvCode);

  envCallNodes = findVariantNodes(etree);

  if (envCallNodes.length >= 1) {
    envCallNodes = addLoadRunInformation(envCallNodes, scopeRefs);
    envCallNodes.forEach(function (node) {
      if (getEnvMethod(node) in {select:1, get:1, filter:1}) {
        // extract environment key
        var env_key = getEnvKey(node);
        // look up corresponding feature class
        var fqMethodName = featureToClass[env_key];
        if (fqMethodName) {
          // add to result
          // console.log(etree.qxClassName, env_key + ' : ' + featureToClass[env_key]);
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

module.exports = {
  extract : extract
};
