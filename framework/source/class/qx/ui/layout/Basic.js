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
 * A basic layout, which supports positioning of child widgets by absolute
 * left/top coordinates. This layout is very simple but should also
 * perform best.
 *
 * *Features*
 *
 * * Basic positioning using <code>left</code> and <code>top</code> properties
 * * Respects minimum and maximum dimensions without skrinking/growing
 * * Margins for top and left side (including negative ones)
 * * Respects right and bottom margins in the size hint
 * * Auto-sizing
 *
 * *Item Properties*
 *
 * <ul>
 * <li><strong>left</strong> <em>(Integer)</em>: The left coordinate in pixel</li>
 * <li><strong>top</strong> <em>(Integer)</em>: The top coordinate in pixel</li>
 * </ul>
 *
 * *Details*
 *
 * The default location of any widget is zero for both
 * <code>left</code> and <code>top</code>.
 *
 * *Example*
 *
 * Here is a little example of how to use the basic layout.
 *
 * <pre class="javascript">
 * var container = new qx.ui.container.Composite(new qx.ui.layout.Basic());
 *
 * // simple positioning
 * container.add(new qx.ui.core.Widget(), {left: 10, top: 10});
 * container.add(new qx.ui.core.Widget(), {left: 100, top: 50});
 * </pre>
 *
 * *External Documentation*
 *
 * <a href='http://manual.qooxdoo.org/${qxversion}/pages/layout/basic.html'>
 * Extended documentation</a> and links to demos of this layout in the qooxdoo manual.
 */
qx.Class.define("qx.ui.layout.Basic",
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
    verifyLayoutProperty : qx.core.Environment.select("qx.debug",
    {
      "true" : function(item, name, value)
      {
        this.assert(name == "left" || name == "top", "The property '"+name+"' is not supported by the Basic layout!");
        this.assertInteger(value);
      },

      "false" : null
    }),


    // overridden
    renderLayout : function(availWidth, availHeight)
    {
      var children = this._getLayoutChildren();
      var child, size, props, left, top;

      // Render children
      for (var i=0, l=children.length; i<l; i++)
      {
        child = children[i];
        size = child.getSizeHint();
        props = child.getLayoutProperties();

        left = (props.left || 0) + child.getMarginLeft();
        top = (props.top || 0) + child.getMarginTop();

        child.renderLayout(left, top, size.width, size.height);
      }
    },


    // overridden
    _computeSizeHint : function()
    {
      var children = this._getLayoutChildren();
      var child, size, props;
      var neededWidth=0, neededHeight=0;
      var localWidth, localHeight;


      // Iterate over children
      for (var i=0, l=children.length; i<l; i++)
      {
        child = children[i];
        size = child.getSizeHint();
        props = child.getLayoutProperties();

        localWidth = size.width + (props.left || 0) + child.getMarginLeft() + child.getMarginRight();
        localHeight = size.height + (props.top || 0) + child.getMarginTop() + child.getMarginBottom();

        if (localWidth > neededWidth) {
          neededWidth = localWidth;
        }

        if (localHeight > neededHeight) {
          neededHeight = localHeight;
        }
      }


      // Return hint
      return {
        width : neededWidth,
        height : neededHeight
      };
    }
  }
});
