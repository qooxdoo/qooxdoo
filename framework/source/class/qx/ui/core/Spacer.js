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
 * A Spacer is a "virtual" widget, which can be placed into any layout and takes
 * the space a normal widget of the same size would take.
 *
 * Spacers are invisible and very light weight because they don't require any
 * DOM modifications.
 *
 * *Example*
 *
 * Here is a little example of how to use the widget.
 *
 * <pre class='javascript'>
 *   var container = new qx.ui.container.Composite(new qx.ui.layout.HBox());
 *   container.add(new qx.ui.core.Widget());
 *   container.add(new qx.ui.core.Spacer(50));
 *   container.add(new qx.ui.core.Widget());
 * </pre>
 *
 * This example places two widgets and a spacer into a container with a
 * horizontal box layout. In this scenario the spacer creates an empty area of
 * 50 pixel width between the two widgets.
 *
 * *External Documentation*
 *
 * <a href='http://manual.qooxdoo.org/${qxversion}/pages/widget/spacer.html' target='_blank'>
 * Documentation of this widget in the qooxdoo manual.</a>
 */
qx.Class.define("qx.ui.core.Spacer",
{
  extend : qx.ui.core.LayoutItem,



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

 /**
  * @param width {Integer?null} the initial width
  * @param height {Integer?null} the initial height
  */
  construct : function(width, height)
  {
    this.base(arguments);

    // Initialize dimensions
    this.setWidth(width != null ? width : 0);
    this.setHeight(height != null ? height : 0);
  },



  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * Helper method called from the visibility queue to detect outstanding changes
     * to the appearance.
     *
     * @internal
     */
    checkAppearanceNeeds : function() {
      // placeholder to improve compatibility with Widget.
    },


    /**
     * Recursively adds all children to the given queue
     *
     * @param queue {Map} The queue to add widgets to
     */
    addChildrenToQueue : function(queue) {
      // placeholder to improve compatibility with Widget.
    },


    /**
     * Removes this widget from its parent and dispose it.
     *
     * Please note that the widget is not disposed synchronously. The
     * real dispose happens after the next queue flush.
     *
     * @return {void}
     */
    destroy : function()
    {
      if (this.$$disposed) {
        return;
      }

      var parent = this.$$parent;
      if (parent) {
        parent._remove(this);
      }

      qx.ui.core.queue.Dispose.add(this);
    }
  }
});
