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
 *  global error handling the setting <code>qx.globalErrorHandling</code> must
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
      this.__context = context || window;

      if (qx.core.Setting.get("qx.globalErrorHandling") === "on")
      {
        if (callback && !window.onerror) {
          window.onerror = qx.lang.Function.bind(this.__onErrorWindow, this);
        }

        if (!callback && window.onerror) {
          window.onerror = null;
        }
      }
    },


    /**
     * Catches all errors of the <code>window.onerror</code> handler
     * and passes an {@link qx.core.WindowError} object to the error
     * handling.
     *
     * @param msg {String} browser error message
     * @param uri {String} uri to errornous script
     * @param lineNumber {Integer} line number of error
     */
    __onErrorWindow : function(msg, uri, lineNumber)
    {
      if (this.__callback)
      {
        this.handleError(new qx.core.WindowError(msg, uri, lineNumber));
        return true;
      }
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
            self.handleError(new qx.core.GlobalError(ex, arguments));
         }
        };
      }
      else
      {
        return method;
      }
    },


    /**
     * Delegates every given exception to the registered error handler
     *
     * @param ex {qx.core.WindowError|exception} Exception to delegate
     */
    handleError : function(ex)
    {
      if (this.__callback) {
        this.__callback.call(this.__context, ex);
      }
    }
  },


  defer : function(statics)
  {
    qx.core.Setting.define("qx.globalErrorHandling", "on");
    statics.setErrorHandler(null, null);
  }
});
