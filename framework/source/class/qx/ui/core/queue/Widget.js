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
      if (job == null) {
        job = "$$default";
      }
      
      for (var i = queue.length-1 ; i>=0; i--) 
      {
        var item = queue[i][0];
        var itemJob = queue[i][1];
        // Widget in queue?
        if (item == widget && itemJob == job){
          qx.lang.Array.removeAt(queue, i);
        }
      };
    },


    /**
     * Adds a widget to the queue. The second param can be used to idetify 
     * several jobs. You can add one job at once, wich will be returned as
     * an map at flushing on method {@link qx.ui.core.Widget#syncWidget}.
     *
     * @param widget {qx.ui.core.Widget} The widget to add.
     * @param job {String?} Job identifier. If not used, it will be converted to "$$default"
     */
    add : function(widget, job)
    {
      var queue = this.__queue;
      if (job == null) {
        job = "$$default";
      }
      
      queue.unshift([widget, job]);
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
      var queue = this.__mergeQueueJobs(this.__queue);
      var obj, jobs;
      for (var i = queue.length - 1 ; i >= 0; i--)
      {
        // Order is important to allow the same widget to be requeued directly
        obj = queue[i][0];
        jobs = queue[i][1];
        
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
    },
    
    
    /**
     * Helper function to merge all jobs of a widget to one object.
     * @param queue {Object} The internal queue array
     * @return {Object} Array of array with unique widgets and map of jobs
     */
    __mergeQueueJobs : function(queue)
    {
      var mergedQueue = [];
      
      for (var i=0; i < queue.length; i++) 
      {
        var widgetFound = false;
        var widget = queue[i][0];
        var job = queue[i][1];
        
        //search for widget
        for (var l=0; l < mergedQueue.length; l++) {
          var item = mergedQueue[l][0];
          var jobs = mergedQueue[l][1];
          if (item == widget)
          {
            //widget found in mergedQueue
            if (!qx.lang.Object.contains(jobs, job)) {
              //job not in mergedQueue; add job
              jobs[job] = true;
            }
            widgetFound = true;
            break;
          }
        };
        
        // Widget not found; push to array
        if (!widgetFound){
          //widget not found; push
          var jobs = {};
          jobs[job] = true;
          
          mergedQueue.push([widget, jobs]);
        }
      };
      return mergedQueue;
    }
  }
});