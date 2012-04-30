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
 * The widget queue handles the deferred computation of certain widget properties.
 * It is used e.g. for the tree to update the indentation of tree nodes.
 *
 * This queue calls the method {@link qx.ui.core.Widget#syncWidget} of each
 * queued widget before the layout queues are processed.
 */
qx.Class.define("qx.ui.core.queue.Widget",
{
  statics :
  {
    /** {Array} This contains all the queued widgets for the next flush. */
    __queue : [],


    /**
     * Clears given job of a widget from the internal queue. If no jobs left, 
     * widget will be removed completely from queue. Normally only used
     * during interims disposes of one or a few widgets.
     *
     * @param widget {qx.ui.core.Widget} The widget to clear
     * @param job {String} Job identifier. <code>null</code> will be converted
     * to "default"
     */
    remove : function(widget, job) 
    {
      var queue = this.__queue;
      if (job === null || job === undefined) {
        job = "default";
      }
      
      for (var i=0; i < queue.length; i++) 
      {
        var item = queue[i][0];
        var jobs = queue[i][1];
        // Widget in queue?
        if (item == widget)
        {
          if (jobs[job])
          {
            jobs[job] = false;

            for (var j in jobs){
              if (j === true){ 
                return;
              }
            }
            // No jobs left, remove widget from queue
            queue.removeAt(i);
          }
          return;
        }
      };
    },


    /**
     * Adds a widget to the queue. The second param can be used to idetify 
     * several jobs. You can add one job at once, wich will be returned as
     * an map at flushing.
     *
     * @param widget {qx.ui.core.Widget} The widget to add.
     * @param job {String} Job identifier. <code>null</code> will be converted to "default"
     */
    add : function(widget, job)
    {
      var queue = this.__queue;
      if (job === null || job === undefined) {
        job = "default";
      }
      
      for (var i=0; i < queue.length; i++) 
      {
        var item = queue[i][0];
        var jobs = queue[i][1];
        // Widget in queue?
        if (item == widget)
        {
          if (!qx.lang.Object.contains(jobs, job)) {
            // Add job
            jobs[job] = true;
            qx.ui.core.queue.Manager.scheduleFlush("widget");
          }
          return;
        }
      };
      
      var jobs = {};
      jobs[job] = true;
      
      queue.unshift([widget, jobs]);
      qx.ui.core.queue.Manager.scheduleFlush("widget");
    },


    /**
     * Flushes the widget queue.
     *
     * This is used exclusively by the {@link qx.ui.core.queue.Manager}.
     */
    flush : function()
    {
      // Process all registered widgets
      var queue = this.__queue;
      var obj;
      for (var i = queue.length - 1 ; i >= 0; i--)
      {
        // Order is important to allow the same widget to be requeued directly
        obj = queue[i][0];
        jobs = queue[i][1]
        
        queue.splice(i, 1);
        obj.syncWidget(jobs);
      }

      // Empty check
      if (queue.length != 0) {
        return;
      }

      // Recreate the array is cheaper compared to keep a holey array over time
      // This is especially true for IE7
      this.__queue = [];
    }
  }
});