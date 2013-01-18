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
     * Andreas Ecker (ecker)
     * Fabian Jakobs (fjakobs)
     * Christian Hagendorn (chris_schmidt)

************************************************************************ */

/* ************************************************************************

#require(qx.event.handler.Touch)
#require(qx.event.handler.TouchCore)

************************************************************************ */

qx.Class.define("qx.event.handler.MouseEmulation",
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
   * @param manager {qx.event.Manager} Event manager for the window to use
   */
  construct : function(manager)
  {
    this.base(arguments);

    // Define shorthands
    this.__manager = manager;
    this.__window = manager.getWindow();
    this.__root = this.__window.document;

    // Initialize observers
    this._initObserver();
  },




  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /** {Integer} Priority of this handler */
    PRIORITY : qx.event.Registration.PRIORITY_FIRST,

    /** {Map} Supported event types */
    SUPPORTED_TYPES :
    {
      mousedown : 1,
      mouseup : 1,
      mousemove : 1,
      click : 1
    },

    /** {Integer} Which target check to use */
    TARGET_CHECK : qx.event.IEventHandler.TARGET_DOMNODE + qx.event.IEventHandler.TARGET_DOCUMENT + qx.event.IEventHandler.TARGET_WINDOW,

    /** {Integer} Whether the method "canHandleEvent" must be called */
    IGNORE_CAN_HANDLE : true
  },





  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __manager : null,
    __window : null,
    __root : null,




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





    /*
    ---------------------------------------------------------------------------
      HELPER
    ---------------------------------------------------------------------------
    */


    /**
     * Fire a mouse event with the given parameters
     *
     * @param event {Event} qooxdoo touch event
     * @param type {String} type of the event
     * @param target {var} The target of the event
     * @return {Boolean} whether the event default was prevented or not.
     *     Returns <code>true</code>, when the event was NOT prevented.
     */
    __fireEvent : function(evt, type, target) {
      var mouseEvent = new qx.event.type.Mouse();
      mouseEvent.init(evt, target, null, true, true);
      mouseEvent.setType(type);
      return qx.event.Registration.getManager(target).dispatchEvent(target, mouseEvent);
    },




    /*
    ---------------------------------------------------------------------------
      OBSERVER INIT
    ---------------------------------------------------------------------------
    */

    /**
     * Initializes the native mouse button event listeners.
     *
     * @signature function()
     */
    _initObserver : function()
    {
      qx.event.Registration.addListener(this.__root, "touchstart", this.__onTouchStart, this);
      qx.event.Registration.addListener(this.__root, "touchmove", this.__onTouchMove, this);
      qx.event.Registration.addListener(this.__root, "touchend", this.__onTouchEnd, this);
      qx.event.Registration.addListener(this.__root, "tap", this.__onTap, this);
    },




    /*
    ---------------------------------------------------------------------------
      OBSERVER STOP
    ---------------------------------------------------------------------------
    */

    /**
     * Disconnects the native mouse button event listeners.
     *
     * @signature function()
     */
    _stopObserver : function()
    {
      qx.event.Registration.removeListener(this.__root, "touchstart", this.__onTouchStart, this);
      qx.event.Registration.removeListener(this.__root, "touchmove", this.__onTouchMove, this);
      qx.event.Registration.removeListener(this.__root, "touchend", this.__onTouchEnd, this);
      qx.event.Registration.removeListener(this.__root, "tap", this.__onTap, this);
    },


    /*
    ---------------------------------------------------------------------------
      HANDLER
    ---------------------------------------------------------------------------
    */

    __onTouchStart : function(e) {
      var target = e.getTarget();
      var nativeEvent = this.getDefaultFakeEvent(target, e.getAllTouches()[0]);
      if (!this.__fireEvent(nativeEvent, "mousedown", target)) {
        e.preventDefault();
      }
    },


    __onTouchMove : function(e) {
      var target = e.getTarget();
      var nativeEvent = this.getDefaultFakeEvent(target, e.getChangedTargetTouches()[0]);
      if (!this.__fireEvent(nativeEvent, "mousemove", target)) {
        e.preventDefault();
      }
    },


    __onTouchEnd : function(e) {
      var target = e.getTarget();
      var nativeEvent = this.getDefaultFakeEvent(target, e.getChangedTargetTouches()[0]);
      if (!this.__fireEvent(nativeEvent, "mouseup", target)) {
        e.preventDefault();
      }
    },


    __onTap : function(e) {
      var target = e.getTarget();
      var nativeEvent = this.getDefaultFakeEvent(target, e.getChangedTargetTouches()[0]);

      this.__fireEvent(nativeEvent, "click", target);
    },


    getDefaultFakeEvent : function(target, finger) {
      var nativeEvent = {};

      nativeEvent.button = 0; // for left button
      nativeEvent.wheelDelta = 0;
      nativeEvent.wheelDeltaX = 0;
      nativeEvent.wheelDeltaY = 0;
      nativeEvent.wheelX = 0;
      nativeEvent.wheelY = 0;
      nativeEvent.target = target;

      nativeEvent.clientX = finger.clientX;
      nativeEvent.clientY = finger.clientY;
      nativeEvent.pageX = finger.pageX;
      nativeEvent.pageY = finger.pageY;
      nativeEvent.screenX = finger.screenX;
      nativeEvent.screenY = finger.screenY;

      nativeEvent.shiftKey = false;
      nativeEvent.ctrlKey = false;
      nativeEvent.altKey = false;
      nativeEvent.metaKey = false;

      return nativeEvent;
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    this._stopObserver();

    this.__manager = this.__window = this.__root = null;
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
