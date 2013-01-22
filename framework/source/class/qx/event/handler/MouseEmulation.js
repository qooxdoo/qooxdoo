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

    __startPos : null,
    __lastPos : null,
    __impulseTimerId : null,

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
      var mouseEvent = type == "mousewheel" ?
        new qx.event.type.MouseWheel() :
        new qx.event.type.Mouse();
      mouseEvent.init(evt, target, null, true, true);
      mouseEvent.setType(type);
      return qx.event.Registration.getManager(target).dispatchEvent(target, mouseEvent);
    },


    __fireWheelEvent : function(deltaX, deltaY, finger, target) {
      // change the native fake event to include the wheel delta's
      var wheelEvent = this.getDefaultFakeEvent(target, finger);
      wheelEvent.wheelDelta = deltaX;
      wheelEvent.wheelDeltaY = deltaY;
      wheelEvent.wheelDeltaX = deltaX;

      this.__fireEvent(wheelEvent, "mousewheel", target);
    },


    /**
     * Helper for momentum scrolling.
     * @param deltaX {Number} The deltaX from the last scrolling.
     * @param deltaY {Number} The deltaY from the last scrolling.
     */
    __handleScrollImpulse : function(deltaX, deltaY, finger, target, time) {
      // delete the old timer id
      this.__impulseTimerId = null;

      // do nothing if we don't need to scroll
      if (deltaX == 0 && deltaY == 0) {
        return;
      }

      var change = parseInt((time || 20) / 10);

      // linear momentum calculation for X
      if (deltaX > 0) {
        deltaX = Math.max(0, deltaX - change);
      } else {
        deltaX = Math.min(0, deltaX + change);
      }

      // linear momentum calculation for Y
      if (deltaY > 0) {
        deltaY = Math.max(0, deltaY - change);
      } else {
        deltaY = Math.min(0, deltaY + change);
      }

      // set up a new timer with the new delta
      var start = +(new Date())
      this.__impulseTimerId =
        qx.bom.AnimationFrame.request(qx.lang.Function.bind(function(deltaX, deltaY, finger, target, time) {
          this.__handleScrollImpulse(deltaX, deltaY, finger, target, time - start);
        }, this, deltaX, deltaY, finger, target));

      // scroll the desired new delta
      this.__fireWheelEvent(deltaX, deltaY, finger, target);
    },


    __hasMoved : function(nativeEvent) {
      var endPos = {x: nativeEvent.screenX, y: nativeEvent.screenY};
      var moved = false;

      var offset = 20;
      if (Math.abs(endPos.x - this.__startPos.x) > offset) {
        moved = true;
      }
      if (Math.abs(endPos.y - this.__startPos.y) > offset) {
        moved = true;
      }
      return moved;
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
      this.__lastPos = {x: nativeEvent.screenX, y: nativeEvent.screenY};
      this.__startPos = {x: nativeEvent.screenX, y: nativeEvent.screenY};
    },


    __onTouchMove : function(e) {
      var target = e.getTarget();
      var nativeEvent = this.getDefaultFakeEvent(target, e.getChangedTargetTouches()[0]);
      if (!this.__fireEvent(nativeEvent, "mousemove", target)) {
        e.preventDefault();
      }

      // calculate the delta for the wheel event
      var deltaY = -parseInt(this.__lastPos.y - nativeEvent.screenY);
      var deltaX = -parseInt(this.__lastPos.x - nativeEvent.screenX);

      // take a new position. wheel events require the delta to the last event
      this.__lastPos = {x: nativeEvent.screenX, y: nativeEvent.screenY};

      var finger = e.getChangedTargetTouches()[0];
      this.__fireWheelEvent(deltaX, deltaY, finger, target);

      // if we have an old timeout for the current direction, clear it
      if (this.__impulseTimerId) {
        clearTimeout(this.__impulseTimerId);
        this.__impulseTimerId = null;
      }

      // set up a new timer for the current direction
      this.__impulseTimerId =
        setTimeout(qx.lang.Function.bind(function(deltaX, deltaY, finger, target) {
          this.__handleScrollImpulse(deltaX, deltaY, finger, target);
        }, this, deltaX, deltaY, finger, target), 100);
    },


    __onTouchEnd : function(e) {
      var target = e.getTarget();
      var nativeEvent = this.getDefaultFakeEvent(target, e.getChangedTargetTouches()[0]);

      if (!this.__hasMoved(nativeEvent)) {
        if (!this.__fireEvent(nativeEvent, "mouseup", target)) {
          e.preventDefault();
        }
      }
    },


    __onTap : function(e) {
      var target = e.getTarget();
      var nativeEvent = this.getDefaultFakeEvent(target, e.getChangedTargetTouches()[0]);

      if (!this.__hasMoved(nativeEvent)) {
        this.__fireEvent(nativeEvent, "click", target);
      }
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
