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
     * Sebastian Werner (wpbasti)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

qx.Class.define("qx.ui2.layout.Basic",
{
  extend : qx.ui2.layout.AbstractLayout,






  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);

    this._children = [];
    this._sizeHint = null;
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    // overridden
    add : function(widget, left, top)
    {
      this._children.push(widget);

      if (left != null) {
        widget.addLayoutProperty("left", left);
      }

      if (top != null) {
        widget.addLayoutProperty("top", top);
      }
    },

    // overridden
    remove : function(widget) {
      qx.lang.Array.remove(this._children, widget);
    },

    // overridden
    getChildren : function() {
      return this._children;
    },

    // overridden
    layout : function(width, height)
    {
      for (var i=0, l=this._children.length; i<l; i++)
      {
        var child = this._children[i];

        if (child.isLayoutValid()) {
          continue;
        }

        var childHint = child.getSizeHint();
        var childLeft = child.getLayoutProperty("left") || 0;
        var childTop = child.getLayoutProperty("top") || 0;

        child.layout(childLeft, childTop, childHint.width, childHint.height);
      }
    },

    // overridden
    invalidate : function()
    {
      this.debug("Clear layout cache.");
      this._sizeHint = null;
    },

    // overridden
    getSizeHint : function()
    {
      if (this._sizeHint !== null) {
        this.debug("cached preferred hint: ", this._sizeHint);
        return this._sizeHint;
      }

      var hint = {
        minWidth : 0,
        width : 0,
        maxWidth : 0,
        minHeight : 0,
        height : 0,
        maxHeight : 0
      };

      for (var i=0, l=this._children.length; i<l; i++)
      {
        var child = this._children[i];
        var childHint = child.getSizeHint();
        var childLeft = child.getLayoutProperty("left") || 0;
        var childTop = child.getLayoutProperty("top") || 0;

        hint.minWidth = Math.max(hint.minWidth, childLeft + childHint.minWidth);
        hint.width = Math.max(hint.width, childLeft + childHint.width);
        hint.maxWidth = Math.max(hint.maxWidth, childLeft + childHint.maxWidth);

        hint.minHeight = Math.max(hint.minHeight, childTop + childHint.minHeight);
        hint.height = Math.max(hint.height, childTop + childHint.height);
        hint.maxHeight = Math.max(hint.maxHeight, childTop + childHint.maxHeight);
      }

      this._sizeHint = hint;
      this.debug("computed preferred width: ", this._sizeHint);

      return hint;
    }

  },




  /*
  *****************************************************************************
     DESTRUCT
  *****************************************************************************
  */

  destruct : function()
  {


  }
});