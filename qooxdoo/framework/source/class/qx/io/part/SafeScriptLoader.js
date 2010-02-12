/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * A script loader with special error handling. The loaded scripts have to call
 * <code>qx.io.part.SafeScriptLoader.$$notifyLoad(id)</code> as last statement.
 * The value of <code>id</code> must match the id passed to the loader's
 * constructor.
 * 
 * @internal
 */
qx.Class.define("qx.io.part.SafeScriptLoader",
{
  extend : qx.core.Object,


  /**
   * @param id {String} The script id
   * @param timeout {Integer?2000} Script loading timeout in ms.
   */
  construct : function(id, timeout)
  {
    this.base(arguments);

    this.__timeout = timeout || 2000;
    qx.io.part.SafeScriptLoader.__pending[id] = this;    
    this._loader = new qx.io.ScriptLoader();
  },


  statics : 
  {
    __pending : {},
    
    /**
     * Loaded scripts have to call this method to indicate successful loading
     * 
     * @param id {String} script id
     */
    $$notifyLoad : function(id)
    {
      var loader = qx.io.part.SafeScriptLoader.__pending[id];
      if (loader) {
        loader.__fireSuccess();
      }
    }
  },
  
  
  members :
  {
    __timeout : null,
    __callback : null,
    __context : null,
    __timeoutId : null,
    
    _loader : null,
    
    /**
     * Loads the script from the given URL. It is possible to define
     * a callback and a context in which the callback is executed.
     *
     * The callback is executed when the process is done with any
     * of these status messages: success, fail or timeout.
     * 
     * Note that this method can only be called once! 
     *
     * @param url {String} URL of the script
     * @param callback {Function} Callback to execute
     * @param context {Object?window} Context in which the function should be executed
     * @return {void}
     */
    load : function(url, callback, context)
    {
      this.__callback = callback;
      this.__context = context;
      
      var self = this;
      this.__timeoutId = setTimeout(function() {
        callback.call(context, "timeout");
        self.dispose();
      }, this.__timeout);
      
      this._loader.load(url, function(status)
      {
        if (this.isDisposed()) {
          return;
        }
        
        if (status !== "success")
        {
          callback.call(context, status);
          this.dispose();
        }  
      }, this);
    },
    
    
    /**
     * Signal success
     */
    __fireSuccess : function()
    {      
      if (this.isDisposed()) {
        return;
      }
      
      this.__callback.call(this.__context, "success");
      this.dispose();
    }
  },

  
  destruct : function() {
    clearInterval(this.__timeoutId);
    this._loader.dispose();
  }
});
