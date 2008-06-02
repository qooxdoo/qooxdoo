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

************************************************************************ */

/* ************************************************************************

#require(qx.event.handler.UserAction)

************************************************************************ */

/**
 * This class provides a unified mouse event handler for Internet Explorer,
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
   * @type constructor
   * @param manager {qx.event.Manager} Event manager for the window to use
   */
  construct : function(manager)
  {
    this.base(arguments);

    // Define shorthands
    this._manager = manager;
    this._window = manager.getWindow();
    this._root = this._window.document.documentElement;

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
    PRIORITY : qx.event.Registration.PRIORITY_NORMAL
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
      return target.nodeType !== undefined && this.__mouseEvents[type];
    },


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

    /** {Map} Internal data structure with all supported mouse events */
    __mouseEvents :
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


    /**
     * Fire a mouse event with the given parameters
     *
     * @param domEvent {Event} DOM event
     * @param type {String} type og the event
     * @param target {Element} event target
     */
    __fireEvent : function(domEvent, type, target)
    {
      if (!target) {
        target = domEvent.target || domEvent.srcElement;
      }

      qx.event.Registration.fireEvent(
        target,
        type||domEvent.type,
        qx.event.type.Mouse,
        [domEvent, target, null, true, true]
      );

      // Fire user action event
      qx.event.Registration.fireEvent(this._window, "useraction");
    },






    /*
    ---------------------------------------------------------------------------
      OBSERVER INIT
    ---------------------------------------------------------------------------
    */

    /**
     * Initializes the native mouse button event listeners.
     *
     * @type member
     * @signature function()
     * @return {void}
     */
    _initButtonObserver : function()
    {
      this._onButtonEventWrapper = qx.lang.Function.listener(this._onButtonEvent, this);

      var Event = qx.bom.Event;

      Event.addNativeListener(this._root, "mousedown", this._onButtonEventWrapper);
      Event.addNativeListener(this._root, "mouseup", this._onButtonEventWrapper);
      Event.addNativeListener(this._root, "click", this._onButtonEventWrapper);
      Event.addNativeListener(this._root, "dblclick", this._onButtonEventWrapper);
      Event.addNativeListener(this._root, "contextmenu", this._onButtonEventWrapper);
    },


    /**
     * Initializes the native mouse move event listeners.
     *
     * @type member
     * @signature function()
     * @return {void}
     */
    _initMoveObserver : function()
    {
      this._onMoveEventWrapper = qx.lang.Function.listener(this._onMoveEvent, this);

      var Event = qx.bom.Event;

      Event.addNativeListener(this._root, "mousemove", this._onMoveEventWrapper);
      Event.addNativeListener(this._root, "mouseover", this._onMoveEventWrapper);
      Event.addNativeListener(this._root, "mouseout", this._onMoveEventWrapper);
    },


    /**
     * Initializes the native mouse wheel event listeners.
     *
     * @type member
     * @signature function()
     * @return {void}
     */
    _initWheelObserver : function()
    {
      this._onWheelEventWrapper = qx.lang.Function.listener(this._onWheelEvent, this);

      var Event = qx.bom.Event;
      var type = qx.core.Variant.isSet("qx.client", "mshtml|webkit|opera") ? "mousewheel" : "DOMMouseScroll";

      Event.addNativeListener(this._root, type, this._onWheelEventWrapper);
    },






    /*
    ---------------------------------------------------------------------------
      OBSERVER STOP
    ---------------------------------------------------------------------------
    */

    /**
     * Disconnects the native mouse button event listeners.
     *
     * @type member
     * @signature function()
     * @return {void}
     */
    _stopButtonObserver : function()
    {
      var Event = qx.bom.Event;

      Event.removeNativeListener(this._root, "mousedown", this._onButtonEventWrapper);
      Event.removeNativeListener(this._root, "mouseup", this._onButtonEventWrapper);
      Event.removeNativeListener(this._root, "click", this._onButtonEventWrapper);
      Event.removeNativeListener(this._root, "dblclick", this._onButtonEventWrapper);
      Event.removeNativeListener(this._root, "contextmenu", this._onButtonEventWrapper);
    },


    /**
     * Disconnects the native mouse move event listeners.
     *
     * @type member
     * @signature function()
     * @return {void}
     */
    _stopMoveObserver : function()
    {
      var Event = qx.bom.Event;

      Event.removeNativeListener(this._root, "mousemove", this._onMoveEventWrapper);
      Event.removeNativeListener(this._root, "mouseover", this._onMoveEventWrapper);
      Event.removeNativeListener(this._root, "mouseout", this._onMoveEventWrapper);
    },


    /**
     * Disconnects the native mouse wheel event listeners.
     *
     * @type member
     * @signature function()
     * @return {void}
     */
    _stopWheelObserver : function()
    {
      var Event = qx.bom.Event;
      var type = qx.core.Variant.isSet("qx.client", "mshtml|webkit|opera") ? "mousewheel" : "DOMMouseScroll";

      Event.removeNativeListener(this._root, type, this._onWheelEventWrapper);
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
     * @type member
     * @param domEvent {Event} DOM event
     */
    _onMoveEvent : function(domEvent) {
      this.__fireEvent(domEvent);
    },


    /**
     * Global handler for all mouse button related events like "mouseup",
     * "mousedown", "click", "dblclick" and "contextmenu".
     *
     * @type member
     * @param domEvent {Event} DOM event
     */
    _onButtonEvent : function(domEvent)
    {
      var type = domEvent.type;
      var target = domEvent.target || domEvent.srcElement;

      // Safari (and maybe gecko) takes text nodes as targets for events
      // See: http://www.nczonline.net/archive/2008/2/556
      if (qx.core.Variant.isSet("qx.client", "gecko|webkit"))
      {
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

      this._lastEventType = type;
    },


    /**
     * Global handler for the mouse wheel event.
     *
     * @type member
     * @param domEvent {Event} DOM event
     */
    _onWheelEvent : function(domEvent) {
      this.__fireEvent(domEvent, "mousewheel");
    },







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
     * @param target {Elment} event target of the DOM event.
     *
     * @signature function(domEvent, type, target)
     */
    __rightClickFixPre : qx.core.Variant.select("qx.client",
    {
      "webkit" : function(domEvent, type, target)
      {
        if (type == "contextmenu")
        {
          this.__fireEvent(domEvent, "mousedown", target);
          this.__fireEvent(domEvent, "mouseup", target);
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
     * @param target {Elment} event target of the DOM event.
     *
     * @signature function(domEvent, type, target)
     */
    __rightClickFixPost : qx.core.Variant.select("qx.client",
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
     * @param domEvent {Event} original DOM event
     * @param type {String} event type
     * @param target {Elment} event target of the DOM event.
     *
     * @signature function(domEvent, type, target)
     */
    __doubleClickFixPre : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(domEvent, type, target)
      {
        if (type == "mouseup" && this._lastEventType == "click") {
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
     * @param target {Elment} event target of the DOM event.
     *
     * @signature function(domEvent, type, target)
     */
    __differentTargetClickFixPost : qx.core.Variant.select("qx.client",
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
              commonParent = qx.dom.Hierarchy.getCommonParent(target, this.__lastMouseDownTarget);
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

    this._disposeFields("_manager", "_window", "_root");
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
