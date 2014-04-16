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
 * @require(qx.module.Animation)
 * @require(qx.module.Manipulating)
 *
 * Mixin for the {@link Scroll} container. Used when the variant
 * <code>qx.mobile.nativescroll</code> is set to "on".
 */
qx.Mixin.define("qx.ui.mobile.container.MNativeScroll",
{


  construct : function()
  {
    this.addCssClass("native");
    if(qx.core.Environment.get("os.name") == "ios") {
      this.addListener("touchstart", this._onTouchStart, this);
    }
  },


  members :
  {
    /**
     * Handler for "touchstart" event.
     * Prevents "rubber-banding" effect of page in iOS.
     * @param evt {qx.event.type.Touch} The touch event.
     */
    _onTouchStart: function(evt) {
      // If scroll container is scrollable
      if (this._isScrollableY()) {
        var scrollTop = this.getContentElement().scrollTop;
        var maxScrollTop = this.getContentElement().scrollHeight - this.getLayoutParent().getContentElement().offsetHeight;
        if (scrollTop === 0) {
          this.getContentElement().scrollTop = 1;
        } else if (scrollTop == maxScrollTop) {
          this.getContentElement().scrollTop = maxScrollTop - 1;
        }
      } else {
        if (!(evt.getTarget() instanceof qx.ui.mobile.form.Input)) {
          evt.preventDefault();
        }
      }
    },


    /**
     * Mixin method. Creates the scroll element.
     *
     * @return {Element} The scroll element
     */
    _createScrollElement: function() {
      return null;
    },


    /**
     * Returns the current scroll position
     * @return {Array} an array with <code>[scrollLeft,scrollTop]</code>.
     */
    _getPosition: function() {
      return [this.getContentElement().scrollLeft, this.getContentElement().scrollTop];
    },


    /**
     * Mixin method. Returns the scroll content element.
     *
     * @return {Element} The scroll content element
     */
    _getScrollContentElement: function() {
      return null;
    },


    /**
     * Scrolls the wrapper contents to the x/y coordinates in a given period.
     *
     * @param x {Integer} X coordinate to scroll to.
     * @param y {Integer} Y coordinate to scroll to.
     * @param time {Integer} is always <code>0</code> for this mixin.
     */
    _scrollTo: function(x, y, time) {
      var element = qxWeb(this.getContentElement());
      element.setScrollLeft(x, time);
      element.setScrollTop(y, time);
    }
  }
});
