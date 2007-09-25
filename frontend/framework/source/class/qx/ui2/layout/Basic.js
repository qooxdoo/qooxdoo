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

    this._preferredWidth = null;
    this._preferredHeight = null;
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
      this._preferredWidth = null;
      this._preferredHeight = null;
    },

    // overridden
    getPreferredWidth : function()
    {
      if (this._preferredWidth !== null) {
        this.debug("cached preferred width: ", this._preferredWidth);
        return this._preferredWidth;
      }

      var width = 0;

      for (var i=0, l=this._children.length; i<l; i++)
      {
        var child = this._children[i];
        var childHint = child.getSizeHint();
        var childLeft = child.getLayoutProperty("left") || 0;

        width = Math.max(width, childLeft + childHint.width);
      }

      this._preferredWidth = width;
      this.debug("computed preferred width: ", this._preferredWidth);

      return width;
    },


    // overridden
    getPreferredHeight : function()
    {
      if (this._preferredHeight !== null) {
        this.debug("cached computed height: ", this._preferredHeight);
        return this._preferredHeight;
      }

      var height = 0;

      for (var i=0, l=this._children.length; i<l; i++)
      {
        var child = this._children[i];
        var childHint = child.getSizeHint();
        var childTop = child.getLayoutProperty("top") || 0;

        height = Math.max(height, childTop + childHint.height);
      }

      this._preferredHeight = height;
      this.debug("computed preferred height: ", this._preferredHeight);

      return height;
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