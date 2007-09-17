/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/* ************************************************************************

#module(event)

************************************************************************ */

/**
 * This handler provides a cross-browser "domready" event which fires when 
 * the DOM is completely loaded, but the content e.g. images are still
 * missing.
 */
qx.Class.define("qx.event.handler.DomReady",
{
  extend : qx.core.Object,
  implement : qx.event.IEventHandler,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * Create a new instance
   *
   * @type constructor
   * @param manager {qx.event.Manager} Event manager for the window to use
   */
  construct : function(manager)
  {
    this.base(arguments);
    
    // Define shorthands
    this._manager = manager;
    this._window = manager.getWindow();

    // Initialize observers
    this._initWindowObserver();
  },





  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */
  
  statics : 
  {
    /** {Integer} Priority of this handler */
    PRIORITY : qx.event.Registration.PRIORITY_FIRST
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
    canHandleEvent : function(target, type) {
      return this._window === target && type === "domready";
    },


    // interface implementation
    registerEvent : function(target, type) {
      // Nothing needs to be done here
    },


    // interface implementation
    unregisterEvent : function(target, type) {
      // Nothing needs to be done here
    },






    /*
    ---------------------------------------------------------------------------
      OBSERVER INIT/STOP
    ---------------------------------------------------------------------------
    */

    /**
     * Initializes the native mouse event listeners.
     *
     * @type member
     * @return {void}
     */
    _initWindowObserver : function()
    {
      var win = this._window;
      var nativeWrapper = this._onNativeWrapper = qx.lang.Function.bind(this._onNative, this);

      // Using most native method supported by Mozilla and Opera >= 9.0
      if (qx.core.Variant.isSet("qx.client", "gecko|opera"))
      {
        qx.event.Registration.addNativeListener(win, "DOMContentLoaded", nativeWrapper);
      }
      
      // Using IE-only "defer" attribute by Matthias Miller
      else if (qx.core.Variant.isSet("qx.client", "mshtml"))
      {
        var script = this._script = win.document.createElement("<script id='__ie_onload' defer src='javascript:void(0)'>");
        script.onreadystatechange = function() 
        {
          if (this.readyState == "complete") {
            nativeWrapper();
          }
        }
      }
      
      // Using webkit workaround by John Resig
      // Native implementation still missing by webkit. See also:
      // http://bugs.webkit.org/show_bug.cgi?id=5122
      else if (qx.core.Variant.isSet("qx.client", "webkit"))
      {
        var timer = this._timer = win.setInterval(function() 
        {
          if (/loaded|complete/.test(win.document.readyState)) 
          {
            win.clearInterval(timer);
            nativeWrapper();
          }
        }, 10);
      }
      
      // Additional load listener as fallback
      qx.event.Registration.addNativeListener(this._window, "load", nativeWrapper);      
    },


    /**
     * Disconnect the native mouse event listeners.
     *
     * @type member
     * @return {void}
     */
    _stopWindowObserver : function()
    {
      var win = this._window;
      
      if (qx.core.Variant.isSet("qx.client", "gecko|opera")) 
      {
        qx.event.Registration.removeNativeListener(win, "DOMContentLoaded", this._onNativeWrapper);
      }
      else if (qx.core.Variant.isSet("qx.client", "mshtml"))
      {
        this._script.onreadystatechange = null;
        delete this._script;
      }
      else if (qx.core.Variant.isSet("qx.client", "webkit"))
      {
        win.clearInterval(this._timer);
        delete this._timer;
      }

      qx.event.Registration.removeNativeListener(this._window, "load", this._onNativeWrapper); 
    },






    /*
    ---------------------------------------------------------------------------
      NATIVE EVENT SUPPORT
    ---------------------------------------------------------------------------
    */

    /**
     * Native listener for browser implementations.
     *
     * @type member
     * @param e {Event} Native event
     * @return {void}
     */
    _onNative : function() 
    {
      if (!this._fired)
      {
        this._manager.fireEvent(this._window, qx.event.type.Event, ["domready", false]);
        this._fired = true;
      }
    }
  },





  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    this._stopWindowObserver();
    this._disposeFields("_manager", "_window");
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
