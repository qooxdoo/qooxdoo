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
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * The GlobalError class stores a reference to a global error handler function.
 * 
 *  This function is called for each uncatched JavaScript exception. To enable
 *  global error handling the setting <code>qx.globalErrorHandling</code> bust
 *  be enabled and a error handler must be registered.
 *  Further each JavaScript "entry point" must be wrapped with a call to
 *  {@link qx.event.GlobalError#observeMethod}. 
 */
qx.Bootstrap.define("qx.event.GlobalError",
{
  statics :
  {    
    /**
     * Set the global fallback error handler
     * 
     * @param callback {Function} The error handler. The first argument is the 
     *    exception, which caused the error
     * @param context {Object} The "this" context of the callback function
     */
    setErrorHandler : function(callback, context)
    {
      this.__callback = callback || null;
      this.__context = context || window;
      
      if (callback && !window.onerror) {
        window.onerror = qx.lang.Function.bind(this.__onErrorWindow, this);
      }
      
      if (!callback && window.onerror) {
        window.onerror = null;
      }
    },
    
    
    __onErrorWindow : function(msg, uri, lineNumber)
    {
      this.handleError(new qx.core.WindowError(msg, uri, lineNumber));
      return true;
    },
    
    
    /**
     * Wraps a method with error handling code. Only methods, which are called
     * directly by the browser (e.g. event handler) should be wrapped.
     * 
     * @param method {Function} method to wrap
     * @return {Function} The function wrapped with error handling code
     */
    observeMethod : function(method)
    {
      if (qx.core.Setting.get("qx.globalErrorHandling") === "on")
      {
        var self = this;
        return function()
        {
          if (!self.__callback) {
            return method.apply(this, arguments);
          }
          
          try {
            return method.apply(this, arguments);
          } catch(ex) {
            self.handleError(ex);
          }
        };
      }
      else
      {
        return method;
      }
    },
    
    
    handleError : function(ex)
    {
      if (this.__callback) {
        this.__callback.call(this.__context, ex);
      }
    }
  },
  
  
  defer : function(statics) 
  {
    statics.setErrorHandler(null, null);
    qx.core.Setting.define("qx.globalErrorHandling", "on");
    
    statics.__onErrorWindow = statics.observeMethod(statics.__onErrorWindow);
  }
});
