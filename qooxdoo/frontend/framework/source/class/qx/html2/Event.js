
/**
 * Wrapper for DOM events.
 *
 * The interface is modeled after the DOM level 2 event interface:
 * http://www.w3.org/TR/DOM-Level-2-Events/events.html#Events-interface
 */
qx.Class.define("qx.html2.Event",
{
  extend : qx.core.Object,

  statics :
  {

    /** The current event phase is the capturing phase. */
    CAPTURING_PHASE : 1,

    /** The event is currently being evaluated at the target */
    AT_TARGET : 2,

    /** The current event phase is the bubbling phase. */
    BUBBLING_PHASE : 3,


    /**
     * Initialize a singleton instance with the given browser event object.
     *
     * @type static
     * @param elementHash {Integer} The hash value of the DOM element, the
     *       event is currently dispatched on.
     * @param domEvent {Event} DOM event
     * @return {qx.html2.Event} an initialized Event instance
     */
    getInstance : function(elementHash, domEvent)
    {
      if (this.__instance == undefined) {
        this.__instance = new this();
      }

      this.__instance.__initEvent(elementHash, domEvent);
      return this.__instance;
    }
  },

  members :
  {
    /**
     * Prevent browser default behaviour, e.g. opening the context menu, ...
     * @signature function()
     */
    preventDefault : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function() {
        this._event.returnValue = false;
      },

      "default" : function()
      {
        this._event.preventDefault();
        this._event.returnValue = false;
      }
    }),


    /**
     * This method is used to prevent further propagation of an event during event
     * flow. If this method is called by any event listener the event will cease
     * propagating through the tree. The event will complete dispatch to all listeners
     * on the current event target before event flow stops.
     *
     * @signature function()
     */
    stopPropagation : qx.core.Variant.select("qx.client",
    {
      // MSDN doccumantation http://msdn2.microsoft.com/en-us/library/ms533545.aspx
      "mshtml" : function()
      {
        this._event.cancelBubble = true;
        this._stopPropagation = true;
      },

      "default" : function()
      {
        this._event.stopPropagation();
        this._stopPropagation = true;
      }
    }),


    /**
     * Should only be called by the EventHandler.
     *
     * @type member
     * @return {Boolean} Whether further propagation should be stopped.
     */
    getStopPropagation : function() {
      return this._stopPropagation;
    },


    /**
     * The name of the event
     *
     * @type member
     * @return {String} name of the event
     */
    getType : function() {
      return this._event.type;
    },


    /**
     * Used to indicate which phase of event flow is currently being evaluated.
     *
     * @type member
     * @return {Integer} The current event phase. Possible values are
     *       {@link #CAPTURING_PHASE}, {@link #AT_TARGET} and {@link #BUBBLING_PHASE}.
     */
    getEventPhase : function() {
      return this._eventPhase;
    },


    /**
     * @internal
     */
    setEventPhase : function(eventPhase) {
      this._eventPhase = eventPhase;
    },


    /**
     * The time (in milliseconds relative to the epoch) at which the event was created.
     *
     * @type member
     * @return {Integer} the timestamp the event was created.
     */
    getTimeStamp : function() {
      return this._timeStamp;
    },


    /**
     * Indicates the DOM event target to which the event was originally
     * dispatched.
     *
     * @return {Element} DOM element to which the event was originally
     *     dispatched.
     * @signature function()
     */
    getTarget : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function() {
        return this._event.srcElement;
      },

      "webkit" : function()
      {
        var vNode = this._event.target;

        // Safari takes text nodes as targets for events
        if (vNode && (vNode.nodeType == qx.dom.Node.TEXT)) {
          vNode = vNode.parentNode;
        }

        return vNode;
      },

      "default" : function() {
        return this._event.target;
      }
    }),


    /**
     * Get the event target DOM node whose event listeners are currently being
     * processed. This is particularly useful during event capturing and
     * bubbling.
     *
     * @return {Element} The DOM element the event listener is currently
     *     dispatched on.
     *
     * @signature function()
     */
    getCurrentTarget : function() {
      return this._currentTarget;
    },


    /**
     * @internal
     */
    setCurrentTarget : function(currentTarget) {
      this._currentTarget = currentTarget;
    },


    /**
     * Initialize the fileds of the event.
     *
     * @type member
     * @param elementHash {Integer} The hash value of the DOM element, the
     *       event is currently dispatched on.
     * @param domEvent {Event} DOM event
     * @return {void}
     */
    __initEvent : function(elementHash, domEvent)
    {
      this._event = domEvent;
      this._elementHash = elementHash;
      this._stopPropagation = false;
      this._timeStamp = domEvent.timeStamp || (new Date()).getTime();
    }
  }
});
