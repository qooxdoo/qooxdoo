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
 * The layout queue manages all widgets, which need a recalculation of their
 * layout. The {@link #flush} method computes the layout of all queued widgets
 * and their dependent widgets.
 */
qx.Class.define("qx.ui.core.queue.Layout",
{
  statics :
  {
    /** {Map} This contains all the queued widgets for the next flush. */
    __queue : {},


    /**
     * Mark a widget's layout as invalid and add its layout root to
     * the queue.
     *
     * Should only be used by {@link qx.ui.core.Widget}.
     *
     * @param widget {qx.ui.core.Widget} Widget to add.
     * @return {void}
     */
    add : function(widget)
    {
      this.__queue[widget.$$hash] = widget;
      qx.ui.core.queue.Manager.scheduleFlush("layout");
    },


    /**
     * Update the layout of all widgets, which layout is marked as invalid.
     *
     * This is used exclusively by the {@link qx.ui.core.queue.Manager}.
     *
     * @return {void}
     */
    flush : function()
    {
      // get sorted widgets to (re-)layout
      var queue = this.__getSortedQueue();

      // iterate in reversed order to process widgets with the smallest nesting
      // level first because these may affect the inner lying children
      for (var i=queue.length-1; i>=0; i--)
      {
        var widget = queue[i];

        // continue if a relayout of one of the root's parents has made the
        // layout valid
        if (widget.hasValidLayout()) {
          continue;
        }

        // overflow areas or qx.ui.root.*
        if (widget.isRootWidget() && !widget.hasUserBounds())
        {
          // This is a real root widget. Set its size to its preferred size.
          var hint = widget.getSizeHint();
          widget.renderLayout(0, 0, hint.width, hint.height);
        }
        else
        {
          // This is an inner item of layout changes. Do a relayout of its
          // children without changing its position and size.
          var bounds = widget.getBounds();
          widget.renderLayout(bounds.left, bounds.top, bounds.width, bounds.height);
        }
      }
    },


    /**
     * Get the widget's nesting level. Top level widgets have a nesting level
     * of <code>0</code>.
     *
     * @param widget {qx.ui.core.Widget} The widget to query.
     * @return {Integer} The nesting level
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

        if (!parent.$$parent) {
          break;
        }

        parent = parent.$$parent;
        level += 1;
      }

      // Update the processed hierarchy (runs from inner to outer)
      var leveldown = level;
      while (widget && widget !== parent)
      {
        cache[widget.$$hash] = leveldown--;
        widget = widget.$$parent;
      }

      return level;
    },


    /**
     * Whether the given widget is visible.
     *
     * @param widget {qx.ui.core.Widget} The widget to test
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

        // Root widgets are always visible
        if (parent.isRootWidget())
        {
          value = true;
          break;
        }

        // Detection using local value
        if (!parent.shouldBeLayouted()) {
          break;
        }

        parent = parent.$$parent;
      }

      // Update the processed hierarchy
      while (widget && widget !== parent)
      {
        cache[widget.$$hash] = value;
        widget = widget.$$parent;
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
      var widget, level;

      for (var hash in queue)
      {
        widget = queue[hash];

        if (this.isWidgetVisible(widget))
        {
          level = this.getNestingLevel(widget);

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
     * @return {qx.ui.core.Widget[]} Ordered list or layout roots.
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
          if (level == 0 || widget.isRootWidget() || widget.hasUserBounds())
          {
            sortedQueue.push(widget);
            widget.invalidateLayoutCache();
            continue;
          }

          // compare old size hint to new size hint
          var oldSizeHint = widget.getSizeHint(false);

          if (oldSizeHint)
          {
            widget.invalidateLayoutCache();
            var newSizeHint = widget.getSizeHint();

            var hintChanged = (
              !widget.getBounds() ||
              oldSizeHint.minWidth !== newSizeHint.minWidth ||
              oldSizeHint.width !== newSizeHint.width ||
              oldSizeHint.maxWidth !== newSizeHint.maxWidth ||
              oldSizeHint.minHeight !== newSizeHint.minHeight ||
              oldSizeHint.height !== newSizeHint.height ||
              oldSizeHint.maxHeight !== newSizeHint.maxHeight
            );
          }
          else
          {
            hintChanged = true;
          }

          if (hintChanged)
          {
            // Since the level is > 0, the widget must
            // have a parent != null.
            var parent = widget.getLayoutParent();
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
