/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/* ************************************************************************

#module(apiviewer)

************************************************************************ */


qx.Class.define("apiviewer.dao.Node", {

  extend : qx.core.Object,

  construct : function(classDocNode)
  {
    this._docNode = classDocNode;
    classDocNode.children = classDocNode.children || [];
    classDocNode.attributes = classDocNode.attributes || {};
    classDocNode.cls = this;

    this._initializeFields();

    for (var i=0; i<classDocNode.children.length; i++) {
      var childNode = classDocNode.children[i];
      if (!this._addChildNode(childNode)) {
        throw new Error("Unknown child type: " + childNode.type + " node: " + qx.io.Json.stringify(childNode));
      }
    }
  },

  members :
  {

    getNode : function()
    {
      return this._docNode;
    },

    getDeprecationText : function()
    {
      return this._deprecated || "";
    },

    isDeprecated : function()
    {
      return typeof(this._deprecated) == "string" ? true : false;
    },

    _createNodeList : function (node, ctor, clazz, arg)
    {
      if (ctor) {
        var result = [];
        for (var i=0; i<node.children.length; i++) {
          result.push(new ctor(node.children[i], clazz, arg));
        }
        return result;
      } else {
        return node.children;
      }
    },

    _initializeFields : function() {
    },

    _addChildNode : function(childNode)
    {
      switch (childNode.type) {
        case "deprecated":
          this._deprecated = childNode.children ? childNode.children[0].attributes.text || "" : "";
          break;
        default:
          return false;
      }
      return true;
    }

  }
});
