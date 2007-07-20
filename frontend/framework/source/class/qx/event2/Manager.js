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

************************************************************************ */

/* ************************************************************************

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
 *   <li>Support for document.activeElement like functionality (IE's focus model)
 *       http://msdn2.microsoft.com/en-us/library/ms533065.aspx
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
qx.Class.define("qx.event2.Manager",
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
    this._window = win;

    this.__eventHandlers = [
      new qx.event2.handler.KeyEventHandler(this.dispatchEvent, this),
      new qx.event2.handler.MouseEventHandler(this.dispatchEvent, this),
      new qx.event2.handler.DefaultEventHandler(this.dispatchEvent, this) // must be the last because it can handle all events
    ];

    // event manager for inline events
    this.__inlineEventManager = new qx.event2.InlineEventManager(this);

    // event manager for bubbling events
    this.__documentEventManager = new qx.event2.DocumentEventManager(this);

    this.addListener(win, "unload", this.__onunload, this);

    // create mouse capture handler for this window
    this._captureHandler = new qx.event2.handler.MouseCaptureHandler(this, this.__documentEventManager);
  },






  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {

    __managers : {},

    getManager : function(element)
    {
      // get the corresponding default view (window)
      if (qx.html2.element.Node.isWindow(element)) {
        var win = element;
      } else {
        var win = qx.html2.element.Node.getDefaultView(element);
      }
      var id = qx.core.Object.toHashCode(win);

      var manager = this.__managers[id];
      if (!manager)
      {
        manager = new qx.event2.Manager(win);
        this.__managers[id] = manager;
      }
      return manager;
    },


    /**
     * Add an event listener to a DOM element. The event listener is passed an
     * instance of {@link Event} containing all relevant information
     * about the event as parameter.
     *
     * @type static
     * @param element {Element} DOM element to attach the event on.
     * @param type {String} Name of the event e.g. "click", "keydown", ...
     * @param listener {Function} Event listener function
     * @param self {Object ? window} Reference to the 'this' variable inside
     *       the event listener.
     * @param useCapture {Boolean ? false} Whether to attach the event to the
     *       capturing phase of the bubbling phase of the event. The default is
     *       to attach the event handler to the bubbling phase.
     */
    addListener : function(element, type, listener, self, useCapture) {
      this.getManager(element).addListener(element, type, listener, self, useCapture);
    },


    /**
     * Remove an event listener from a from DOM node.
     *
     * @type static
     * @param element {Element} DOM Element
     * @param type {String} Name of the event
     * @param listener {Function} The pointer to the event listener
     * @param useCapture {Boolean ? false} Whether to remove the event listener of
     *       the bubbling or of the capturing phase.
     */
    removeListener : function(element, type, listener, useCapture) {
      this.getManager(element).removeListener(element, type, listener, useCapture);
    },


    /**
     * Use the low level browser functionality to attach event listeners
     * to DOM nodes. Uses <code>attachEvent</code> in IE and
     * <code>addEventListener</code> in all oother browsers.
     *
     * @type static
     * @param vElement {Element} DOM Element
     * @param vType {String} Name of the event
     * @param vFunction {Function} The pointer to the function to assign
     * @signature function(vElement, vType, vFunction)
     */
    addNativeListener : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(vElement, vType, vFunction) {
        vElement.attachEvent("on" + vType, vFunction);
      },

      "default" : function(vElement, vType, vFunction) {
        vElement.addEventListener(vType, vFunction, false);
      }
    }),


    /**
     * Use the low level browser functionality to remove event listeners
     * from DOM nodes. Uses <code>detachEvent</code> in IE and
     * <code>removeEventListener</code> in all oother browsers.
     *
     * @type static
     * @param vElement {Element} DOM Element
     * @param vType {String} Name of the event
     * @param vFunction {Function} The pointer to the function to assign
     * @signature function(vElement, vType, vFunction)
     */
    removeNativeListener : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(vElement, vType, vFunction) {
        vElement.detachEvent("on" + vType, vFunction);
      },

      "default" : function(vElement, vType, vFunction) {
        vElement.removeEventListener(vType, vFunction, false);
      }
    }),


    /**
     * Get the DOM element which currently has the focus. Keyborad events are
     * dispatched on this element by the browser. This function does only return
     * the active element of the current document. It will not return the active
     * element inside a sub documents (i.g. an IFrame).
     *
     * @return {Element} The current active element.
     */
    getActiveElement : function() {
      return this.getManager(window).getActiveElement();
    }
  },







  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    // Events, which don't bubble
    __inlineEvents :
    {
      abort                       : 1,
      afterprint                  : 1,  // IE
      beforeprint                 : 1,  // IE
      beforeunload                : 1,
      blur                        : 1,
      change                      : 1,
      dragdrop                    : 1,
      DOMNodeInsertedIntoDocument : 1,  // DOM2
      DOMNodeRemovedFromDocument  : 1,  // DOM2
      error                       : 1,
      focus                       : 1,
      formchange                  : 1,  // Opera (Webforms 2)
      forminput                   : 1,  // Opera (Webforms 2)
      load                        : 1,
      losecapture                 : 1,  // IE
      mouseenter                  : 1,  // IE
      mouseleave                  : 1,  // IE
      mousewheel                  : 1,  // IE
      propertychange              : 1,  // IE
      readystatechange            : 1,
      reset                       : 1,
      scroll                      : 1,
      select                      : 1,
      selectionchange             : 1,  // IE
      selectstart                 : 1,  // IE
      stop                        : 1,  // IE
      submit                      : 1,
      unload                      : 1,
      losecapture                 : 1   // emulated
    },


    // Normalization of event names
    __eventNames :
    {
      // TODO: More event names?
      "mousewheel" : qx.core.Variant.isSet("qx.client", "mshtml") ? "mousewheel" : "DOMMouseScroll",
      "focusin" : qx.core.Variant.isSet("qx.client", "mshtml") ? "focusin" : "DOMFocusIn",
      "focusout" : qx.core.Variant.isSet("qx.client", "mshtml") ? "focusout" : "DOMFocusOut"
    },


    /*
    ---------------------------------------------------------------------------
      ADD EVENT LISTENER
    ---------------------------------------------------------------------------
    */

    /**
     * Add an event listener to a DOM element. The event listener is passed an
     * instance of {@link Event} containing all relevant information
     * about the event as parameter.
     *
     * @type member
     * @param element {Element} DOM element to attach the event on.
     * @param type {String} Name of the event e.g. "click", "keydown", ...
     * @param listener {Function} Event listener function
     * @param self {Object ? window} Reference to the 'this' variable inside
     *       the event listener.
     * @param useCapture {Boolean ? false} Whether to attach the event to the
     *       capturing phase of the bubbling phase of the event. The default is
     *       to attach the event handler to the bubbling phase.
     */
    addListener : function(element, type, listener, self, useCapture)
    {
      // normalize event name
      var type = this.__eventNames[type] || type;

      // attach event listener
      if (this.__inlineEvents[type])
      {
        if (useCapture) {
          throw new Error("The event '" + type + "' does not bubble, so capturing is also not supported!");
        }

        this.__inlineEventManager.addListener(element, type, listener, self);
      }
      else
      {
        this.__documentEventManager.addListener(element, type, listener, self, useCapture);
      }
    },


    /*
    ---------------------------------------------------------------------------
      REMOVE EVENT LISTENER
    ---------------------------------------------------------------------------
    */

    /**
     * Remove an event listener from a from DOM node.
     *
     * @type member
     * @param element {Element} DOM Element
     * @param type {String} Name of the event
     * @param listener {Function} The pointer to the event listener
     * @param useCapture {Boolean ? false} Whether to remove the event listener of
     *       the bubbling or of the capturing phase.
     * @return {var} TODOC
     */
    removeListener : function(element, type, listener, useCapture)
    {
      var type = this.__eventNames[type] || type;
      if (this.__inlineEvents[type]) {
        return this.__inlineEventManager.removeListener(element, type, listener);
      } else {
        return this.__documentEventManager.removeListener(element, type, listener, useCapture);
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
     * {@link #addListener}.
     *
     * @param event {qx.event2.type.Event} qooxdoo event object
     */
    dispatchEvent : function(event)
    {
      var type = this.__eventNames[type] || type;
      if (this.__inlineEvents[event.getType()]) {
        return this.__inlineEventManager.dispatchEvent(event);
      } else {
        return this.__documentEventManager.dispatchEvent(event);
      }
    },



    /*
    ---------------------------------------------------------------------------
      MOUSE CAPTURE
    ---------------------------------------------------------------------------
    */

    /**
     * Get the capture handler for the element.
     *
     * @param element {Element} DOM element
     * @return {qx.event2.handler.MouseCaptureHandler} the mouse capture handler
     *     reponsible for the given element.
     */
    getCaptureHandler : function()
    {
      return this._captureHandler;
    },


    /**
     * Set the mouse capture to the given DOM element. While capturing is active
     * all mouse event will be dispatched on this element. This is e.g. useful for
     * drag and drop. Capturing will be stopped if one of the following actions
     * occur:
     *
     * <ul>
     *   <li>{@link #relaseCapture} is called</li>
     *   <li>the browser window looses focus</li>
     *   <li>any click event</li>
     * <ul>
     * When the element loses the capture the event <code>losecapture</code>
     * will be dispatched on the element.
     * @param element {Element} DOM element to set for capturing
     */
    setCapture : function(element) {
      this.getCaptureHandler().setCapture(element);
    },


    /**
     * Stop event capturing on the given DOM document. By default the current
     * document is used.
     *
     * @param doc {Document?window.document} DOM document
     */
    releaseCapture : function(doc) {
      this.getCaptureHandler().releaseCapture();
    },


    getWindow : function() {
      return this._window;
    },


    /**
     * This method is called each time the an event listener for one of the
     * supported events is added using {qx.event2.Manager#addListener}.
     *
     * @param type {String} event type
     */
    registerEventAtHandler : function(element, type) {
      // iterate over all event handlers and check whether they are responsible
      // for this event type
      for (var i=0; i<this.__eventHandlers.length; i++)
      {
        if (this.__eventHandlers[i].canHandleEvent(type))
        {
          this.__eventHandlers[i].registerEvent(element, type);
          break;
        }
      }
    },


    /**
     * This method is called each time the an event listener for one of the
     * supported events is removed by using {qx.event2.Manager#removeListener}
     * and no other event listener is listening on this type.
     *
     * @param type {String} event type
     */
    unregisterEventAtHandler : function(element, type)
    {
      for (var i=0; i<this.__eventHandlers.length; i++) {
        this.__eventHandlers[i].unregisterEvent(this._documentElement, type);
      }
    },


    /**
     * Removes all event handlers handles by the class from the DOM. This
     * function is called onunload of the the document.
     */
    removeAllListeners : function(doc)
    {
      for (var i=0; i<this.__eventHandlers.length; i++) {
        this.__eventHandlers[i].removeAllListeners();
      }
    },


    /**
     * Unload handler for each window with event listeners attached. Removes
     * all event listeners from the unloading window.
     *
     * @param winId {var} hash code of the unloading window
     * @param domEvent {Event} DOM event object
     */
    __onunload : function(domEvent) {
      this.removeAllListeners();
    },

  },



  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    this.removeAllListeners();

    for (var i=0, a=this.__eventHandlers, l=a.length; i<l; i++) {
      this.__eventHandlers[i].dispose();
    }

    this._disposeObjects(
      "__documentEventManager",
      "__inlineEventManager"
    );
  }

});