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


qx.Class.define("apiviewer.dao.Package", {
  extend : apiviewer.dao.Node,

  construct : function(classDocNode)
  {
    this.base(arguments, classDocNode);
  },

  members : {

    getName : function()
    {
      return this._docNode.attributes.name;
    },

    getFullName : function()
    {
      return this._docNode.attributes.fullName || "";
    },

    getClasses : function()
    {
      return this._classes;
    },

    getPackages : function()
    {
      return this._packages;
    },

    _initializeFields : function() {
      this.base(arguments);
      this._classes = [];
      this._packages = [];
    },

    _addChildNode : function(node)
    {
      switch (node.type) {
        case "classes":
          this._classes = this._createNodeList(node, apiviewer.dao.Class);
          break;
        case "packages":
          this._packages = this._createNodeList(node, apiviewer.dao.Package);
          break;
        default:
          return this.base(arguments, node);
      }
      return true;
    }

  }

});