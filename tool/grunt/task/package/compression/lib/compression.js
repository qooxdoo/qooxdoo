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
  if (name in privatesMap[classId]) {
    return privatesMap[classId][name];
  }

  return "__" + convertIntToChar(Object.keys(privatesMap[classId]).length);
}

function collectAstObjectKeyValPrivates(code) {
  var ast = U2.parse(code);
  var privates = [];
  ast.walk(new U2.TreeWalker(function(node){
    // AST_ObjectProperty (AST_ObjectKeyVal | AST_ObjectSetter | AST_ObjectGetter)
    if (node instanceof U2.AST_ObjectKeyVal
      && node.key.toString().indexOf("__") === 0) {
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

    globalPrivatesMap[classId][key] = shortenPrivate(classId, key, globalPrivatesMap);
    var replacement = new U2.AST_ObjectKeyVal({
      key: globalPrivatesMap[classId][key],
      value: privates[l].value
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
      && node.property.indexOf("__") === 0) {
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

    globalPrivatesMap[classId][prop] = shortenPrivate(classId, prop, globalPrivatesMap);
    var replacement = new U2.AST_Dot({
      expression : node.expression,
      property : globalPrivatesMap[classId][prop],
    }).print_to_string({ beautify: false });
    code = splice_string(code, startPos, endPos, replacement);
  }
  return code;
}

function splice_string(str, begin, end, replacement) {
  return str.substr(0, begin) + replacement + str.substr(end);
}

function replacePrivates(classId, jsCode) {
  globalPrivatesMap[classId] = {};
  var newCode = replaceAstObjectKeyValPrivates(classId, jsCode, collectAstObjectKeyValPrivates(jsCode), globalPrivatesMap);
  newCode = replaceAstDotPrivates(classId, newCode, collectAstDotPrivates(newCode), globalPrivatesMap);
  return newCode;
}

//------------------------------------------------------------------------------
// Public Interface
//------------------------------------------------------------------------------

module.exports = {

  compress: function(classId, jsCode, options) {
    var opts = {};

    if (!options) {
      options = {};
    }

    // merge options and default values
    opts = {
      privates: options.privates === false ? false : true
    };

    // compress with UglifyJS2
    var result = U2.minify(jsCode, {fromString: true});
    var compressedCode = result.code;

    // qx specific optimazations on top
    if (opts.privates) {
      compressedCode = replacePrivates(classId, compressedCode);
    }

    return compressedCode;
  }
};
