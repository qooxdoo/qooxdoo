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
 * @module compression
 *
 * @desc
 * Compress code and provide qooxdoo specific optimizations.
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

// third party
var U2 = require("uglify-js");

// qx
var Cache = (Cache || require('qx-cache'));

//------------------------------------------------------------------------------
// Attic
//------------------------------------------------------------------------------

/*
function compress (classId, jsCode, options) {
  var esprima = require("esprima");
  var esmangle = require("esmangle");
  var escodegen = require("escodegen");
  var esmangleCode = function(jsCode) {
    var ast = esprima.parse(jsCode);
    var optimized = esmangle.optimize(ast, null);
    var result = esmangle.mangle(optimized);
    return (escodegen.generate(result, {
      format: {
        renumber: true,
        hexadecimal: true,
        escapeless: true,
        compact: true,
        semicolons: false,
        parentheses: false
      }
    }));
  };
}
*/

//------------------------------------------------------------------------------
// Privates
//------------------------------------------------------------------------------

/**
 * Global privates map (ensures 1:1 private hashing overall the whole build).
 */
var globalPrivatesMap = {};

/**
 * Converts index (should be int) to char(s).
 *
 * @param {number} index
 * @return {string} hash
 */
function convertIntToChar(index) {
  var charTable = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  var l = charTable.length - 1;
  var i = index;
  var res = "";

  if (Math.floor(i/l) > 0) {
      res += convertIntToChar(Math.floor(i/l));
  }
  res += charTable[i % l];
  return res;
}

/**
 * Shortens a string (e.g. private member or function) by hashing classId and name.
 * If classId and name combination exists in privatesMap already than return it.
 *
 * @param {number} index
 * @return {string} hash
 */
function shortenPrivate(classId, name, privatesMap) {
  var classIdAndName = classId+"#"+name;
  if (classIdAndName in privatesMap) {
    return privatesMap[classIdAndName];
  }

  return "__" + convertIntToChar(Object.keys(privatesMap).length);
}

/**
 * Checks given string for qooxdoo privates convention (e.g. '__abc') but
 * ignores JavaScript obsolete names (e.g. '__proto__').
 *
 * @param {string} s
 * @return {boolean}
 */
function hasStartingDunderButNotTrailingDunder(s) {
  return (s.substr(0, 2) === "__" && s.substr(-2, 2) !== "__");
}

/**
 * Collects top level (i.e. within 'members' or 'statics' key)
 * AST_ObjectKeyVal private nodes (e.g. {__x: 1}).
 *
 * @param {string} code - JavaScript code
 * @return {string[]} privates
 */
function collectAstObjectKeyValPrivates(code) {
  var ast = U2.parse(code);
  var privates = [];
  ast.walk(new U2.TreeWalker(function(node){
    // AST_ObjectProperty := (AST_ObjectKeyVal | AST_ObjectSetter | AST_ObjectGetter)

    var isMembersOrStaticsProp = function(stack) {
      var parentParentNode = false;

      if (stack.length >= 3) {
        parentParentNode = stack[stack.length-3];
      }
      return (parentParentNode && ["members", "statics"].indexOf(parentParentNode.key) !== -1);
    };

    if (node instanceof U2.AST_ObjectKeyVal
      && isMembersOrStaticsProp(this.stack)
      && hasStartingDunderButNotTrailingDunder(node.key.toString())) {
      privates.push(node);
    }
  }));

  return privates;
}

/**
 * Replaces privates occurrences of AST_ObjectKeyVal
 * with their hashed counterpart.
 *
 * @param {string} classId
 * @param {string} code - code to be adapted
 * @param {string} privates - nodes to be replaced
 * @param {Object} globalPrivatesMap - classIdAndName (key) and hash (value)
 * @return {string} code - adapted code
 */
function replaceAstObjectKeyValPrivates(classId, code, privates, globalPrivatesMap) {
  var l = privates.length;
  while (l--) {
    var node = privates[l];
    var startPos = node.start.pos;
    var endPos = node.end.endpos;
    var key = node.key;
    var classIdAndKey = classId+"#"+key;

    globalPrivatesMap[classIdAndKey] = shortenPrivate(classId, key, globalPrivatesMap);
    var replacement = new U2.AST_ObjectKeyVal({
      key: globalPrivatesMap[classIdAndKey],
      value: privates[l].value
    }).print_to_string({ beautify: false });
    code = replaceSourceCode(code, startPos, endPos, replacement);
  }
  return code;
}

/**
 * Collects AST_String private nodes (e.g. a["__applyFoo"]).
 *
 * @param {string} code - JavaScript code
 * @return {string[]} privates
 */
function collectAstStrings(code) {
  var ast = U2.parse(code);
  var privates = [];
  ast.walk(new U2.TreeWalker(function(node){
    if (node instanceof U2.AST_String
      && hasStartingDunderButNotTrailingDunder(node.value.toString())) {
      privates.push(node);
    }
  }));

  return privates;
}

/**
 * Replaces privates occurrences of AST_String
 * with their hashed counterpart.
 *
 * @param {string} classId
 * @param {string} code - code to be adapted
 * @param {string} privates - nodes to be replaced
 * @param {Object} globalPrivatesMap - classIdAndName (key) and hash (value)
 * @return {string} code - adapted code
 */
function replaceAstStrings(classId, code, privates, globalPrivatesMap) {
  var l = privates.length;
  while (l--) {
    var node = privates[l];
    var startPos = node.start.pos;
    var endPos = node.end.endpos;
    var value = node.value;

    var classIdAndValue = classId+"#"+value;

    globalPrivatesMap[classIdAndValue] = shortenPrivate(classId, value, globalPrivatesMap);
    var replacement = new U2.AST_String({
      value: globalPrivatesMap[classIdAndValue]
    }).print_to_string({ beautify: false });
    code = replaceSourceCode(code, startPos, endPos, replacement);
  }
  return code;
}

