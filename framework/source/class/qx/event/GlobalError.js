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


qx.Bootstrap.define("qx.event.GlobalError",
{
  statics :
  {    
    setErrorHandler : function(callback, context)
    {
      this.__callback = callback || null;
      this.__context = context || window;
    },
    
    
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
            self.__handleError(ex);
          }
        }
      }
      else
      {
        return method;
      }
    },
    
    
    __handleError : function(ex) {
      this.__callback.call(this.__context, ex);
    }
  },
  
  defer : function(statics) 
  {
    statics.setErrorHandler(null, null);
    qx.core.Setting.define("qx.globalErrorHandling", "on");
  }
});
