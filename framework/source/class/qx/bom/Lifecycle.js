/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Alexander Steitz (aback)

************************************************************************ */

/* *********************************************************************
#require(qx.event.Registration)
#require(qx.event.handler.Application)
************************************************************************ */

/**
 * Low-level application life-cycle management.
 *
 * One can use the static methods {@link #onReady} and {@link #onShutdown} to
 * add callback functions, in order to get informed about the ready state or
 * the shutdown of the low-level application, respectively.
 */
qx.Class.define("qx.bom.Lifecycle",
{
  statics :
  {
    /**
     * Register a callback function, which is called in the optionally provided
     * context, when the application is ready.
     *
     * @param callback {Function} callback function
     * @param context {Object?window} context in which the callback is called
     */
    onReady : function(callback, context)
    {
      var Registration = qx.event.Registration;
      var appHandler = Registration.getManager(window).getHandler(qx.event.handler.Application);

      // If the application is already available, execute the callback
      // immediately. Otherwise listen to the "ready" event to call it later.
      if (appHandler && appHandler.isApplicationReady()) {
        callback.call(context);
      } else {
        Registration.addListener(window, "ready", callback, context);
      }
    },


    /**
     * Register a callback function, which is called in the optionally provided
     * context, when the application is shutdown.
     * <b>IMPORTANT NOTE</b>: Since it is <i>not</i> guaranteed that a
     * <code>shutdown</code> event is fired, you <i>cannot</i> fully rely on
     * getting informed.
     *
     * @param callback {Function} callback function
     * @param context {Object?window} context in which the callback is called
     */
    onShutdown : function(callback, context) {
      qx.event.Registration.addListener(window, "shutdown", callback, context);
    }
  }
});