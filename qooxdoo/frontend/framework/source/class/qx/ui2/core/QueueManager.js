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
qx.Class.define("qx.ui2.core.QueueManager",
{
  statics :
  {
    __scheduled : false,

    __jobs : {},

    /**
     * Schedule a deferred flush of all queues.
     */
    scheduleFlush : function(job)
    {
      var clazz = qx.ui2.core.QueueManager;

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
     */
    flush : function()
    {
      var clazz = qx.ui2.core.QueueManager;

      clazz.__scheduled = false;

      var start = new Date;

      var jobs = clazz.__jobs;

      if (jobs.layout)
      {
        qx.ui2.core.LayoutQueue.flush();
        jobs.layout = false;
      }

      if (jobs.decoration)
      {
        qx.ui2.core.DecorationQueue.flush();
        jobs.decoration = false;
      }

      if (jobs.element)
      {
        qx.html.Element.flush();
        jobs.element = false;
      }

      qx.core.Log.debug("Queue runtime: " + (new Date - start) + "ms");
    }
  },




  /*
  *****************************************************************************
     DESTRUCT
  *****************************************************************************
  */

  defer : function(statics)
  {
    statics.__deferredCall = new qx.util.DeferredCall(statics.flush);
    qx.html.Element._scheduleFlush = statics.scheduleFlush;
  }
});
