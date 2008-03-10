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
      qx.ui.core.queue.Manager.scheduleFlush("appearance");
    },


    /**
     * Flushes the appearance queue.
     *
     * This is used exclusively by the {@link qx.ui.core.queue.Manager}.
     *
     * @internal
     * @return {void}
     */
    flush : function()
    {
      var queue = this.__queue;
      var widget;

      // Process children...
      for (var hash in queue)
      {
        widget = queue[hash];
        widget.syncAppearance();
      }

      // Only recreate when there was at least one child.
      if (widget) {
        this.__queue = {};
      }
    }
  }
});
