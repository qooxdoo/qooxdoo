/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Tino Butz (tbtz)

************************************************************************ */

/**
 * A horizontal box layout.
 *
 * The horizontal box layout lays out widgets in a horizontal row, from left
 * to right.
 *
 * *Item Properties*
 *
 * <ul>
 * <li><strong>flex</strong> <em>(Integer)</em>: The flex property determines how the container
 *   distributes remaining empty space among its children. If items are made
 *   flexible, they can grow or shrink accordingly. Their relative flex values
 *   determine how the items are being resized, i.e. the larger the flex ratio
 *   of two items, the larger the resizing of the first item compared to the
 *   second.
 * </li>
 * </ul>
 *
 * *Example*
 *
 * Here is a little example of how to use the HBox layout.
 *
 * <pre class="javascript">
 * var layout = new qx.ui.mobile.layout.HBox().set({alignX:"center"});
 *
 * var container = new qx.ui.mobile.container.Composite(layout);
 *
 * container.add(new qx.ui.mobile.basic.Label("1"));
 * container.add(new qx.ui.mobile.basic.Label("2"), {flex:1});
 * container.add(new qx.ui.mobile.basic.Label("3"));
 * </pre>
 */
qx.Class.define("qx.ui.mobile.layout.HBox",
{
  extend : qx.ui.mobile.layout.AbstractBox,


 /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    // overridden
    _getCssClasses : function(){
      return ["hbox"];
    }
  }
});
