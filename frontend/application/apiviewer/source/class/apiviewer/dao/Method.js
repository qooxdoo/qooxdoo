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


qx.Class.define("apiviewer.dao.Method",
{
  extend : apiviewer.dao.ClassItem,

  construct : function(classDocNode, parentClass, listName)
  {
    this.base(arguments, classDocNode, parentClass, listName);
  },

  members :
  {

    getName : function()
    {
      if (this.isConstructor()) {
        return "construct"
      } else {
        return this._docNode.attributes.name;
      }
    },

    isStatic : function()
    {
      return this._docNode.attributes.isStatic || false;
    },

    isAbstract : function()
    {
      return this._docNode.attributes.isAbstract || false;
    },

    isConstructor : function()
    {
      return this._docNode.attributes.isCtor || false;
    },


   /**
    * Get whether the method has a warning.
    *
    * @return {Boolean} whether the method has a warning.
    */
    hasWarning : function()
    {
      if (this.getApply()) {
        return false;
      } else {
        return this.base(arguments);
      }
    },


    /**
     * Get a list of errors of this method.
     *
     * @return {Map[]} errors of this method.
     */
    getErrors : function() {
      if (this.getApply()) {
        return [];
      } else {
        return this.base(arguments);
      }
    },


    getParams : function()
    {
      if (this._params != null) {
        return this._params;
      } else {
        var paramsNode = apiviewer.TreeUtil.getChild(this.getNode(), "params");
        this._params = paramsNode ? this._createNodeList(paramsNode, apiviewer.dao.Param, this.getClass(), this) : [];
        return this._params;
      }
    },

    getReturn : function()
    {
      if (this._return != null) {
        return this._return;
      } else {
        var returnNode = apiviewer.TreeUtil.getChild(this.getNode(), "return");
        this._return = returnNode ? new apiviewer.dao.Param(returnNode, this.getClass(), this) : "";
        return this._return;
      }
    },

    /*
    getApply : function()
    {
      return this._docNode.attributes.apply;
    },
    */

    getFromProperty : function()
    {
      return this.getClass().getItemByListAndName("properties", this._docNode.attributes.fromProperty);
    },


    getApply : function()
    {
      if (this.isStatic() || this.isConstructor()) {
        return false;
      }
      if (this._apply === undefined) {
        var methodName = this.getName();
        var classes = this.getClass().getDependendClasses();
        for (var i=0; i<classes.length; i++)
        {
          var props = classes[i].getProperties();
          for (var propIndex=0; propIndex<props.length; propIndex++)
          {
            if (props[propIndex].getApplyMethod() == methodName) {
              this._apply = props[propIndex];
              return this._apply;
            }
          }
        }
        this._apply = null;
      }
      return this._apply;
    },


    _addChildNode : function(node)
    {
      switch (node.type) {
        case "params":
        case "return":
          break;
        default:
          return this.base(arguments, node);
      }
      return true;
    }

  }

});