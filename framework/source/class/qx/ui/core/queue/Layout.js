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
 * The layout queue manages all widgets, which need a recalculation of their
 * layout. The {@link #flush} method computes the layout of all queued widgets
 * and their dependent widgets.
 */
qx.Class.define("qx.ui.core.queue.Layout",
{
  statics :
  {
    /** @type {Map} This contains all the queued widgets for the next flush. */
    __queue : {},


    /** Nesting level cache **/
    __nesting : {},


    /**
     * Clears the widget from the internal queue. Normally only used
     * during interims disposes of one or a few widgets.
     *
     * @param widget {qx.ui.core.Widget} The widget to clear
     */
    remove : function(widget) {
      delete this.__queue[widget.toHashCode()];
    },


    /**
     * Mark a widget's layout as invalid and add its layout root to
     * the queue.
     *
     * Should only be used by {@link qx.ui.core.Widget}.
     *
     * @param widget {qx.ui.core.Widget} Widget to add.
     */
    add : function(widget)
    {
      this.__queue[widget.toHashCode()] = widget;
      qx.ui.core.queue.Manager.scheduleFlush("layout");
    },

    /**
    * Check whether the queue has scheduled changes for a widget.
    * Note that the layout parent can have changes scheduled that
    * affect the children widgets.
    *
    * @param widget {qx.ui.core.Widget} Widget to check.
    * @return {Boolean} Whether the widget given has layout changes queued.
    */
    isScheduled : function(widget) {
      return !!this.__queue[widget.toHashCode()];
    },

    /**
     * Update the layout of all widgets, which layout is marked as invalid.
     *
     * This is used exclusively by the {@link qx.ui.core.queue.Manager}.
     *
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
        if (cache[parent.toHashCode()] != null)
        {
          level += cache[parent.toHashCode()];
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
        cache[widget.toHashCode()] = leveldown--;
        widget = widget.$$parent;
      }

      return level;
    },


    /**
     * Group widget by their nesting level.
     *
     * @return {Map[]} A sparse array. Each entry of the array contains a widget
     *     map with all widgets of the same level as the array index.
     */
    __getLevelGroupedWidgets : function()
    {
      var VisibilityQueue = qx.ui.core.queue.Visibility;

      // clear cache
      this.__nesting = {};

      // sparse level array
      var levels = [];
      var queue = this.__queue;
      var widget, level;

      for (var hash in queue)
      {
        widget = queue[hash];

        if (VisibilityQueue.isVisible(widget))
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

            levels[level-1][parent.toHashCode()] = parent;
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
