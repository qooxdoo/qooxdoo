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
    add : function(widget) {
      this._children.push(widget);
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
      var posX = 0;
      var spacing = this.getSpacing();


      for (var i=0, l=this._children.length; i<l; i++)
      {
        var child = this._children[i];
        var childWidth = child.getPreferredWidth();

        if (posX < width)
        {
          child.layout(posX, 0, childWidth, child.getPreferredHeight());
          child.getElement().include();
        }
        else
        {
          child.getElement().exclude();
        }

        posX += childWidth + spacing;
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
        width += child.getPreferredWidth();
      }
      width += this.getSpacing() * (this._children.length-1);

      this._preferredWidth = width;
      this.debug("computed preferred width: ", this._preferredWidth);

      return width;
    },


    // overridden
    getPreferredHeight : function()
    {
      if (this._preferredHeight !== null) {
        this.debug("cached preferred height: ", this._preferredHeight);
        return this._preferredHeight;
      }

      var height = 0;

      for (var i=0, l=this._children.length; i<l; i++)
      {
        var child = this._children[i];
        height = Math.max(height, child.getPreferredHeight());
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