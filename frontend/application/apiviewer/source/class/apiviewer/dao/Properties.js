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


qx.Class.define("apiviewer.dao.Properties", {
  extend : apiviewer.dao.ClassItem,

  construct : function(classDocNode, parentClass, listName)
  {
    this.base(arguments, classDocNode, parentClass, listName);
  },

  members : {

    getTypes : function()
    {
      var result = this.base(arguments);
      var attributes = this.getDocNode()._docNode.attributes;
      if (attributes.type) {
        result.push({
          type : attributes.type,
          dimensions : attributes.dimensions
        });
      }
      return result;
    },

    getClassname : function()
    {
      return this._docNode.attributes.classname;
    },

    getInstance : function()
    {
      return this._docNode.attributes.instance;
    },

    getUnitDetection : function()
    {
      return this._docNode.attributes.unitDetection;
    },

    getPossibleValues : function()
    {
      return this._docNode.attributes.possibleValues;
    },

    getType : function()
    {
      return this._docNode.attributes.type;
    },

    getAllowNull : function()
    {
      return this._docNode.attributes.allowNull;
    },

    getDefaultValue : function()
    {
      return this._docNode.attributes.defaultValue;
    },

    getGetAlias : function()
    {
      return this._docNode.attributes.getAlias;
    },

    getSetAlias : function()
    {
      return this._docNode.attributes.setAlias;
    }

  }

});