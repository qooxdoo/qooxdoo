/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * Common base class for all native events (DOM events, IO events, ...).
 */
qx.Class.define("qx.event.type.Native", {
  extend : qx.event.type.Event,

  members :
  {
    /**
     * Initialize the fields of the event. The event must be initialized before
     * it can be dispatched.
     *
     * @param nativeEvent {Event} The DOM event to use
     * @param target {Object?} The event target
     * @param relatedTarget {Object?null} The related event target
     * @param canBubble {Boolean?false} Whether or not the event is a bubbling event.
     *     If the event is bubbling, the bubbling can be stopped using
     *     {@link qx.event.type.Event#stopPropagation}
     * @param cancelable {Boolean?false} Whether or not an event can have its default
     *     action prevented. The default action can either be the browser's
     *     default action of a native event (e.g. open the context menu on a
     *     right click) or the default action of a qooxdoo class (e.g. close
     *     the window widget). The default action can be prevented by calling
     *     {@link #preventDefault}
     * @return {qx.event.type.Event} The initialized event instance
     */
    init : function(nativeEvent, target, relatedTarget, canBubble, cancelable)
    {
      this.base(arguments, canBubble, cancelable);

      this._target = target || qx.bom.Event.getTarget(nativeEvent);
      this._relatedTarget = relatedTarget || qx.bom.Event.getRelatedTarget(nativeEvent);

      if (nativeEvent.timeStamp) {
        this._timeStamp = nativeEvent.timeStamp;
      }

      this._native = nativeEvent;
      this._returnValue = null;

      return this;
    },


    // overridden
    clone : function(embryo)
    {
      var clone = this.base(arguments, embryo);

      var nativeClone = {};
      clone._native = this._cloneNativeEvent(this._native, nativeClone);

      clone._returnValue = this._returnValue;

      return clone;
    },


    /**
     * Clone the native browser event
     *
     * @param nativeEvent {Event} The native browser event
     * @param clone {Object} The initialized clone.
     * @return {Object} The cloned event
     */
    _cloneNativeEvent : function(nativeEvent, clone)
    {
      clone.preventDefault = (function() {});
      return clone;
    },


    /**
     * Prevent browser default behavior, e.g. opening the context menu, ...
     */
    preventDefault : function()
    {
      this.base(arguments);
      qx.bom.Event.preventDefault(this._native);
    },


    /**
     * Get the native browser event object of this event.
     *
     * @return {Event} The native browser event
     */
    getNativeEvent : function() {
      return this._native;
    },


    /**
     * Sets the event's return value. If the return value is set in a
     * beforeunload event, the user will be asked by the browser, whether
     * he really wants to leave the page. The return string will be displayed in
     * the message box.
     *
     * @param returnValue {String?null} Return value
     */
    setReturnValue : function(returnValue) {
      this._returnValue = returnValue;
    },


    /**
     * Retrieves the event's return value.
     *
     * @return {String?null} The return value
     */
    getReturnValue : function() {
      return this._returnValue;
    }
  }
});
