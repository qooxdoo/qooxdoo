/**
 * Find and extract feature classes from qx.core.Environment.* calls.
 */

var fs = require('fs');
var path = require('path');

var esprima = require('esprima');
var estraverse = require('estraverse');
var escodegen = require('escodegen');

var parentAnnotator = require('./annotator/parent');
var get = require('./util').get;

// cache fore file contents
var qxCoreEnvCode = "";

/**
 * extract values from qx.Bootstrap.define().statics._checksMap
 */
function getFeatureTable(classCode) {

  function is_feature_map (node) {
    return (node.type === "Property"
      && node.key.type === "Identifier"
      && node.key.name === "_checksMap"
      && node.value.type ===  "ObjectExpression"
      /*
      && node.parent
      && node.parent.type == "Property"
      && node.parent.key.type == "Identifier"
      && node.parent.key.name == "statics"
      */
    );
  }

  var feature_map = {};
  // parse classCode
  var etree = esprima.parse(classCode);
  //parentAnnotator.annotate(etree);

  // search feature map
  var controller = new estraverse.Controller();
  controller.traverse(etree, {
    enter : function (node, parent) {
      if (is_feature_map(node)) {
        feature_map = node.value;
      }
    }
  });
  return eval('(' + escodegen.generate(feature_map) + ')');
}

function findVariantNodes(etree) {
  var result = [];
  var interestingEnvMethods = {
    "select"      : true,
    "selectAsync" : true,
    "get"         : true,
    "getAsync"    : true,
    "filter"      : true
  };

  // walk etree
  var controller = new estraverse.Controller();
  controller.traverse(etree, {
    enter : function (node, parent) {
      // pick calls to qx.core.Environment.get|select|filter
      if (node.type === 'CallExpression'
          && get(node, "callee.object.object.object.name") === 'qx'
          && get(node, "callee.object.object.property.name") === 'core'
          && get(node, "callee.object.property.name") === 'Environment'
          && get(node, "callee.property.name") in interestingEnvMethods) {
            result.push(node);
      }
    }
  });
  return result;
}

function addLoadRunInformation(nodes, scopes) {
  nodes.forEach(function (node) {
    var envCallLine = node.loc.start.line;
    for (var i=0; i<scopes.length; i++) {
      var curScope = scopes[i].from;
      if (curScope.isLoadTime === false) {
        continue;
      }

      var scopeStartLine = curScope.block.loc.start.line;
      var scopeEndLine = curScope.block.loc.end.line;

      // TODO: add column
      if (envCallLine > scopeStartLine && envCallLine < scopeEndLine) {
        node.isLoadTime = true;
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
function getEnvMethod(call_node) {
  // brute force, expecting 'CallExpression'
  return get(call_node, "callee.property.name");

}

/** Get the 'foo' from a qx.core.Environment.*('foo') call. */
function getEnvKey(call_node) {
  return get(call_node, "arguments.0.value");
}

function getClassCode() {
  return fs.readFileSync(fs.realpathSync(
    path.join(__dirname, "../../../../../../framework/source/class/qx/core/Environment.js")),
    {encoding: "utf-8"});
}

/**
 * Interface function
 *
 * Take a tree and return the list of feature classes used through
 * qx.core.Environment.* calls
 */
function extract(etree, scopes, withMethodName) {
  var result = {
    "load": [],
    "run": []
  };
  var featureToClass = {};
  var envCallNodes = [];

  withMethodName = withMethodName || false;
  qxCoreEnvCode = qxCoreEnvCode || getClassCode();
  featureToClass = getFeatureTable(qxCoreEnvCode); // { "plugin.flash" : "qx.bom.client.Flash#isAvailable" }

  envCallNodes = findVariantNodes(etree);

  if (envCallNodes.length >= 1) {
    envCallNodes = addLoadRunInformation(envCallNodes, scopes);
    envCallNodes.forEach(function (node) {
      if (getEnvMethod(node) in {select:1, get:1, filter:1}) {
        // extract environment key
        var env_key = getEnvKey(node);
        // look up corresponding feature class
        var fqMethodName = featureToClass[env_key];
        if (fqMethodName) {
          // add to result
          // console.log("Found: " + env_key + " : " + featureToClass[env_key]);
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
