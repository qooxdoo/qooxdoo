/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

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


qx.Class.define("apiviewer.dao.Property", {
  extend : apiviewer.dao.ClassItem,

  construct : function(classDocNode, parentClass, listName)
  {
    this.base(arguments, classDocNode, parentClass, listName);
  },

  members : {

    getTypes : function()
    {
      var result = this.base(arguments);
      var docNode = this.getDocNode();
      var type = docNode.getType();
      if (type) {
        result.push({
          type : type,
          dimensions : docNode.getNode().attributes.dimensions
        });
      }

      return result;
    },


    /**
     * Returns the check attribute of the property definition if
     * the check attribute does not define an internal type or a
     * class. In this case use {@link #getTypes}.
     *
     * @return {String} the contents of the check attribute.
     */
    getCheck : function()
    {
      var attributes = this.getDocNode()._docNode.attributes;
      if (
        attributes.check &&
        !apiviewer.dao.Class.getClassByName(attributes.check) &&
        !apiviewer.ui.ClassViewer.PRIMITIVES[attributes.check]
        ) {
        return attributes.check;
      } else {
        return "";
      }
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
      var values = this._docNode.attributes.possibleValues;
      if (values)
      {
        values = values.split(",");
        return values;
      }
      else
      {
        return [];
      }
    },

    getGroup : function()
    {
      var group = this.getDocNode()._docNode.attributes.group;
      if (group) {
        return group.split(",");
      }
      return [];
    },

    isPropertyGroup : function()
    {
      return this.getDocNode()._docNode.attributes.group ? true : false;
    },


    getType : function()
    {
      var attributes = this._docNode.attributes;
      if (attributes.type) {
        return attributes.type;
      }

      // new style classes
      if (attributes.check) {
        if (
          apiviewer.dao.Class.getClassByName(attributes.check) ||
          apiviewer.ui.ClassViewer.PRIMITIVES[attributes.check]
        ) {
          return attributes.check;
        }
      }
      return null;
    },


    getPropertyType : function()
    {
      return this.getDocNode()._docNode.attributes.propertyType || "new";
    },


    getEvent : function()
    {
      return this.getDocNode()._docNode.attributes.event;
    },


    getApplyMethod : function()
    {
      return this.getDocNode()._docNode.attributes.apply;
    },

    isNullable : function()
    {
      return this.getDocNode()._docNode.attributes.allowNull || false;
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
    },

    isInheritable : function()
    {
      return this.getDocNode()._docNode.attributes.inheritable || false;
    },

    isThemeable : function()
    {
      return this.getDocNode()._docNode.attributes.themeable || false;
    },

    isRefined : function()
    {
      return this._docNode.attributes.refine || false;
    },

    isOldProperty : function()
    {
      return this.getPropertyType() !== "new";
    }

  }

});
