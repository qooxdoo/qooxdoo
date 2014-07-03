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

var globalPrivatesMap = {};

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

function shortenPrivate(classId, name, privatesMap) {
  if (classId+name in privatesMap) {
    return privatesMap[classId+name];
  }

  return "__" + convertIntToChar(Object.keys(privatesMap).length);
}

function collectAstObjectKeyValPrivates(code) {
  var ast = U2.parse(code);
  var privates = [];
  ast.walk(new U2.TreeWalker(function(node){
    // AST_ObjectProperty (AST_ObjectKeyVal | AST_ObjectSetter | AST_ObjectGetter)

    var isMembersOrStaticsProp = function(stack) {
      var parentParentNode = false;

      if (stack.length >= 3) {
        parentParentNode = stack[stack.length-3];
      }
      return (parentParentNode && ["members", "statics"].indexOf(parentParentNode.key) !== -1);
    };

    if (node instanceof U2.AST_ObjectKeyVal
      && isMembersOrStaticsProp(this.stack)
      && node.key.toString().substr(0, 2) === "__"
      && node.key.toString().substr(-2, 2) !== "__") {
      privates.push(node);
    }
  }));

  return privates;
}

function replaceAstObjectKeyValPrivates(classId, code, privates, globalPrivatesMap) {
  var l = privates.length;
  while (l--) {
    var node = privates[l];
    var startPos = node.start.pos;
    var endPos = node.end.endpos;
    var key = node.key;
    var classIdAndKey = classId+key;

    globalPrivatesMap[classIdAndKey] = shortenPrivate(classId, key, globalPrivatesMap);
    var replacement = new U2.AST_ObjectKeyVal({
      key: globalPrivatesMap[classIdAndKey],
      value: privates[l].value
    }).print_to_string({ beautify: false });
    code = splice_string(code, startPos, endPos, replacement);
  }
  return code;
}

function collectAstStrings(code) {
  var ast = U2.parse(code);
  var privates = [];
  ast.walk(new U2.TreeWalker(function(node){
    if (node instanceof U2.AST_String
      && node.value.toString().substr(0, 2) === "__"
      && node.value.toString().substr(-2, 2) !== "__") {
      privates.push(node);
    }
  }));

  return privates;
}

function replaceAstStrings(classId, code, privates, globalPrivatesMap) {
  var l = privates.length;
  while (l--) {
    var node = privates[l];
    var startPos = node.start.pos;
    var endPos = node.end.endpos;
    var value = node.value;

    var classIdAndValue = classId+value;

    globalPrivatesMap[classIdAndValue] = shortenPrivate(classId, value, globalPrivatesMap);
    var replacement = new U2.AST_String({
      value: globalPrivatesMap[classIdAndValue]
    }).print_to_string({ beautify: false });
    code = splice_string(code, startPos, endPos, replacement);
  }
  return code;
}

function collectAstDotPrivates(code) {
  var ast = U2.parse(code);
  var privates = [];
  ast.walk(new U2.TreeWalker(function(node){
    // AST_PropAccess (AST_Dot | AST_Sub)

    if (node instanceof U2.AST_PropAccess
      && typeof node.property === 'string'
      && node.property.toString().substr(0, 2) === "__"
      && node.property.toString().substr(-2, 2) !== "__") {
      privates.push(node);
    }
  }));
  return privates;
}

function replaceAstDotPrivates(classId, code, privates, globalPrivatesMap) {
  var l = privates.length;
  while (l--) {
    var node = privates[l];
    var startPos = node.start.pos;
    var endPos = node.end.endpos;
    var prop = node.property;

    var classIdAndProp = classId+prop;

    globalPrivatesMap[classIdAndProp] = shortenPrivate(classId, prop, globalPrivatesMap);
    var replacement = new U2.AST_Dot({
      expression : node.expression,
      property : globalPrivatesMap[classIdAndProp],
    }).print_to_string({ beautify: false });
    code = splice_string(code, startPos, endPos, replacement);
  }
  return code;
}

function splice_string(str, begin, end, replacement) {
  return str.substr(0, begin) + replacement + str.substr(end);
}

function replacePrivates(classId, jsCode) {
  var newCode = replaceAstObjectKeyValPrivates(classId, jsCode, collectAstObjectKeyValPrivates(jsCode), globalPrivatesMap);
  newCode = replaceAstDotPrivates(classId, newCode, collectAstDotPrivates(newCode), globalPrivatesMap);
  newCode = replaceAstStrings(classId, newCode, collectAstStrings(newCode), globalPrivatesMap);
  return newCode;
}

//------------------------------------------------------------------------------
// Public Interface
//------------------------------------------------------------------------------

module.exports = {

  compress: function(classId, jsCode, options) {
    var opts = {};
    var compressedCode = jsCode;

    if (!options) {
      options = {};
    }

    // merge options and default values
    opts = {
      privates: options.privates === false ? false : true
    };

    // compress with UglifyJS2
    var result = U2.minify(compressedCode, {fromString: true});
    compressedCode = result.code;

    // qx specific optimizations
    if (opts.privates) {
      compressedCode = replacePrivates(classId, compressedCode);
    }

    return compressedCode;
  }
};
