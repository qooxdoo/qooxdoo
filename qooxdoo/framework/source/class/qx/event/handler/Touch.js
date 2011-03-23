/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2010 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)
     * Tino Butz (tbtz)
     * Christian Hagendorn (chris_schmidt)

************************************************************************ */

/* ************************************************************************

#require(qx.event.handler.UserAction)
#require(qx.event.handler.Orientation)

************************************************************************ */

/**
 * EXPERIMENTAL - NOT READY FOR PRODUCTION
 *
 * This class provides an unified touch event handler.
 */
qx.Class.define("qx.event.handler.Touch",
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

    this._initTouchObserver();
    this._initMouseObserver();
  },




  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /** {Integer} Priority of this handler */
    PRIORITY : qx.event.Registration.PRIORITY_NORMAL,

    /** {Map} Supported event types */
    SUPPORTED_TYPES :
    {
      touchstart : 1,
      touchmove : 1,
      touchend : 1,
      touchcancel : 1, // Appears when the touch is interrupted, e.g. by an alert box
      tap : 1,
      swipe : 1
    },

    /** {Integer} Which target check to use */
    TARGET_CHECK : qx.event.IEventHandler.TARGET_DOMNODE + qx.event.IEventHandler.TARGET_DOCUMENT,

    /** {Integer} Whether the method "canHandleEvent" must be called */
    IGNORE_CAN_HANDLE : true,

    /** {Map} Mapping of mouse events to touch events */
    MOUSE_TO_TOUCH_MAPPING :
    {
      "mousedown" : "touchstart",
      "mousemove" : "touchmove",
      "mouseup" : "touchend"
    },

    /** {Map} The direction of a swipe relative to the axis */
    SWIPE_DIRECTION :
    {
      x : ["left", "right"],
      y : ["up", "down"]
    },


    /** {Integer} The maximum distance of a tap. Only if the x or y distance of
     *      the performed tap is less or equal the value of this constant, a tap
     *      event is fired.
     */
    TAP_MAX_DISTANCE : qx.core.Environment.get("os.name") != "android" ? 10 : 40,

    /** {Integer} The minimum distance of a swipe. Only if the x or y distance
     *      of the performed swipe is greater as or equal the value of this
     *      constant, a swipe event is fired.
     */
    SWIPE_MIN_DISTANCE : qx.core.Environment.get("os.name") != "android" ? 11 : 41,

    /** {Integer} The minimum velocity of a swipe. Only if the velocity of the
     *      performed swipe is greater as or equal the value of this constant, a
     *      swipe event is fired.
     */
    SWIPE_MIN_VELOCITY : 0
  },





  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __onTouchEventWrapper : null,
    __onMouseEventWrapper : null,

    __manager : null,
    __window : null,
    __root : null,
    __startPageX : null,
    __startPageY : null,
    __startTime : null,
    __isSingleTouchGesture : null,

    // Checks if the mouse movement is happening while simulating a touch event
    __isInTouch : false,

    __originalTarget : null,

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
     * Return the target of the event.
     *
     * @param domEvent {Event} DOM event
     * @return {Element} Event target
     */
    __getTarget : function(domEvent)
    {
      var target = qx.bom.Event.getTarget(domEvent);
      // Text node. Fix Safari Bug, see http://www.quirksmode.org/js/events_properties.html
      if ((qx.core.Environment.get("engine.name") == "webkit"))
      {
        if (target && target.nodeType == 3) {
          target = target.parentNode;
        }
      }
      return target;
    },


    /**
     * Fire a touch event with the given parameters
     *
     * @param domEvent {Event} DOM event
     * @param type {String ? null} type of the event
     * @param target {Element ? null} event target
     * @param eventTypeClass {Class ? qx.event.type.Touch} the event type class
     */
    __fireEvent : function(domEvent, type, target, eventTypeClass)
    {
      if (!target) {
        target = this.__getTarget(domEvent);
      }

      var type = type || domEvent.type;

      if (target && target.nodeType)
      {
        qx.event.Registration.fireEvent(
          target,
          type,
          eventTypeClass||qx.event.type.Touch,
          [domEvent, target, null, true, true]
        );
      }

      // Fire user action event
      qx.event.Registration.fireEvent(this.__window, "useraction", qx.event.type.Data, [type]);
    },


    /**
     * Checks if a gesture was made and fires the gesture event.
     *
     * @param domEvent {Event} DOM event
     * @param type {String ? null} type of the event
     * @param target {Element ? null} event target
     */
    __checkAndFireGesture : function(domEvent, type, target)
    {
      if (!target) {
        target = this.__getTarget(domEvent);
      }
      var type = type || domEvent.type;

      if (type == "touchstart")
      {
        this.__gestureStart(domEvent, target);
      }
      else if (type == "touchmove") {
        this.__gestureChange(domEvent, target);
      }
      else if (type == "touchend")
      {
        this.__gestureEnd(domEvent, target);
      }
    },


    /**
     * Helper method for gesture start.
     *
     * @param domEvent {Event} DOM event
     * @param target {Element} event target
     */
    __gestureStart : function(domEvent, target)
    {
      var touch = domEvent.changedTouches[0];
      this.__startPageX = touch.screenX;
      this.__startPageY = touch.screenY;
      this.__startTime = new Date().getTime();
      this.__isSingleTouchGesture = domEvent.changedTouches.length === 1;
    },


    /**
     * Helper method for gesture change.
     *
     * @param domEvent {Event} DOM event
     * @param target {Element} event target
     */
    __gestureChange : function(domEvent, target)
    {
      // Abort a single touch gesture when another touch occurs.
      if (this.__isSingleTouchGesture && domEvent.changedTouches.length > 1) {
        this.__isSingleTouchGesture = false;
      }
    },


    /**
     * Helper method for gesture end.
     *
     * @param domEvent {Event} DOM event
     * @param target {Element} event target
     */
    __gestureEnd : function(domEvent, target)
    {
      if (this.__isSingleTouchGesture)
      {
        var touch = domEvent.changedTouches[0];

        var deltaCoordinates = {
            x : touch.screenX - this.__startPageX,
            y : touch.screenY - this.__startPageY
        };

        var clazz = qx.event.handler.Touch;
        if (this.__originalTarget == target
            && Math.abs(deltaCoordinates.x) <= clazz.TAP_MAX_DISTANCE
            && Math.abs(deltaCoordinates.y) <= clazz.TAP_MAX_DISTANCE) {
          this.__fireEvent(domEvent, "tap", target, qx.event.type.Tap);
        }
        else
        {
          var swipe = this.__getSwipeGesture(domEvent, target, deltaCoordinates);
          if (swipe) {
            domEvent.swipe = swipe;
            this.__fireEvent(domEvent, "swipe", target, qx.event.type.Swipe);
          }
        }
      }
    },


    /**
     * Returns the swipe gesture when the user performed a swipe.
     *
     * @param domEvent {Event} DOM event
     * @param target {Element} event target
     * @param deltaCoordinates {Map} delta x/y coordinates since the gesture started.
     * @return {Map} returns the swipe data when the user performed a swipe, null if the gesture was no swipe.
     */
    __getSwipeGesture : function(domEvent, target, deltaCoordinates)
    {
      var clazz = qx.event.handler.Touch;
      var duration = new Date().getTime() - this.__startTime;
      var axis = (Math.abs(deltaCoordinates.x) >= Math.abs(deltaCoordinates.y)) ? "x" : "y";
      var distance = deltaCoordinates[axis];
      var direction = clazz.SWIPE_DIRECTION[axis][distance < 0 ? 0 : 1]
      var velocity = (duration !== 0) ? distance/duration : 0;

      var swipe = null;
      if (Math.abs(velocity) >= clazz.SWIPE_MIN_VELOCITY
          && Math.abs(distance) >= clazz.SWIPE_MIN_DISTANCE)
      {
        swipe = {
            startTime : this.__startTime,
            duration : duration,
            axis : axis,
            direction : direction,
            distance : distance,
            velocity : velocity
        };
      }
      return swipe;
    },


    /**
     * Normalizes a mouse event to a touch event.
     *
     * @signature function(domEvent)
     * @param domEvent {Event} DOM event
     */
    __normalizeMouseEvent : qx.core.Environment.select("qx.mobile.emulatetouch",
    {
      "true" : function(domEvent)
      {
        var type = domEvent.type;
        var eventMapping = qx.event.handler.Touch.MOUSE_TO_TOUCH_MAPPING;
        if (eventMapping[type])
        {
          type = eventMapping[type];
          // Remember if we are in a touch event
          if (type == "touchstart" && this.__isLeftMouseButtonPressed(domEvent)) {
            this.__isInTouch = true;
          } else if (type == "touchend") {
            this.__isInTouch = false;
          }

          var touchObject = this.__createTouchObject(domEvent);
          var touchArray = (type == "touchend" ? [] : [touchObject]);

          // add the touches to the native mouse event
          domEvent.touches = touchArray;
          domEvent.targetTouches = touchArray;
          domEvent.changedTouches = [touchObject];
        }
        return type;
      },

      "default" : qx.lang.Function.empty
    }),


    /**
     * Checks if the left mouse button is pressed.
     *
     * @signature function(domEvent)
     * @param domEvent {Event} DOM event
     * @return {Boolean} Whether the left mouse button is pressed
     */
    __isLeftMouseButtonPressed : qx.core.Environment.select("qx.mobile.emulatetouch",
    {
      "true" : function(domEvent)
      {
        if ((qx.core.Environment.get("engine.name") == "mshtml")) {
          var buttonIndex = 1;
        } else {
          var buttonIndex = 0;
        }
        return domEvent.button == buttonIndex;
      },

      "default" : qx.lang.Function.empty
    }),


    /**
     * Creates and returns a Touch mock object.
     * Fore more information see:
     * http://developer.apple.com/safari/library/documentation/UserExperience/Reference/TouchClassReference/Touch/Touch.html
     *
     * @signature function(domEvent)
     * @param domEvent {Event} DOM event
     * @return {Object} The Touch mock object
     */
    __createTouchObject : qx.core.Environment.select("qx.mobile.emulatetouch",
    {
      "true" : function(domEvent)
      {
        var target = this.__getTarget(domEvent);
        return {
          clientX : domEvent.clientX,
          clientY : domEvent.clientY,
          screenX : domEvent.screenX,
          screenY : domEvent.screenY,
          pageX : domEvent.pageX,
          pageY : domEvent.pageY,
          identifier : 1,
          target : target
        };
      },

      "default" : qx.lang.Function.empty
    }),


    /*
    ---------------------------------------------------------------------------
      OBSERVER INIT
    ---------------------------------------------------------------------------
    */

    /**
     * Initializes the native touch event listeners.
     */
    _initTouchObserver : function()
    {
      this.__onTouchEventWrapper = qx.lang.Function.listener(this._onTouchEvent, this);

      var Event = qx.bom.Event;

      Event.addNativeListener(this.__root, "touchstart", this.__onTouchEventWrapper);
      Event.addNativeListener(this.__root, "touchmove", this.__onTouchEventWrapper);
      Event.addNativeListener(this.__root, "touchend", this.__onTouchEventWrapper);
      Event.addNativeListener(this.__root, "touchcancel", this.__onTouchEventWrapper);
    },


    /**
     * Initializes the native mouse event listeners.
     */
    _initMouseObserver : qx.core.Environment.select("qx.mobile.emulatetouch",
    {
      "true" : function()
      {
        if (!qx.core.Environment.get("event.touch"))
        {
          this.__onMouseEventWrapper = qx.lang.Function.listener(this._onMouseEvent, this);

          var Event = qx.bom.Event;

          Event.addNativeListener(this.__root, "mousedown", this.__onMouseEventWrapper);
          Event.addNativeListener(this.__root, "mousemove", this.__onMouseEventWrapper);
          Event.addNativeListener(this.__root, "mouseup", this.__onMouseEventWrapper);
        }
      },
      "default" : qx.lang.Function.empty
    }),


    /*
    ---------------------------------------------------------------------------
      OBSERVER STOP
    ---------------------------------------------------------------------------
    */

    /**
     * Disconnects the native touch event listeners.
     */
    _stopTouchObserver : function()
    {
      var Event = qx.bom.Event;

      Event.removeNativeListener(this.__root, "touchstart", this.__onTouchEventWrapper);
      Event.removeNativeListener(this.__root, "touchmove", this.__onTouchEventWrapper);
      Event.removeNativeListener(this.__root, "touchend", this.__onTouchEventWrapper);
      Event.removeNativeListener(this.__root, "touchcancel", this.__onTouchEventWrapper);
    },


    /**
     * Disconnects the native mouse event listeners.
     */
    _stopMouseObserver : qx.core.Environment.select("qx.mobile.emulatetouch",
    {
      "true" : function()
      {
        if (!qx.core.Environment.get("event.touch"))
        {
          var Event = qx.bom.Event;

          Event.removeNativeListener(this.__root, "mousedown", this.__onMouseEventWrapper);
          Event.removeNativeListener(this.__root, "mousemove", this.__onMouseEventWrapper);
          Event.removeNativeListener(this.__root, "mouseup", this.__onMouseEventWrapper);
        }
      },
      "default" : qx.lang.Function.empty
    }),


    /*
    ---------------------------------------------------------------------------
      NATIVE EVENT OBSERVERS
    ---------------------------------------------------------------------------
    */

    /**
     * Handler for the native touch events.
     *
     * @signature function(domEvent)
     * @param domEvent {Event} The touch event from the browser.
     */
    _onTouchEvent : qx.event.GlobalError.observeMethod(function(domEvent)
    {
      this._commonTouchEventHandler(domEvent);
    }),


    /**
     * Handler for the native mouse events.
     *
     * @signature function(domEvent)
     * @param domEvent {Event} The mouse event from the browser.
     */
    _onMouseEvent : qx.core.Environment.select("qx.mobile.emulatetouch",
    {
      "true" : qx.event.GlobalError.observeMethod(function(domEvent)
      {
        if (!qx.core.Environment.get("event.touch"))
        {
          if (domEvent.type == "mousemove" && !this.__isInTouch) {
            return;
          }
          var type = this.__normalizeMouseEvent(domEvent);
          this._commonTouchEventHandler(domEvent, type);
        }
      }),

      "default" : qx.lang.Function.empty
    }),


    /**
     * Called by an event handler.
     *
     * @param domEvent {Event} DOM event
     * @param type {String ? null} type of the event
     */
    _commonTouchEventHandler : function(domEvent, type)
    {
      var type = type || domEvent.type;
      if (type == "touchstart") {
        this.__originalTarget = this.__getTarget(domEvent);
      }
      this.__fireEvent(domEvent, type);
      this.__checkAndFireGesture(domEvent, type);
    }
  },


  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    this._stopTouchObserver();
    this._stopMouseObserver();

    this.__manager = this.__window = this.__root = this.__originalTarget = null;
  },


  /*
  *****************************************************************************
     DEFER
  *****************************************************************************
  */

  defer : function(statics) {
    qx.event.Registration.addHandler(statics);

    // Prevent scrolling on the document to avoid scrolling at all
    // TODO: Seems like Android does not prevent scrolling on touchmove
    //       Perhaps we should use "touchstart" here?
    if (qx.core.Environment.get("event.touch")) {
      if (qx.core.Environment.get("qx.mobile.nativescroll") == false)
      {
        document.addEventListener("touchmove", function(e) {
          e.preventDefault();
        });
      }

      // get the handler to asure that the instance is created
      qx.event.Registration.getManager(document).getHandler(statics);
    }
  }
});