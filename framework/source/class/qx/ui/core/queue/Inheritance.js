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

************************************************************************ */

/**
 * Manages the widgets which have modified parent and re-apply inherited
 * properties to the hierarchy starting with them.
 */
qx.Class.define("qx.ui.core.queue.Inheritance",
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
      qx.ui.core.queue.Manager.scheduleFlush("inheritance");
    },


    /**
     * Flushes the dispose queue.
     *
     * This is used exclusively by the {@link qx.ui.core.QueueManager}.
     *
     * @return {void}
     */
    flush : function()
    {
      // TODO
    }
  }
});