/**
 * Collects AST_PropAccess privates nodes (e.g. this.__foo).
 *
 * @param {string} code - JavaScript code
 * @return {string[]} privates
 */
function collectAstDotPrivates(code) {
  var ast = U2.parse(code);
  var privates = [];
  ast.walk(new U2.TreeWalker(function(node){
    // AST_PropAccess := (AST_Dot | AST_Sub)

    if (node instanceof U2.AST_PropAccess
      && typeof node.property === 'string'
      && hasStartingDunderButNotTrailingDunder(node.property.toString())) {
      privates.push(node);
    }
  }));
  return privates;
}

/**
 * Replaces privates occurrences of AST_DOT
 * with their hashed counterpart.
 *
 * @param {string} classId
 * @param {string} code - code to be adapted
 * @param {string} privates - nodes to be replaced
 * @param {Object} globalPrivatesMap - classIdAndName (key) and hash (value)
 * @return {string} code - adapted code
 */
function replaceAstDotPrivates(classId, code, privates, globalPrivatesMap) {
  var l = privates.length;
  while (l--) {
    var node = privates[l];
    var startPos = node.start.pos;
    var endPos = node.end.endpos;
    var prop = node.property;

    var classIdAndProp = classId+"#"+prop;

    globalPrivatesMap[classIdAndProp] = shortenPrivate(classId, prop, globalPrivatesMap);
    var replacement = new U2.AST_Dot({
      expression : node.expression,
      property : globalPrivatesMap[classIdAndProp],
    }).print_to_string({ beautify: false });
    code = replaceSourceCode(code, startPos, endPos, replacement);
  }
  return code;
}

/**
 * Replaces from 'begin' until 'end' within the given source 'code' with the 'replacement'.
 *
 * @param {string} code - code to be adapted
 * @param {number} begin
 * @param {number} end
 * @param {string} replacement
 */
function replaceSourceCode(code, begin, end, replacement) {
  return code.substr(0, begin) + replacement + code.substr(end);
}

/**
 * Applies all replacement steps to the given code.
 *
 * @param {string} classId
 * @param {string} jsCode - code to be adapted
 * @return {string} code - adapted code
 */
function replacePrivates(classId, jsCode) {
  var newCode = "";
  newCode = replaceAstObjectKeyValPrivates(classId, jsCode, collectAstObjectKeyValPrivates(jsCode), globalPrivatesMap);
  newCode = replaceAstDotPrivates(classId, newCode, collectAstDotPrivates(newCode), globalPrivatesMap);
  newCode = replaceAstStrings(classId, newCode, collectAstStrings(newCode), globalPrivatesMap);
  return newCode;
}

//------------------------------------------------------------------------------
// Public Interface
//------------------------------------------------------------------------------

module.exports = {
  /**
   * Compress code and apply optimizations on top (via options).
   * What should be compressed can be provided as code or as tree (AST)
   * - if there is a tree it takes precedence over given code.
   *
   * @param {string} classId
   * @param {string} jsCode - code to be compressed
   * @param {Object} envMap - environment settings
   * @param {Object} options - whether qx specific optimizations should be enabled
   * @return {string} code - compressed code
   */
  compress: function(classId, jsCode, envMap, options) {
    var opts = {};
    var compressedCode = jsCode;

    if (!options) {
      options = {};
    }

    // merge options and default values
    opts = {
      privates: options.privates === false ? false : true,
      cachePath: options.cachePath === undefined ? null : options.cachePath,
    };
    // Special handling for regular expression literal since we need to
    // convert it back to a regex object, otherwise it will be decoded
    // as a string and the regular expression would be lost.
    var adjustRegexLiteral = function(key, value) {
      // deserialize regex strings (e.g. "/my[rR]egex/i") but
      // ignore strings containing paths (e.g. /source/class/foo/).
      if (key === 'value'
          && typeof(value) === "string"
          && value.match(/^\/.*\/[gmsiy]*$/)
          && value.match(/^\/(\w+\/)+$/) === null) {
        if (value.slice(-1) === "/") {
          value = new RegExp(value.substring(1, value.length-1));
        } else {
          var posOfSlash = value.lastIndexOf("/");
          value = new RegExp(value.substr(1, posOfSlash-1), value.substr(posOfSlash+1));
        }
      }
      return value;
    };
    var debugClass = function(classId) {
      if (classId === "qx.REPLACE.THIS") {
        var escg = require("escodegen");
        console.log("comp", escg.generate(tree));
      }
    };

    // compress with UglifyJS2

    // if there's an esprima AST use it
    var cacheOrNull = (opts.cachePath) ? new Cache(opts.cachePath) : null;

    if (cacheOrNull) {
      var curCacheId = cacheOrNull.createCacheId('tree', envMap, classId);
      if (cacheOrNull.has(curCacheId)) {
        var tree = JSON.parse(cacheOrNull.read(curCacheId), adjustRegexLiteral);
        if (tree !== null && typeof(tree) !== 'undefined') {
          // debugClass(classId);
          var ast = U2.AST_Node.from_mozilla_ast(tree);
          ast.figure_out_scope();
          var compressor = U2.Compressor({warnings: false});
          ast = ast.transform(compressor);
          compressedCode = ast.print_to_string();
        }
      }
    }

    // compress in any case
    var result = U2.minify(compressedCode, {fromString: true});
    compressedCode = result.code;

    // qx specific optimizations
    if (opts.privates) {
      compressedCode = replacePrivates(classId, compressedCode);
    }

    return compressedCode;
  }
};
