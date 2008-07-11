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
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * This mixin blocks events and can be included into all widgets.
 *
 * The {@link #block} and {@link #unblock} methods provided by this mixin can be used
 * to block any event from the widget. It uses the sub widget id "blocker"
 * defined in {@link qx.core.Widget} to render the blocker widget. When blocked,
 * the blocker widget overlays the widget to block, including the padding area.
 */
qx.Mixin.define("qx.ui.core.MBlocker",
{
  members :
  {
    /**
     * Block all event from this widget by placing a transparent overlay widget,
     * which receives all events exactly over the widget.
     */
    block : function()
    {
      if (this.__isBlocked) {
        return;
      }
      this.__isBlocked = true;

      // overlay the blocker widget
      // this prevents bubbling events
      this.addListener("resize", this.__onBlockerResize, this);
      this.__onBlockerResize()

      // remember old value and set make widget anonymous. This prevents
      // "capturing events"
      this.__oldAnonymous = this.getAnonymous();
      this.setAnonymous(true);
    },


    /**
     * Returns whether the widget is blocked.
     *
     * @return {Boolean} Whether the widget is blocked.
     */
    isBlocked : function() {
      return !!this.__isBlocked;
    },


    /**
     * Resize the blocker element to the size of the widget and show it.
     */
    __onBlockerResize : function()
    {
      var size = this.getBounds();
      if (!size) {
        return;
      }

      var blocker = this._getChildControl("blocker").set({
        width: size.width,
        height: size.height
      });
      blocker.show();
    },


    /**
     * Unblock the widget blocked by {@link #block}
     */
    unblock : function()
    {
      if (!this.__isBlocked) {
        return;
      }
      this.__isBlocked = false;

      this.removeListener("resize", this.__onBlockerResize, this);

      this.setAnonymous(this.__oldAnonymous);
      this._getChildControl("blocker").exclude();
    }
  }
});