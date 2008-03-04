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
 * The DisplayQueue fires <code>appear</code> and <code>disappear</code>
 * events for widgets which changed their visibility or parent.
 */
qx.Class.define("qx.ui.core.DisplayQueue",
{
  statics :
  {
    /** {Map} This contains all the queued widgets for the next flush. */
    __queue : {},


    /**
     * Adds a widget to the queue.
     *
     * Should only be used by {@link qx.ui.core.Widget}.
     *
     * @type member
     * @param widget {qx.ui.core.Widget} The widget to add.
     * @return {void}
     */
    add : function(widget)
    {
      this.__queue[widget.$$hash] = widget;
      qx.ui.core.QueueManager.scheduleFlush("display");
    },


    /**
     * Flushes the display queue. This queue fires <code>appear</code> and
     * <code>disappear</code> events.
     *
     * This is used exclusively by the {@link qx.ui.core.QueueManager}.
     *
     * @internal
     * @return {void}
     */
    flush : function()
    {
      var queue = this.__queue;
      var widget, visible, type;

      // Process children...
      for (var hash in queue)
      {
        widget = queue[hash];
        displayed = widget.$$visible;

        if ((!!widget.$$displayed) !== displayed)
        {
          type = displayed ? "appear" : "disappear";
          if (widget.hasListeners(type)) {
            widget.fireEvent(type);
          }

          if (displayed) {
            widget.$$displayed = true;
          } else {
            delete widget.$$displayed;
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
