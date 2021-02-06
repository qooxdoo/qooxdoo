/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * This handler provides events for qooxdoo application startup/shutdown logic.
 * 
 * NOTE: Instances of this class must be disposed of after use
 *
 * @require(qx.bom.client.Engine)
 */
qx.Class.define("qx.event.handler.Application",
{
  extend : qx.core.Object,
  implement : [ qx.event.IEventHandler, qx.core.IDisposable ],




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * Create a new instance
   *
   * @param manager {qx.event.Manager} Event manager for the window to use
   */
  construct : function(manager)
  {
    this.base(arguments);

    // Define shorthands
    this._window = manager.getWindow();

    this.__domReady = false;
    this.__loaded = false;
    this.__isReady = false;
    this.__isInitialized = false;
    this.__isUnloaded = false;

    // Initialize observers
    this._initObserver();

    // Store instance (only supported for main app window, this
    // is the reason why this is OK here)
    qx.event.handler.Application.$$instance = this;
  },





  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /** @type {Integer} Priority of this handler */
    PRIORITY : qx.event.Registration.PRIORITY_NORMAL,


    /** @type {Map} Supported event types */
    SUPPORTED_TYPES :
    {
      ready : 1,
      shutdown : 1
    },


    /** @type {Integer} Which target check to use */
    TARGET_CHECK : qx.event.IEventHandler.TARGET_WINDOW,


    /** @type {Integer} Whether the method "canHandleEvent" must be called */
    IGNORE_CAN_HANDLE : true,


    /**
     * Sends the currently running application the ready signal. Used
     * exclusively by package loader system.
     *
     * @internal
     */
    onScriptLoaded : function()
    {
      var inst = qx.event.handler.Application.$$instance;
      if (inst) {
        inst.__fireReady();
      }
    },


    /**
     * Notifies that the application has finished initialization
     *
     * @internal
     */
    onAppInstanceInitialized : function()
    {
      var inst = qx.event.handler.Application.$$instance;
      if (inst) {
        inst.__fireAppInstanceInitialized();
      }
    }
  },





  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /*
    ---------------------------------------------------------------------------
      EVENT HANDLER INTERFACE
    ---------------------------------------------------------------------------
    */

    // interface implementation
    canHandleEvent : function(target, type) {},


    // interface implementation
    registerEvent : function(target, type, capture) {
      // Nothing needs to be done here
    },


    // interface implementation
    unregisterEvent : function(target, type, capture) {
      // Nothing needs to be done here
    },

    __isReady : null,
    __isInitialized : null,
    __domReady : null,
    __loaded : null,
    __isUnloaded : null,





    /*
    ---------------------------------------------------------------------------
      USER ACCESS
    ---------------------------------------------------------------------------
    */

    /**
     * Fires a global ready event.
     *
     */
    __fireReady : function()
    {
      // Wrapper qxloader needed to be compatible with old generator
      if (!this.__isReady && this.__domReady && qx.$$loader.scriptLoaded)
      {
        // If qooxdoo is loaded within a frame in IE, the document is ready before
        // the "ready" listener can be added. To avoid any startup issue check
        // for the availability of the "ready" listener before firing the event.
        // So at last the native "load" will trigger the "ready" event.
        if ((qx.core.Environment.get("engine.name") == "mshtml"))
        {
          if (qx.event.Registration.hasListener(this._window, "ready"))
          {
            this.__isReady = true;

            // Fire user event
            qx.event.Registration.fireEvent(this._window, "ready");
          }
        }
        else
        {
          this.__isReady = true;

          // Fire user event
          qx.event.Registration.fireEvent(this._window, "ready");
        }
      }
    },
    
    /**
     * Fires a global "appinitialized" event.
     *
     */
    __fireAppInstanceInitialized : function() {
      this.__isInitialized = true;
      
      // Fire user event
      qx.event.Registration.fireEvent(this._window, "appinitialized");
    },

    /**
     * Whether the application is ready.
     *
     * @return {Boolean} ready status
     */
    isApplicationReady : function() {
      return this.__isReady;
    },

    /**
     * Whether the application is initialized
     *
     * @return {Boolean} initialization status
     */
    isApplicationInitialized : function() {
      return this.__isInitialized;
    },




    /*
    ---------------------------------------------------------------------------
      OBSERVER INIT/STOP
    ---------------------------------------------------------------------------
    */

    /**
     * Initializes the native application event listeners.
     *
     */
    _initObserver : function()
    {
 
      // in Firefox the loader script sets the ready state
      if (qx.$$domReady || document.readyState == "complete" || document.readyState == "ready")
      {
        this.__domReady = true;
        this.__fireReady();
      }
      else
      {
        this._onNativeLoadWrapped = qx.lang.Function.bind(this._onNativeLoad, this);
        if (
          qx.core.Environment.get("engine.name") == "gecko" ||
          qx.core.Environment.get("engine.name") == "opera" ||
          qx.core.Environment.get("engine.name") == "webkit" ||
          (qx.core.Environment.get("engine.name") == "mshtml" && qx.core.Environment.get("browser.documentmode") > 8)
        ) {
          // Using native method supported by Mozilla, Webkit, Opera and IE >= 9
          qx.bom.Event.addNativeListener(this._window, "DOMContentLoaded", this._onNativeLoadWrapped);
        }
        else {
          var self = this;

          // Continually check to see if the document is ready
          var timer = function()
          {
            try
            {
              // If IE is used, use the trick by Diego Perini
              // http://javascript.nwbox.com/IEContentLoaded/
              document.documentElement.doScroll("left");
              if (document.body) {
                self._onNativeLoadWrapped();
              }
            }
            catch(error) {
              window.setTimeout(timer, 100);
            }
          };

          timer();
        }

        // Additional load listener as fallback
        qx.bom.Event.addNativeListener(this._window, "load", this._onNativeLoadWrapped);
      }
      if ((qx.core.Environment.get("runtime.name") == "rhino") || (qx.core.Environment.get("runtime.name") == "node.js")) {
        return;
      }  
      this._onNativeUnloadWrapped = qx.lang.Function.bind(this._onNativeUnload, this);
      qx.bom.Event.addNativeListener(this._window, "unload", this._onNativeUnloadWrapped);
    },


    /**
     * Disconnect the native application event listeners.
     *
     */
    _stopObserver : function()
    {
      if (this._onNativeLoadWrapped) {
        qx.bom.Event.removeNativeListener(this._window, "load", this._onNativeLoadWrapped);
      }
      qx.bom.Event.removeNativeListener(this._window, "unload", this._onNativeUnloadWrapped);

      this._onNativeLoadWrapped = null;
      this._onNativeUnloadWrapped = null;
    },





    /*
    ---------------------------------------------------------------------------
      NATIVE LISTENER
    ---------------------------------------------------------------------------
    */

    /**
     * When qx.globalErrorHandling is enabled the callback will observed
     */
    _onNativeLoad: function () {
      var callback = qx.core.Environment.select("qx.globalErrorHandling", {
        "true": qx.event.GlobalError.observeMethod(this.__onNativeLoadHandler),
        "false": this.__onNativeLoadHandler
      });
      callback.apply(this, arguments);
    },


    /**
     * Event listener for native load event
     */
    __onNativeLoadHandler: function () {
      this.__domReady = true;
      this.__fireReady();
    },


    /**
     * When qx.globalErrorHandling is enabled the callback will observed
     */
    _onNativeUnload: function () {
      var callback = qx.core.Environment.select("qx.globalErrorHandling", {
        "true": qx.event.GlobalError.observeMethod(this.__onNativeUnloadHandler),
        "false": this.__onNativeUnloadHandler
      });
      callback.apply(this, arguments);
    },


    /**
     * Event listener for native unload event
     */
    __onNativeUnloadHandler: function () {
      if (!this.__isUnloaded) {
        this.__isUnloaded = true;

        try {
          // Fire user event
          qx.event.Registration.fireEvent(this._window, "shutdown");
        }
        catch (e) {
          // IE doesn't execute the "finally" block if no "catch" block is present
          throw e;
        }
      }
    }

  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this._stopObserver();

    this._window = null;
  },




  /*
  *****************************************************************************
     DEFER
  *****************************************************************************
  */

  defer : function(statics) {
    qx.event.Registration.addHandler(statics);
  }
});
