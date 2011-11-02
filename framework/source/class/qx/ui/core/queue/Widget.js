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
 * This queue calls the method {@link qx.ui.core.Widget#syncWidget} of each
 * queued widget before the layout queues are processed.
 */
qx.Class.define("qx.ui.core.queue.Widget",
{
  statics :
  {
    /** {Array} This contains all the queued widgets for the next flush. */
    __queue : [],


    /**
     * Clears the widget from the internal queue. Normally only used
     * during interims disposes of one or a few widgets.
     *
     * @param widget {qx.ui.core.Widget} The widget to clear
     */
    remove : function(widget) {
      qx.lang.Array.remove(this.__queue, widget);
    },


    /**
     * Adds a widget to the queue.
     *
     * @param widget {qx.ui.core.Widget} The widget to add.
     */
    add : function(widget)
    {
      var queue = this.__queue;
      if (qx.lang.Array.contains(queue, widget)) {
        return;
      }

      queue.unshift(widget);
      qx.ui.core.queue.Manager.scheduleFlush("widget");
    },


    /**
     * Flushes the widget queue.
     *
     * This is used exclusively by the {@link qx.ui.core.queue.Manager}.
     */
    flush : function()
    {
      // Process all registered widgets
      var queue = this.__queue;
      var obj;
      for (var i = queue.length - 1 ; i >= 0; i--)
      {
        // Order is important to allow the same widget to be requeued directly
        obj = queue[i];
        queue.splice(i, 1);
        obj.syncWidget();
      }

      // Empty check
      if (queue.length != 0) {
        return;
      }

      // Recreate the array is cheaper compared to keep a holey array over time
      // This is especially true for IE7
      this.__queue = [];
    }
  }
});