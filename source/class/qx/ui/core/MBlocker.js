/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * This mixin blocks events and can be included into all widgets.
 *
 * The {@link #block} and {@link #unblock} methods provided by this mixin can be used
 * to block any event from the widget. When blocked,
 * the blocker widget overlays the widget to block, including the padding area.
 *
 * The ({@link #blockContent} method can be used to block child widgets with a
 * zIndex below a certain value.
 */
qx.Mixin.define("qx.ui.core.MBlocker",
{
  properties :
  {
    /**
     * Color of the blocker
     */
    blockerColor  :
    {
      check : "Color",
      init : null,
      nullable: true,
      apply : "_applyBlockerColor",
      themeable: true
    },


    /**
     * Opacity of the blocker
     */
    blockerOpacity :
    {
      check : "Number",
      init : 1,
      apply : "_applyBlockerOpacity",
      themeable: true
    }
  },


  members :
  {
    __blocker : null,


    /**
     * Template method for creating the blocker item.
     * @return {qx.ui.core.Blocker} The blocker to use.
     */
    _createBlocker : function() {
      return new qx.ui.core.Blocker(this);
    },


    // property apply
    _applyBlockerColor : function(value, old) {
      this.getBlocker().setColor(value);
    },


    // property apply
    _applyBlockerOpacity : function(value, old) {
      this.getBlocker().setOpacity(value);
    },

    /**
     * Block all events from this widget by placing a transparent overlay widget,
     * which receives all events, exactly over the widget.
     */
    block : function() {
      this.getBlocker().block();
    },


    /**
     * Returns whether the widget is blocked.
     *
     * @return {Boolean} Whether the widget is blocked.
     */
    isBlocked : function() {
      return this.__blocker && this.__blocker.isBlocked();
    },


    /**
     * Unblock the widget blocked by {@link #block}, but it takes care of
     * the amount of {@link #block} calls. The blocker is only removed if
     * the number of {@link #unblock} calls is identical to {@link #block} calls.
     */
    unblock : function() {
      if (this.__blocker) {
        this.__blocker.unblock();
      }
    },


    /**
     * Unblock the widget blocked by {@link #block}, but it doesn't take care of
     * the amount of {@link #block} calls. The blocker is directly removed.
     */
    forceUnblock : function() {
      if (this.__blocker) {
        this.__blocker.forceUnblock();
      }
    },


    /**
     * Block direct child widgets with a zIndex below <code>zIndex</code>
     *
     * @param zIndex {Integer} All child widgets with a zIndex below this value
     *     will be blocked
     */
    blockContent : function(zIndex) {
      this.getBlocker().blockContent(zIndex);
    },


    /**
     * Get the blocker
     *
     * @return {qx.ui.core.Blocker} The blocker
     */
    getBlocker : function() {
      if (!this.__blocker) {
        this.__blocker = this._createBlocker();
      }
      return this.__blocker;
    }
  },


  destruct : function() {
    this._disposeObjects("__blocker");
  }
});
