/**
 * Loading of local or remote scripts.
 *
 * * Supports cross-domain communication
 * * Automatically "embeds" script so when the loaded event occours the new features are useable as well
 * 
 * All request relevant data is given through {@link #load}. Pooling of 
 * an instance for multiple usage should possible.
 */
qx.Bootstrap.define("qx.io2.ScriptLoader",
{
  construct : function() 
  {
    this.__oneventWrapped = qx.lang.Function.bind(this.__onevent, this);
    this.__elem = document.createElement("script");
  },
  
  statics :
  {
    __pool : [],
    
    get : function() {
      return this.__pool.pop() || new qx.io2.ScriptLoader;
    },
    
    pool : function(loader) {
      this.__pool.push(loader);
    },
    
    load : function(url, callback, context)
    {
      var loader = this.get();
      loader.load(url, function(status)
      {
        callback.call(context||window, status);
        this.pool(loader);
      }, 
      this);
    }
  },
  
  members :
  {
    /**
     * Loads the script from the given URL. It is possible to define
     * a callback and a context in which the callback is executed.
     *
     * The callback is executed when the process is done with any
     * of these status messages: success, fail or abort.
     *
     * @type static
     * @param options {var} TODOC
     * @param callback {var} TODOC
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
     * @type member
     * @return {void}
     */
    abort : function() 
    {
      if (this.__running) {
        this.__cleanup("abort");
      }
    },
    
    
    /**
     * Internal cleanup method used after every successful
     * or failed loading attempt.
     *
     * @type member
     * @param status {String} Any of success, fail or abort.
     * @return {void}
     */
    __cleanup : function(status) 
    {
      // Get script
      var script = this.__elem;
      
      // Clear out listeners
      script.onerror = script.onload = script.onreadystatechange = null;
      
      // Remove script from head
      document.getElementsByTagName("head")[0].removeChild(script);
      
      // Free object
      delete this.__running;

      // Execute user callback
      this.__callback.call(this.__context, status);
    },    
    
        
    /**
     * Internal event listener for load and error events.
     *
     * @type member
     * @param e {Event} Native event object
     * @return {void}
     */
    __onevent : function(e)
    {
      if (typeof e === "string" || e.type === "error") {
        this.__cleanup("fail");
      } else if (e.type === "load") {
        this.__cleanup("success");
      } else if (e.type === "readystatechange" && (el.readyState === "complete" || el.readyState === "loaded")) {
        this.__cleanup("success");
      } else {
        return;
      }
      
      this.__cleanup();
    }
  }
});
