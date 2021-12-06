/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
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
    /** @type {Array} This contains all the queued widgets for the next flush. */
    __queue : [],
    
    /** @type {Map} map of widgets by hash code which are in the queue */
    __lookup : {},


    /**
     * Clears the widget from the internal queue. Normally only used
     * during interims disposes of one or a few widgets.
     *
     * @param widget {qx.ui.core.Widget} The widget to clear
     */
    remove : function(widget) {
    	if (this.__lookup[widget.toHashCode()]) {
    		qx.lang.Array.remove(this.__queue, widget);
    		delete this.__lookup[widget.toHashCode()];
    	}
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
      if (this.__lookup[widget.toHashCode()]) {
        return;
      }

      this.__queue.unshift(widget);
      this.__lookup[widget.toHashCode()] = widget;
      qx.ui.core.queue.Manager.scheduleFlush("appearance");
    },


    /**
     * Whether the given widget is already queued
     *
     * @param widget {qx.ui.core.Widget} The widget to check
     * @return {Boolean} <code>true</code> if the widget is queued
     */
    has : function(widget) {
      return !!this.__lookup[widget.toHashCode()];
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
        delete this.__lookup[obj.toHashCode()]

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
