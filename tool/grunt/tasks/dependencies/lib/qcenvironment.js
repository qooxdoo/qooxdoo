/**
 * Find and extract feature classes from qx.core.Environment.* calls.
 */

var esprima = require('esprima');
var estraverse = require('estraverse');
var esparent = require('./esparent');
var escodegen = require('escodegen');
var get = require('./util').get;

/**
 * extract values from qx.Bootstrap.define().statics._checksMap
 */
function getFeatureTable(classCode) {

    function is_feature_map (node) {
        return (node.type == "Property"
            && node.key.type == "Identifier"
            && node.key.name == "_checksMap"
            && node.value.type ==  "ObjectExpression"
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
    //esparent.annotate(etree);

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

var InterestingEnvMethods = {
    "select"      : true, 
    "selectAsync" : true, 
    "get"         : true, 
    "getAsync"    : true, 
    "filter"      : true
};
function findVariantNodes(etree) {
    var result = [];
    // walk etree
    var controller = new estraverse.Controller();
    controller.traverse(etree, {
        enter : function (node, parent) {
            // pick calls to qx.core.Environment.get|select|filter
            if (node.type == 'CallExpression'
                && get(node, "callee.object.object.object.name") == 'qx'
                && get(node, "callee.object.object.property.name") == 'core'
                && get(node, "callee.object.property.name") == 'Environment'
                && get(node, "callee.property.name") in InterestingEnvMethods
            )
                result.push(node);
        }
    });
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

/**
 * Interface function
 *
 * Take a tree and return the list of feature classes used through 
 * qx.core.Environment.* calls
 */
function extract(etree, qcEnvClassCode) {
    var result = [];
    var feature_to_class = getFeatureTable(qcEnvClassCode); // { "plugin.flash" : "qx.bom.client.Flash#isAvailable" }
    var envCalls = findVariantNodes(etree);
    envCalls.forEach(function (node) {
        if (getEnvMethod(node) in {select:1, get:1, filter:1}) {
            // extract environment key
            var env_key = getEnvKey(node);
            // look up corresponding feature class
            if (feature_to_class[env_key]) {
                // add to result
                console.log("Found: " + env_key + " : " + feature_to_class[env_key]);
                result.push(feature_to_class[env_key]);
            }
        }
    });
    return result
}

module.exports = {
    extract : extract,
};
