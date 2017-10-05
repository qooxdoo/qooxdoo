/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2015 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Richard Sternagel (rsternagel)

************************************************************************ */

'use strict';

// NOTE: class used in two envs (node|browser) so don't require()!

class ViewerDataUtil {
  static getByType(ast, type) {
    if (ast.children) {
      for (var i=0; i < ast.children.length; i++) {
        var item = ast.children[i];
        if (item.type == type) {
          return item;
        }
      }
    }
    return {attributes: {}, children: []};
  }

  static getModuleName(attach) {
    if (!attach) {
      return "Core";
    }

    ViewerDataUtil.MODULE_NAME_REPLACEMENTS.forEach(function(map) {
      attach = attach.replace(map.regExp, map.replacement);
    });
    return attach;
  }

  static getModuleNameFromClassName(name) {
    name = name.split(".");
    return name[name.length -1];
  }

  static getMethodName(item, prefix) {
    if (item.attributes.prefixedMethodName) {
      return item.attributes.prefixedMethodName;
    }
    var attachData = ViewerDataUtil.getByType(item, "attachStatic");
    if (prefix) {
      if (item.attributes.prefix) {
        prefix = item.attributes.prefix;
      }
      if (!item.attributes.isStatic) {
        prefix = prefix.toLowerCase();
      }
      return prefix + item.attributes.name;
    } else if (item.attributes.name == "ctor") {
      return "q";
    } else if (item.attributes.isStatic) {
      return "q." + (attachData.attributes.targetMethod || item.attributes.name);
    } else {
      return "." + item.attributes.name;
    }
  }

  static isFactory(methodAst, moduleName) {
    var type;
    var returnType = ViewerDataUtil.getByType(methodAst, "return");
    returnType && ViewerDataUtil.getByType(returnType, "types").children.forEach(function(item) {
      type = item.attributes.type;
    });
    if (type) {
      var returnModuleName = ViewerDataUtil.getModuleNameFromClassName(type);
      var attach = ViewerDataUtil.getByType(methodAst, "attach");
      if (!attach.attributes.targetClass) {
        attach = ViewerDataUtil.getByType(methodAst, "attachStatic");
      }
      return returnModuleName == moduleName && attach.attributes.targetClass == "qxWeb";
    }
    return false;
  }

  static __isInternal(item) {
    return item.attributes.isInternal ||
      item.attributes.access == "private" ||
      item.attributes.access == "protected";
  }

  static __sortMethods(a, b) {
    return ViewerDataUtil.getMethodName(a) > ViewerDataUtil.getMethodName(b) ? 1 : -1;
  }

  static sortModuleKeys(keys) {
    keys.sort(function(a, b) {
      if (a == "Core") {
        return -1;
      }
      if (b == "Core") {
        return 1;
      }
      return a < b ? -1 : +1;
    });
    return keys;
  }
}

// overwrite for configuration
ViewerDataUtil.IGNORE_TYPES = [
  "qxWeb",
  "var",
  "null",
  "Emitter",
  "Class"
];
ViewerDataUtil.MDC_LINKS = {
  "Event" : "https://developer.mozilla.org/en/DOM/event",
  "Window" : "https://developer.mozilla.org/en/DOM/window",
  "Document" : "https://developer.mozilla.org/en/DOM/document",
  "Element" : "https://developer.mozilla.org/en/DOM/element",
  "Node" : "https://developer.mozilla.org/en/DOM/node",
  "Date" : "https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Date",
  "Function" : "https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Function",
  "Array" : "https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array",
  "Object" : "https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Object",
  "Map" : "https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Object",
  "RegExp" : "https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/RegExp",
  "Error" : "https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Error",
  "Number" : "https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Number",
  "Integer" : "https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Number",
  "Boolean" : "https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Boolean",
  "String" : "https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/String",
  "undefined" : "https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/undefined",
  "arguments" : "https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Function/arguments",
  "Font" : "https://developer.mozilla.org/en/CSS/font",
  "Color" : "https://developer.mozilla.org/en/CSS/color"
};
ViewerDataUtil.MODULE_NAME_REPLACEMENTS = [
  { regExp: new RegExp(/qx\.module\./), replacement: "" },
  { regExp: new RegExp(/qx\.ui\.website\./), replacement: "" }
];
ViewerDataUtil.NORMALIZE_CLASSES = {
  "Array": "qx.lang.normalize.Array",
  "Date": "qx.lang.normalize.Date",
  "String": "qx.lang.normalize.String",
  "Object": "qx.lang.normalize.Object",
  "Function": "qx.lang.normalize.Function",
  "Error": "qx.lang.normalize.Error"
};
ViewerDataUtil.EVENT_TYPES = [
  "qx.module.event.Mouse",
  "qx.module.event.Keyboard",
  "qx.module.event.Native",
  "qx.module.event.Orientation",
  "qx.module.event.Touch",
  "qx.module.event.Pointer",
  "qx.module.event.Swipe",
  "qx.module.event.Track",
  "qx.module.event.Pinch",
  "qx.module.event.Rotate",
  "qx.module.event.Tap"
];


if (typeof module === 'object'
&& typeof module.exports === 'object') {
  module.exports = ViewerDataUtil;
}
