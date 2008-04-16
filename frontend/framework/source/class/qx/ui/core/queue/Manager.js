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

      // No else blocks here because each flush can influence the
      // following flushes!

      if (jobs.widget)
      {
        var start = new Date;
        qx.ui.core.queue.Widget.flush();
        jobs.widget = false;
        qx.log.Logger.debug(self, "Widget runtime: " + (new Date - start) + "ms");
      }

      if (jobs.appearance)
      {
        var start = new Date;
        qx.ui.core.queue.Appearance.flush();
        jobs.appearance = false;
        qx.log.Logger.debug(self, "Appearance runtime: " + (new Date - start) + "ms");
      }

      if (jobs.decorator)
      {
        var start = new Date;
        qx.ui.core.queue.Decorator.flush();
        jobs.decorator = false;
        qx.log.Logger.debug(self, "Decorator runtime: " + (new Date - start) + "ms");
      }

      if (jobs.layout)
      {
        var start = new Date;
        qx.ui.core.queue.Layout.flush();
        jobs.layout = false;
        qx.log.Logger.debug(self, "Layout runtime: " + (new Date - start) + "ms");
      }

      if (jobs.element)
      {
        var start = new Date;
        qx.html.Element.flush();
        jobs.element = false;
        qx.log.Logger.debug(self, "Element runtime: " + (new Date - start) + "ms");
      }

      if (jobs.display)
      {
        var start = new Date;
        qx.ui.core.queue.Display.flush();
        jobs.display = false;
        qx.log.Logger.debug(self, "Display runtime: " + (new Date - start) + "ms");
      }

      if (jobs.dispose)
      {
        var start = new Date;
        qx.ui.core.queue.Dispose.flush();
        jobs.dispose = false;
        qx.log.Logger.debug(self, "Dispose runtime: " + (new Date - start) + "ms");
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
