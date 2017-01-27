/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * Basic event object.
 *
 * Please note:
 * Event objects are only valid during the event dispatch. After the dispatch
 * event objects are pooled or disposed. If you want to safe a reference to an
 * event instance use the {@link #clone} method.
 *
 * The interface is modeled after the DOM level 2 event interface:
 * http://www.w3.org/TR/DOM-Level-2-Events/events.html#Events-interface
 *
 * @use(qx.event.Registration)
 */
qx.Class.define("qx.event.type.Event",
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
    AT_TARGET       : 2,

    /** The current event phase is the bubbling phase. */
    BUBBLING_PHASE  : 3
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
  	/** {qx.Promise[]} promises returned by event handlers */
  	_promises: null,
  	
    /**
     * Initialize the fields of the event. The event must be initialized before
     * it can be dispatched.
     *
     * @param canBubble {Boolean?false} Whether or not the event is a bubbling event.
     *     If the event is bubbling, the bubbling can be stopped using
     *     {@link #stopPropagation}
     * @param cancelable {Boolean?false} Whether or not an event can have its default
     *     action prevented. The default action can either be the browser's
     *     default action of a native event (e.g. open the context menu on a
     *     right click) or the default action of a qooxdoo class (e.g. close
     *     the window widget). The default action can be prevented by calling
     *     {@link #preventDefault}
     * @return {qx.event.type.Event} The initialized event instance
     */
    init : function(canBubble, cancelable)
    {
      if (qx.core.Environment.get("qx.debug"))
      {
        if (canBubble !== undefined)
        {
          qx.core.Assert.assertBoolean(canBubble, "Invalid argument value 'canBubble'.");
        }

        if (cancelable !== undefined)
        {
          qx.core.Assert.assertBoolean(cancelable, "Invalid argument value 'cancelable'.");
        }
      }

      this._type = null;
      this._target = null;
      this._currentTarget = null;
      this._relatedTarget = null;
      this._originalTarget = null;
      this._stopPropagation = false;
      this._preventDefault = false;
      this._bubbles = !!canBubble;
      this._cancelable = !!cancelable;
      this._timeStamp = (new Date()).getTime();
      this._eventPhase = null;
      this._promises = null;

      return this;
    },


    /**
     * Create a clone of the event object, which is not automatically disposed
     * or pooled after an event dispatch.
     *
     * @param embryo {qx.event.type.Event?null} Optional event class, which will
     *     be configured using the data of this event instance. The event must be
     *     an instance of this event class. If the value is <code>null</code>,
     *     a new pooled instance is created.
     * @return {qx.event.type.Event} a clone of this class.
     */
    clone : function(embryo)
    {
      if (embryo) {
        var clone = embryo;
      } else {
        var clone = qx.event.Pool.getInstance().getObject(this.constructor);
      }

      clone._type = this._type;
      clone._target = this._target;
      clone._currentTarget = this._currentTarget;
      clone._relatedTarget = this._relatedTarget;
      clone._originalTarget = this._originalTarget;
      clone._stopPropagation = this._stopPropagation;
      clone._bubbles = this._bubbles;
      clone._preventDefault = this._preventDefault;
      clone._cancelable = this._cancelable;
      clone._promises = this._promises;

      return clone;
    },



    /**
     * Stops event from all further processing. Execute this when the
     * current handler should have "exclusive rights" to the event
     * and no further reaction by anyone else should happen.
     */
    stop : function()
    {
      if (this._bubbles) {
        this.stopPropagation();
      }

      if (this._cancelable) {
        this.preventDefault();
      }
    },


    /**
     * This method is used to prevent further propagation of an event during event
     * flow. If this method is called by any event listener the event will cease
     * propagating through the tree. The event will complete dispatch to all listeners
     * on the current event target before event flow stops.
     *
     */
    stopPropagation : function()
    {
      if (qx.core.Environment.get("qx.debug")) {
        this.assertTrue(this._bubbles, "Cannot stop propagation on a non bubbling event: " + this.getType());
      }
      this._stopPropagation = true;
    },


    /**
     * Get whether further event propagation has been stopped.
     *
     * @return {Boolean} Whether further propagation has been stopped.
     */
    getPropagationStopped : function() {
      return !!this._stopPropagation;
    },


    /**
     * Prevent the default action of cancelable events, e.g. opening the context
     * menu, ...
     *
     */
    preventDefault : function()
    {
      if (qx.core.Environment.get("qx.debug")) {
        this.assertTrue(this._cancelable, "Cannot prevent default action on a non cancelable event: " + this.getType());
      }
      this._preventDefault = true;
    },
    
    
    /**
     * Adds a promise to the list of promises returned by event handlers
     * @param promise {qx.Promise} the promise to add
     */
    addPromise: function(promise) {
    	if (this._promises === null) {
    		this._promises = [promise];
    	} else {
    		this._promises.push(promise);
    	}
    },
    
    
    /**
     * Returns the array of promises, or null if there are no promises
     * @return {qx.Promise[]?}
     */
    getPromises: function() {
    	return this._promises;
    },
    
    
    /**
     * Returns a promise for this event; if the event is defaultPrevented, the promise
     * is a rejected promise, otherwise it is fulfilled.  The promise returned will only
     * be fulfilled when the promises added via {@link addPromise} are also fulfilled
     */
    promise: function() {
    	if (this.getDefaultPrevented()) {
    		return qx.Promise.reject();
    	}
    	if (this._promises === null) {
    		return qx.Promise.resolve(true);
    	}
    	return qx.Promise.all(this._promises);
    },


    /**
     * Get whether the default action has been prevented
     *
     * @return {Boolean} Whether the default action has been prevented
     */
    getDefaultPrevented : function() {
      return !!this._preventDefault;
    },


    /**
     * The name of the event
     *
     * @return {String} name of the event
     */
    getType : function() {
      return this._type;
    },


    /**
     * Override the event type
     *
     * @param type {String} new event type
     */
    setType : function(type) {
      this._type = type;
    },


    /**
     * Used to indicate which phase of event flow is currently being evaluated.
     *
     * @return {Integer} The current event phase. Possible values are
     *         {@link #CAPTURING_PHASE}, {@link #AT_TARGET} and {@link #BUBBLING_PHASE}.
     */
    getEventPhase : function() {
      return this._eventPhase;
    },


    /**
     * Override the event phase
     *
     * @param eventPhase {Integer} new event phase
     */
    setEventPhase : function(eventPhase) {
      this._eventPhase = eventPhase;
    },


    /**
     * The time (in milliseconds relative to the epoch) at which the event was created.
     *
     * @return {Integer} the timestamp the event was created.
     */
    getTimeStamp : function() {
      return this._timeStamp;
    },


    /**
     * Returns the event target to which the event was originally
     * dispatched.
     *
     * @return {Element} target to which the event was originally
     *       dispatched.
     */
    getTarget : function() {
      return this._target;
    },


    /**
     * Override event target.
     *
     * @param target {Element} new event target
     */
    setTarget : function(target) {
      this._target = target;
    },


    /**
     * Get the event target node whose event listeners are currently being
     * processed. This is particularly useful during event capturing and
     * bubbling.
     *
     * @return {Element} The target the event listener is currently
     *       dispatched on.
     */
    getCurrentTarget : function() {
      return this._currentTarget || this._target;
    },


    /**
     * Override current target.
     *
     * @param currentTarget {Element} new current target
     */
    setCurrentTarget : function(currentTarget) {
      this._currentTarget = currentTarget;
    },


    /**
     * Get the related event target. This is only configured for
     * events which also had an influences on another element e.g.
     * mouseover/mouseout, focus/blur, ...
     *
     * @return {Element} The related target
     */
    getRelatedTarget : function() {
      return this._relatedTarget;
    },


    /**
     * Override related target.
     *
     * @param relatedTarget {Element} new related target
     */
    setRelatedTarget : function(relatedTarget) {
      this._relatedTarget = relatedTarget;
    },


    /**
     * Get the original event target. This is only configured
     * for events which are fired by another event (often when
     * the target should be reconfigured for another view) e.g.
     * low-level DOM event to widget event.
     *
     * @return {Element} The original target
     */
    getOriginalTarget : function() {
      return this._originalTarget;
    },


    /**
     * Override original target.
     *
     * @param originalTarget {Element} new original target
     */
    setOriginalTarget : function(originalTarget) {
      this._originalTarget = originalTarget;
    },


    /**
     * Check whether or not the event is a bubbling event. If the event can
     * bubble the value is true, else the value is false.
     *
     * @return {Boolean} Whether the event bubbles
     */
    getBubbles : function() {
      return this._bubbles;
    },


    /**
     * Set whether the event bubbles.
     *
     * @param bubbles {Boolean} Whether the event bubbles
     */
    setBubbles : function(bubbles) {
      this._bubbles = bubbles;
    },


    /**
     * Get whether the event is cancelable
     *
     * @return {Boolean} Whether the event is cancelable
     */
    isCancelable : function() {
      return this._cancelable;
    },


    /**
     * Set whether the event is cancelable
     *
     * @param cancelable {Boolean} Whether the event is cancelable
     */
    setCancelable : function(cancelable) {
      this._cancelable = cancelable;
    }
  }
});
