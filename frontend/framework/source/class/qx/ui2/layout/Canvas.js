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

qx.Class.define("qx.ui2.layout.Canvas",
{
  extend : qx.ui2.layout.Basic,






  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    // overridden
    add : function(widget, left, top, right, bottom)
    {
      this.base(arguments, widget);
      this._importProperties(widget, arguments, "left", "top", "right", "bottom");
    },


    // overridden
    layout : function(width, height)
    {
      var children = this.getChildren();

      for (var i=0, l=children.length; i<l; i++)
      {
        var child = children[i];

        if (child.isLayoutValid()) {
          continue;
        }

        var childHint = child.getSizeHint();

        var childLeft = child.getLayoutProperty("left") || 0;
        var childTop = child.getLayoutProperty("top") || 0;

        child.layout(childLeft, childTop, childHint.width, childHint.height);
      }
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