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

#require(qx.event.handler.UserAction)

************************************************************************ */

/**
 * This class provides an unified mouse event handler for Internet Explorer,
 * Firefox, Opera and Safari
 */
qx.Class.define("qx.event.handler.Mouse",
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
    this._initButtonObserver();
    this._initMoveObserver();
    this._initWheelObserver();
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
      mousemove : 1,
      mouseover : 1,
      mouseout : 1,
      mousedown : 1,
      mouseup : 1,
      click : 1,
      dblclick : 1,
      contextmenu : 1,
      mousewheel : 1
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
    __onButtonEventWrapper : null,
    __onMoveEventWrapper : null,
    __onWheelEventWrapper : null,
    __lastEventType : null,
    __lastMouseDownTarget : null,
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
    // The iPhone requires for attaching mouse events natively to every element which
    // should react on mouse events. As of version 3.0 it also requires to keep the
    // listeners as long as the event should work. In 2.0 it was enough to attach the
    // listener once.
    registerEvent : qx.core.Environment.get("os.name") === "ios" ?
      function(target, type, capture) {
        target["on" + type] = qx.lang.Function.returnNull;
      } : qx.lang.Function.returnNull,


    // interface implementation
    unregisterEvent : qx.core.Environment.get("os.name") === "ios" ?
      function(target, type, capture) {
        target["on" + type] = undefined;
      } : qx.lang.Function.returnNull,




    /*
    ---------------------------------------------------------------------------
      HELPER
    ---------------------------------------------------------------------------
    */


    /**
     * Fire a mouse event with the given parameters
     *
     * @param domEvent {Event} DOM event
     * @param type {String} type of the event
     * @param target {Element} event target
     */
    __fireEvent : function(domEvent, type, target)
    {
      if (!target) {
        target = qx.bom.Event.getTarget(domEvent);
      }

      // we need a true node for the fireEvent
      // e.g. when hovering over text of disabled textfields IE is returning
      // an empty object as "srcElement"
      if (target && target.nodeType)
      {
        qx.event.Registration.fireEvent(
          target,
          type||domEvent.type,
          type == "mousewheel" ? qx.event.type.MouseWheel : qx.event.type.Mouse,
          [domEvent, target, null, true, true]
        );
      }

      // Fire user action event
      qx.event.Registration.fireEvent(this.__window, "useraction", qx.event.type.Data, [type||domEvent.type]);
    },


    /**
     * Internal target for checking the target and mouse type for mouse
     * scrolling on a feature detection base.
     *
     * @return {Map} A map containing two keys, target and type.
     */
    __getMouseWheelTarget: function(){
      // Fix for bug #3234
      var targets = [this.__window, this.__root, this.__root.body];
      var target = this.__window;
      var type = "DOMMouseScroll";

      for (var i = 0; i < targets.length; i++) {
        if (qx.bom.Event.supportsEvent(targets[i], "mousewheel")) {
          type = "mousewheel";
          target = targets[i];
          break;
        }
      };

      return {type: type, target: target};
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
     * @return {void}
     */
    _initButtonObserver : function()
    {
      this.__onButtonEventWrapper = qx.lang.Function.listener(this._onButtonEvent, this);

      var Event = qx.bom.Event;

      Event.addNativeListener(this.__root, "mousedown", this.__onButtonEventWrapper);
      Event.addNativeListener(this.__root, "mouseup", this.__onButtonEventWrapper);
      Event.addNativeListener(this.__root, "click", this.__onButtonEventWrapper);
      Event.addNativeListener(this.__root, "dblclick", this.__onButtonEventWrapper);
      Event.addNativeListener(this.__root, "contextmenu", this.__onButtonEventWrapper);
    },


    /**
     * Initializes the native mouse move event listeners.
     *
     * @signature function()
     * @return {void}
     */
    _initMoveObserver : function()
    {
      this.__onMoveEventWrapper = qx.lang.Function.listener(this._onMoveEvent, this);

      var Event = qx.bom.Event;

      Event.addNativeListener(this.__root, "mousemove", this.__onMoveEventWrapper);
      Event.addNativeListener(this.__root, "mouseover", this.__onMoveEventWrapper);
      Event.addNativeListener(this.__root, "mouseout", this.__onMoveEventWrapper);
    },


    /**
     * Initializes the native mouse wheel event listeners.
     *
     * @signature function()
     * @return {void}
     */
    _initWheelObserver : function()
    {
      this.__onWheelEventWrapper = qx.lang.Function.listener(this._onWheelEvent, this);
      var data = this.__getMouseWheelTarget();
      qx.bom.Event.addNativeListener(
        data.target, data.type, this.__onWheelEventWrapper
      );
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
     * @return {void}
     */
    _stopButtonObserver : function()
    {
      var Event = qx.bom.Event;

      Event.removeNativeListener(this.__root, "mousedown", this.__onButtonEventWrapper);
      Event.removeNativeListener(this.__root, "mouseup", this.__onButtonEventWrapper);
      Event.removeNativeListener(this.__root, "click", this.__onButtonEventWrapper);
      Event.removeNativeListener(this.__root, "dblclick", this.__onButtonEventWrapper);
      Event.removeNativeListener(this.__root, "contextmenu", this.__onButtonEventWrapper);
    },


    /**
     * Disconnects the native mouse move event listeners.
     *
     * @signature function()
     * @return {void}
     */
    _stopMoveObserver : function()
    {
      var Event = qx.bom.Event;

      Event.removeNativeListener(this.__root, "mousemove", this.__onMoveEventWrapper);
      Event.removeNativeListener(this.__root, "mouseover", this.__onMoveEventWrapper);
      Event.removeNativeListener(this.__root, "mouseout", this.__onMoveEventWrapper);
    },


    /**
     * Disconnects the native mouse wheel event listeners.
     *
     * @signature function()
     * @return {void}
     */
    _stopWheelObserver : function()
    {
      var data = this.__getMouseWheelTarget();
      qx.bom.Event.removeNativeListener(
        data.target, data.type, this.__onWheelEventWrapper
      );
    },






    /*
    ---------------------------------------------------------------------------
      NATIVE EVENT OBSERVERS
    ---------------------------------------------------------------------------
    */

    /**
     * Global handler for all mouse move related events like "mousemove",
     * "mouseout" and "mouseover".
     *
     * @signature function(domEvent)
     * @param domEvent {Event} DOM event
     */
    _onMoveEvent : qx.event.GlobalError.observeMethod(function(domEvent) {
      this.__fireEvent(domEvent);
    }),


    /**
     * Global handler for all mouse button related events like "mouseup",
     * "mousedown", "click", "dblclick" and "contextmenu".
     *
     * @signature function(domEvent)
     * @param domEvent {Event} DOM event
     */
    _onButtonEvent : qx.event.GlobalError.observeMethod(function(domEvent)
    {
      var type = domEvent.type;
      var target = qx.bom.Event.getTarget(domEvent);

      // Safari (and maybe gecko) takes text nodes as targets for events
      // See: http://www.quirksmode.org/js/events_properties.html
      if (
        qx.core.Environment.get("engine.name") == "gecko" ||
        qx.core.Environment.get("engine.name") == "webkit"
      ) {
        if (target && target.nodeType == 3) {
          target = target.parentNode;
        }
      }

      if (this.__rightClickFixPre) {
        this.__rightClickFixPre(domEvent, type, target);
      }

      if (this.__doubleClickFixPre) {
        this.__doubleClickFixPre(domEvent, type, target);
      }

      this.__fireEvent(domEvent, type, target);

      if (this.__rightClickFixPost) {
        this.__rightClickFixPost(domEvent, type, target);
      }

      if (this.__differentTargetClickFixPost) {
        this.__differentTargetClickFixPost(domEvent, type, target);
      }

      this.__lastEventType = type;
    }),


    /**
     * Global handler for the mouse wheel event.
     *
     * @signature function(domEvent)
     * @param domEvent {Event} DOM event
     */
    _onWheelEvent : qx.event.GlobalError.observeMethod(function(domEvent) {
      this.__fireEvent(domEvent, "mousewheel");
    }),







    /*
    ---------------------------------------------------------------------------
      CROSS BROWSER SUPPORT FIXES
    ---------------------------------------------------------------------------
    */

    /**
     * Normalizes the click sequence of right click events in Webkit and Opera.
     * The normalized sequence is:
     *
     *  1. mousedown  <- not fired by Webkit
     *  2. mouseup  <- not fired by Webkit
     *  3. contextmenu <- not fired by Opera
     *
     * @param domEvent {Event} original DOM event
     * @param type {String} event type
     * @param target {Element} event target of the DOM event.
     *
     * @signature function(domEvent, type, target)
     */
    __rightClickFixPre : qx.core.Environment.select("engine.name",
    {
      "webkit" : function(domEvent, type, target)
      {
        // The webkit bug has been fixed in Safari 4
        if (parseFloat(qx.core.Environment.get("engine.version")) < 530)
        {
          if (type == "contextmenu") {
            this.__fireEvent(domEvent, "mouseup", target);
          }
        }
      },

      "default" : null
    }),


    /**
     * Normalizes the click sequence of right click events in Webkit and Opera.
     * The normalized sequence is:
     *
     *  1. mousedown  <- not fired by Webkit
     *  2. mouseup  <- not fired by Webkit
     *  3. contextmenu <- not fired by Opera
     *
     * TODO: Just curious. Where is the webkit version? is the
     * documentation up-to-date?
     *
     * @param domEvent {Event} original DOM event
     * @param type {String} event type
     * @param target {Element} event target of the DOM event.
     *
     * @signature function(domEvent, type, target)
     */
    __rightClickFixPost : qx.core.Environment.select("engine.name",
    {
      "opera" : function(domEvent, type, target)
      {
        if (type =="mouseup" && domEvent.button == 2) {
          this.__fireEvent(domEvent, "contextmenu", target);
        }
      },

      "default" : null
    }),


    /**
     * Normalizes the click sequence of double click event in the Internet
     * Explorer. The normalized sequence is:
     *
     *  1. mousedown
     *  2. mouseup
     *  3. click
     *  4. mousedown  <- not fired by IE
     *  5. mouseup
     *  6. click  <- not fired by IE
     *  7. dblclick
     *
     *  Note: This fix is only applied, when the IE event model is used, otherwise
     *  the fix is ignored.
     *
     * @param domEvent {Event} original DOM event
     * @param type {String} event type
     * @param target {Element} event target of the DOM event.
     *
     * @signature function(domEvent, type, target)
     */
    __doubleClickFixPre : qx.core.Environment.select("engine.name",
    {
      "mshtml" : function(domEvent, type, target)
      {
        // Do only apply the fix when the event is from the IE event model,
        // otherwise do not apply the fix.
        if (domEvent.target !== undefined) {
          return;
        }

        if (type == "mouseup" && this.__lastEventType == "click") {
          this.__fireEvent(domEvent, "mousedown", target);
        } else if (type == "dblclick") {
          this.__fireEvent(domEvent, "click", target);
        }
      },

      "default" : null
    }),


    /**
     * If the mouseup event happens on a different target than the corresponding
     * mousedown event the internet explorer dispatches a click event on the
     * first common ancestor of both targets. The presence of this click event
     * is essential for the qooxdoo widget system. All other browsers don't fire
     * the click event so it must be emulated.
     *
     * @param domEvent {Event} original DOM event
     * @param type {String} event type
     * @param target {Element} event target of the DOM event.
     *
     * @signature function(domEvent, type, target)
     */
    __differentTargetClickFixPost : qx.core.Environment.select("engine.name",
    {
      "mshtml" : null,

      "default" : function(domEvent, type, target)
      {
        switch (type)
        {
          case "mousedown":
            this.__lastMouseDownTarget = target;
            break;

          case "mouseup":
            if (target !== this.__lastMouseDownTarget)
            {
              var commonParent = qx.dom.Hierarchy.getCommonParent(target, this.__lastMouseDownTarget);
              this.__fireEvent(domEvent, "click", commonParent);
            }
        }
      }
    })
  },





  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    this._stopButtonObserver();
    this._stopMoveObserver();
    this._stopWheelObserver();

    this.__manager = this.__window = this.__root =
      this.__lastMouseDownTarget = null;
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
