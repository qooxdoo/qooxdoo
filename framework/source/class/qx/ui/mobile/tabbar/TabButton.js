/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Tino Butz (tbtz)

************************************************************************ */

/**
 * A tab button widget.
 *
 * A tab button can be added to the tab bar and is associated with a
 * {@link #view}.
 */
qx.Class.define("qx.ui.mobile.tabbar.TabButton",
{
  extend : qx.ui.mobile.form.Button,


 /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    // overridden
    defaultCssClass :
    {
      refine : true,
      init : "tabButton"
    },


    /**
     * The associated view.
     */
    view :
    {
      check : "qx.ui.mobile.core.Widget",
      nullable : false,
      init : null,
      apply : "_applyView",
      event : "changeView"
    }
  },


  members :
  {
    // property apply
    _applyView : function(value, old)
    {
      value.exclude();
    }
  }
});
