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
 * This mixin exposes all methods to manage the layout manager of a widget.
 * It can only be included into instances of {@link qx.ui.core.Widget}.
 *
 * To optimize the method calls the including widget should call the method
 * {@link #remap} in its defer function. This will map the protected
 * methods to the public ones and save one method call for each function.
 */
qx.Mixin.define("qx.ui.core.MLayoutHandling", {
  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members: {
    /**
     * Set a layout manager for the widget. A a layout manager can only be connected
     * with one widget. Reset the connection with a previous widget first, if you
     * like to use it in another widget instead.
     *
     * @param layout {qx.ui.layout.Abstract} The new layout or
     *     <code>null</code> to reset the layout.
     */
    setLayout(layout) {
      this._setLayout(layout);
    },

    /**
     * Get the widget's layout manager.
     *
     * @return {qx.ui.layout.Abstract} The widget's layout manager
     */
    getLayout() {
      return this._getLayout();
    }
  },

  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics: {
    /**
     * Mapping of protected methods to public.
     * This omits an additional function call when using these methods. Call
     * this methods in the defer block of the including class.
     *
     * @param members {Map} The including classes members map
     * @deprecated {7.0} this is not necessary in modern compilers and leads to unexpected behaviour
     */
    remap(members) {
      if (qx.core.Environment.get("qx.debug")) {
        qx.log.Logger.debug("Calling qx.ui.core.MLayoutHandling.remap is deprecated, please dont use it");
      }
      members.getLayout = members._getLayout;
      members.setLayout = members._setLayout;
    }
  }
});
