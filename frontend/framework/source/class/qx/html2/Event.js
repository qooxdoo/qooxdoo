
/**
 * Wrapper for DOM events.
 *
 * The interface is modeled after the DOM level 2 event interface:
 * http://www.w3.org/TR/DOM-Level-2-Events/events.html#Events-interface
 */
qx.Class.define("qx.html2.Event",
{
  extend : qx.core.Object,

  members : {

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
      "mshtml" : function() {
        this._event.cancelBubble = true;
      },

      "default" : function() {
        this._event.stopPropagation();
      }
    }),


    /**
     * The name of the event
     * @return {String} name of the event
     */
    getType : function()
    {
      return this._event.type;
    },


    /**
     * Indicates the DOM event target to which the event was originally
     * dispatched.
     *
     * @return {Element} DOM element to which the event was originally
     *     dispatched.
     * @signature function(vDomEvent)
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
     */
    getCurrentTarget : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function() {
        var node = this.getTarget();

        // Walk up the tree and search for the current target
        while (node != null)
        {
          if (qx.core.Object.toHashCode(node) == this._elementHash) {
            return node
          }
          try {
            node = node.parentNode;
          } catch(vDomEvent) {
            node = null;
          }
        }
        return null;
      },

      "default" : function() {
        return this._event.currentTarget;
      }
    }),


    __initEvent : function(elementHash, DOMEvent)
    {
      this._event = DOMEvent;
      this._elementHash = elementHash;
    }

  },

  statics :
  {
    getInstance : function(elementHash, domEvent) {
      if (this.__instance == undefined) {
        this.__instance = new this();
      }
      this.__instance.__initEvent(elementHash, domEvent);
      return this.__instance;
    }
  }

});