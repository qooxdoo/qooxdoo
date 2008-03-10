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
 * The DisposeQueue registers all widgets which are should be disposed.
 * This queue makes it possible to remove widgets from the DOM using
 * the layout and element queues and dispose them afterwards.
 */
qx.Class.define("qx.ui.core.queue.Dispose",
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
      if (this.__queue[widget.$$hash]) {
        return;
      }

      this.__queue[widget.$$hash] = widget;
      qx.ui.core.QueueManager.scheduleFlush("dispose");
    },


    /**
     * Flushes the dispose queue.
     *
     * This is used exclusively by the {@link qx.ui.core.QueueManager}.
     *
     * @internal
     * @return {void}
     */
    flush : function()
    {
      var queue = this.__queue;

      // Process children...
      for (var hash in queue) {
        queue[hash].dispose();
      }

      this.__queue = {};
    }
  }
});
