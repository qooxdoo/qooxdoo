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
 * The AppearanceQueue registers all widgets which are influences through
 * state changes.
 */
qx.Class.define("qx.ui.core.queue.Appearance",
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
      qx.ui.core.queue.Manager.scheduleFlush("appearance");
    },


    /**
     * Flushes the appearance queue.
     *
     * This is used exclusively by the {@link qx.ui.core.queue.Manager}.
     *
     * @return {void}
     */
    flush : function()
    {
      // TODO: The performance may be improved when this is done
      // only for visible widgets (e.g. do not flush for hidden menus,
      // windows, etc.). The layout queue already has a few things for
      // testing for visibility. Maybe it would be a good idea to have a
      // globabally available visibility information anywhere.
      // See also bug #1279.
      var queue = this.__queue;
      var obj;
      for (var hash in queue)
      {
        // Order is important to allow the same widget to be requeued directly
        obj = queue[hash];
        delete queue[hash];
        obj.syncAppearance();
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
