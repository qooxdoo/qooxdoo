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
    
    
    isVisible : function(widget) {
      return this.__data[widget.$$hash] || false;
    },
    
    
    computeVisible : function(widget)
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
          visible = this.computeVisible(parent);
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
      var Appearance = qx.ui.core.queue.Appearance;
      
      // Dispose all registered objects
      var queue = this.__queue;
      var data = this.__data;
      var old, value, widget;
  
      // Add children to queue
      for (var hash in queue) 
      {
        widget = queue[hash];  
        widget.addChildrenToQueue(queue);
      }
      
      // Cache old data, clear current data
      var oldData = {};
      for (var hash in queue) 
      {
        widget = queue[hash];         
        oldData[hash] = data[hash];
        data[hash] = null;
      }
      
      // Finally recompute
      for (var hash in queue)
      {
        widget = queue[hash];         
        
        // Only update when not already updated by another widget
        if (data[hash] == null) {
          this.computeVisible(widget);
        }
        
        // Invisible widgets are ignored for appearance (better performance)
        // Need to inform appearance queue about the visibility change
        if (oldData[hash] != null && data[hash] && data[hash] != oldData[hash]) {
          Appearance.schedule(widget);
        }
      }

      // Recreate the map is cheaper compared to keep a holey map over time
      // This is especially true for IE7
      this.__queue = {};
    }
  }
});
