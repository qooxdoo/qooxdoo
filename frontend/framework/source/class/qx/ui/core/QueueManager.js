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
qx.Class.define("qx.ui.core.QueueManager",
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
      var clazz = qx.ui.core.QueueManager;

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
      var jobs = qx.ui.core.QueueManager.__jobs;

      // No else blocks here because each flush can influence the
      // following flushes!

      if (jobs.layout)
      {
        var start = new Date;
        // console.profile("layout flush");
        qx.ui.core.LayoutQueue.flush();
        // console.profileEnd();
        jobs.layout = false;
        qx.log2.Logger.debug("Layout queue runtime: " + (new Date - start) + "ms");
      }

      if (jobs.decoration)
      {
        var start = new Date;
        qx.ui.core.DecorationQueue.flush();
        jobs.decoration = false;
        qx.log2.Logger.debug("Decoration queue runtime: " + (new Date - start) + "ms");
      }

      if (jobs.element)
      {
        var start = new Date;
        // console.profile("element flush");
        qx.html.Element.flush();
        // console.profileEnd();
        jobs.element = false;
        qx.log2.Logger.debug("Element queue runtime: " + (new Date - start) + "ms");
      }

      if (jobs.display)
      {
        //var start = new Date;
        qx.ui.core.DisplayQueue.flush();
        jobs.display = false;
        //qx.log2.Logger.debug("Display queue runtime: " + (new Date - start) + "ms");
      }

      qx.ui.core.QueueManager.__scheduled = false;
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
