
qx.Class.define("qx.html2.EventRegistration", {

  statics : {

    CAPTURING_PHASE : 1,
    AT_TARGET : 2,
    BUBBLING_PHASE : 3,

    __registry : {},


    _nativeAddEventListener : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(vElement, vType, vFunction, useCapture) {
        vElement.attachEvent("on" + vType, vFunction);
      },

      "default" : function(vElement, vType, vFunction, useCapture) {
        vElement.addEventListener(vType, vFunction, useCapture);
      }
    }),


    addEventListener : function(element, type, listener, self, useCapture)
    {
      var elementId = qx.core.Object.toHashCode(element);

      // create event listener entry for the element if needed.
      var reg = this.__registry;
      if (!reg[elementId]) {
        reg[elementId] = {};
      }

      // create entry for the event type and attach event handler if needed
      var elementEvents = reg[elementId];
      if (!elementEvents[type]) {
        elementEvents[type] = {
          bubbleListeners : [],
          captureListeners : [],
          bubbleHandler : qx.lang.Function.bind(this.__bubbleEventHandler, this, elementId),
          captureHandler : qx.lang.Function.bind(this.__captureEventHandler, this, elementId)
        };
      }

      if (
        useCapture && elementEvents[type].captureListeners.length == 0 ||
        !useCapture && elementEvents[type].bubbleListeners.length == 0
      )
      {
        var handler = useCapture ? elementEvents[type].captureHandler : elementEvents[type].bubbleHandler;
        this._nativeAddEventListener(
          element,
          type,
          handler,
          useCapture
        );
      }

      // bind the listener to the object
      if (self) {
        callback = qx.lang.Function.bind(listener, self);
      }
      callback.$$original = listener;

      // store event listener
      var listenerList = useCapture ? "captureListeners" : "bubbleListeners";
      elementEvents[type][listenerList].push(callback);
    },


    __captureEventHandler : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(elementId) {
        var event = window.event || domEvent;
      },

      "default" : function(elementId, domEvent)
      {
        if (domEvent.eventPhase == qx.html2.EventRegistration.AT_TARGET) {
          return;
        }
        var listeners = qx.lang.Array.copy(this.__registry[elementId][domEvent.type].captureListeners);

        for (var i=0; i<listeners.length; i++) {
          listeners[i](qx.html2.Event.getInstance(elementId, domEvent));
        }
      }
    }),



    __bubbleEventHandler : function(elementId, domEvent)
    {
      var listeners = qx.lang.Array.copy(this.__registry[elementId][domEvent.type].bubbleListeners);

      for (var i=0; i<listeners.length; i++) {
        listeners[i](qx.html2.Event.getInstance(elementId, domEvent));
      }
    },


    /**
     * Unassign a function from an event.
     *
     * @type static
     * @param element {Element} DOM Element
     * @param type {String} Name of the event
     * @param listener {Function} The pointer to the function to assign
     * @signature function(vElement, vType, vFunction)
     */
    removeEventListener : function(element, type, listener, useCapture)
    {
      var elementId = qx.core.Object.toHashCode(element);

      var elementData = this.__registry[elementId];
      if (!elementData || !elementData[type]) {
        return;
      }
      var eventData = elementData[type];

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

      if (removeIndex != -1) {
        qx.lang.Array.removeAt(listeners, removeIndex);
        if (
          eventData.captureListeners.length == 0 &&
          eventData.bubbleListeners.length == 0
        ) {
          qx.html.EventRegistration.removeEventListener(element, type, eventData.handler);
          delete(elementData[type]);
        }
      }

    }

  }

});
