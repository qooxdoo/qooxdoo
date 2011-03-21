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
    /** {Array} This contains all the queued widgets for the next flush. */
    __queue : [],


    /**
     * Clears the widget from the internal queue. Normally only used
     * during interims disposes of one or a few widgets.
     *
     * @param widget {qx.ui.core.Widget} The widget to clear
     */
    remove : function(widget) {
      qx.lang.Array.remove(this.__queue, widget)
    },


    /**
     * Adds a widget to the queue.
     *
     * Should only be used by {@link qx.ui.core.Widget}.
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
      qx.ui.core.queue.Manager.scheduleFlush("appearance");
    },


    /**
     * Whether the given widget is already queued
     *
     * @param widget {qx.ui.core.Widget} The widget to check
     */
    has : function(widget) {
      return qx.lang.Array.contains(this.__queue, widget);
    },


    /**
     * Flushes the appearance queue.
     *
     * This is used exclusively by the {@link qx.ui.core.queue.Manager}.
     */
    flush : function()
    {
      var Visibility = qx.ui.core.queue.Visibility;

      var queue = this.__queue;
      var obj;

      for (var i = queue.length - 1; i >= 0; i--)
      {
        // Order is important to allow the same widget to be re-queued directly
        obj = queue[i];
        queue.splice(i, 1);

        // Only apply to currently visible widgets
        if (Visibility.isVisible(obj)) {
          obj.syncAppearance();
        } else {
          obj.$$stateChanges = true;
        }
      }
    }
  }
});
