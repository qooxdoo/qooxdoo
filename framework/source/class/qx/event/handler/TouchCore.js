/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)
     * Tino Butz (tbtz)
     * Christian Hagendorn (chris_schmidt)
     * Daniel Wagner (danielwagner)

************************************************************************ */

/**
 * Listens for native touch events and fires composite events like "tap" and
 * "swipe"
 *
 * @ignore(qx.event.*)
 */
qx.Bootstrap.define("qx.event.handler.TouchCore", {

  extend : Object,
  implement: [ qx.core.IDisposable ],

  statics :
  {
    /** @type {Integer} The maximum distance of a tap. Only if the x or y distance of
     *      the performed tap is less or equal the value of this constant, a tap
     *      event is fired.
     */
    TAP_MAX_DISTANCE : qx.core.Environment.get("os.name") != "android" ? 10 : 40,


    /** @type {Map} The direction of a swipe relative to the axis */
    SWIPE_DIRECTION :
    {
      x : ["left", "right"],
      y : ["up", "down"]
    },


    /** @type {Integer} The minimum distance of a swipe. Only if the x or y distance
     *      of the performed swipe is greater as or equal the value of this
     *      constant, a swipe event is fired.
     */
    SWIPE_MIN_DISTANCE : qx.core.Environment.get("os.name") != "android" ? 11 : 41,

    /** @type {Integer} The minimum velocity of a swipe. Only if the velocity of the
     *      performed swipe is greater as or equal the value of this constant, a
     *      swipe event is fired.
     */
    SWIPE_MIN_VELOCITY : 0,


    /**
     * @type {Integer} The time delta in milliseconds to fire a long tap event.
     */
    LONGTAP_TIME : 500
  },


  /**
   * Create a new instance
   *
   * @param target {Element} element on which to listen for native touch events
   * @param emitter {qx.event.Emitter} Event emitter object
   */
  construct : function(target, emitter)
  {
    this.__target = target;
    this.__emitter = emitter;
    this._initTouchObserver();
    this.__pointers = [];

    this.__touchStartPosition = {};
  },


  members :
  {
    __target : null,
    __emitter : null,
    __onTouchEventWrapper : null,

    __originalTarget : null,

    __touchStartPosition : null,
    __startTime : null,

    __beginScalingDistance : null,
    __beginRotation : null,

    __pointers : null,

    __touchEventNames : null,


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

      this.__touchEventNames = ["touchstart", "touchmove", "touchend", "touchcancel"];

      if (qx.core.Environment.get("event.mspointer")) {
        var engineVersion = parseInt(qx.core.Environment.get("engine.version"), 10);
        if (engineVersion == 10) {
          // IE 10
          this.__touchEventNames = ["MSPointerDown", "MSPointerMove", "MSPointerUp", "MSPointerCancel"];
        } else {
          // IE 11+
          this.__touchEventNames = ["pointerdown", "pointermove", "pointerup", "pointercancel"];
        }
      }

      for (var i = 0; i < this.__touchEventNames.length; i++) {
        qx.bom.Event.addNativeListener(this.__target, this.__touchEventNames[i], this.__onTouchEventWrapper);
      }
    },



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
      for (var i = 0; i < this.__touchEventNames.length; i++) {
        qx.bom.Event.removeNativeListener(this.__target, this.__touchEventNames[i], this.__onTouchEventWrapper);
      }
    },



    /*
    ---------------------------------------------------------------------------
      NATIVE EVENT OBSERVERS
    ---------------------------------------------------------------------------
    */

    /**
     * Handler for native touch events.
     *
     * @param domEvent {Event} The touch event from the browser.
     */
    _onTouchEvent : function(domEvent)
    {
      this._commonTouchEventHandler(domEvent);
    },


    /**
     * Calculates the scaling distance between two touches.
     * @param touch0 {Event} The touch event from the browser.
     * @param touch1 {Event} The touch event from the browser.
     * @return {Number} the calculated distance.
     */
    _getScalingDistance : function(touch0, touch1) {
      return(Math.sqrt( Math.pow(touch0.pageX - touch1.pageX, 2) + Math.pow(touch0.pageY - touch1.pageY, 2) ));
    },


    /**
     * Calculates the rotation between two touches.
     * @param touch0 {Event} The touch event from the browser.
     * @param touch1 {Event} The touch event from the browser.
     * @return {Number} the calculated rotation.
     */
    _getRotationAngle :  function(touch0, touch1) {
      var x = touch0.pageX - touch1.pageX;
      var y = touch0.pageY - touch1.pageY;
      return(Math.atan2(y, x)*180/Math.PI);
    },


    /**
     * Calculates the delta of the touch position relative to its position when <code>touchstart/code> event occurred.
     * @param touches {Array} an array with the current active touches, provided by <code>touchmove/code> event.
     * @return {Array} an array containing objects with the calculated delta as <code>x</code>,
     * <code>y</code> and the identifier of the corresponding touch.
     */
    _calcTouchesDelta : function(touches) {
      var delta = [];
      for (var i = 0; i < touches.length; i++) {
        delta.push(this._calcSingleTouchDelta(touches[i]));
      }
      return delta;
    },


    /**
     * Calculates the delta of one single touch position relative to its position when <code>touchstart/code> event occurred.
     * @param touch {Event} the current active touch, provided by <code>touchmove/code> event.
     * @return {Map} a map containing deltaX as <code>x</code>, deltaY as <code>y</code>, the direction of the movement as <code>axis</code> and the touch identifier as <code>identifier</code>.
     */
    _calcSingleTouchDelta : function(touch) {
      if (this.__touchStartPosition.hasOwnProperty(touch.identifier)) {
        var touchStartPosition = this.__touchStartPosition[touch.identifier];
        var deltaX = Math.floor(touch.clientX - touchStartPosition[0]);
        var deltaY = Math.floor(touch.clientY - touchStartPosition[1]);
        var axis = "x";
        if (Math.abs(deltaX / deltaY) < 1) {
          axis = "y";
        }
        return {
          "x": deltaX,
          "y": deltaY,
          "axis": axis,
          "identifier": touch.identifier
        };
      } else {
        return {
          "x": 0,
          "y": 0,
          "axis": null,
          "identifier": touch.identifier
        };
      }
    },


    /**
     * Called by an event handler.
     *
     * @param domEvent {Event} DOM event
     * @param type {String ? null} type of the event
     */
    _commonTouchEventHandler : function(domEvent, type)
    {
      var type = type || domEvent.type;
      if (qx.core.Environment.get("event.mspointer")) {
        type = this._mapPointerEvent(type);
        var touches = this._detectTouchesByPointer(domEvent, type);

        domEvent.changedTouches = touches;
        domEvent.targetTouches = touches;
        domEvent.touches = touches;
      }

      domEvent.delta = [];

      if (type == "touchstart") {
        this.__originalTarget = this._getTarget(domEvent);

        if(domEvent.touches && domEvent.touches.length > 1) {
          this.__beginScalingDistance = this._getScalingDistance(domEvent.touches[0],domEvent.touches[1]);
          this.__beginRotation = this._getRotationAngle(domEvent.touches[0], domEvent.touches[1]);
        }

        for (var i = 0; i < domEvent.changedTouches.length; i++) {
          var touch = domEvent.changedTouches[i];
          this.__touchStartPosition[touch.identifier] = [touch.clientX,touch.clientY];
        }
      }

      if(type == "touchmove") {
        // Polyfill for scale
        if(typeof domEvent.scale == "undefined" && domEvent.targetTouches.length > 1) {
          var currentScalingDistance = this._getScalingDistance(domEvent.targetTouches[0],domEvent.targetTouches[1]);
          domEvent.scale = currentScalingDistance / this.__beginScalingDistance;
        }
        // Polyfill for rotation
        if((typeof domEvent.rotation == "undefined" || qx.core.Environment.get("event.mspointer")) && domEvent.targetTouches.length > 1) {
          var currentRotation = this._getRotationAngle(domEvent.targetTouches[0], domEvent.targetTouches[1]);
          domEvent._rotation = currentRotation - this.__beginRotation;
        }

        domEvent.delta = this._calcTouchesDelta(domEvent.targetTouches);
      }

      this._fireEvent(domEvent, type, this.__originalTarget);

      if (qx.core.Environment.get("event.mspointer")) {
        if (type == "touchend" || type == "touchcancel") {
          delete this.__pointers[domEvent.pointerId];
        }
      }

      if ((type == "touchend" || type == "touchcancel") && domEvent.changedTouches[0]) {
        delete this.__touchStartPosition[domEvent.changedTouches[0].identifier];
      }
    },


    /**
    * Creates an array with all current used touches out of multiple serial pointer events.
    * Needed because pointerEvents do not provide a touch list.
    * @param domEvent {Event} DOM event
    * @param type {String ? null} type of the event
    * @return {Array} touch list array.
    */
    _detectTouchesByPointer : function(domEvent, type) {
      var touches = [];
      if (type == "touchstart") {
        this.__pointers[domEvent.pointerId] = domEvent;
      } else if (type == "touchmove") {
        this.__pointers[domEvent.pointerId] = domEvent;
      }

      for (var pointerId in this.__pointers) {
        var pointer = this.__pointers[pointerId];
        touches.push(pointer);
      }

      return touches;
    },


    /**
    * Maps a pointer event type to the corresponding touch event type.
    * @param type {String} the event type to parse.
    * @return {String} the parsed event name.
    */
    _mapPointerEvent : function(type)
    {
      type = type.toLowerCase();

      if (type.indexOf("pointerdown") !== -1) {
        return "touchstart";
      } else if (type.indexOf("pointerup") !== -1) {
        return "touchend";
      } else if (type.indexOf("pointermove") !== -1) {
          return "touchmove";
      } else if (type.indexOf("pointercancel") !== -1) {
        return "touchcancel";
      }

      return type;
    },


    /**
     * Return the target of the event.
     *
     * @param domEvent {Event} DOM event
     * @return {Element} Event target
     */
    _getTarget : function(domEvent)
    {
      var target = qx.bom.Event.getTarget(domEvent);

      // Text node. Fix Safari Bug, see http://www.quirksmode.org/js/events_properties.html
      if (qx.core.Environment.get("engine.name") == "webkit")
      {
        if (target && target.nodeType == 3) {
          target = target.parentNode;
        }
      } else if(qx.core.Environment.get("engine.name") == "mshtml" &&
                qx.core.Environment.get("browser.documentmode") < 11) {
        // Fix for IE10 and pointer-events:none
        //
        // Changed the condition above to match exactly those browsers
        // for which the fix was intended
        // See: https://github.com/qooxdoo/qooxdoo/issues/9481
        //
        var targetForIE = this.__evaluateTarget(domEvent);
        if(targetForIE) {
          target = targetForIE;
        }
      }

      return target;
    },


    /**
     * This method fixes "pointer-events:none" for Internet Explorer 10.
     * Checks which elements are placed to position x/y and traverses the array
     * till one element has no "pointer-events:none" inside its style attribute.
     * @param domEvent {Event} DOM event
     * @return {Element | null} Event target
     */
    __evaluateTarget : function(domEvent) {
      var clientX = null;
      var clientY = null;
      if(domEvent && domEvent.touches && domEvent.touches.length !== 0){
        clientX = domEvent.touches[0].clientX;
        clientY = domEvent.touches[0].clientY;
      }

      // Retrieve an array with elements on point X/Y.
      var hitTargets = document.msElementsFromPoint(clientX, clientY);
      if(hitTargets) {
        // Traverse this array for the elements which has no pointer-events:none inside.
        for (var i = 0; i < hitTargets.length; i++) {
          var currentTarget = hitTargets[i];
          var pointerEvents = qx.bom.element.Style.get(currentTarget, "pointer-events", 3);

          if (pointerEvents != "none") {
            return currentTarget;
          }
        }
      }

      return null;
    },


    /**
     * Fire a touch event with the given parameters
     *
     * @param domEvent {Event} DOM event
     * @param type {String ? null} type of the event
     * @param target {Element ? null} event target
     */
    _fireEvent : function(domEvent, type, target)
    {
      if (!target) {
        target = this._getTarget(domEvent);
      }

      var type = type || domEvent.type;

      if (target && target.nodeType && this.__emitter)
      {
        this.__emitter.emit(type, domEvent);
      }
    },


    /**
     * Dispose this object
     */
    dispose : function()
    {
      this._stopTouchObserver();
      this.__originalTarget = this.__target = this.__touchEventNames = this.__pointers = this.__emitter = this.__beginScalingDistance = this.__beginRotation = null;
    }
  }
});
