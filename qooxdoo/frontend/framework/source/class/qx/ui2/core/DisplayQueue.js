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

qx.Class.define("qx.ui2.core.DisplayQueue",
{
  statics :
  {
    /** {Map} This contains all the queued widgets for the next flush. */
    __queue : {},


    /**
     * Adds a widget to the queue.
     *
     * @internal
     * @type member
     * @param widget {qx.ui2.core.Widget}
     * @return {void}
     */
    add : function(widget)
    {
      this.__queue[widget.toHashCode()] = widget;
      qx.ui2.core.QueueManager.scheduleFlush("display");
    },


    /**
     * Flushes the display queue. This queue fires <code>appear</code> and
     * <code>disappear</code> events.
     *
     * This is normally done exclusively by the {@link qx.ui2.core.QueueManager}.
     *
     * @internal
     * @return {void}
     */
    flush : function()
    {
      var queue = this.__queue;
      var widget, visible, type;

      // Process children...
      for (var hc in queue)
      {
        widget = queue[hc];
        displayed = !!(widget.getParent() && widget.getVisibility() === "visible" && widget.getLayoutVisible());

        if (widget._displayed !== displayed)
        {
          type = displayed ? "appear" : "disappear";

          if (widget.hasListeners(type))
          {
            widget.fireEvent(type);
            widget._displayed = displayed;
          }
        }
      }

      // Only recreate when there was at least one child.
      if (widget) {
        this.__queue = {};
      }
    }
  }
});
