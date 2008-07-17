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
     * Sebastian Werner (wpbasti)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

qx.Class.define("qx.ui.layout.MenuButton",
{
  extend : qx.ui.layout.Abstract,

  members :
  {
    // overridden
    verifyLayoutProperty : qx.core.Variant.select("qx.debug",
    {
      "on" : function(item, name, value) {
        //this.assert(false, "The property '"+name+"' is not supported by the MenuButton layout!");
      },

      "off" : null
    }),


    // overridden
    renderLayout : function(availWidth, availHeight)
    {
      var children = this._getLayoutChildren();
      var child;
      var column;

      var columnChildren = [];
      for (var i=0, l=children.length; i<l; i++)
      {
        child = children[i];
        column = child.getLayoutProperties().column;
        columnChildren[column] = child;
      }

      var menu = children[0].getLayoutParent().getLayoutParent();
      var columns = menu.getColumnSizes();
      var spacing = menu.getSpacingX();
      var left=0, top=0;

      for (var i=0, l=columns.length; i<l; i++)
      {
        child = columnChildren[i];

        // TODO: top alignment

        if (child)
        {
          hint = child.getSizeHint();
          var top = qx.ui.layout.Util.computeVerticalAlignOffset(child.getAlignY(), hint.height, availHeight, 0, 0);
          var offsetLeft = qx.ui.layout.Util.computeHorizontalAlignOffset(child.getAlignX(), hint.width, columns[i], 0, 0);
          child.renderLayout(left + offsetLeft, top, hint.width, hint.height);
        }

        left += columns[i] + spacing;
      }
    },


    // overridden
    _computeSizeHint : function()
    {
      var children = this._getLayoutChildren();
      var neededHeight = 0;

      for (var i=0, l=children.length; i<l; i++) {
        neededHeight = Math.max(neededHeight, children[i].getSizeHint().height);
      }

      return {
        width : 0,
        height : neededHeight
      }
    }
  }
});
