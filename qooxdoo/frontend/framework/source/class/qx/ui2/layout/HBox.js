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

qx.Class.define("qx.ui2.layout.HBox",
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
    spacing :
    {
      check : "Integer",
      init : 5
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {

    // overridden
    add : function(widget, hFlex, vAlign)
    {
      this._children.push(widget);

      if (hFlex != null) {
        widget.addLayoutProperty("hFlex", hFlex);
      }

      if (vAlign != null) {
        widget.addLayoutProperty("vAlign", vAlign);
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
      var left = 0;
      var top = 0;

      var spacing = this.getSpacing();

      var children = this._children;
      var child, childHint;
      var flexSum = 0;

      for (var i=0, l=children.length; i<l; i++)
      {
        child = children[i];

        if (child.canStretchX())
        {
          childFlex = widget.getLayoutProperty("hFlex");

          if (childFlex == null || childFlex > 0) {
            flexSum += (childFlex || 1);
          }
        }
      }

      for (var i=0, l=children.length; i<l; i++)
      {
        child = children[i];
        childHint = child.getSizeHint();

        if (left < width)
        {
          child.layout(left, top, childHint.width, childHint.height);
          child.include();
        }
        else
        {
          child.exclude();
        }

        left += childHint.width + spacing;
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
        maxWidth : 32000,
        minHeight : 0,
        height : 0,
        maxHeight : 32000
      };

      for (var i=0, l=this._children.length; i<l; i++)
      {
        var child = this._children[i];
        var childHint = child.getSizeHint();

        hint.minWidth += child.getSizeHint().minWidth;
        hint.width += child.getSizeHint().width;
        hint.maxWidth += child.getSizeHint().maxWidth;

        hint.minHeight = Math.max(hint.minHeight, childHint.minHeight);
        hint.height = Math.max(hint.height, childHint.height);
        hint.maxHeight = Math.max(hint.maxHeight, childHint.maxHeight);
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