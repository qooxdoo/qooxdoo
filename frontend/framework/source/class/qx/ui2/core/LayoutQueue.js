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

qx.Class.define("qx.ui2.core.LayoutQueue",
{
  statics :
  {
    /** {Map} This contains all the queued widgets for the next flush. */
    __queue : {},


    /**
     * Mark a widget's layout as invalid and add its layout root to
     * the queue.
     *
     * Should only be used by {@link qx.ui2.core.Widget}.
     *
     * @type static
     * @param widget {qx.ui2.core.Widget} Widget to add.
     * @return {void}
     */
    add : function(widget)
    {
      this.__queue[widget.$$hash] = widget;

      if (this.__inFlush) {
        this.__modifiedDuringFlush = true;
      } else {
        qx.ui2.core.QueueManager.scheduleFlush("layout");
      }
    },


    /**
     * Update the layout of all widgets, which layout is marked as invalid.
     *
     * This is used exclusively by the {@link qx.ui2.core.QueueManager}.
     *
     * @type static
     * @return {void}
     */
    flush : function()
    {
      if (this.__inFlush) {
        return;
      }

      this.__inFlush = true;

      // do flush while the layouts change during flush
      do
      {
        // qx.core.Log.debug("Flush layout queue");
        delete this.__modifiedDuringFlush;

        // get sorted widgets to (re-)layout
        var queue = this.__getSortedQueue();

        // iterate in reversed order to process widgets with the smalles nesting
        // level first because these may affect the inner lying children
        for (var i=queue.length-1; i>=0; i--)
        {
          var widget = queue[i];

          // continue if a relayout of one of the root's parents has made the
          // layout valid
          if (widget.hasValidLayout()) {
            continue;
          }

          // overflow areas or qx.ui2.root.*
          if (widget.isLayoutRoot())
          {
            // This is a real root widget. Set its size to its preferred size.
            var rootHint = widget.getSizeHint();
            // qx.core.Log.debug("Relayout of root widget: " + widget);
            widget.renderLayout(0, 0, rootHint.width, rootHint.height);
          }
          else
          {
            // This is an inner item of layout changes. Do a relayout of its
            // children without changing its position and size.
            qx.core.Log.debug("Relayout of widget: " + widget);
            widget.renderLayout(
              widget._computedLayout.left,
              widget._computedLayout.top,
              widget._computedLayout.width,
              widget._computedLayout.height
            );
          }
        }
      } while (this.__modifiedDuringFlush);

      delete this.__inFlush;
    },


    /**
     * Get the widget's nesting level. Top level widgets have a nesting level
     * of <code>0</code>.
     *
     * @type static
     * @return {Integer} The widgets nesting level.
     */
    getNestingLevel : function(widget)
    {
      var cache = this.__nesting;
      var level = 0;
      var parent = widget;

      // Detecting level
      while (true)
      {
        if (cache[parent.$$hash] != null)
        {
          level += cache[parent.$$hash];
          break;
        }

        if (!parent._parent) {
          break;
        }

        parent = parent._parent;
        level += 1;
      }

      // Update the processed hierarchy (runs from inner to outer)
      var leveldown = level;
      while (widget && widget !== parent)
      {
        cache[widget.$$hash] = leveldown--;
        widget = widget._parent;
      }

      return level;
    },


    /**
     * Whether the given widget is visible.
     *
     * @type static
     * @param widget {qx.ui2.core.Widget} The widget to test
     * @return {Boolean} <code>true</code> when the widget is visible.
     */
    isWidgetVisible : function(widget)
    {
      var cache = this.__visibility;
      var parent = widget;
      var value = false;

      // Detecting visibility
      while (parent)
      {
        // Try to read value from cache
        if (cache[parent.$$hash] != null)
        {
          value = cache[parent.$$hash];
          break;
        }

        // Detection using local value
        if (!parent._isLocallyVisible) {
          break;
        }

        // Root widgets are always visible
        if (parent.isRootWidget())
        {
          value = true;
          break;
        }

        parent = parent._parent;
      }

      // Update the processed hierarchy
      while (widget && widget !== parent)
      {
        cache[widget.$$hash] = value;
        widget = widget._parent;
      }

      return value;
    },


    /**
     * Group widget by their nesting level.
     *
     * @return {Map[]} A sparse array. Each entry of the array contains a widget
     *     map with all widgets of the same level as the array index.
     */
    __getLevelGroupedWidgets : function()
    {
      // clear caches
      this.__visibility = {};
      this.__nesting = {};

      // sparse level array
      var levels = [];
      var queue = this.__queue;
      var widget;

      for (var hash in queue)
      {
        widget = queue[hash];

        if (this.isWidgetVisible(widget))
        {
          var level = this.getNestingLevel(widget);

          // create hierarchy
          if (!levels[level]) {
            levels[level] = {};
          }

          // store widget in level map
          levels[level][hash] = widget;

          // remove widget from layout queue
          delete queue[hash];
        }
      }

      return levels;
    },


    /**
     * Compute all layout roots of the given widgets. Layout roots are either
     * root widgets or widgets, which preferred size has not changed by the
     * layout changes of its children.
     *
     * This function returns the roots ordered by their nesting factors. The
     * layout with the largest nesting level comes first.
     *
     * @return {qx.ui2.core.Widget[]} Ordered list or layout roots.
     */
    __getSortedQueue : function()
    {
      var sortedQueue = [];
      var levels = this.__getLevelGroupedWidgets();

      for (var level=levels.length-1; level>=0; level--)
      {
        // Ignore empty levels (levels is an sparse array)
        if (!levels[level]) {
          continue;
        }

        for (var hash in levels[level])
        {
          var widget = levels[level][hash];

          // This is a real layout root. Add it directly to the list
          if (level == 0 || widget.isLayoutRoot())
          {
            sortedQueue.push(widget);
            widget.invalidateLayoutCache();
            continue;
          }

          // compare old size hint to new size hint
          var oldSizeHint = widget.getCachedSizeHint();

          if (oldSizeHint)
          {
            widget.invalidateLayoutCache();
            var newSizeHint = widget.getSizeHint();

            var hintChanged = (
              oldSizeHint.minWidth !== newSizeHint.minWidth ||
              oldSizeHint.width !== newSizeHint.width ||
              oldSizeHint.maxWidth !== newSizeHint.maxWidth ||
              oldSizeHint.minHeight !== newSizeHint.minHeight ||
              oldSizeHint.height !== newSizeHint.height ||
              oldSizeHint.maxHeight !== newSizeHint.maxHeight
            );
          }
          else {
            hintChanged = true;
          }

          if (hintChanged)
          {
            // invalidateLayoutCache parent. Since the level is > 0, the widget must
            // have a parent != null.
            var parent = widget.getParent();
            if (!levels[level-1]) {
              levels[level-1] = {};
            }

            levels[level-1][parent.$$hash] = parent;
          }
          else
          {
            // this is an internal layout root since its own preferred size
            // has not changed.
            sortedQueue.push(widget);
          }
        }
      }

      return sortedQueue;
    }
  }
});
