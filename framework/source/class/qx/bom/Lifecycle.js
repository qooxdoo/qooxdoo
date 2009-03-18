/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Alexander Back (aback)

************************************************************************ */

/* *********************************************************************
#require(qx.event.Registration)
#require(qx.event.handler.Application)
************************************************************************ */

/**
 * Low-level life cycle management.
 * One can use {@link #onReady} and {@link #onShutdown} to add callbacks function to get
 * informed about the ready status as well as the shutdown
 * of the application.
 */
qx.Class.define("qx.bom.Lifecycle",
{
  statics :
  {
    /* ***********************************************************************
     *                        PUBLIC API
     *********************************************************************** */
    
    /**
     * Register a callback with an (optional) context method which should 
     * informed when the application is ready.
     * 
     * @param callback {Function} callback function
     * @param context {Object} context in which the callback should be called
     *                         default is <code>window</code> object
     */
    onReady : function(callback, context)
    {
      var Registration = qx.event.Registration;
      var appHandler = Registration.getManager(window).getHandler(qx.event.handler.Application);
      
      /* 
       * If the application is already available inform the listener immediately
       * Otherwise use the "ready" event to inform them 
       */
      if (appHandler && appHandler.isApplicationReady()) {
        callback.call(context);  
      } else {
        Registration.addListener(window, "ready", callback, context);
      }
    },
    
    
    /**
     * Register a callback with an (optional) context method which should 
     * informed when the application is shutdown.
     * <b>IMPORTANT NOTE</b>: since it is <b>not</b> guaranteed that a 
     * <code>shutdown</code> event is fired you <b>cannot</b> fully rely on to
     * get informed / your listener is called. 
     * 
     * @param callback {Function} callback function
     * @param context {Object} context in which the callback should be called
     *                         default is <code>window</code> object
     */
    onShutdown : function(callback, context) {
      qx.event.Registration.addListener(window, "shutdown", callback, context);
    }
  }
});