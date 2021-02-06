/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Fabian Jakobs (fjakobs)

************************************************************************ */


/**
 * The Composite is a generic container widget.
 *
 * It exposes all methods to set layouts and to manage child widgets
 * as public methods. You must configure this widget with a layout manager to
 * define the way the widget's children are positioned.
 *
 * *Example*
 *
 * Here is a little example of how to use the widget.
 *
 * <pre class='javascript'>
 *   // create the composite
 *   var composite = new qx.ui.container.Composite()
 *
 *   // configure it with a horizontal box layout with a spacing of '5'
 *   composite.setLayout(new qx.ui.layout.HBox(5));
 *
 *   // add some children
 *   composite.add(new qx.ui.basic.Label("Name: "));
 *   composite.add(new qx.ui.form.TextField());
 *
 *   this.getRoot().add(composite);
 * </pre>
 *
 * This example horizontally groups a label and text field by using a
 * Composite configured with a horizontal box layout as a container.
 *
 * *External Documentation*
 *
 * <a href='http://qooxdoo.org/docs/#desktop/widget/composite.md' target='_blank'>
 * Documentation of this widget in the qooxdoo manual.</a>
 */
qx.Class.define("qx.ui.container.Composite",
{
  extend : qx.ui.core.Widget,
  include : [ qx.ui.core.MChildrenHandling, qx.ui.core.MLayoutHandling ],



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param layout {qx.ui.layout.Abstract} A layout instance to use to
   *   place widgets on the screen.
   */
  construct : function(layout)
  {
    this.base(arguments);

    if (layout != null) {
      this._setLayout(layout);
    }
  },



  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events :
  {
    /**
     * This event is fired after a child widget was added to this widget. The
     * {@link qx.event.type.Data#getData} method of the event returns the
     * added child.
     */
    addChildWidget : "qx.event.type.Data",


    /**
     * This event is fired after a child widget has been removed from this widget.
     * The {@link qx.event.type.Data#getData} method of the event returns the
     * removed child.
     */
    removeChildWidget : "qx.event.type.Data"
  },



  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    // overridden
    _afterAddChild : function(child) {
      this.fireNonBubblingEvent("addChildWidget", qx.event.type.Data, [child]);
    },


    // overridden
    _afterRemoveChild : function(child) {
      this.fireNonBubblingEvent("removeChildWidget", qx.event.type.Data, [child]);
    }
  },



  /*
  *****************************************************************************
     DEFER
  *****************************************************************************
  */

  defer : function(statics, members)
  {
    qx.ui.core.MChildrenHandling.remap(members);
    qx.ui.core.MLayoutHandling.remap(members);
  }
});
