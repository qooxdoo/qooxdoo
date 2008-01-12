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
    /**
     * Schedule a deferred flush of all queues.
     */
    scheduleFlush : function()
    {
      if (!this._deferredCall) {
        this._deferredCall = new qx.util.DeferredCall(this.flush, this);
      }

      this._deferredCall.schedule();
    },


    /**
     * Flush all layout queues in the correct order. This function is called
     * deferred if {@link scheduleFlush} is called.
     */
    flush : function()
    {
      var start = new Date;

      qx.ui2.core.LayoutQueue.flush();
      qx.ui2.core.DecorationQueue.flush();
      qx.html.Element.flush();

      var stop = new Date;
      var since = stop - qx.Bootstrap.LOADSTART
      qx.core.Log.debug(since + ": Queue runtime: " + (stop - start) + "ms");
    }
  }
});
