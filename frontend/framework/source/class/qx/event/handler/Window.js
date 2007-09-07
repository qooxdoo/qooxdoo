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

#module(event2)

************************************************************************ */

/**
 * This handler provides event for the window object.
 */
qx.Class.define("qx.event.handler.Window",
{
  extend : qx.core.Object,
  implement : qx.event.IEventHandler,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
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
      return qx.dom.Node.isWindow(target) && this._eventTypes[type];
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
      HELPER
    ---------------------------------------------------------------------------
    */
        
    /** {Map} Internal data structure with all supported event types */
    _eventTypes :
    {
      error : 1,
      load : 1,
      beforeunload : 1,
      unload : 1,
      resize : 1,
      scroll : 1
    },
    
        
    /**
     * Shorthand to fire events from within this class.
     *
     * @type member
     * @param type {String} Name of the event to fire
     * @return {void}
     */
    _fireEvent : function(type) {
      this._manager.createAndDispatchEvent(this._window, qx.event.type.Event, [type, false]);
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
      this._onNativeWrapper = qx.lang.Function.bind(this._onNative, this);
      
      qx.event.Manager.addNativeListener(this._window, "error", this._onNativeWrapper);
      qx.event.Manager.addNativeListener(this._window, "load", this._onNativeWrapper);
      qx.event.Manager.addNativeListener(this._window, "beforeunload", this._onNativeWrapper);
      qx.event.Manager.addNativeListener(this._window, "unload", this._onNativeWrapper);
      qx.event.Manager.addNativeListener(this._window, "resize", this._onNativeWrapper);
    },

    
    /**
     * Disconnect the native mouse event listeners.
     * 
     * @type member
     * @return {void}
     */    
    _stopWindowObserver : function() 
    {
      qx.event.Manager.removeNativeListener(this._window, "error", this._onNativeWrapper);
      qx.event.Manager.removeNativeListener(this._window, "load", this._onNativeWrapper);
      qx.event.Manager.removeNativeListener(this._window, "beforeunload", this._onNativeWrapper);
      qx.event.Manager.removeNativeListener(this._window, "unload", this._onNativeWrapper);
      qx.event.Manager.removeNativeListener(this._window, "resize", this._onNativeWrapper);
    },
    
    
    
    
    
    
    /*
    ---------------------------------------------------------------------------
      NATIVE EVENT SUPPORT
    ---------------------------------------------------------------------------
    */
    
    _onNative : function(e)
    {
      if (!e) {
        e = window.event;
      }

      this._fireEvent(e.type);
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

  defer : function(statics)
  {
    var manager = qx.event.Manager;
    manager.registerEventHandler(statics, manager.PRIORITY_NORMAL);
  }
});
