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
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * Wrapper for DOM events.
 *
 * The interface is modeled after the DOM level 2 event interface:
 * http://www.w3.org/TR/DOM-Level-2-Events/events.html#Events-interface
 */
qx.Class.define("qx.event2.type.Event",
{
  extend : qx.core.Object,



  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

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
     * @param domEvent {Event} DOM event
     * @return {qx.event2.type.Event} an initialized Event instance
     */
    getInstance : function(domEvent)
    {
      if (this.__instance == undefined) {
        this.__instance = new qx.event2.type.Event();
      }

      this.__instance.__initEvent(domEvent);
      return this.__instance;
    }
  },



  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * Initialize the fileds of the event.
     *
     * @type member
     * @param domEvent {Event} DOM event
     */
    __initEvent : function(domEvent)
    {
      this._type = null;
      this._target = null;
      this._dom = domEvent;
      this._stopPropagation = false;
      this._timeStamp = domEvent.timeStamp || (new Date()).getTime();
    },


    /**
     * Prevent browser default behaviour, e.g. opening the context menu, ...
     * @signature function()
     */
    preventDefault : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function() {
        this._dom.returnValue = false;
      },

      "default" : function()
      {
        this._dom.preventDefault();
        this._dom.returnValue = false;
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
        this._dom.cancelBubble = true;
        this._stopPropagation = true;
      },

      "default" : function()
      {
        this._dom.stopPropagation();
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
      return this._type || this._dom.type;
    },


    /**
     * Override the event type
     *
     * @param type {String} new event type
     * @internal
     */
    setType : function(type) {
      this._type = type;
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
     * Override the event phase
     *
     * @param eventPhase {Integer} new event phase
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
        return this._target || this._dom.target || this._dom.srcElement;
      },

      "webkit" : function()
      {
        if (this._target) {
          return this._target;
        }

        var node = this._dom.target;

        // Safari takes text nodes as targets for events
        if (node && (node.nodeType == qx.dom.Node.TEXT)) {
          node = node.parentNode;
        }

        return node;
      },

      "default" : function() {
        return this._target || this._dom.target;
      }
    }),


    /**
     * Override event target.
     *
     * @param target {Element} new event target
     * @internal
     */
    setTarget : function(target) {
      this._target = target;
    },


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
     * Override current target.
     *
     * @param currentTarget {Element} new current target
     * @internal
     */
    setCurrentTarget : function(currentTarget) {
      this._currentTarget = currentTarget;
    },


    /**
     * Returns whether the the ctrl key is pressed.
     *
     * @type member
     * @return {Boolean} whether the the ctrl key is pressed.
     */
    isCtrlPressed : function() {
      return this._dom.ctrlKey;
    },


    /**
     * Returns whether the the shift key is pressed.
     *
     * @type member
     * @return {Boolean} whether the the shift key is pressed.
     */
    isShiftPressed : function() {
      return this._dom.shiftKey;
    },


    /**
     * Returns whether the the alt key is pressed.
     *
     * @type member
     * @return {Boolean} whether the the alt key is pressed.
     */
    isAltPressed : function() {
      return this._dom.altKey;
    },


    /**
     * Returns whether the the meta key is pressed.
     *
     * @type member
     * @return {Boolean} whether the the meta key is pressed.
     */
    isMetaPressed : function() {
      return this._dom.metaKey;
    },


    /**
     * Returns whether the ctrl key or (on the Mac) the command key is pressed.
     *
     * @type member
     * @return {Boolean} <code>true</code> if the command key is pressed on the Mac
     *             or the ctrl key is pressed on another system.
     */
    isCtrlOrCommandPressed : function()
    {
      if (qx.core.Client.getInstance().runsOnMacintosh()) {
        return this._dom.metaKey;
      } else {
        return this._dom.ctrlKey;
      }
    }
  }
});
