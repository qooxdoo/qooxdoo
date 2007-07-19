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

/**
 * Event manager for all bubbling events. All event handler will be attached to
 * the documentElement.
 *
 * @internal
 */
qx.Class.define("qx.event2.DocumentEventManager", {

  extend : qx.core.Object,



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * Creates a new instance of the event handler.
   */
  construct : function()
  {
    this.__eventHandlers = [
      new qx.event2.handler.KeyEventHandler(this.dispatchEvent, this),
      new qx.event2.handler.MouseEventHandler(this.dispatchEvent, this),
      new qx.event2.handler.DefaultEventHandler(this.dispatchEvent, this) // must be the last because it can handle all events
    ],

    // registry for 'normal' bubbling events
    // structure: documentId -> eventType -> elementId
    this.__documentRegistry = {};

    // maps elementIDs to DOM elements
    this.__elementRegistry = new qx.util.manager.Object();
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
      ADD EVENT LISTENER
    ---------------------------------------------------------------------------
    */

    /**
     * Handles adding of event listeners of bubbling events by attaching the
     * event handler to the <code>documentElement</code>.
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
      var reg = this.__documentRegistry;
      var documentElement = qx.html2.element.Node.getDocument(element).documentElement;
      var documentId = qx.core.Object.toHashCode(documentElement);

      // create registry for this document
      if (!reg[documentId]) {
        reg[documentId] = {};
        this.__elementRegistry.add(documentElement);
      }
      var docData = reg[documentId];

      // create registry for this event type
      if (!docData[type])
      {
        docData[type] = {};

        // iterate over all event handlers and check whether they are responsible
        // for this event type
        for (var i=0; i<this.__eventHandlers.length; i++)
        {
          if (this.__eventHandlers[i].canHandleEvent(type))
          {
            this.__eventHandlers[i].registerEvent(documentElement, type);
            break;
          }
        }
      }

      var elementId = qx.core.Object.toHashCode(element);
      var typeEvents = docData[type];

      if (!typeEvents[elementId])
      {
        typeEvents[elementId] =
        {
          bubbleListeners  : [],
          captureListeners : []
        };
      }

      // bind the listener to the object
      if (self) {
        var callback = qx.lang.Function.bind(listener, self);
      } else {
        callback = listener;
      }

      callback.$$original = listener;

      // store event listener
      var eventData = typeEvents[elementId];
      var listenerList = useCapture ? "captureListeners" : "bubbleListeners";
      eventData[listenerList].push(callback);
    },


    /*
    ---------------------------------------------------------------------------
      REMOVE EVENT LISTENER
    ---------------------------------------------------------------------------
    */

    /**
     * Handles removal of bubbling events.
     *
     * @type member
     * @param element {Element} DOM Element
     * @param type {String} Name of the event
     * @param listener {Function} The pointer to the event listener
     * @param useCapture {Boolean ? false} Whether to remove the event listener of
     *       the bubbling or of the capturing phase.
     * @return {void}
     */
    removeListener : function(element, type, listener, useCapture)
    {
      var documentElement = qx.html2.element.Node.getDocument(element).documentElement;

      // get data for this event type
      var typeData = this.getTypeData(element, type);

      // get registry entry for this element
      var elementId = qx.core.Object.toHashCode(element);
      if (!typeData || !typeData[elementId]) {
        return;
      }
      var eventData = typeData[elementId];

      var listenerList = useCapture ? "captureListeners" : "bubbleListeners";
      var listeners = eventData[listenerList];

      var removeIndex = -1;

      for (var i=0; i<listeners.length; i++)
      {
        if (listeners[i].$$original == listener)
        {
          removeIndex = i;
          break;
        }
      }

      if (removeIndex != -1)
      {
        qx.lang.Array.removeAt(listeners, removeIndex);

        if (eventData.captureListeners.length == 0 && eventData.bubbleListeners.length == 0)
        {
          delete (typeData[type]);

          for (var i=0; i<this.__eventHandlers.length; i++) {
            this.__eventHandlers[i].unregisterEvent(documentElement, type);
          }
        }
      }
    },


    /*
    ---------------------------------------------------------------------------
      EVENT DISPATCH
    ---------------------------------------------------------------------------
    */

    /**
     * This function dispatches the event to the event handlers and emulates
     * the capturing and bubbling phase.
     *
     * @type member
     * @param event {qx.event2.type.Event} event object to dispatch
     */
    dispatchEvent : function(event)
    {
      var target = event.getTarget();
      var node = target;

      var mouseCapture = qx.event2.handler.MouseCaptureHandler.getCaptureHandler(node);
      if (mouseCapture.shouldCaptureEvent(event)) {
        mouseCapture.doCaptureEvent(event);
        return;
      }

      var reg = this.getTypeData(node, event.getType());
      if (reg == undefined) {
        return;
      }

      var bubbleList = [];
      var bubbleTargets = [];

      var captureList = [];
      var captureTargets = [];

      // Walk up the tree and look for event listeners
      while (node != null)
      {
        var elementId = qx.core.Object.toHashCode(node);
        var eventData = reg[elementId];

        if (eventData !== undefined)
        {
          if (eventData.captureListeners && node !== target)
          {
            captureList.push(qx.lang.Array.copy(eventData.captureListeners));
            captureTargets.push(node);
          }

          if (eventData.bubbleListeners)
          {
            bubbleList.push(qx.lang.Array.copy(eventData.bubbleListeners));
            bubbleTargets.push(node);
          }
        }

        try {
          node = node.parentNode;
        } catch(vDomEvent) {
          node = null;
        }
      }

      // capturing phase
      event.setEventPhase(qx.event2.type.Event.CAPTURING_PHASE);

      for (var i=(captureList.length-1); i>=0; i--)
      {
        event.setCurrentTarget(captureTargets[i]);

        for (var j=0; j<captureList[i].length; j++) {
          captureList[i][j](event);
        }

        if (event.getStopPropagation()) {
          return;
        }
      }

      // bubbling phase
      for (var i=0; i<bubbleList.length; i++)
      {
        event.setCurrentTarget(bubbleTargets[i]);

        if (bubbleTargets[i] == target) {
          event.setEventPhase(qx.event2.type.Event.AT_TARGET);
        } else {
          event.setEventPhase(qx.event2.type.Event.BUBBLING_PHASE);
        }

        for (var j=0; j<bubbleList[i].length; j++) {
          bubbleList[i][j](event);
        }

        if (event.getStopPropagation()) {
          return;
        }
      }
    },


    /*
    ---------------------------------------------------------------------------
      CLEANUP
    ---------------------------------------------------------------------------
    */

    /**
     * Removes all event handlers handles by the class from the DOM of the given
     * DOM document. This function is called onunload of the the document.
     *
     * @param documentElement {Element} The DOM documentelement of the document
     *     to remove the listeners from.
     */
    removeAllListenersFromDocument : function(doc)
    {
      for (var i=0; i<this.__eventHandlers.length; i++) {
        this.__eventHandlers[i].removeAllListenersFromDocument(doc);
      }
    },


    /*
    ---------------------------------------------------------------------------
      HELPER METHODS
    ---------------------------------------------------------------------------
    */


    /**
     * Get data about registered document event handlers for the given type.
     *
     * @param element {Element} an element inside the document to search
     * @param type {String} event type
     * @return {Map} type data
     * @internal
     */
    getTypeData : function(element, type)
    {
      var documentElement = qx.html2.element.Node.getDocument(element).documentElement;
      var documentId = qx.core.Object.toHashCode(documentElement);

      if (!this.__documentRegistry[documentId]) {
        return null;
      }

      var reg = this.__documentRegistry[documentId][type];

      if (reg == undefined) {
        return null;
      }

      return reg;
    },


    /**
     * Get data about registered document event handlers for the given element
     * with the given type.
     *
     * @param element {Element} an element inside the document to search
     * @param type {String} event type
     * @return {Map} element data
     * @internal
     */
    getElementData : function(element, type)
    {
      var typeData = this.getTypeData(element, type);
      if (typeData) {
        return typeData[qx.core.Object.toHashCode(element)]
      } else {
        return null;
      }
    },


    /**
     * Get the internal registry for all event listeners of bubbling events.
     *
     * @return {Map} the registry. Structure: documentId -> eventType -> elementId
     * @internal
     */
    getRegistry : function() {
      return this.__documentRegistry;
    }

  },



  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    for (var i=0, a=this.__eventHandlers, l=a.length-1; i<l; i++) {
      this.__eventHandlers[i].dispose();
    }

    // remove document event listeners
    var documentReg = this.__documentRegistry;
    for (var documentId in documentReg)
    {
      var documentElement = this.__elementRegistry.getByHash(documentId);
      this.removeAllListenersFromDocument(documentElement);
    }

    this._disposeFields("__documentRegistry");
    this._disposeObjects("__elementRegistry");

  }

});