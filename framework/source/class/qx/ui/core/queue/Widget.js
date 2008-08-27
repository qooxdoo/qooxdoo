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
 * The widget queue handles the deferred computation of certain widget properties.
 * It is used e.g. for the tree to update the indentation of tree nodes.
 *
 * This queue calles the the method {@link qx.ui.core.Widget#syncWidget} of each
 * queued widget before the layout queues are processed.
 */
qx.Class.define("qx.ui.core.queue.Widget",
{
  statics :
  {
    /** {Map} This contains all the queued widgets for the next flush. */
    __queue : {},


    /**
     * Adds a widget to the queue.
     *
     * @param widget {qx.ui.core.Widget} The widget to add.
     * @return {void}
     */
    add : function(widget)
    {
      var queue = this.__queue;
      if (queue[widget.$$hash]) {
        return;
      }

      queue[widget.$$hash] = widget;
      qx.ui.core.queue.Manager.scheduleFlush("widget");
    },


    /**
     * Flushes the widget queue.
     *
     * This is used exclusively by the {@link qx.ui.core.QueueManager}.
     *
     * @return {void}
     */
    flush : function()
    {
      // Process all registered widgets
      var queue = this.__queue;
      var obj;
      for (var hash in queue)
      {
        // Order is important to allow the same widget to be requeued directly
        obj = queue[hash];
        delete queue[hash];
        obj.syncWidget();
      }

      // Empty check
      for (var hash in queue) {
        return;
      }

      // Recreate the map is cheaper compared to keep a holey map over time
      // This is especially true for IE7
      this.__queue = {};
    }
  }
});
