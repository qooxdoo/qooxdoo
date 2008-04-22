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

qx.Class.define("qx.ui.container.Composite",
{
  extend : qx.ui.core.Widget,
  include : qx.ui.core.MChildrenHandling,


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
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * Set a layout manager for the widget. A a layout manager can only be connected
     * with one widget. Reset the connection with a previous widget first, if you
     * like to use it in another widget instead.
     *
     * @type member
     * @param layout {qx.ui.layout.Abstract} The new layout or
     *     <code>null</code> to reset the layout.
     * @return {void}
     */
    setLayout : function(layout) {}
  },





  /*
  *****************************************************************************
     DEFER
  *****************************************************************************
  */

  defer : function(statics, members)
  {
    // Mapping of protected methods to public.
    // This omits an additional function call when using these methods.

    qx.ui.core.MChildrenHandling.remapMethods(members);
    members.setLayout = members._setLayout;

    /*
    members.getChildren = members._getChildren;
    members.indexOf = members._indexOf;
    members.hasChildren = members._hasChildren;

    members.add = members._add;
    members.addAt = members._addAt;
    members.addBefore = members._addBefore;
    members.addAfter = members._addAfter;

    members.remove = members._remove;
    members.removeAt = members._removeAt;
    members.removeAll = members._removeAll;
    */
  }
})