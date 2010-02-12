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

************************************************************************ */

/**
 * EXPERIMENTAL - NOT READY FOR PRODUCTION
 *
 * Loading of local or remote scripts.
 *
 * * Supports cross-domain communication
 * * Automatically "embeds" script so when the loaded event occurs the new features are usable as well
 */
qx.Bootstrap.define("qx.io.ScriptLoader",
{
  construct : function()
  {
    this.__oneventWrapped = qx.Bootstrap.bind(this.__onevent, this);
    this.__elem = document.createElement("script");
  },


  members :
  {
    /** {Boolean} Whether the request is running */
    __running : null,

    /** {Function} Callback method to execute */
    __callback : null,

    /** {Object} Context to execute the callback in */
    __context : null,

    /** {Function} This function is a wrapper for the DOM listener */
    __oneventWrapped : null,

    /** {Element} Stores the DOM element of the script tag */
    __elem : null,


    /**
     * Loads the script from the given URL. It is possible to define
     * a callback and a context in which the callback is executed.
     *
     * The callback is executed when the process is done with any
     * of these status messages: success, fail or abort.
     *
     * @param url {String} URL of the script
     * @param callback {Function} Callback to execute
     * @param context {Object?window} Context in which the function should be executed
     * @return {void}
     */
    load : function(url, callback, context)
    {
      if (this.__running) {
        throw new Error("Another request is still running!");
      }

      this.__running = true;

      // Place script element into head
      var head = document.getElementsByTagName("head")[0];

      // Create script element
      var script = this.__elem;

      // Store user data
      this.__callback = callback || null;
      this.__context = context || window;

      // Define mimetype
      script.type = "text/javascript";

      // Attach handlers for all browsers
      script.onerror = script.onload = script.onreadystatechange = this.__oneventWrapped;

      // Setup URL
      script.src = url;

      // Finally append child
      // This will execute the script content
      head.appendChild(script);
    },


    /**
     * Aborts a currently running process.
     *
     * @return {void}
     */
    abort : function()
    {
      if (this.__running) {
        this.dispose("abort");
      }
    },


    /**
     * Internal cleanup method used after every successful
     * or failed loading attempt.
     *
     * @param status {String} Any of success, fail or abort.
     * @return {void}
     */
    dispose : function(status)
    {
      if (this._disposed) {
        return;
      }
      this._disposed = true;
      
      // Get script
      var script = this.__elem;

      // Clear out listeners
      script.onerror = script.onload = script.onreadystatechange = null;

      // Remove script from head
      document.getElementsByTagName("head")[0].removeChild(script);

      // Free object
      delete this.__running;

      // Execute user callback
      if (this.__callback)
      {
        this.__callback.call(this.__context, status);
        delete this.__callback;
      }
    },


    /**
     * Internal event listener for load and error events.
     *
     * @signature function(e)
     * @param e {Event} Native event object
     */
    __onevent : qx.event.GlobalError.observeMethod(qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(e)
      {
        var state = this.__elem.readyState;

        if (state == "loaded") {
          this.dispose("success");
        } else if (state == "complete") {
         this.dispose("success");
        } else {
          return;
        }
      },

      "opera" : function(e)
      {
        if (qx.Bootstrap.isString(e) || e.type === "error") {
          return this.dispose("fail");
        } else if (e.type === "load") {
          return this.dispose("success");
        } else {
          return;
        }
      },

      "default" : function(e)
      {
        if (qx.Bootstrap.isString(e) || e.type === "error") {
          this.dispose("fail");
        } else if (e.type === "load") {
          this.dispose("success");
        } else if (e.type === "readystatechange" && (e.target.readyState === "complete" || e.target.readyState === "loaded")) {
          this.dispose("success");
        } else {
          return;
        }
      }
    }))
  }
});
