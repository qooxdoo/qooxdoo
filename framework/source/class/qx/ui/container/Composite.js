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
 * The composite exposes all methods to set layouts and to manage child widgets
 * as public methods. This class can be used to manually compose widgets using
 * layout manager.
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
})