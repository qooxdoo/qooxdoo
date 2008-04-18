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
 * This class performs the auto flush of all layout relevant queues.
 */
qx.Class.define("qx.ui.core.queue.Manager",
{
  statics :
  {
    /** {Boolean} TODOC */
    __scheduled : false,


    /** {Map} TODOC */
    __jobs : {},


    /**
     * Schedule a deferred flush of all queues.
     *
     * @type static
     * @param job {String} The job, which should be performed. Valid values are
     *     <code>layout</code>, <code>decoration</code> and <code>element</code>.
     * @return {void}
     */
    scheduleFlush : function(job)
    {
      var clazz = qx.ui.core.queue.Manager;

      clazz.__jobs[job] = true;

      if (!clazz.__scheduled)
      {
        clazz.__deferredCall.schedule();
        clazz.__scheduled = true;
      }
    },


    /**
     * Flush all layout queues in the correct order. This function is called
     * deferred if {@link scheduleFlush} is called.
     *
     * @type static
     * @return {void}
     */
    flush : function()
    {
      var self = qx.ui.core.queue.Manager;
      var jobs = self.__jobs;

      hasElement = false;
      hasDispose = false;

      // we loop over until all jobs are finished. The loop is needed because it
      // new jobs can be added to the queues during a flush

      while (!qx.lang.Object.isEmpty(jobs))
      {
        hasElement = hasElement || jobs.element;
        delete jobs.element;

        hasDispose = hasDispose || jobs.dispose;
        delete jobs.dispose;


        // No else blocks here because each flush can influence the
        // following flushes!
        while (jobs.widget)
        {
          var start = new Date;
          delete jobs.widget;
          qx.ui.core.queue.Widget.flush();

          var time = new Date - start;
          if (time > 3) {
            qx.log.Logger.debug(self, "Widget runtime: " + (time) + "ms");
          }
        }

        while (jobs.appearance)
        {
          var start = new Date;
          delete jobs.appearance;
          qx.ui.core.queue.Appearance.flush();

          var time = new Date - start;
          if (time > 3) {
            qx.log.Logger.debug(self, "Appearance runtime: " + (time) + "ms");
          }
        }

        while (jobs.decorator)
        {
          var start = new Date;
          delete jobs.decorator;
          qx.ui.core.queue.Decorator.flush();

          var time = new Date - start;
          if (time > 3) {
            qx.log.Logger.debug(self, "Decorator runtime: " + (time) + "ms");
          }
        }

        while (jobs.layout)
        {
          var start = new Date;
          delete jobs.layout;
          qx.ui.core.queue.Layout.flush();

          var time = new Date - start;
          if (time > 3) {
            qx.log.Logger.debug(self, "Layout runtime: " + (time) + "ms");
          }
        }
      }

      if (hasElement || jobs.element)
      {
        var start = new Date;
        delete jobs.element;
        qx.html.Element.flush();

        var time = new Date - start;
        if (time > 3) {
          qx.log.Logger.debug(self, "Element runtime: " + (time) + "ms");
        }
      }

      if (hasDispose || jobs.dispose)
      {
        var start = new Date;
        delete jobs.dispose;
        qx.ui.core.queue.Dispose.flush();

        var time = new Date - start;
        if (time > 3) {
          qx.log.Logger.debug(self, "Dispose runtime: " + (time) + "ms");
        }
      }


      qx.ui.core.queue.Manager.__scheduled = false;
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
  }
});
