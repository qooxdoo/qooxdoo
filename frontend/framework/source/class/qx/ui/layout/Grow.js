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

************************************************************************ */

/**
 * A grow layout, which stretches all children into the full available size
 * but still respecting limits configured through min/max values.
 *
 * It will place all children over each other with the top and left coordinates
 * set to <code>0</code>. The {@link qx.ui.container.Stack} and the
 * {@link qx.ui.core.ScrollPane} are using this layout.
 *
 * *Features*
 *
 * * Integer dimensions
 * * Minimum and maximum dimensions
 *
 * *Item Properties*
 *
 * None
 *
 * *Example*
 *
 * <pre class="javascript">
 * var layout = new qx.ui.layout.Grow();
 *
 * var w1 = new qx.ui.core.Widget();
 * var w2 = new qx.ui.core.Widget();
 * var w3 = new qx.ui.core.Widget();
 *
 * var container = new qx.ui.container.Composite(layout);
 * container.add(w1);
 * container.add(w2);
 * container.add(w3);
 * </pre>
 *
 * *External Documentation*
 *
 * <a href='http://qooxdoo.org/documentation/0.8/layout/grow'>
 * Extended documentation</a> and links to demos of this layout in the qooxdoo wiki.
 *
 * *Alternative Names*
 *
 * * FitLayout (ExtJS)
 */
qx.Class.define("qx.ui.layout.Grow",
{
  extend : qx.ui.layout.Abstract,



  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /*
    ---------------------------------------------------------------------------
      LAYOUT INTERFACE
    ---------------------------------------------------------------------------
    */

    // overridden
    verifyLayoutProperty : qx.core.Variant.select("qx.debug",
    {
      "on" : function(item, name, value) {
        this.assert(false, "The property '"+name+"' is not supported by the atom layout!");
      },

      "off" : null
    }),


    // overridden
    renderLayout : function(availWidth, availHeight)
    {
      var children = this._getLayoutChildren();
      var child, size, width, height;

      // Render children
      for (var i=0, l=children.length; i<l; i++)
      {
        child = children[i];
        size = child.getSizeHint();

        width = availWidth;
        if (width < size.minWidth) {
          width = size.minWidth;
        } else if (width > size.maxWidth) {
          width = size.maxWidth;
        }

        height = availHeight;
        if (height < size.minHeight) {
          height = size.minHeight;
        } else if (height > size.maxHeight) {
          height = size.maxHeight;
        }

        child.renderLayout(0, 0, width, height);
      }
    },


    // overridden
    _computeSizeHint : function()
    {
      var children = this._getLayoutChildren();
      var child, size;
      var neededWidth=0, neededHeight=0;


      // Iterate over children
      for (var i=0, l=children.length; i<l; i++)
      {
        child = children[i];
        size = child.getSizeHint();

        neededWidth = Math.max(neededWidth, size.width);
        neededHeight = Math.max(neededHeight, size.height);
      }


      // Return hint
      return {
        width : neededWidth,
        height : neededHeight
      };
    }
  }
});
