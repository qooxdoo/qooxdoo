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
     * Tino butz (tbtz)

************************************************************************ */

/**
 * EXPERIMENTAL - NOT READY FOR PRODUCTION
 *
 * This class provides a unified touch event handler.
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
      touchcancel : 1 // Appears when the touch is interrupted, e.g. by an alert box
    },

    /** {Integer} Which target check to use */
    TARGET_CHECK : qx.event.IEventHandler.TARGET_DOMNODE,

    /** {Integer} Whether the method "canHandleEvent" must be called */
    IGNORE_CAN_HANDLE : true,

    MOUSE_TO_TOUCH_MAPPING :
    {
      "mousedown" : "touchstart",
      "mousemove" : "touchmove",
      "mouseup" : "touchend"
    }
  },





  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __onTouchEventWrapper : null,
    
    __manager : null,
    __window : null,
    __root : null,

    // Checks if the mouse movement is happening while simulating a touch event 
    __isInTouch : false,

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
     * Fire a touch event with the given parameters
     *
     * @param domEvent {Event} DOM event
     * @param type {String} type of the event
     * @param target {Element} event target
     */
    __fireEvent : function(domEvent, type, target)
    {
      if (!target) {
        target = domEvent.target || domEvent.srcElement;
      }

      if (qx.core.Variant.isSet("qx.mobile", "on"))
      {
        if (!qx.bom.client.Feature.TOUCH)
        {
          if (domEvent.type == "mousemove" && !this.__isInTouch) {
            return;
          }
          type = this.__normalizeMouseEvent(domEvent, target);
        }
      }

      if (target && target.nodeType)
      {
        qx.event.Registration.fireEvent(
          target,
          type||domEvent.type,
          qx.event.type.Touch,
          [domEvent, target, null, true, true]
        );
      }

      // Fire user action event
      qx.event.Registration.fireEvent(this.__window, "useraction", qx.event.type.Data, [type||domEvent.type]);
    },


    /**
     * Normalizes a mouse event to a touch event.
     * 
     * @signature function(domEvent, target)
     * @param domEvent {Event} DOM event
     * @param target {Element} Event target
     */
    __normalizeMouseEvent : qx.core.Variant.select("qx.mobile",
    {
      "on" : function(domEvent, target)
      {
        var eventMapping = qx.event.handler.Touch.MOUSE_TO_TOUCH_MAPPING;
        var type = domEvent.type;
        if (eventMapping[type])
        {
          type = eventMapping[type];
          // Remember if we are in a touch event
          if (type == "touchstart" && this.__isLeftMouseButtonPressed(domEvent)) {
            this.__isInTouch = true;
          } else if (type == "touchend") {
            this.__isInTouch = false;
          }
  
          var touchObject = this.__createTouchObject(domEvent, target);
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
    __isLeftMouseButtonPressed : qx.core.Variant.select("qx.mobile",
    {
      "on" : function(domEvent)
      {
        if (qx.core.Variant.isSet("qx.client", "mshtml")) {
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
     * @signature function(domEvent, target)
     * @param domEvent {Event} DOM event
     * @param target {Element} Event target
     * @return {Object} The Touch mock object
     */
    __createTouchObject : qx.core.Variant.select("qx.mobile",
    {
      "on" : function(domEvent, target)
      {
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
     *
     * @signature function()
     * @return {void}
     */
    _initTouchObserver : function()
    {
      this.__onTouchEventWrapper = qx.lang.Function.listener(this._onTouchEvent, this);

      var Event = qx.bom.Event;

      Event.addNativeListener(this.__root, "touchstart", this.__onTouchEventWrapper);
      Event.addNativeListener(this.__root, "touchmove", this.__onTouchEventWrapper);
      Event.addNativeListener(this.__root, "touchend", this.__onTouchEventWrapper);
      Event.addNativeListener(this.__root, "touchcancel", this.__onTouchEventWrapper);

      if (qx.core.Variant.isSet("qx.mobile", "on"))
      {
        if (!qx.bom.client.Feature.TOUCH)
        {
          Event.addNativeListener(this.__root, "mousedown", this.__onTouchEventWrapper);
          Event.addNativeListener(this.__root, "mousemove", this.__onTouchEventWrapper);
          Event.addNativeListener(this.__root, "mouseup", this.__onTouchEventWrapper);
        }
      }
    },


    /*
    ---------------------------------------------------------------------------
      OBSERVER STOP
    ---------------------------------------------------------------------------
    */

    /**
     * Disconnects the native touch event listeners.
     *
     * @signature function()
     * @return {void}
     */
    _stopTouchObserver : function()
    {
      var Event = qx.bom.Event;

      Event.removeNativeListener(this.__root, "touchstart", this.__onTouchEventWrapper);
      Event.removeNativeListener(this.__root, "touchmove", this.__onTouchEventWrapper);
      Event.removeNativeListener(this.__root, "touchend", this.__onTouchEventWrapper);
      Event.removeNativeListener(this.__root, "touchcancel", this.__onTouchEventWrapper);

      if (qx.core.Variant.isSet("qx.mobile", "on"))
      {
        if (!qx.bom.client.Feature.TOUCH)
        {
          Event.removeNativeListener(this.__root, "mousedown", this.__onTouchEventWrapper);
          Event.removeNativeListener(this.__root, "mousemove", this.__onTouchEventWrapper);
          Event.removeNativeListener(this.__root, "mouseup", this.__onTouchEventWrapper);
        }
      }
    },


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
    _onTouchEvent : qx.event.GlobalError.observeMethod(function(domEvent) {
      this.__fireEvent(domEvent, domEvent.type);
    })
  },


  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    this._stopTouchObserver();

    this.__manager = this.__window = this.__root = null;
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
    if (qx.bom.client.Feature.TOUCH) {
      document.addEventListener("touchmove", function(e) {
        e.preventDefault();
      });
    }
  }
});