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
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/**
 * Mixin holding the handler for the two axis mouse wheel scrolling. Please
 * keep in mind that the including widget has to have the scroll bars
 * implemented as child controls named <code>scrollbar-x</code> and
 * <code>scrollbar-y</code> to get the handler working. Also, you have to
 * attach the listener yourself.
 */
qx.Mixin.define("qx.ui.core.scroll.MWheelHandling",
{
  members :
  {
    /**
     * Mouse wheel event handler
     *
     * @param e {qx.event.type.Mouse} Mouse event
     */
    _onMouseWheel : function(e)
    {
      var showX = this._isChildControlVisible("scrollbar-x");
      var showY = this._isChildControlVisible("scrollbar-y");

      var scrollbarY = showY ? this.getChildControl("scrollbar-y", true) : null;
      var scrollbarX = showX ? this.getChildControl("scrollbar-x", true) : null;

      var deltaY = e.getWheelDelta("y");
      var deltaX = e.getWheelDelta("x");

      var endY = !showY;
      var endX = !showX;

      // y case
      if (scrollbarY) {
        var steps = parseInt(deltaY);

        if (steps !== 0) {
          scrollbarY.scrollBySteps(steps);
        }

        var position = scrollbarY.getPosition();
        var max = scrollbarY.getMaximum();

        // pass the event to the parent if the scrollbar is at an edge
        if (steps < 0 && position <= 0 || steps > 0 && position >= max) {
          endY = true;
        }
      }

      // x case
      if (scrollbarX) {
        var steps = parseInt(deltaX);

        if (steps !== 0) {
          scrollbarX.scrollBySteps(steps);
        }

        var position = scrollbarX.getPosition();
        var max = scrollbarX.getMaximum();
        // pass the event to the parent if the scrollbar is at an edge
        if (steps < 0 && position <= 0 || steps > 0 && position >= max) {
          endX = true;
        }
      }

      // pass the event to the parent if both scrollbars are at the end
      if (!endY || !endX) {
        // Stop bubbling and native event only if a scrollbar is visible
        e.stop();
      }
    }
  }
});