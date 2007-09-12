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
     * Fabian Jakobs (fjakobs)
     * Sebastian Werner (wpbasti)

************************************************************************ */

/* ************************************************************************

#module(event)

************************************************************************ */

/**
 * Wrapper for browser DOM event handling.
 *
 * The following feature are supported in a browser independend way:
 * <ul>
 *   <li>cancelling of events <code>stopPropagation</code></li>
 *   <li>prevention of the browser's default behaviour <code>preventDefault</code>
 *   <li>unified event objects matching the DOM 2 event interface
 *       http://www.w3.org/TR/DOM-Level-2-Events/events.html#Events-interface
 *   </li>
 *   <li>Support for the event <i>bubbling</i> and <i>capturing</i> phase even
 *       in the Internet Explorer
 *   </li>
 *   <li>Support for mouse event capturing
 *      http://msdn2.microsoft.com/en-us/library/ms537630.aspx
 *   </li>
 * </ul>
 *
 * Available Events
 * <ul>
 *   <li>Internet Explorer events:
 *       http://msdn2.microsoft.com/en-us/library/ms533051.aspx</li>
 *   <li>Mozilla element events:
 *       http://developer.mozilla.org/en/docs/DOM:element#Event_Handlers
 *   </li>
 * </ul>
 */
qx.Class.define("qx.event.Manager",
{
  extend : qx.core.Object,





  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * Creates a new instance of the event handler.
   *
   * @param win {Window} The DOM window this manager handles the events for
   */
  construct : function(win)
  {
    this.base(arguments);

    // Assign window object
    this.__window = win;

    // Register to the page unload event
    this.__disposeWrapper = qx.lang.Function.bind(this.dispose, this);
    qx.event.Manager.addNativeListener(this.__window, "unload", this.__disposeWrapper);

    // Registry for event listeners
    this.__listeners = {};

    // Queue for event registration/deregistration jobs
    // when changed during event dispatching phases.
    this.__jobs = [];

    // The handler and dispatcher instances
    this.__handlers = {};
    this.__dispatchers = {};
  },






  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /**
     * Static list of all instantiated event managers. The key is the qooxdoo
     * hash value of the corresponding window
     */
    __managers : {},


    /**
     * Get an instance of the event manager, which can handle events for the
     * given target.
     *
     * @param target {Object} Any valid event target
     * @return {qx.event.Manager} The event manger for the target.
     */
    getManager : function(target)
    {
      // get the corresponding default view (window)
      if (qx.dom.Node.isWindow(target)) {
        var win = target;
      } else if (qx.dom.Node.isElement(target)) {
        var win = qx.dom.Node.getWindow(target);
      } else {
        var win = window;
      }

      var id = qx.core.Object.toHashCode(win);
      var manager = this.__managers[id];

      if (!manager)
      {
        manager = new qx.event.Manager(win);
        this.__managers[id] = manager;
      }

      return manager;
    },


    /**
     * Add an event listener to a DOM target. The event listener is passed an
     * instance of {@link Event} containing all relevant information
     * about the event as parameter.
     *
     * @type static
     * @param target {Object} Any valid event target
     * @param type {String} Name of the event e.g. "click", "keydown", ...
     * @param listener {Function} Event listener function
     * @param self {Object} Reference to the 'this' variable inside
     *       the event listener.
     * @param capture {Boolean} Whether to attach the event to the
     *       capturing phase of the bubbling phase of the event. The default is
     *       to attach the event handler to the bubbling phase.
     */
    addListener : function(target, type, listener, self, capture) 
    {
      var mgr = this.getManager(target);
      return mgr.addListener(target, type, listener, self, capture);
    },


    /**
     * Remove an event listener from a from DOM node.
     *
     * Note: All registered event listeners will automatically be removed from
     *   the DOM at page unload so it is not necessary to detach events in the
     *   destructor.
     *
     * @type static
     * @param target {Object} Any valid event target
     * @param type {String} Name of the event
     * @param listener {Function} The pointer to the event listener
     * @param self {Object} Reference to the 'this' variable inside
     *       the event listener.
     * @param capture {Boolean} Whether to remove the event listener of
     *       the bubbling or of the capturing phase.
     */
    removeListener : function(target, type, listener, self, capture) 
    {
      var mgr = this.getManager(target);
      return mgr.removeListener(target, type, listener, self, capture);
    },
    

    /**
     * Check whether there are one or more listeners for an event type
     * registered at the target.
     *
     * @param target {Object} Any valid event target
     * @param type {String} The event type
     * @param capture {Boolean ? false} Whether to check for listeners of
     *       the bubbling or of the capturing phase.
     * @return {Boolean} Whether the target has event listeners of the given type.
     */
    hasListeners : function(target, type, capture) {
      return this.getManager(target).hasListeners(target, type, capture);
    },


    /**
     * Get an inevent instance of the given class, which can be dispatched using
     * an event manager. The created events must be initialized using
     * {@link qx.event.type.Event#init}.
     *
     * @param clazz {Object} The even class
     * @param args {Array} Array or arguments, which will be passed to
     *     the event's init method.
     * @return {qx.event.type.Event} An instance of the given class.
     */
    createEvent : function(clazz, args) 
    {
      var obj = qx.event.Pool.getInstance().getEventInstance(clazz);
      
      if (args) {
        obj.init.apply(obj, args);
      }
      
      return obj;
    },
    
    
    /**
     * Create an event object and dispatch it on the given target.
     *
     * @type member
     * @param target {Object} Any valid event target
     * @param clazz {qx.event.type.Event} The even class
     * @param args {Array} Array or arguments, which will be passed to
     *     the event's init method.
     */
    fireEvent : function(target, clazz, args) {
      return this.getManager(target).fireEvent(target, clazz, args);
    },
    

    /**
     * Use the low level browser functionality to attach event listeners
     * to DOM nodes. Uses <code>attachEvent</code> in IE and
     * <code>addEventListener</code> in all other browsers.
     *
     * Use this with caution. This is only thought for event handlers and
     * not for the user.
     *
     * @internal
     * @type static
     * @param target {Object} Any valid native event target
     * @param type {String} Name of the event
     * @param listener {Function} The pointer to the function to assign
     * @signature function(target, type, listener)
     */
    addNativeListener : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(target, type, listener) {
        target.attachEvent("on" + type, listener);
      },

      "default" : function(target, type, listener) {
        target.addEventListener(type, listener, false);
      }
    }),


    /**
     * Use the low level browser functionality to remove event listeners
     * from DOM nodes. Uses <code>detachEvent</code> in IE and
     * <code>removeEventListener</code> in all oother browsers.
     *
     * Use this with caution. This is only thought for event handlers and
     * not for the user.
     *     
     * @internal
     * @type static
     * @param target {Object} Any valid native event target
     * @param type {String} Name of the event
     * @param listener {Function} The pointer to the function to assign
     * @signature function(target, type, listener)
     */
    removeNativeListener : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(target, type, listener) {
        target.detachEvent("on" + type, listener);
      },

      "default" : function(target, type, listener) {
        target.removeEventListener(type, listener, false);
      }
    }),





    /*
    ---------------------------------------------------------------------------
      EVENT HANDLER/DISPATCHER PRIORITY
    ---------------------------------------------------------------------------
    */

    /**
     * Position at which the handler/dispatcher should be inserted into the list.
     */
    PRIORITY_FIRST : -32000,
    PRIORITY_NORMAL : 0,
    PRIORITY_LAST : 32000,

    
    




    /*
    ---------------------------------------------------------------------------
      EVENT HANDLER REGISTRATION
    ---------------------------------------------------------------------------
    */

    /** {Array} Contains all known event handlers */
    __handlers : [],


    /**
     * Register an event handler.
     *
     * @internal
     * @param handler {qx.legacy.event.handler.AbstractEventHandler} Event handler to add
     * @param priority {Integer} One of {@link #PRIORITY_FIRST}, {@link PRIORITY_NORMAL}
     *     or {@link #PRIORITY_LAST}.
     */
    registerHandler : function(handler, priority)
    {
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (!qx.Class.hasInterface(handler, qx.event.IEventHandler)) {
          throw new Error("The event handler does not implement the interface qx.event.IEventHandler!");
        }
      }
            
      // Append to list
      this.__handlers.push(handler);
      
      // Re-sort list
      this.__handlers.sort(function(a,b) {
        return a.PRIORITY - b.PRIORITY;
      });
    },


    /**
     * Get a list of registered event handlers.
     *
     * @internal
     * @return {qx.legacy.event.handler.AbstractEventHandler[]} registered event handlers
     */
    getHandlers : function() {
      return this.__handlers;
    },







    /*
    ---------------------------------------------------------------------------
      EVENT DISPATCHER REGISTRATION
    ---------------------------------------------------------------------------
    */

    /** {Array} Contains all known event dispatchers */
    __dispatchers : [],


    /**
     * Register an event dispatcher.
     *
     * @internal
     * @param dispatcher {qx.legacy.event.dispatch.IEventDispatch} Event dispatcher to add
     * @param priority {Integer} One of {@link #PRIORITY_FIRST}, {@link PRIORITY_NORMAL}
     *     or {@link #PRIORITY_LAST}.
     */
    registerDispatcher : function(dispatcher, priority)
    {
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (!qx.Class.hasInterface(dispatcher, qx.event.IEventDispatcher)) {
          throw new Error("The dispatch dispatcher does not implement the interface qx.event.IEventDispatcher!");
        }
      }

      // Append to list
      this.__dispatchers.push(dispatcher);
      
      // Re-sort list
      this.__dispatchers.sort(function(a,b) {
        return a.PRIORITY - b.PRIORITY;
      });
    },


    /**
     * Get a list of registered event dispatchers.
     *
     * @internal
     * @return {qx.legacy.event.dispatch.IEventDispatch[]} all registered event dispatcher
     */
    getDispatchers : function() {
      return this.__dispatchers;
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
      HELPERS
    ---------------------------------------------------------------------------
    */

    /**
     * Get the window instance the event manager is reponsible for
     *
     * @return {Window} DOM window instance
     */
    getWindow : function() {
      return this.__window;
    },


    /**
     * Generates a unique ID for a combination of target, type and capturing
     *
     * @type member
     * @param target {Object} Any valid event target
     * @param type {String} Event name
     * @param capture {Boolean ? false} Event for capture phase?
     * @return {String} the unique ID
     */
    __generateUniqueId : function(target, type, capture) {
      return qx.core.Object.toHashCode(target) + "|" + type + (capture ? "|capture" : "|bubble");
    },
    
    
    
    
    
        
    /*
    ---------------------------------------------------------------------------
      EVENT LISTENER MANAGMENT
    ---------------------------------------------------------------------------
    */

    /**
     * Get all event listeners for the given target, event type and phase. 
     *
     * @param target {Object} any valid event target
     * @param type {String} DOM event type
     * @param capture {Boolean ? false} Whether the listener is for the
     *       capturing phase of the bubbling phase.
     * @return {Function[]|null} Array of registered event handlers for this event
     *     and type. Will return null if <code>setup</code> and no entry
     *     is found.
     */
    getListeners : function(target, type, capture) {
      return this.__listeners[this.__generateUniqueId(target, type, capture)] || null;
    },
    

    /**
     * Check whether there are one or more listeners for an event type
     * registered at the target.
     *
     * @param target {Object} Any valid event target
     * @param type {String} The event type
     * @param capture {Boolean ? false} Whether to check for listeners of
     *       the bubbling or of the capturing phase.
     * @return {Boolean} Whether the target has event listeners of the given type.
     */
    hasListeners : function(target, type, capture)
    {
      var listeners = this.__listeners[this.__generateUniqueId(target, type, capture)];
      return listeners != null && listeners.length > 0;
    }, 
    
        
    /**
     * Add an event listener to any valid target. The event listener is passed an
     * instance of {@link Event} containing all relevant information
     * about the event as parameter.
     *
     * @type member
     * @param target {Object} Any valid event target
     * @param type {String} Name of the event e.g. "click", "keydown", ...
     * @param listener {Function} Event listener function
     * @param self {Object ? window} Reference to the 'this' variable inside
     *       the event listener.
     * @param capture {Boolean ? false} Whether to attach the event to the
     *       capturing phase of the bubbling phase of the event. The default is
     *       to attach the event handler to the bubbling phase.
     */
    addListener : function(target, type, listener, self, capture)
    {
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (!(target instanceof Object)) {
          throw new Error("Could not add listeners to non-objects!");
        }
        
        if (typeof type !== "string") {
          throw new Error("Invalid event type '" + type + "'");
        }
        
        if (typeof listener !== "function") {
          throw new Error("Invalid listener for event handling: " + listener); 
        }
        
        if (self !== undefined && !(self instanceof Object)) {
          throw new Error("Invalid self for event handling: " + self); 
        }
        
        if (capture !== undefined && typeof capture !== "boolean") {
          throw new Error("Capture flags needs to be boolean!"); 
        }
      }      
      
      // if we are currently dispatching an event, defer this call after the
      // dispatcher has completed. It is critical to not modify the listener
      // registry while dispatching. This code is needed to support "addListener"
      // and "removeListener" calls inside of event handler code.
      if (this.__inEventDispatch)
      {
        this.__jobs.push({
          method : "addListener",
          arguments : arguments
        });

        return;
      }
      
      // Preparations
      var uniqueId = this.__generateUniqueId(target, type, capture);
      var listeners = this.__listeners[uniqueId];
      
      // Create data hierarchy
      if (!listeners) {
        listeners = this.__listeners[uniqueId] = [];
      }
      
      // This is the first event listener for this type and target
      // Inform the event handler about the new event
      // they perform the event registration at DOM level if needed
      if (listeners.length === 0) {
        this.__registerAtHandler(target, type);
      }
      
      // Append listener to list
      listeners.push({handler: listener, context: self});
    },


    /**
     * This method is called each time an event listener for one of the
     * supported events is added using {qx.event.Manager#addListener}.
     *
     * @param target {Object} Any valid event target
     * @param type {String} event type
     */
    __registerAtHandler : function(target, type)
    {
      var classes = this.self(arguments).getHandlers();
      var instances = this.__handlers;
      var clazz, instance;
      
      for (var i=0, l=classes.length; i<l; i++)
      {
        clazz = classes[i];
        instance = instances[clazz.classname];
        
        if (!instance) 
        {
          /*
          if (qx.core.Variant.isSet("qx.debug", "on")) {
            console.debug("Dynamically creating handler instance: " + clazz.classname);
          }
          */
          
          instance = instances[clazz.classname] = new clazz(this);
        }
        
        if (instance.canHandleEvent(target, type))
        {
          instance.registerEvent(target, type);
          return;
        }
      }

      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        this.printStackTrace();
        throw new Error("There is no event handler for the event '"+type+"' on target '"+target+"'!");
      }
    },
    

    /**
     * Remove an event listener from a DOM node.
     *
     * @type member
     * @param target {Object} Any valid event target
     * @param type {String} Name of the event
     * @param listener {Function} The pointer to the event listener
     * @param self {Object ? window} Reference to the 'this' variable inside
     *       the event listener.     
     * @param capture {Boolean ? false} Whether to remove the event listener of
     *       the bubbling or of the capturing phase.
     */
    removeListener : function(target, type, listener, self, capture)
    {
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (!(target instanceof Object)) {
          throw new Error("Could not add listeners to non-objects!");
        }
        
        if (typeof type !== "string") {
          throw new Error("Invalid event type '" + type + "'");
        }
        
        if (typeof listener !== "function") {
          throw new Error("Invalid listener for event handling: " + listener); 
        }
        
        if (self !== undefined && !(self instanceof Object)) {
          throw new Error("Invalid self for event handling: " + self); 
        }
        
        if (capture !== undefined && typeof capture !== "boolean") {
          throw new Error("Capture flags needs to be boolean!"); 
        }
      }  
            
      // if we are currently dispatching an event, defer this call after the
      // dispatcher. It is critical to not modify the listener registry while
      // dispatching.
      if (this.__inEventDispatch) 
      {
        this.__jobs.push({
          method : "removeListener",
          arguments : arguments
        });
        
        return;
      }

      // Preparations
      var uniqueId = this.__generateUniqueId(target, type, capture);
      var listeners = this.__listeners[uniqueId];
      
      // Directly return if there are no listeners
      if (!listeners || listeners.length === 0) {
        return; 
      }
      
      // Remove listener from list
      var entry;
      var found = false;
      
      for (var i=0, l=listeners.length; i<l; i++) 
      {
        if (entry.handler === listener && entry.context === self) 
        {
          qx.lang.Array.removeAt(listeners, i);
          found = true;
          break;
        }
      }
      
      if (!found) {
        throw new Error("Can not remove event listener. There is no event listener with such a configuration!"); 
      }
      
      // This was the last event listener for this type and target
      // Inform the event handler about the event removal so that
      // they perform the event deregistration at DOM level if needed      
      if (listeners.length === 0) {
        this.__unregisterAtHandler(target, type);
      }
    },


    /**
     * This method is called each time the an event listener for one of the
     * supported events is removed by using {qx.event.Manager#removeListener}
     * and no other event listener is listening on this type.
     *
     * @param target {Object} Any valid event target
     * @param type {String} event type
     */
    __unregisterAtHandler : function(target, type)
    {
      var classes = this.self(arguments).getHandlers();
      var instances = this.__handlers;
      var clazz, instance;
      
      for (var i=0, l=classes.length; i<l; i++)
      {
        clazz = classes[i];
        instance = instances[clazz.classname];
        
        if (!instance) {
          continue;
        }
        
        if (instance.canHandleEvent(target, type))
        {
          instance.unregisterEvent(target, type);
          return;
        }
      }      

      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        this.printStackTrace();
        throw new Error("There is no event handler for the event '"+type+"' on target '"+target+"'!");
      }
    },





    /*
    ---------------------------------------------------------------------------
      EVENT DISPATCH
    ---------------------------------------------------------------------------
    */

    /**
     * Dispatches an event object using the qooxdoo event handler system. The
     * event will only be visible in event listeners attached using
     * {@link #addListener}. After dispatching the event object will be pooled
     * for later reuse or disposed.
     *
     * @type member
     * @param target {Object} Any valid event target
     * @param event {qx.event.type.Event} The event object to dispatch. The event
     *     object must be obtained using {@link #createEvent} and initialized
     *     using {@link qx.event.type.Event#init}.
     */
    dispatchEvent : function(target, event)
    {
      if (this.getDisposed()) {
        return; 
      }
      
      // Mark as in dispatch state
      this.__inEventDispatch = true;

      // Preparations
      var type = event.getType();
      event.setTarget(target);

      // Interation data
      var classes = this.self(arguments).getDispatchers();
      var instances = this.__dispatchers;
      var clazz, instance;
      
      // Loop through the dispatchers
      var dispatched = false;
      for (var i=0, l=classes.length; i<l; i++)
      {
        clazz = classes[i];
        instance = instances[clazz.classname];
        
        // Create if missing
        if (!instance) 
        {
          /*
          if (qx.core.Variant.isSet("qx.debug", "on")) {
            console.debug("Dynamically creating dispatcher instance: " + clazz.classname);
          }
          */
          
          instance = instances[clazz.classname] = new clazz(this);
        }

        // Ask if the dispatcher can handle this event
        if (instance.canDispatchEvent(target, event, type))
        {
          instance.dispatchEvent(target, event, type);
          dispatched = true;
          break;
        }
      }

      if (!dispatched) {
        throw new Error("Could not dispatch: " + type + " on " + target);
      }

      // The event handler may have disposed the app.
      if (this.getDisposed()) {
        return;
      }

      // Release the event instance to the event pool
      qx.event.Pool.getInstance().poolEvent(event);
      
      // Reset dispatch flag
      this.__inEventDispatch = false;

      // Flush the job queue
      var jobs = this.__jobs;
      if (jobs && jobs.length > 0)
      {
        var job;
        
        for (var i=0, l=jobs.length; i<l; i++)
        {
          job = jobs[i];
          this[job.method].apply(this, job.arguments);
        }

        this.__jobs = [];
      }
    },


    /**
     * Create an event object and dispatch it on the given target.
     *
     * @type member
     * @param target {Object} Any valid event target
     * @param clazz {qx.event.type.Event} The even class
     * @param args {Array} Array or arguments, which will be passed to
     *     the event's init method.
     */
    fireEvent : function(target, clazz, args)
    {
      var event = qx.event.Manager.createEvent(clazz, args);
      this.dispatchEvent(target, event);
    }
  },
  
  
  
  
  
  
  
  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    // Remove own unload listener
    qx.event.Manager.removeNativeListener(this.__window, "unload", this.__disposeWrapper);
    
    // Remove from manager list
    var id = qx.core.Object.toHashCode(this.getWindow());
    delete qx.event.Manager.__managers[id];

    // Dispose data fields   
    this._disposeFields("__listeners", "__jobs", "__window",
      "__handlers", "__dispatchers");
  }
});
