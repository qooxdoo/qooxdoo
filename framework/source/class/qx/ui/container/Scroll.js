/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's left-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * Container, which allows vertical and horizontal scrolling if the contents is
 * larger than the container.
 *
 * Note that this class can only have one child widget. This container has a
 * fixed layout, which cannot be changed.
 *
 * *Example*
 *
 * Here is a little example of how to use the widget.
 *
 * <pre class='javascript'>
 *   // create scroll container
 *   var scroll = new qx.ui.container.Scroll().set({
 *     width: 300,
 *     height: 200
 *   });
 *
 *   // add a widget which is larger than the container
 *   scroll.add(new qx.ui.core.Widget().set({
 *     width: 600,
 *     minWidth: 600,
 *     height: 400,
 *     minHeight: 400
 *   });
 *
 *   this.getRoot().add(scroll);
 * </pre>
 *
 * This example creates a scroll container and adds a widget, which is larger
 * than the container. This will cause the container to display vertical
 * and horizontal toolbars.
 *
 * *External Documentation*
 *
 * <a href='http://manual.qooxdoo.org/${qxversion}/pages/widget/scroll.html' target='_blank'>
 * Documentation of this widget in the qooxdoo manual.</a>
 */
qx.Class.define("qx.ui.container.Scroll",
{
  extend : qx.ui.core.scroll.AbstractScrollArea,
  include : [qx.ui.core.MContentPadding],



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param content {qx.ui.core.LayoutItem?null} The content widget of the scroll
   *    container.
   */
  construct : function(content)
  {
    this.base(arguments);

    if (content) {
      this.add(content);
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * Sets the content of the scroll container. Scroll containers
     * may only have one child, so it always replaces the current
     * child with the given one.
     *
     * @param widget {qx.ui.core.Widget} Widget to insert
     * @return {void}
     */
    add : function(widget) {
      this.getChildControl("pane").add(widget);
    },


    /**
     * Returns the content of the scroll area.
     *
     * @param widget {qx.ui.core.Widget} Widget to remove
     * @return {qx.ui.core.Widget}
     */
    remove : function(widget) {
      this.getChildControl("pane").remove(widget);
    },


    /**
     * Returns the content of the scroll container.
     *
     * Scroll containers may only have one child. This
     * method returns an array containing the child or an empty array.
     *
     * @return {Object[]} The child array
     */
    getChildren : function() {
      return this.getChildControl("pane").getChildren();
    },


    /**
     * Returns the element, to which the content padding should be applied.
     *
     * @return {qx.ui.core.Widget} The content padding target.
     */
    _getContentPaddingTarget : function() {
      return this.getChildControl("pane");
    }
  }
});
