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

/* ************************************************************************

#module(event2)

************************************************************************ */

/**
 * Wrapper for DOM events.
 *
 * Event objects are only valid during the event dispatch. After the dispatch
 * event objects are pooled or disposed. If you want to safe a reference to an
 * event instance use the {@link #clone} method.
 *
 * The interface is modeled after the DOM level 2 event interface:
 * http://www.w3.org/TR/DOM-Level-2-Events/events.html#Events-interface
 */
qx.Class.define("qx.event.type.Event",
{
  extend : qx.core.Object,

  /**
   * @param event {Event|Map} DOM event or an event like JSON map. Valid keys
   *   for the map are:
   *   <ul>
   *     <li>type (required)</li>
   *     <li>target (rewuired)</li>
   *     <li>bubbles</li>
   *     <li>timestamp</li>
   *   <ul>
   */
  construct : function(event)
  {
    this.base(arguments);
    this.init(event);
  },



  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    this._disposeFields(
      "_event",
      "_target",
      "_currentTarget"
    );
  },



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
    BUBBLING_PHASE : 3
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
     * @param event {Event|Map} DOM event or an event like JSON map. Valid keys
     *   for the map are:
     *   <ul>
     *     <li>type (required)</li>
     *     <li>target (rewuired)</li>
     *     <li>bubbles</li>
     *     <li>timestamp</li>
     *   <ul>
     * @return {qx.event.type.Event} The initialized event instance
     */
    init : function(event)
    {
      if (!event) {
        event = {};
      }

      this._event = event;
      this._type = event.type;
      this._target = event.target || event.srcElement;
      this._currentTarget = null;
      this._stopPropagation = false;
      this._bubbles = event.bubbles !== undefined ? event.bubbles : true;
      this._timeStamp = event.timeStamp || (new Date()).getTime();

      return this;
    },


    /**
     * Create a clone of the event object, which is not automatically disposed
     * or pooled after an event dispatch.
     *
     * @return {qx.event.type.Event} a clone of this class.
     */
    clone : function()
    {
      var clone = new this.constructor;
      clone._event = this._event;
      clone._type = this._type;
      clone._target = this._target;
      clone._currentTarget = this._currentTarget;
      clone._stopPropagation = this._stopPropagation;
      clone._bubbles = this._bubbles;
      return clone;
    },


    /**
     * Prevent browser default behaviour, e.g. opening the context menu, ...
     */
    preventDefault : function() {
      if (this._event.preventDefault) {
        this._event.preventDefault();
      }
      this._event.returnValue = false;
    },


    /**
     * This method is used to prevent further propagation of an event during event
     * flow. If this method is called by any event listener the event will cease
     * propagating through the tree. The event will complete dispatch to all listeners
     * on the current event target before event flow stops.
     */
    stopPropagation :  function()
    {
      if (this._event.stopPropagation) {
        this._event.stopPropagation();
      }

      // MSDN doccumantation http://msdn2.microsoft.com/en-us/library/ms533545.aspx
      this._event.cancelBubble = true;

      this._stopPropagation = true;
    },


    /**
     * Get whether further event propagation has been stopped.
     *
     * @type member
     * @return {Boolean} Whether further propagation has been stopped.
     */
    getPropagationStopped : function() {
      return this._stopPropagation;
    },


    /**
     * The name of the event
     *
     * @type member
     * @return {String} name of the event
     */
    getType : function() {
      return this._type;
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
     */
    getTarget : function() {
      return this._target;
    },


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
      return this._currentTarget || this._target;
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
     * @param bubbles {Booblean} Whether the event bubbles
     * @internal
     */
    setBubbles : function(bubbles) {
      this._bubbles = bubbles;
    }
  }
});
