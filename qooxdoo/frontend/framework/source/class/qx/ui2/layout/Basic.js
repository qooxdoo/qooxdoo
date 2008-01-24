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

/**
 * A basic layout, which supports positioning of child widgets by static
 * left/top coordinates. This layout is extremely basic but should also
 * perform best and is the ideal candidate for all animations and things
 * like this.
 *
 * The default location of any widget is left=0 and top=0 (top-left corner).
 *
 * Supports:
 *
 * * Integer dimensions
 * * Min and max dimensions
 * * Integer location using <code>top</code> and <code>left</code> properties in this layout
 *
 * Does not support:
 *
 * * Shrink or grow of children depending on the available space
 */
qx.Class.define("qx.ui2.layout.Basic",
{
  extend : qx.ui2.layout.Abstract,



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

    /**
     * Adds a new widget to this layout.
     *
     * @type member
     * @param child {qx.ui2.core.Widget} the widget to add.
     * @param left {Integer} Left position of the child.
     * @param top {Integer} Top position of the child.
     * @param options {Map?null} Optional layout data for widget.
     * @return {qx.ui2.layout.Abstract} This object (for chaining support)
     */
    add : function(child, left, top, options)
    {
      this.base(arguments, child, options);
      this.addLayoutProperty(child, "left", left);
      this.addLayoutProperty(child, "top", top);

      // Chaining support
      return this;
    },


    // overridden
    renderLayout : function(parentWidth, parentHeight)
    {
      var children = this.getLayoutChildren();
      var child, size, layout;

      for (var i=0, l=children.length; i<l; i++)
      {
        child = children[i];
        size = child.getSizeHint();
        layout = this.getLayoutProperties(child);

        child.renderLayout(layout.left || 0, layout.top || 0, size.width, size.height);
      }
    },


    // overridden
    _computeSizeHint : function()
    {
      var children = this.getLayoutChildren();
      var child, size, layout;
      var neededWidth=0, neededHeight=0;


      // Iterate over children
      for (var i=0, l=children.length; i<l; i++)
      {
        child = children[i];
        size = child.getSizeHint();
        layout = this.getLayoutProperties(child);

        neededWidth = Math.max(neededWidth, (layout.left || 0) + size.width);
        neededHeight = Math.max(neededHeight, (layout.top || 0) + size.height);
      }


      // Return hint
      return {
        minWidth : 0,
        width : neededWidth,
        maxWidth : Infinity,
        minHeight : 0,
        height : neededHeight,
        maxHeight : Infinity
      };
    }
  }
});
