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

/* ************************************************************************

#require(qx.event.handler.UserAction)

************************************************************************ */

/**
 * This class performs the auto flush of all layout relevant queues.
 */
qx.Class.define("qx.ui.core.queue.Manager",
{
  statics :
  {
    /** {Boolean} Whether a flush was scheduled */
    __scheduled : false,


    /** {Map} Internal data structure for the current job list */
    __jobs : {},
    
    
    /** {Integer} Counts how often a flush failed due to exceptions */
    __retries : 0,
    
    /** {Integer} Maximum number of flush retries */
    MAX_RETRIES : 10,


    /**
     * Schedule a deferred flush of all queues.
     *
     * @param job {String} The job, which should be performed. Valid values are
     *     <code>layout</code>, <code>decoration</code> and <code>element</code>.
     * @return {void}
     */
    scheduleFlush : function(job)
    {
      // Sometimes not executed in context, fix this
      var self = qx.ui.core.queue.Manager;

      self.__jobs[job] = true;

      if (!self.__scheduled)
      {
        self.__deferredCall.schedule();
        self.__scheduled = true;
      }
    },


    /**
     * Flush all layout queues in the correct order. This function is called
     * deferred if {@link scheduleFlush} is called.
     *
     * @return {void}
     */
    flush : function()
    {
      // Sometimes not executed in context, fix this
      var self = qx.ui.core.queue.Manager;

      // Stop when already executed
      if (self.__inFlush) {
        return;
      }

      self.__inFlush = true;

      // Cancel timeout if called manually
      self.__deferredCall.cancel();

      var jobs = self.__jobs;

      self.__executeAndRescheduleOnError(function()
      {
        // Process jobs
        while (jobs.visibility || jobs.widget || jobs.appearance || jobs.layout || jobs.element)
        {
          // No else blocks here because each flush can influence the following flushes!
          if (jobs.widget)
          {
            qx.ui.core.queue.Widget.flush();
            delete jobs.widget;
          }
  
          if (jobs.visibility)
          {
            qx.ui.core.queue.Visibility.flush();
            delete jobs.visibility;
          }
  
          if (jobs.appearance)
          {
            qx.ui.core.queue.Appearance.flush();
            delete jobs.appearance;
          }
  
          // Defer layout as long as possible
          if (jobs.widget || jobs.visibility || jobs.appearance) {
            continue;
          }
  
          if (jobs.layout)
          {
            qx.ui.core.queue.Layout.flush();
            delete jobs.layout;
          }
  
          // Defer element as long as possible
          if (jobs.widget || jobs.visibility || jobs.appearance || jobs.layout) {
            continue;
          }
  
          if (jobs.element)
          {
            qx.html.Element.flush();
            delete jobs.element;
          }
        }
      }, function() {
        self.__scheduled = false;        
      });

      self.__executeAndRescheduleOnError(function()
      {
        if (jobs.dispose)
        {
          qx.ui.core.queue.Dispose.flush();
          delete jobs.dispose;
        }
      }, function() {
        // Clear flag
        self.__inFlush = false;
      });
      
      // flush succeeded successfully. Reset retries
      self.__retries = 0;
    },
    
    
    /**
     * Executes the callback code. If the callback throws an error the current 
     * flush is cleaned up and rescheduled. The finally code is called after the
     * callback even if it has thrown an exception.
     * 
     * @param callback {Function} the callback function
     * @param finallyCode {Function} function to be called in the finally block
     */
    __executeAndRescheduleOnError : function(callback, finallyCode)
    {
      var self = qx.ui.core.queue.Manager;
      
      try
      {
        callback();
      }
      catch (e) 
      {
        self.__scheduled = false;
        self.__inFlush = false;
        self.__retries += 1;
        
        if (self.__retries <= self.MAX_RETRIES) {
          self.scheduleFlush();
        } else {
          throw new Error(
            "Fatal Error: Flush terminated " + (self.__retries-1) + " times in a row" +
            " due to exceptions in user code. The application has to be reloaded!"
          );
        }
        
        throw e;
      }
      finally
      {
        finallyCode();
      }
    }
  },




  /*
  *****************************************************************************
     DESTRUCT
  *****************************************************************************
  */

  defer : function(statics)
  {
    // Initialize deferred call
    statics.__deferredCall = new qx.util.DeferredCall(statics.flush);

    // Replace default scheduler for HTML element with local one.
    // This is quite a hack, but allows us to force other flushes
    // before the HTML element flush.
    qx.html.Element._scheduleFlush = statics.scheduleFlush;

    // Register to user action
    qx.event.Registration.addListener(window, "useraction", statics.flush);
  }
});
