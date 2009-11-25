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
 * Keeps data about the visibility of all widgets. Updates the internal
 * tree when widgets are added, removed or modify their visibility.
 */
qx.Class.define("qx.ui.core.queue.Visibility",
{
  statics :
  {
    /** {Map} This contains all the queued widgets for the next flush. */
    __queue : {},


    /** {Map} Maps hash codes to visibility */
    __data : {},


    /**
     * Clears the cached data of the given widget. Normally only used
     * during interims disposes of one or a few widgets.
     *
     * @param widget {qx.ui.core.Widget} The widget to clear
     */
    remove : function(widget)
    {
      var hash = widget.$$hash;

      delete this.__data[hash];
      delete this.__queue[hash];
    },


    /**
     * Whether the given widget is visible.
     *
     * Please note that the information given by this method is queued and may not be accurate
     * until the next queue flush happens.
     *
     * @param widget {qx.ui.core.Widget} The widget to query
     * @return {Boolean} Whether the widget is visible
     */
    isVisible : function(widget) {
      return this.__data[widget.$$hash] || false;
    },


    /**
     * Computes the visibility for the given widget
     *
     * @param widget {qx.ui.core.Widget} The widget to update
     * @return {Boolean} Whether the widget is visible
     */
    __computeVisible : function(widget)
    {
      var data = this.__data;
      var hash = widget.$$hash;
      var visible;

      // Respect local value
      if (widget.isExcluded())
      {
        visible = false;
      }
      else
      {
        // Parent hierarchy
        var parent = widget.$$parent;
        if (parent) {
          visible = this.__computeVisible(parent);
        } else {
          visible = widget.isRootWidget();
        }
      }

      return data[hash] = visible;
    },


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
      qx.ui.core.queue.Manager.scheduleFlush("visibility");
    },


    /**
     * Flushes the visibility queue.
     *
     * This is used exclusively by the {@link qx.ui.core.queue.Manager}.
     *
     * @return {void}
     */
    flush : function()
    {
      // Dispose all registered objects
      var queue = this.__queue;
      var data = this.__data;

      // Dynamically add children to queue
      // Only respect already known widgets because otherwise the children
      // are also already in the queue (added on their own)
      for (var hash in queue)
      {
        if (data[hash] != null) {
          queue[hash].addChildrenToQueue(queue);
        }
      }

      // Cache old data, clear current data
      // Do this before starting with recompution because
      // new data may also be added by related widgets and not
      // only the widget itself.
      var oldData = {};
      for (var hash in queue)
      {
        oldData[hash] = data[hash];
        data[hash] = null;
      }

      // Finally recompute
      for (var hash in queue)
      {
        var widget = queue[hash];
        delete queue[hash];

        // Only update when not already updated by another widget
        if (data[hash] == null) {
          this.__computeVisible(widget);
        }

        // Check for updates required to the appearance.
        // Hint: Invisible widgets are ignored inside appearance flush
        if (data[hash] && data[hash] != oldData[hash]) {
          widget.checkAppearanceNeeds();
        }
      }

      // Recreate the map is cheaper compared to keep a holey map over time
      // This is especially true for IE7
      this.__queue = {};
    }
  }
});
