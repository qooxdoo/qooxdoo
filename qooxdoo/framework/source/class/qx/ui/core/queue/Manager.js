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

      // Process jobs
      var jobs = self.__jobs;
      while (jobs.widget || jobs.appearance || jobs.decorator || jobs.layout)
      {
        // No else blocks here because each flush can influence the
        // following flushes!
        if (jobs.widget)
        {
          delete jobs.widget;
          qx.ui.core.queue.Widget.flush();

          if (jobs.widget) {
            continue;
          }
        }

        if (jobs.appearance)
        {
          delete jobs.appearance;
          qx.ui.core.queue.Appearance.flush();

          if (jobs.appearance) {
            continue;
          }
        }

        if (jobs.layout)
        {
          delete jobs.layout;
          qx.ui.core.queue.Layout.flush();
        }
      }

      qx.ui.core.queue.Manager.__scheduled = false;

      if (jobs.element)
      {
        delete jobs.element;
        qx.html.Element.flush();
      }

      if (jobs.dispose)
      {
        delete jobs.dispose;
        qx.ui.core.queue.Dispose.flush();
      }

      // Clear flag
      self.__inFlush = false;
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
